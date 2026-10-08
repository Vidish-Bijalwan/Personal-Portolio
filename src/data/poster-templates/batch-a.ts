/**
 * Etch Poster Studio — Batch A template expansion (WS2a).
 *
 * 30 ORIGINAL designs: 15 Food & Drink + 15 Events.
 * Each template is a prompt blueprint + style spec encoding professional
 * flyer/poster design patterns (bold condensed display type, high-contrast
 * color blocking, 4:5 portrait composition, sticker badges, minimal-text
 * discipline). No template copies any existing poster design.
 *
 * Additive only: the integrator wires BATCH_A into the catalog.
 * Text discipline: headline ≤ ~4 words in thumbnails; AI models garble
 * long text, so every field default stays short.
 */

import type { PosterField, PosterTemplate } from "./templates";

const HL = (def: string, maxLength = 22): PosterField => ({
  key: "headline",
  label: "Headline",
  default: def,
  maxLength,
});
const SUB = (def: string): PosterField => ({
  key: "subtext",
  label: "Supporting line",
  default: def,
  maxLength: 64,
});
const BADGE = (def: string): PosterField => ({
  key: "badge",
  label: "Badge / sticker",
  default: def,
  maxLength: 14,
});
const CTA = (def: string): PosterField => ({
  key: "cta",
  label: "Call to action",
  default: def,
  maxLength: 22,
});
const DATE = (def: string): PosterField => ({
  key: "date",
  label: "Date",
  default: def,
  maxLength: 20,
});

export const BATCH_A: PosterTemplate[] = [
  // ───────────────────────── FOOD & DRINK (15) ─────────────────────────
  {
    id: "food-ramen-steam",
    name: "Ramen Steam",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-ramen-steam.jpg",
    tagline: "Moody izakaya ramen poster with steam and sticker badge",
    fields: [
      HL("RAMEN NIGHT"),
      SUB("Rich broth. Springy noodles."),
      BADGE("STEAMING"),
      CTA("SLURP NOW"),
    ],
    palettes: [
      {
        id: "izakaya",
        name: "Izakaya Night",
        prompt: "dark midnight-navy background with warm amber lantern-glow accents",
        swatches: ["#141B2D", "#F59E0B"],
      },
      {
        id: "chili",
        name: "Chili Heat",
        prompt: "deep chili-red background with cream and charcoal accents",
        swatches: ["#B91C1C", "#FDEEDC"],
      },
    ],
    hero: "a steaming bowl of tonkotsu ramen with chopsticks lifting noodles, soft-boiled egg, nori sheet and chili oil swirl, rising steam, moody dark izakaya food photography",
    style:
      "Tall vertical composition with the ramen bowl dominating the center. Headline in huge bold condensed uppercase across the upper third. Rising steam as a design element. Circular STEAMING sticker badge overlapping the bowl rim. Bottom CTA bar.",
  },
  {
    id: "food-pizza-fire",
    name: "Pizza Fire",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-pizza-fire.jpg",
    tagline: "Wood-fired pizza hero with dramatic cheese pull",
    fields: [
      HL("PIZZA TIME"),
      SUB("Wood-fired. Loaded. Legendary."),
      BADGE("HOT"),
      CTA("ORDER HOT"),
    ],
    palettes: [
      {
        id: "napoli",
        name: "Napoli",
        prompt: "dark charcoal background with tomato-red and golden-cheese accents",
        swatches: ["#1C1917", "#DC2626"],
      },
      {
        id: "basil",
        name: "Basil",
        prompt: "warm cream background with basil-green and tomato-red accents",
        swatches: ["#FDF6E3", "#15803D"],
      },
    ],
    hero: "a hand lifting a blistered wood-fired pizza slice with a dramatic cheese pull, charred crust, fresh basil, glowing pizza-oven flames behind, appetizing food photography",
    style:
      "Diagonal dynamic composition with the cheese pull stretching across the frame. Massive condensed headline stacked top-left. Small round HOT badge. High-heat pizzeria energy, CTA pill at the bottom.",
  },
  {
    id: "food-biryani-royal",
    name: "Biryani Royal",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-biryani-royal.jpg",
    tagline: "Regal biryani poster with saffron and gold",
    fields: [
      HL("BIRYANI FEST"),
      SUB("Fragrant dum, served royal."),
      BADGE("DUM"),
      CTA("TASTE ROYALTY"),
    ],
    palettes: [
      {
        id: "royal",
        name: "Royal Maroon",
        prompt: "deep maroon background with saffron-gold accents and ornamental detail",
        swatches: ["#6B1B1B", "#FBBF24"],
      },
      {
        id: "saffron",
        name: "Saffron Glow",
        prompt: "warm saffron-orange background with cream and deep-brown accents",
        swatches: ["#EA7E1C", "#FFF7E6"],
      },
    ],
    hero: "an open brass handi of fragrant chicken biryani with saffron-streaked rice, crispy fried onions, mint raita bowl beside it, rich Indian food photography with aromatic steam",
    style:
      "Regal centered composition, the handi glowing like a centerpiece. Elegant bold headline with a gold ornamental divider. Round DUM sticker seal. Festive royal-dining feel, CTA bar at the bottom.",
  },
  {
    id: "food-juice-fresh",
    name: "Fresh Pressed",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-juice-fresh.jpg",
    tagline: "High-energy juice bar poster with citrus splash",
    fields: [
      HL("FRESH PRESSED"),
      SUB("No sugar. Just fruit."),
      BADGE("100% PURE"),
      CTA("SIP FRESH"),
    ],
    palettes: [
      {
        id: "citrus",
        name: "Citrus Pop",
        prompt: "vivid orange background with lime-green and white accents",
        swatches: ["#F97316", "#A3E635"],
      },
      {
        id: "tropical",
        name: "Tropical",
        prompt: "bright teal background with sunny yellow and white accents",
        swatches: ["#0D9488", "#FDE047"],
      },
    ],
    hero: "glasses of vibrant orange and green fresh-pressed juice with a frozen citrus splash, sliced oranges, mint leaves and water droplets, energetic beverage photography",
    style:
      "Explosive upward composition with the juice splash as the visual climax. Chunky rounded bold headline across the top. Starburst 100% PURE badge. Fresh, loud, summery juice-bar energy.",
  },
  {
    id: "food-finedine-plate",
    name: "Fine Plate",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-finedine-plate.jpg",
    tagline: "Understated luxury tasting-menu poster",
    fields: [
      HL("FINE DINING"),
      SUB("A tasting menu to remember."),
      BADGE("CHEF'S"),
      CTA("RESERVE"),
    ],
    palettes: [
      {
        id: "noir",
        name: "Noir Gold",
        prompt: "elegant pitch-black background with brushed-gold accents and soft spotlight",
        swatches: ["#0C0A09", "#C9A227"],
      },
      {
        id: "ivory",
        name: "Ivory Garden",
        prompt: "warm ivory background with deep botanical-green and ink accents",
        swatches: ["#FAF6EC", "#1B4332"],
      },
    ],
    hero: "an artfully plated fine-dining dish with micro-herbs and sauce dots on a dark slate plate, dramatic side light, moody Michelin-star food photography",
    style:
      "Minimal gallery-like composition with generous negative space around the plate. Refined serif headline with wide letter spacing. Small elegant CHEF'S seal. Quiet luxury, CTA line at the bottom.",
  },
  {
    id: "food-taco-truck",
    name: "Taco Truck",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-taco-truck.jpg",
    tagline: "Neon-lit food truck flyer with street energy",
    fields: [
      HL("TACO TRUCK"),
      SUB("Find us. Follow the smell."),
      BADGE("ON WHEELS"),
      CTA("TRACK US"),
    ],
    palettes: [
      {
        id: "neon",
        name: "Neon Street",
        prompt: "pure black background with neon pink and electric-yellow accents",
        swatches: ["#0A0A0A", "#EC4899"],
      },
      {
        id: "fiesta",
        name: "Fiesta",
        prompt: "deep teal background with coral-red and cream accents",
        swatches: ["#0F766E", "#FB7185"],
      },
    ],
    hero: "a colorfully painted taco truck glowing at night with string lights, tacos loaded with lime and cilantro in the foreground, urban street-food scene",
    style:
      "Night-market energy with the glowing truck as the anchor. Slanted condensed headline with motion. Rectangular ON WHEELS sticker chip. Raw street-food flyer attitude, CTA bar at the bottom.",
  },
  {
    id: "food-sundae-tower",
    name: "Sundae Tower",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-sundae-tower.jpg",
    tagline: "Indulgent dessert-parlor poster with a towering sundae",
    fields: [
      HL("SWEET ENDINGS"),
      SUB("Sundaes, shakes and smiles."),
      BADGE("INDULGE"),
      CTA("TREAT YOURSELF"),
    ],
    palettes: [
      {
        id: "candy",
        name: "Candy Shop",
        prompt: "soft bubblegum-pink background with chocolate-brown and cream accents",
        swatches: ["#F9A8D4", "#5C3D2E"],
      },
      {
        id: "midnight",
        name: "Midnight Scoop",
        prompt: "deep plum-purple background with gold and cream accents",
        swatches: ["#3B1D5C", "#FBBF24"],
      },
    ],
    hero: "a towering triple-scoop ice-cream sundae with chocolate drizzle, wafer sticks and a cherry, dramatic dessert photography with glossy indulgent detail",
    style:
      "The sundae tower rises vertically as the hero column. Playful rounded bold headline arched across the top. Ribbon-style INDULGE badge. Decadent dessert-parlor joy, CTA bar at the bottom.",
  },
  {
    id: "food-thali-feast",
    name: "Royal Thali",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-thali-feast.jpg",
    tagline: "Overhead brass-thali feast with festive warmth",
    fields: [
      HL("ROYAL THALI"),
      SUB("Twelve dishes, one platter."),
      BADGE("UNLIMITED"),
      CTA("FEAST NOW"),
    ],
    palettes: [
      {
        id: "brass",
        name: "Brass & Clay",
        prompt: "deep espresso-brown background with brass-gold and cream accents",
        swatches: ["#3E2A1E", "#D4A017"],
      },
      {
        id: "festive",
        name: "Festive Red",
        prompt: "rich crimson background with gold and cream accents, marigold warmth",
        swatches: ["#9B1B1B", "#FCD34D"],
      },
    ],
    hero: "an overhead flat-lay of a gleaming brass thali with twelve small bowls of curries, dal, rice, rotis and sweets, festive Indian feast photography",
    style:
      "Symmetrical overhead feast filling the upper two-thirds. Bold headline with a decorative divider band. Circular UNLIMITED stamp badge. Abundant celebratory energy, CTA bar at the bottom.",
  },
  {
    id: "food-roast-house",
    name: "Roast House",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-roast-house.jpg",
    tagline: "Craft coffee-roastery poster with bean texture",
    fields: [
      HL("SMALL-BATCH ROAST"),
      SUB("Roasted weekly. Brewed right."),
      BADGE("FRESH ROAST"),
      CTA("GRAB A BAG"),
    ],
    palettes: [
      {
        id: "espresso",
        name: "Espresso",
        prompt: "dark roast-brown background with copper and cream accents",
        swatches: ["#2E1B12", "#B87333"],
      },
      {
        id: "kraft",
        name: "Kraft Paper",
        prompt: "warm kraft-paper tan background with ink-black and burnt-orange accents",
        swatches: ["#C8A97E", "#1C1917"],
      },
    ],
    hero: "glossy freshly roasted coffee beans pouring from a burlap sack with a vintage roaster machine softly blurred behind, warm craft-roastery photography",
    style:
      "Textured, craft-forward composition with beans cascading diagonally. Sturdy industrial headline in a strong grotesk. Rubber-stamp FRESH ROAST badge. Artisan roastery honesty, CTA bar at the bottom.",
  },
  {
    id: "food-chaat-attack",
    name: "Chaat Attack",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-chaat-attack.jpg",
    tagline: "Loud street-chaat poster with tangy pop",
    fields: [
      HL("CHAAT ATTACK"),
      SUB("Tangy, crunchy, iconic."),
      BADGE("SPICY"),
      CTA("EAT STREET"),
    ],
    palettes: [
      {
        id: "masala",
        name: "Masala Punch",
        prompt: "bold tandoori-orange background with teal and cream accents",
        swatches: ["#E8590C", "#0F766E"],
      },
      {
        id: "nightmarket",
        name: "Night Market",
        prompt: "pitch-black background with lime-green and hot-pink accents",
        swatches: ["#0A0A0A", "#A3E635"],
      },
    ],
    hero: "crispy golgappe filled with spiced water and potatoes, a street vendor's cart with glowing bulbs and steel bowls, vibrant Indian street-food photography",
    style:
      "Loud, punchy street-poster energy. Huge condensed headline tilted slightly. Starburst SPICY badge. High-saturation appetizing chaos, tightly controlled, CTA bar at the bottom.",
  },
  {
    id: "food-bake-bulk",
    name: "Bake In Bulk",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-bake-bulk.jpg",
    tagline: "Wholesale bakery poster with rustic bread rows",
    fields: [
      HL("BAKE IN BULK"),
      SUB("Daily bread for cafes and caterers."),
      BADGE("B2B"),
      CTA("GET QUOTE"),
    ],
    palettes: [
      {
        id: "wheat",
        name: "Wheat Field",
        prompt: "warm wheat-tan background with crust-brown and cream accents",
        swatches: ["#D9B77C", "#6B4226"],
      },
      {
        id: "industrial",
        name: "Oven Industrial",
        prompt: "warm grey background with charcoal and oven-amber accents",
        swatches: ["#8A8A8A", "#F59E0B"],
      },
    ],
    hero: "rows of golden artisan bread loaves and baguettes on wooden racks inside a working bakery, flour dust in warm light, rustic wholesale-bakery photography",
    style:
      "Orderly, trustworthy trade-poster layout. Strong block headline over the bread rows. Rectangular B2B trade badge. Honest bakery-industry feel, CTA bar at the bottom.",
  },
  {
    id: "food-tiffin-home",
    name: "Home Tiffin",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-tiffin-home.jpg",
    tagline: "Warm tiffin-service poster with homely comfort",
    fields: [
      HL("HOME TIFFIN"),
      SUB("Ghar ka khana, delivered."),
      BADGE("DAILY"),
      CTA("SUBSCRIBE"),
    ],
    palettes: [
      {
        id: "homely",
        name: "Homely Turmeric",
        prompt: "warm cream background with turmeric-yellow and terracotta accents",
        swatches: ["#FDF3E3", "#EAB308"],
      },
      {
        id: "steel",
        name: "Steel Dabba",
        prompt: "soft light-grey background with steel-silver and warm-orange accents",
        swatches: ["#D6D3D1", "#EA7E1C"],
      },
    ],
    hero: "a classic steel tiffin carrier opened to reveal homely dal, sabzi, roti and rice, steam rising, warm homestyle Indian meal photography",
    style:
      "Warm, honest, homely composition. Friendly rounded bold headline. Circular DAILY sticker. Comfort-food trust, CTA pill bar at the bottom.",
  },
  {
    id: "food-smoke-fire",
    name: "Smoke & Fire",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-smoke-fire.jpg",
    tagline: "Charcoal grill poster with flames and smoke",
    fields: [
      HL("SMOKE & FIRE"),
      SUB("Slow-smoked, fast gone."),
      BADGE("CHARCOAL"),
      CTA("BOOK TABLE"),
    ],
    palettes: [
      {
        id: "ember",
        name: "Ember Night",
        prompt: "pitch-black background with glowing ember-orange and flame-yellow accents",
        swatches: ["#0A0A0A", "#F97316"],
      },
      {
        id: "smoke",
        name: "Smokehouse",
        prompt: "dark charcoal-grey background with amber glow and deep-red accents",
        swatches: ["#292524", "#B45309"],
      },
    ],
    hero: "skewers of marinated kebabs grilling over open charcoal flames at night, sparks and smoke rising, dramatic barbecue food photography",
    style:
      "Dramatic dark composition with flames as the design energy. Massive condensed headline glowing at the top. Burnt-edge CHARCOAL sticker badge. Primal grill-house intensity, CTA bar at the bottom.",
  },
  {
    id: "food-brunch-club",
    name: "Brunch Club",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-brunch-club.jpg",
    tagline: "Bright weekend-brunch poster with sunny spread",
    fields: [
      HL("WEEKEND BRUNCH"),
      SUB("Pancakes, eggs, bottomless coffee."),
      BADGE("SAT-SUN"),
      CTA("BRING FRIENDS"),
    ],
    palettes: [
      {
        id: "sunny",
        name: "Sunny Side",
        prompt: "bright cream background with coral and sunny-yellow accents",
        swatches: ["#FFF7ED", "#FB7185"],
      },
      {
        id: "mint",
        name: "Mint Morning",
        prompt: "soft mint-green background with terracotta and cream accents",
        swatches: ["#D1FAE5", "#C96F4A"],
      },
    ],
    hero: "a bright top-down brunch spread with pancakes, avocado toast, eggs and coffee cups on a sunny table, cheerful weekend food photography",
    style:
      "Airy top-down spread filling the frame. Cheerful bold rounded headline. Sun-shaped SAT-SUN badge. Light, social weekend energy, CTA bar at the bottom.",
  },
  {
    id: "food-dosa-crisp",
    name: "Crispy Dosa",
    category: "Food & Drink",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/food-dosa-crisp.jpg",
    tagline: "Golden South-Indian dosa poster with banana-leaf freshness",
    fields: [
      HL("CRISPY DOSA"),
      SUB("Golden, crisp, served hot."),
      BADGE("SOUTH"),
      CTA("TASTE NOW"),
    ],
    palettes: [
      {
        id: "bananaleaf",
        name: "Banana Leaf",
        prompt: "fresh banana-leaf green background with golden-yellow and cream accents",
        swatches: ["#2F7D4F", "#FBBF24"],
      },
      {
        id: "tandoor",
        name: "Tandoor Night",
        prompt: "dark charcoal background with glowing golden-orange and cream accents",
        swatches: ["#292524", "#F59E0B"],
      },
    ],
    hero: "a giant golden crispy dosa folded on a banana leaf with coconut chutney and sambar bowls, steam rising, vibrant South-Indian food photography",
    style:
      "The dosa arcs dramatically across the frame like a golden sail. Bold condensed headline stacked at the top. Round SOUTH sticker badge. Fresh, appetizing, proudly South-Indian energy, CTA bar at the bottom.",
  },
  // ───────────────────────── EVENTS (15) ─────────────────────────
  {
    id: "event-comedy-club",
    name: "Comedy Club",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-comedy-club.jpg",
    tagline: "Stand-up comedy poster with spotlight and punch",
    fields: [
      HL("LAUGH OUT LOUD"),
      SUB("Five comics, zero mercy."),
      DATE("FRI · 8 PM"),
      CTA("BOOK SEATS"),
    ],
    palettes: [
      {
        id: "clubred",
        name: "Club Red",
        prompt: "pitch-black background with stage-spotlight white and comedy-club red accents",
        swatches: ["#0A0A0A", "#DC2626"],
      },
      {
        id: "spotlight",
        name: "Spotlight",
        prompt: "deep navy background with warm spotlight-gold and cream accents",
        swatches: ["#1E1B4B", "#FBBF24"],
      },
    ],
    hero: "a stand-up comedian holding a mic under a single dramatic spotlight, laughing crowd silhouettes in the dark, comedy-club photography",
    style:
      "Spotlight cone as the central design axis. Punchy condensed headline in the light beam. Oversized date numerals. High-laugh comedy-night energy, ticket CTA bar at the bottom.",
  },
  {
    id: "event-marathon-dawn",
    name: "Marathon Dawn",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-marathon-dawn.jpg",
    tagline: "Sunrise marathon poster with runner energy",
    fields: [
      HL("RUN THE CITY"),
      SUB("10K and half marathon."),
      DATE("SUN · 5:30 AM"),
      CTA("REGISTER"),
    ],
    palettes: [
      {
        id: "sunrise",
        name: "Sunrise",
        prompt: "warm dawn-orange gradient background with deep navy and white accents",
        swatches: ["#FB923C", "#1E3A8A"],
      },
      {
        id: "volt",
        name: "Volt",
        prompt: "pitch-black background with electric lime-green and white accents",
        swatches: ["#0A0A0A", "#A3E635"],
      },
    ],
    hero: "a pack of runners sprinting through a city street at sunrise, motion energy, long shadows, inspiring sports photography",
    style:
      "Forward-driving diagonal composition with runners surging upward. Massive italic condensed headline with speed. Date chip with runner icon energy. Motivational race-day intensity, CTA bar at the bottom.",
  },
  {
    id: "event-paint-sip",
    name: "Paint & Sip",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-paint-sip.jpg",
    tagline: "Playful art-workshop poster with paint splashes",
    fields: [
      HL("PAINT & SIP"),
      SUB("No experience needed."),
      DATE("SAT · 4 PM"),
      CTA("SAVE SPOT"),
    ],
    palettes: [
      {
        id: "studio",
        name: "Studio Splash",
        prompt: "warm off-white background with vermilion-red, cobalt and ochre paint-splash accents",
        swatches: ["#FAF3E8", "#E11D48"],
      },
      {
        id: "dusk",
        name: "Dusk Canvas",
        prompt: "deep plum background with peach and gold paint-splash accents",
        swatches: ["#4A1D5C", "#FDBA74"],
      },
    ],
    hero: "hands holding a paintbrush over a colorful half-finished canvas, paint splashes and palettes around, joyful creative-workshop photography",
    style:
      "Playful asymmetric composition with paint splashes framing the headline. Hand-drawn-feel bold lettering. Round SAVE SPOT sticker. Creative, welcoming workshop vibe, CTA bar at the bottom.",
  },
  {
    id: "event-streetfood-fest",
    name: "Street Food Fest",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-streetfood-fest.jpg",
    tagline: "Buzzing night food-fest poster with market lights",
    fields: [
      HL("STREET FOOD FEST"),
      SUB("40 stalls. One weekend."),
      DATE("16-17 DEC"),
      CTA("GET ENTRY"),
    ],
    palettes: [
      {
        id: "lantern",
        name: "Lantern Night",
        prompt: "pitch-black background with warm lantern-yellow and chili-red accents",
        swatches: ["#0A0A0A", "#FBBF24"],
      },
      {
        id: "spice",
        name: "Spice Route",
        prompt: "deep crimson background with turmeric-yellow and cream accents",
        swatches: ["#991B1B", "#EAB308"],
      },
    ],
    hero: "a bustling night street-food market with glowing stalls, hanging lanterns, steam and crowds, vibrant festival photography",
    style:
      "Dense, festive night-market scene as the backdrop. Chunky bold headline with a glowing effect. Date banner ribbon. Mouthwatering festival abundance, CTA bar at the bottom.",
  },
  {
    id: "event-builders-meetup",
    name: "Builders Meetup",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-builders-meetup.jpg",
    tagline: "Tech meetup poster with code and stage glow",
    fields: [
      HL("BUILDERS MEETUP"),
      SUB("Demos, talks, networking."),
      DATE("THU · 6 PM"),
      CTA("RSVP FREE"),
    ],
    palettes: [
      {
        id: "terminal",
        name: "Terminal",
        prompt: "pitch-black background with terminal-green and white accents",
        swatches: ["#0A0A0A", "#22C55E"],
      },
      {
        id: "blueprint",
        name: "Blueprint",
        prompt: "deep navy background with cyan and white accents",
        swatches: ["#172554", "#22D3EE"],
      },
    ],
    hero: "a speaker on stage with glowing code on a giant screen, engaged developer audience, modern tech-event photography with blue stage light",
    style:
      "Structured tech-event layout with a monospace date chip. Bold geometric headline. Glowing code-screen texture behind. Sharp, intelligent, community energy, CTA bar at the bottom.",
  },
  {
    id: "event-wedding-expo",
    name: "Wedding Expo",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-wedding-expo.jpg",
    tagline: "Elegant wedding-expo poster with floral luxury",
    fields: [
      HL("WEDDING EXPO"),
      SUB("Venues, couture, decor."),
      DATE("20 JAN"),
      CTA("GET INVITE"),
    ],
    palettes: [
      {
        id: "blushgold",
        name: "Blush Gold",
        prompt: "soft blush-pink background with gold and cream accents, floral elegance",
        swatches: ["#F9D5D3", "#C9A227"],
      },
      {
        id: "royal",
        name: "Royal Maroon",
        prompt: "deep maroon background with gold and ivory accents",
        swatches: ["#6B1B1B", "#FBBF24"],
      },
    ],
    hero: "an elegant wedding mandap draped with flowers and fairy lights, luxurious Indian wedding decor photography with romantic glow",
    style:
      "Graceful, romantic composition with floral framing. Refined serif headline with gold detailing. Elegant date cartouche. Dreamy wedding-planning luxury, CTA bar at the bottom.",
  },
  {
    id: "event-book-fair",
    name: "Book Fair",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-book-fair.jpg",
    tagline: "Literary book-fair poster with towering shelves",
    fields: [
      HL("BOOK FAIR"),
      SUB("Thousands of titles, up to half off."),
      BADGE("50% OFF"),
      DATE("8-12 FEB"),
      CTA("ENTRY FREE"),
    ],
    palettes: [
      {
        id: "library",
        name: "Library Green",
        prompt: "deep forest-green background with cream and brass-gold accents",
        swatches: ["#1E3A2F", "#E9DCC3"],
      },
      {
        id: "paper",
        name: "Paper & Ink",
        prompt: "warm paper-tan background with ink-black and burnt-sienna accents",
        swatches: ["#E3CFA6", "#1C1917"],
      },
    ],
    hero: "towering bookshelves and stacks of colorful books receding into a warm library hall, readers browsing, cozy literary photography",
    style:
      "Book-spine texture as the design rhythm. Classic literary headline, possibly serif. Starburst 50% OFF sticker. Date banner. Bookish, inviting, intelligent, CTA bar at the bottom.",
  },
  {
    id: "event-open-mic",
    name: "Open Mic",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-open-mic.jpg",
    tagline: "Intimate open-mic poster with warm stage glow",
    fields: [
      HL("OPEN MIC NIGHT"),
      SUB("Poetry, music, stories."),
      DATE("WED · 7 PM"),
      CTA("SIGN UP"),
    ],
    palettes: [
      {
        id: "amber",
        name: "Amber Stage",
        prompt: "pitch-black background with warm amber and honey-gold accents",
        swatches: ["#0A0A0A", "#F59E0B"],
      },
      {
        id: "boho",
        name: "Boho Terracotta",
        prompt: "warm terracotta background with cream and deep-brown accents",
        swatches: ["#C96F4A", "#FAF3E8"],
      },
    ],
    hero: "a young musician with a guitar on a small intimate stage, warm fairy lights, attentive audience in soft bokeh, cozy performance photography",
    style:
      "Intimate, warm composition with bokeh lights. Handwritten-feel bold headline. Round date sticker. Welcoming grassroots creative energy, CTA bar at the bottom.",
  },
  {
    id: "event-sunrise-yoga",
    name: "Sunrise Yoga",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-sunrise-yoga.jpg",
    tagline: "Serene yoga-retreat poster with dawn calm",
    fields: [
      HL("SUNRISE YOGA"),
      SUB("Breathe. Stretch. Reset."),
      DATE("SUN · 6 AM"),
      CTA("JOIN US"),
    ],
    palettes: [
      {
        id: "dawn",
        name: "Dawn Calm",
        prompt: "soft peach-dawn gradient background with teal and cream accents",
        swatches: ["#FDBA74", "#0F766E"],
      },
      {
        id: "zen",
        name: "Zen Sage",
        prompt: "soft sage-green background with warm sand and white accents",
        swatches: ["#A7C4A0", "#F5EFE6"],
      },
    ],
    hero: "silhouettes of people in yoga poses on a lakeshore at sunrise, mist over calm water, serene wellness photography",
    style:
      "Calm, spacious composition with the horizon line as anchor. Gentle elegant headline with breathing room. Minimal date chip. Peaceful, restorative energy, CTA bar at the bottom.",
  },
  {
    id: "event-auto-expo",
    name: "Auto Expo",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-auto-expo.jpg",
    tagline: "High-octane car-show poster with showroom shine",
    fields: [
      HL("AUTO EXPO"),
      SUB("Supercars and classics."),
      DATE("24 FEB"),
      CTA("GET PASSES"),
    ],
    palettes: [
      {
        id: "carbon",
        name: "Carbon",
        prompt: "pitch-black background with liquid-silver and steel-grey accents",
        swatches: ["#0A0A0A", "#C0C0C8"],
      },
      {
        id: "racing",
        name: "Racing Red",
        prompt: "deep racing-red background with black and white accents",
        swatches: ["#B91C1C", "#F8FAFC"],
      },
    ],
    hero: "a sleek supercar under dramatic showroom spotlights with light trails, glossy reflections, premium automotive photography",
    style:
      "Low, aggressive composition with the car sweeping across the frame. Massive italic condensed headline. Date plate like a license plate. High-octane showroom power, CTA bar at the bottom.",
  },
  {
    id: "event-flea-market",
    name: "Flea Market",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-flea-market.jpg",
    tagline: "Eclectic flea-market poster with vintage color",
    fields: [
      HL("FLEA MARKET"),
      SUB("Vintage finds and indie stalls."),
      DATE("SAT-SUN"),
      CTA("COME BROWSE"),
    ],
    palettes: [
      {
        id: "retro",
        name: "Retro Pop",
        prompt: "warm mustard-yellow background with teal and burnt-orange accents",
        swatches: ["#EAB308", "#0F766E"],
      },
      {
        id: "sunset",
        name: "Sunset Bazaar",
        prompt: "coral-pink background with deep purple and cream accents",
        swatches: ["#FB7185", "#5B21B6"],
      },
    ],
    hero: "colorful flea-market stalls with vintage clothes, vinyl records and quirky treasures under bunting flags, cheerful bazaar photography",
    style:
      "Eclectic collage energy with bunting and price-tag motifs. Chunky retro headline. Handwritten-feel date sticker. Treasure-hunt joy, CTA bar at the bottom.",
  },
  {
    id: "event-hack-night",
    name: "Hack The Night",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-hack-night.jpg",
    tagline: "Electric hackathon poster with late-night code glow",
    fields: [
      HL("HACK THE NIGHT"),
      SUB("24 hours. Build something wild."),
      DATE("7-8 MAR"),
      CTA("FORM TEAM"),
    ],
    palettes: [
      {
        id: "hacker",
        name: "Hacker",
        prompt: "pitch-black background with neon matrix-green and white accents",
        swatches: ["#0A0A0A", "#22C55E"],
      },
      {
        id: "electric",
        name: "Electric",
        prompt: "deep navy background with magenta and cyan accents",
        swatches: ["#172554", "#D946EF"],
      },
    ],
    hero: "focused coders at glowing laptops in a dark room, code reflected on faces, energy-drink cans and sticky notes, late-night hackathon photography",
    style:
      "Glitch-tinged digital composition with glowing code texture. Aggressive condensed headline with terminal energy. Date chip in monospace. Competitive builder intensity, CTA bar at the bottom.",
  },
  {
    id: "event-diwali-mela",
    name: "Diwali Mela",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-diwali-mela.jpg",
    tagline: "Festive Diwali mela poster with diyas and light",
    fields: [
      HL("DIWALI MELA"),
      SUB("Lights, sweets and shopping."),
      DATE("28 OCT"),
      CTA("FREE ENTRY"),
    ],
    palettes: [
      {
        id: "festive",
        name: "Festive Night",
        prompt: "deep festive-purple night background with gold diya-light and marigold accents",
        swatches: ["#4C1D95", "#FBBF24"],
      },
      {
        id: "marigold",
        name: "Marigold",
        prompt: "rich maroon background with marigold-orange and gold accents",
        swatches: ["#7F1D1D", "#F59E0B"],
      },
    ],
    hero: "rows of glowing diyas and marigold garlands at a festive night market, fireworks softly blurred above, celebratory Diwali photography",
    style:
      "Radiant symmetrical composition centered on diya light. Elegant bold headline with a festive ornamental divider. Date in a gold cartouche. Joyful festival-of-lights warmth, CTA bar at the bottom.",
  },
  {
    id: "event-sip-savor",
    name: "Sip & Savor",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-sip-savor.jpg",
    tagline: "Sophisticated wine-and-cheese poster with moody glow",
    fields: [
      HL("SIP & SAVOR"),
      SUB("Wine tasting and cheese boards."),
      DATE("FRI · 7 PM"),
      CTA("RESERVE"),
    ],
    palettes: [
      {
        id: "merlot",
        name: "Merlot",
        prompt: "deep merlot-red background with cream and dark-wood accents",
        swatches: ["#7F1D1D", "#F5EFE6"],
      },
      {
        id: "cellar",
        name: "Cellar",
        prompt: "dark charcoal-cellar background with candlelight-gold accents",
        swatches: ["#1C1917", "#D4A017"],
      },
    ],
    hero: "wine glasses catching candlelight beside an abundant cheese and grape board on dark wood, moody tasting-room photography",
    style:
      "Sophisticated dark composition with candlelight glow. Elegant serif headline. Small wax-seal-style date badge. Refined tasting-event luxury, CTA bar at the bottom.",
  },
  {
    id: "event-adopt-love",
    name: "Adopt Love",
    category: "Events",
    aspectRatio: "4:5",
    thumbnail: "/pro/poster-templates/event-adopt-love.jpg",
    tagline: "Heartwarming pet-adoption poster with puppy charm",
    fields: [
      HL("ADOPT LOVE"),
      SUB("Meet your new best friend."),
      DATE("SUN · 10 AM"),
      CTA("MEET PUPS"),
    ],
    palettes: [
      {
        id: "playful",
        name: "Playful",
        prompt: "bright teal background with warm orange and cream accents",
        swatches: ["#0D9488", "#FB923C"],
      },
      {
        id: "warm",
        name: "Warm Heart",
        prompt: "warm cream background with rust-orange and soft-brown accents",
        swatches: ["#FFF7ED", "#C2410C"],
      },
    ],
    hero: "an adorable smiling rescue dog looking into the camera with a paw raised, soft park bokeh behind, heartwarming pet photography",
    style:
      "Big-hearted composition with the puppy as the irresistible focal point. Chunky friendly headline. Heart-shaped date sticker. Warm, joyful, family-friendly energy, CTA bar at the bottom.",
  },
];

export function batchAById(id: string): PosterTemplate | undefined {
  return BATCH_A.find((t) => t.id === id);
}
