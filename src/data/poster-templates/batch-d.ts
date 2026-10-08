/**
 * Etch Poster Studio — Batch D template expansion (WS2d).
 *
 * 30 ORIGINAL templates: 15 Travel + 15 Education.
 * Each template is a prompt blueprint + style spec encoding professional
 * flyer/poster design patterns (bold condensed display type, high-contrast
 * color blocking, 4:5 portrait composition, sticker badges, minimal-text
 * discipline). No template copies any existing poster or reference design.
 *
 * Text discipline: AI image models garble long text, so every template keeps
 * to headline + one short line + badge + CTA. The composer renders these as
 * quoted exact-text instructions in the prompt.
 */

import type { PosterTemplate } from "./templates";

const FIELD_HEADLINE = (def: string, maxLength = 22) => ({
  key: "headline",
  label: "Headline",
  default: def,
  maxLength,
});
const FIELD_SUBTEXT = (def: string) => ({
  key: "subtext",
  label: "Supporting line",
  default: def,
  maxLength: 64,
});
const FIELD_BADGE = (def: string) => ({
  key: "badge",
  label: "Badge / sticker",
  default: def,
  maxLength: 14,
});
const FIELD_CTA = (def: string) => ({
  key: "cta",
  label: "Call to action",
  default: def,
  maxLength: 22,
});
const FIELD_DATE = (def: string) => ({
  key: "date",
  label: "Date",
  default: def,
  maxLength: 20,
});

export const BATCH_D: PosterTemplate[] = [
  // ---------------------------------------------------------------- Travel
  {
    id: "travel-mountain-tours",
    name: "Alpine Escape",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-mountain-tours.jpg",
    tagline: "Swiss-editorial mountain poster with line-art peaks",
    fields: [
      FIELD_HEADLINE("ALPINE ESCAPE"),
      FIELD_SUBTEXT("7-day guided mountain tours."),
      FIELD_BADGE("2026"),
      FIELD_CTA("BOOK NOW"),
    ],
    palettes: [
      {
        id: "swiss",
        name: "Swiss Alpine",
        prompt: "clean off-white background with deep navy-blue mountain line-art and a warm mustard-yellow sun disc",
        swatches: ["#F5F2EA", "#1E3A5F"],
      },
      {
        id: "ember",
        name: "Ember Dawn",
        prompt: "dark charcoal-black background with vivid orange sunrise glow over jagged ridgelines",
        swatches: ["#14161A", "#F97316"],
      },
      {
        id: "glacier",
        name: "Glacier Blue",
        prompt: "deep midnight-navy background with icy cyan peaks and frost-white accents",
        swatches: ["#0B1B33", "#7DD3FC"],
      },
    ],
    hero: "jagged alpine peaks rendered as bold navy line-art beneath a warm mustard sun disc, tiny trekker silhouettes on a ridge trail, clean Swiss-poster mountain minimalism",
    style:
      "Oversized condensed uppercase headline stacked across the top third. Flat vector mountain layers with generous negative space. Circular year sticker badge overlapping the sun disc. Bottom sans-serif CTA pill. Crisp editorial print-poster feel with subtle paper grain.",
  },
  {
    id: "travel-beach-packages",
    name: "Sandy Shores",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-beach-packages.jpg",
    tagline: "Retro surf poster with a banded sunset and price sticker",
    fields: [
      FIELD_HEADLINE("SANDY SHORES"),
      FIELD_SUBTEXT("Beach packages from ₹9,999."),
      FIELD_BADGE("SAVE 20%"),
      FIELD_CTA("BOOK NOW"),
    ],
    palettes: [
      {
        id: "retro",
        name: "Retro Sunset",
        prompt: "warm cream background with horizontal sunset bands of coral, peach and teal",
        swatches: ["#FDF0E2", "#FF7A59"],
      },
      {
        id: "ocean",
        name: "Ocean Pop",
        prompt: "bright turquoise background with deep-blue waves and sun-yellow accents",
        swatches: ["#22D3EE", "#FBBF24"],
      },
      {
        id: "palm",
        name: "Palm Noir",
        prompt: "deep ink-black background with neon coral palm silhouettes",
        swatches: ["#0C0C0C", "#FB7185"],
      },
    ],
    hero: "a retro striped sunset over stylized turquoise waves, a lone palm silhouette and a small striped beach umbrella, screen-print travel poster illustration with paper grain",
    style:
      "Big rounded retro display headline arched across the sky. The sun is a concentric banded disc. Starburst price sticker overlapping a wave crest. Bottom CTA pill bar. Nostalgic sun-faded beach-poster finish.",
  },
  {
    id: "travel-honeymoon",
    name: "Honeymoon Bliss",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-honeymoon.jpg",
    tagline: "Soft romantic poster with a couple silhouette at sunset",
    fields: [
      FIELD_HEADLINE("HONEYMOON BLISS"),
      FIELD_SUBTEXT("Romantic escapes made for two."),
      FIELD_BADGE("COUPLE DEAL"),
      FIELD_CTA("PLAN TRIP"),
    ],
    palettes: [
      {
        id: "rose",
        name: "Rosé Dusk",
        prompt: "soft blush-pink background with deep maroon accents and warm golden light",
        swatches: ["#F9DCC4", "#7C2D12"],
      },
      {
        id: "twilight",
        name: "Twilight",
        prompt: "dusky lavender background with cream and antique-gold accents",
        swatches: ["#2E2440", "#E9C46A"],
      },
      {
        id: "sand",
        name: "Warm Sand",
        prompt: "warm sand-beige background with terracotta and ivory accents",
        swatches: ["#EBDCC3", "#C96F4A"],
      },
    ],
    hero: "a couple's silhouette watching the sun melt into a calm ocean from a private beach cabana, soft romantic light, cinematic minimal composition",
    style:
      "Elegant mix of script and condensed sans headline in the upper third. Generous negative space with a soft gradient wash. Small heart-shaped deal sticker. Understated luxury honeymoon aesthetic, CTA pill at the bottom.",
  },
  {
    id: "travel-kashmir-tour",
    name: "Kashmir Dreams",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-kashmir-tour.jpg",
    tagline: "Folk-art poster with shikara, snow peaks and chinar borders",
    fields: [
      FIELD_HEADLINE("KASHMIR DREAMS"),
      FIELD_SUBTEXT("Houseboats, valleys & snow peaks."),
      FIELD_BADGE("BESTSELLER"),
      FIELD_CTA("BOOK NOW"),
    ],
    palettes: [
      {
        id: "chinar",
        name: "Chinar",
        prompt: "deep pine-green background with saffron and ivory folk accents",
        swatches: ["#1E3A2F", "#F59E0B"],
      },
      {
        id: "snow",
        name: "Snowfall",
        prompt: "crisp winter-white background with deep blue and maroon accents",
        swatches: ["#F8FAFC", "#7C2D12"],
      },
      {
        id: "autumn",
        name: "Autumn",
        prompt: "warm amber background with maroon chinar-leaf motifs",
        swatches: ["#B45309", "#FDE68A"],
      },
    ],
    hero: "a shikara gliding across a misty lake ringed by snow-capped Himalayan peaks, floating market boats nearby, intricate chinar-leaf border motifs, folk-art travel poster",
    style:
      "Decorative folk-art frame with chinar motifs around a central lake scene. Bold headline in strong display serif with vernacular poster energy. Round bestseller seal sticker. Print-like texture, bottom CTA bar.",
  },
  {
    id: "travel-kerala-backwaters",
    name: "Kerala Drift",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-kerala-backwaters.jpg",
    tagline: "Cinematic houseboat poster, letterboxed and moody",
    fields: [
      FIELD_HEADLINE("KERALA DRIFT"),
      FIELD_SUBTEXT("Houseboat escapes through the backwaters."),
      FIELD_BADGE("GOD'S OWN"),
      FIELD_CTA("SAIL NOW"),
    ],
    palettes: [
      {
        id: "lagoon",
        name: "Lagoon",
        prompt: "deep teal background with warm amber highlights and cream accents",
        swatches: ["#0E4F4A", "#FBBF24"],
      },
      {
        id: "monsoon",
        name: "Monsoon",
        prompt: "moody slate-blue background with rain-washed greens and golden light accents",
        swatches: ["#334155", "#F59E0B"],
      },
      {
        id: "dawn",
        name: "Palm Dawn",
        prompt: "soft peach background with teal water and terracotta accents",
        swatches: ["#FDE3CF", "#0D7377"],
      },
    ],
    hero: "a traditional kettuvallam houseboat drifting through emerald backwaters at golden hour, coconut palms leaning over the water, rippling reflections, cinematic travel photography",
    style:
      "Wide cinematic letterbox composition in portrait format, the boat as the single focal point. Condensed uppercase headline in the lower third. Small circular GOD'S OWN sticker on the water. Bottom CTA pill. Moody film-grain finish.",
  },
  {
    id: "travel-europe-tour",
    name: "Europe Grand",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-europe-tour.jpg",
    tagline: "Art-deco skyline collage with a day-count stamp",
    fields: [
      FIELD_HEADLINE("EUROPE GRAND"),
      FIELD_SUBTEXT("10 countries. One epic journey."),
      FIELD_BADGE("12 DAYS"),
      FIELD_CTA("EXPLORE"),
    ],
    palettes: [
      {
        id: "paris",
        name: "Paris Cream",
        prompt: "cream background with black Eiffel-tower silhouette and vivid red accent",
        swatches: ["#FAF3E8", "#DC2626"],
      },
      {
        id: "riviera",
        name: "Riviera",
        prompt: "deep Mediterranean-blue background with white and sun-yellow accents",
        swatches: ["#1D4ED8", "#FDE047"],
      },
      {
        id: "noir",
        name: "Noir Gold",
        prompt: "elegant black background with antique-gold skyline accents",
        swatches: ["#111111", "#C9A227"],
      },
    ],
    hero: "a stylized European skyline collage — Eiffel Tower, canal houses and alpine peaks — in flat graphic shapes with a small steam train crossing the foreground, vintage art-deco travel poster illustration",
    style:
      "Art-deco travel-poster layout: bold geometric headline across the top, sunburst lines behind the skyline. Day-count badge as a circular stamp. Bottom CTA pill. Screen-print texture, restrained classic palette.",
  },
  {
    id: "travel-dubai-package",
    name: "Dubai Nights",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-dubai-package.jpg",
    tagline: "Night-skyline luxury poster with a passport-stamp badge",
    fields: [
      FIELD_HEADLINE("DUBAI NIGHTS"),
      FIELD_SUBTEXT("Skyline thrills & desert luxe."),
      FIELD_BADGE("VISA INCLUDED"),
      FIELD_CTA("FLY NOW"),
    ],
    palettes: [
      {
        id: "gold",
        name: "Gold Rush",
        prompt: "pitch-black background with shimmering gold skyscraper accents",
        swatches: ["#0A0A0A", "#FBBF24"],
      },
      {
        id: "neon",
        name: "Neon Gulf",
        prompt: "deep midnight-blue background with cyan and magenta neon glow",
        swatches: ["#0B1026", "#22D3EE"],
      },
      {
        id: "dune",
        name: "Desert Dune",
        prompt: "warm sand background with deep brown and bronze accents",
        swatches: ["#E8DCC8", "#92400E"],
      },
    ],
    hero: "a glittering night skyline with a needle-like supertall tower piercing low clouds, a desert dune sweeping the foreground, cinematic luxury travel photography",
    style:
      "Towering vertical composition: headline in tall condensed gold lettering climbing the left edge. Visa-included sticker styled like a passport stamp. Premium night-city energy, bottom CTA bar.",
  },
  {
    id: "travel-chardham-yatra",
    name: "Chardham Yatra",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-chardham-yatra.jpg",
    tagline: "Devotional folk poster with temple-arch frame and yatra seal",
    fields: [
      FIELD_HEADLINE("CHARDHAM YATRA"),
      FIELD_SUBTEXT("The sacred 12-day pilgrimage."),
      FIELD_BADGE("2026 YATRA"),
      FIELD_CTA("REGISTER"),
    ],
    palettes: [
      {
        id: "saffron",
        name: "Saffron",
        prompt: "warm ivory background with saffron and deep-maroon devotional accents",
        swatches: ["#FEF3E2", "#9A3412"],
      },
      {
        id: "temple",
        name: "Temple Bell",
        prompt: "deep maroon background with gold temple-bell accents",
        swatches: ["#7F1D1D", "#FBBF24"],
      },
      {
        id: "ganga",
        name: "Ganga Teal",
        prompt: "river-teal background with saffron and ivory accents",
        swatches: ["#0F766E", "#FB923C"],
      },
    ],
    hero: "snow-draped Himalayan temples with prayer flags fluttering, pilgrims ascending stone steps through morning mist, devotional folk-art poster illustration with ornamental borders",
    style:
      "Vernacular devotional-poster layout: ornamental temple-arch frame, headline in strong ceremonial display type. Round 2026-yatra seal sticker. Print-paper texture, reverent calm, bottom CTA bar.",
  },
  {
    id: "travel-goa-weekend",
    name: "Goa Escape",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-goa-weekend.jpg",
    tagline: "Gritty surf-shack gig-poster energy with a starburst badge",
    fields: [
      FIELD_HEADLINE("GOA ESCAPE"),
      FIELD_SUBTEXT("Weekend plans, sorted."),
      FIELD_BADGE("2N/3D"),
      FIELD_CTA("PACK BAGS"),
    ],
    palettes: [
      {
        id: "shack",
        name: "Beach Shack",
        prompt: "bright sunshine-yellow background with palm-green and ink-black accents",
        swatches: ["#FDE047", "#166534"],
      },
      {
        id: "neon",
        name: "Neon Night",
        prompt: "black background with hot-pink and electric-blue neon accents",
        swatches: ["#0A0A0A", "#EC4899"],
      },
      {
        id: "sea",
        name: "Sea Pop",
        prompt: "vivid aqua background with coral and cream accents",
        swatches: ["#06B6D4", "#FB7185"],
      },
    ],
    hero: "a retro beach-shack scene with a striped surfboard, palm shadows and a setting sun, gritty photocopy-poster texture, bold youth-travel energy",
    style:
      "Slanted high-energy condensed headline with photocopy grain. Starburst 2N/3D sticker overlapping the surfboard. Diagonal composition, raw gig-flyer attitude. Bottom CTA bar.",
  },
  {
    id: "travel-desert-safari",
    name: "Desert Safari",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-desert-safari.jpg",
    tagline: "Duotone dune poster with a camel caravan at dusk",
    fields: [
      FIELD_HEADLINE("DESERT SAFARI"),
      FIELD_SUBTEXT("Dunes, camels & starlit camps."),
      FIELD_BADGE("SUNSET RIDE"),
      FIELD_CTA("RIDE NOW"),
    ],
    palettes: [
      {
        id: "dune",
        name: "Golden Dune",
        prompt: "warm sand background with deep-brown dune shadows and burnt-orange accents",
        swatches: ["#E7C873", "#92400E"],
      },
      {
        id: "night",
        name: "Starlit Camp",
        prompt: "deep indigo night background with silver stars and amber campfire glow",
        swatches: ["#1E1B4B", "#F59E0B"],
      },
      {
        id: "ember",
        name: "Dune Ember",
        prompt: "charcoal-black background with molten-orange dune ridges",
        swatches: ["#141414", "#EA580C"],
      },
    ],
    hero: "a camel caravan crossing rippling desert dunes at dusk, a lantern-lit camp glowing below, duotone screen-print poster illustration",
    style:
      "Sweeping diagonal dune lines carrying the eye to the headline. Massive condensed headline in the upper third. Small round sunset-ride sticker. Grainy duotone print finish, CTA pill at the bottom.",
  },
  {
    id: "travel-trekking-expedition",
    name: "Summit Bound",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-trekking-expedition.jpg",
    tagline: "Expedition-map poster with topo lines and a patch badge",
    fields: [
      FIELD_HEADLINE("SUMMIT BOUND"),
      FIELD_SUBTEXT("Guided Himalayan expeditions."),
      FIELD_BADGE("PRO GUIDES"),
      FIELD_CTA("JOIN TREK"),
    ],
    palettes: [
      {
        id: "blueprint",
        name: "Expedition Blueprint",
        prompt: "deep navy background with white topographic-line graphics and safety-orange accents",
        swatches: ["#14213D", "#F97316"],
      },
      {
        id: "alpine",
        name: "Storm Alpine",
        prompt: "misty grey-blue background with dark-slate peaks and crimson accents",
        swatches: ["#64748B", "#DC2626"],
      },
      {
        id: "forest",
        name: "Pine Forest",
        prompt: "deep forest-green background with khaki and bone-white accents",
        swatches: ["#1A3C34", "#E9DCC3"],
      },
    ],
    hero: "a lone trekker with backpack and ice axe on a ridgeline above the clouds, topographic contour lines and route markers drawn across the sky, outdoor-expedition poster illustration",
    style:
      "Technical outdoor-poster layout: topo lines as graphic texture, headline in rugged stencil-condensed type. Pro-guides badge as an embroidered patch sticker. Bottom CTA bar. Expedition-map energy.",
  },
  {
    id: "travel-cruise",
    name: "Ocean Voyage",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-cruise.jpg",
    tagline: "Vintage liner poster with sunburst lines and wax-seal badge",
    fields: [
      FIELD_HEADLINE("OCEAN VOYAGE"),
      FIELD_SUBTEXT("5 nights of pure horizon."),
      FIELD_BADGE("ALL INCLUSIVE"),
      FIELD_CTA("SET SAIL"),
    ],
    palettes: [
      {
        id: "deco",
        name: "Deco Classic",
        prompt: "cream background with deep-navy ocean waves and a gold sun",
        swatches: ["#F7F0E1", "#1E3A8A"],
      },
      {
        id: "coral",
        name: "Coral Tide",
        prompt: "soft coral background with cream and navy accents",
        swatches: ["#FCA5A5", "#1E3A5F"],
      },
      {
        id: "midnight",
        name: "Moonlit Tide",
        prompt: "deep midnight-blue background with a silver moon and teal waves",
        swatches: ["#0B1B33", "#5EEAD4"],
      },
    ],
    hero: "a grand art-deco ocean liner cutting through stylized waves under a geometric sun, seagulls in flat graphic shapes, vintage cruise-poster illustration",
    style:
      "Classic art-deco cruise poster: the liner as the centered hero, radiating sunburst lines, elegant display-serif headline. All-inclusive sticker as a wax-seal badge. Screen-print grain, bottom CTA bar.",
  },
  {
    id: "travel-wildlife-safari",
    name: "Wild Trails",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-wildlife-safari.jpg",
    tagline: "Silhouette-first safari poster with a park-stamp badge",
    fields: [
      FIELD_HEADLINE("WILD TRAILS"),
      FIELD_SUBTEXT("Jungle safaris, up close."),
      FIELD_BADGE("ECO LODGE"),
      FIELD_CTA("BOOK SAFARI"),
    ],
    palettes: [
      {
        id: "savanna",
        name: "Savanna Dust",
        prompt: "deep charcoal-black background with amber animal silhouettes and golden dust",
        swatches: ["#141414", "#F59E0B"],
      },
      {
        id: "jungle",
        name: "Jungle Night",
        prompt: "dark jungle-green background with lime-green and bone accents",
        swatches: ["#14281D", "#A3E635"],
      },
      {
        id: "stripe",
        name: "Tiger Ember",
        prompt: "black background with molten-orange tiger-stripe accents",
        swatches: ["#0C0C0C", "#EA580C"],
      },
    ],
    hero: "an elephant and a tiger rendered as bold amber silhouettes in tall grass against a huge setting sun, glowing dust particles, dramatic wildlife-poster illustration",
    style:
      "The sun is a giant disc behind the headline type. Silhouette-first composition with strong black mass. Eco-lodge sticker as a circular park stamp. Grainy, cinematic, bottom CTA bar.",
  },
  {
    id: "travel-homestay",
    name: "Cozy Homestay",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-homestay.jpg",
    tagline: "Storybook cottage poster with a house-shaped badge",
    fields: [
      FIELD_HEADLINE("COZY HOMESTAY"),
      FIELD_SUBTEXT("Stay local, live slow."),
      FIELD_BADGE("HOST VERIFIED"),
      FIELD_CTA("STAY NOW"),
    ],
    palettes: [
      {
        id: "cottage",
        name: "Cottage Cream",
        prompt: "warm cream background with sage-green and terracotta accents",
        swatches: ["#FAF3E8", "#7C9A6D"],
      },
      {
        id: "pine",
        name: "Pine Morning",
        prompt: "soft pine-green background with cream and honey accents",
        swatches: ["#E8F0E4", "#D97706"],
      },
      {
        id: "dawn",
        name: "Blush Dawn",
        prompt: "blush-peach background with warm brown and ivory accents",
        swatches: ["#FCE7D3", "#8B5E34"],
      },
    ],
    hero: "a charming stone cottage with smoke curling from its chimney, a flower garden and mountains behind, warm morning light, cozy illustrated travel poster with paper texture",
    style:
      "Soft storybook-illustration poster: the cottage as the warm focal point. Rounded friendly headline. Host-verified sticker as a small house-shaped badge. Gentle and inviting, bottom CTA pill.",
  },
  {
    id: "travel-visa-assistance",
    name: "Visa, Sorted",
    category: "Travel",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/travel-visa-assistance.jpg",
    tagline: "Typographic manifesto poster with passport-stamp texture",
    fields: [
      FIELD_HEADLINE("VISA, SORTED"),
      FIELD_SUBTEXT("Fast approvals, zero stress."),
      FIELD_BADGE("98% APPROVAL"),
      FIELD_CTA("APPLY NOW"),
    ],
    palettes: [
      {
        id: "stamp",
        name: "Passport Stamp",
        prompt: "off-white paper background with deep-blue and red passport-stamp accents",
        swatches: ["#F7F4ED", "#1E40AF"],
      },
      {
        id: "midnight",
        name: "Consulate Navy",
        prompt: "deep navy background with gold and cream accents",
        swatches: ["#0F1B3D", "#EAB308"],
      },
      {
        id: "coral",
        name: "Coral Clearance",
        prompt: "warm coral background with ink-black and cream accents",
        swatches: ["#F87171", "#111827"],
      },
    ],
    hero: "a passport with approval stamps fanned across a map of flight routes, small airplane icons tracing dotted paths, bold typographic poster with stamp texture",
    style:
      "Typographic-manifesto poster: the huge headline is the hero, layered passport stamps as graphic texture. 98%-approval sticker as an official-looking seal. Crisp Swiss-influenced grid, bottom CTA bar.",
  },
  // ------------------------------------------------------------- Education
  {
    id: "edu-masterclass-2026",
    name: "Masterclass Live",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-masterclass-2026.jpg",
    tagline: "Cinematic stage poster with an oversized live-date chip",
    fields: [
      FIELD_HEADLINE("MASTERCLASS LIVE"),
      FIELD_SUBTEXT("Learn live from top experts."),
      FIELD_DATE("12 DEC · LIVE"),
      FIELD_CTA("RESERVE SEAT"),
    ],
    palettes: [
      {
        id: "stage",
        name: "Stage Plum",
        prompt: "deep plum background with gold spotlight accents",
        swatches: ["#2E1A3B", "#FBBF24"],
      },
      {
        id: "ink",
        name: "Ink & Crimson",
        prompt: "off-white background with ink-black and crimson accents",
        swatches: ["#FAFAF9", "#DC2626"],
      },
      {
        id: "teal",
        name: "Deep Teal",
        prompt: "deep teal background with cream and amber accents",
        swatches: ["#134E4A", "#FDE68A"],
      },
    ],
    hero: "a charismatic speaker on a dramatic stage with a giant projection screen, sweeping spotlight beams, audience silhouettes in the foreground, cinematic event photography",
    style:
      "Oversized live-date chip as a design element. Headline in tall condensed type over the stage lights. Spotlight beams creating diagonal energy. Premium knowledge-event feel, bottom CTA bar.",
  },
  {
    id: "edu-coding-bootcamp",
    name: "Code Bootcamp",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-coding-bootcamp.jpg",
    tagline: "Dark terminal-energy poster with glowing code graphics",
    fields: [
      FIELD_HEADLINE("CODE BOOTCAMP"),
      FIELD_SUBTEXT("Zero to developer in 12 weeks."),
      FIELD_BADGE("JOB READY"),
      FIELD_CTA("ENROLL"),
    ],
    palettes: [
      {
        id: "terminal",
        name: "Terminal Lime",
        prompt: "pitch-black background with electric lime-green code accents",
        swatches: ["#0A0A0A", "#A3E635"],
      },
      {
        id: "violet",
        name: "Violet Neon",
        prompt: "deep violet-black background with purple-pink neon glow",
        swatches: ["#14101F", "#C084FC"],
      },
      {
        id: "cobalt",
        name: "Cobalt Code",
        prompt: "deep navy background with cyan code glow",
        swatches: ["#0B1E3D", "#22D3EE"],
      },
    ],
    hero: "a laptop glowing with code in a dark room, floating terminal windows and code brackets as graphic elements, cinematic coder-poster photography with realistic screen glow",
    style:
      "Monospace code motifs woven behind a massive condensed headline. Job-ready sticker as a terminal-prompt chip. Dark cinematic workstation energy, bottom CTA bar.",
  },
  {
    id: "edu-spoken-english",
    name: "Speak Up",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-spoken-english.jpg",
    tagline: "Playful pop-art collage of speech bubbles and sound waves",
    fields: [
      FIELD_HEADLINE("SPEAK UP"),
      FIELD_SUBTEXT("Spoken English, made easy."),
      FIELD_BADGE("FREE DEMO"),
      FIELD_CTA("JOIN CLASS"),
    ],
    palettes: [
      {
        id: "pop",
        name: "Pop Coral",
        prompt: "bright coral background with cream and ink-black accents",
        swatches: ["#FF6B5B", "#FFF7ED"],
      },
      {
        id: "sunshine",
        name: "Sunshine",
        prompt: "sunshine-yellow background with teal and ink accents",
        swatches: ["#FDE047", "#0F766E"],
      },
      {
        id: "sky",
        name: "Sky Talk",
        prompt: "sky-blue background with white and navy accents",
        swatches: ["#38BDF8", "#1E3A8A"],
      },
    ],
    hero: "a retro speech-bubble collage bursting with sound-wave graphics and friendly illustrated faces, photocopy-poster texture, bold pop-art energy",
    style:
      "Playful collage poster: oversized speech bubbles as graphic shapes, headline in chunky retro display type. Free-demo sticker as a starburst. High-energy, bottom CTA pill.",
  },
  {
    id: "edu-iit-jee-coaching",
    name: "Crack IIT-JEE",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-iit-jee-coaching.jpg",
    tagline: "Formula-textured manifesto poster with a medal seal",
    fields: [
      FIELD_HEADLINE("CRACK IIT-JEE"),
      FIELD_SUBTEXT("Top ranks. Proven results."),
      FIELD_BADGE("AIR TOP 100"),
      FIELD_CTA("ADMISSIONS OPEN"),
    ],
    palettes: [
      {
        id: "formula",
        name: "Formula Paper",
        prompt: "off-white paper background with ink-black formulas and crimson accents",
        swatches: ["#FAF7F0", "#B91C1C"],
      },
      {
        id: "navy",
        name: "Rank Navy",
        prompt: "deep navy background with gold and white accents",
        swatches: ["#14264A", "#FBBF24"],
      },
      {
        id: "graphite",
        name: "Chalk Graphite",
        prompt: "charcoal background with electric-yellow chalk accents",
        swatches: ["#1C1C1E", "#FDE047"],
      },
    ],
    hero: "physics formulas and geometric diagrams floating around a determined student silhouette at a desk, chalk-on-paper texture, academic-poster illustration",
    style:
      "Typographic-manifesto layout: formulas as background texture, headline in massive condensed type. AIR Top 100 badge as a gold medal seal. Bottom CTA bar. Intense, focused, print-like.",
  },
  {
    id: "edu-upsc-prep",
    name: "Mission UPSC",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-upsc-prep.jpg",
    tagline: "Dignified editorial poster with an India-Gate silhouette",
    fields: [
      FIELD_HEADLINE("MISSION UPSC"),
      FIELD_SUBTEXT("Crack the civil services."),
      FIELD_BADGE("2027 BATCH"),
      FIELD_CTA("ENROLL NOW"),
    ],
    palettes: [
      {
        id: "tricolor",
        name: "Tricolor",
        prompt: "cream background with saffron, white and deep-green panel bands",
        swatches: ["#FDF6E3", "#F97316"],
      },
      {
        id: "ink",
        name: "Ink Dawn",
        prompt: "off-white background with ink-black and saffron accents",
        swatches: ["#FAFAF9", "#EA580C"],
      },
      {
        id: "maroon",
        name: "Maroon Pride",
        prompt: "deep maroon background with gold and cream accents",
        swatches: ["#7F1D1D", "#FCD34D"],
      },
    ],
    hero: "the India Gate silhouette at dawn with an aspirant reading under a tree, rising sun rays, books and an ink pen, dignified editorial illustration",
    style:
      "Editorial poster: India Gate as a monumental silhouette, headline in strong serif-display type. 2027-batch sticker as a circular emblem seal. Restrained, aspirational, bottom CTA bar.",
  },
  {
    id: "edu-design-course",
    name: "Design Lab",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-design-course.jpg",
    tagline: "Swiss-grid poster with geometric design-tool graphics",
    fields: [
      FIELD_HEADLINE("DESIGN LAB"),
      FIELD_SUBTEXT("UI/UX from fundamentals."),
      FIELD_BADGE("JOB PORTFOLIO"),
      FIELD_CTA("START NOW"),
    ],
    palettes: [
      {
        id: "swiss",
        name: "Swiss Red",
        prompt: "off-white background with black grid lines and vivid red accents",
        swatches: ["#F5F2EA", "#DC2626"],
      },
      {
        id: "bauhaus",
        name: "Bauhaus",
        prompt: "cream background with primary-color geometric shapes",
        swatches: ["#FAF3E8", "#2563EB"],
      },
      {
        id: "dark",
        name: "Neon Studio",
        prompt: "charcoal background with neon-pink and lime accents",
        swatches: ["#171717", "#EC4899"],
      },
    ],
    hero: "bold geometric design tools — color swatches, grids and bezier curves — arranged in a Swiss-poster composition, flat graphic illustration with print texture",
    style:
      "Swiss design-poster grid: headline in bold grotesk type, geometric shapes as pure graphic elements. Portfolio sticker as a small color-chip badge. Precise, disciplined, bottom CTA bar.",
  },
  {
    id: "edu-music-academy",
    name: "Raga Roots",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-music-academy.jpg",
    tagline: "Warm cultural poster with a mandala frame and sitar hero",
    fields: [
      FIELD_HEADLINE("RAGA ROOTS"),
      FIELD_SUBTEXT("Classical & modern music."),
      FIELD_BADGE("ALL AGES"),
      FIELD_CTA("BOOK TRIAL"),
    ],
    palettes: [
      {
        id: "tanpura",
        name: "Tanpura Ivory",
        prompt: "warm ivory background with deep maroon and gold accents",
        swatches: ["#FEF6E4", "#9A3412"],
      },
      {
        id: "stage",
        name: "Stage Amber",
        prompt: "deep plum background with amber stage-light accents",
        swatches: ["#2A1830", "#F59E0B"],
      },
      {
        id: "indigo",
        name: "Indigo Raga",
        prompt: "indigo night background with a silver moon and saffron accents",
        swatches: ["#232946", "#FB923C"],
      },
    ],
    hero: "a sitar and tabla rendered in warm illustrated detail against a mandala-patterned backdrop, musical notes drifting upward, cultural poster illustration with paper grain",
    style:
      "Vernacular cultural-poster layout: ornamental mandala frame, headline in expressive display type with a classical feel. All-ages seal sticker. Rich, warm, bottom CTA bar.",
  },
  {
    id: "edu-dance-classes",
    name: "Move Studio",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-dance-classes.jpg",
    tagline: "Grunge street-dance poster with motion-blur streaks",
    fields: [
      FIELD_HEADLINE("MOVE STUDIO"),
      FIELD_SUBTEXT("Hip-hop, classical & more."),
      FIELD_BADGE("FREE TRIAL"),
      FIELD_CTA("JOIN NOW"),
    ],
    palettes: [
      {
        id: "street",
        name: "Street Neon",
        prompt: "black background with hot-pink and electric-blue motion streaks",
        swatches: ["#0A0A0A", "#EC4899"],
      },
      {
        id: "ember",
        name: "Ember Motion",
        prompt: "charcoal background with orange motion-blur accents",
        swatches: ["#1A1A1A", "#F97316"],
      },
      {
        id: "violet",
        name: "Violet Stage",
        prompt: "deep purple background with lime and white accents",
        swatches: ["#3B0764", "#A3E635"],
      },
    ],
    hero: "a dancer frozen mid-leap with motion-blur trails, dramatic rim lighting, gritty urban-poster photography with photocopy grain",
    style:
      "High-energy grunge poster: diagonal motion lines, headline in slanted condensed type. Free-trial sticker as a burst badge. Raw street-studio attitude, bottom CTA bar.",
  },
  {
    id: "edu-abacus-kids",
    name: "Little Geniuses",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-abacus-kids.jpg",
    tagline: "Playful kids poster with a giant illustrated abacus",
    fields: [
      FIELD_HEADLINE("LITTLE GENIUSES"),
      FIELD_SUBTEXT("Abacus classes for ages 4–12."),
      FIELD_BADGE("BRAIN BOOST"),
      FIELD_CTA("TRY FREE"),
    ],
    palettes: [
      {
        id: "candy",
        name: "Candy Sun",
        prompt: "soft sunshine-yellow background with coral and teal accents",
        swatches: ["#FEF3C7", "#F87171"],
      },
      {
        id: "mint",
        name: "Mint Fresh",
        prompt: "fresh mint-green background with navy and coral accents",
        swatches: ["#D1FAE5", "#1E3A8A"],
      },
      {
        id: "sky",
        name: "Sky Play",
        prompt: "soft sky-blue background with sunny-yellow and white accents",
        swatches: ["#DBEAFE", "#FBBF24"],
      },
    ],
    hero: "a cheerful illustrated abacus with colorful beads, floating numbers and stars, a happy kid silhouette, playful flat illustration with rounded shapes",
    style:
      "Playful infographic-style poster: modular rounded panels, headline in bubbly rounded display type. Brain-boost sticker as a star badge. Joyful, clean, bottom CTA pill.",
  },
  {
    id: "edu-digital-marketing",
    name: "Market Minds",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-digital-marketing.jpg",
    tagline: "Clean conversion poster with a rocket-launch growth chart",
    fields: [
      FIELD_HEADLINE("MARKET MINDS"),
      FIELD_SUBTEXT("Digital marketing, job-ready."),
      FIELD_BADGE("CERTIFIED"),
      FIELD_CTA("ENROLL"),
    ],
    palettes: [
      {
        id: "growth",
        name: "Growth Green",
        prompt: "off-white background with deep-green growth-chart accents and ink details",
        swatches: ["#F8FAFC", "#16A34A"],
      },
      {
        id: "night",
        name: "Data Night",
        prompt: "deep navy background with cyan and magenta data accents",
        swatches: ["#0B1E3D", "#06B6D4"],
      },
      {
        id: "ember",
        name: "Ember Boost",
        prompt: "cream background with orange and charcoal accents",
        swatches: ["#FDF3E7", "#EA580C"],
      },
    ],
    hero: "a rising bar chart morphing into a rocket launch, a megaphone and social icons as flat graphic elements, clean modern ad illustration",
    style:
      "Clean conversion-focused ad poster: the chart as the hero graphic, headline in bold confident grotesk. Certified sticker as a checkmark seal. Structured layout, bottom CTA bar.",
  },
  {
    id: "edu-data-science",
    name: "Data Deep",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-data-science.jpg",
    tagline: "Dark neural-network poster with a code-chip badge",
    fields: [
      FIELD_HEADLINE("DATA DEEP"),
      FIELD_SUBTEXT("ML, AI & analytics mastery."),
      FIELD_BADGE("PYTHON + ML"),
      FIELD_CTA("START LEARNING"),
    ],
    palettes: [
      {
        id: "matrix",
        name: "Network Cyan",
        prompt: "deep black-blue background with cyan network-node accents",
        swatches: ["#050D1A", "#22D3EE"],
      },
      {
        id: "violet",
        name: "Deep Violet",
        prompt: "dark violet background with electric-purple and pink accents",
        swatches: ["#1E1033", "#A855F7"],
      },
      {
        id: "paper",
        name: "Blueprint Paper",
        prompt: "off-white background with navy network diagrams and coral accents",
        swatches: ["#F7F5F0", "#1E3A8A"],
      },
    ],
    hero: "an abstract neural-network constellation glowing over a dark analytics dashboard, floating data points, cinematic tech-poster illustration",
    style:
      "Dark cinematic tech poster: the glowing network as the focal web, headline in sharp futuristic condensed type. Python+ML sticker as a code-chip badge. Precise, intelligent, bottom CTA bar.",
  },
  {
    id: "edu-photography-workshop",
    name: "Frame It",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-photography-workshop.jpg",
    tagline: "Moody camera poster with film-frame graphics",
    fields: [
      FIELD_HEADLINE("FRAME IT"),
      FIELD_SUBTEXT("Weekend photography workshop."),
      FIELD_BADGE("2-DAY"),
      FIELD_CTA("GRAB SEAT"),
    ],
    palettes: [
      {
        id: "darkroom",
        name: "Darkroom Amber",
        prompt: "pitch-black background with warm amber safelight accents",
        swatches: ["#0C0A09", "#F59E0B"],
      },
      {
        id: "film",
        name: "Film Cream",
        prompt: "warm cream background with film-strip graphics and crimson accents",
        swatches: ["#FAF3E8", "#DC2626"],
      },
      {
        id: "teal",
        name: "Studio Teal",
        prompt: "deep teal background with cream and gold accents",
        swatches: ["#134E4A", "#FBBF24"],
      },
    ],
    hero: "a vintage camera close-up with aperture blades, dramatic side lighting, floating film frames showing landscapes, moody cinematic poster photography",
    style:
      "Moody cinematic poster: the camera as the hero object, film frames as graphic texture, headline in bold condensed type. 2-day sticker as a clapperboard chip. Bottom CTA bar.",
  },
  {
    id: "edu-language-institute",
    name: "Polyglot Club",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-language-institute.jpg",
    tagline: "Multilingual-glyph manifesto poster with a stamp badge",
    fields: [
      FIELD_HEADLINE("POLYGLOT CLUB"),
      FIELD_SUBTEXT("12 languages, native tutors."),
      FIELD_BADGE("NEW BATCH"),
      FIELD_CTA("LEARN NOW"),
    ],
    palettes: [
      {
        id: "globe",
        name: "Globe Blue",
        prompt: "deep ocean-blue background with colorful speech-bubble accents",
        swatches: ["#1E3A8A", "#FBBF24"],
      },
      {
        id: "ink",
        name: "Ink Glyphs",
        prompt: "off-white background with ink-black multilingual type and red accents",
        swatches: ["#FAF7F0", "#DC2626"],
      },
      {
        id: "night",
        name: "Neon Night",
        prompt: "charcoal background with neon-green and gold glyph accents",
        swatches: ["#171717", "#A3E635"],
      },
    ],
    hero: "a globe wrapped in colorful speech bubbles with hello written in many scripts, bold typographic poster with playful global energy",
    style:
      "Typographic-manifesto poster: multilingual glyphs as the graphic texture, headline in massive stacked type. New-batch sticker as a passport-stamp chip. Bottom CTA bar.",
  },
  {
    id: "edu-scholarship-test",
    name: "Win Big",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-scholarship-test.jpg",
    tagline: "Celebratory sale-energy poster with a giant trophy hero",
    fields: [
      FIELD_HEADLINE("WIN BIG"),
      FIELD_SUBTEXT("Scholarship test — up to 100% off."),
      FIELD_BADGE("100% OFF"),
      FIELD_CTA("REGISTER FREE"),
    ],
    palettes: [
      {
        id: "trophy",
        name: "Trophy Navy",
        prompt: "deep navy background with gold trophy and confetti accents",
        swatches: ["#14264A", "#FBBF24"],
      },
      {
        id: "crimson",
        name: "Winner Crimson",
        prompt: "rich crimson background with gold and cream accents",
        swatches: ["#991B1B", "#FDE68A"],
      },
      {
        id: "emerald",
        name: "Winner Emerald",
        prompt: "deep emerald background with gold accents",
        swatches: ["#065F46", "#FCD34D"],
      },
    ],
    hero: "a golden trophy bursting from a gift box amid confetti and starbursts, dynamic sale-poster energy, bold flat illustration",
    style:
      "The trophy IS the hero — enormous and centered, radiating starburst shapes. Giant condensed headline above. 100%-off sticker as a gold seal. Loud, celebratory, bottom CTA bar.",
  },
  {
    id: "edu-preschool-admissions",
    name: "Tiny Steps",
    category: "Education",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/edu-preschool-admissions.jpg",
    tagline: "Soft pastel poster with a storybook schoolhouse",
    fields: [
      FIELD_HEADLINE("TINY STEPS"),
      FIELD_SUBTEXT("Admissions open for 2026."),
      FIELD_BADGE("PLAY & LEARN"),
      FIELD_CTA("VISIT US"),
    ],
    palettes: [
      {
        id: "pastel",
        name: "Pastel Peach",
        prompt: "soft peach background with sage-green and butter-yellow accents",
        swatches: ["#FDEBD3", "#A8C69F"],
      },
      {
        id: "sky",
        name: "Baby Sky",
        prompt: "soft baby-blue background with coral and cream accents",
        swatches: ["#DCEBF7", "#F9A8A8"],
      },
      {
        id: "mint",
        name: "Mint Meadow",
        prompt: "soft mint background with lavender and cream accents",
        swatches: ["#D9F2E3", "#C4B5FD"],
      },
    ],
    hero: "a cheerful illustrated schoolhouse with a rainbow, a smiling sun and playful animal friends, soft rounded shapes, gentle children's-book illustration",
    style:
      "Minimal soft poster: the schoolhouse as the warm focal point, headline in rounded friendly type. Play-&-learn sticker as a small rainbow badge. Ample whitespace, bottom CTA pill.",
  },
];
