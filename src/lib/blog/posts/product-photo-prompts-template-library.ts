import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "product-photo-prompts-template-library",
  title: "Product Photo Prompts That Work: A Seller's Template Library",
  description: "Reusable product photo prompts for Indian sellers: copy a template, swap the product, material and scene, and brief a clean listing image every time.",
  date: "2026-10-12",
  category: "Guides",
  tags: ["prompts", "product photo", "templates", "sellers", "guides"],
  readingMinutes: 6,
  answer: [
    t("A good product photo prompt is a reusable template, not a lucky sentence. Keep the structure fixed — product, material, angle, light, background, and what to avoid — and swap only the product details each time. That consistency is why a template library beats rewriting from scratch for every SKU. On Etch, a product photo is ₹29, a single image is ₹15, and a 4-pack is ₹49, so a tested template also protects your budget. Start on "),
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
      q: "How long should a product photo prompt be?",
      a: "Long enough to fill the six slots and no longer. In practice that is usually two to four clear sentences. Very short prompts leave angle, light, and background to chance, while very long prompts often contradict themselves. If you cannot read your prompt aloud and picture one single image, it is probably trying to do too much at once.",
    },
    {
      q: "Should I write prompts in English or Hinglish?",
      a: "Use the language you can be most precise in, but keep product, material, and colour names exact. Mixed language is fine for a human-fulfilled order because a person reads the brief before generation. What matters is clarity about the product and the scene, not polished grammar. Avoid vague praise words in any language and replace them with visible details.",
    },
    {
      q: "Can one template work for my whole catalogue?",
      a: "One template can work for one product family with similar size, material, and use. It rarely works across unrelated products. A template that suits a bottle will usually fail for clothing or furniture because angle, light, and scale need to change. Keep a small set of family templates instead of forcing one master prompt onto everything you sell.",
    },
    {
      q: "What if my template produces a good image with wrong colour?",
      a: "Say the true colour plainly in the prompt, provide a clear phone reference photo in daylight, and flag colour accuracy as a priority in the brief. If the delivered image is still off, use a remake to correct that single point. Colour drift is a known limit of AI generation, so managing it explicitly works better than hoping a style word will fix it.",
    },
  ],
  related: ["prompt-engineering-5-part-formula", "phone-snap-to-listing-ready-ai-pipeline", "ai-product-photography-india-sellers"],
  body: [
    h2("Start with the template, not the adjective"),
    p(t("Most weak prompts fail for the same reason: they describe a feeling instead of a scene. Words like premium, beautiful, or stunning give a model almost nothing to build from, while concrete nouns and materials give it a clear job. A seller template forces the concrete parts in first. Name the exact product, its colour, its material, and its size relationship to the scene, then describe the surface it sits on and the light falling on it. When those elements are present, the result is far more predictable, and when the result is wrong you can see which slot in the template caused it instead of guessing at the whole sentence.")),
    p(t("Build your library around the products you actually sell. A steel bottle, a cotton kurti, and a jar of face cream do not need the same angle or the same background, but they do need the same discipline. Keep one proven template per product family, note what worked, and reuse it. Over a month, that small library becomes more valuable than any single clever prompt, because it turns briefing from a creative gamble into a routine your team can repeat on a busy dispatch day without lowering quality.")),
    h2("The six slots every template needs"),
    p(t("A reliable template has six slots. First, the product itself, stated plainly with no marketing language. Second, material and finish, because matte ceramic, brushed steel, and glossy plastic all catch light differently. Third, angle and framing, such as a three-quarter view filling most of the frame. Fourth, light, described by direction and softness rather than by mood. Fifth, background and surface, kept simple enough that the product remains the subject. Sixth, exclusions, the short list of things that must not appear, such as extra props, hands, or text. Fill all six and you have a brief a human reviewer can also check against.")),
    p(t("Exclusions deserve special care in India-focused listings. If your product has a label, say whether the label text must stay legible or whether the shot should avoid text altogether. If colour accuracy matters for a sari, a spice, or a lipstick shade, say so in the template itself rather than hoping the model guesses. Those notes travel with the template, so every future order inherits the lesson from an earlier remake instead of paying to learn it again.")),
    h2("Three templates sellers can copy today"),
    p(t("For a packaged food or wellness jar, try this pattern: the product centred on a clean kitchen surface, soft daylight from the left, plain warm background, no extra food scattered around it, label facing forward. For apparel on a plain background, specify the garment laid flat or shown in a ghost style, even light with no harsh shadow, and the true colour named explicitly. For small accessories such as earbuds, covers, or jewellery, ask for a close view on a neutral surface, sharp detail on edges and texture, and nothing else in frame except a soft shadow. Each pattern is short, and that is the point.")),
    p(t("Notice what these templates do not do. They do not stack ten style words, they do not ask for a busy lifestyle scene and a clean catalogue shot in the same breath, and they do not promise a festival, a kitchen, and a studio in one image. One template makes one kind of image well. If you need both a clean listing shot and a lifestyle scene, brief them as two separate images, ideally in a 4-pack, so each one can succeed on its own terms rather than both failing as a compromise.")),
    h2("How to test and improve a template"),
    p(t("Test a template on one product before you trust it across a catalogue. Order a single image, look at it at full size, and check the product shape, colour, edges, and label against your real item. If something is off, change one slot only, usually angle, light, or background, and try again. Changing everything at once teaches you nothing. When a version works, save the exact wording, the product it worked for, and a note about what you changed. That record is the library, and it is more useful than a folder of screenshots with no explanation.")),
    p(t("Use remakes deliberately in this process. A remake at ₹5 is the cheapest way to redirect a nearly right image, for example by fixing a shadow, a surface, or a background colour, without starting a new order. Plan for a small number of remakes while you are building a new template, then expect the cost per listing to fall once the template is proven. Sellers who track that learning cost separately from their routine listing cost make calmer decisions and stop blaming a good template for the price of developing it.")),
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
    cta("Try a template on one product", "Brief one product photo with a six-slot template and judge the result at full size before rolling it out.", "Create a product photo", "/create?service=product-photo"),
  ],
};

export default post;
