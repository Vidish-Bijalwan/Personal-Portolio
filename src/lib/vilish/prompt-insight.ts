/**
 * Prompt insight — an honest, keyword-based read of what a generation
 * prompt is asking for. Powers the watch room's "While you wait" panel.
 *
 * Deliberately small and conservative: it only reports what the prompt
 * literally contains. No LLM, no guessing — prompts that match nothing
 * get an empty style list, no mood, and the "your idea" subject fallback.
 */

export interface PromptInsight {
  /** First meaningful words of the prompt (stopwords + style/mood words stripped). */
  subject: string;
  /** Detected style labels, in keyword-list order. Never invented. */
  styles: string[];
  /** First detected mood label, or null. */
  mood: string | null;
}

const STYLE_KEYWORDS: Array<[RegExp, string]> = [
  [/\bcinematic\b/i, "Cinematic"],
  [/\banime\b/i, "Anime"],
  [/\bphotoreal(istic)?\b/i, "Photoreal"],
  [/\bphotograph(y|ic)?\b/i, "Photo"],
  [/\bphoto\b/i, "Photo"],
  [/\boil painting\b/i, "Oil painting"],
  [/\bcyberpunk\b/i, "Cyberpunk"],
  [/\bneon\b/i, "Neon"],
  [/\bportrait\b/i, "Portrait"],
  [/\blandscape\b/i, "Landscape"],
  [/\b3d render\b/i, "3D render"],
  [/\bwatercolou?r\b/i, "Watercolor"],
  [/\bdigital art\b/i, "Digital art"],
];

const MOOD_KEYWORDS: Array<[RegExp, string]> = [
  [/\bdramatic\b/i, "Dramatic"],
  [/\bcozy\b|\bcosy\b/i, "Cozy"],
  [/\bepic\b/i, "Epic"],
  [/\bminimal(ist|istic)?\b/i, "Minimal"],
  [/\bdark\b/i, "Dark"],
  [/\bvibrant\b/i, "Vibrant"],
  [/\bmoody\b/i, "Moody"],
  [/\bdreamy\b/i, "Dreamy"],
];

/** Words that carry no meaning for the subject line. */
const STOPWORDS = new Set([
  "a", "an", "the", "of", "in", "on", "with", "and", "or", "for", "to",
  "at", "by", "from", "as", "is", "are", "was", "were", "be", "been",
  "it", "its", "this", "that", "these", "those", "my", "me", "please",
  "make", "makes", "create", "creates", "generate", "generates", "draw",
  "image", "picture", "show", "showing", "very", "really", "just", "like",
  "into", "out", "over", "under", "between", "through", "during",
]);

/** Lowercase tokens already "consumed" by style/mood detection. */
const CONSUMED = new Set([
  "cinematic", "anime", "photoreal", "photorealistic", "photo", "photograph",
  "photography", "oil", "painting", "cyberpunk", "neon", "portrait",
  "landscape", "3d", "render", "watercolor", "watercolour", "digital", "art",
  "dramatic", "cozy", "cosy", "epic", "minimal", "minimalist", "minimalistic",
  "dark", "vibrant", "moody", "dreamy",
]);

export function promptInsight(prompt: string | null | undefined): PromptInsight {
  const text = (prompt ?? "").trim();

  const styles: string[] = [];
  for (const [re, label] of STYLE_KEYWORDS) {
    if (re.test(text) && !styles.includes(label)) styles.push(label);
  }

  let mood: string | null = null;
  for (const [re, label] of MOOD_KEYWORDS) {
    if (re.test(text)) {
      mood = label;
      break;
    }
  }

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w) && !CONSUMED.has(w));

  const subject = words.slice(0, 5).join(" ") || "your idea";
  return { subject, styles, mood };
}
