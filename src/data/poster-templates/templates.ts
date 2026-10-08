/**
 * Etch Poster Studio — original template catalog.
 *
 * Every template is an ORIGINAL design: a prompt blueprint + style spec that
 * encodes professional flyer/poster design patterns (bold condensed display
 * type, high-contrast color blocking, 4:5 portrait composition, sticker
 * badges, minimal-text discipline). No template copies any existing poster.
 *
 * Text discipline: AI image models garble long text, so every template keeps
 * to headline + one short line + badge + CTA. The composer renders these as
 * quoted exact-text instructions in the prompt.
 */

export interface PosterField {
  key: string;
  label: string;
  default: string;
  maxLength: number;
  multiline?: boolean;
}

export interface PosterPalette {
  id: string;
  name: string;
  /** Prompt-ready color direction, e.g. "deep charcoal black background with electric lime-green accents" */
  prompt: string;
  /** UI swatch colors for the palette picker */
  swatches: [string, string];
}

export interface PosterTemplate {
  id: string;
  name: string;
  category: PosterCategory;
  aspectRatio: "4:5";
  /** Public thumbnail path, e.g. /pro/poster-templates/food-burger-blast.jpg */
  thumbnail: string;
  tagline: string;
  fields: PosterField[];
  palettes: PosterPalette[];
  /** The visual subject/scene for the hero area */
  hero: string;
  /** Layout + typography direction appended to the prompt */
  style: string;
}

export type PosterCategory =
  | "Food & Drink"
  | "Events"
  | "Sale"
  | "Fashion"
  | "Real Estate"
  | "Fitness"
  | "Beauty"
  | "Business"
  | "Travel"
  | "Education";

export const POSTER_CATEGORIES: PosterCategory[] = [
  "Food & Drink",
  "Events",
  "Sale",
  "Fashion",
  "Real Estate",
  "Fitness",
  "Beauty",
  "Business",
  "Travel",
  "Education",
];

const FIELD_HEADLINE = (def: string, maxLength = 22): PosterField => ({
  key: "headline",
  label: "Headline",
  default: def,
  maxLength,
});
const FIELD_SUBTEXT = (def: string): PosterField => ({
  key: "subtext",
  label: "Supporting line",
  default: def,
  maxLength: 64,
});
const FIELD_BADGE = (def: string): PosterField => ({
  key: "badge",
  label: "Badge / sticker",
  default: def,
  maxLength: 14,
});
const FIELD_CTA = (def: string): PosterField => ({
  key: "cta",
  label: "Call to action",
  default: def,
  maxLength: 22,
});
const FIELD_DATE = (def: string): PosterField => ({
  key: "date",
  label: "Date",
  default: def,
  maxLength: 20,
});

export const POSTER_TEMPLATES: PosterTemplate[] = [
  {
    id: "food-burger-blast",
    name: "Burger Blast",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-burger-blast.jpg",
    tagline: "Appetizing hero shot with a bold discount sticker",
    fields: [
      FIELD_HEADLINE("BURGER BLAST"),
      FIELD_SUBTEXT("Juicy. Cheesy. Unmissable."),
      FIELD_BADGE("50% OFF"),
      FIELD_CTA("ORDER NOW"),
    ],
    palettes: [
      {
        id: "ember",
        name: "Ember",
        prompt: "fiery red-orange gradient background with deep charcoal vignette, golden-yellow accents",
        swatches: ["#E63900", "#FFB300"],
      },
      {
        id: "smoke",
        name: "Smokehouse",
        prompt: "dark smoky charcoal-black background with warm amber glow accents",
        swatches: ["#1A1A1A", "#F59E0B"],
      },
      {
        id: "fresh",
        name: "Fresh Green",
        prompt: "vivid fresh-green background with crisp white accents",
        swatches: ["#16A34A", "#FFFFFF"],
      },
    ],
    hero: "a towering gourmet cheeseburger with melting cheese pull, sesame bun, fresh lettuce and tomato, dramatic appetizing food photography, steam rising",
    style:
      "Headline in huge bold condensed uppercase sans-serif across the upper third. Circular discount sticker badge overlapping the hero image. Bottom CTA pill bar. High-contrast commercial food-ad energy.",
  },
  {
    id: "food-cafe-morning",
    name: "Café Morning",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-cafe-morning.jpg",
    tagline: "Warm café promo with elegant script accent",
    fields: [
      FIELD_HEADLINE("Morning Brew"),
      FIELD_SUBTEXT("Fresh coffee, baked daily."),
      FIELD_BADGE("NEW"),
      FIELD_CTA("VISIT US"),
    ],
    palettes: [
      {
        id: "latte",
        name: "Latte",
        prompt: "warm cream background with rich espresso-brown accents and soft golden light",
        swatches: ["#F5EFE6", "#5C3D2E"],
      },
      {
        id: "forest",
        name: "Forest",
        prompt: "deep forest-green background with cream and brass-gold accents",
        swatches: ["#1E3A2F", "#E9DCC3"],
      },
      {
        id: "terracotta",
        name: "Terracotta",
        prompt: "warm terracotta background with cream accents",
        swatches: ["#C96F4A", "#FAF3E8"],
      },
    ],
    hero: "a beautiful latte with heart-shaped latte art in a ceramic cup on a rustic wooden table, croissant beside it, soft morning window light, cozy café atmosphere",
    style:
      "Headline mixing elegant script lettering with a clean serif. Small round NEW sticker badge. Airy, premium café aesthetic with generous whitespace around the hero.",
  },
  {
    id: "food-bakery-sweet",
    name: "Sweet Bakery",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-bakery-sweet.jpg",
    tagline: "Playful bakery poster with a sweet sticker badge",
    fields: [
      FIELD_HEADLINE("Sweet Treats"),
      FIELD_SUBTEXT("Baked fresh every morning."),
      FIELD_BADGE("YUM!"),
      FIELD_CTA("ORDER TODAY"),
    ],
    palettes: [
      {
        id: "strawberry",
        name: "Strawberry",
        prompt: "soft strawberry-pink background with cream and chocolate-brown accents",
        swatches: ["#F9A8D4", "#FFF7ED"],
      },
      {
        id: "mint",
        name: "Mint",
        prompt: "fresh mint-green background with cream accents",
        swatches: ["#A7F3D0", "#FFFBEB"],
      },
      {
        id: "choco",
        name: "Choco",
        prompt: "rich chocolate-brown background with caramel-gold accents",
        swatches: ["#4A2C1A", "#FBBF24"],
      },
    ],
    hero: "an irresistible cupcake with swirled pink frosting and sprinkles beside a stack of cookies, playful appetizing bakery photography, soft studio light",
    style:
      "Rounded friendly bold headline lettering. Starburst sticker badge. Cheerful, sweet-shop energy with a clean bottom CTA bar.",
  },
  {
    id: "event-music-night",
    name: "Neon Music Night",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-music-night.jpg",
    tagline: "Dark gig poster with neon headline and big date",
    fields: [
      FIELD_HEADLINE("MUSIC NIGHT"),
      FIELD_SUBTEXT("Live on stage, one night only."),
      FIELD_DATE("25 NOV · 7 PM"),
      FIELD_CTA("BOOK TICKETS"),
    ],
    palettes: [
      {
        id: "ultraviolet",
        name: "Ultraviolet",
        prompt: "pitch-black background with electric purple and magenta neon glow",
        swatches: ["#0A0A0A", "#A855F7"],
      },
      {
        id: "laser",
        name: "Laser Red",
        prompt: "pitch-black background with intense red-orange neon glow",
        swatches: ["#0A0A0A", "#EF4444"],
      },
      {
        id: "ice",
        name: "Ice Blue",
        prompt: "deep midnight-navy background with icy cyan neon glow",
        swatches: ["#0B1026", "#22D3EE"],
      },
    ],
    hero: "a silhouetted guitarist on a dark concert stage bathed in dramatic neon stage lights, crowd hands in the foreground, cinematic music photography",
    style:
      "Massive condensed uppercase headline glowing like a neon sign. Oversized date numerals as a design element. High-energy nightlife poster, bottom ticket CTA bar.",
  },
  {
    id: "event-dj-rave",
    name: "DJ Rave",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-dj-rave.jpg",
    tagline: "High-voltage club flyer, electric on black",
    fields: [
      FIELD_HEADLINE("RUSH NIGHT"),
      FIELD_SUBTEXT("DJ line-up till late."),
      FIELD_DATE("SAT · 10 PM"),
      FIELD_CTA("GET PASSES"),
    ],
    palettes: [
      {
        id: "volt",
        name: "Volt",
        prompt: "pure black background with electric lime-green accents",
        swatches: ["#000000", "#A3E635"],
      },
      {
        id: "magma",
        name: "Magma",
        prompt: "pure black background with hot orange-red accents",
        swatches: ["#000000", "#F97316"],
      },
      {
        id: "cyber",
        name: "Cyber",
        prompt: "pure black background with vivid cyan and magenta accents",
        swatches: ["#000000", "#06B6D4"],
      },
    ],
    hero: "a DJ at glowing turntables in a dark club, laser beams cutting through haze, ecstatic crowd, explosive electronic-music energy",
    style:
      "Slanted, aggressive condensed headline with motion energy. Sharp diagonal composition. Sticker date chip. Raw club-flyer intensity.",
  },
  {
    id: "event-grand-opening",
    name: "Grand Opening",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-grand-opening.jpg",
    tagline: "Festive launch poster with ribbon badge",
    fields: [
      FIELD_HEADLINE("GRAND OPENING"),
      FIELD_SUBTEXT("Celebrate with us — special launch offers."),
      FIELD_DATE("1 DEC · 11 AM"),
      FIELD_CTA("JOIN US"),
    ],
    palettes: [
      {
        id: "royal",
        name: "Royal",
        prompt: "deep royal-purple background with gold accents and festive confetti",
        swatches: ["#4C1D95", "#FBBF24"],
      },
      {
        id: "crimson",
        name: "Crimson",
        prompt: "rich crimson-red background with gold accents and festive confetti",
        swatches: ["#991B1B", "#FDE68A"],
      },
      {
        id: "emerald",
        name: "Emerald",
        prompt: "deep emerald-green background with gold accents and festive confetti",
        swatches: ["#065F46", "#FCD34D"],
      },
    ],
    hero: "a festive storefront entrance decorated with a grand-opening ribbon, golden confetti falling, warm celebratory light",
    style:
      "Elegant bold headline with a gold ribbon-style GRAND badge. Confetti texture. Premium launch-event feel, date chip and CTA bar at the bottom.",
  },
  {
    id: "sale-mega-discount",
    name: "Mega Sale",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-mega-discount.jpg",
    tagline: "Giant discount numeral as the hero",
    fields: [
      FIELD_HEADLINE("MEGA SALE"),
      { key: "discount", label: "Discount", default: "70% OFF", maxLength: 12 },
      FIELD_SUBTEXT("Everything must go."),
      FIELD_CTA("SHOP NOW"),
    ],
    palettes: [
      {
        id: "alert",
        name: "Alert",
        prompt: "bold red background with bright yellow accents",
        swatches: ["#DC2626", "#FDE047"],
      },
      {
        id: "midnight",
        name: "Midnight",
        prompt: "deep black background with hot-pink and yellow accents",
        swatches: ["#111111", "#EC4899"],
      },
      {
        id: "royal",
        name: "Royal",
        prompt: "royal-blue background with white and gold accents",
        swatches: ["#1D4ED8", "#FBBF24"],
      },
    ],
    hero: "explosive starburst shapes and dynamic sale graphics radiating behind a giant discount numeral, high-energy retail poster",
    style:
      "The discount numeral IS the hero — enormous, dominating the center. Starburst badge shapes. Urgent, loud, unmissable sale energy. CTA bar along the bottom.",
  },
  {
    id: "fashion-new-drop",
    name: "New Drop",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-new-drop.jpg",
    tagline: "Editorial fashion drop with sticker badge",
    fields: [
      FIELD_HEADLINE("NEW DROP"),
      FIELD_SUBTEXT("Limited pieces. When it's gone, it's gone."),
      FIELD_BADGE("FRESH"),
      FIELD_CTA("SHOP THE DROP"),
    ],
    palettes: [
      {
        id: "noir",
        name: "Noir",
        prompt: "minimal warm-grey studio background with black and off-white accents",
        swatches: ["#E7E5E4", "#111111"],
      },
      {
        id: "sand",
        name: "Sand",
        prompt: "warm sand-beige studio background with espresso-brown accents",
        swatches: ["#E8DCC8", "#3F2E1E"],
      },
      {
        id: "rose",
        name: "Rosé",
        prompt: "soft blush-pink studio background with deep maroon accents",
        swatches: ["#F9DCC4", "#7C2D12"],
      },
    ],
    hero: "a stylish model in contemporary streetwear against a clean studio backdrop, confident editorial fashion photography, soft directional light",
    style:
      "Tall elegant condensed headline, fashion-editorial spacing. Small round FRESH sticker. Minimal, premium streetwear-drop aesthetic.",
  },
  {
    id: "realestate-modern-villa",
    name: "Modern Villa",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-modern-villa.jpg",
    tagline: "Property showcase with feature checklist",
    fields: [
      FIELD_HEADLINE("Modern Villa"),
      FIELD_SUBTEXT("4 BHK · Prime location · Ready to move."),
      FIELD_BADGE("FOR SALE"),
      FIELD_CTA("BOOK A VISIT"),
    ],
    palettes: [
      {
        id: "estate",
        name: "Estate",
        prompt: "clean white background with deep navy-blue and gold accents",
        swatches: ["#FFFFFF", "#1E3A8A"],
      },
      {
        id: "forest",
        name: "Forest",
        prompt: "clean ivory background with deep green and bronze accents",
        swatches: ["#FAF7F0", "#14532D"],
      },
      {
        id: "graphite",
        name: "Graphite",
        prompt: "light warm-grey background with charcoal and amber accents",
        swatches: ["#F5F5F4", "#F59E0B"],
      },
    ],
    hero: "a stunning modern luxury villa at golden hour, glass facade glowing, landscaped garden, premium architectural photography",
    style:
      "Property photo dominating the upper half. Clean feature checklist with checkmark icons below. FOR SALE badge ribbon. Professional contact CTA bar at the bottom. Trustworthy, premium.",
  },
  {
    id: "fitness-gym-beast",
    name: "Beast Mode Gym",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-gym-beast.jpg",
    tagline: "High-energy gym poster, diagonal and bold",
    fields: [
      FIELD_HEADLINE("BEAST MODE"),
      FIELD_SUBTEXT("Train harder. No excuses."),
      FIELD_BADGE("JOIN NOW"),
      FIELD_CTA("START TODAY"),
    ],
    palettes: [
      {
        id: "iron",
        name: "Iron",
        prompt: "dark gunmetal-grey background with fiery orange accents",
        swatches: ["#1C1C1E", "#F97316"],
      },
      {
        id: "blood",
        name: "Blood",
        prompt: "black background with intense red accents",
        swatches: ["#000000", "#DC2626"],
      },
      {
        id: "steel",
        name: "Steel",
        prompt: "deep navy background with electric-blue accents",
        swatches: ["#0F172A", "#38BDF8"],
      },
    ],
    hero: "a powerful athlete mid-workout lifting a barbell in a dark industrial gym, dramatic rim lighting, sweat and intensity, sports photography",
    style:
      "Slanted aggressive condensed headline with forward motion. Diagonal compositional energy. Badge sticker. Raw motivational intensity, CTA bar at the bottom.",
  },
  {
    id: "beauty-salon-glow",
    name: "Glow Studio",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-salon-glow.jpg",
    tagline: "Elegant beauty poster, serif and soft light",
    fields: [
      FIELD_HEADLINE("Glow Studio"),
      FIELD_SUBTEXT("Radiance, perfected."),
      FIELD_BADGE("NEW"),
      FIELD_CTA("BOOK NOW"),
    ],
    palettes: [
      {
        id: "blush",
        name: "Blush",
        prompt: "soft blush-pink background with gold accents and dreamy soft light",
        swatches: ["#FCE7F3", "#B45309"],
      },
      {
        id: "pearl",
        name: "Pearl",
        prompt: "luminous pearl-white background with champagne-gold accents",
        swatches: ["#FDFBF7", "#A16207"],
      },
      {
        id: "noir",
        name: "Noir",
        prompt: "elegant black background with rose-gold accents and soft glow",
        swatches: ["#0C0A09", "#E8B4A0"],
      },
    ],
    hero: "a radiant woman's portrait with flawless glowing skin and soft beauty lighting, delicate flowers, luxurious salon aesthetic",
    style:
      "Refined serif headline with generous letter spacing. Delicate script accent. Small elegant NEW seal. Soft, luminous, premium beauty feel.",
  },
  {
    id: "business-agency-pro",
    name: "Agency Pro",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-agency-pro.jpg",
    tagline: "Clean corporate promo with feature list",
    fields: [
      FIELD_HEADLINE("Grow With Us"),
      FIELD_SUBTEXT("Marketing that delivers results."),
      FIELD_BADGE("PRO"),
      FIELD_CTA("GET STARTED"),
    ],
    palettes: [
      {
        id: "corporate",
        name: "Corporate",
        prompt: "clean white background with deep corporate-blue and slate accents",
        swatches: ["#FFFFFF", "#1E40AF"],
      },
      {
        id: "teal",
        name: "Teal",
        prompt: "clean light background with deep teal and charcoal accents",
        swatches: ["#F8FAFC", "#0F766E"],
      },
      {
        id: "slate",
        name: "Slate",
        prompt: "dark slate background with bright sky-blue accents",
        swatches: ["#0F172A", "#38BDF8"],
      },
    ],
    hero: "a modern office team collaborating around a table with laptops, bright professional corporate photography, confident business energy",
    style:
      "Split layout: headline band on top, photo middle, clean feature checklist with icons below. PRO badge. Trustworthy corporate CTA bar at the bottom.",
  },
  {
    id: "travel-wanderlust",
    name: "Wanderlust",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-wanderlust.jpg",
    tagline: "Dreamy destination poster with script accent",
    fields: [
      FIELD_HEADLINE("Wanderlust"),
      FIELD_SUBTEXT("Your next adventure awaits."),
      FIELD_BADGE("2026"),
      FIELD_CTA("BOOK NOW"),
    ],
    palettes: [
      {
        id: "sunset",
        name: "Sunset",
        prompt: "warm sunset gradient of orange, pink and purple across the sky",
        swatches: ["#FB923C", "#7C3AED"],
      },
      {
        id: "ocean",
        name: "Ocean",
        prompt: "vibrant tropical turquoise and deep-blue ocean tones",
        swatches: ["#22D3EE", "#1E3A8A"],
      },
      {
        id: "alpine",
        name: "Alpine",
        prompt: "crisp alpine morning with cool blues and warm golden light",
        swatches: ["#7FB2E5", "#FBBF24"],
      },
    ],
    hero: "a breathtaking tropical beach at sunset with palm silhouettes and a lone traveler walking the shoreline, epic wanderlust travel photography",
    style:
      "Dreamy script headline over the sky, clean sans-serif details below. Year sticker badge. Inspiring, cinematic travel-poster composition with the CTA pill at the bottom.",
  },
  {
    id: "edu-masterclass",
    name: "Masterclass",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-masterclass.jpg",
    tagline: "Clean course promo with date chip",
    fields: [
      FIELD_HEADLINE("Masterclass"),
      FIELD_SUBTEXT("Learn from the best, live."),
      FIELD_DATE("12 DEC · LIVE"),
      FIELD_CTA("RESERVE SEAT"),
    ],
    palettes: [
      {
        id: "ink",
        name: "Ink",
        prompt: "clean off-white background with deep ink-black and amber accents",
        swatches: ["#FAFAF9", "#F59E0B"],
      },
      {
        id: "indigo",
        name: "Indigo",
        prompt: "deep indigo background with white and gold accents",
        swatches: ["#312E81", "#FBBF24"],
      },
      {
        id: "paper",
        name: "Paper",
        prompt: "warm paper-cream background with forest-green and ink accents",
        swatches: ["#FEFCE8", "#166534"],
      },
    ],
    hero: "an inspiring speaker on a modern stage with a large screen behind, engaged audience silhouettes, professional event photography",
    style:
      "Bold confident headline, prominent date chip as a design element. Clean structured layout with clear hierarchy. Knowledgeable, premium learning-event feel.",
  },
];

export function templateById(id: string): PosterTemplate | undefined {
  return POSTER_TEMPLATES.find((t) => t.id === id);
}

export function templatesByCategory(category: PosterCategory): PosterTemplate[] {
  return POSTER_TEMPLATES.filter((t) => t.category === category);
}
