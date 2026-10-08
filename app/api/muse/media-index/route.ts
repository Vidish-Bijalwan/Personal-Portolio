import { NextResponse } from "next/server";
import { getMediaIndex } from "@/lib/muse/media-index";

export const dynamic = "force-dynamic";

/**
 * GET /api/muse/media-index
 * Public status probe for the semantic media index (transcription + shot
 * detection). Honest: today it reports "unavailable" with the reason —
 * no fabricated transcript or shots, ever.
 */
export async function GET() {
  const index = getMediaIndex();
  return NextResponse.json({ status: index.status, reason: index.reason });
}
