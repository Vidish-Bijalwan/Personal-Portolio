/**
 * Madam Muse — prompt compiler.
 *
 * Turns a CreativeBrief into a structured, art-directed generation/edit
 * prompt plus per-reference directives. Deterministic, rule-based.
 *
 * Image: the 10-part formula from many_images.md §5.1 —
 *   deliverable, objective, subject, visual family, composition plan,
 *   palette (2–5 colors + accent role), texture/material, typography system,
 *   constraints, anti-generic exclusions. Every part present, fixed order,
 *   labeled sections.
 * Video-edit: story skeleton + shot/pacing/music/caption/color plan per
 *   many.md (Murch priority order, hard cuts default, J/L cuts noted,
 *   dialogue > music, correct-before-grade, protect skin/product color).
 */

import type { CreativeBrief, RefMeta, RefRole } from './brief';
import {
  resolveReferenceRoles,
  summarizeSubject,
  extractQuotedText,
} from './intent-compiler';

export interface CompiledPrompt {
  prompt: string;
  referenceDirectives: string[];
}

// ---------------------------------------------------------------------------
// Family → art-direction recipes (many_images.md §8 / §11 / §13 / §14)
// ---------------------------------------------------------------------------

interface FamilyRecipe {
  composition: string;
  palette: string[]; // 2–5 colors + accent role baked into the last entry
  accentRole: string;
  texture: string;
  typography: string;
}

const FAMILY_RECIPES: Record<string, FamilyRecipe> = {
  'editorial poster': {
    composition:
      'Strong single focal subject with generous negative space; oversized headline in the upper third; supporting details aligned in a clean bottom band; clear first-look / second-look hierarchy.',
    palette: ['warm off-white paper', 'deep ink black', 'muted editorial grey', 'one restrained red accent'],
    accentRole: 'red accent marks the CTA or key word only',
    texture: 'matte paper grain, subtle print-like finish',
    typography: 'bold grotesk headline, small monospace metadata at the bottom',
  },
  'typographic manifesto': {
    composition:
      'Typography IS the subject: big stacked headline as the main visual mass, tight leading, poster-like alignment; minimal illustrative support, no clutter.',
    palette: ['off-white', 'ink black', 'poster red'],
    accentRole: 'red accent for emphasis words or rules',
    texture: 'paper grain, slight photocopy bite',
    typography: 'bold condensed sans or serif contrast headline; sharp legibility; no garbled or extra text',
  },
  'retro collage': {
    composition:
      'Layered cutout elements with intention — collage scatter with a clear focal piece; rough edges, tape/stamp/photocopy artifacts used sparingly.',
    palette: ['sun-faded cream', 'retro teal-blue', 'worn orange', 'ink black'],
    accentRole: 'orange accent for stamps and small highlights',
    texture: 'grainy paper, halftone overlays, slightly imperfect print finish',
    typography: 'hand-drawn or retro display headline, type integrated into collage',
  },
  'anime/manga': {
    composition:
      'Dramatic portrait crop, expressive face/eyes as focal point, graphic stylized background elements; poster layout with breathing room.',
    palette: ['graphic black', 'paper white', 'bold flat background tone', 'one hot accent'],
    accentRole: 'accent color for eyes/details/background pop',
    texture: 'subtle print grain over clean cel shading — no sterile digital flatness',
    typography: 'minimal but sharp poster typography, manga-energy placement',
  },
  'surreal symbolic': {
    composition:
      'One powerful symbolic image as the focus; clean conceptual arrangement; gallery-worthy negative space around the metaphor.',
    palette: ['deep gallery black or bone white', 'single surreal accent', 'muted mid-tone'],
    accentRole: 'accent carries the symbolic object',
    texture: 'fine art-print finish, controlled grain',
    typography: 'minimal typography only if needed — the image must carry the idea',
  },
  'cinematic moody': {
    composition:
      'Intentional framing with atmospheric depth; subject placed off-center; light sources motivate the mood; tight crop options for portrait variants.',
    palette: ['deep shadow blue', 'warm amber highlight', 'charcoal black'],
    accentRole: 'amber highlights on the subject edge / screen glow',
    texture: 'film grain, atmospheric haze, realistic light falloff',
    typography: 'condensed cinematic title treatment, small supporting captions',
  },
  'infographic/study-sheet': {
    composition:
      'Modular information grid: clear sections with headings, icons, and concise bullets; dense but readable; strong educational hierarchy.',
    palette: ['clean paper white', 'calm academic blue', 'soft highlight yellow', 'ink for labels'],
    accentRole: 'yellow/blue color-coding for section categories',
    texture: 'clean vector-flat surfaces, crisp lines — light paper feel only',
    typography: 'sharp educational typography; crisp labels; section headings clearly weighted above body',
  },
  'creator cover': {
    composition:
      'Thumbnail-first: one strong focal subject, large readable headline in the upper or center third, simplified background; readable at small size.',
    palette: ['high-contrast base', 'bold accent color', 'clean dark or light ground'],
    accentRole: 'accent drives the hook word and focal outline',
    texture: 'clean with light polish — no heavy grain that muddies small-size legibility',
    typography: 'oversized bold headline, very few words, hook first',
  },
  'automotive/blueprint': {
    composition:
      'Vehicle as hero: clean side or three-quarter angle, technical-drawing overlays or minimal studio space; collectible-poster balance.',
    palette: ['blueprint blue or studio grey', 'white linework', 'single premium accent'],
    accentRole: 'accent for spec callouts and the badge',
    texture: 'fine print finish, subtle blueprint paper tooth',
    typography: 'model-name typography with small technical metadata in monospace',
  },
  'hindi/vernacular': {
    composition:
      'Strong regional flavor: folk frame or ornament as border logic, central subject or phrase, culturally grounded layout.',
    palette: ['warm earthy maroon', 'turmeric yellow', 'deep ink', 'festive red accent'],
    accentRole: 'red/gold accent for ornamental details',
    texture: 'print texture with hand-made warmth',
    typography: 'strong Hindi/Devanagari display typography, sharp and legible',
  },
  'dark monochrome+accent': {
    composition:
      'Tight portrait crop against dark ground; single accent light or color element as the visual hook; dramatic chiaroscuro.',
    palette: ['near-black', 'charcoal grey', 'paper white highlights', 'one hot accent'],
    accentRole: 'accent color is the only color — use it once, deliberately',
    texture: 'grainy black-and-white print feel',
    typography: 'minimal, elegant type; let the portrait dominate',
  },
  'personal brand': {
    composition:
      'Strong portrait with stylish editorial layout; name prominent; supporting copy minimal; portfolio-worthy spacing.',
    palette: ['clean neutral ground', 'ink black', 'one brand accent'],
    accentRole: 'accent reflects the person’s brand traits',
    texture: 'refined, lightly polished — premium but real',
    typography: 'name in confident display type; rest minimal',
  },
  'minimal soft': {
    composition:
      'Bold focal subject on a soft, uncluttered ground; ample negative space; calm, deliberate placement.',
    palette: ['soft cream', 'warm beige', 'muted sage or blush', 'soft ink'],
    accentRole: 'accent is gentle — a tint, not a shout',
    texture: 'soft matte finish, barely-there grain',
    typography: 'quiet, refined type; minimal words',
  },
  'grunge/halftone': {
    composition:
      'High-contrast layered poster: torn-paper edges, collage energy, distressed type; rebellious youth mood with a clear focal hit.',
    palette: ['off-white', 'ink black', 'acid red or hot pink', 'acid green accent'],
    accentRole: 'acid accent for distress details and type hits',
    texture: 'xerox/photocopy texture, halftone dots, distressed edges',
    typography: 'distressed bold display type, raw placement',
  },
  'workstation/neon': {
    composition:
      'Creator workstation scene: screens as light sources, gear arranged with intent, moody depth behind the setup.',
    palette: ['deep room black', 'screen-glow cyan or warm amber', 'charcoal'],
    accentRole: 'neon tone motivates the lighting — justified, not decorative',
    texture: 'realistic screen glow, subtle film grain',
    typography: 'modern technical captions, minimal',
  },
};

const FALLBACK_RECIPE: FamilyRecipe = FAMILY_RECIPES['cinematic moody'];

function recipeFor(family: string | undefined): FamilyRecipe {
  return (family && FAMILY_RECIPES[family]) || FALLBACK_RECIPE;
}

// ---------------------------------------------------------------------------
// Reference directives — one per ref, role spelled out, never averaged
// ---------------------------------------------------------------------------

const ROLE_DIRECTIVES: Record<RefRole, (id: string) => string> = {
  style: (id) =>
    `${id} (role: style, LEAD rendering language): render in this reference's visual language — its illustration/photographic treatment, linework, contrast behavior. Generate an ORIGINAL design in this language; do not copy its subject.`,
  composition: (id) =>
    `${id} (role: composition): use its layout and grid structure — subject placement, negative-space logic, text zones. Do not copy its subject, colors, or texture.`,
  palette: (id) =>
    `${id} (role: palette): borrow its color logic only — dominant hues, accent role, saturation discipline. Do not copy its layout or subject.`,
  typography: (id) =>
    `${id} (role: typography): borrow its type treatment — font personality, hierarchy, placement logic. Do not copy its wording; use only the text specified in this brief.`,
  texture: (id) =>
    `${id} (role: texture): borrow its surface feel — grain, print, collage, or material quality — applied subtly. Do not copy its subject or layout.`,
  mood: (id) =>
    `${id} (role: mood): borrow its emotional atmosphere and lighting attitude. Do not copy its specific subject or composition.`,
  subject: (id) =>
    `${id} (role: subject): the subject must be rendered faithfully to this reference — identity, appearance, key features. Keep it recognizable.`,
};

export function buildReferenceDirectives(references: RefMeta[]): string[] {
  const resolved = resolveReferenceRoles(references);
  return resolved.map(({ ref, isSupportingStyle }) => {
    let directive = ROLE_DIRECTIVES[ref.role](ref.id);
    if (isSupportingStyle) {
      directive =
        `${ref.id} (role: style, SUPPORTING cue): borrow only material/mood cues from this reference. ` +
        `The lead style reference governs the rendering language — never blend the two into a 50/50 mashup.`;
    }
    if (ref.role === 'palette' && ref.palette && ref.palette.length > 0) {
      directive += ` Reference hexes: ${ref.palette.slice(0, 5).join(', ')}.`;
    }
    return directive;
  });
}

// ---------------------------------------------------------------------------
// Image prompt — 10-part formula
// ---------------------------------------------------------------------------

const DELIVERABLE_KEYWORDS: Array<{ deliverable: string; re: RegExp }> = [
  { deliverable: 'editorial poster', re: /\bposter\b/i },
  { deliverable: 'ad creative', re: /\b(ad|advertisement|creative)\b/i },
  { deliverable: 'social-media cover / thumbnail', re: /\b(thumbnail|youtube|cover)\b/i },
  { deliverable: 'infographic / study sheet', re: /\b(infographic|study[- ]sheet|cheat[- ]?sheet|revision)\b/i },
  { deliverable: 'portrait poster', re: /\b(portrait|headshot)\b/i },
  { deliverable: 'logo concept', re: /\blogo\b/i },
  { deliverable: 'product shot', re: /\bproduct\b/i },
  { deliverable: 'cinematic still', re: /\bcinematic\b/i },
];

function detectDeliverable(instruction: string): string {
  for (const { deliverable, re } of DELIVERABLE_KEYWORDS) {
    if (re.test(instruction)) return deliverable;
  }
  return 'AI-generated image';
}

function detectObjective(instruction: string): string {
  if (/\b(sell|buy|shop|discount|offer|launch|promo)\b/i.test(instruction))
    return 'sell — make the offering desirable and the next step obvious';
  if (/\b(study|learn|exam|revision|educat|explain)\b/i.test(instruction))
    return 'educate — package information so it is instantly readable and save-worthy';
  if (/\b(brand|portfolio|about me|identity)\b/i.test(instruction))
    return 'brand — build a confident, memorable personal visual identity';
  if (/\b(announce|event|coming soon|launch)\b/i.test(instruction))
    return 'announce — create excitement and communicate the key details at a glance';
  return 'inspire — create a striking, save-worthy visual with a clear focal point';
}

function buildImagePrompt(brief: CreativeBrief): string {
  const recipe = recipeFor(brief.visualFamily);
  const subject = summarizeSubject(brief.instruction);
  const deliverable = detectDeliverable(brief.instruction);
  const objective = detectObjective(brief.instruction);
  const family = brief.visualFamily ?? 'cinematic moody';
  const quoted = extractQuotedText(brief.instruction);

  // Palette: a palette-role ref's hexes win; otherwise the family recipe.
  const paletteRef = brief.references.find(
    (r) => r.role === 'palette' && r.palette && r.palette.length > 0
  );
  const paletteLine = paletteRef
    ? `${paletteRef.palette!.slice(0, 5).join(', ')} (from ${paletteRef.id}). Accent role: ${recipe.accentRole}.`
    : `${recipe.palette.join(', ')}. Accent role: ${recipe.accentRole}.`;

  const preserveLine =
    brief.preserve.length > 0
      ? `Preserve exactly as in the source: ${brief.preserve.join(', ')}. Do not alter these elements.`
      : 'No preservation constraints beyond the source identity.';

  const typeLines =
    quoted.length > 0
      ? `Exact text to render: ${quoted.map((q) => `“${q}”`).join('; ')}. ${recipe.typography}. No garbled, misspelled, or extra text.`
      : `${recipe.typography}. Keep text minimal and intentional; if no text is specified, do not invent wording.`;

  const modifiersLine =
    brief.modifiers.length > 0
      ? `User-directed treatment: ${brief.modifiers.join(', ')}.`
      : 'No extra user treatment modifiers.';

  const refLine =
    brief.references.length > 0
      ? `Reference usage: apply the per-reference directives listed below (${brief.references.map((r) => r.id).join(', ')}) — each reference contributes only its assigned role; never average all references into one look.`
      : 'No reference images.';

  const exclusionsLine = `Avoid: ${brief.exclusions.join('; ')}.`;

  const aspectLine = `Aspect ratio ${brief.outputSpec.aspectRatio}; ${brief.outputSpec.quality}-tier finish.`;

  return [
    `### 1. Deliverable`,
    `${deliverable}. ${aspectLine}`,
    ``,
    `### 2. Objective`,
    `${objective}.`,
    ``,
    `### 3. Primary subject`,
    brief.taskType === 'image-edit'
      ? `Edit of the provided source image depicting: ${subject}. ${preserveLine}`
      : `Newly generated image depicting: ${subject}.`,
    ``,
    `### 4. Visual family`,
    `${family}. ${refLine}`,
    ``,
    `### 5. Composition plan`,
    brief.taskType === 'image-edit' && brief.preserve.includes('geometry')
      ? `Preserve the original composition and framing; apply changes within the existing layout. ${recipe.composition}`
      : recipe.composition,
    ``,
    `### 6. Palette`,
    `2–5 colors: ${paletteLine}`,
    ``,
    `### 7. Texture / material`,
    `${recipe.texture}. ${modifiersLine}`,
    ``,
    `### 8. Typography system`,
    typeLines,
    ``,
    `### 9. Constraints`,
    `${preserveLine} Sharp, legible type; strong focal hierarchy; cohesive palette; print-like compositional discipline.`,
    ``,
    `### 10. Anti-generic exclusions`,
    `${exclusionsLine} The result must look professionally art-directed and Pinterest-worthy — designed with strong visual hierarchy, tasteful intentional composition, clear focal point, and restrained effects — never like a generic AI render.`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Video-edit prompt — story skeleton + shot/pacing/music/caption/color plan
// ---------------------------------------------------------------------------

function buildVideoPrompt(brief: CreativeBrief): string {
  const subject = summarizeSubject(brief.instruction);
  const plan = brief.storyPlan;
  const structure =
    plan?.structure === 'problem-proof-cta'
      ? 'Problem → Solution → Proof → CTA (ad structure)'
      : 'Hook → Context → Development → Escalation → Payoff → CTA';
  const beats = plan?.beats ?? [];
  const durationSec = brief.outputSpec.durationSec;
  const durationLine = durationSec
    ? `Target duration ~${durationSec}s.`
    : 'Duration: match the natural length of the source footage; never add weak footage just to fill time.';

  const refLine =
    brief.references.length > 0
      ? `Reference usage: apply the per-reference directives listed below (${brief.references.map((r) => r.id).join(', ')}) — each reference contributes only its assigned role.`
      : 'No reference assets.';

  const exclusionsLine = `Avoid: ${brief.exclusions.join('; ')}; random transitions; cutting on every musical beat; a whoosh or impact on every cut; filler B-roll that does not illustrate, prove, or hide an edit; generic neon/cyberpunk decoration unless the brief asks for it; LUT-style grade before correction; music that fights dialogue; captions covering faces or the product.`;

  return [
    `### Video edit plan`,
    ``,
    `**Source & subject.** Editing the provided footage about: ${subject}. ${durationLine} ${refLine}`,
    ``,
    `### 1. Story skeleton (${structure})`,
    ...beats.map((b, i) => `${i + 1}. ${b}`),
    ``,
    `### 2. Shot plan`,
    `- Vary shot scale intentionally (wide → medium → close); A-roll carries dialogue/narrative, B-roll overlays it as illustration, proof, cutaway, or visual reset while narrative audio continues.`,
    `- Cut on action: place cuts inside motivated movement so motion masks the cut and transfers energy.`,
    `- Every cut must have a reason (advances story, clarifies, changes intensity, hides an edit, reveals proof) — if none, do not cut.`,
    ``,
    `### 3. Pacing & cuts`,
    plan?.pacingNotes ?? '',
    `- Cut priority (Murch Rule of Six): emotion 51% > story 23% > rhythm 10% > eye trace 7% > 2D continuity 5% > 3D continuity 4%.`,
    `- Default to hard cuts; use J-cuts (next audio starts before picture) and L-cuts (previous audio trails over next picture) to smooth scene changes.`,
    `- Build pacing contrast: peaks and valleys, not one constant cut rate. Silence is a pacing tool — preserve meaningful pauses.`,
    ``,
    `### 4. Music & sound`,
    plan?.musicNotes ?? '',
    `- Audio hierarchy: intelligible dialogue first, then essential sync sound/SFX, ambience, music, decorative SFX last.`,
    `- Duck music under dialogue with smooth attack/release; never let music mask speech.`,
    ``,
    `### 5. Captions`,
    plan?.captionNotes ?? '',
    ``,
    `### 6. Color`,
    plan?.colorNotes ?? '',
    ``,
    `### 7. Anti-generic exclusions`,
    exclusionsLine,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// compilePrompt
// ---------------------------------------------------------------------------

export function compilePrompt(brief: CreativeBrief): CompiledPrompt {
  const referenceDirectives = buildReferenceDirectives(brief.references);
  const isVideo = brief.outputSpec.media === 'video';
  const prompt =
    brief.taskType === 'video-edit' || brief.taskType === 'video-generate'
      ? buildVideoPrompt(brief)
      : buildImagePrompt(brief);
  return { prompt, referenceDirectives };
}
