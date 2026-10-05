/**
 * VILISH Studio — AI PACKAGE builder (Phase 2 contract §7).
 *
 * Renders the exact operator handoff template. No internal mechanics are
 * mentioned in the output (per §6 copy rules); it is the literal text an
 * operator pastes into the generation tool.
 */

export interface PackageJobInput {
  task: string;
  jobKind?: string | null;
  prompt: string;
  aspectRatio?: string | null;
  quality?: string | null;
  style?: string | null;
  genre?: string | null;
  constraints?: string | null;
  durationSeconds?: number | null;
  /** 'video' | 'image'; derived from task when omitted */
  outputType?: 'video' | 'image' | null;
}

export interface PackageOrderInput {
  code: string;
}

export interface PackageReferenceInput {
  filename: string;
}

export interface PackageParentInput {
  prompt: string;
  revision?: string | null;
  previousResultLabel?: string | null;
  previousResultUrl?: string | null;
}

function humanizeTask(task: string): string {
  const map: Record<string, string> = {
    text_to_image: 'Text to image',
    image_to_image: 'Image to image',
    text_to_video: 'Text to video',
    image_to_video: 'Image to video',
  };
  if (map[task]) return map[task];
  return task
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function outputOf(job: PackageJobInput): 'video' | 'image' {
  if (job.outputType) return job.outputType;
  return /video/.test(job.task) ? 'video' : 'image';
}

function deliverableFor(output: 'video' | 'image'): string {
  return output === 'video' ? 'MP4' : 'PNG';
}

function resolutionHint(output: 'video' | 'image', aspect: string): string {
  if (output === 'video' && aspect === '9:16') return '1080x1920 where supported';
  if (output === 'video' && aspect === '16:9') return '1920x1080 where supported';
  if (aspect === '9:16') return '1080x1920';
  if (aspect === '16:9') return '1920x1080';
  if (aspect === '1:1') return '1024x1024';
  if (aspect === '4:5') return '1080x1350';
  return `match ${aspect} composition`;
}

/**
 * Machine-readable revision marker the edit route appends to operatorNotes.
 * Extracted here so the package template can render CUSTOMER REVISION.
 */
export const REVISION_MARKER = '[REVISION]';

export function extractRevision(
  operatorNotes: string | null | undefined
): string | null {
  const escaped = REVISION_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = new RegExp(`^${escaped}\\s*(.+)$`, 'm').exec(operatorNotes ?? '');
  return m ? m[1].trim() : null;
}

/**
 * Build the exact §7 AI PACKAGE text.
 * `parent` is present for remake/edit jobs only (renders the bracket block).
 */
export function buildAiPackage(
  job: PackageJobInput,
  order: PackageOrderInput,
  references: PackageReferenceInput[],
  parent?: PackageParentInput | null
): string {
  const output = outputOf(job);
  const outputWord = output === 'video' ? 'Video' : 'Image';
  const aspect = job.aspectRatio ?? '—';
  const typeLine =
    (job.jobKind === 'edit' ? 'EDIT — ' : '') + humanizeTask(job.task);
  const style = job.style?.trim() || job.genre?.trim() || '—';

  const lines: string[] = [
    'VILISH FULFILLMENT JOB',
    '',
    'ORDER:',
    order.code,
    '',
    'TYPE:',
    typeLine,
    '',
    'CUSTOMER REQUEST:',
    `"${job.prompt}"`,
    '',
    'OUTPUT:',
    outputWord,
    '',
    'DURATION:',
    job.durationSeconds != null ? String(job.durationSeconds) : 'n/a',
    '',
    'ASPECT:',
    aspect,
    '',
    'QUALITY:',
    job.quality ?? '—',
    '',
    'STYLE:',
    style,
    '',
    'REFERENCE ASSETS:',
  ];

  if (references.length === 0) {
    lines.push('none');
  } else {
    references.forEach((r, i) => lines.push(`${i + 1}. ${r.filename}`));
  }

  lines.push(
    '',
    'IMPORTANT CUSTOMER CONSTRAINTS:',
    job.constraints?.trim() ? job.constraints.trim() : '—'
  );

  if (parent) {
    const prev =
      parent.previousResultLabel && parent.previousResultUrl
        ? `${parent.previousResultLabel} — ${parent.previousResultUrl}`
        : 'see job detail';
    lines.push(
      '',
      '[remake/edit only]',
      'PREVIOUS RESULT:',
      prev,
      '',
      'ORIGINAL PROMPT:',
      `"${parent.prompt}"`,
      '',
      'CUSTOMER REVISION:',
      `"${parent.revision?.trim() ? parent.revision.trim() : '—'}"`
    );
  }

  lines.push(
    '',
    'DELIVERABLE:',
    deliverableFor(output),
    resolutionHint(output, aspect),
    '',
    'CREATE THE FINAL RESULT ONLY AFTER FOLLOWING THESE CONSTRAINTS.'
  );

  return lines.join('\n');
}
