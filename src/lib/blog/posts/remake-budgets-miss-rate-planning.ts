import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "remake-budgets-miss-rate-planning",
  title: "Remake Budgets: Planning for the Miss Rate in AI Content",
  description: "AI images sometimes miss on colour, hands, or text. Plan a small remake budget upfront — at ₹5 per remake — so one miss never derails a campaign date.",
  date: "2026-10-12",
  category: "Pricing",
  tags: ["remake", "budget", "pricing", "planning", "sellers"],
  readingMinutes: 6,
  answer: [
    t("A sensible AI content budget assumes some images will need a second pass and reserves a small amount for remakes instead of pretending every generation will land first time. On Etch a remake is ₹5, a single image is ₹15, a product photo is ₹29, and a 4-pack is ₹49, so a modest reserve covers several targeted corrections. Planning that reserve in advance protects launch dates and stops a single miss from becoming an argument. See the full catalog on "),
    link("the create page", "/create?service=product-photo"),
    t(" and "),
    link("the pricing page", "/pricing"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — flat catalog, no subscription", url: "https://tryetch.online/pricing" },
    { label: "Diffusion models — how AI image generation works (Wikipedia)", url: "https://en.wikipedia.org/wiki/Diffusion_model" },
  ],
  faqs: [
    {
      q: "How many remakes should I budget for a new product?",
      a: "Budget more for a new product than for a proven template, because angle, colour, and scene are still being tested. Track your first few orders for that product and let the record set the number. Once a template is proven, the same product family usually needs fewer corrections, so the reserve can fall without leaving you exposed.",
    },
    {
      q: "Is a remake better than ordering a fresh image?",
      a: "A remake is better when most of the image is right and one clear thing is wrong, because it preserves what worked. A fresh order is better when the concept itself was wrong, the angle is unusable, or you want a genuinely different scene. Choosing between them honestly saves more money than always picking the cheaper option.",
    },
    {
      q: "What instruction should I write for a remake?",
      a: "Name what must stay and the single change that matters most. For example, keep the product and framing, change only the background, or keep the scene and correct the product colour toward the reference photo. One focused instruction gives the correction a much better chance of landing in a single pass.",
    },
    {
      q: "Does the human quality check remove the need for remakes?",
      a: "The check removes execution errors such as warped text, extra fingers, and melting edges before delivery, so you do not pay to fix those. Remakes are for creative or accuracy preferences after a correct image arrives, such as a different background, a tighter crop in spirit, or a colour closer to your real product.",
    },
  ],
  related: ["remake-economics-ai-revisions", "ai-4-pack-vs-single-orders", "human-quality-check-ai-artifacts"],
  body: [
    h2("Why a miss rate is normal, not a failure"),
    p(t("AI generation is probabilistic. Even a strong brief can produce a slightly wrong colour, an awkward hand, a shadow that hides the product, or a background detail that competes with the subject. That does not mean the brief was careless or the service failed; it means the technology works by approximation and some approximations land closer than others. Sellers who understand that in advance brief better, judge images more calmly, and leave time for the correction step that professional photography also has, under names like retouching, reshoot, and selection.")),
    p(t("The practical mistake is budgeting as if the first version must always be final. That assumption creates panic when a campaign image needs a fix the day before a sale, and it pushes teams to accept a flawed image because no money or time was reserved to improve it. A small explicit reserve changes the conversation from blame to process: the image is checked, the single most important correction is named, and the remake is ordered with a clear instruction instead of a frustrated rewrite of the whole brief.")),
    h2("How much reserve is sensible"),
    p(t("For routine catalogue work with proven templates, a light reserve is usually enough because most images land close and corrections are minor. For a new product, a new style, or a hero campaign image, reserve more, because you are still learning what the model does with that product and scene. Rather than quoting a universal percentage, track your own last twenty orders: how many needed a remake, and for what reason. Your own record by category is far more useful than a generic industry claim, and it quickly shows which briefs need better references instead of more remakes.")),
    p(t("Put the reserve in the same worksheet as the original orders so it is visible before the month starts. For example, a set of listing images might carry a handful of ₹5 remakes as a named line, alongside the singles and packs that create the images in the first place. That visibility matters for approval inside a small business: a partner or manager who has already agreed to the reserve does not need to re-approve every small correction, so a fix that should take minutes does not wait days for a fresh decision.")),
    h2("Make each remake do one clear job"),
    p(t("A remake works best when it changes one important thing: the background colour, the angle, the light, the prop, or the colour accuracy of the product. Asking for five unrelated changes in one remake recreates the original problem and makes it hard to know what helped. Rank the issues, fix the one that would stop you using the image, and only then decide whether a second remake is still needed. Often the first correction makes the lesser issues acceptable, because the image finally matches the purpose it was created for.")),
    p(t("Write the remake instruction as a comparison, not a fresh fantasy. Say what must stay the same as clearly as what must change: keep the product, angle, and framing, change only the background to a plain warm tone, for example. That protects the parts of the image that already worked and prevents a correction from introducing a new problem elsewhere. Keep the original brief and the remake note together, because together they become a better template for the next similar product in your catalogue.")),
    h2("Turn misses into a better brief library"),
    p(t("Every remake teaches something specific if you record it. A repeated colour problem points to a need for better reference photos in daylight. Repeated background clutter points to a simpler scene rule. Repeated text problems point to a decision to avoid small label text or to choose a different angle. After a few weeks, those notes reduce the miss rate itself, so the reserve is needed less often for the same categories. That improvement loop is the real return on a remake budget: not just fixed images, but fewer misses next month.")),
    p(t("Review the reserve monthly rather than daily. If you never use it, your templates are strong and you can trim it. If you always exhaust it on one category, that category needs a new template, a better reference, or a different format, not simply more money. Used this way, ₹5 remakes become a diagnostic tool as well as a correction service, and your content budget starts to reflect how your products actually behave in generation instead of how a perfect system would behave in theory.")),
    h2("A short checklist before you order"),
    list(
      [t("Name the destination first — listing, catalogue, feed, or video — so the format matches the job.")],
      [t("Write the brief in concrete details: subject, material or topic, angle, light, and what must not appear.")],
      [t("Check the delivered asset at full size, especially text, hands, colour, and product edges.")],
      [t("Record what worked so the next brief reuses a proven template instead of starting from zero.")],
    ),
    callout("tip", t("Keep the first order small and specific. One proven template or format is worth more than a large, vague batch, because it teaches you exactly what to repeat and what to fix before you spend on volume.")),
    p(
      t("Ready to apply this? Start with one clear order on "),
      link("the create page", "/create?service=product-photo"),
      t(", check the result at full size, and compare the flat price on "),
      link("the pricing page", "/pricing"),
      t(" before you commit to a larger batch."),
    ),
    cta("Budget the fix before you need it", "Add a small ₹5 remake reserve to your next order plan and keep your launch date safe.", "Create an order", "/create?service=product-photo"),
  ],
};

export default post;
