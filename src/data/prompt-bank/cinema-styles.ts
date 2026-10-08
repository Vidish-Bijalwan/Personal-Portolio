/**
 * Etch — cinema-grade prompt bank: cinema styles.
 *
 * Vocabulary drawn from (short fragments only, attributed; see
 * PROMPT_BANK_SOURCES.md):
 *  - belentani7/cinematic-prompt-formatter (MIT) — Mood/Atmosphere,
 *    Color Grading, Presets sections
 *  - thesephist gist "Collection of useful Stable Diffusion prompt
 *    modifiers" — Vibes, Mood sections
 *  - realaman90/ai-film-skills nano-banana.md — Color & Mood, Genre Styles
 *
 * Fragment text is our own phrasing of these standard cinema terms;
 * no source text is reproduced wholesale.
 */
import type { CinemaStyle } from './types';

export const CINEMA_STYLES: CinemaStyle[] = [
  {
    id: 'noir',
    label: 'Film Noir',
    description: 'High-contrast black-and-white crime-drama look.',
    fragments: ['film noir', 'high-contrast black and white', 'deep shadows'],
    tags: [
      'noir',
      'detective',
      'crime',
      'mystery',
      'gangster',
      'black and white',
      'monochrome',
    ],
  },
  {
    id: 'cyberpunk',
    label: 'Cyberpunk',
    description: 'Neon-drenched futuristic city aesthetic.',
    fragments: ['cyberpunk', 'neon glow', 'futuristic city atmosphere'],
    tags: ['cyberpunk', 'neon', 'futuristic', 'sci-fi city', 'dystopia'],
  },
  {
    id: 'western',
    label: 'Western',
    description: 'Dusty frontier film look, warm earthy tones.',
    fragments: ['western film', 'dusty frontier atmosphere', 'warm earthy tones'],
    tags: ['western', 'cowboy', 'frontier', 'desert', 'saloon'],
  },
  {
    id: 'epic',
    label: 'Epic Blockbuster',
    description: 'Grand-scale Hollywood blockbuster cinematography.',
    fragments: [
      'epic blockbuster cinematography',
      'grand scale',
      'dramatic atmosphere',
    ],
    tags: ['epic', 'grand', 'monumental', 'blockbuster', 'colossal'],
  },
  {
    id: 'indie',
    label: 'Indie Drama',
    description: 'Naturalistic independent-film aesthetic, muted tones.',
    fragments: ['indie film aesthetic', 'naturalistic lighting', 'muted tones'],
    tags: ['indie', 'a24', 'arthouse', 'art house', 'drama film'],
  },
  {
    id: 'horror',
    label: 'Horror',
    description: 'Unsettling low-key horror cinematography.',
    fragments: ['horror film', 'unsettling atmosphere', 'low-key lighting'],
    tags: ['horror', 'scary', 'haunted', 'creepy', 'ghost'],
  },
  {
    id: 'romance',
    label: 'Romance',
    description: 'Soft, warm, dreamy romantic look.',
    fragments: ['romantic', 'soft warm glow', 'dreamy atmosphere'],
    tags: ['romantic', 'romance', 'love', 'wedding', 'dreamy'],
  },
  {
    id: 'documentary',
    label: 'Documentary',
    description: 'Candid, available-light documentary photography.',
    fragments: ['documentary photography', 'candid, unposed', 'available light'],
    tags: [
      'documentary',
      'candid',
      'photojournalism',
      'street photography',
      'decisive moment',
    ],
  },
  {
    id: 'vintage',
    label: 'Vintage Film',
    description: 'Faded, warm nostalgic film look.',
    fragments: ['vintage film look', 'faded warm tones', 'nostalgic atmosphere'],
    tags: ['vintage', 'retro', 'nostalgic', '1970s', '1980s', '70s', '80s'],
  },
  {
    id: 'anime',
    label: 'Anime',
    description: 'Vibrant anime illustration style.',
    fragments: ['anime style', 'vibrant palette'],
    tags: ['anime', 'manga', 'ghibli'],
    illustrative: true,
  },
  {
    id: 'editorial',
    label: 'Fashion Editorial',
    description: 'High-end magazine editorial styling and light.',
    fragments: ['fashion editorial', 'high-end studio lighting', 'bold styling'],
    tags: ['fashion', 'editorial', 'model', 'magazine', 'runway'],
  },
  {
    id: 'commercial',
    label: 'Commercial / Product',
    description: 'Premium advertising look with crisp hero lighting.',
    fragments: [
      'premium commercial photography',
      'crisp hero lighting',
      'luxury aesthetic',
    ],
    tags: ['product', 'advertisement', 'commercial', 'brand', 'ad campaign'],
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    description: 'Magical, ethereal fantasy-film atmosphere.',
    fragments: ['fantasy film', 'magical atmosphere', 'ethereal glow'],
    tags: ['fantasy', 'magical', 'fairy', 'enchanted', 'mythical'],
  },
  {
    id: 'thriller',
    label: 'Thriller',
    description: 'Tense, dramatic low-key thriller cinematography.',
    fragments: ['thriller', 'tense atmosphere', 'dramatic low-key lighting'],
    tags: ['thriller', 'suspense', 'tension', 'spy', 'espionage'],
  },
  {
    id: 'surreal',
    label: 'Surreal',
    description: 'Dreamlike, otherworldly surreal imagery.',
    fragments: ['surreal', 'dreamlike', 'otherworldly atmosphere'],
    tags: ['surreal', 'surrealist', 'dreamlike', 'dreamscape', 'absurd'],
  },
  {
    id: 'steampunk',
    label: 'Steampunk',
    description: 'Victorian-era industrial tech aesthetic.',
    fragments: ['steampunk', 'victorian industrial', 'brass and gears'],
    tags: ['steampunk', 'victorian tech', 'dieselpunk'],
  },
];

/**
 * Fallback fragments applied when no cinema style matched the prompt —
 * a neutral cinema-grade foundation that contradicts nothing.
 */
export const DEFAULT_CINEMA_FRAGMENTS: string[] = [
  'cinematic film still',
  'professional color grading',
];

/** Source attribution line for PROMPT_BANK_SOURCES.md. */
export const CINEMA_STYLES_SOURCES = [
  'belentani7/cinematic-prompt-formatter (MIT) — Mood/Atmosphere, Color Grading, Presets',
  'thesephist gist "Collection of useful Stable Diffusion prompt modifiers" — Vibes, Mood',
  'realaman90/ai-film-skills nano-banana.md — Color & Mood, Genre Styles',
];
