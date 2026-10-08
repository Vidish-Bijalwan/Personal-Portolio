/**
 * Etch — cinema-grade prompt bank: lighting terms.
 *
 * Vocabulary drawn from (short fragments only, attributed; see
 * PROMPT_BANK_SOURCES.md):
 *  - belentani7/cinematic-prompt-formatter (MIT) — Lighting section
 *  - thesephist gist "Collection of useful Stable Diffusion prompt
 *    modifiers" — Lighting section
 *  - willwulfken/MidJourney-Styles-and-Keywords-Reference (via
 *    kalelqs/midjourney-styles-and-keywords-reference fork) — Style Pages /
 *    Lighting.md keyword list
 *  - realaman90/ai-film-skills nano-banana.md — "Design your lighting" table
 */
import type { BankTerm } from './types';

export const LIGHTING_TERMS: BankTerm[] = [
  {
    id: 'golden-hour',
    fragment: 'golden hour lighting',
    aliases: ['golden hour', 'warm glow'],
    tags: ['golden hour', 'sunset', 'sunrise', 'warm glow', 'evening light'],
  },
  {
    id: 'blue-hour',
    fragment: 'blue hour lighting',
    aliases: ['blue hour', 'twilight'],
    tags: ['blue hour', 'twilight', 'dusk'],
  },
  {
    id: 'chiaroscuro',
    fragment: 'chiaroscuro lighting',
    aliases: ['chiaroscuro'],
    tags: ['chiaroscuro', 'harsh contrast', 'high contrast'],
  },
  {
    id: 'rembrandt',
    fragment: 'Rembrandt lighting',
    aliases: ['rembrandt lighting', 'rembrandt'],
    tags: ['rembrandt', 'portrait lighting', 'triangle of light'],
  },
  {
    id: 'volumetric',
    fragment: 'volumetric lighting',
    aliases: ['volumetric lighting', 'volumetric', 'god rays', 'light beams'],
    tags: ['volumetric', 'god rays', 'light beams', 'dusty atmosphere'],
  },
  {
    id: 'rim',
    fragment: 'rim lighting',
    aliases: ['rim lighting', 'rim light', 'edge lighting', 'edge light'],
    tags: ['rim light', 'rim lighting', 'edge light', 'edge lighting'],
  },
  {
    id: 'low-key',
    fragment: 'low-key lighting',
    aliases: ['low-key lighting', 'low key lighting', 'dimly lit'],
    tags: ['low-key', 'low key', 'dimly lit', 'moody', 'dark scene'],
  },
  {
    id: 'high-key',
    fragment: 'high-key lighting',
    aliases: ['high-key lighting', 'high key lighting', 'bright and even'],
    tags: ['high-key', 'high key', 'bright and even', 'cheerful'],
  },
  {
    id: 'soft-diffused',
    fragment: 'soft diffused lighting',
    aliases: ['soft diffused lighting', 'soft light', 'diffuse lighting'],
    tags: ['soft light', 'diffused', 'flattering light', 'overcast'],
  },
  {
    id: 'hard-directional',
    fragment: 'hard directional light',
    aliases: ['hard directional light', 'hard light'],
    tags: ['hard light', 'directional light', 'harsh light'],
  },
  {
    id: 'studio-three-point',
    fragment: 'three-point studio lighting',
    aliases: [
      'three-point studio lighting',
      'three point lighting',
      'studio lighting',
    ],
    tags: ['studio lighting', 'three-point', 'softbox', 'product shoot'],
  },
  {
    id: 'window-light',
    fragment: 'soft natural window light',
    aliases: ['window light', 'natural window light', 'north-facing window'],
    tags: ['window light', 'natural light', 'daylight'],
  },
  {
    id: 'neon-glow',
    fragment: 'neon glow lighting',
    aliases: ['neon glow', 'neon lighting', 'neon lamp'],
    tags: ['neon', 'city lights', 'glow signs'],
  },
  {
    id: 'practical',
    fragment: 'practical lighting',
    aliases: ['practical lighting', 'practical light'],
    tags: ['practical', 'in-scene light', 'lamps'],
  },
  {
    id: 'dramatic-side',
    fragment: 'dramatic side lighting',
    aliases: ['dramatic side lighting', 'side lighting'],
    tags: ['side light', 'split lighting', 'dramatic shadows'],
  },
  {
    id: 'backlight-silhouette',
    fragment: 'backlit silhouette',
    aliases: ['backlit silhouette', 'backlight', 'backlit'],
    tags: ['backlit', 'backlight', 'silhouette'],
  },
  {
    id: 'candlelight',
    fragment: 'warm candlelight',
    aliases: ['candlelight', 'candle light'],
    tags: ['candle', 'candlelight', 'flickering light'],
  },
  {
    id: 'moonlight',
    fragment: 'cool moonlight',
    aliases: ['moonlight', 'moon light'],
    tags: ['moonlight', 'night sky', 'moonlit'],
  },
  {
    id: 'dappled',
    fragment: 'dappled sunlight through leaves',
    aliases: ['dappled sunlight', 'dappled light'],
    tags: ['dappled', 'forest light', 'through leaves'],
  },
  {
    id: 'stage',
    fragment: 'stage lighting',
    aliases: ['stage lighting', 'spotlight'],
    tags: ['stage', 'spotlight', 'concert', 'theater', 'theatre'],
  },
  {
    id: 'crepuscular',
    fragment: 'crepuscular rays',
    aliases: ['crepuscular rays', 'rays of light'],
    tags: ['crepuscular', 'sun rays', 'rays of light'],
  },
  {
    id: 'flare',
    fragment: 'subtle lens flare',
    aliases: ['lens flare', 'subtle flare'],
    tags: ['lens flare', 'flare', 'sun flare'],
  },
];

/**
 * Mild fallback used when no lighting term matched: matches the old
 * "balanced lighting" behavior so prompts without lighting cues still get
 * a neutral cinema foundation.
 */
export const DEFAULT_LIGHTING_FRAGMENT = 'balanced cinematic lighting';

/** Source attribution line for PROMPT_BANK_SOURCES.md. */
export const LIGHTING_SOURCES = [
  'belentani7/cinematic-prompt-formatter (MIT) — Lighting',
  'thesephist gist "Collection of useful Stable Diffusion prompt modifiers" — Lighting',
  'willwulfken/MidJourney-Styles-and-Keywords-Reference (fork kalelqs/midjourney-styles-and-keywords-reference) — Style Pages/Lighting.md',
  'realaman90/ai-film-skills nano-banana.md — "Design your lighting"',
];
