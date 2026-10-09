import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "festive-creatives-ai-playbook",
  title: "Festive Creatives with AI: Diwali, Holi, Eid & Christmas",
  description:
    "One playbook for festive AI creatives, Diwali to Christmas: diyas, marigolds, gulaal, fairy lights. Timelines, prompt patterns, and honest limits.",
  date: "2026-10-07",
  category: "Guides",
  tags: ["festive", "Diwali", "creatives", "AI images", "marketing"],
  readingMinutes: 6,
  answer: [
    t("Festive AI creatives work when you brief the festival's real visual language — diyas, marigolds, and rangoli for Diwali; gulaal dust and watercolor skies for Holi; crescent motifs for Eid; warm pine and fairy lights for Christmas. On "),
    link("Etch", "/"),
    t(", a festive creative costs a flat "),
    t("₹15"),
    t(" per image — order 2–3 weeks before the festival, since festive weeks are the busiest time of the year. Every image passes a human quality check before delivery."),
  ],
  sources: [
    { label: "Etch pricing — single image ₹15", url: "https://tryetch.online/pricing" },
    { label: "VEED AI tools — video and image creative tools", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "When should I order festive creatives?",
      a: "Two to three weeks before the festival. You'll want time for a revision round (a remake costs ₹5) and to schedule posts ahead of the festive rush, when both AI services and designers are at their busiest. Last-minute orders can still land within 24 hours, but you lose the buffer for refinements.",
    },
    {
      q: "How much do festive AI creatives cost?",
      a: "On Etch, each festive creative costs a flat ₹15 for a single image, or ₹49 for a 4-pack of variants — enough for a full festive campaign set. Prices are listed plainly on the pricing page with no subscription or credit pack required.",
    },
    {
      q: "Can AI get festival details right — diyas, rangoli, mosque silhouettes?",
      a: "Mostly yes, if you describe them specifically. Name the elements — “brass diyas with warm flames”, “marigold toran on a wooden doorframe” — rather than relying on the festival name alone. Very intricate details like rangoli geometry or Arabic-style calligraphy may need a remake pass to land correctly.",
    },
    {
      q: "Should festive creatives show my product?",
      a: "It depends on the goal. Greeting-style posts (best engagement) work best product-free — warm scene, your logo small. Offer posts convert better with the product placed in the festive scene: a gift box among diyas, a dress on a festive backdrop. Brief one of each.",
    },
  ],
  related: [
    "make-product-ads-with-ai",
    "ai-image-generator-india-pay-per-creation",
    "ai-trends-templates-explained",
  ],
  body: [
    p(
      t("India doesn't have a festive season — it has a festive relay. Diwali, then Christmas, then the new year, with Holi and Eid arriving in their own rhythm. For a small brand, that's five campaign shoots a year, each needing fresh visuals. "),
      t("Festive creatives with AI"),
      t(" turn that from five photoshoots into five orders.")
    ),
    h2("The festive prompt pattern"),
    p(
      t("Every festival has a visual language. Your prompt should speak it explicitly — never assume the model knows what “festive” means for your audience:")
    ),
    table(
      ["Festival", "Name the elements", "Light and mood"],
      [
        ["Diwali", "“brass diyas with flames, marigold garlands, rangoli at the doorstep”", "“warm golden light, night sky, festive glow”"],
        ["Holi", "“clouds of pink and yellow gulaal, color-stained hands mid-throw”", "“bright daylight, joyful motion, soft-focus background”"],
        ["Eid", "“crescent moon, mosque silhouette, dates and sheer khurma on brass”", "“dusk sky, lantern light, serene”"],
        ["Christmas", "“decorated pine tree, fairy lights, wrapped gifts, light snowfall”", "“cozy warm interior, bokeh lights”"],
      ]
    ),
    h2("Respect matters more than aesthetics"),
    p(
      t("Festivals are sacred to the people who celebrate them. Keep religious symbols accurate and dignified — don't mash festivals together in one image, don't use sacred imagery as mere decoration, and don't generate parody versions of religious scenes. When in doubt, keep the creative warm and generic: festive lights, sweets, and good wishes offend nobody.")
    ),
    callout("tip",
      t("The highest-performing festive format for small brands is the 9:16 greeting reel-cover: a vertical festive scene with space at the top for your text overlay. Brief “vertical 9:16, negative space at top for headline text” and design the caption in your video editor.")
    ),
    h2("One product, four festivals: the variant workflow"),
    p(
      t("Here's the efficient version. Shoot or generate one clean product photo on a neutral background first. Then order festive scene variants around it: the same perfume bottle among diyas for Diwali, dusted with gulaal tones for Holi, beside a lantern for Eid, on a pine branch for Christmas. Four images, one product, a year of campaigns — "),
      t("₹49"),
      t(" for the 4-pack if you order them together.")
    ),
    h2("Greeting vs offer: brief both"),
    list(
      [t("Greeting creative: festive scene, no product, your logo small in a corner. Goal: wishes and shares. Post on the festival morning.")],
      [t("Offer creative: product in the festive scene, offer text space left empty. Goal: clicks and sales. Post 3–5 days before.")],
      [t("Story set: 3–4 vertical variants for countdown stories. Goal: reminders. Post daily through the week.")],
    ),
    h2("Timelines that actually work"),
    p(
      t("Festive weeks are the busiest of the year for every creative service, AI included. Work backwards: festival day minus 3 days for scheduling, minus 2 days for a possible remake round ("),
      t("₹5"),
      t("), minus 1 day for order turnaround — that's your order date, roughly a week before the festival. If you're planning all four festivals, batch the orders and lock the whole year's creatives in one sitting.")
    ),
    h2("Honest limits"),
    p(
      t("AI renders festive scenes beautifully but stumbles on two things: intricate rangoli geometry (it invents patterns that look right at a glance and wrong on zoom) and text in regional scripts on banners or cards. Keep on-image text in English or add it in your editor afterwards — Etch's "),
      link("Video Studio", "/video-studio"),
      t(" adds captions and text overlays to festive clips at "),
      t("₹29"),
      t(" per finished video, which sidesteps the script-rendering problem entirely.")
    ),
    h2("Ordering your festive set"),
    p(
      t("Write one prompt per festival using the pattern above, attach your product photo as a reference where it appears, and place the order on "),
      link("Etch's create page", "/create"),
      t(" — "),
      t("₹15"),
      t(" per image, UPI payment, human quality check before delivery. Check the "),
      link("pricing page", "/pricing"),
      t(" for the full catalog, and keep the greeting-versus-offer split in mind when you brief.")
    ),
    cta(
      "Get your festive creatives for ₹15 each",
      "One prompt per festival, UPI payment, human-reviewed — ready before the rush.",
      "Create festive creatives",
      "/create?service=single-image"
    ),
  ],
};

export default post;
