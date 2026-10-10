import type { BlogPost } from "../types";
import { t, link, p, h2, list, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "before-after-ad-makeover",
  title: "Before/After Ad Makeover: Rebuilding a Weak Ad, Step by Step",
  description:
    "An illustrative ad makeover: a weak footwear-store ad diagnosed and rebuilt in 7 steps — headline, offer, CTA, layout, caption — plus a checklist to run on your ads.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["ad makeover", "before after", "ad critique", "creative audit", "small business"],
  readingMinutes: 7,
  answer: [
    t("A weak ad usually fails in five fixable ways: no clear hook, a vague offer, a missing or multiple CTA, text outside the safe zone, and a caption that repeats the image. The makeover below rebuilds an illustrative footwear-store ad \u2014 an invented teaching example, not a real client \u2014 in 7 steps: one headline, one numbered offer, one CTA verb, safe-zone layout, a readable price, a rewritten caption, and the right size per placement. Same product, same budget, different ad."),
  ],
  sources: [
    { label: "Meta — Ad creative best practices", url: "https://www.facebook.com/business/ads/ad-creative" },
    { label: "HubSpot — 120+ call-to-action examples", url: "https://blog.hubspot.com/marketing/call-to-action-examples" },
    { label: "WordStream — Facebook ad copy best practices", url: "https://www.wordstream.com/blog/ws/facebook-ad-copy" },
  ],
  faqs: [
    {
      q: "Is the before/after example in this post a real client's ad?",
      a: "No. The footwear-store ad is an illustrative example invented for teaching \u2014 it is deliberately built from the most common mistakes real shops make, so you can recognize them in your own ads. We do not publish real clients' underperforming ads, and any before/after you see from a service should tell you plainly whether the example is real or illustrative.",
    },
    {
      q: "How long does an ad makeover like this take in practice?",
      a: "About an hour for the thinking and one more for the design. The diagnosis (steps 1\u20133) is the fast part once you know what to look for; rebuilding the visual takes the rest. Most of the value is in the first 20 minutes \u2014 fixing the headline, the offer, and the CTA \u2014 which is why this guide front-loads the words before the pixels.",
    },
    {
      q: "Should I remake the ad or just edit the old one?",
      a: "Remake it as a new creative. Edited old ads carry their history: Meta has already learned who ignores that creative, and your audience has already trained their thumbs to skip it. A fresh creative with the fixed copy gets a clean learning run. Keep the old one's data as your baseline to beat.",
    },
    {
      q: "What does a rebuilt ad creative cost on Etch?",
      a: "A poster remake is ₹29 per creation and a single AI image is ₹15, paid over UPI with no subscription. If you only need the visual rebuilt around copy you wrote yourself, one order covers it. The full catalog is on the pricing page.",
    },
  ],
  related: [
    "make-product-ads-with-ai",
    "ai-video-hooks-text-overlays",
    "ai-content-budget-worksheet-small-business",
  ],
  body: [
    p(
      t("A note before we start: the ad below is an illustrative example I invented for teaching. It is not a real client's ad, and the \u201Cafter\u201D is not a real result \u2014 it is a demonstration of method. I built the \u201Cbefore\u201D out of the five mistakes I see most often in small-shop ads, so that you can run the same diagnosis on your own creatives. Keep that framing in mind: the value here is the checklist, not the example.")
    ),
    h2("The \u201Cbefore\u201D: a weak ad, exactly as shops usually post"),
    p(
      t("Meet our fictional shop: a family footwear store in Patna, running a square 1:1 image as a stories ad for a festive sale. The image shows four shoe pairs crowded together on a busy shop shelf, photographed under yellow tubelight. Across it, in small white all-caps text: \u201CBEST QUALITY FOOTWEAR AT UNBEATABLE PRICES, ALL BRANDS AVAILABLE, WHOLESALE AND RETAIL, VISIT TODAY OR CALL OR WHATSAPP\u201D. The price \u2014 Rs 799 \u2014 sits in the bottom-right corner, directly under where Instagram puts its action buttons. The caption reads: \u201CNew stock arrived! DM for details.\u201D It got likes from relatives and zero enquiries. Let us diagnose why.")
    ),
    h2("Diagnosis: five things killing it"),
    list(
      [t("No hook. \u201CBEST QUALITY FOOTWEAR\u201D is a claim every shop makes; it stops no thumbs because it promises nothing specific. The reader's brain files it as noise in half a second.")],
      [t("Vague offer. \u201CUnbeatable prices\u201D with no number is invisible. Rs 799 is the actual offer and it is buried in the corner \u2014 the one concrete fact in the ad is the hardest to read.")],
      [t("Three CTAs. Visit, call, or WhatsApp \u2014 the reader must choose, so the reader chooses nothing. One ad, one action.")],
      [t("Text outside the safe zone. The price sits under Instagram's interface buttons in stories; on many phones it is literally covered. The headline fights the busy shelf background with no contrast backing.")],
      [t("Caption repeats the image. \u201CNew stock arrived! DM for details\u201D adds zero information and the CTA (\u201CDM\u201D) contradicts the image's \u201Cvisit/call/WhatsApp\u201D. The two halves of the ad were written by different instincts.")],
    ),
    h2("The rebuild, step by step"),
    p(
      t("Same shop, same Rs 799 offer, same phone camera. Seven steps, words first:")
    ),
    list(
      [t("Step 1 \u2014 one headline. Replace the all-caps wall with a hook that names the reader's moment: \u201CDiwali shopping? Start from the ground up.\u201D One line, one idea, big enough to read at arm's length.")],
      [t("Step 2 \u2014 one numbered offer. Make Rs 799 the hero: \u201CFestive loafers \u2014 Rs 799, sizes 6\u201311.\u201D A real number beats \u201Cunbeatable prices\u201D every time.")],
      [t("Step 3 \u2014 one CTA. The shop's real strength is walk-ins near the station, so: \u201CVisit us today \u2014 opposite the station, open till 9 pm.\u201D Delete call and WhatsApp from this creative; they get their own ad later.")],
      [t("Step 4 \u2014 safe-zone layout. Rebuild as a true 1080×1920 for stories: headline in the top safe band, product in the middle, price and CTA in the lower safe band \u2014 clear of the top bar and the bottom buttons.")],
      [t("Step 5 \u2014 fix the photo. One pair of loafers on a plain white sheet near the window (morning light), instead of four pairs on a cluttered shelf under tubelight. One product per ad.")],
      [t("Step 6 \u2014 rewrite the caption to add information, not repeat it. \u201CNew festive loafers in store \u2014 Rs 799, sizes 6 to 11. Opposite Patna station, open till 9 pm. Walk in this week.\u201D Sizes, landmark, hours \u2014 things the image cannot say.")],
      [t("Step 7 \u2014 size per placement. Export the 9:16 for stories and reels, and a separate 1080×1350 (4:5) for the feed \u2014 same elements, recomposed, not stretched.")],
    ),
    h2("The \u201Cafter\u201D: same budget, different ad"),
    p(
      t("The rebuilt ad: a clean window-lit photo of one loafer pair, the headline \u201CDiwali shopping? Start from the ground up.\u201D across the top, \u201CRs 799 \u00B7 Sizes 6\u201311\u201D centered on the product, and \u201CVisit us today \u2014 opposite the station, open till 9 pm\u201D at the bottom, all inside the safe zone. The caption carries the details the image cannot. Nothing in the after version cost more than the before \u2014 same phone, same shop, same Rs 799. What changed is decisions: one hook, one offer, one action, one product, correct sizes. That is the entire makeover method, and it works on any weak ad because weak ads almost always fail in the same five ways diagnosed above.")
    ),
    h2("Run this on your own ads tonight"),
    list(
      [t("Screenshot your last three ads and open them on your phone.")],
      [t("Circle the hook. If you cannot find one sentence doing the stopping, write one.")],
      [t("Find the offer number. If there is no price, discount, or deadline, add one.")],
      [t("Count the CTAs. More than one? Pick the action you actually want and delete the rest.")],
      [t("Check the safe zone. Is any text under a button, bar, or rail? Move it.")],
      [t("Read the caption. Does it add information the image lacks, or just repeat it? Rewrite accordingly.")],
      [t("Rebuild as a fresh creative \u2014 do not edit the old one \u2014 and compare results after a week.")],
    ),
    callout("note",
      t("Remember the framing: this was an illustrative example, not a real client result. Real makeovers vary \u2014 a fixed ad in a dead market still struggles, and a great ad cannot save a bad offer. The checklist improves your odds; it does not guarantee them. Anyone promising guaranteed results from a redesign is selling, not teaching.")
    ),
    cta(
      "Want your copy rebuilt into a clean visual?",
      "Bring the words \u2014 headline, offer, CTA \u2014 and get a finished poster made for ₹29, pay per creation, no subscription.",
      "Create a poster",
      "/create"
    ),
    p(
      t("If you would rather write the whole ad yourself first, the copy formulas are in our "),
      link("ad copy guide", "/blog/ad-copy-ctas-that-convert"),
      t(", and every Etch price is listed plainly on the "),
      link("pricing page", "/pricing"),
      t(".")
    ),
  ],
};

export default post;
