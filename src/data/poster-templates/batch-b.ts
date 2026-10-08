/**
 * Etch Poster Studio — Batch B template catalog (coder WS2b).
 *
 * 45 ORIGINAL templates: 15 Sale, 15 Fashion, 15 Fitness.
 * Each is a prompt blueprint + style spec following the print-flyer discipline:
 * bold condensed display type, high-contrast color blocking, 4:5 portrait,
 * sticker badges, minimal-text discipline (headline + one line + badge + CTA).
 * No template copies any existing poster design.
 */

import type { PosterTemplate } from "./templates";

const H = (def: string): PosterTemplate["fields"][number] => ({
  key: "headline",
  label: "Headline",
  default: def,
  maxLength: 22,
});
const S = (def: string): PosterTemplate["fields"][number] => ({
  key: "subtext",
  label: "Supporting line",
  default: def,
  maxLength: 64,
});
const B = (def: string): PosterTemplate["fields"][number] => ({
  key: "badge",
  label: "Badge / sticker",
  default: def,
  maxLength: 14,
});
const C = (def: string): PosterTemplate["fields"][number] => ({
  key: "cta",
  label: "Call to action",
  default: def,
  maxLength: 22,
});

export const BATCH_B: PosterTemplate[] = [
  // ───────────────────────── SALE (15) ─────────────────────────
  {
    id: "sale-clearance-crash",
    name: "Clearance Crash",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-clearance-crash.jpg",
    tagline: "Warehouse clearance with caution-tape energy",
    fields: [
      H("CLEARANCE CRASH"),
      S("Final pieces at rock-bottom prices."),
      B("LAST CALL"),
      C("HURRY IN"),
    ],
    palettes: [
      {
        id: "hazard",
        name: "Hazard",
        prompt: "black background with yellow caution-tape stripes and hazard chevrons",
        swatches: ["#111111", "#FACC15"],
      },
      {
        id: "siren",
        name: "Siren",
        prompt: "intense signal-red background with crisp white impact accents",
        swatches: ["#DC2626", "#FFFFFF"],
      },
    ],
    hero: "a dim warehouse aisle with stacked clearance boxes and fluttering red sale tags, dramatic spotlight beams cutting through dust",
    style:
      "Brutalist stacked headline slammed across the top. Diagonal caution-tape band carrying the badge sticker. Torn-paper price tags scattered over the hero. Bottom CTA bar.",
  },
  {
    id: "sale-festive-offer",
    name: "Festive Offer",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-festive-offer.jpg",
    tagline: "Warm celebration sale with lantern glow",
    fields: [
      H("FESTIVE OFFER"),
      S("Celebrate big, save bigger."),
      B("UP TO 40%"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "marigold",
        name: "Marigold",
        prompt: "deep maroon background with glowing marigold-gold accents and soft lantern bokeh",
        swatches: ["#7F1D1D", "#FBBF24"],
      },
      {
        id: "emerald",
        name: "Emerald",
        prompt: "rich emerald-green background with warm gold accents and festive sparkle",
        swatches: ["#065F46", "#FCD34D"],
      },
    ],
    hero: "a festive Indian market street at dusk strung with glowing lanterns, shoppers carrying colorful shopping bags, warm golden bokeh",
    style:
      "Graceful bold headline with a gold-foil badge. Lantern-glow gradient washing the hero. Pure celebration, no clutter. CTA pill glowing at the bottom.",
  },
  {
    id: "sale-flash-48h",
    name: "Flash 48 Hours",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-flash-48h.jpg",
    tagline: "Lightning-fast sale with a countdown chip",
    fields: [
      H("FLASH SALE"),
      S("48 hours only. Blink and miss."),
      B("48 HRS"),
      C("GRAB NOW"),
    ],
    palettes: [
      {
        id: "volt",
        name: "Volt",
        prompt: "pure black background with electric lime-green lightning accents",
        swatches: ["#000000", "#A3E635"],
      },
      {
        id: "storm",
        name: "Storm",
        prompt: "deep navy-black background with vivid cyan electric accents",
        swatches: ["#0B1026", "#22D3EE"],
      },
    ],
    hero: "a jagged lightning bolt tearing through the air above flying shopping bags, frozen mid-explosion, speed lines radiating outward",
    style:
      "Slanted, speed-blurred headline with motion streaks. Bold countdown chip badge. Diagonal composition with explosive forward energy. CTA bar with electric glow.",
  },
  {
    id: "sale-bogo-blast",
    name: "BOGO Blast",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-bogo-blast.jpg",
    tagline: "Twin-product offer with playful duplication",
    fields: [
      H("BUY 1 GET 1"),
      S("Double the joy, same price."),
      B("BOGO"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "duo",
        name: "Duo",
        prompt: "vivid coral background with teal accents",
        swatches: ["#F97362", "#0D9488"],
      },
      {
        id: "candy",
        name: "Candy",
        prompt: "hot-pink background with crisp white and sunny yellow accents",
        swatches: ["#EC4899", "#FDE047"],
      },
    ],
    hero: "two identical gift boxes side by side, one bursting open with confetti while the other wears a gift ribbon, playful product-ad energy",
    style:
      "Headline split across two stacked blocks — BUY 1 / GET 1 — the hero twinning the products. Starburst BOGO sticker. Bouncy, cheerful retail pop.",
  },
  {
    id: "sale-season-finale",
    name: "Season Finale",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-season-finale.jpg",
    tagline: "End-of-season wardrobe sale, wistful autumn",
    fields: [
      H("SEASON FINALE"),
      S("Last styles of the season."),
      B("UP TO 60%"),
      C("SHOP LAST CALL"),
    ],
    palettes: [
      {
        id: "autumn",
        name: "Autumn",
        prompt: "burnt-rust background with cream and drifting golden-leaf accents",
        swatches: ["#9A3412", "#FEF3C7"],
      },
      {
        id: "dusk",
        name: "Dusk",
        prompt: "deep plum background with golden-hour amber accents",
        swatches: ["#4A1942", "#F59E0B"],
      },
    ],
    hero: "a clothing rail of autumn garments with golden leaves drifting past, soft window light, a half-empty stylish boutique",
    style:
      "Elegant tall condensed headline over the hero. Falling-leaf texture. Percentage badge as a wax-seal sticker. Cream-on-dark CTA bar.",
  },
  {
    id: "sale-opening-deals",
    name: "Opening Deals",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-opening-deals.jpg",
    tagline: "New-store launch with ribbon-cutting joy",
    fields: [
      H("NOW OPEN"),
      S("Opening-week deals inside."),
      B("NEW STORE"),
      C("VISIT US"),
    ],
    palettes: [
      {
        id: "grand",
        name: "Grand",
        prompt: "bold crimson background with gold ribbon accents and frozen confetti",
        swatches: ["#991B1B", "#FDE68A"],
      },
      {
        id: "aqua",
        name: "Aqua",
        prompt: "fresh teal background with cream and coral accents",
        swatches: ["#0F766E", "#FED7AA"],
      },
    ],
    hero: "a cheerful storefront with a giant red ribbon stretched across the entrance, golden scissors, confetti frozen mid-air",
    style:
      "Headline on a ribbon banner across the top. NEW STORE badge shaped like a rosette. Confetti texture over the hero. Welcoming CTA bar at the bottom.",
  },
  {
    id: "sale-exchange-mela",
    name: "Exchange Mela",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-exchange-mela.jpg",
    tagline: "Old-for-new swap fest with circular motion",
    fields: [
      H("EXCHANGE MELA"),
      S("Bring old, take home new."),
      B("EXCHANGE"),
      C("LEARN MORE"),
    ],
    palettes: [
      {
        id: "recycle",
        name: "Recycle",
        prompt: "fresh leaf-green background with crisp white accents",
        swatches: ["#16A34A", "#FFFFFF"],
      },
      {
        id: "trade",
        name: "Trade",
        prompt: "warm orange background with deep charcoal accents",
        swatches: ["#EA580C", "#1C1917"],
      },
    ],
    hero: "old and new home appliances swapping places inside a ring of circular arrows, upbeat motion, clean studio backdrop",
    style:
      "Headline arched over a circular-arrow motif. EXCHANGE sticker badge at the ring's center. Playful swap arrows. Informative CTA bar below.",
  },
  {
    id: "sale-member-club",
    name: "Member Club",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-member-club.jpg",
    tagline: "VIP loyalty offer with gold-card prestige",
    fields: [
      H("MEMBERS SAVE"),
      S("Exclusive deals for club members."),
      B("VIP"),
      C("JOIN FREE"),
    ],
    palettes: [
      {
        id: "noirgold",
        name: "Noir Gold",
        prompt: "elegant black background with champagne-gold accents and dark velvet texture",
        swatches: ["#0C0A09", "#D4AF37"],
      },
      {
        id: "platinum",
        name: "Platinum",
        prompt: "deep charcoal background with silver-platinum accents",
        swatches: ["#1F2937", "#C0C7D1"],
      },
    ],
    hero: "a premium gold membership card resting on dark velvet with a velvet rope and soft spotlight, luxury club atmosphere",
    style:
      "Serif-tinged bold headline, letter-spaced. VIP seal badge in gold foil. Dark, restrained luxury. Thin gold CTA bar at the bottom.",
  },
  {
    id: "sale-diwali-dhamaka",
    name: "Diwali Dhamaka",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-diwali-dhamaka.jpg",
    tagline: "Firecracker sale with night-sky fireworks",
    fields: [
      H("DIWALI DHAMAKA"),
      S("Cracker deals on everything."),
      B("UP TO 70%"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "firecracker",
        name: "Firecracker",
        prompt: "deep midnight-indigo night sky with golden firework bursts and diya glow",
        swatches: ["#1E1B4B", "#FBBF24"],
      },
      {
        id: "sparkle",
        name: "Sparkle",
        prompt: "rich crimson night background with sparkling gold and marigold accents",
        swatches: ["#7F1D1D", "#FCD34D"],
      },
    ],
    hero: "a night sky exploding with golden fireworks above a festive street of diyas and shopping stalls, reflections on wet pavement",
    style:
      "Headline glowing like sparklers across the top. Firework-burst badge. Diya-glow vignette. Loud, joyous CTA bar at the bottom.",
  },
  {
    id: "sale-monsoon-madness",
    name: "Monsoon Madness",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-monsoon-madness.jpg",
    tagline: "Rainy-day sale with splash energy",
    fields: [
      H("MONSOON MADNESS"),
      S("Rainy-day deals pouring down."),
      B("RAINY SALE"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "downpour",
        name: "Downpour",
        prompt: "stormy slate-blue background with bright rain-streak accents and puddle reflections",
        swatches: ["#334155", "#7DD3FC"],
      },
      {
        id: "cloudburst",
        name: "Cloudburst",
        prompt: "deep teal background with sunny yellow umbrella accents",
        swatches: ["#0F766E", "#FDE047"],
      },
    ],
    hero: "a rain-slicked city street with colorful umbrellas and splash crowns around shopping bags, dramatic rain streaks",
    style:
      "Headline with rain-streak texture running through it. Umbrella-shaped badge. Splash graphics. Cozy-yet-urgent CTA bar.",
  },
  {
    id: "sale-anniversary-bash",
    name: "Anniversary Bash",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-anniversary-bash.jpg",
    tagline: "Store birthday with golden celebration",
    fields: [
      H("ANNIVERSARY BASH"),
      S("Thanks for 10 amazing years."),
      B("10TH YEAR"),
      C("CELEBRATE WITH US"),
    ],
    palettes: [
      {
        id: "goldrush",
        name: "Gold Rush",
        prompt: "rich black background with lavish gold confetti and balloon accents",
        swatches: ["#111111", "#FBBF24"],
      },
      {
        id: "cakeglow",
        name: "Cake Glow",
        prompt: "soft blush-pink background with gold candle-glow accents",
        swatches: ["#FBCFE8", "#B45309"],
      },
    ],
    hero: "a golden trophy and champagne coupe on a store counter wrapped in celebration bunting, confetti rain, warm party light",
    style:
      "Headline in gold-foil lettering. Anniversary seal badge. Balloon-and-confetti texture. Festive CTA bar with party energy.",
  },
  {
    id: "sale-student-deals",
    name: "Student Deals",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-student-deals.jpg",
    tagline: "Campus discount with notebook-doodle charm",
    fields: [
      H("STUDENT DEALS"),
      S("Extra 15% off with student ID."),
      B("WITH ID"),
      C("VERIFY & SAVE"),
    ],
    palettes: [
      {
        id: "campus",
        name: "Campus",
        prompt: "collegiate navy background with golden-yellow accents and chalkboard texture",
        swatches: ["#1E3A8A", "#FACC15"],
      },
      {
        id: "notebook",
        name: "Notebook",
        prompt: "fresh paper-cream background with green highlighter and hand-drawn doodle accents",
        swatches: ["#FEFCE8", "#16A34A"],
      },
    ],
    hero: "a college desk collage of books, backpack, headphones and doodled price tags, bright youthful flat-lay energy",
    style:
      "Headline in bold marker-style lettering. Badge like a stamped ID card. Doodle arrows and highlighter marks. Friendly CTA bar.",
  },
  {
    id: "sale-combo-chaos",
    name: "Combo Chaos",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-combo-chaos.jpg",
    tagline: "Bundle offer bursting with product energy",
    fields: [
      H("COMBO CHAOS"),
      S("Bundle more, save more."),
      B("3 FOR 2"),
      C("BUILD YOUR COMBO"),
    ],
    palettes: [
      {
        id: "pop",
        name: "Pop",
        prompt: "hot magenta background with electric yellow accents",
        swatches: ["#D61C7E", "#FDE047"],
      },
      {
        id: "dynamite",
        name: "Dynamite",
        prompt: "vivid tangerine background with black impact accents",
        swatches: ["#F97316", "#111111"],
      },
    ],
    hero: "three gift boxes exploding open in a burst of products and confetti, freeze-frame chaos, dynamic radial composition",
    style:
      "Headline on a jagged burst shape. 3 FOR 2 sticker badge. Radial explosion lines. Loud, playful CTA bar.",
  },
  {
    id: "sale-refer-reward",
    name: "Refer & Reward",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-refer-reward.jpg",
    tagline: "Friend-referral offer with social warmth",
    fields: [
      H("REFER & REWARD"),
      S("Give ₹500, get ₹500."),
      B("₹500"),
      C("INVITE FRIENDS"),
    ],
    palettes: [
      {
        id: "friend",
        name: "Friend",
        prompt: "warm teal background with coral and cream accents",
        swatches: ["#0D9488", "#FB7185"],
      },
      {
        id: "gift",
        name: "Gift",
        prompt: "royal purple background with gold gift accents",
        swatches: ["#6D28D9", "#FBBF24"],
      },
    ],
    hero: "two friends high-fiving with smartphones and floating gift boxes between them, warm social energy, soft gradient sky",
    style:
      "Friendly rounded headline. ₹500 coin badge. Paper-plane and gift motifs. Warm, inviting CTA bar.",
  },
  {
    id: "sale-midnight-rush",
    name: "Midnight Rush",
    category: "Sale",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/sale-midnight-rush.jpg",
    tagline: "Late-night online sale with neon glow",
    fields: [
      H("MIDNIGHT RUSH"),
      S("Night-owl deals till 6 AM."),
      B("TILL 6 AM"),
      C("SHOP ALL NIGHT"),
    ],
    palettes: [
      {
        id: "moonlit",
        name: "Moonlit",
        prompt: "deep midnight-navy background with neon-blue glow and moonlight accents",
        swatches: ["#0B1026", "#38BDF8"],
      },
      {
        id: "neonnight",
        name: "Neon Night",
        prompt: "pitch-black background with hot magenta neon glow",
        swatches: ["#000000", "#F0ABFC"],
      },
    ],
    hero: "a glowing shopping cart racing along a neon-lit midnight city street under a full moon, long light trails",
    style:
      "Headline glowing like a neon sign. Clock-chip badge. Light-trail streaks. Late-night urgency in the CTA bar.",
  },
  // ───────────────────────── FASHION (15) ─────────────────────────
  {
    id: "fashion-street-rebel",
    name: "Street Rebel",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-street-rebel.jpg",
    tagline: "Raw streetwear look, graffiti attitude",
    fields: [
      H("STREET REBEL"),
      S("Raw fits for the city."),
      B("NEW"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "concrete",
        name: "Concrete",
        prompt: "gritty grey concrete background with black and signal-red accents",
        swatches: ["#57534E", "#EF4444"],
      },
      {
        id: "riot",
        name: "Riot",
        prompt: "pitch-black background with acid-green graffiti accents",
        swatches: ["#000000", "#A3E635"],
      },
    ],
    hero: "a confident model in oversized streetwear against a graffiti-covered wall, low-angle editorial shot, harsh flash light",
    style:
      "Aggressive condensed headline with graffiti-tag energy. Spray-paint NEW sticker. Raw urban edge, CTA bar like a sprayed stencil.",
  },
  {
    id: "fashion-ethnic-royal",
    name: "Ethnic Royal",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-ethnic-royal.jpg",
    tagline: "Regal festive wear with palace grandeur",
    fields: [
      H("ETHNIC ROYAL"),
      S("Heritage weaves, modern soul."),
      B("FESTIVE"),
      C("EXPLORE"),
    ],
    palettes: [
      {
        id: "regal",
        name: "Regal",
        prompt: "deep maroon background with intricate gold zari accents",
        swatches: ["#7F1D1D", "#D4AF37"],
      },
      {
        id: "peacock",
        name: "Peacock",
        prompt: "rich peacock-teal background with gold accents",
        swatches: ["#0F766E", "#FBBF24"],
      },
    ],
    hero: "a graceful model in a silk lehenga with gold embroidery standing in a palace archway, diyas glowing, regal portrait",
    style:
      "Ornamental serif headline with gold-foil feel. Festive seal badge. Jaali-pattern texture. Elegant CTA bar.",
  },
  {
    id: "fashion-sneaker-launch",
    name: "Sneaker Launch",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-sneaker-launch.jpg",
    tagline: "High-voltage sneaker drop",
    fields: [
      H("SNEAKER LAUNCH"),
      S("The drop everyone's waiting for."),
      B("NEW DROP"),
      C("COP YOURS"),
    ],
    palettes: [
      {
        id: "court",
        name: "Court",
        prompt: "clean white background with bold red and black accents",
        swatches: ["#FFFFFF", "#DC2626"],
      },
      {
        id: "streetnight",
        name: "Street Night",
        prompt: "dark asphalt-black background with neon-lime accents",
        swatches: ["#111111", "#A3E635"],
      },
    ],
    hero: "a bold sneaker floating above a pedestal with paint splatter exploding behind it, dramatic studio lighting",
    style:
      "Massive slanted headline with speed energy. NEW DROP burst badge. Paint-splatter texture. Hype-driven CTA bar.",
  },
  {
    id: "fashion-denim-fest",
    name: "Denim Fest",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-denim-fest.jpg",
    tagline: "Indigo-drenched denim celebration",
    fields: [
      H("DENIM FEST"),
      S("Every wash. Every fit."),
      B("2ND AT 50%"),
      C("SHOP DENIM"),
    ],
    palettes: [
      {
        id: "indigo",
        name: "Indigo",
        prompt: "deep indigo-denim background with white stitching accents",
        swatches: ["#1E3A8A", "#F5F5F4"],
      },
      {
        id: "rawdenim",
        name: "Raw Denim",
        prompt: "dark raw-denim background with amber leather-patch accents",
        swatches: ["#172554", "#D97706"],
      },
    ],
    hero: "a wall of stacked folded jeans in every wash with close-up stitching textures, indigo tones, tactile fabric detail",
    style:
      "Headline in stitched-patch lettering. Badge like a leather brand patch. Denim-weave texture. Rugged CTA bar.",
  },
  {
    id: "fashion-luxe-boutique",
    name: "Luxe Boutique",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-luxe-boutique.jpg",
    tagline: "Quiet-luxury boutique with marble calm",
    fields: [
      H("Luxe Edit"),
      S("Quiet luxury, curated for you."),
      B("PRIVATE"),
      C("BOOK APPOINTMENT"),
    ],
    palettes: [
      {
        id: "champagne",
        name: "Champagne",
        prompt: "soft champagne-cream background with muted gold accents and subtle marble texture",
        swatches: ["#F5EFE6", "#A16207"],
      },
      {
        id: "onyx",
        name: "Onyx",
        prompt: "elegant black background with silver-grey accents",
        swatches: ["#0C0A09", "#9CA3AF"],
      },
    ],
    hero: "a minimalist boutique rail with silk garments beside a marble pedestal holding a single handbag, soft gallery light",
    style:
      "Tall letter-spaced serif headline. PRIVATE wax-seal badge. Generous negative space. Whisper-quiet CTA line.",
  },
  {
    id: "fashion-thrift-hunt",
    name: "Thrift Hunt",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-thrift-hunt.jpg",
    tagline: "Vintage treasure hunt, playful retro",
    fields: [
      H("THRIFT HUNT"),
      S("Vintage gems from ₹99."),
      B("FROM ₹99"),
      C("DIG IN"),
    ],
    palettes: [
      {
        id: "retrorack",
        name: "Retro Rack",
        prompt: "mustard-yellow background with chocolate-brown vintage accents",
        swatches: ["#CA8A04", "#451A03"],
      },
      {
        id: "fleamarket",
        name: "Flea Market",
        prompt: "sage-green background with cream and terracotta accents",
        swatches: ["#6B7F59", "#E2725B"],
      },
    ],
    hero: "a packed vintage clothing rack with retro finds and polaroid photos pinned around it, warm flea-market light",
    style:
      "Headline in retro bubble letters. Price-tag badge. Polaroid and sticker texture. Playful, treasure-hunt CTA bar.",
  },
  {
    id: "fashion-bridal-aura",
    name: "Bridal Aura",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-bridal-aura.jpg",
    tagline: "Dreamy bridal couture with petal softness",
    fields: [
      H("BRIDAL AURA"),
      S("Your once-in-a-lifetime look."),
      B("COUTURE"),
      C("BOOK TRIAL"),
    ],
    palettes: [
      {
        id: "blushveil",
        name: "Blush Veil",
        prompt: "soft rose-blush background with gold accents and drifting petals",
        swatches: ["#F9A8D4", "#B45309"],
      },
      {
        id: "ivorygold",
        name: "Ivory Gold",
        prompt: "luminous ivory background with deep maroon and gold accents",
        swatches: ["#FFFBEB", "#7F1D1D"],
      },
    ],
    hero: "a bridal lehenga silhouette with a veil caught in the wind and rose petals drifting, dreamy soft-focus glow",
    style:
      "Flowing script-tinged headline. COUTURE gold seal. Petal texture. Romantic, airy CTA bar.",
  },
  {
    id: "fashion-mens-edition",
    name: "Mens Edition",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-mens-edition.jpg",
    tagline: "Sharp menswear, barbershop cool",
    fields: [
      H("MENS EDITION"),
      S("Sharp tailoring, zero fuss."),
      B("NEW"),
      C("SHOP MEN"),
    ],
    palettes: [
      {
        id: "charcoal",
        name: "Charcoal",
        prompt: "charcoal-grey background with crisp white and steel accents",
        swatches: ["#374151", "#F9FAFB"],
      },
      {
        id: "bourbon",
        name: "Bourbon",
        prompt: "rich bourbon-brown background with amber leather accents",
        swatches: ["#451A03", "#F59E0B"],
      },
    ],
    hero: "a confident man in a tailored blazer leaning on a barbershop chair, monochrome tones with warm rim light",
    style:
      "Strong geometric condensed headline. NEW sticker like a lapel pin. Clean barber-stripe accent. Confident CTA bar.",
  },
  {
    id: "fashion-kidswear-joy",
    name: "Kidswear Joy",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-kidswear-joy.jpg",
    tagline: "Playful kidswear burst of color",
    fields: [
      H("LITTLE STARS"),
      S("Comfy styles kids love."),
      B("KIDS"),
      C("SHOP KIDS"),
    ],
    palettes: [
      {
        id: "playground",
        name: "Playground",
        prompt: "sunny yellow background with sky-blue and coral accents",
        swatches: ["#FACC15", "#38BDF8"],
      },
      {
        id: "candy",
        name: "Candy",
        prompt: "soft pink background with mint and lavender accents",
        swatches: ["#F9A8D4", "#6EE7B7"],
      },
    ],
    hero: "joyful kids in colorful outfits jumping mid-air with confetti, bright daylight, pure playful energy",
    style:
      "Rounded bouncy headline. KIDS sticker badge with a star. Confetti texture. Cheerful CTA bar.",
  },
  {
    id: "fashion-athleisure-move",
    name: "Athleisure Move",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-athleisure-move.jpg",
    tagline: "Sporty street look in motion",
    fields: [
      H("MOVE IN STYLE"),
      S("Gym to street, one fit."),
      B("ACTIVE"),
      C("SHOP ACTIVE"),
    ],
    palettes: [
      {
        id: "motion",
        name: "Motion",
        prompt: "deep black background with electric lime-green motion accents",
        swatches: ["#111111", "#A3E635"],
      },
      {
        id: "circuit",
        name: "Circuit",
        prompt: "warm grey background with coral-red accents",
        swatches: ["#78716C", "#F43F5E"],
      },
    ],
    hero: "a model mid-stretch in sleek athleisure on an urban basketball court, dynamic motion, dawn light",
    style:
      "Italic-speed headline with forward slant. ACTIVE wristband-style badge. Motion-line texture. Energetic CTA bar.",
  },
  {
    id: "fashion-handloom-heritage",
    name: "Handloom Heritage",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-handloom-heritage.jpg",
    tagline: "Artisan weave story, earthy craft",
    fields: [
      H("HANDLOOM HERITAGE"),
      S("Woven by master artisans."),
      B("HANDMADE"),
      C("SHOP WEAVES"),
    ],
    palettes: [
      {
        id: "weavestory",
        name: "Weave Story",
        prompt: "warm terracotta background with cream and turmeric-yellow accents",
        swatches: ["#C2410C", "#FEF3C7"],
      },
      {
        id: "loomnight",
        name: "Loom Night",
        prompt: "deep indigo background with mustard-thread accents",
        swatches: ["#312E81", "#FACC15"],
      },
    ],
    hero: "artisan hands weaving colorful threads on a traditional wooden loom, warm workshop light, textile detail",
    style:
      "Headline with hand-lettered warmth. HANDMADE stamp badge. Woven-thread texture. Craft-honoring CTA bar.",
  },
  {
    id: "fashion-winter-layered",
    name: "Winter Layered",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-winter-layered.jpg",
    tagline: "Cozy winter layers, frosty air",
    fields: [
      H("WINTER LAYERED"),
      S("Cozy layers, bold looks."),
      B("NEW SEASON"),
      C("SHOP WINTER"),
    ],
    palettes: [
      {
        id: "alpine",
        name: "Alpine",
        prompt: "frosty navy background with cream knit and snow accents",
        swatches: ["#1E3A5F", "#F5F0E8"],
      },
      {
        id: "embernight",
        name: "Ember Night",
        prompt: "charcoal-black background with ember-orange glow accents",
        swatches: ["#1C1917", "#F97316"],
      },
    ],
    hero: "a model in a puffer coat and knit scarf among snowy pines, visible breath vapor, crisp winter morning light",
    style:
      "Headline in chunky knit-textured lettering. NEW SEASON snowflake badge. Frost texture. Cozy CTA bar.",
  },
  {
    id: "fashion-accessory-lab",
    name: "Accessory Lab",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-accessory-lab.jpg",
    tagline: "Bold accessories flat-lay pop",
    fields: [
      H("FINISH THE LOOK"),
      S("Bags, belts & bold extras."),
      B("NEW"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "studioflat",
        name: "Studio Flat",
        prompt: "clean cream background with bold black graphic blocks",
        swatches: ["#FAF7F0", "#111111"],
      },
      {
        id: "popblock",
        name: "Pop Block",
        prompt: "vivid yellow background with hot-pink color blocks",
        swatches: ["#FDE047", "#EC4899"],
      },
    ],
    hero: "a bold flat-lay of handbags, belts, sunglasses and jewelry on graphic color blocks, top-down studio shot",
    style:
      "Headline split across color blocks. NEW sticker badge. Graphic grid layout. Punchy CTA bar.",
  },
  {
    id: "fashion-parfum-noir",
    name: "Parfum Noir",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-parfum-noir.jpg",
    tagline: "Dark luxury fragrance with smoke",
    fields: [
      H("PARFUM NOIR"),
      S("A scent that enters first."),
      B("NEW SCENT"),
      C("DISCOVER"),
    ],
    palettes: [
      {
        id: "noirsmoke",
        name: "Noir Smoke",
        prompt: "pitch-black background with gold accents and drifting smoke",
        swatches: ["#000000", "#D4AF37"],
      },
      {
        id: "velvetdusk",
        name: "Velvet Dusk",
        prompt: "deep plum background with antique-gold accents",
        swatches: ["#3B0A2E", "#C9A227"],
      },
    ],
    hero: "a black perfume bottle wreathed in curling smoke on a dark marble surface, single dramatic spotlight",
    style:
      "Elegant spaced serif headline. NEW SCENT foil seal. Smoke texture. Mysterious, minimal CTA line.",
  },
  {
    id: "fashion-runway-edit",
    name: "Runway Edit",
    category: "Fashion",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fashion-runway-edit.jpg",
    tagline: "High-fashion runway moment",
    fields: [
      H("RUNWAY EDIT"),
      S("Fresh off the runway."),
      B("SS 2026"),
      C("SHOP THE EDIT"),
    ],
    palettes: [
      {
        id: "spotlight",
        name: "Spotlight",
        prompt: "pitch-black background with white spotlight beams and a red accent",
        swatches: ["#0A0A0A", "#DC2626"],
      },
      {
        id: "frontrow",
        name: "Front Row",
        prompt: "deep navy background with silver shimmer accents",
        swatches: ["#1E3A5F", "#C0C7D1"],
      },
    ],
    hero: "a model mid-stride on a dark runway with spotlight beams and slight motion blur, front-row silhouettes in the foreground",
    style:
      "Tall fashion-editorial headline. SS 2026 ticket-stub badge. Spotlight texture. Exclusive CTA bar.",
  },
  // ───────────────────────── FITNESS (15) ─────────────────────────
  {
    id: "fitness-yoga-flow",
    name: "Yoga Flow",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-yoga-flow.jpg",
    tagline: "Serene sunrise yoga by still water",
    fields: [
      H("YOGA FLOW"),
      S("Breathe. Stretch. Belong."),
      B("NEW BATCH"),
      C("BOOK A CLASS"),
    ],
    palettes: [
      {
        id: "dawnsalute",
        name: "Dawn Salute",
        prompt: "soft sage-green background with peach sunrise glow and gentle mist",
        swatches: ["#9CAF88", "#FDBA74"],
      },
      {
        id: "lotusearth",
        name: "Lotus Earth",
        prompt: "warm terracotta background with cream accents",
        swatches: ["#C2410C", "#FEF3C7"],
      },
    ],
    hero: "a serene yogi in tree pose on a wooden dock at sunrise over a misty lake, soft golden light",
    style:
      "Calm, airy headline with generous spacing. NEW BATCH leaf-shaped badge. Mist texture. Peaceful CTA bar.",
  },
  {
    id: "fitness-crossfit-forge",
    name: "Crossfit Forge",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-crossfit-forge.jpg",
    tagline: "Gritty box-gym intensity",
    fields: [
      H("FORGE YOURSELF"),
      S("WODs that build warriors."),
      B("JOIN"),
      C("START TODAY"),
    ],
    palettes: [
      {
        id: "forgefire",
        name: "Forge Fire",
        prompt: "dark soot-black background with molten-orange accents and chalk dust",
        swatches: ["#0C0A09", "#F97316"],
      },
      {
        id: "steelgrit",
        name: "Steel Grit",
        prompt: "gunmetal-grey background with safety-yellow accents",
        swatches: ["#374151", "#FACC15"],
      },
    ],
    hero: "an athlete flipping a giant tire in a dark box gym, chalk dust in the air, dramatic side light",
    style:
      "Stenciled, aggressive headline. JOIN dog-tag badge. Chalk-dust texture. Raw CTA bar.",
  },
  {
    id: "fitness-marathon-miles",
    name: "Marathon Miles",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-marathon-miles.jpg",
    tagline: "Dawn road-runner endurance",
    fields: [
      H("MARATHON MILES"),
      S("Train for your 42K."),
      B("42K"),
      C("JOIN TRAINING"),
    ],
    palettes: [
      {
        id: "sunriserun",
        name: "Sunrise Run",
        prompt: "warm sunrise-orange background with deep navy silhouettes",
        swatches: ["#FB923C", "#1E3A5F"],
      },
      {
        id: "asphalt",
        name: "Asphalt",
        prompt: "charcoal-asphalt background with lime-green accents",
        swatches: ["#1C1917", "#A3E635"],
      },
    ],
    hero: "a lone runner on an empty highway at dawn with a city skyline ahead, long shadows, cinematic depth",
    style:
      "Wide-tracked headline like road markings. 42K race-bib badge. Long-shadow texture. Determined CTA bar.",
  },
  {
    id: "fitness-zumba-party",
    name: "Zumba Party",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-zumba-party.jpg",
    tagline: "Joyful dance-fitness fiesta",
    fields: [
      H("ZUMBA PARTY"),
      S("Dance your way fit."),
      B("FUN"),
      C("JOIN THE PARTY"),
    ],
    palettes: [
      {
        id: "fiesta",
        name: "Fiesta",
        prompt: "hot-pink background with sunny yellow and turquoise accents",
        swatches: ["#EC4899", "#FDE047"],
      },
      {
        id: "carnival",
        name: "Carnival",
        prompt: "vivid purple background with tangerine accents",
        swatches: ["#7C3AED", "#FB923C"],
      },
    ],
    hero: "joyful dancers mid-move under stage lights with confetti, motion energy, celebration atmosphere",
    style:
      "Bouncy, rhythmic headline. FUN burst badge. Confetti texture. Party-hard CTA bar.",
  },
  {
    id: "fitness-trainer-pro",
    name: "Trainer Pro",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-trainer-pro.jpg",
    tagline: "Elite 1-on-1 coaching",
    fields: [
      H("TRAIN WITH PRO"),
      S("1-on-1 coaching that works."),
      B("1-ON-1"),
      C("BOOK TRIAL"),
    ],
    palettes: [
      {
        id: "coachblue",
        name: "Coach Blue",
        prompt: "deep navy background with crisp white accents",
        swatches: ["#1E3A8A", "#FFFFFF"],
      },
      {
        id: "eliteblack",
        name: "Elite Black",
        prompt: "rich black background with gold accents",
        swatches: ["#0C0A09", "#D4AF37"],
      },
    ],
    hero: "a focused personal trainer coaching a client with a kettlebell in a premium gym, professional sports photography",
    style:
      "Bold confident headline. 1-ON-1 whistle-tag badge. Clean athletic grid. Premium CTA bar.",
  },
  {
    id: "fitness-protein-hub",
    name: "Protein Hub",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-protein-hub.jpg",
    tagline: "Supplement power with powder burst",
    fields: [
      H("PROTEIN HUB"),
      S("Fuel every rep."),
      B("WHEY"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "fuellab",
        name: "Fuel Lab",
        prompt: "matte black background with protein-red accents and a powder burst",
        swatches: ["#111111", "#EF4444"],
      },
      {
        id: "vanilla",
        name: "Vanilla",
        prompt: "warm cream background with chocolate-brown accents",
        swatches: ["#FEF3C7", "#451A03"],
      },
    ],
    hero: "a protein scoop with chocolate powder exploding upward beside a shaker, dramatic studio freeze-frame",
    style:
      "Industrial bold headline. WHEY label badge. Powder-burst texture. High-energy CTA bar.",
  },
  {
    id: "fitness-boxing-club",
    name: "Boxing Club",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-boxing-club.jpg",
    tagline: "Fight-gym drama, wrapped hands",
    fields: [
      H("BOXING CLUB"),
      S("Hit harder. Move smarter."),
      B("JOIN"),
      C("BOOK A SESSION"),
    ],
    palettes: [
      {
        id: "canvasred",
        name: "Canvas Red",
        prompt: "charcoal-black background with boxing-red accents",
        swatches: ["#1C1917", "#DC2626"],
      },
      {
        id: "goldengloves",
        name: "Golden Gloves",
        prompt: "pitch-black background with championship-gold accents",
        swatches: ["#000000", "#D4AF37"],
      },
    ],
    hero: "a boxer wrapping hands in a dramatic gym, heavy bag swaying behind, single overhead light, sweat detail",
    style:
      "Slanted fight-poster headline. JOIN fight-ticket badge. Grain texture. Gritty CTA bar.",
  },
  {
    id: "fitness-swim-squad",
    name: "Swim Squad",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-swim-squad.jpg",
    tagline: "Turquoise water, mid-stroke power",
    fields: [
      H("SWIM SQUAD"),
      S("Own every lap."),
      B("NEW"),
      C("JOIN NOW"),
    ],
    palettes: [
      {
        id: "poolelectric",
        name: "Pool Electric",
        prompt: "vivid turquoise-blue background with crisp white foam accents",
        swatches: ["#06B6D4", "#FFFFFF"],
      },
      {
        id: "deepend",
        name: "Deep End",
        prompt: "deep navy background with cyan lane-rope accents",
        swatches: ["#0B1E3A", "#22D3EE"],
      },
    ],
    hero: "a swimmer mid-freestyle stroke with turquoise water exploding around, lane ropes, bright aqua light",
    style:
      "Fluid wave-cut headline. NEW lane-marker badge. Water-splash texture. Fresh CTA bar.",
  },
  {
    id: "fitness-ride-club",
    name: "Ride Club",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-ride-club.jpg",
    tagline: "Golden-hour cycling ascent",
    fields: [
      H("RIDE CLUB"),
      S("Weekend rides, city routes."),
      B("WEEKENDS"),
      C("JOIN RIDES"),
    ],
    palettes: [
      {
        id: "peloton",
        name: "Peloton",
        prompt: "deep black background with race-yellow accents",
        swatches: ["#111111", "#FACC15"],
      },
      {
        id: "traildust",
        name: "Trail Dust",
        prompt: "forest-green background with dusty earth-brown accents",
        swatches: ["#14532D", "#A16207"],
      },
    ],
    hero: "a cyclist climbing a winding mountain road at golden hour, dramatic landscape, speed and freedom",
    style:
      "Forward-leaning italic headline. WEEKENDS spoke badge. Speed-line texture. Adventurous CTA bar.",
  },
  {
    id: "fitness-pilates-core",
    name: "Pilates Core",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-pilates-core.jpg",
    tagline: "Bright reformer-studio elegance",
    fields: [
      H("PILATES CORE"),
      S("Strength from the center."),
      B("NEW"),
      C("BOOK A CLASS"),
    ],
    palettes: [
      {
        id: "studiocalm",
        name: "Studio Calm",
        prompt: "clean white background with soft sage-green accents",
        swatches: ["#FFFFFF", "#9CAF88"],
      },
      {
        id: "align",
        name: "Align",
        prompt: "warm cream background with terracotta accents",
        swatches: ["#FEFCE8", "#C2410C"],
      },
    ],
    hero: "an elegant reformer pilates pose in a bright minimal studio, soft natural light, graceful alignment",
    style:
      "Refined, balanced headline. NEW minimal dot badge. Airy composition. Calm CTA bar.",
  },
  {
    id: "fitness-street-workout",
    name: "Street Workout",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-street-workout.jpg",
    tagline: "Outdoor calisthenics, concrete park",
    fields: [
      H("STREET WORKOUT"),
      S("Free bars. Real strength."),
      B("FREE"),
      C("FIND YOUR PARK"),
    ],
    palettes: [
      {
        id: "concretebars",
        name: "Concrete Bars",
        prompt: "raw concrete-grey background with safety-orange accents",
        swatches: ["#78716C", "#F97316"],
      },
      {
        id: "parkgreen",
        name: "Park Green",
        prompt: "deep park-green background with charcoal accents",
        swatches: ["#14532D", "#1C1917"],
      },
    ],
    hero: "an athlete mid muscle-up on outdoor calisthenics bars in a concrete park, urban grit, golden light",
    style:
      "Stenciled urban headline. FREE tag badge. Concrete texture. Community-driven CTA bar.",
  },
  {
    id: "fitness-lean-program",
    name: "Lean Program",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-lean-program.jpg",
    tagline: "Guided 12-week transformation",
    fields: [
      H("LEAN IN 12 WEEKS"),
      S("Guided fat-loss that lasts."),
      B("12 WEEKS"),
      C("START NOW"),
    ],
    palettes: [
      {
        id: "transform",
        name: "Transform",
        prompt: "fresh teal background with crisp white accents",
        swatches: ["#0D9488", "#FFFFFF"],
      },
      {
        id: "scaletrust",
        name: "Scale Trust",
        prompt: "confident blue background with lime-green accents",
        swatches: ["#1D4ED8", "#A3E635"],
      },
    ],
    hero: "a confident silhouette mid-transformation with a measuring tape unfurling, bright optimistic studio light",
    style:
      "Headline with a progress-bar underline. 12 WEEKS calendar-chip badge. Clean, trustworthy CTA bar.",
  },
  {
    id: "fitness-sports-fuel",
    name: "Sports Fuel",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-sports-fuel.jpg",
    tagline: "Pro sports nutrition lineup",
    fields: [
      H("SPORTS FUEL"),
      S("Nutrition for athletes."),
      B("PRO"),
      C("SHOP NUTRITION"),
    ],
    palettes: [
      {
        id: "energylab",
        name: "Energy Lab",
        prompt: "bold orange background with black lab-tech accents",
        swatches: ["#F97316", "#111111"],
      },
      {
        id: "electrolyte",
        name: "Electrolyte",
        prompt: "electric blue background with crisp white accents",
        swatches: ["#2563EB", "#FFFFFF"],
      },
    ],
    hero: "a lineup of sports nutrition jars with a dynamic powder burst, high-performance product photography",
    style:
      "Technical, lab-bold headline. PRO formula badge. Powder-burst texture. Performance CTA bar.",
  },
  {
    id: "fitness-dance-fit",
    name: "Dance Fit",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-dance-fit.jpg",
    tagline: "Neon dance cardio energy",
    fields: [
      H("DANCE FIT"),
      S("Cardio disguised as fun."),
      B("NEW"),
      C("JOIN A CLASS"),
    ],
    palettes: [
      {
        id: "groove",
        name: "Groove",
        prompt: "vivid purple background with hot-pink neon accents",
        swatches: ["#7C3AED", "#EC4899"],
      },
      {
        id: "rhythm",
        name: "Rhythm",
        prompt: "pitch-black background with neon-green motion trails",
        swatches: ["#000000", "#A3E635"],
      },
    ],
    hero: "a dancer mid-leap in a neon-lit studio with glowing motion trails, electric nightclub energy",
    style:
      "Rhythmic, bouncing headline. NEW neon badge. Motion-trail texture. Electric CTA bar.",
  },
  {
    id: "fitness-hiit-havoc",
    name: "HIIT Havoc",
    category: "Fitness",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/fitness-hiit-havoc.jpg",
    tagline: "Explosive 30-minute workout",
    fields: [
      H("HIIT HAVOC"),
      S("30 minutes. Zero mercy."),
      B("30 MIN"),
      C("TRY FREE"),
    ],
    palettes: [
      {
        id: "havocred",
        name: "Havoc Red",
        prompt: "intense red background with black smoke accents",
        swatches: ["#DC2626", "#111111"],
      },
      {
        id: "inferno",
        name: "Inferno",
        prompt: "molten tangerine background with charcoal accents",
        swatches: ["#EA580C", "#1C1917"],
      },
    ],
    hero: "an athlete mid-burpee with dust exploding around in a dark studio, explosive freeze-frame intensity",
    style:
      "Shattered, high-impact headline. 30 MIN timer-chip badge. Dust-explosion texture. Relentless CTA bar.",
  },
];
