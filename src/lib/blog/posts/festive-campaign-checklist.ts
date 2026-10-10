import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "festive-campaign-checklist",
  title: "Festive Season Campaign Checklist: A 4-Week Plan for Shops",
  description:
    "A 4-week festive campaign plan for shops: the creatives to prepare, posting cadence for WhatsApp and Instagram, and a day-by-day final week.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["festive", "Diwali", "campaign", "checklist", "marketing plan", "small business"],
  readingMinutes: 6,
  answer: [
    t("A festive campaign needs four weeks: week 4 out — shoot product photos and lock your offers; week 3 — design all creatives (greeting poster, offer creative, 5-second promo, story set); week 2 — schedule posts and warm up WhatsApp broadcast lists; final week — post daily with 2–3 stories a day and reply to every comment and DM within the hour. Prepare 8–10 creatives total; most shops fail not from bad design but from starting in the festive week itself. Made-for-you festive creatives on "),
    link("Etch", "/create"),
    t(" start at "),
    t("₹15"),
    t(" per image — order at least a week out to leave room for revisions."),
  ],
  sources: [
    { label: "Meta Business — holiday marketing guidance", url: "https://www.facebook.com/business/" },
    { label: "WhatsApp Business — broadcast lists", url: "https://www.whatsapp.com/business/" },
    { label: "Etch pricing — festive creatives from ₹15", url: "https://tryetch.online/pricing" },
  ],
  faqs: [
    {
      q: "How far in advance should a small shop plan its Diwali campaign?",
      a: "Four weeks minimum. That gives you one week to shoot and lock offers, one to design, one to schedule and warm up your audience, and the final week to execute. Two weeks is survivable if you use templates and keep the creative set small. Starting in the festive week itself is the most common reason campaigns underperform — you're designing while competitors are selling.",
    },
    {
      q: "How many creatives does a festive campaign need?",
      a: "Eight to ten for a small shop: one greeting poster, two offer creatives (early-bird + last-chance), one 5-second promo video, three to four story/countdown variants, and one “thank you / extended sale” closer. That covers four weeks without repeating a visual. A 4-pack of AI-generated variants (₹49 on Etch) is an efficient way to get the story set in one order.",
    },
    {
      q: "How often should I post during the festive week?",
      a: "One feed post or status video a day, plus 2–3 stories through the day (morning greeting, afternoon product, evening urgency). WhatsApp status deserves daily updates — it's where your existing customers actually look. Reply to every comment and DM within the hour during the final week; festive buyers decide fast and buy from whoever answers first.",
    },
    {
      q: "Should festive posts show the product or just greetings?",
      a: "Both, in a ratio. Greeting-style posts (festive scene, your logo small, no hard sell) earn the most shares and goodwill — post them on the festival morning and the day before. Offer posts (product in a festive scene, clear deal, clear CTA) earn the sales — post them 3–5 days before the festival and in the final 48 hours. A campaign of only greetings gets love and no sales; only offers gets muted.",
    },
  ],
  related: [
    "festive-creatives-ai-playbook",
    "make-product-ads-with-ai",
    "ai-4-pack-vs-single-orders",
  ],
  body: [
    p(
      t("Most small shops “do Diwali marketing” the same way: a poster made the night before, posted once, then silence. Meanwhile the shop down the road started four weeks out and sold through. The difference isn't budget — it's a plan. This checklist gives you the 4-week timeline, the exact creatives to prepare, and the posting cadence that turns festive attention into festive sales.")
    ),
    h2("The 4-week timeline"),
    table(
      ["Week", "Focus", "Done when"],
      [
        ["4 weeks out", "Offers + assets", "Discounts locked, product photos shot, prices finalized — no offer changes after this week"],
        ["3 weeks out", "Creatives", "All 8–10 creatives designed, reviewed, and exported in every size needed"],
        ["2 weeks out", "Scheduling + warm-up", "Posts scheduled, WhatsApp broadcast lists cleaned, teaser content going out"],
        ["Festive week", "Execute + engage", "Daily posts, 2–3 stories/day, every comment and DM answered within the hour"],
      ]
    ),
    h2("Week 4 out: lock offers, shoot products"),
    p(
      t("Campaigns die from vague offers more than from bad design. “Festive discounts” means nothing; “Flat 25% off all kurtis, 20–25 Oct, free gift wrapping” is a decision a customer can make. This week:"),
    ),
    list(
      [t("Write every offer in one line: what, how much off, which dates, any conditions. If it doesn't fit in one line, it's too complicated.")],
      [t("Shoot clean product photos of everything in the offer — window light, white background, the five standard angles. Festive scenes come later; this week is about having sharp product assets.")],
      [t("Decide the hero product: the one item that leads every creative. Campaigns with a hero outperform catalogs of everything.")],
      [t("Freeze the offers. Changes after this week mean redesigning creatives under pressure — the number one source of festive-week panic.")],
    ),
    h2("Week 3 out: design all 8–10 creatives"),
    p(
      t("Design everything now, while there's time to revise. The full set:"),
    ),
    list(
      [t("Greeting poster (1): festive scene, warm wishes, your logo small. For the festival morning — goodwill and shares.")],
      [t("Offer creatives (2): hero product in a festive scene, the one-line offer, clear CTA. One for early-bird (2 weeks out), one for last-chance (final 48 hours).")],
      [t("5-second promo video (1): hook-offer-CTA structure, vertical 1080×1920. Your highest-energy asset — pinned to your profile for the season.")],
      [t("Story/countdown set (3–4): vertical variants — “7 days to go”, “3 days to go”, “today only”. Same design system, swapped numbers.")],
      [t("Closer (1): “Thank you” or “sale extended 2 days” creative, ready in case stock remains.")],
    ),
    p(
      t("Export every creative in both sizes from day one: 1080×1920 for status/stories, 1080×1080 for feed. Designing the second size in the festive week is how aspect-ratio disasters happen. If you're ordering made-for-you creatives, this is the order week — on "),
      link("Etch's create page", "/create"),
      t(", a festive image is "),
      t("₹15"),
      t(", a 4-pack of variants is "),
      t("₹49"),
      t(", and a 5-second clip is "),
      t("₹19"),
      t(" — order now and you have a full week for a revision round if the first version misses. Check the "),
      link("pricing page", "/pricing"),
      t(" for the full catalog.")
    ),
    callout("tip",
      t("Batch the story set as one order: the same product in four festive scenes (diyas, marigolds, fairy lights, gift boxes) gives you the whole countdown series with one brief. A 4-pack at ₹49 is built exactly for this.")
    ),
    h2("Week 2 out: schedule and warm up"),
    list(
      [t("Schedule the early-bird offer post and the first countdown stories. Scheduling tools (Meta Business Suite is free) mean the festive week runs itself for the planned posts.")],
      [t("Clean your WhatsApp broadcast lists: remove dead numbers, segment regulars from new contacts. Broadcasts only reach people who saved your number — the warm-up week is when you earn the save.")],
      [t("Post teasers: behind-the-scenes packing, “something big coming” stories, polls (“which color should we stock more of?”). Teasers convert followers into an audience that's watching when the offer drops.")],
      [t("Confirm print: if posters or flex banners go up in-store, they should be at the printer this week, not next.")],
    ),
    h2("Festive week: the day-by-day cadence"),
    table(
      ["Day", "Post", "Stories (2–3/day)"],
      [
        ["7 days out", "Early-bird offer creative", "Countdown 7, product close-up"],
        ["5 days out", "Hero product + offer reminder", "Countdown 5, customer review/packing clip"],
        ["3 days out", "Story-set offer push", "Countdown 3, “selling fast” update"],
        ["1 day before", "“Tomorrow” urgency creative", "Store prep, extended-timings notice"],
        ["Festival morning", "Greeting poster — no selling", "Wishes, team photo, festive storefront"],
        ["Festival evening", "Last-chance offer (final hours)", "“Ends tonight” urgency, order packing"],
        ["Day after", "Thank-you + extended sale (if stock remains)", "Gratitude, restock notice"],
      ]
    ),
    callout("warn",
      t("The greeting post on festival morning is sacred — no discount, no CTA, just wishes. Shops that sell on the greeting post get muted; shops that greet warmly get shared. The selling happens the day before and the evening after.")
    ),
    h2("The engagement rule that decides sales"),
    p(
      t("During the final week, reply to every comment and DM within the hour — faster if you can. Festive buyers message three shops and buy from whoever answers first; a reply tomorrow is a sale lost today. Pin your offer post, keep your WhatsApp Business auto-reply updated with timings and the offer line, and have payment links (UPI) ready to send in one tap. Creative gets attention; responsiveness converts it.")
    ),
    h2("After the festival: the 30-minute review"),
    p(
      t("The day after, before you forget: note which creative got the most shares, which post drove the most DMs, what sold out, and what didn't move. Save the creatives in a folder labeled by festival and year. Next Diwali, you start from a working template instead of a blank page — and the shops that improve every festival are the ones that compound. If you ordered creatives on "),
      link("Etch", "/create"),
      t(", your order history is the archive; reorder the winners as a 4-pack ("),
      t("₹49"),
      t(") with next year's dates.")
    ),
    cta(
      "Get your festive creatives from ₹15",
      "Images, 4-packs, posters, and 5-second clips — order 2–3 weeks out and leave room for revisions.",
      "Create festive creatives",
      "/create?service=single-image"
    ),
  ],
};

export default post;
