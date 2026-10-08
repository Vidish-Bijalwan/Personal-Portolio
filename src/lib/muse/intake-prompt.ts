/**
 * Madam Muse — intake-side prompt helpers (DOM-free, unit-testable).
 *
 * deriveTaskType: mode is DERIVED from assets + instruction, never a tab the
 * user must pick (CONTRACTS.md §4).
 *
 * compileIntakePrompt: client-side deterministic prompt assembly from a
 * CreativeBrief, shaped exactly like CONTRACTS.md §3 CompiledPrompt.
 *
 * INTEGRATION (etch-madam-muse): the Continue call site in
 * components/muse/unified-intake.tsx now uses the compiler workstream's
 * compilePrompt(brief) from ./prompt-compiler.ts. compileIntakePrompt below
 * is kept as a tested client-side fallback with the same output shape.
 */
import type { AssetMeta, CreativeBrief, TaskType } from './brief';

export function deriveTaskType(primary: AssetMeta | null, instruction: string): TaskType {
  if (primary?.kind === 'video') return 'video-edit';
  if (primary?.kind === 'image') return 'image-edit';
  return /\b(video|clip|reel|footage|motion|animate|animation)\b/i.test(instruction)
    ? 'video-generate'
    : 'image-generate';
}

/** Contract-shaped compiled prompt (CONTRACTS.md §3). */
export interface CompiledPrompt {
  prompt: string;
  referenceDirectives: string[];
}

function formatDims(w: number, h: number): string {
  return w > 0 && h > 0 ? `${w}×${h}` : 'dims unknown';
}

export function compileIntakePrompt(brief: CreativeBrief): CompiledPrompt {
  const lines: string[] = [];
  const referenceDirectives: string[] = [];

  lines.push(brief.instruction.trim());

  if (brief.primary) {
    lines.push(
      `Primary asset: ${brief.primary.name} (${brief.primary.kind}, ${formatDims(brief.primary.width, brief.primary.height)}).`,
    );
  }

  for (const ref of brief.references) {
    const label = ref.name || ref.id;
    const directive = `use ${ref.id} (${label}) for ${ref.role}${ref.roleUserOverride ? ' (chosen by me)' : ''}`;
    referenceDirectives.push(directive);
    const paletteBit =
      ref.role === 'palette' && ref.palette?.length
        ? ` — palette ${ref.palette.join(', ')}`
        : '';
    lines.push(
      `Reference ${ref.id}: ${directive}${paletteBit}; never average references together.`,
    );
  }

  if (brief.preserve.length > 0) {
    lines.push(`Must preserve: ${brief.preserve.join(', ')}.`);
  }
  if (brief.modifiers.length > 0) {
    lines.push(`Apply: ${brief.modifiers.join(', ')}.`);
  }
  if (brief.visualFamily) {
    lines.push(`Visual family: ${brief.visualFamily}.`);
  }
  // Anti-generic exclusions are ALWAYS present (contract §3).
  const exclusions = [
    'no empty glossy backgrounds',
    'no random decorative shapes',
    'no fake premium shine',
    'no stock look',
    'no waxy faces',
    'no garbled text',
    ...brief.exclusions,
  ];
  lines.push(`Avoid: ${[...new Set(exclusions)].join('; ')}.`);

  return { prompt: lines.join('\n'), referenceDirectives };
}
