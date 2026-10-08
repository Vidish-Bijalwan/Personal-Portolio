/**
 * Madam Muse — intent compiler.
 *
 * Deterministic, rule-based translation of a user's instruction (+ primary
 * asset + reference metadata) into a CreativeBrief. No LLM, no network.
 *
 * Playbook sources: many_images.md (15 visual families, anti-generic rules,
 * reference roles) and many.md (story structures, pacing/music rules) live
 * as heuristics below — keep these in sync if the playbooks change.
 */

import type {
  AssetMeta,
  CreativeBrief,
  RefMeta,
  RefRole,
  TaskType,
} from './brief';

export interface CompileBriefInput {
  instruction: string;
  primary: AssetMeta | null;
  references: RefMeta[];
}

// ---------------------------------------------------------------------------
// 1. Task-type derivation
// ---------------------------------------------------------------------------

const EDIT_VERBS =
  /\b(keep|change|changes|changed|replace|replaces|remove|removes|restyle|restyles|retouch|edit|edits|adjust|swap|swaps|fix|fixes|enhance|modif(?:y|ies)|transform|alter|recolor|redraw|stylize|blur|sharpen|crop|crop out)\b/i;

const PHOTO_REF =
  /\b(my|this|the|that|these|those)\s+(photo|image|picture|pic|photos|images|shot|frame)\b/i;

export function deriveTaskType(
  instruction: string,
  primary: AssetMeta | null
): TaskType {
  if (primary === null) return 'image-generate';
  if (primary.kind === 'video') return 'video-edit';
  // primary.kind === 'image'
  if (EDIT_VERBS.test(instruction) && PHOTO_REF.test(instruction)) {
    return 'image-edit';
  }
  return 'image-generate';
}

// ---------------------------------------------------------------------------
// 2. Preserve-list extraction
// ---------------------------------------------------------------------------

const KEEP_CUE =
  /\b(keep|keeping|preserve|preserving|retain|retaining|don'?t change|do not change|don'?t touch|do not touch|leave|leaving|same|unchanged|as-?is|exactly)\b/i;

const PRESERVE_PATTERNS: Array<{ category: string; re: RegExp }> = [
  { category: 'face', re: /\b(face|faces|expression|me\b|myself|selfie|person|people|portrait|man|woman|girl|boy|model)\b/i },
  { category: 'product', re: /\b(watch|product|products|shoe|sneakers?|bottle|phone|laptop|bag|perfume|car|item|gadget|package|packaging)\b/i },
  { category: 'logo', re: /\b(logo|logos|brand|branding|emblem|watermark)\b/i },
  { category: 'text', re: /\b(text|texts|wording|words|caption|title|lettering|typography|font|slogan|quote|headline)\b/i },
  { category: 'background', re: /\b(background|scene|backdrop|scenery|surroundings|setting|environment|bg)\b/i },
  { category: 'geometry', re: /\b(pose|composition|crop|framing|angle|layout|proportions|perspective|structure)\b/i },
];

/** Extract what the user wants preserved. Deterministic keyword extraction. */
export function extractPreserve(instruction: string): string[] {
  const out: string[] = [];
  // Only scan when the user signals preservation; otherwise a bare mention
  // (e.g. "a car poster") must not end up on the preserve list.
  if (!KEEP_CUE.test(instruction)) return out;
  for (const { category, re } of PRESERVE_PATTERNS) {
    if (re.test(instruction) && !out.includes(category)) out.push(category);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Modifier parsing
// ---------------------------------------------------------------------------

const MODIFIER_DICTIONARY: Array<{ canonical: string; re: RegExp }> = [
  { canonical: 'darker', re: /\b(darker|darken(?:ed|ing)?|more shadow|deeper shadows)\b/i },
  { canonical: 'brighter', re: /\b(brighter|brighten(?:ed|ing)?|more light|airy)\b/i },
  { canonical: 'more grain', re: /\b(more grain|grainy|grainier|film grain|noisy)\b/i },
  { canonical: 'warmer', re: /\b(warmer|warm it up|warm tones?)\b/i },
  { canonical: 'cooler', re: /\b(cooler|cool it down|cool tones?)\b/i },
  { canonical: 'minimal', re: /\b(minimal|minimalist|minimalistic|less clutter|declutter|simpler|cleaner)\b/i },
  { canonical: 'more contrast', re: /\b(more contrast|high-?contrast|contrastier|punchier)\b/i },
  { canonical: 'less contrast', re: /\b(less contrast|low-?contrast|softer contrast|flat lighting)\b/i },
  { canonical: 'softer', re: /\b(softer|soften(?:ed|ing)?|dreamy|soft focus)\b/i },
  { canonical: 'sharper', re: /\b(sharper|sharpen(?:ed|ing)?|crisper|more detail|detailed)\b/i },
  { canonical: 'vibrant', re: /\b(vibrant|more color|colorful|saturated|vivid|bold colors?)\b/i },
  { canonical: 'muted', re: /\b(muted|desaturat(?:ed|ion)|faded|washed out|subdued|pastel tones?)\b/i },
  { canonical: 'retro', re: /\b(retro|vintage|nostalgic|old-?school|y2k|analog)\b/i },
  { canonical: 'cinematic', re: /\b(cinematic|filmic|movie-?like|dramatic lighting)\b/i },
  { canonical: 'matte', re: /\b(matte|flat finish|no gloss)\b/i },
  { canonical: 'grungy', re: /\b(grungy|grunge|distressed|rough|raw)\b/i },
  { canonical: 'elegant', re: /\b(elegant|luxur(?:y|ious)|premium|refined|classy|sophisticated)\b/i },
  { canonical: 'bold', re: /\b(bold|stronger|heavier|striking|impactful)\b/i },
  { canonical: 'subtle', re: /\b(subtle|understated|quiet|gentle|delicate)\b/i },
  { canonical: 'textured', re: /\b(textured|more texture|tactile|rough surface)\b/i },
  { canonical: 'playful', re: /\b(playful|fun|quirky|cheerful|whimsical)\b/i },
  { canonical: 'serious', re: /\b(serious|formal|corporate|professional)\b/i },
  { canonical: 'dark', re: /\b(dark mood|dark theme|night-?time|shadowy)\b/i },
];

/** Parse comma/and-separated descriptors into canonical modifiers. */
export function extractModifiers(instruction: string): string[] {
  const out: string[] = [];
  for (const { canonical, re } of MODIFIER_DICTIONARY) {
    if (re.test(instruction) && !out.includes(canonical)) out.push(canonical);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 4. Exclusions (anti-generic set is ALWAYS included)
// ---------------------------------------------------------------------------

export const ANTI_GENERIC_EXCLUSIONS: string[] = [
  'empty glossy backgrounds',
  'random decorative shapes',
  'fake premium shine',
  'stock look',
  'waxy faces',
  'garbled text',
  '"8k masterpiece" filler language',
];

const USER_EXCLUSION_RE =
  /\b(?:no|without|avoid|excluding|exclude|leave out|skip|minus)\s+([a-z0-9][a-z0-9'’\- ]{1,50}?)(?=\s*(?:,|;|\.|!|\?|$|\band\b|\bbut\b))/gi;

/** Parse "no X / without X / avoid X" clauses into user exclusions. */
export function extractUserExclusions(instruction: string): string[] {
  const out: string[] = [];
  USER_EXCLUSION_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = USER_EXCLUSION_RE.exec(instruction)) !== null) {
    const phrase = m[1].trim().toLowerCase();
    if (phrase.length < 2 || phrase.length > 55) continue;
    if (out.includes(phrase)) continue;
    // Don't re-add something already covered by the anti-generic set
    // (exact match only — "no text" is stricter than "garbled text").
    if (ANTI_GENERIC_EXCLUSIONS.some((a) => a.toLowerCase() === phrase)) continue;
    out.push(phrase);
  }
  return out;
}

export function buildExclusions(instruction: string): string[] {
  return [...ANTI_GENERIC_EXCLUSIONS, ...extractUserExclusions(instruction)];
}

// ---------------------------------------------------------------------------
// 5. Reference-role resolution
// ---------------------------------------------------------------------------

export interface ResolvedRef {
  ref: RefMeta;
  /** true only for the FIRST ref carrying role 'style' (the lead family anchor) */
  isLeadStyle: boolean;
  /** true for style refs after the first (supporting cues, never averaged) */
  isSupportingStyle: boolean;
}

/**
 * Trust the `role` on each RefMeta (auto-detected or user-overridden).
 * Conflicting style roles resolve to: first style ref = lead, the rest are
 * supporting cues — never a 50/50 mashup.
 */
export function resolveReferenceRoles(references: RefMeta[]): ResolvedRef[] {
  let seenStyle = false;
  return references.map((ref) => {
    const isStyle = ref.role === 'style';
    const isLeadStyle = isStyle && !seenStyle;
    const isSupportingStyle = isStyle && seenStyle;
    if (isStyle) seenStyle = true;
    return { ref, isLeadStyle, isSupportingStyle };
  });
}

// ---------------------------------------------------------------------------
// 6. Visual-family classification (image only)
// ---------------------------------------------------------------------------

export const VISUAL_FAMILIES = [
  'editorial poster',
  'typographic manifesto',
  'retro collage',
  'anime/manga',
  'surreal symbolic',
  'cinematic moody',
  'infographic/study-sheet',
  'creator cover',
  'automotive/blueprint',
  'hindi/vernacular',
  'dark monochrome+accent',
  'personal brand',
  'minimal soft',
  'grunge/halftone',
  'workstation/neon',
] as const;

export type VisualFamily = (typeof VISUAL_FAMILIES)[number];

const FAMILY_KEYWORDS: Array<{ family: VisualFamily; re: RegExp; weight: number }> = [
  { family: 'infographic/study-sheet', re: /\b(infographic|study[- ]sheet|cheat[- ]?sheet|revision|exam|notes?|educational|diagram|explainer|tutorial|data-?viz)\b/i, weight: 4 },
  { family: 'typographic manifesto', re: /\b(quote|manifesto|slogan|typograph(y|ic)|big text|type-?driven|words only|text-?only|lettering)\b/i, weight: 4 },
  { family: 'retro collage', re: /\b(collage|retro|vintage|photocopy|xerox|zine|cut-?out|y2k|analog print|pasted)\b/i, weight: 3 },
  { family: 'anime/manga', re: /\b(anime|manga|cel-?shaded|ghibli|character illustration|illustrated character)\b/i, weight: 4 },
  { family: 'automotive/blueprint', re: /\b(car|automotive|blueprint|vehicle|motorcycle|bike|automobile|technical drawing)\b/i, weight: 3 },
  { family: 'hindi/vernacular', re: /\b(hindi|devanagari|vernacular|desi|devotional|folk|indian (cultural|festive))\b/i, weight: 4 },
  { family: 'dark monochrome+accent', re: /\b(monochrome|black[- ]and[- ]white|b&w|grayscale|duotone)\b/i, weight: 3 },
  { family: 'grunge/halftone', re: /\b(grunge|halftone|punk|distressed|edgy|streetwear|hardcore)\b/i, weight: 3 },
  { family: 'workstation/neon', re: /\b(neon|workstation|editing setup|video editing|creator setup|laptop setup|desk setup|glow)\b/i, weight: 3 },
  { family: 'surreal symbolic', re: /\b(surreal|symbolic|dreamlike|metaphor|conceptual|abstract concept)\b/i, weight: 3 },
  { family: 'editorial poster', re: /\b(editorial|poster|magazine|headline|print design|cover design|art-?directed)\b/i, weight: 2 },
  { family: 'creator cover', re: /\b(thumbnail|youtube|cover|prompt pack|creator|social cover|clickable|instagram cover)\b/i, weight: 2 },
  { family: 'personal brand', re: /\b(personal brand|portfolio|about me|headshot|profile graphic|brand identity)\b/i, weight: 3 },
  { family: 'minimal soft', re: /\b(minimal|minimalist|soft aesthetic|clean aesthetic|pastel|airy|simple design)\b/i, weight: 2 },
  { family: 'cinematic moody', re: /\b(cinematic|moody|film still|dramatic|atmospheric|night scene|dim light)\b/i, weight: 1 },
];

/**
 * Classify the instruction (+ lead style ref mood) into one of the 15
 * playbook families. Deterministic: highest weighted keyword score wins;
 * ties resolve to the earlier family in the taxonomy; zero hits default to
 * 'cinematic moody' per the brief.
 */
export function classifyVisualFamily(
  instruction: string,
  references: RefMeta[] = []
): VisualFamily {
  const scores = new Map<VisualFamily, number>();
  for (const { family, re, weight } of FAMILY_KEYWORDS) {
    if (re.test(instruction)) {
      scores.set(family, (scores.get(family) ?? 0) + weight);
    }
  }
  // Style refs can nudge the family (mood role ref with palette text).
  for (const ref of references) {
    if (ref.role === 'style' || ref.role === 'mood') {
      const hint = `${ref.name} ${ref.role}`;
      for (const { family, re, weight } of FAMILY_KEYWORDS) {
        if (re.test(hint)) scores.set(family, (scores.get(family) ?? 0) + 1);
      }
    }
  }
  if (scores.size === 0) return 'cinematic moody';
  let best: VisualFamily = 'cinematic moody';
  let bestScore = -1;
  // VISUAL_FAMILIES order is the tie-break priority.
  for (const family of VISUAL_FAMILIES) {
    const s = scores.get(family) ?? 0;
    if (s > bestScore) {
      bestScore = s;
      best = family;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// 7. outputSpec derivation
// ---------------------------------------------------------------------------

const ASPECT_KEYWORDS: Array<{ ratio: '1:1' | '4:5' | '9:16' | '16:9'; re: RegExp }> = [
  { ratio: '9:16', re: /\b(9:?\s*:\s*16|vertical|portrait|reel|shorts|tiktok|story)\b/i },
  { ratio: '16:9', re: /\b(16:?\s*:\s*9|landscape|widescreen|wide|youtube banner|cinematic frame)\b/i },
  { ratio: '1:1', re: /\b(1:?\s*:\s*1|square|pfp|avatar|profile pic)\b/i },
  { ratio: '4:5', re: /\b(4:?\s*:\s*5|poster format|instagram post)\b/i },
];

function aspectFromPrimary(primary: AssetMeta | null): '1:1' | '4:5' | '9:16' | '16:9' | null {
  if (!primary || !primary.width || !primary.height) return null;
  const r = primary.width / primary.height;
  if (r >= 1.4) return '16:9';
  if (r <= 0.72) return '9:16';
  if (r >= 0.92 && r <= 1.08) return '1:1';
  return '4:5';
}

function deriveAspectRatio(
  instruction: string,
  primary: AssetMeta | null
): '1:1' | '4:5' | '9:16' | '16:9' {
  for (const { ratio, re } of ASPECT_KEYWORDS) {
    if (re.test(instruction)) return ratio;
  }
  return aspectFromPrimary(primary) ?? '4:5';
}

function deriveQuality(instruction: string): 'quick' | 'studio' | 'cinema' {
  if (/\b(quick|fast|draft|rough|sketch)\b/i.test(instruction)) return 'quick';
  if (/\b(cinema|ultra|premium|hero|masterpiece-quality|billboard)\b/i.test(instruction)) return 'cinema';
  return 'studio';
}

function deriveDurationSec(
  instruction: string,
  primary: AssetMeta | null
): number | undefined {
  const m = instruction.match(/\b(\d{1,3})\s*(?:sec(?:ond)?s?|s)\b/i);
  if (m) return Math.min(180, Math.max(3, parseInt(m[1], 10)));
  if (primary?.durationSec && primary.durationSec > 0) return primary.durationSec;
  return undefined;
}

// ---------------------------------------------------------------------------
// 8. Story plan (video-edit only)
// ---------------------------------------------------------------------------

function buildStoryPlan(
  instruction: string,
  primary: AssetMeta | null
): CreativeBrief['storyPlan'] {
  const isAd = /\b(ad|sell|selling|product|launch|promo|offer|brand|campaign|service)\b/i.test(instruction);
  const subject = summarizeSubject(instruction);
  const durationNote =
    primary?.durationSec && primary.durationSec > 0
      ? `source footage is ~${Math.round(primary.durationSec)}s`
      : 'source footage';

  if (isAd) {
    return {
      structure: 'problem-proof-cta',
      beats: [
        `Problem: open on the pain point behind ${subject} — no branding before value.`,
        `Solution: introduce the offering as the answer, shown clearly and early.`,
        `Proof: evidence, detail shots, or outcome that proves the claim.`,
        `CTA: one clear action — viewer knows exactly what to do next.`,
      ],
      pacingNotes: `Hook in the first 2s; hard cuts by default; vary shot scale (wide → medium → close); cut on action; B-roll must illustrate, prove, or hide an edit — never filler; do not cut on every musical beat, sync major events to phrase-level musical structure; keep a pacing valley (pause/silence) before the CTA. (${durationNote})`,
      musicNotes:
        'Choose music by intent (ad = energy with build), prefer instrumental or sparse lyrics when any voiceover is present, duck music under dialogue with smooth attack/release, end on a deliberate hit or clean stop — never an abrupt cut. Music must be licensable.',
      captionNotes:
        'Captions functional first: accurate, word-synced, inside safe zones, high contrast; keyword emphasis only; never cover the product or faces; readable on a phone at arm’s length.',
      colorNotes:
        'Correct first (exposure, white balance, shot-to-shot matching), then grade. Protect skin tones and keep product color faithful — no oversaturation to fake punch.',
    };
  }
  return {
    structure: 'hook-cta',
    beats: [
      `Hook: open on the strongest moment or question about ${subject} — promise value in the first 2s.`,
      `Context: establish what/where/who with minimal setup.`,
      `Development: build the idea in escalating steps; one idea per beat.`,
      `Escalation: raise energy or stakes; the visual and emotional peak.`,
      `Payoff: deliver the promise from the hook.`,
      `CTA: close with one clear next step.`,
    ],
    pacingNotes: `Edit priority: emotion 51% > story 23% > rhythm 10% > eye trace 7% > 2D continuity 5% > 3D continuity 4%. Default to hard cuts; use J/L cuts to smooth scene changes (audio leads or trails the picture); cut on action inside movement; every cut must have a reason — advance story, clarify, change intensity, hide an edit, or reveal proof. B-roll as visual overlay while narrative audio continues; no filler B-roll; silence is a pacing tool, do not auto-delete every pause. (${durationNote})`,
    musicNotes:
      'Dialogue-driven: story timing outranks music — fit music around the narrative, not the reverse. Prefer instrumental beds; avoid vocal frequencies fighting speech; duck under dialogue; sync accents to musical phrases, not every beat. Music must be licensable.',
    captionNotes:
      'Captions accurate and readable: phrase-by-phrase or keyword emphasis, subtle pop at most; no wild animation, no text covering faces or products; respect platform safe zones.',
    colorNotes:
      'Correct before grading: exposure, white balance, shot matching against a hero shot. Then a restrained grade for mood. Protect skin tones; avoid crushed blacks that hide relevant detail.',
  };
}

// ---------------------------------------------------------------------------
// 9. Subject summarizer (shared with prompt-compiler via export)
// ---------------------------------------------------------------------------

const CLAUSE_CUT_RE = /\s*(without|avoid|no |minus |skip |excluding).*/i;

/** Strip exclusion clauses and filler to get a short subject phrase. */
export function summarizeSubject(instruction: string): string {
  let s = instruction
    .replace(CLAUSE_CUT_RE, '')
    .replace(/["“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Drop a leading imperative verb ("make a poster of ..." -> "a poster of ...").
  s = s.replace(/^(make|create|generate|design|draw|build|turn|give me|i want|i need|please)\s+/i, '');
  if (s.length <= 3) return 'the requested visual';
  return s.length > 180 ? `${s.slice(0, 177)}…` : s;
}

export function extractQuotedText(instruction: string): string[] {
  const out: string[] = [];
  const re = /["“”]([^"“”]{1,60})["“”]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(instruction)) !== null) {
    const t = m[1].trim();
    if (t && !out.includes(t)) out.push(t);
  }
  return out;
}

// ---------------------------------------------------------------------------
// 10. compileBrief
// ---------------------------------------------------------------------------

export function compileBrief(input: CompileBriefInput): CreativeBrief {
  const instruction = (input.instruction ?? '').trim();
  const primary = input.primary ?? null;
  const references = Array.isArray(input.references) ? input.references : [];

  const taskType = deriveTaskType(instruction, primary);
  const isVideo = taskType === 'video-edit' || taskType === 'video-generate';

  const brief: CreativeBrief = {
    version: 1,
    taskType,
    instruction,
    primary,
    references,
    preserve: extractPreserve(instruction),
    modifiers: extractModifiers(instruction),
    exclusions: buildExclusions(instruction),
    outputSpec: {
      media: isVideo ? 'video' : 'image',
      aspectRatio: deriveAspectRatio(instruction, primary),
      quality: deriveQuality(instruction),
      ...(isVideo && { durationSec: deriveDurationSec(instruction, primary) }),
    },
  };

  if (!isVideo) {
    brief.visualFamily = classifyVisualFamily(instruction, references);
  }

  if (taskType === 'video-edit') {
    brief.storyPlan = buildStoryPlan(instruction, primary);
  }

  return brief;
}

// ---------------------------------------------------------------------------
// 11. reviseBrief — targeted patch
// ---------------------------------------------------------------------------

const REF_PROMOTE_RE =
  /\buse\s+(?:ref(?:erence)?\s*)?(?:_?0*(\d{1,2})|#0*(\d{1,2}))\s+(?:more|most|as (?:the )?lead|first)\b|\b(?:ref(?:erence)?\s*)?(?:_?0*(\d{1,2})|#0*(\d{1,2}))\s+(?:should be|as)\s+(?:the\s+)?(?:lead|main|primary)\b/i;

function findRefIndex(references: RefMeta[], n: number): number {
  // Match by explicit id suffix (ref_02 -> 2) or 1-based position as fallback.
  for (let i = 0; i < references.length; i++) {
    const m = references[i].id.match(/_?0*(\d+)$/);
    if (m && parseInt(m[1], 10) === n) return i;
  }
  return n - 1 >= 0 && n - 1 < references.length ? n - 1 : -1;
}

/**
 * Targeted revision: change ONLY what the instruction addresses, preserve
 * everything else. Callers can verify untouched subtrees with deep-equal.
 */
export function reviseBrief(brief: CreativeBrief, instruction: string): CreativeBrief {
  const change = instruction.trim();
  // Structured clone: every array/object we might touch is rebuilt; the rest
  // is carried over by reference-equal values so untouched fields stay
  // deep-equal (and typically reference-equal).
  const next: CreativeBrief = {
    ...brief,
    instruction: brief.instruction ? `${brief.instruction}; ${change}` : change,
    preserve: [...brief.preserve],
    modifiers: [...brief.modifiers],
    exclusions: [...brief.exclusions],
    references: [...brief.references],
    outputSpec: { ...brief.outputSpec },
  };

  // --- modifiers ---------------------------------------------------------
  const newMods = extractModifiers(change);
  for (const m of newMods) {
    if (!next.modifiers.includes(m)) next.modifiers.push(m);
  }

  // --- exclusions --------------------------------------------------------
  const newExcl = extractUserExclusions(change);
  for (const e of newExcl) {
    if (!next.exclusions.includes(e)) next.exclusions.push(e);
  }

  // --- visual family -----------------------------------------------------
  if (!next.outputSpec || next.outputSpec.media === 'image') {
    const fam = classifyVisualFamily(change, []);
    // Only switch the family if the revision text actually names one —
    // classifyVisualFamily defaults to 'cinematic moody' on zero hits.
    const hadHit = FAMILY_KEYWORDS.some(({ re }) => re.test(change));
    if (hadHit && fam !== next.visualFamily) next.visualFamily = fam;
  }

  // --- aspect ratio / quality --------------------------------------------
  for (const { ratio, re } of ASPECT_KEYWORDS) {
    if (re.test(change)) {
      next.outputSpec = { ...next.outputSpec, aspectRatio: ratio };
      break;
    }
  }
  if (/\b(quick|fast|draft|rough)\b/i.test(change)) {
    next.outputSpec = { ...next.outputSpec, quality: 'quick' };
  } else if (/\b(cinema|ultra|premium|hero)\b/i.test(change)) {
    next.outputSpec = { ...next.outputSpec, quality: 'cinema' };
  }

  // --- reference promotion ("use ref 2 more") -----------------------------
  const pm = change.match(REF_PROMOTE_RE);
  if (pm) {
    const n = parseInt(pm[1] ?? pm[2] ?? pm[3] ?? pm[4] ?? '0', 10);
    const idx = findRefIndex(next.references, n);
    if (idx > 0) {
      const [promoted] = next.references.splice(idx, 1);
      next.references.unshift(promoted);
    }
  }

  return next;
}
