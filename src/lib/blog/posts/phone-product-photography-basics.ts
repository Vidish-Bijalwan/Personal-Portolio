import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "phone-product-photography-basics",
  title: "Phone Product Photography Basics: Light, Background, Angles",
  description:
    "Phone product photography that looks professional: a window-light setup, zero-cost backgrounds, the three angles that sell, and mistakes to stop making.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["product photography", "phone", "DIY", "small business", "catalog"],
  readingMinutes: 6,
  answer: [
    t("Good phone product photos come down to four things: soft window light (shoot beside a large window, never under a tube light), a clean background (white chart paper or a plain bedsheet), the right angle (45° for most products, flat-lay for clothing, eye-level for bottles), and locking your phone's focus and exposure before shooting. Edit in Snapseed (free), and only consider a made-for-you product photo on "),
    link("Etch", "/create"),
    t(" ("),
    t("₹29"),
    t(") when the product needs a scene you can't build at home."),
  ],
  sources: [
    { label: "Snapseed — free photo editor", url: "https://www.snapseed.com/" },
    { label: "Google — Pixel camera photography tips", url: "https://support.google.com/pixelcamera" },
    { label: "Etch pricing — product photo ₹29", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "Do I need a DSLR for product photos, or is a phone enough?",
      a: "A phone is enough for catalogs, WhatsApp, and Instagram. Modern phones in good light out-resolve what most screens and prints need. A DSLR only earns its keep for large-format prints or extreme jewellery close-ups. Spend the money on lighting — even a white chart-paper sweep — before spending it on a camera.",
    },
    {
      q: "Why do my product photos look yellow?",
      a: "Tube lights and household bulbs are warm (around 2700–3000K) and they tint everything yellow. Fix it at the source: shoot in daylight beside a window, which is neutral. If you must shoot at night, switch the room lights off and use a single white LED desk lamp from the side, then set your phone's white balance manually by tapping a white area in the frame.",
    },
    {
      q: "What background should I use for product photos at home?",
      a: "White chart paper taped to a wall, curving down onto a table — the “sweep” — costs almost nothing and eliminates the horizon line that makes photos look amateur. For a warmer feel, use a plain cotton bedsheet (iron it first; wrinkles read as dirt in photos) or a wooden table top for food, crafts, and home goods. Avoid patterned bedsheets and busy room backgrounds entirely.",
    },
    {
      q: "How many photos does one product need?",
      a: "Five, minimum, for anything you sell online: the 45° hero shot, one flat-lay or lifestyle angle, one close-up of texture or detail, one scale shot (product next to a hand or a common object), and one packaging/what's-included shot. Five photos answer every question a buyer asks before messaging you, which is the whole point of product photography.",
    },
  ],
  related: [
    "ai-product-photography-india-sellers",
    "ai-food-photography-restaurant-menus",
    "background-removal-vs-ai-backgrounds",
  ],
  body: [
    p(
      t("Customers can't touch your product through a screen, so your photos do the touching. The gap between a photo that sells and one that doesn't is rarely the camera — it's light, background, and angle, all of which cost nothing to fix. This guide gives you a repeatable home setup and the three angles that cover 90% of products, plus the mistakes that mark a photo as amateur instantly.")
    ),
    h2("Light: the window is your studio"),
    p(
      t("Photography is literally light-writing, and the single biggest upgrade to your product photos is free: a large window. Soft, diffused daylight flatters every product — metal, fabric, food, skin. Here's the setup that works in any Indian home:"),
    ),
    list(
      [t("Shoot 9–11 AM or 3–5 PM, when daylight is bright but soft. Midday sun through a window makes hard shadows.")],
      [t("Place a table beside the window, not in front of it. The product sits side-on to the light — side light creates gentle shadows that show shape and texture. Front-on light flattens everything.")],
      [t("Diffuse harsh sun with a white bedsheet or butter paper taped over the window. You want a big, soft light source — a bedsheet turns a harsh window into a studio softbox.")],
      [t("Kill the room's tube lights and bulbs while shooting. Mixed lighting (daylight + warm bulb) creates color casts no filter fixes cleanly. One light source, always.")],
      [t("Add a white chart-paper “bounce” on the shadow side — prop it opposite the window to throw soft light back into the dark side of the product. This one trick halves your editing time.")],
    ),
    callout("warn",
      t("Never shoot products under a ceiling tube light or fan-mounted bulb. Overhead light creates harsh top shadows, green-yellow casts, and shiny hotspots on packaging. If daylight is unavailable, a single white LED desk lamp from the side beats every ceiling light in the house.")
    ),
    h2("Background: the chart-paper sweep"),
    p(
      t("The background's job is to disappear. Anything patterned, wrinkled, or busy steals attention from the product and tells the buyer you didn't take this seriously. The professional solution costs less than a vada pav:"),
    ),
    list(
      [t("The sweep: tape a sheet of white chart paper to the wall and let it curve down onto the table. No horizon line, no corners, infinite white. Replace the sheet when it creases — creases photograph as grey streaks.")],
      [t("Fabric: a plain cotton bedsheet in white, cream, or light grey, ironed flat. Wrinkles read as dirt on camera, so ironing is non-negotiable.")],
      [t("Wood: a clean wooden table top for food, handmade crafts, and home goods — warmth that suits the product category.")],
      [t("Keep 30–50 cm between product and background. Distance softens the background slightly and stops the product's shadow from landing hard behind it.")],
    ),
    h2("Angles: three shots cover almost everything"),
    p(
      t("You don't need twenty angles. You need the right three, shot consistently for every product so your catalog looks like one shop, not twenty:"),
    ),
    table(
      ["Angle", "How to shoot it", "Best for"],
      [
        ["45° hero", "Phone at product height, tilted down about 45°, product centered", "Everything — this is your main catalog image"],
        ["Flat-lay", "Phone directly overhead, parallel to the table, product arranged flat", "Clothing, jewellery sets, stationery, food thalis"],
        ["Eye-level detail", "Phone level with the product, close focus on texture or label", "Fabric weave, jewellery work, food texture, packaging text"],
      ]
    ),
    p(
      t("Add two more for selling, not showing: a scale shot (the product next to a hand, a coin, or a phone — buyers constantly misjudge size) and a packaging shot (what arrives in the box). Those two answer the questions that otherwise become “what is the size?” messages at midnight.")
    ),
    h2("Phone settings: lock it before you shoot"),
    p(
      t("Auto mode fights you — it re-focuses and re-exposes between shots, so your five catalog photos come out five different brightnesses. Lock it down:"),
    ),
    list(
      [t("Turn on the grid (camera settings → Grid). Place the product on the grid intersections, keep horizons level.")],
      [t("Tap and hold on the product to lock focus and exposure (AE/AF lock on iPhone; tap-and-hold on most Android cameras). Re-lock for every new product position.")],
      [t("Use the 1× lens, not the 0.5× ultrawide — ultrawide warps product edges. Zoom with your feet: move the phone, not the slider.")],
      [t("Wipe the lens. A pocket-smeared lens is the most common cause of hazy product photos and the fastest fix in this entire guide.")],
      [t("Shoot slightly wider than you need and crop later. Cropping a sharp wide shot beats a tight shot with a clipped edge every time.")],
    ),
    h2("Edit in Snapseed: the five-minute routine"),
    p(
      t("Shoot clean and edit light. Snapseed (free, no watermark) handles everything a product photo needs in about five minutes:"),
    ),
    list(
      [t("Tune Image: nudge Brightness up, pull Shadows up to open dark areas, add a touch of Ambiance. Stop before it looks “edited.”")],
      [t("White Balance: use the eyedropper on something neutral grey or white in the frame. This single tap fixes most color casts.")],
      [t("Selective: tap the product and brighten just it, leaving the background alone — this is how you make the product pop without blowing out the background.")],
      [t("Healing: remove dust specks, lint, and the chart paper's creases. Zoom to 100% and check — buyers zoom too.")],
      [t("Export at full resolution. Never screenshot your edit; always use Export → Save a copy.")],
    ),
    h2("Common mistakes that mark a photo as amateur"),
    list(
      [t("Shooting on a patterned bedsheet or a cluttered table — the background is competing with the product.")],
      [t("Harsh flash or overhead tube light — blown highlights on packaging, sickly yellow casts everywhere.")],
      [t("Crooked horizons and tilted products — the grid exists; use it.")],
      [t("Inconsistent style across the catalog — five products shot five ways looks like a reseller, not a brand. Same background, same angle, same edit for the whole catalog.")],
      [t("No scale reference — the number one cause of “it's smaller than I thought” returns.")],
    ),
    h2("When DIY stops being enough"),
    p(
      t("This setup handles clean catalog shots brilliantly. It does not handle scenes you can't build at home — your product on a beach at sunset, floating in a luxury bathroom, styled in a festive Diwali scene. For those, a made-for-you product photo on "),
      link("Etch's create page", "/create"),
      t(" costs "),
      t("₹29"),
      t(" — flat, UPI payment, human quality check before delivery. A practical split: shoot your everyday catalog yourself with this guide, and order the hero lifestyle shots. The full catalog is on the "),
      link("pricing page", "/pricing"),
      t(".")
    ),
    cta(
      "Need a product scene you can't shoot at home?",
      "A made-for-you product photo for ₹29 — flat price, UPI, human-reviewed. Your everyday catalog stays DIY.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
