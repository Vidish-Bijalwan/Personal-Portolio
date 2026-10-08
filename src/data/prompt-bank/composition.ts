/**
 * Etch — cinema-grade prompt bank: composition terms.
 *
 * Vocabulary drawn from (short fragments only, attributed; see
 * PROMPT_BANK_SOURCES.md):
 *  - realaman90/ai-film-skills nano-banana.md — Composition table
 *  - jr-mccoy/prompt-agent-engineering
 *    (domain-image-generation/IMAGE_PROMPTING_GUIDE.md) — Composition Rules
 *  - thesephist gist "Collection of useful Stable Diffusion prompt
 *    modifiers" — Angle & framing section
 *  - willwulfken/MidJourney-Styles-and-Keywords-Reference (via
 *    kalelqs/midjourney-styles-and-keywords-reference fork) — Style Pages /
 *    Camera.md Perspective section
 */
import type { BankTerm } from './types';

export const COMPOSITION_TERMS: BankTerm[] = [
  {
    id: 'rule-of-thirds',
    fragment: 'rule of thirds composition',
    aliases: ['rule of thirds'],
    tags: ['rule of thirds', 'thirds'],
  },
  {
    id: 'leading-lines',
    fragment: 'leading lines drawing the eye to the subject',
    aliases: ['leading lines'],
    tags: ['leading lines', 'converging lines'],
  },
  {
    id: 'symmetrical',
    fragment: 'centered symmetrical framing',
    aliases: ['symmetrical framing', 'symmetry', 'centered'],
    tags: ['symmetrical', 'symmetry', 'centered', 'bilateral'],
  },
  {
    id: 'negative-space',
    fragment: 'generous negative space',
    aliases: ['negative space'],
    tags: ['negative space', 'minimal', 'empty space', 'copy space'],
  },
  {
    id: 'golden-ratio',
    fragment: 'golden ratio composition',
    aliases: ['golden ratio', 'golden spiral'],
    tags: ['golden ratio', 'golden spiral', 'fibonacci'],
  },
  {
    id: 'frame-in-frame',
    fragment: 'frame within a frame',
    aliases: ['frame within a frame', 'frame in frame', 'framed through'],
    tags: ['frame within', 'through doorway', 'through window', 'archway'],
  },
  {
    id: 'dutch-angle',
    fragment: 'dutch angle',
    aliases: ['dutch angle', 'tilted angle'],
    tags: ['dutch angle', 'tilted framing', 'unease'],
  },
  {
    id: 'low-angle',
    fragment: 'low angle shot',
    aliases: ['low angle', 'low-angle'],
    tags: ['low angle', 'from below', 'imposing', 'worms-eye'],
  },
  {
    id: 'high-angle',
    fragment: 'high angle shot',
    aliases: ['high angle', 'high-angle'],
    tags: ['high angle', 'from above', 'overhead view'],
  },
  {
    id: 'aerial',
    fragment: 'aerial view',
    aliases: ['aerial view', 'bird’s-eye view', "bird's-eye view", 'drone shot'],
    tags: ['aerial', 'drone', 'top-down', 'bird eye'],
  },
  {
    id: 'depth-layering',
    fragment: 'layered foreground, midground and background depth',
    aliases: ['layered depth', 'foreground and background'],
    tags: ['layered', 'depth', 'foreground', 'atmospheric perspective'],
  },
  {
    id: 'diagonal',
    fragment: 'dynamic diagonal composition',
    aliases: ['diagonal composition'],
    tags: ['diagonal', 'dynamic composition'],
  },
  {
    id: 'closeup-intimacy',
    fragment: 'intimate close-up framing',
    aliases: ['close-up framing', 'closeup framing'],
    tags: ['close-up', 'closeup', 'intimate framing'],
  },
  {
    id: 'establishing',
    fragment: 'wide establishing shot',
    aliases: ['establishing shot'],
    tags: ['establishing shot', 'wide establishing'],
  },
];

/**
 * Mild fallback used when no composition term matched: matches the old
 * "professional composition" behavior.
 */
export const DEFAULT_COMPOSITION_FRAGMENT = 'professional composition';

/** Source attribution line for PROMPT_BANK_SOURCES.md. */
export const COMPOSITION_SOURCES = [
  'realaman90/ai-film-skills nano-banana.md — Composition',
  'jr-mccoy/prompt-agent-engineering (IMAGE_PROMPTING_GUIDE.md) — Composition Rules',
  'thesephist gist "Collection of useful Stable Diffusion prompt modifiers" — Angle & framing',
  'willwulfken/MidJourney-Styles-and-Keywords-Reference (fork kalelqs/midjourney-styles-and-keywords-reference) — Style Pages/Camera.md Perspective',
];
