/**
 * Honest marquee categories — real creation types Etch makes.
 * Pure module so honesty gates can import it without pulling in TSX.
 *
 * Standing rule: no fake stats, reviews, customers, or activity. No person
 * names, no "X just generated Y", no invented counts — categories only.
 */
export const MARQUEE_CATEGORIES = [
  "AI product ads",
  "Neon portraits",
  "Movie posters",
  "5-second clips",
  "Food photography",
  "Fashion editorials",
  "Travel posters",
  "Pet portraits",
  "Photo retouching",
  "Concept art",
  "Character art",
  "Ad creatives",
  "Studio portraits",
  "Cinematic stills",
] as const;

export const MARQUEE_ACCENTS = ["#D7FF3F", "#00F0FF", "#FF2D78"] as const;
