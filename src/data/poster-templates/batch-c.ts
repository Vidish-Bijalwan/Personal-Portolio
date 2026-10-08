/**
 * Etch Poster Studio — batch C template expansion (WS2c).
 *
 * 45 ORIGINAL templates: 15 Real Estate, 15 Beauty, 15 Business.
 * Every template follows the catalog discipline from templates.ts:
 * headline + one short line + badge + CTA, quoted exact-text rendering,
 * 4:5 portrait, ≥2 palettes with prompt-ready color direction + UI swatches.
 * No template copies any existing poster; layouts and wording are original.
 */

import type { PosterTemplate } from "./templates";

const H = (def: string, maxLength = 22) => ({
  key: "headline",
  label: "Headline",
  default: def,
  maxLength,
});
const S = (def: string) => ({
  key: "subtext",
  label: "Supporting line",
  default: def,
  maxLength: 64,
});
const B = (def: string) => ({
  key: "badge",
  label: "Badge / sticker",
  default: def,
  maxLength: 14,
});
const C = (def: string) => ({
  key: "cta",
  label: "Call to action",
  default: def,
  maxLength: 22,
});
const D = (def: string) => ({
  key: "date",
  label: "Date",
  default: def,
  maxLength: 20,
});

export const BATCH_C: PosterTemplate[] = [
  // ------------------------------------------------------------------
  // REAL ESTATE (15)
  // ------------------------------------------------------------------
  {
    id: "realestate-luxury-apartment",
    name: "Luxury Apartments",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-luxury-apartment.jpg",
    tagline: "Twilight skyline showcase with a ready-to-move ribbon",
    fields: [
      H("LUXURY APARTMENTS"),
      S("Skyline views. 2 & 3 BHK homes."),
      B("READY TO MOVE"),
      C("BOOK A TOUR"),
    ],
    palettes: [
      {
        id: "midnight-gold",
        name: "Midnight Gold",
        prompt: "deep midnight-navy twilight sky with warm gold window-light accents",
        swatches: ["#0F1C2E", "#D4AF37"],
      },
      {
        id: "graphite-amber",
        name: "Graphite Amber",
        prompt: "charcoal-graphite background with glowing amber accents",
        swatches: ["#1C1C1E", "#F59E0B"],
      },
    ],
    hero: "modern high-rise residential towers at blue-hour dusk, hundreds of warm lit windows, dramatic sky, premium architectural photography",
    style:
      "Skyline photo fills the upper two-thirds. Oversized bold condensed headline on a dark lower band, thin gold divider line. READY TO MOVE ribbon badge on the photo corner. Bottom CTA bar. Prestigious, high-rise-living energy.",
  },
  {
    id: "realestate-open-plots",
    name: "Prime Plots",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-open-plots.jpg",
    tagline: "Aerial layout view with loan-ready checklist chips",
    fields: [
      H("PRIME PLOTS"),
      S("Gated layout. Clear titles. Loan ready."),
      B("EASY EMI"),
      C("CALL NOW"),
    ],
    palettes: [
      {
        id: "earth",
        name: "Earth",
        prompt: "warm earthy terracotta and sand background with deep leaf-green accents",
        swatches: ["#C96F4A", "#14532D"],
      },
      {
        id: "savanna",
        name: "Savanna",
        prompt: "golden wheat-sand background with espresso-brown accents",
        swatches: ["#E8C97A", "#3F2E1E"],
      },
    ],
    hero: "aerial drone photograph of a plotted residential layout with curved roads, green avenues and marked plots, late-afternoon light",
    style:
      "Aerial hero dominates the top. Big block headline on an earthy solid band below, three small checklist chips (gated, clear title, loan). Round EASY EMI sticker overlapping the photo. Grounded, investment-grade feel.",
  },
  {
    id: "realestate-commercial-space",
    name: "Commercial Space",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-commercial-space.jpg",
    tagline: "Glass-tower lease poster with bold vertical type",
    fields: [
      H("OFFICE SPACES"),
      S("Grade-A workspaces in the business district."),
      B("FOR LEASE"),
      C("ENQUIRE NOW"),
    ],
    palettes: [
      {
        id: "steel",
        name: "Steel",
        prompt: "cool steel-grey background with deep corporate-blue accents",
        swatches: ["#64748B", "#1E3A8A"],
      },
      {
        id: "graphite-flare",
        name: "Graphite Flare",
        prompt: "dark graphite background with vivid orange accents",
        swatches: ["#1C1C1E", "#F97316"],
      },
    ],
    hero: "a gleaming glass office tower shot from below against a clear sky, geometric facade reflections, corporate architectural photography",
    style:
      "Full-bleed tower photo with a dark gradient rising from the bottom. Massive condensed headline in the lower third, FOR LEASE tag chip pinned top-left. Crisp, corporate, high-ambition energy.",
  },
  {
    id: "realestate-farmhouse",
    name: "Farmhouse Living",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-farmhouse.jpg",
    tagline: "Editorial weekend-escape poster, serif and paper grain",
    fields: [
      H("FARMHOUSE LIFE"),
      S("5 acres. Orchard. Weekend escape."),
      B("PRIVATE"),
      C("SCHEDULE VISIT"),
    ],
    palettes: [
      {
        id: "orchard",
        name: "Orchard",
        prompt: "deep leaf-green background with warm cream and golden-hour accents",
        swatches: ["#14532D", "#F5EFE6"],
      },
      {
        id: "clay",
        name: "Clay",
        prompt: "warm clay-terracotta background with cream accents",
        swatches: ["#B45309", "#FAF3E8"],
      },
    ],
    hero: "a rustic luxury farmhouse wrapped in old trees and an orchard at golden hour, warm light through leaves, editorial countryside photography",
    style:
      "Magazine-editorial layout: photo with soft paper-grain texture, elegant serif headline mixed with small-caps subhead, PRIVATE wax-seal badge. Unhurried, premium countryside calm.",
  },
  {
    id: "realestate-studio-flat",
    name: "Studio Flat",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-studio-flat.jpg",
    tagline: "Compact-city living with a giant 1RK numeral",
    fields: [
      H("STUDIO FLAT"),
      S("Smart 1RK. City centre. Fully fitted."),
      B("MOVE-IN READY"),
      C("VIEW FLAT"),
    ],
    palettes: [
      {
        id: "urban",
        name: "Urban",
        prompt: "dark charcoal background with electric-yellow accents",
        swatches: ["#18181B", "#FDE047"],
      },
      {
        id: "lagoon",
        name: "Lagoon",
        prompt: "deep teal background with crisp white accents",
        swatches: ["#0F766E", "#FFFFFF"],
      },
    ],
    hero: "a bright, cleverly designed studio apartment interior with a loft bed and compact kitchen, sunlight streaming in, modern small-space photography",
    style:
      "Photo band across the middle. Oversized 1RK numerals as a graphic element behind the headline. Punchy sticker badge. Youthful, efficient city-living energy.",
  },
  {
    id: "realestate-penthouse",
    name: "Sky Penthouse",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-penthouse.jpg",
    tagline: "Cinematic night-terrace poster, noir and gold",
    fields: [
      H("SKY PENTHOUSE"),
      S("Private terrace. Infinity pool. 270° views."),
      B("EXCLUSIVE"),
      C("PRIVATE TOUR"),
    ],
    palettes: [
      {
        id: "noir-gold",
        name: "Noir Gold",
        prompt: "pitch-black night background with champagne-gold accents and city-light bokeh",
        swatches: ["#0A0A0A", "#D4AF37"],
      },
      {
        id: "midnight-champagne",
        name: "Midnight Champagne",
        prompt: "deep navy night background with soft champagne highlights",
        swatches: ["#0B1026", "#E9D5A1"],
      },
    ],
    hero: "a luxury penthouse terrace at night with an infinity pool edge, glittering city skyline below, cinematic architectural photography, dramatic rim light",
    style:
      "Full-bleed cinematic night photo. Gold serif headline floating over the dark sky area, EXCLUSIVE seal in gold foil style. Whisper-quiet luxury, bottom CTA in gold.",
  },
  {
    id: "realestate-gated-community",
    name: "Gated Community",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-gated-community.jpg",
    tagline: "Family-first community poster with amenity icons",
    fields: [
      H("GATED COMMUNITY"),
      S("120 villas. Clubhouse. 24×7 security."),
      B("FAMILY FIRST"),
      C("EXPLORE NOW"),
    ],
    palettes: [
      {
        id: "canopy",
        name: "Canopy",
        prompt: "fresh leaf-green background with warm cream accents",
        swatches: ["#166534", "#FEFCE8"],
      },
      {
        id: "harbor",
        name: "Harbor",
        prompt: "deep navy background with gold and cream accents",
        swatches: ["#1E3A8A", "#FBBF24"],
      },
    ],
    hero: "a tree-lined boulevard of elegant villas in a gated community, manicured lawns, children cycling, warm daylight, premium lifestyle photography",
    style:
      "Wide hero photo on top, headline band below with a circular FAMILY FIRST seal. Three amenity icons in a row (clubhouse, park, security). Trustworthy, family-warm CTA bar.",
  },
  {
    id: "realestate-rental-listing",
    name: "Rental Listing",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-rental-listing.jpg",
    tagline: "Punchy no-brokerage rental flyer",
    fields: [
      H("RENT THIS HOME"),
      S("3 BHK · Semi-furnished · Near metro."),
      B("NO BROKERAGE"),
      C("CALL OWNER"),
    ],
    palettes: [
      {
        id: "tangerine",
        name: "Tangerine",
        prompt: "vivid tangerine-orange background with deep navy accents",
        swatches: ["#F97316", "#1E3A8A"],
      },
      {
        id: "teal-pop",
        name: "Teal Pop",
        prompt: "bright teal background with sunny yellow accents",
        swatches: ["#14B8A6", "#FDE047"],
      },
    ],
    hero: "a bright, welcoming apartment living room with big windows and plants, cheerful daylight real-estate photography",
    style:
      "High-energy rental flyer: photo top, huge punchy headline, jagged NO BROKERAGE starburst sticker. Striped bottom CTA bar. Urgent, friendly, move-fast energy.",
  },
  {
    id: "realestate-home-loan",
    name: "Home Loan Partner",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-home-loan.jpg",
    tagline: "Trust-first loan promo with a key visual",
    fields: [
      H("HOME LOANS"),
      S("Lowest rates. Approval in 48 hours."),
      B("FAST APPROVAL"),
      C("APPLY NOW"),
    ],
    palettes: [
      {
        id: "bank-blue",
        name: "Bank Blue",
        prompt: "clean white background with deep trustworthy-blue and gold accents",
        swatches: ["#FFFFFF", "#1E40AF"],
      },
      {
        id: "emerald-trust",
        name: "Emerald Trust",
        prompt: "soft mint background with deep emerald and ink accents",
        swatches: ["#ECFDF5", "#065F46"],
      },
    ],
    hero: "a happy young family holding house keys in front of their new home, warm sunlight, trustworthy lifestyle photography",
    style:
      "Split layout: headline and key visual top, three trust checklist rows (low rates, quick approval, doorstep service) below. FAST APPROVAL stamp badge. Clean, bank-reliable CTA bar.",
  },
  {
    id: "realestate-interior-designer",
    name: "Interior Designer",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-interior-designer.jpg",
    tagline: "Magazine-style designer portfolio poster",
    fields: [
      H("DREAM INTERIORS"),
      S("Modular kitchens. Turnkey makeovers."),
      B("FREE QUOTE"),
      C("BOOK CONSULT"),
    ],
    palettes: [
      {
        id: "linen",
        name: "Linen",
        prompt: "warm linen-beige background with espresso-brown and brass accents",
        swatches: ["#E8DCC8", "#3F2E1E"],
      },
      {
        id: "sage",
        name: "Sage",
        prompt: "soft sage-green background with cream and walnut accents",
        swatches: ["#B2C2B0", "#FAF7F0"],
      },
    ],
    hero: "an elegant designer living room with a statement sofa, brass floor lamp and curated art wall, soft window light, interior-magazine photography",
    style:
      "Editorial magazine spread: large photo, refined serif headline with wide tracking, FREE QUOTE tag in brass. Airy whitespace, portfolio-grade polish, bottom consult CTA.",
  },
  {
    id: "realestate-property-expo",
    name: "Property Expo",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-property-expo.jpg",
    tagline: "Event poster with oversized date numerals",
    fields: [
      H("PROPERTY EXPO"),
      S("50+ builders. Spot offers. Free entry."),
      D("14–16 NOV"),
      B("FREE ENTRY"),
      C("REGISTER"),
    ],
    palettes: [
      {
        id: "expo-royal",
        name: "Expo Royal",
        prompt: "deep royal-purple background with gold accents and festive light",
        swatches: ["#4C1D95", "#FBBF24"],
      },
      {
        id: "expo-crimson",
        name: "Expo Crimson",
        prompt: "rich crimson background with cream and gold accents",
        swatches: ["#991B1B", "#FDE68A"],
      },
    ],
    hero: "a bustling property expo hall with builder stalls, scale models of towers and visiting families, bright event photography",
    style:
      "Event-poster energy: photo strip top, giant date numerals as the design anchor, headline in bold condensed caps. FREE ENTRY ribbon. Registration CTA bar at the bottom.",
  },
  {
    id: "realestate-pre-launch",
    name: "Pre-Launch Offer",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-pre-launch.jpg",
    tagline: "Blueprint-technical launch poster",
    fields: [
      H("PRE-LAUNCH DEAL"),
      S("Priority allotment for early buyers."),
      B("PRIORITY"),
      C("GET DETAILS"),
    ],
    palettes: [
      {
        id: "blueprint",
        name: "Blueprint",
        prompt: "deep blueprint-blue background with white line-art and cyan accents",
        swatches: ["#1E3A8A", "#67E8F9"],
      },
      {
        id: "ink-draft",
        name: "Ink Draft",
        prompt: "dark ink-navy background with warm amber line accents",
        swatches: ["#0F172A", "#F59E0B"],
      },
    ],
    hero: "an architectural blueprint rendering of an upcoming residential tower with construction cranes at dawn, technical-drawing aesthetic, dramatic light",
    style:
      "Technical blueprint mood: line-art frame, mono-spaced caption details, headline in stencil-like condensed caps. PRIORITY stamp badge. Insider-access, early-bird energy.",
  },
  {
    id: "realestate-resale",
    name: "Resale Deal",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-resale.jpg",
    tagline: "Urgent-sale flyer with a hot-deal burst",
    fields: [
      H("RESALE GEM"),
      S("Well-kept 2 BHK. Priced to sell fast."),
      B("HOT DEAL"),
      C("CALL NOW"),
    ],
    palettes: [
      {
        id: "alert-sale",
        name: "Alert Sale",
        prompt: "bold red background with bright yellow accents",
        swatches: ["#DC2626", "#FDE047"],
      },
      {
        id: "deal-navy",
        name: "Deal Navy",
        prompt: "deep navy background with hot coral accents",
        swatches: ["#1E293B", "#FB7185"],
      },
    ],
    hero: "a well-kept mid-rise apartment building with balconies and greenery, bright daylight, honest real-estate photography",
    style:
      "Urgent retail-sale energy: giant HOT DEAL starburst as the visual anchor, headline in heavy condensed caps, diagonal speed lines. Bottom call-now bar. Loud and unmissable.",
  },
  {
    id: "realestate-co-living",
    name: "Co-Living Space",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-co-living.jpg",
    tagline: "Youthful flexi-stay poster, sticker-heavy",
    fields: [
      H("CO-LIVING"),
      S("Private rooms. Zero brokerage. Move in today."),
      B("FLEXI STAY"),
      C("BOOK BED"),
    ],
    palettes: [
      {
        id: "neon-tribe",
        name: "Neon Tribe",
        prompt: "vivid violet background with electric lime-green accents",
        swatches: ["#7C3AED", "#A3E635"],
      },
      {
        id: "sunset-tribe",
        name: "Sunset Tribe",
        prompt: "warm coral background with teal and cream accents",
        swatches: ["#FB7185", "#0F766E"],
      },
    ],
    hero: "a stylish co-living lounge with young residents laughing over coffee, plants and neon sign on the wall, vibrant lifestyle photography",
    style:
      "Youth-poster collage: slanted headline, sticker badges layered over the photo, doodle underline under the CTA. Playful, social, move-in-today energy.",
  },
  {
    id: "realestate-beachfront-villa",
    name: "Beachfront Villa",
    category: "Real Estate",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/realestate-beachfront-villa.jpg",
    tagline: "Dreamy coastal-living poster",
    fields: [
      H("BEACH VILLA"),
      S("Steps from the sand. Private pool."),
      B("SEA VIEW"),
      C("BOOK STAY"),
    ],
    palettes: [
      {
        id: "tide",
        name: "Tide",
        prompt: "tropical turquoise and deep-ocean blue tones with warm sand accents",
        swatches: ["#22D3EE", "#1E3A8A"],
      },
      {
        id: "dune",
        name: "Dune",
        prompt: "warm sunset gradient of coral, peach and dusky purple",
        swatches: ["#FB923C", "#7C3AED"],
      },
    ],
    hero: "a stunning beachfront villa with an infinity pool overlooking the ocean at sunset, palm silhouettes, dreamy coastal photography",
    style:
      "Dreamy travel-real-estate blend: full-bleed sunset photo, script-accent headline over the sky, SEA VIEW circular sticker. Serene CTA pill at the bottom.",
  },
];

BATCH_C.push(
  // ------------------------------------------------------------------
  // BEAUTY (15)
  // ------------------------------------------------------------------
  {
    id: "beauty-hair-glowup",
    name: "Hair Glow-Up",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-hair-glowup.jpg",
    tagline: "Editorial hair-campaign poster, back-view drama",
    fields: [
      H("HAIR GLOW-UP"),
      S("Cut. Color. Keratin. Total transformation."),
      B("TRENDING"),
      C("BOOK NOW"),
    ],
    palettes: [
      {
        id: "noir-rose",
        name: "Noir Rose",
        prompt: "elegant black background with rose-gold accents and soft glow",
        swatches: ["#0C0A09", "#E8B4A0"],
      },
      {
        id: "cocoa",
        name: "Cocoa",
        prompt: "rich chocolate-brown background with caramel-gold accents",
        swatches: ["#4A2C1A", "#FBBF24"],
      },
    ],
    hero: "a woman with impossibly glossy flowing hair photographed from behind, hair catching the light mid-motion, dark salon backdrop, high-fashion hair photography",
    style:
      "Editorial hair campaign: photo fills the frame, huge condensed headline across the top, TRENDING foil sticker. Silky motion, luxury-salon polish, bottom booking bar.",
  },
  {
    id: "beauty-bridal-makeup",
    name: "Bridal Makeup",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-bridal-makeup.jpg",
    tagline: "Regal bridal portrait with gold-frame accents",
    fields: [
      H("BRIDAL GLOW"),
      S("HD makeup trials. On-venue service."),
      B("2026 BRIDE"),
      C("BOOK TRIAL"),
    ],
    palettes: [
      {
        id: "maroon-gold",
        name: "Maroon Gold",
        prompt: "deep bridal-maroon background with rich gold accents",
        swatches: ["#7C2D12", "#D4AF37"],
      },
      {
        id: "champagne",
        name: "Champagne",
        prompt: "soft champagne-cream background with rose-gold accents",
        swatches: ["#F9E7D2", "#B76E79"],
      },
    ],
    hero: "a radiant Indian bride in traditional jewelry with flawless bridal makeup, soft window light, regal bridal portrait photography",
    style:
      "Regal composition: portrait with a thin gold frame inset, elegant serif headline, 2026 BRIDE wax-seal badge. Opulent yet tasteful, trial-booking CTA below.",
  },
  {
    id: "beauty-hair-spa",
    name: "Hair Spa Ritual",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-hair-spa.jpg",
    tagline: "Calm zen ritual poster, steam and orchids",
    fields: [
      H("HAIR SPA DAY"),
      S("Deep repair ritual. 60 minutes of calm."),
      B("DEEP REPAIR"),
      C("RESERVE"),
    ],
    palettes: [
      {
        id: "lagoon-calm",
        name: "Lagoon Calm",
        prompt: "serene teal background with soft cream accents",
        swatches: ["#0F766E", "#FEFCE8"],
      },
      {
        id: "lavender",
        name: "Lavender",
        prompt: "soft lavender background with white and silver accents",
        swatches: ["#C4B5FD", "#FFFFFF"],
      },
    ],
    hero: "a relaxing hair spa head massage with rising steam, orchid petals and warm towels, tranquil spa photography, soft diffused light",
    style:
      "Zen-minimal layout: serene photo, headline in light wide-tracked caps, lots of breathing room. DEEP REPAIR as a small oval seal. Meditative, restorative calm.",
  },
  {
    id: "beauty-nail-art",
    name: "Nail Art Bar",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-nail-art.jpg",
    tagline: "Playful macro close-up with sticker badges",
    fields: [
      H("NAIL ART BAR"),
      S("500+ designs. 3D art & extensions."),
      B("NEW DESIGNS"),
      C("BOOK SLOT"),
    ],
    palettes: [
      {
        id: "pop-pink",
        name: "Pop Pink",
        prompt: "vivid hot-pink background with black and white accents",
        swatches: ["#EC4899", "#111111"],
      },
      {
        id: "nude-gold",
        name: "Nude Gold",
        prompt: "soft nude-beige background with gold accents",
        swatches: ["#E7C9A9", "#B45309"],
      },
    ],
    hero: "extreme close-up of elegant hands with intricate artistic nail art, glossy finish, playful beauty macro photography",
    style:
      "Bold macro crop as hero, chunky rounded headline, starburst NEW DESIGNS sticker. Fun, expressive, Instagram-nail-bar energy with a bottom booking bar.",
  },
  {
    id: "beauty-skincare-clinic",
    name: "Skin Clinic",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-skincare-clinic.jpg",
    tagline: "Clean clinical minimal, water-drop glow",
    fields: [
      H("CLEAR SKIN"),
      S("Dermat-approved facials & peels."),
      B("DERMA CARE"),
      C("CONSULT"),
    ],
    palettes: [
      {
        id: "clinical",
        name: "Clinical",
        prompt: "clean clinical-white background with fresh teal accents",
        swatches: ["#FFFFFF", "#0D9488"],
      },
      {
        id: "botanical",
        name: "Botanical",
        prompt: "soft sage background with cream and leaf-green accents",
        swatches: ["#DCE8DC", "#166534"],
      },
    ],
    hero: "a luminous close-up of flawless glowing skin with fine water droplets, fresh and clinical beauty photography, crisp light",
    style:
      "Medical-clean layout: generous white space, confident sans headline, DERMA CARE shield badge. Scientific trust, calm consult CTA at the bottom.",
  },
  {
    id: "beauty-mens-grooming",
    name: "Men's Grooming",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-mens-grooming.jpg",
    tagline: "Vintage barbershop poster, moody and masculine",
    fields: [
      H("GENTLEMAN CUT"),
      S("Fades. Beard sculpt. Hot-towel shave."),
      B("FOR MEN"),
      C("BOOK CHAIR"),
    ],
    palettes: [
      {
        id: "barber-noir",
        name: "Barber Noir",
        prompt: "dark barbershop-black background with warm amber accents",
        swatches: ["#111111", "#F59E0B"],
      },
      {
        id: "navy-brass",
        name: "Navy Brass",
        prompt: "deep navy background with brass-gold accents",
        swatches: ["#1E293B", "#B45309"],
      },
    ],
    hero: "a barber sculpting a client's beard with clippers in a moody vintage barbershop, leather chair, warm tungsten light, cinematic grooming photography",
    style:
      "Vintage barber-poster attitude: dark photo, badge-style FOR MEN emblem, headline in classic condensed caps with a retro underline flourish. Sharp, masculine confidence.",
  },
  {
    id: "beauty-spa-day",
    name: "Spa Day Escape",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-spa-day.jpg",
    tagline: "Serene stones-and-candles minimal poster",
    fields: [
      H("SPA ESCAPE"),
      S("Massage. Steam. Serenity. Full day."),
      B("RELAX"),
      C("BOOK RETREAT"),
    ],
    palettes: [
      {
        id: "stone",
        name: "Stone",
        prompt: "warm stone-grey background with soft sand and candlelight accents",
        swatches: ["#A8A29E", "#F5EFE6"],
      },
      {
        id: "moss",
        name: "Moss",
        prompt: "deep moss-green background with cream accents",
        swatches: ["#3F6212", "#FEFCE8"],
      },
    ],
    hero: "stacked spa stones, flickering candles and an orchid beside a folded towel, deep calm spa still-life photography",
    style:
      "Serene minimalism: still-life hero, headline in soft wide-tracked serif, RELAX as a small round seal. Slow, breathable, retreat-calm CTA.",
  },
  {
    id: "beauty-mehndi-artist",
    name: "Mehndi Artist",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-mehndi-artist.jpg",
    tagline: "Cultural ornamental poster, mandala accents",
    fields: [
      H("MEHNDI ART"),
      S("Bridal & festive henna designs."),
      B("BRIDAL"),
      C("BOOK ARTIST"),
    ],
    palettes: [
      {
        id: "henna-green",
        name: "Henna Green",
        prompt: "deep henna-green background with gold mandala accents",
        swatches: ["#14532D", "#D4AF37"],
      },
      {
        id: "sindoor",
        name: "Sindoor",
        prompt: "rich festive-red background with gold accents",
        swatches: ["#991B1B", "#FBBF24"],
      },
    ],
    hero: "elegant hands adorned with intricate dark henna mandala patterns, marigold petals nearby, rich cultural beauty photography",
    style:
      "Vernacular-festive design: ornamental mandala frame corners, headline in decorative display caps with gold outline, BRIDAL paisley badge. Celebratory, rooted, handcrafted feel.",
  },
  {
    id: "beauty-tattoo-studio",
    name: "Tattoo Studio",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-tattoo-studio.jpg",
    tagline: "Grunge youth poster, ink and flash art",
    fields: [
      H("INK STUDIO"),
      S("Custom designs. Hygienic. Pro artists."),
      B("WALK-INS"),
      C("BOOK SESSION"),
    ],
    palettes: [
      {
        id: "ink-blood",
        name: "Ink Blood",
        prompt: "raw black background with blood-red accents and grain",
        swatches: ["#0A0A0A", "#DC2626"],
      },
      {
        id: "acid-ink",
        name: "Acid Ink",
        prompt: "black background with acid-green accents and photocopy texture",
        swatches: ["#0A0A0A", "#A3E635"],
      },
    ],
    hero: "a tattoo artist's gloved hands inking a detailed blackwork tattoo on an arm, dark studio, flash-art sheets on the wall, gritty documentary photography",
    style:
      "Grunge youth-poster: photocopy grain, distressed condensed headline, WALK-INS stamp badge tilted. Raw, rebellious, studio-credible CTA bar.",
  },
  {
    id: "beauty-lash-brow",
    name: "Lash & Brow Bar",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-lash-brow.jpg",
    tagline: "Macro eye editorial with volume-lash drama",
    fields: [
      H("LASH & BROW"),
      S("Extensions. Lamination. Tinting."),
      B("NEW LOOK"),
      C("BOOK NOW"),
    ],
    palettes: [
      {
        id: "mauve",
        name: "Mauve",
        prompt: "soft mauve-pink background with gold accents",
        swatches: ["#D8A7B1", "#B45309"],
      },
      {
        id: "velvet",
        name: "Velvet",
        prompt: "deep plum-black background with blush-pink accents",
        swatches: ["#1C0F14", "#F9A8D4"],
      },
    ],
    hero: "extreme macro of a woman's eye with dramatic volume lash extensions, sharp focus on lashes, high-fashion beauty photography",
    style:
      "Macro-editorial crop: eye fills the frame, headline in chic serif across the lower third, NEW LOOK gold sticker. Glamorous, precise, lash-bar luxury.",
  },
  {
    id: "beauty-facial-packages",
    name: "Facial Packages",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-facial-packages.jpg",
    tagline: "Luxe glow-package menu poster",
    fields: [
      H("FACIAL FEST"),
      S("Gold. Diamond. Hydra. Pick your glow."),
      B("GLOW PACKS"),
      C("CHOOSE PACK"),
    ],
    palettes: [
      {
        id: "gilded",
        name: "Gilded",
        prompt: "luminous cream background with rich gold accents",
        swatches: ["#FDF6E3", "#B45309"],
      },
      {
        id: "rose-luxe",
        name: "Rose Luxe",
        prompt: "soft rose background with deep maroon and gold accents",
        swatches: ["#FCE7F3", "#7C2D12"],
      },
    ],
    hero: "a serene woman receiving a luxurious gold-leaf facial treatment, glowing skin, petals, opulent spa photography",
    style:
      "Luxe package-menu layout: photo top, headline in gold-foil serif, three package name rows like a menu. GLOW PACKS seal. Indulgent, celebratory glow.",
  },
  {
    id: "beauty-ayurvedic",
    name: "Ayurvedic Beauty",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-ayurvedic.jpg",
    tagline: "Earthy herbal-ritual poster, brass and turmeric",
    fields: [
      H("AYURVEDA GLOW"),
      S("Herbal rituals. Ancient wisdom."),
      B("100% HERBAL"),
      C("BOOK RITUAL"),
    ],
    palettes: [
      {
        id: "turmeric",
        name: "Turmeric",
        prompt: "warm turmeric-gold background with deep leaf-green accents",
        swatches: ["#D97706", "#14532D"],
      },
      {
        id: "clay-herb",
        name: "Clay Herb",
        prompt: "terracotta-clay background with cream and herb-green accents",
        swatches: ["#B45309", "#FAF3E8"],
      },
    ],
    hero: "ayurvedic brass bowls of herbal oils, turmeric roots and fresh herbs on a rustic wooden table, warm natural light, earthy wellness photography",
    style:
      "Earthy cultural design: ingredient still-life hero, headline in organic rounded serif, 100% HERBAL leaf seal. Grounded, ancient-wisdom calm.",
  },
  {
    id: "beauty-salon-opening",
    name: "Salon Opening",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-salon-opening.jpg",
    tagline: "Festive launch poster with ribbon and date",
    fields: [
      H("SALON OPENING"),
      S("Doors open soon — come celebrate."),
      D("20 DEC · 11 AM"),
      B("GRAND OPEN"),
      C("JOIN US"),
    ],
    palettes: [
      {
        id: "launch-noir",
        name: "Launch Noir",
        prompt: "elegant black background with gold accents and festive confetti",
        swatches: ["#0C0A09", "#D4AF37"],
      },
      {
        id: "launch-blush",
        name: "Launch Blush",
        prompt: "soft blush-pink background with gold accents and confetti",
        swatches: ["#FCE7F3", "#B45309"],
      },
    ],
    hero: "a chic new salon interior with styling chairs and mirrors decorated with a grand-opening ribbon, golden confetti falling, celebratory photography",
    style:
      "Grand-opening glamour: photo with confetti, big date numerals as design anchor, GRAND OPEN ribbon badge. Festive, welcoming, celebration CTA.",
  },
  {
    id: "beauty-academy",
    name: "Beauty Academy",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-academy.jpg",
    tagline: "Pro-course promo with certification seal",
    fields: [
      H("BEAUTY ACADEMY"),
      S("Pro courses. Certification. Job help."),
      B("ADMISSIONS"),
      C("ENROL NOW"),
    ],
    palettes: [
      {
        id: "violet-pro",
        name: "Violet Pro",
        prompt: "deep violet background with white and gold accents",
        swatches: ["#5B21B6", "#FBBF24"],
      },
      {
        id: "teal-campus",
        name: "Teal Campus",
        prompt: "clean white background with deep teal and gold accents",
        swatches: ["#FFFFFF", "#0F766E"],
      },
    ],
    hero: "beauty academy students practicing makeup on models in a bright training studio, professional education photography",
    style:
      "Education-promo clarity: photo band, bold headline, ADMISSIONS round seal, three course rows (makeup, hair, skin). Career-focused, aspirational CTA.",
  },
  {
    id: "beauty-cosmetics-launch",
    name: "Cosmetics Launch",
    category: "Beauty",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/beauty-cosmetics-launch.jpg",
    tagline: "Product-launch ad, dramatic lipstick hero",
    fields: [
      H("GLOW LAUNCH"),
      S("New vegan lipstick collection."),
      B("VEGAN"),
      C("SHOP NOW"),
    ],
    palettes: [
      {
        id: "rouge",
        name: "Rouge",
        prompt: "bold crimson-red background with cream accents",
        swatches: ["#DC2626", "#FFF7ED"],
      },
      {
        id: "nude-editorial",
        name: "Nude Editorial",
        prompt: "soft nude-beige background with deep espresso accents",
        swatches: ["#E8D5C4", "#3F2E1E"],
      },
    ],
    hero: "a dramatic lipstick product shot with a bold red bullet and swatch smears, studio lighting, premium cosmetics photography",
    style:
      "Product-launch ad: oversized product hero, punchy headline, VEGAN leaf sticker. High-contrast, covetable, shop-now urgency.",
  },
);

BATCH_C.push(
  // ------------------------------------------------------------------
  // BUSINESS (15)
  // ------------------------------------------------------------------
  {
    id: "business-brand-studio",
    name: "Brand Studio",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-brand-studio.jpg",
    tagline: "Brutalist creative-studio poster, lime on black",
    fields: [
      H("BRAND STUDIO"),
      S("Logos. Identity. Design that sells."),
      B("DESIGN PRO"),
      C("SEE WORK"),
    ],
    palettes: [
      {
        id: "brutalist-lime",
        name: "Brutalist Lime",
        prompt: "raw black background with electric lime-green accents",
        swatches: ["#0A0A0A", "#A3E635"],
      },
      {
        id: "paper-red",
        name: "Paper Red",
        prompt: "warm paper-cream background with bold red accents",
        swatches: ["#FAF3E8", "#DC2626"],
      },
    ],
    hero: "a designer's studio wall covered in logo sketches, brand boards and color swatches, creative workspace photography",
    style:
      "Brutalist creative energy: off-grid headline, thick rules, DESIGN PRO rubber-stamp badge. Raw, confident, portfolio-driven CTA.",
  },
  {
    id: "business-startup-pitch",
    name: "Startup Pitch",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-startup-pitch.jpg",
    tagline: "Bold founder-energy poster with chart graphics",
    fields: [
      H("PITCH READY"),
      S("Decks that win investors."),
      B("DECK PRO"),
      C("GET DECK"),
    ],
    palettes: [
      {
        id: "founder-navy",
        name: "Founder Navy",
        prompt: "deep navy background with electric-cyan chart accents",
        swatches: ["#0F1E3D", "#22D3EE"],
      },
      {
        id: "gold-rush",
        name: "Gold Rush",
        prompt: "black background with gold accents and rising-chart graphics",
        swatches: ["#0A0A0A", "#FBBF24"],
      },
    ],
    hero: "a confident founder presenting on a dark stage with a giant rising-growth chart behind, dramatic spotlight, startup-event photography",
    style:
      "High-ambition startup mood: photo with glowing chart overlay, huge condensed headline, DECK PRO lightning sticker. Forward-motion, fundraise-ready CTA.",
  },
  {
    id: "business-ca-services",
    name: "CA Services",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-ca-services.jpg",
    tagline: "Trust-first tax-season promo",
    fields: [
      H("CA SERVICES"),
      S("Tax. Audit. Compliance. Sorted."),
      B("TRUSTED"),
      C("TALK TO CA"),
    ],
    palettes: [
      {
        id: "ledger-navy",
        name: "Ledger Navy",
        prompt: "clean white background with deep navy and gold accents",
        swatches: ["#FFFFFF", "#1E3A8A"],
      },
      {
        id: "ledger-teal",
        name: "Ledger Teal",
        prompt: "soft light background with deep teal and charcoal accents",
        swatches: ["#F0FDFD", "#0F766E"],
      },
    ],
    hero: "a professional chartered accountant's desk with calculator, ledger books and documents, crisp office light, trustworthy corporate photography",
    style:
      "Classic professional layout: headline band, photo middle, three service rows with checkmarks (tax, audit, compliance). TRUSTED shield badge. Calm, reliable CTA bar.",
  },
  {
    id: "business-digital-marketing",
    name: "Digital Marketing",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-digital-marketing.jpg",
    tagline: "Growth-hacker poster with analytics energy",
    fields: [
      H("GROW ONLINE"),
      S("Ads. SEO. Content that converts."),
      B("ROI FIRST"),
      C("FREE AUDIT"),
    ],
    palettes: [
      {
        id: "growth-violet",
        name: "Growth Violet",
        prompt: "deep violet background with cyan and magenta digital accents",
        swatches: ["#4C1D95", "#22D3EE"],
      },
      {
        id: "matrix",
        name: "Matrix",
        prompt: "black background with neon-green chart-line accents",
        swatches: ["#000000", "#4ADE80"],
      },
    ],
    hero: "a glowing analytics dashboard with rising graphs and social-media icons floating above a laptop, dark tech workspace, digital-marketing photography",
    style:
      "High-voltage digital mood: dashboard photo, headline in techy condensed caps, ROI FIRST bolt sticker. Metrics-forward, audit-CTA urgency.",
  },
  {
    id: "business-consultancy",
    name: "Consultancy",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-consultancy.jpg",
    tagline: "Premium minimal advisor poster",
    fields: [
      H("STRATEGY PRO"),
      S("Clarity for founders & teams."),
      B("1:1 CALLS"),
      C("BOOK CALL"),
    ],
    palettes: [
      {
        id: "boardroom",
        name: "Boardroom",
        prompt: "warm slate background with amber and cream accents",
        swatches: ["#334155", "#F59E0B"],
      },
      {
        id: "ivory",
        name: "Ivory",
        prompt: "ivory-white background with deep navy accents",
        swatches: ["#FFFFF0", "#1E3A8A"],
      },
    ],
    hero: "a consultant sketching a strategy framework on a glass whiteboard in a bright boardroom, premium business photography",
    style:
      "Premium minimal: airy photo, refined serif headline, 1:1 CALLS pill badge. Quiet authority, consultative CTA. Boardroom-calm confidence.",
  },
  {
    id: "business-coworking",
    name: "Coworking Space",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-coworking.jpg",
    tagline: "Flexible-work poster with pass sticker",
    fields: [
      H("WORK YOUR WAY"),
      S("Hot desks. Cabins. Day passes."),
      B("DAY PASSES"),
      C("BOOK TOUR"),
    ],
    palettes: [
      {
        id: "hub-orange",
        name: "Hub Orange",
        prompt: "warm white background with vibrant orange and charcoal accents",
        swatches: ["#FFF7ED", "#F97316"],
      },
      {
        id: "hub-green",
        name: "Hub Green",
        prompt: "fresh light background with deep green and charcoal accents",
        swatches: ["#F0FDF4", "#166534"],
      },
    ],
    hero: "a vibrant coworking lounge with freelancers at shared tables, plants and natural light, modern work-culture photography",
    style:
      "Friendly-modern layout: photo top, headline in rounded bold caps, DAY PASSES ticket-style sticker. Three plan rows (desk, cabin, day pass). Welcoming tour CTA.",
  },
  {
    id: "business-franchise",
    name: "Franchise Opportunity",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-franchise.jpg",
    tagline: "Opportunity poster with storefront hero",
    fields: [
      H("OWN A BRAND"),
      S("Proven model. Full training."),
      B("PAN-INDIA"),
      C("APPLY NOW"),
    ],
    palettes: [
      {
        id: "franchise-red",
        name: "Franchise Red",
        prompt: "bold red background with white and gold accents",
        swatches: ["#DC2626", "#FBBF24"],
      },
      {
        id: "franchise-blue",
        name: "Franchise Blue",
        prompt: "corporate blue background with white and gold accents",
        swatches: ["#1D4ED8", "#FDE68A"],
      },
    ],
    hero: "a bright branded franchise storefront with customers walking in, grand signage, aspirational retail photography",
    style:
      "Opportunity-poster confidence: storefront hero, massive headline, PAN-INDIA map-pin badge. Three benefit rows (training, setup, marketing). Apply-now urgency.",
  },
  {
    id: "business-loan",
    name: "Business Loan",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-loan.jpg",
    tagline: "Working-capital promo with shop-owner hero",
    fields: [
      H("BUSINESS LOANS"),
      S("Working capital in 48 hours."),
      B("FAST FUNDS"),
      C("APPLY"),
    ],
    palettes: [
      {
        id: "capital-green",
        name: "Capital Green",
        prompt: "clean white background with deep money-green and gold accents",
        swatches: ["#FFFFFF", "#15803D"],
      },
      {
        id: "vault-navy",
        name: "Vault Navy",
        prompt: "deep navy background with gold accents",
        swatches: ["#0F1E3D", "#D4AF37"],
      },
    ],
    hero: "a proud small-business owner standing in their shop with arms crossed, warm light, entrepreneurial portrait photography",
    style:
      "Bank-trust layout: portrait hero, bold headline, FAST FUNDS stamp badge, three feature rows (quick disbursal, minimal paperwork, flexible tenure). Solid apply CTA.",
  },
  {
    id: "business-logistics",
    name: "Logistics",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-logistics.jpg",
    tagline: "Speed-line freight poster",
    fields: [
      H("SHIP ANYWHERE"),
      S("Same-day city. Pan-India freight."),
      B("ON TIME"),
      C("GET QUOTE"),
    ],
    palettes: [
      {
        id: "freight-orange",
        name: "Freight Orange",
        prompt: "dark charcoal background with vivid safety-orange accents",
        swatches: ["#1C1C1E", "#F97316"],
      },
      {
        id: "cargo-blue",
        name: "Cargo Blue",
        prompt: "deep blue background with white and yellow accents",
        swatches: ["#1E3A8A", "#FDE047"],
      },
    ],
    hero: "a fleet of delivery trucks on a highway at dawn with motion blur, containers and logistics hub, dynamic freight photography",
    style:
      "Speed-first design: motion-blur photo, diagonal headline with speed lines, ON TIME circular stamp. Industrial, reliable, quote-CTA momentum.",
  },
  {
    id: "business-import-export",
    name: "Import Export",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-import-export.jpg",
    tagline: "Epic global-trade poster, port at dusk",
    fields: [
      H("GLOBAL TRADE"),
      S("Import. Export. Customs handled."),
      B("WORLDWIDE"),
      C("START TRADE"),
    ],
    palettes: [
      {
        id: "harbor-navy",
        name: "Harbor Navy",
        prompt: "deep navy background with gold container accents",
        swatches: ["#0F1E3D", "#D4AF37"],
      },
      {
        id: "desert-trade",
        name: "Desert Trade",
        prompt: "warm sand background with deep teal accents",
        swatches: ["#E8C97A", "#0F766E"],
      },
    ],
    hero: "a container port at dusk with stacked cargo containers and a cargo ship, cranes silhouetted, epic trade photography",
    style:
      "Epic-scale composition: port photo fills the frame, headline in monumental condensed caps, WORLDWIDE globe badge. Ambitious, borderless-trade energy.",
  },
  {
    id: "business-accounting-software",
    name: "Accounting Software",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-accounting-software.jpg",
    tagline: "Clean SaaS promo with dashboard hero",
    fields: [
      H("SMART LEDGERS"),
      S("GST-ready billing in minutes."),
      B("GST READY"),
      C("TRY FREE"),
    ],
    palettes: [
      {
        id: "saas-indigo",
        name: "SaaS Indigo",
        prompt: "clean white background with deep indigo and violet accents",
        swatches: ["#FFFFFF", "#4F46E5"],
      },
      {
        id: "saas-mint",
        name: "SaaS Mint",
        prompt: "soft mint background with deep green and charcoal accents",
        swatches: ["#ECFDF5", "#065F46"],
      },
    ],
    hero: "a laptop showing a clean accounting dashboard with invoice charts on a bright desk, modern SaaS product photography",
    style:
      "SaaS-clean layout: product screenshot hero, confident headline, GST READY check badge, three feature rows. Crisp, modern, try-free CTA.",
  },
  {
    id: "business-hr-hiring",
    name: "We're Hiring",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-hr-hiring.jpg",
    tagline: "Energetic recruitment poster, team high-five",
    fields: [
      H("WE'RE HIRING"),
      S("Join a team going places."),
      B("OPEN ROLES"),
      C("APPLY"),
    ],
    palettes: [
      {
        id: "hire-coral",
        name: "Hire Coral",
        prompt: "warm coral background with deep navy accents",
        swatches: ["#FB7185", "#1E3A8A"],
      },
      {
        id: "hire-sun",
        name: "Hire Sun",
        prompt: "sunny yellow background with black accents",
        swatches: ["#FDE047", "#111111"],
      },
    ],
    hero: "a diverse young team high-fiving in a bright modern office, genuine joy, energetic recruitment photography",
    style:
      "Recruitment energy: joyful team photo, headline in big friendly caps, OPEN ROLES megaphone sticker. Warm, ambitious, apply-now invitation.",
  },
  {
    id: "business-legal-services",
    name: "Legal Services",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-legal-services.jpg",
    tagline: "Classic gravitas poster, scales and gavel",
    fields: [
      H("LEGAL SHIELD"),
      S("Contracts. Startups. Disputes."),
      B("LAWYERS"),
      C("CONSULT"),
    ],
    palettes: [
      {
        id: "justice-burgundy",
        name: "Justice Burgundy",
        prompt: "deep burgundy background with gold accents",
        swatches: ["#7F1D1D", "#D4AF37"],
      },
      {
        id: "chamber-charcoal",
        name: "Chamber Charcoal",
        prompt: "charcoal background with silver and cream accents",
        swatches: ["#1C1C1E", "#E7E5E4"],
      },
    ],
    hero: "brass scales of justice and a gavel on a dark wood desk in a law chamber, dramatic side light, classic legal photography",
    style:
      "Classic legal gravitas: dark photo, serif headline with gold rules, LAWYERS emblem badge. Three practice rows. Dignified, protective consult CTA.",
  },
  {
    id: "business-web-studio",
    name: "Web Studio",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-web-studio.jpg",
    tagline: "Dev-studio poster with code energy",
    fields: [
      H("WEB STUDIO"),
      S("Sites that rank & convert."),
      B("SHIPS FAST"),
      C("GET QUOTE"),
    ],
    palettes: [
      {
        id: "dev-noir",
        name: "Dev Noir",
        prompt: "black background with electric-cyan code accents",
        swatches: ["#0A0A0A", "#22D3EE"],
      },
      {
        id: "studio-violet",
        name: "Studio Violet",
        prompt: "clean white background with vivid violet accents",
        swatches: ["#FFFFFF", "#7C3AED"],
      },
    ],
    hero: "a laptop displaying a sleek website mockup with code on a second screen, dark developer desk with neon glow, modern web-studio photography",
    style:
      "Dev-studio modern: dark workspace photo, mono-spaced caption accents, headline in techy bold caps, SHIPS FAST rocket sticker. Sharp, fast, quote-CTA drive.",
  },
  {
    id: "business-cloud-kitchen",
    name: "Cloud Kitchen",
    category: "Business",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/business-cloud-kitchen.jpg",
    tagline: "Food-startup poster with chef hero",
    fields: [
      H("CLOUD KITCHEN"),
      S("Launch your food brand online."),
      B("GO LIVE"),
      C("START NOW"),
    ],
    palettes: [
      {
        id: "kitchen-flame",
        name: "Kitchen Flame",
        prompt: "warm cream background with bold flame-red accents",
        swatches: ["#FFF7ED", "#DC2626"],
      },
      {
        id: "kitchen-char",
        name: "Kitchen Char",
        prompt: "dark charcoal background with vivid orange accents",
        swatches: ["#1C1C1E", "#F97316"],
      },
    ],
    hero: "a chef packing branded delivery boxes in a gleaming commercial kitchen, steam and warm light, food-startup photography",
    style:
      "Food-startup hustle: kitchen-action photo, bold appetizing headline, GO LIVE flame sticker. Three launch rows (kitchen, branding, delivery). Start-now momentum.",
  },
);
