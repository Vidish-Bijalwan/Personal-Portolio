import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ai-portrait-prompts-indian-faces",
  title: "AI Portrait Prompts That Actually Work for Indian Faces",
  description:
    "Generic prompts wash out Indian features. A 6-part prompt formula for realistic Indian portraits — skin tones, hair, and clothing done right.",
  date: "2026-10-07",
  category: "Guides",
  tags: ["portraits", "prompts", "AI images", "India", "guide"],
  readingMinutes: 6,
  answer: [
    t("Good AI portraits of Indian faces come from specific prompts: name the skin tone range, hair texture, and regional clothing honestly, describe natural lighting, and set the camera angle like a photographer would. On "),
    link("Etch", "/"),
    t(", a portrait costs a flat "),
    t("₹15"),
    t(" per image — you write the prompt, pay over UPI, and get a human-reviewed result, most orders within 24 hours. Avoid prompts that describe one generic “South Asian” look; specificity is what makes the face believable."),
  ],
  sources: [
    { label: "Etch pricing — single image ₹15", url: "https://tryetch.online/pricing" },
    { label: "TalkPix pricing — AI portrait pricing comparison", url: "https://www.talkpix.ai/pricing" },
  ],
  faqs: [
    {
      q: "Why do AI portraits of Indian faces often look off?",
      a: "Most models are trained predominantly on Western imagery, so vague prompts default to Western features. The fix is descriptive: specify warm brown skin tone, black or dark brown hair texture, and natural facial structure details instead of relying on a single ethnicity label. Every Etch image also passes a human quality check before delivery.",
    },
    {
      q: "How much does one AI portrait cost?",
      a: "On Etch, a single AI portrait costs a flat ₹15. There is no subscription and no credit pack — you describe the portrait, pay over UPI, and receive a human-reviewed image. A remake costs ₹5 if the first version misses the likeness or lighting.",
    },
    {
      q: "Can I use a real photo as a reference for the portrait?",
      a: "Yes — attaching a reference photo of the actual person helps enormously with likeness, hairstyle, and proportions. Describe in the prompt what should stay the same (face, features) and what can change (background, lighting, clothing). Never generate portraits of real people without their permission.",
    },
    {
      q: "What resolution or format do I get?",
      a: "Portraits are delivered as high-resolution images suitable for profile photos, LinkedIn, matrimonial profiles, and print enlargements at common sizes. If you need a specific crop — square for profiles, portrait for posters — state it in the prompt before ordering.",
    },
  ],
  related: [
    "ai-image-generator-india-pay-per-creation",
    "what-is-pay-per-creation-ai",
    "ai-trends-templates-explained",
  ],
  body: [
    p(
      t("Type “beautiful Indian woman portrait” into most AI image tools and you'll get something that feels almost right but not quite — skin a shade too light, features slightly off, jewellery that doesn't sit like real jewellery. The models aren't broken; they're under-specified. "),
      t("AI portrait prompts"),
      t(" for Indian faces work when you stop trusting the model's defaults and start directing it like a photographer on a real shoot.")
    ),
    h2("The 6-part portrait prompt formula"),
    p(
      t("Every strong portrait prompt has six parts, in this order: subject, skin and features, hair, clothing and styling, lighting, and camera. Here's a working example:")
    ),
    list(
      [t("Subject: “a 30-year-old Indian man, warm smile, confident expression”")],
      [t("Skin and features: “medium-warm brown skin, natural skin texture with visible pores, well-defined nose”")],
      [t("Hair: “short black hair with natural volume, light stubble”")],
      [t("Clothing: “navy blue kurta, simple collar, no logos”")],
      [t("Lighting: “soft window light from the left, gentle shadow on the right cheek”")],
      [t("Camera: “85mm portrait lens, head-and-shoulders, blurred warm-toned background”")],
    ),
    p(
      t("The magic is in parts two through four. “Indian” alone is doing almost no work — India has enormous variation in skin tone, features, and dress, and a single label collapses all of it. Describe what you actually see: "),
      t("warm brown"),
      t(", "),
      t("deep brown"),
      t(", "),
      t("olive"),
      t(" — name it, and the model's defaults stop overriding you.")
    ),
    h2("Skin tone: say it plainly"),
    p(
      t("Vague prompts produce a washed-out middle that pleases nobody. Be direct: “warm medium-brown skin with natural undertones” or “deep brown skin, rich and even”. Add “natural skin texture” to avoid the plastic airbrushed look that screams AI. If you're working from a reference photo, say “match the skin tone of the reference photo” and let the image do the describing.")
    ),
    callout("tip",
      t("The fastest quality jump in Indian AI portraits: add “shot on 85mm lens, shallow depth of field, catchlight in the eyes”. Catchlights — the small reflections in the eyes — are what separate a portrait that feels alive from one that feels rendered.")
    ),
    h2("Hair and clothing: where realism dies"),
    p(
      t("AI models render generic “long dark hair” competently, but Indian hairstyles and dress deserve the same specificity: “shoulder-length black hair with a middle parting”, “neatly tied bun with a gajra”, “closely cropped hair, clean fade”. For clothing, name the garment and fabric: “maroon silk saree with gold border”, “white cotton kurta-pyjama”, “blazer over a plain t-shirt”. Generic words like “traditional dress” produce a costume-shop approximation.")
    ),
    h2("Lighting makes the portrait"),
    p(
      t("Flat “studio lighting” flattens Indian skin tones. Ask for direction instead: “soft golden-hour light from a window”, “even overcast daylight”, “warm indoor lamp light”. Directional light shows skin texture and gives the face dimension. If you want a formal LinkedIn-style headshot, try “clean grey studio background, soft key light, subtle rim light” — professional without the passport-photo flatness.")
    ),
    h2("What to avoid in portrait prompts"),
    table(
      ["Instead of…", "Write…", "Why"],
      [
        ["“beautiful Indian girl”", "“25-year-old Indian woman, minimal makeup, natural expression”", "Age and styling beat adjectives"],
        ["“traditional clothes”", "“emerald green anarkali with subtle embroidery”", "Specificity kills the costume look"],
        ["“fair skin”", "The actual tone: “warm light-brown skin”", "“Fair” is a colonial hangover, not a color"],
        ["“perfect skin”", "“natural skin texture, realistic pores”", "“Perfect” triggers plastic rendering"],
        ["“cinematic”", "“soft window light, shallow depth of field”", "Name the technique, not the vibe"],
      ]
    ),
    h2("From prompt to finished portrait"),
    p(
      t("Once your prompt is written, the rest is simple. On "),
      link("Etch", "/create"),
      t(" you paste the prompt, optionally attach a reference photo for likeness, pay "),
      t("₹15"),
      t(" over UPI, and receive the image after a human quality check — most orders within 24 hours. The "),
      link("pricing page", "/pricing"),
      t(" lists every price plainly, and a remake is "),
      t("₹5"),
      t(" if the first pass misses the likeness. For a batch — say, team headshots — the 4-pack at "),
      t("₹49"),
      t(" covers four portraits.")
    ),
    h2("A note on consent"),
    p(
      t("AI portraits of real people are powerful and easy to misuse. Only generate portraits of people who have agreed to it — for matrimonial profiles, professional headshots, or gifts, that's usually straightforward. Don't create portraits of public figures or strangers, and don't present an AI portrait as a real photograph of an event that never happened.")
    ),
    cta(
      "Try your portrait prompt for ₹15",
      "Write the prompt, attach a reference photo, pay with UPI — delivered after a human quality check.",
      "Create your portrait",
      "/create?service=single-image"
    ),
  ],
};

export default post;
