import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "cost-per-listing-image-sellers",
  title: "Cost Per Listing Image: The Metric Every Seller Should Track",
  description:
    "Forget per-shoot budgets. What one finished listing image costs at Etch's real prices — ₹15, ₹29, ₹49 4-pack, ₹5 remake — worked for 5-SKU and 50-SKU sellers.",
  date: "2026-10-10",
  category: "Pricing",
  tags: ["pricing", "sellers", "budgeting", "ecommerce", "India"],
  readingMinutes: 6,
  answer: [
    t("Cost per listing image is what one finished image on your product listing actually costs you — the order price plus your share of remakes. On "),
    link("Etch", "/"),
    t(", the catalog prices are "),
    t("₹15"),
    t(" per single AI image, "),
    t("₹29"),
    t(" per product photo, "),
    t("₹49"),
    t(" for a 4-pack, and "),
    t("₹5"),
    t(" per remake. A 50-SKU seller using 4-packs lands near 13 rupees per image all-in; a 5-SKU seller lands near 16–17 rupees. Track this number per launch, not per shoot."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29, 4-pack ₹49", url: "https://vidish.me/pricing" },
    { label: "Etch pricing — tryetch.online", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — pay-per-photo comparison", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "What is cost per listing image?",
      a: "It is the true cost of one finished image on a product listing: the order price divided across the images you buy, plus your share of remakes. It matters more than any per-shoot or per-day budget, because marketplaces reward listings with more — and better — images, and each one has a marginal cost.",
    },
    {
      q: "How do I calculate it for my own catalog?",
      a: "Count the finished images you need, divide them by pack size, and multiply by the catalog prices: ₹15 per single AI image, ₹29 per product photo, ₹49 per 4-pack. Then add a remake buffer — plan roughly 1 in 5 images needing a ₹5 remake. Total rupees divided by total images is your cost per listing image.",
    },
    {
      q: "How many remakes should I budget for?",
      a: "A practical rule is 1 in 5: for every 10 images, budget 2 remakes at ₹5 each, which is 10 rupees of buffer. Early batches run hotter — your first order for a new product line is the most likely to need a revision pass — so front-load the buffer on new SKUs and taper it on repeat styles.",
    },
    {
      q: "When does this metric tell me to stop and hire a photographer?",
      a: "When the images need something AI cannot deliver: exact physical details, a flagship brand campaign with models and sets, or photography for a hero launch where the creative direction itself is the product. If your cost-per-image math starts including heavy art direction, a human crew earns its fee — use AI for the catalog long tail instead.",
    },
  ],
  related: [
    "ai-content-budget-worksheet-small-business",
    "ai-image-pricing-models-compared",
    "remake-economics-ai-revisions",
  ],
  body: [
    p(
      t("Sellers usually budget imagery the wrong way: they ask what a photoshoot costs, get one big number, and then ration images across listings. The better question is smaller and more honest — what does one finished image on one listing cost me? Marketplaces reward listings with more images, and every extra image is a marginal decision. Once you know your cost per listing image, that decision takes ten seconds.")
    ),
    h2("The only prices in this arithmetic"),
    p(
      t("Everything below uses the published "),
      link("Etch catalog", "/pricing"),
      t(" — no estimates, no “typical agency rates”:")
    ),
    table(
      ["Item", "Catalog price", "Unit math"],
      [
        ["Single AI image", "₹15", "—"],
        ["AI product photo", "₹29", "—"],
        ["Product photo 4-pack", "₹49", "12.25 rupees per image (49 ÷ 4)"],
        ["Remake", "₹5", "budget ~1 in 5 images"],
      ]
    ),
    callout("note",
      t("This post only prices finished listing IMAGES. Video work (Video Studio at ₹29 per finished video, clips at ₹19 per 5 seconds) is a different budget line — do not mix it into your per-image math.")
    ),
    h2("Worked example: a 5-SKU seller"),
    p(
      t("Say you are launching five products and want one strong hero image per listing — five finished images.")
    ),
    table(
      ["Route", "Math", "Total", "Per image"],
      [
        ["All singles (product photo)", "5 × ₹29", "145 rupees", "29 rupees"],
        ["4-pack + 1 single", "₹49 + ₹29", "78 rupees", "15.60 rupees"],
        ["4-pack + 1 single + remake buffer", "78 rupees + 1 × ₹5", "83 rupees", "16.60 rupees"],
      ]
    ),
    p(
      t("The 4-pack nearly halves the unit price — from 29 rupees to 15.60 rupees per image — because you are buying in fours. The remake buffer (one expected revision at "),
      t("₹5"),
      t(") pushes the honest all-in number to 16.60 rupees per image. For a small seller, that is the number to put in the launch spreadsheet, not the sticker price of the pack.")
    ),
    h2("Worked example: a 50-SKU seller"),
    p(
      t("Now a catalog of fifty products, one hero image each — fifty finished images.")
    ),
    table(
      ["Route", "Math", "Total", "Per image"],
      [
        ["All singles (product photo)", "50 × ₹29", "1,450 rupees", "29 rupees"],
        ["Twelve 4-packs + 2 singles", "12 × ₹49 + 2 × ₹29", "646 rupees", "12.92 rupees"],
        ["Pack route + remake buffer", "646 rupees + 10 × ₹5", "696 rupees", "13.92 rupees"],
      ]
    ),
    p(
      t("Twelve 4-packs cover 48 images (12 × ₹49 = 588 rupees) and two singles cover the last two (2 × ₹29 = 58 rupees), for 646 rupees all-in before remakes. With the 1-in-5 remake buffer — ten remakes at "),
      t("₹5"),
      t(" each, 50 rupees — the honest number is 696 rupees, or 13.92 rupees per image. Compare that with buying singles: 1,450 rupees. The pack discipline saves more than half.")
    ),
    h2("How the 4-pack changes the unit price"),
    p(
      t("The 4-pack is the whole game in this metric. At ₹49 for four images, the unit price drops to 12.25 rupees — less than half the ₹29 single. But it only works if you actually have four images to order. The trap is buying a 4-pack for three images and letting the fourth expire unused: then your real unit price is 49 ÷ 3, which is worse than two singles plus patience. Rules of thumb:")
    ),
    list(
      [t("Need 4+ images in one batch? Buy 4-packs first, singles only for the remainder.")],
      [t("Need exactly 3? Three singles at ₹29 each (87 rupees) beats a 4-pack with a wasted slot unless you have a fourth image in mind — a seasonal variant, a thumbnail crop, a lifestyle shot.")],
      [t("Batch your orders. The metric rewards planning a week of listings at once rather than ordering one image every evening.")],
    ),
    h2("Budgeting for remakes without guessing"),
    p(
      t("Every seller gets a miss sometimes: a color that drifted, a label that warped, a background that fights the product. The "),
      t("₹5 remake"),
      t(" exists for exactly this, and budgeting for it keeps a bad batch from feeling like a loss. The practical rule: assume 1 in 5 images needs one remake pass. For a 10-image batch, that is 2 × ₹5 = 10 rupees of buffer. New product lines run hotter — your first order for an unfamiliar product is the most likely to need revision — so keep the full buffer on new SKUs and relax it on repeat styles where the template is proven.")
    ),
    callout("tip",
      t("Track two numbers per batch in a simple sheet: images ordered and remakes used. After three batches you will know YOUR remake rate, and the 1-in-5 rule becomes your actual number — usually lower on repeat styles.")
    ),
    h2("When the metric says stop: hire a photographer"),
    p(
      t("Cost per listing image is a powerful number, but it has a boundary. It stops being the right metric when the job stops being “produce N catalog images” and becomes “create the visual identity of a launch”. Flagship campaigns with models, sets, and art direction; products whose whole pitch is a mechanical feature the AI cannot faithfully render; hero imagery for a brand refresh — these are photography jobs, and a good crew earns its fee there. The honest split: AI owns the catalog long tail — variants, seasonal refreshes, the thirty colorways — and the camera owns the flagship. Run your per-image math on the long tail, and never let a low unit price talk you into rendering something a buyer needs to be physically true.")
    ),
    p(
      t("Ready to price your next batch? The "),
      link("pricing page", "/pricing"),
      t(" has the full catalog, and you can start with a single "),
      link("product photo order", "/create?service=product-photo"),
      t(" at ₹29 to establish your baseline cost per image before you commit to a batch.")
    ),
    cta(
      "Establish your baseline for ₹29",
      "Order one product photo, measure the result, then batch the rest with 4-packs at the lowest unit price.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
