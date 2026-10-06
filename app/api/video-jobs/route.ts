export const dynamic = 'force-dynamic';

import { NextResponse, type NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { generations, videoJobs } from '@/lib/db/schema';
import { requireSession } from '@/lib/auth';
import { mimeForMagic } from '@/lib/free/policy';
import { toBuffer } from '@/lib/free/access';
import {
  audioMimeForMagic,
  isValidTool,
  validateAudioFile,
  validateInputFile,
  validateToolParams,
  type TtsParams,
} from '@/lib/video/validate';
import { createVideoJobOrder } from '@/lib/video/orders';
import {
  TOOL_OUTPUT_MIME,
  VIDEO_JOB_PRICE_PAISE,
  type VideoTool,
} from '@/lib/video/constants';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/video-jobs
 * Multipart form: tool ('tts' | 'caption' | 'trim' | 'compress' |
 * 'convert' | 'gif' | 'add-audio' | 'denoise'), params (JSON string),
 * video (File, video/mp4 ≤50MB, required unless tts uses a generated
 * clip), audio (File, .mp3/.wav/.m4a ≤20MB, required for add-audio),
 * generationId (optional — tts clip source).
 * Auth required. Creates a queued video_jobs row + a ₹49 (4900 paise)
 * manual-UPI order via the existing order flow (pay-ping: "I've paid" →
 * owner ping → verify → clean unlock). The watcher processes the job
 * immediately (watermarked preview while payment pends); the verify hook
 * flips video_jobs.unlocked so the clean file opens.
 * Returns 201 { id, tool, status, pricePaise, watchUrl, payment }.
 */
export async function POST(req: NextRequest) {
  const { user, response: authResponse } = await requireSession();
  if (!user) return authResponse;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { code: 'INVALID_REQUEST', error: 'Expected multipart form data' },
      { status: 400 }
    );
  }

  const toolRaw = form.get('tool');
  if (!isValidTool(toolRaw)) {
    return NextResponse.json(
      {
        code: 'INVALID_TOOL',
        error:
          'tool must be tts, caption, trim, compress, convert, gif, add-audio or denoise',
      },
      { status: 400 }
    );
  }
  const tool: VideoTool = toolRaw;

  let paramsRaw: unknown;
  try {
    const raw = form.get('params');
    paramsRaw = typeof raw === 'string' ? JSON.parse(raw) : null;
  } catch {
    return NextResponse.json(
      { code: 'INVALID_PARAMS', error: 'params must be valid JSON' },
      { status: 400 }
    );
  }

  const validated = validateToolParams(tool, paramsRaw);
  if (!validated.ok) {
    return NextResponse.json(
      { code: validated.code, error: validated.error },
      { status: 400 }
    );
  }
  const params = validated.value;

  // ---- acquire the input video ----
  let inputBytes: Buffer | null = null;
  let inputMime: string | null = null;
  let input2Bytes: Buffer | null = null;
  let input2Mime: string | null = null;

  const ttsParams = tool === 'tts' ? (params as TtsParams) : null;

  if (ttsParams && ttsParams.sourceKind === 'clip') {
    const generationId = ttsParams.generationId!;
    const rows = await db
      .select()
      .from(generations)
      .where(eq(generations.id, generationId))
      .limit(1);
    const gen = rows[0];
    if (!gen) {
      return NextResponse.json(
        { code: 'CLIP_NOT_FOUND', error: 'That clip does not exist' },
        { status: 404 }
      );
    }
    if (gen.userId !== user.id) {
      return NextResponse.json(
        { code: 'FORBIDDEN', error: 'Not your clip' },
        { status: 403 }
      );
    }
    if (gen.mediaType !== 'video' || gen.status !== 'done') {
      return NextResponse.json(
        { code: 'CLIP_NOT_READY', error: 'That clip is not ready to use yet' },
        { status: 409 }
      );
    }
    inputBytes =
      toBuffer(gen.clean) ?? toBuffer(gen.watermarked) ?? null;
    if (!inputBytes) {
      return NextResponse.json(
        { code: 'CLIP_NOT_READY', error: 'That clip has no video file yet' },
        { status: 409 }
      );
    }
    inputMime = gen.mime;
  } else {
    const file = form.get('video');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { code: 'MISSING_VIDEO', error: 'Attach a video file (mp4, up to 50MB)' },
        { status: 400 }
      );
    }
    const fileErr = validateInputFile({
      mime: file.type || null,
      bytes: file.size,
    });
    if (fileErr) {
      return NextResponse.json(
        { code: fileErr.code, error: fileErr.error },
        { status: 400 }
      );
    }
    const bytes = Buffer.from(await file.arrayBuffer());
    if (mimeForMagic(bytes) !== 'video/mp4') {
      return NextResponse.json(
        { code: 'INVALID_FILE_TYPE', error: 'Video must be an .mp4 file' },
        { status: 400 }
      );
    }
    inputBytes = bytes;
    inputMime = 'video/mp4';
  }

  // ---- acquire the audio track (add-audio second upload) ----
  if (tool === 'add-audio') {
    const audioFile = form.get('audio');
    if (!(audioFile instanceof File)) {
      return NextResponse.json(
        { code: 'MISSING_AUDIO', error: 'Attach an audio file (.mp3, .wav or .m4a, up to 20MB)' },
        { status: 400 }
      );
    }
    const audioErr = validateAudioFile({
      mime: audioFile.type || null,
      bytes: audioFile.size,
    });
    if (audioErr) {
      return NextResponse.json(
        { code: audioErr.code, error: audioErr.error },
        { status: 400 }
      );
    }
    const audioBytes = Buffer.from(await audioFile.arrayBuffer());
    const audioMagic = audioMimeForMagic(audioBytes);
    if (!audioMagic) {
      return NextResponse.json(
        { code: 'INVALID_FILE_TYPE', error: 'Audio must be .mp3, .wav or .m4a' },
        { status: 400 }
      );
    }
    input2Bytes = audioBytes;
    input2Mime = audioMagic;
  }

  const [job] = await db
    .insert(videoJobs)
    .values({
      userId: user.id,
      tool,
      params,
      input: inputBytes,
      inputMime,
      input2: input2Bytes,
      input2Mime,
      mime: TOOL_OUTPUT_MIME[tool],
      priceCents: VIDEO_JOB_PRICE_PAISE,
      status: 'queued',
      unlocked: false,
    })
    .returning({ id: videoJobs.id });

  let order;
  try {
    order = await createVideoJobOrder({
      videoJobId: job.id,
      userId: user.id,
      tool,
    });
  } catch {
    return NextResponse.json(
      { code: 'PAYMENT_ORDER_FAILED', error: 'Failed to create payment order' },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      id: job.id,
      tool,
      status: 'queued',
      pricePaise: VIDEO_JOB_PRICE_PAISE,
      watchUrl: `/video-studio/watch/${job.id}`,
      payment: order.payment,
    },
    { status: 201 }
  );
}
