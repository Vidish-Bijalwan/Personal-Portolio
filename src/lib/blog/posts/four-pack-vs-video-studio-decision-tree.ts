import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "four-pack-vs-video-studio-decision-tree",
  title: "When to Order the 4-Pack vs Video Studio: A Decision Tree",
  description: "Need variants of one idea or a finished video job? This simple decision tree helps Indian sellers choose between the ₹49 4-pack and ₹29 Video Studio.",
  date: "2026-10-12",
  category: "Pricing",
  tags: ["4-pack", "video studio", "pricing", "decision", "sellers"],
  readingMinutes: 6,
  answer: [
    t("Order the 4-pack when you need several still images exploring one idea, and order Video Studio when you need a finished video task such as voice-over, captions, or trimming handled as one job. The 4-pack is ₹49 for four images on one concept; Video Studio is ₹29 per job. Choosing by output type, not by price alone, avoids buying images when you needed a video and paying for video work when a still would convert better. Compare both on "),
    link("the create page", "/create?service=product-photo"),
    t(" and "),
    link("the pricing page", "/pricing"),
    t("."),
  ],
  sources: [
    { label: "Etch pricing — flat catalog, no subscription", url: "https://tryetch.online/pricing" },
    { label: "VEED AI video tools — editor-based alternative", url: "https://www.veed.io/tools/ai-video" },
  ],
  faqs: [
    {
      q: "Can I split a 4-pack across different products?",
      a: "Brief one concept per pack for the best consistency. A pack works best as four variants of one idea, such as angles, scenes, or colour adaptations that share a style. If you need images for unrelated products, separate orders give each product a clearer brief and a cleaner quality check, and they reduce the chance of details crossing between products.",
    },
    {
      q: "Is Video Studio for creating a video from nothing?",
      a: "Video Studio is for defined video jobs such as voice-over, captions, and trimming work on an existing idea or footage. If you have no footage and no tested message, start by clarifying the concept, often with still images, so the video job has a clear script and purpose when you order it.",
    },
    {
      q: "Which is cheaper if I need both stills and a video?",
      a: "Price them as separate jobs with separate purposes: stills for listings and catalogues, a video job for the feed or product page. Trying to make one order substitute for the other usually produces a weak version of both. The flat prices make this comparison easy because each job has its own printed price with no bundle maths hidden inside.",
    },
    {
      q: "What if I choose wrong and the asset does not fit?",
      a: "Use the experience to tighten the destination question next time, and use a remake where a still image needs a creative correction. A video task that was wrong in concept usually needs a new brief rather than a tweak, which is why testing the message with a low-cost still first is worth doing for uncertain ideas.",
    },
  ],
  related: ["ai-4-pack-vs-single-orders", "ai-content-budget-worksheet-small-business", "credit-packs-vs-flat-pricing"],
  body: [
    h2("Ask what the finished asset must do"),
    p(t("Start with the job the asset has to do in the next seven days. If a buyer needs to inspect a product, compare variants, or choose a colour, a still image does that job faster and more clearly than a video. If the asset needs to explain a process, carry a voice, or hold attention in a feed that auto-plays, video earns its place. Many sellers reverse this logic and order video because it feels more advanced, then discover that their marketplace listing, catalogue, or ad thumbnail still needs the still image they never bought.")),
    p(t("Write the destination before you choose the product. A marketplace listing, a WhatsApp catalogue, and a printed leaflet are still-image destinations. A reel, a Short, or a product video section may need moving content, captions, and sound. Once the destination is fixed, the decision usually becomes obvious, and you stop paying for formats that the channel cannot even display properly. That habit, repeated across a month of orders, saves more money than hunting for a small discount on the wrong format.")),
    h2("When the 4-pack is the right answer"),
    p(t("Choose the 4-pack when one idea deserves options. That includes a hero product that needs a clean shot, a lifestyle scene, a detail view, and a festive variant, or a new design where you are not yet sure which background or angle will win. Four related images let you test without paying the single-image price four times, and they keep the set visually consistent because they are briefed as one concept. The pack is also right when you already know the winning direction and need it adapted for several SKUs, sizes, or seasonal colours in a controlled way.")),
    p(t("The pack is not a bundle of unrelated wishes. Briefing four completely different products or four unrelated scenes as one pack weakens the consistency that makes the pack valuable and makes quality checking harder. Keep one concept per pack, state the four variants clearly, and rank them so the most important variant is first. If two variants matter much more than the others, say so in the brief; a human fulfilling the order can then protect those two when a generation needs to be redone.")),
    h2("When Video Studio is the right answer"),
    p(t("Choose Video Studio when you already have footage or a clear video task and need it finished properly. Typical jobs are adding a voice-over to a demonstration, captioning a talking clip so it works on mute, or trimming and adding text so a long recording becomes a usable short. The value is in the finished job, not in owning more raw clips. If your problem is that a good video is sitting unused because it has no captions, no clean start, or no voice, a studio job solves the actual blockage for ₹29.")),
    p(t("Video Studio is the wrong answer when you have no footage, no script, and no clear message yet. In that case a still-image pack can help you test the message first: which product angle, which headline, and which scene gets response. Once the stills prove the concept, a video job built on the winning direction is far less likely to be wasted. Sequence matters, and testing cheaply with stills before committing to video is a sensible order for small budgets.")),
    h2("A three-question tree you can reuse"),
    p(t("Ask three questions in order. First, must the asset move or speak to do its job? If no, order stills. Second, if stills, do you need options or variants of one idea? If yes, choose the 4-pack; if you need only one certain image, a single at ₹15 or a product photo at ₹29 may be enough. Third, if the asset must move, do you already have footage or a defined video task? If yes, choose Video Studio; if no, test the concept with stills first. That tree handles most routine decisions in under a minute.")),
    p(t("Keep a small note each time the tree leads you to an order and whether the asset was actually used. After a month you will see your own pattern, for example that catalogue stills are used every time while speculative videos often sit unpublished. Let that record refine your defaults. Good pricing decisions for a small business are rarely about one order; they are about building a repeatable rule that stops the same waste from happening quietly every week.")),
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
    cta("Choose by destination, then order", "Stills for listings and catalogues, Video Studio for a defined video job. Both prices are flat and printed upfront.", "See the create options", "/create?service=product-photo"),
  ],
};

export default post;
