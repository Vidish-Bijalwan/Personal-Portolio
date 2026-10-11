import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "image-file-formats-marketplaces-jpeg-png-webp",
  title: "JPEG vs PNG vs WebP: File Formats for Marketplaces, Explained",
  description:
    "JPEG, PNG, and WebP do different jobs: lossy photos, lossless graphics, and the modern all-rounder. Which format your listing images should actually ship in.",
  date: "2026-10-11",
  category: "Guides",
  tags: ["file formats", "JPEG", "PNG", "WebP", "marketplaces", "sellers"],
  readingMinutes: 6,
  answer: [
    t("Use JPEG for photographs of products — it's lossy but tiny, and marketplaces are built around it. Use PNG for graphics with sharp edges or transparency (logos, infographics) — it's lossless but heavy. Use WebP where the platform accepts it — it does both jobs at smaller file sizes. Export at the marketplace's listed minimum resolution or higher, in sRGB colour, and never upscale a small file to fake a bigger one. Order listing-ready images on "),
    link("the create page", "/create?service=product-photo"),
    t(" and check "),
    link("the pricing page", "/pricing"),
    t(" for the flat "),
    t("₹15"),
    t(" catalog."),
  ],
  sources: [
    { label: "JPEG — lossy compression for photographs (Wikipedia)", url: "https://en.wikipedia.org/wiki/JPEG" },
    { label: "PNG — lossless graphics and transparency (Wikipedia)", url: "https://en.wikipedia.org/wiki/PNG" },
    { label: "WebP — modern lossy and lossless compression (Wikipedia)", url: "https://en.wikipedia.org/wiki/WebP" },
  ],
  faqs: [
    {
      q: "Which format should my Amazon or Flipkart listing images be?",
      a: "JPEG, in the vast majority of cases. Marketplace image pipelines are built around JPEG: they accept it everywhere, compress it predictably, and render it fast on low-bandwidth connections. Use PNG only for images that are mostly text or line art (size charts, infographics), where JPEG's compression would blur the edges. Check your seller portal's current spec before a bulk upload — requirements change.",
    },
    {
      q: "Is WebP better than JPEG for product photos?",
      a: "Technically yes — WebP typically produces smaller files than JPEG at the same visual quality, and it supports transparency like PNG. Practically, it depends on acceptance: not every marketplace or older tool in your pipeline handles WebP. The safe workflow is to keep a high-quality master (PNG or high-quality JPEG) and export WebP only for platforms that explicitly accept it.",
    },
    {
      q: "What resolution should listing images be?",
      a: "At least the marketplace's listed minimum — most major marketplaces want 1000+ pixels on the longest side so the zoom feature works, and some recommend 2000+. The rule is simple: generate or shoot bigger than you need, then export down. Never upscale a 500px image to 2000px — the zoom will show a blurry lie, and customers notice.",
    },
    {
      q: "Does the file format affect how my product photo looks?",
      a: "Only at the extremes. A high-quality JPEG (quality 85–95) is visually indistinguishable from the master for product photography. Problems come from low-quality JPEGs (blocky gradients, mushy textures) and from PNGs so large they load slowly on 4G. Format matters less than starting from a clean, high-resolution source image.",
    },
  ],
  related: [
    "amazon-listing-images-ai-india",
    "flipkart-catalog-refresh-ai",
    "aspect-ratios-explained-platforms",
  ],
  body: [
    p(
      t("Every listing image you upload passes through a format decision, and most sellers make it by accident — whatever the tool exported, whatever the phone saved. But JPEG, PNG, and WebP are genuinely different technologies with different jobs, and picking the wrong one costs you either quality or loading speed. Here's the practical version: what each format does, when each wins, and the export settings that keep marketplace images sharp.")
    ),
    h2("JPEG: the photograph format"),
    p(
      t("JPEG uses lossy compression — it permanently discards image data the eye is least likely to miss, which is why a 3MB photo becomes 300KB. For product photography, this trade is excellent: smooth gradients, fabric textures, and skin tones compress beautifully, and the file stays small enough to load fast on Indian 4G. The failure mode is sharp edges and text — compress a size chart as JPEG and the letters go fuzzy. Rule: photographs as JPEG, quality 85–95 on export, and never re-save a JPEG repeatedly — each save discards more data.")
    ),
    h2("PNG: the graphics format"),
    p(
      t("PNG is lossless — every pixel survives exactly — and it supports true transparency. That's why logos, infographics, size charts, and any image with large flat colour areas belong in PNG: edges stay razor sharp and transparent backgrounds actually work. The price is file size: a PNG photograph can be five to ten times heavier than its JPEG twin, which is why you should never upload product photos as PNG. Use PNG surgically — for the graphics in your listing, not the photos.")
    ),
    h2("WebP: the modern all-rounder"),
    p(
      t("WebP does both jobs: lossy compression that typically beats JPEG at the same quality, lossless mode that rivals PNG, and transparency throughout. On paper it's the best format for everything. In practice, the constraint is acceptance — your export tools, your marketplace uploader, and your customer's older phone all need to handle it. The professional workflow: archive a lossless master, export JPEG for marketplaces today, and export WebP for your own website where you control the pipeline.")
    ),
    table(
      ["", "JPEG", "PNG", "WebP"],
      [
        ["Compression", "Lossy", "Lossless", "Lossy or lossless"],
        ["Transparency", "No", "Yes", "Yes"],
        ["Best for", "Product photographs", "Logos, charts, graphics", "Web use where accepted"],
        ["Watch out for", "Text goes fuzzy; don't re-save repeatedly", "Huge files for photos", "Not accepted everywhere yet"],
      ]
    ),
    h2("The export checklist for marketplace images"),
    list(
      [t("Resolution: at or above the marketplace's listed minimum (usually 1000px+ on the longest side for zoom). Generate big, export down — never upscale.")],
      [t("Colour space: sRGB. It's the web default; anything else shifts colours unpredictably on customer screens.")],
      [t("Photographs → JPEG at quality 85–95. Graphics and text → PNG. Your own site → WebP if your pipeline supports it.")],
      [t("File size sanity: if a single listing image is several megabytes, something's wrong — re-export before upload.")],
      [t("Keep the master. Export formats are disposable; the high-resolution original is the asset. Archive it.")],
    ),
    callout("tip",
      t("The zoom test, again: open your exported JPEG at the marketplace's zoom size. If fabric texture, stitching, and label edges hold up, your export settings are right. If they smear, your source was too small or your quality setting too low — fix the source, not the format.")
    ),
    h2("Getting listing-ready images in the right format"),
    p(
      t("When you order product photos, ask for high-resolution masters — you can always export down to each marketplace's spec, but you can't export up. A "),
      t("₹15"),
      t(" order on "),
      link("the create page", "/create?service=product-photo"),
      t(" gets you the clean source image; variant sets for a whole catalog go as a "),
      t("₹49"),
      t(" 4-pack. The flat catalog is on "),
      link("the pricing page", "/pricing"),
      t(" — and the format decision stays where it belongs: a two-minute export choice, not a reshoot.")
    ),
    cta(
      "Start from a clean, high-res source",
      "Order listing-ready product photos and export to each marketplace's spec from a proper master file.",
      "Create a product photo order",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
