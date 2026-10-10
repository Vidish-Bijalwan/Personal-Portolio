import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-footwear-product-shots-india",
  title: "Footwear Sellers: Clean Sole-and-Profile Shots with AI",
  description:
    "Footwear listings need sole, profile, and top-down shots. How sellers brief AI product photos at ₹29 each — honest sizing rules, and when a real camera still wins.",
  date: "2026-10-10",
  category: "Sellers",
  tags: ["footwear", "product photography", "ai", "ecommerce", "sellers"],
  readingMinutes: 6,
  answer: [
    t("Footwear listings live or die on three angles: the sole tread, the side profile, and the top-down view — shots that are tedious to light consistently at home. AI product photography builds all three from a reference photo of your actual pair: describe each angle, keep proportions honest, and pay a flat "),
    t("₹29"),
    t(" per finished photo on "),
    link("Etch", "/"),
    t(". It is best for catalog consistency across SKUs; fit-critical close-ups and true-to-life color checks still belong to a real camera."),
  ],
  sources: [
    { label: "Etch pricing — product photo ₹29", url: "https://vidish.me/pricing" },
    { label: "Amazon Seller Central India — seller hub", url: "https://sellercentral.amazon.in/" },
  ],
  faqs: [
    {
      q: "How much do AI footwear product photos cost?",
      a: "On Etch, one AI product photo costs a flat ₹29. A ten-SKU catalog with three angles per pair is thirty photos — no photographer day-rate, no studio rental, no reshoot scheduling. If a shot misses, a remake costs ₹5.",
    },
    {
      q: "Do I need to photograph my shoes first for AI product shots?",
      a: "Yes — attach a clear reference photo of the actual pair for each angle you want. The AI builds on your reference for proportions, colors, and details like stitching and logos. A daylight photo against a plain background gives the best results.",
    },
    {
      q: "Will AI stretch or distort my shoe’s shape?",
      a: "It can, if the brief is loose or the reference is poor — which is why you check every delivery against the real pair. Never ask for a sleeker or slimmer shoe than the one you ship; dishonest proportions lead to returns. Use the ₹5 remake for any warped generation.",
    },
    {
      q: "Can I use AI shoe photos on Amazon and Flipkart?",
      a: "Yes, as long as the images honestly represent the product and meet each marketplace’s image rules — clean background, product filling most of the frame, no misleading props. Amazon’s Seller Central India hub carries the current listing-image guidance for sellers.",
    },
  ],
  related: [
    "amazon-listing-images-ai-india",
    "ai-product-photography-india-sellers",
    "flipkart-catalog-refresh-ai",
  ],
  body: [
    p(
      t("Shoes are among the hardest products to photograph at home. The sole needs raking light to show the tread, the profile needs a perfectly straight side-on angle, and the pair has to look identical across ten SKUs. A phone on a table gives you three different shadows and a crooked horizon. AI product shots solve the consistency problem — if you brief them right.")
    ),
    h2("The three angles every footwear listing needs"),
    list(
      [t("Sole tread: shot from directly below, even lighting, tread pattern sharp — buyers check this for grip.")],
      [t("Side profile: dead-on lateral view, heel to toe level, shows the silhouette and sole thickness.")],
      [t("Top-down: both shoes angled slightly inward, laces neat, shows the colorway and shape.")],
    ),
    p(
      t("Write one brief per angle and reuse the same lighting line across all three: “soft studio light, light grey background, gentle shadow under the shoe.” Consistency is what makes a catalog look like a brand instead of ten separate sellers.")
    ),
    h2("How to brief an AI shoe shot that looks like your pair"),
    p(
      t("The reference photo does the heavy lifting. Shoot your actual shoe in daylight against a plain wall — front, side, and sole — and attach the matching view to each generation. Then describe what the reference cannot say: materials (“knit upper, EVA midsole”), colors by name, and the exact angle you want. Name the details buyers care about: stitching, logo placement, heel height cues.")
    ),
    list(
      [t("Attach the real pair’s photo for the matching angle — never brief a shoe from memory.")],
      [t("State the exact view: “direct side profile, camera level with the midsole.”")],
      [t("Lock the background and light in one reusable line across SKUs.")],
      [t("Ask for what marketplaces reward: clean background, shoe filling most of the frame, no props stealing focus.")],
    ),
    callout("tip",
      t("Tie the laces the way you would sell them before shooting the reference. AI copies the reference faithfully — sloppy laces in, sloppy laces out.")
    ),
    h2("Keep sizing and proportions honest"),
    p(
      t("Never ask the AI to make a shoe look sleeker, taller, or slimmer than the real pair. Stretched proportions are the fastest route to “not as pictured” returns. If a generation comes back with a warped toe box or an elongated sole, treat it as a miss and use the "),
      t("₹5"),
      t(" remake — do not ship a prettier lie.")
    ),
    callout("warn",
      t("Marketplace image policies expect the product shown to match what ships. A shoe that looks sleeker in the photo than in the box will cost you in returns and ratings — honesty photographs better than it sounds.")
    ),
    h2("When a real camera still wins"),
    p(
      t("AI is a consistency engine, not a truth machine. Three cases still belong to a camera: fit-critical close-ups where a buyer judges toe-box room, true-color checks for colorways that shift under different light, and any detail your reference photo itself got wrong. For the catalog bulk — profile, sole, top-down across colorways — AI at "),
      t("₹29"),
      t(" a shot keeps the whole range looking like one shoot day.")
    ),
    table(
      ["Shot", "AI product photo", "Real camera"],
      [
        ["Catalog angles (sole, profile, top)", "₹29 each, identical lighting every time", "Needs a light setup plus reshoots per SKU"],
        ["Fit-critical close-ups", "Risky — may smooth over real details", "Better: shows true construction"],
        ["New colorway variants", "Fast: same brief, new colors", "Full reshoot per colorway"],
      ]
    ),
    h2("A simple workflow for a ten-SKU footwear catalog"),
    p(
      t("Start with your bestseller: order the three angles, check proportions against the real pair, lock the brief. Then run the remaining nine SKUs through the same template — same light line, same background, only the reference photos change. Thirty shots at "),
      t("₹29"),
      t(" each, one consistent catalog, zero studio days. The "),
      link("pricing page", "/pricing"),
      t(" lists every service plainly, so you can budget the whole batch before you start.")
    ),
    p(
      t("And if a generation misses — wrong lace color, warped sole — the "),
      t("₹5"),
      t(" remake exists for exactly that. Check every delivery against the real pair before it goes live; the human review catches most issues, but you know your product best.")
    ),
    cta(
      "Get clean shoe shots for ₹29 each",
      "Attach a reference photo of your pair, brief the angle, and get human-reviewed catalog shots.",
      "Create a product photo",
      "/create?service=product-photo"
    ),
  ],
};

export default post;
