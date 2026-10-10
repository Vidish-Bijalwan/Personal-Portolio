import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "ad-copy-ctas-that-convert",
  title: "Ad Copy & CTAs That Convert: Formulas for Indian Small Shops",
  description:
    "Weak ad copy burns budgets before the creative even gets seen. Learn five copy formulas with Indian shop examples, CTA verbs that sell, and Hindi/Hinglish notes.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["ad copy", "cta", "copywriting", "meta ads", "small business"],
  readingMinutes: 7,
  answer: [
    t("Ad copy that converts follows a pattern: a hook in the first line, a concrete offer or proof in the middle, and exactly one CTA verb telling the reader what to do. For Indian small shops, keep sentences short, state the offer as a real number, and write CTAs as direct commands — "),
    t("\u201CWhatsApp now\u201D, \u201CBook your slot\u201D, \u201COrder before Sunday\u201D"),
    t(". Hinglish often outperforms pure English in reels captions and WhatsApp broadcasts, because that is how your customers actually talk."),
  ],
  sources: [
    { label: "HubSpot — 120+ call-to-action examples", url: "https://blog.hubspot.com/marketing/call-to-action-examples" },
    { label: "WordStream — Facebook ad copy best practices", url: "https://www.wordstream.com/blog/ws/facebook-ad-copy" },
    { label: "Meta — Ad creative best practices", url: "https://www.facebook.com/business/ads/ad-creative" },
  ],
  faqs: [
    {
      q: "How long should my ad copy be?",
      a: "Short enough to read in five seconds. The headline does the stopping, the first line does the promising, and the CTA does the selling — anything else is decoration. For feed ads, two to three lines plus the CTA beats a paragraph. For reels captions, put the offer and the CTA in the first two lines because Instagram truncates the rest behind \u201Cmore\u201D.",
    },
    {
      q: "Should my CTA be in Hindi or English?",
      a: "Match the channel, not the textbook. In WhatsApp broadcasts and reels captions aimed at Hindi-belt customers, Hinglish CTAs like \u201CAbhi order karo\u201D or \u201CWhatsApp pe book karo\u201D feel natural. On a printed-style poster or a website button, clean English (\u201CBook now\u201D, \u201COrder today\u201D) usually converts better because it looks like a real business. Test both on the same audience for a week and keep the winner.",
    },
    {
      q: "Can I use more than one CTA in an ad?",
      a: "One ad, one action. \u201CCall, WhatsApp, or visit\u201D gives the reader three ways to hesitate. If your goal is WhatsApp enquiries, every line should end at WhatsApp. Run a second ad for the second goal. Shops that pick a single CTA per creative consistently get more of that exact action, because the reader never has to decide.",
    },
    {
      q: "What does a finished ad creative cost if I don't design it myself?",
      a: "On Etch, a poster is ₹29 and a single AI image is ₹15 — you pay per creation over UPI with no subscription. You can write the copy yourself using the formulas in this guide and get the visual made, or do both yourself for free. Check the pricing page for the full catalog.",
    },
  ],
  related: [
    "make-product-ads-with-ai",
    "ai-video-hooks-text-overlays",
    "prompt-engineering-5-part-formula",
  ],
  body: [
    p(
      t("Here is the most common way a small shop burns ad money: the owner boosts a post with a nice photo, writes \u201CGreat quality at best price, DM for details\u201D, and wonders why the likes never become sales. The photo was fine. The copy failed. Ad copy is not decoration around the creative — it is the salesperson. The image stops the thumb; the words close the sale. This guide gives you five copy formulas you can fill in like a form, a list of CTA verbs that actually get clicked, and notes on writing in Hindi and Hinglish without sounding awkward.")
    ),
    h2("The anatomy: hook, offer, action"),
    p(
      t("Every converting ad has three parts, in this order. The hook is the first line — its only job is to stop the scroll. It should name the reader's problem or desire in their own words: \u201CHairfall before your sister's wedding?\u201D beats \u201CPremium salon services\u201D because one of them is a thought the reader already had today. The offer is the middle — one concrete reason to act now, stated as a real number: Rs 499 hair spa, free delivery above Rs 999, 20% off till Sunday. Vague offers (\u201Cbest price\u201D, \u201Cpremium quality\u201D) are invisible; specific ones get remembered. The action is the CTA — one verb, one destination. If the reader finishes your ad and does not know exactly what to do next, you wrote a poster, not an ad.")
    ),
    h2("Five copy formulas, with Indian shop examples"),
    p(
      t("Formulas exist so you never stare at a blank caption again. Pick the one that matches your situation, fill in your details, and ship it. Each example below is written the way a real shop would post it — borrow the structure, change the facts.")
    ),
    table(
      ["Formula", "When to use it", "Example"],
      [
        [
          "Problem \u2192 Agitate \u2192 Solve",
          "Services where the pain is obvious: salons, repairs, clinics",
          "\u201CPhone screen cracked a week before Diwali photos? A spiderweb crack ruins every selfie. We replace screens in 40 minutes, Rs 1,499 all-in. WhatsApp us a photo of the damage.\u201D",
        ],
        [
          "Number-first",
          "Food, cafes, anything with a menu and a price",
          "\u201C3 things under Rs 199 at our cafe this week: filter coffee + bun maska, cheese maggi, and the cold coffee everyone posts. Open till 11 pm, near the station. Walk in today.\u201D",
        ],
        [
          "Objection-killer",
          "When customers assume you are expensive or far",
          "\u201CYes, we stitch blouses in 48 hours. No, it is not Rs 800 \u2014 it starts at Rs 350. Bring your own fabric. Send your measurements on WhatsApp.\u201D",
        ],
        [
          "Deadline",
          "Festivals, sales, limited stock",
          "\u201CKarva Chauth mehendi slots close Thursday. Rs 501 onwards, home service in Sector 62. 9 of 14 slots are taken \u2014 book yours on WhatsApp now.\u201D",
        ],
        [
          "Proof",
          "When you have reviews, repeat buyers, or a queue",
          "\u201C214 tiffins delivered every day in Indiranagar. Rs 99 per meal, monthly plan Rs 2,499. Try one week \u2014 if you skip a day, we refund it. Start Monday.\u201D",
        ],
      ]
    ),
    h2("CTAs: one verb, one destination"),
    p(
      t("The CTA is the smallest line in your ad and the one that decides whether money comes back. Weak CTAs are vague (\u201CDm for details\u201D), passive (\u201Ccontact us\u201D), or offer homework (\u201Cvisit our website to learn more\u201D). Strong CTAs are verbs your customer already uses, pointing at a channel they already trust. In India that is usually WhatsApp, a phone call, or a physical visit — not a form.")
    ),
    list(
      [t("\u201CWhatsApp now\u201D \u2014 the default for boutiques, jewellers, home bakers. One tap, one chat, one sale.")],
      [t("\u201CBook your slot\u201D \u2014 salons, clinics, tutors, mehendi artists. The word \u201Cslot\u201D implies scarcity without lying about it.")],
      [t("\u201CCall before 8 pm\u201D \u2014 adds a same-day deadline to a phone CTA. Works for repair shops and caterers.")],
      [t("\u201COrder before Sunday\u201D \u2014 weekly rhythm for tiffins, bakeries, subscription boxes.")],
      [t("\u201CSend your size\u201D \u2014 fashion sellers: lowers the first step to typing two numbers in a chat.")],
      [t("\u201CGet the menu\u201D \u2014 restaurants and cloud kitchens; the menu PDF in WhatsApp is the real landing page.")],
      [t("\u201CVisit us today\u201D \u2014 footfall businesses; pair it with a landmark, not just an address.")],
      [t("\u201CTry one week\u201D \u2014 trial framing for tiffins, milk, coaching. A small yes beats a big ask.")],
      [t("\u201CSave this post\u201D \u2014 for educational or catalogue-style content where the sale comes later.")],
      [t("\u201CTag someone who needs this\u201D \u2014 referral engine for gifting, wedding services, and kids\u2019 products.")],
    ),
    h2("Hindi, Hinglish, or English?"),
    p(
      t("Write the way your customers talk to each other, not the way textbooks talk. For most Indian small businesses, that is Hinglish in Roman script for WhatsApp broadcasts and reels captions \u2014 \u201CDiwali sale shuru! Kurtis Rs 499 se, sirf Sunday tak.\u201D For a printed-style poster, a shop board, or a formal invoice-style ad, Devanagari or clean English looks more trustworthy: \u201C\u0926\u0940\u0935\u093e\u0932\u0940 \u0938\u0947\u0932 \u2014 \u0915\u0941\u0930\u094d\u0924\u093f\u092f\u093e\u0902 Rs 499 \u0938\u0947\u201D. Three rules keep it clean: never mix scripts inside one sentence, keep the CTA verb consistent across the whole ad, and read the line aloud \u2014 if it sounds like something you would actually say to a customer, it is right.")
    ),
    h2("The 30-minute ad-writing checklist"),
    p(
      t("Sit with one product, one offer, and this list. Thirty minutes, no design tools needed:")
    ),
    list(
      [t("Write the customer's problem in their words \u2014 one sentence, no adjectives.")],
      [t("Add your offer as a number: price, discount, deadline, or quantity.")],
      [t("Pick ONE action: WhatsApp, call, or visit. Delete the others.")],
      [t("Draft three hooks and keep the one you would tap.")],
      [t("Read it aloud. If you stumble, shorten the sentence.")],
      [t("Check: could a stranger tell what to do next in five seconds? If not, the CTA is weak.")],
      [t("Now design the visual around the words \u2014 or get one made.")],
    ),
    callout("tip",
      t("Save every ad that gets you a sale in one folder with its numbers: spend, enquiries, sales. After ten ads you will see your own pattern \u2014 which hooks, which offers, which CTAs. That folder is worth more than any copywriting course.")
    ),
    cta(
      "Words ready, visual missing?",
      "Write the copy yourself with the formulas above, and get a finished poster made for ₹29 \u2014 pay per creation, no subscription.",
      "Create a poster",
      "/create"
    ),
    p(
      t("Good copy plus a clean visual is the whole game at small-business scale. If you want the full breakdown of what a finished creative should cost, see the "),
      link("pricing page", "/pricing"),
      t(" \u2014 every price listed plainly, no plans, no lock-in.")
    ),
  ],
};

export default post;
