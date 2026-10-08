/**
 * Etch — cinema-grade prompt bank: lenses, film stocks, cameras.
 *
 * Vocabulary drawn from (short fragments only, attributed; see
 * PROMPT_BANK_SOURCES.md):
 *  - belentani7/cinematic-prompt-formatter (MIT) — Lens Types section
 *  - thesephist gist "Collection of useful Stable Diffusion prompt
 *    modifiers" — Lens & Capture, Film selection sections
 *  - willwulfken/MidJourney-Styles-and-Keywords-Reference (via
 *    kalelqs/midjourney-styles-and-keywords-reference fork) — Style Pages /
 *    Camera.md keyword list
 *  - realaman90/ai-film-skills nano-banana.md — "Choose your camera, lens,
 *    and focus" table
 *  - yuri-schmaltz/my-directors-console (AI_MODEL_PROMPTING.md) — Camera /
 *    Lens / Film token tables
 *
 * Product names (Kodak, Fujifilm, ARRI, IMAX…) are factual industry terms.
 */
import type { BankTerm } from './types';

export const LENS_TERMS: BankTerm[] = [
  {
    id: 'anamorphic',
    fragment: 'anamorphic lens look',
    aliases: ['anamorphic', 'anamorphic lens'],
    tags: ['anamorphic', 'cinemascope', '2.39:1'],
  },
  {
    id: '85mm-portrait',
    fragment: '85mm portrait lens, f/1.8',
    aliases: ['85mm', 'portrait lens'],
    tags: ['portrait', '85mm', 'headshot', 'face'],
  },
  {
    id: '35mm',
    fragment: '35mm lens, natural perspective',
    aliases: ['35mm lens', '35mm'],
    tags: ['35mm', 'natural perspective', 'street'],
  },
  {
    id: '24mm-wide',
    fragment: '24mm wide-angle lens',
    aliases: ['24mm', 'wide-angle lens', 'wide angle lens'],
    tags: ['wide-angle', 'wide angle', 'vast scale'],
  },
  {
    id: '14mm-ultrawide',
    fragment: '14mm ultra-wide lens',
    aliases: ['14mm', 'ultra-wide lens', 'ultra wide lens'],
    tags: ['ultra-wide', 'ultra wide', 'extreme perspective'],
  },
  {
    id: 'macro',
    fragment: 'macro lens, intricate detail',
    aliases: ['macro lens', 'macro'],
    tags: ['macro', 'close detail', 'tiny', 'insect', 'jewelry'],
  },
  {
    id: 'fisheye',
    fragment: 'fisheye lens',
    aliases: ['fisheye', 'fisheye lens'],
    tags: ['fisheye', 'circular distortion'],
  },
  {
    id: 'tilt-shift',
    fragment: 'tilt-shift lens, miniature effect',
    aliases: ['tilt-shift', 'tilt shift'],
    tags: ['tilt-shift', 'tilt shift', 'miniature'],
  },
  {
    id: 'telephoto',
    fragment: 'telephoto compression',
    aliases: ['telephoto'],
    tags: ['telephoto', 'compressed background', '200mm'],
  },
];

export const FILM_STOCK_TERMS: BankTerm[] = [
  {
    id: 'portra-400',
    fragment: 'Kodak Portra 400 film',
    aliases: ['kodak portra', 'portra 400'],
    tags: ['portra', 'kodak portra', 'film photograph'],
  },
  {
    id: 'cinestill-800t',
    fragment: 'Cinestill 800T film',
    aliases: ['cinestill 800t', 'cinestill'],
    tags: ['cinestill', 'tungsten film', 'night film'],
  },
  {
    id: 'vision3-500t',
    fragment: 'Kodak Vision3 500T motion-picture film',
    aliases: ['vision3', 'kodak vision3', '500t'],
    tags: ['vision3', 'motion picture film', 'cinema film stock'],
  },
  {
    id: 'velvia',
    fragment: 'Fujifilm Velvia saturated slide film',
    aliases: ['velvia', 'fujifilm velvia'],
    tags: ['velvia', 'saturated film', 'landscape film'],
  },
  {
    id: 'ektar',
    fragment: 'Kodak Ektar 100 film',
    aliases: ['ektar', 'kodak ektar'],
    tags: ['ektar', 'vivid film'],
  },
  {
    id: 'ilford-hp5',
    fragment: 'Ilford HP5 black-and-white film',
    aliases: ['ilford hp5', 'hp5'],
    tags: ['ilford', 'black and white film', 'bw film'],
  },
  {
    id: 'kodachrome',
    fragment: 'Kodachrome film look',
    aliases: ['kodachrome'],
    tags: ['kodachrome', 'vintage slide'],
  },
  {
    id: 'fine-grain-35mm',
    fragment: '35mm film grain',
    aliases: ['film grain', '35mm film'],
    tags: ['film grain', 'analog', 'grainy film'],
  },
];

export const CAMERA_TERMS: BankTerm[] = [
  {
    id: 'arri-alexa',
    fragment: 'shot on ARRI Alexa',
    aliases: ['arri alexa', 'arri'],
    tags: ['arri', 'alexa', 'cinema camera'],
  },
  {
    id: 'imax-70mm',
    fragment: 'shot on 70mm IMAX',
    aliases: ['imax', '70mm imax', 'shot on 70mm'],
    tags: ['imax', '70mm', 'large format'],
  },
  {
    id: 'medium-format',
    fragment: 'medium-format camera',
    aliases: ['medium-format', 'medium format'],
    tags: ['medium format', 'hasselblad'],
  },
  {
    id: 'shallow-dof',
    fragment: 'shallow depth of field',
    aliases: ['shallow depth of field', 'bokeh', 'background blur'],
    tags: ['bokeh', 'shallow depth', 'blurred background'],
  },
  {
    id: 'deep-focus',
    fragment: 'deep focus, everything sharp',
    aliases: ['deep focus'],
    tags: ['deep focus', 'everything sharp', 'f/11'],
  },
];

/** All optics terms in one list for scoring. */
export const OPTICS_TERMS: BankTerm[] = [
  ...LENS_TERMS,
  ...FILM_STOCK_TERMS,
  ...CAMERA_TERMS,
];

/** Source attribution line for PROMPT_BANK_SOURCES.md. */
export const OPTICS_SOURCES = [
  'belentani7/cinematic-prompt-formatter (MIT) — Lens Types',
  'thesephist gist "Collection of useful Stable Diffusion prompt modifiers" — Lens & Capture, Film selection',
  'willwulfken/MidJourney-Styles-and-Keywords-Reference (fork kalelqs/midjourney-styles-and-keywords-reference) — Style Pages/Camera.md',
  'realaman90/ai-film-skills nano-banana.md — "Choose your camera, lens, and focus"',
  'yuri-schmaltz/my-directors-console (AI_MODEL_PROMPTING.md) — Camera / Lens / Film token tables',
];
