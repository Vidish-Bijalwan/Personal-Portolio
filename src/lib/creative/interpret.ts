/**
 * Vidish Studio — deterministic rule-based creative interpretation.
 * Pure function: prompt text -> CreativeSpec. No network, no LLM.
 * Throws ModerationBlockedError (status 400, code MODERATION_BLOCKED)
 * when the prompt matches the blocklist categories.
 */
import type {
  AspectRatio,
  CreativeSpec,
  QualityTier,
} from '../vilish/types';

export interface InterpretInput {
  prompt: string;
  aspectRatio?: string;
  quality?: string;
}

export class ModerationBlockedError extends Error {
  readonly status = 400;
  readonly code = 'MODERATION_BLOCKED';
  readonly matched: string[];
  constructor(matched: string[]) {
    super(`Prompt blocked by moderation: ${matched.join(', ')}`);
    this.name = 'ModerationBlockedError';
    this.matched = matched;
  }
}

function invalidPrompt(message: string): never {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = 400;
  err.code = 'INVALID_PROMPT';
  throw err;
}

/* ---------------- moderation blocklist (deterministic) ---------------- */

const SEXUAL =
  /\b(sex|sexual|nude|naked|porn|pornographic|erotic|explicit|intimate|undress|undressing|lingerie|orgasm|fetish|intercourse|blowjob|masturbat)\w*\b/;
const MINOR =
  /\b(child|children|kid|kids|minor|minors|teen|teens|teenager|teenagers|preteen|pre-teens?|loli|shota|underage|under-age|schoolgirl|schoolboy|boy|girl)\b/;

interface ModRule {
  category: string;
  test: (p: string) => boolean;
}

const MOD_RULES: ModRule[] = [
  {
    category: 'sexual_content_minors',
    test: (p) => SEXUAL.test(p) && MINOR.test(p),
  },
  {
    category: 'bestiality',
    test: (p) =>
      /\b(bestiality|zoophilia)\b/.test(p) ||
      (/\b(animal|animals|dog|dogs|horse|horses|beast)\b/.test(p) &&
        /\b(sex|sexual|mating|erotic|nude|naked)\b/.test(p)),
  },
  {
    category: 'non_consensual',
    test: (p) =>
      /\b(non[\s-]?consensual|nonconsent|rape|raping|raped|forced sex|forced sexual|molest|molesting|sexual assault|groping|groped)\b/.test(
        p
      ),
  },
  {
    category: 'graphic_gore',
    test: (p) =>
      /\b(gore|gory|dismember|dismembered|decapitat|behead|mutilat|torture|tortured|disembowel|bloodbath)\w*\b/.test(
        p
      ),
  },
  {
    category: 'weapons_making',
    test: (p) =>
      /\bpipe bomb\b/.test(p) ||
      /\bhow to (make|build|construct|manufacture)\b.{0,80}\b(bomb|gun|firearm|explosive|missile|grenade|weapon|ied)\b/.test(
        p
      ) ||
      /\binstructions? (for|to make|to build)\b.{0,80}\b(bomb|gun|firearm|explosive)\b/.test(
        p
      ) ||
      /\bmake\b.{0,24}\b(a )?(bomb|explosive|pipe bomb)\b/.test(p),
  },
  {
    category: 'self_harm_instructions',
    test: (p) =>
      /\bhow to (commit suicide|kill myself|kill yourself|self[\s-]?harm|cut myself|cut yourself|end my life|hang myself|overdose)\b/.test(
        p
      ) ||
      /\b(suicide|self[\s-]?harm) (methods?|guide|instructions?|tips|tutorial)\b/.test(
        p
      ),
  },
];

function checkModeration(prompt: string): void {
  const lowered = prompt.toLowerCase();
  const matched = MOD_RULES.filter((r) => r.test(lowered)).map(
    (r) => r.category
  );
  if (matched.length > 0) throw new ModerationBlockedError(matched);
}

/* ---------------- deterministic detectors ---------------- */

const ASPECTS: AspectRatio[] = ['1:1', '4:5', '9:16', '16:9'];
const QUALITIES: QualityTier[] = ['quick', 'studio', 'cinema'];

function detectAspectRatio(prompt: string, provided?: string): AspectRatio {
  if (provided && (ASPECTS as string[]).includes(provided))
    return provided as AspectRatio;
  if (/\b(9:16|reel|reels|shorts|tiktok|vertical|story|stories)\b/i.test(prompt))
    return '9:16';
  if (/\b(16:9|youtube|widescreen|banner|cover)\b/i.test(prompt)) return '16:9';
  if (/\b(square|1:1|post|posts|pfp|avatar|profile)\b/i.test(prompt)) return '1:1';
  if (/\b(4:5|portrait)\b/i.test(prompt)) return '4:5';
  return '1:1';
}

function detectQuality(prompt: string, provided?: string): QualityTier {
  if (provided && (QUALITIES as string[]).includes(provided))
    return provided as QualityTier;
  if (/\b(quick|fast|cheap|draft|sketch)\b/i.test(prompt)) return 'quick';
  if (/\b(cinema|premium|best|ultra|photoreal)\b/i.test(prompt)) return 'cinema';
  return 'studio';
}

function detectStyle(prompt: string): string | undefined {
  if (/\banime\b/i.test(prompt)) return 'anime';
  if (/\bcyberpunk\b/i.test(prompt)) return 'cyberpunk';
  if (/\bcinematic\b/i.test(prompt)) return 'cinematic';
  if (/\bminimal(ist)?\b/i.test(prompt)) return 'minimal';
  return undefined;
}

function detectGenre(prompt: string): string | undefined {
  if (/\bproduct\b/i.test(prompt)) return 'product';
  if (/\bads?\b/i.test(prompt) || /\badvertisement\b/i.test(prompt))
    return 'ad';
  if (/\bposter\b/i.test(prompt)) return 'poster';
  if (/\bportrait\b/i.test(prompt)) return 'portrait';
  if (/\blogo\b/i.test(prompt)) return 'logo';
  return undefined;
}

function detectPlatform(prompt: string): string | undefined {
  if (/\binstagram\b/i.test(prompt)) return 'instagram';
  if (/\byoutube\b/i.test(prompt)) return 'youtube';
  if (/\blinkedin\b/i.test(prompt)) return 'linkedin';
  if (/\b(x|twitter)\b/i.test(prompt)) return 'x';
  return undefined;
}

/* ---------------- main entry ---------------- */

/**
 * Deterministically parse a free-text prompt into a CreativeSpec.
 * Vertical slice: task is always 'text_to_image'.
 */
export function interpretCreative(input: InterpretInput): CreativeSpec {
  const raw = typeof input.prompt === 'string' ? input.prompt.trim() : '';
  if (!raw) invalidPrompt('prompt must be a non-empty string');
  if (raw.length > 4000)
    invalidPrompt('prompt must be at most 4000 characters');

  checkModeration(raw);

  const aspectRatio = detectAspectRatio(raw, input.aspectRatio);
  const quality = detectQuality(raw, input.quality);
  const style = detectStyle(raw);
  const genre = detectGenre(raw);
  const platform = detectPlatform(raw);

  const enhancedPrompt = (
    `${style ? style + ', ' : ''}${genre ? genre + ' ' : ''}${raw}` +
    ', high detail, professional composition, balanced lighting'
  )
    .trim()
    .slice(0, 1000);

  const spec: CreativeSpec = {
    task: 'text_to_image',
    prompt: raw,
    aspectRatio,
    quality,
    enhancedPrompt,
  };
  if (genre) spec.genre = genre;
  if (style) spec.style = style;
  if (platform) spec.platform = platform;
  return spec;
}
