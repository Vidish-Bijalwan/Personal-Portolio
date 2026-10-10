import type { BlogPost } from "../types";
import { t, link, p, h2, list, table, callout, cta } from "./_helpers";

const post: BlogPost = {
  slug: "festival-marketing-calendar-small-business",
  title: "Festival Marketing Calendar for Indian Small Businesses",
  description:
    "India's festivals are a year-round marketing calendar: a month-by-month map of what to sell and which creatives to make for each buying season.",
  date: "2026-10-10",
  category: "Guides",
  tags: ["festival marketing", "diwali ads", "marketing calendar", "seasonal sales", "small business"],
  readingMinutes: 8,
  answer: [
    t("India's festival calendar is a year-round sales plan: Lohri and Pongal in January, Holi in March, Eid and Baisakhi in spring, Raksha Bandhan and Independence Day in August, Ganesh Chaturthi through Diwali in autumn, and Christmas and New Year in December. For each festival, make three creatives \u2014 a teaser 10 days out, the offer creative on the day, and a last-call reminder \u2014 and start designing a month ahead, because lunar-calendar festivals shift dates every year."),
  ],
  sources: [
    { label: "Wikipedia — Public holidays in India", url: "https://en.wikipedia.org/wiki/Public_holidays_in_India" },
    { label: "Meta — Ad creative best practices", url: "https://www.facebook.com/business/ads/ad-creative" },
    { label: "HubSpot — 120+ call-to-action examples", url: "https://blog.hubspot.com/marketing/call-to-action-examples" },
  ],
  faqs: [
    {
      q: "Which festivals matter most for small-business sales?",
      a: "Diwali season (Dhanteras through Bhai Dooj) is the undisputed peak \u2014 gifting, gold, apparel, home goods, and sweets all surge. After that: Raksha Bandhan for gifting and fashion, Holi for color-adjacent categories, Eid for apparel and food, and the wedding season (November\u2013February) for everything wedding-adjacent. Christmas and New Year matter most in metros and for youth-focused categories. Pick the three that fit your products and go deep on those rather than posting thinly for all of them.",
    },
    {
      q: "How early should I start festival creatives?",
      a: "Start designing a full month before the festival, and start teasing 10 days out. The month-long lead time exists because you will need variants \u2014 feed, stories, reels, WhatsApp broadcast images \u2014 and because printers, delivery partners, and your own stock all get slammed in festival week. Shops that start in festival week end up posting one rushed creative; shops that start a month early run a campaign.",
    },
    {
      q: "Festival dates change every year. How do I plan around that?",
      a: "Festivals on the lunar calendar \u2014 Diwali, Holi, Eid, Raksha Bandhan, Navratri \u2014 shift by days or weeks each year, so never hard-code dates into a reusable template. Build your calendar as festival-plus-offset (\u201Cteaser at T-minus-10 days\u201D) and confirm the exact date about two months out. Fixed-date events like Independence Day, Christmas, and New Year can be templated permanently.",
    },
    {
      q: "What does a full festival creative set cost on Etch?",
      a: "A 4-pack of AI image variants is ₹49 and a single image is ₹15, so one festival's set \u2014 teaser, offer, and reminder \u2014 can cost under Rs 100 in creative production. A poster is ₹29. Everything is pay-per-creation over UPI with no subscription; the pricing page lists the full catalog.",
    },
  ],
  related: [
    "festive-creatives-ai-playbook",
    "make-product-ads-with-ai",
    "ai-content-budget-worksheet-small-business",
  ],
  body: [
    p(
      t("Most small shops market festivals the way students study for exams \u2014 in a panic, the night before. The Diwali post goes up on Diwali morning, the Holi offer appears after the colors are already bought, and the \u201Cseason\u201D is something that happens to other businesses. It does not have to work this way. India's festivals arrive in a predictable rhythm every year, and each one tells you exactly what to sell and what to make. This guide maps the full year, festival by festival, with the specific creative each one needs \u2014 so you plan once and execute on schedule.")
    ),
    h2("The year, festival by festival"),
    p(
      t("Lunar-calendar dates shift yearly \u2014 treat the months below as anchors and confirm exact dates about two months ahead. For each festival: the buying mood, and the creative to make.")
    ),
    table(
      ["Month", "Festivals & occasions", "What to sell", "Creative to make"],
      [
        ["January", "Lohri, Makar Sankranti, Pongal", "Winter wear clearance, sesame/jaggery foods, travel", "Clearance sale creative: old stock out, new year in"],
        ["February", "Valentine's Day", "Gifting, apparel, cafes, jewellery", "Gift-guide carousel: \u201C5 gifts under Rs 999\u201D"],
        ["March", "Holi", "Apparel (white kurtas), colors, sweets, skincare", "Before/after or color-burst creative; \u201CHoli-ready\u201D product shots"],
        ["April", "Eid-al-Fitr (approx), Baisakhi", "Festive apparel, food, gifting", "Eid edit: elegant, minimal creative; Baisakhi harvest tones for Punjab-market shops"],
        ["May\u2013June", "Akshaya Tritiya, summer weddings", "Gold, jewellery, wedding apparel", "Auspicious-day creative: gold and wedding tones, \u201Cbook your wedding order\u201D CTA"],
        ["July", "Monsoon sales season", "Footwear, rain gear, indoor categories", "Monsoon-proof messaging: durability and all-weather angles"],
        ["August", "Raksha Bandhan, Janmashtami, Independence Day", "Gifting, sweets, apparel, tricolor themes", "Rakhi gift combos; Independence Day sale with restrained tricolor design"],
        ["September", "Ganesh Chaturthi, Onam (Kerala)", "Home decor, sweets, festive wear", "Welcome-home creative: decor and modak/sweets angles"],
        ["October", "Navratri, Dussehra", "Festive wear, garba nights, dandiya, jewellery", "Nine-nights series: one creative per Navratri theme or color"],
        ["Oct\u2013Nov", "Dhanteras, Diwali, Bhai Dooj", "Everything: gold, apparel, home, sweets, gifting", "The big campaign: teaser \u2192 dhanteras gold \u2192 Diwali offer \u2192 Bhai Dooj gifting"],
        ["November", "Guru Nanak Jayanti, wedding season begins", "Wedding apparel, catering, decor", "\u201CWedding season is here\u201D booking creative with a calendar CTA"],
        ["December", "Christmas, New Year", "Gifting, party wear, cakes, travel", "Countdown series: \u201C7 days of gifting\u201D or year-end sale creative"],
      ]
    ),
    h2("The three creative beats every festival needs"),
    p(
      t("One post per festival is not a campaign; it is a greeting card. Every festival worth your effort gets three beats. Beat one, the teaser (10 days out): build anticipation without revealing the offer \u2014 \u201CSomething big lands this Diwali. Watch this space.\u201D Teaser creatives are cheap to make and they warm up your audience so the offer does not land cold. Beat two, the offer (2\u20133 days before, through the festival): the full creative with the real number \u2014 price, discount, combo, deadline. This is the one that carries the sale; spend your best design effort here. Beat three, the last call (final day): urgency, honest and specific \u2014 \u201COrders close tonight at 9 pm\u201D, \u201CLast 6 gift hampers.\u201D Never invent scarcity \u2014 a false \u201Conly 2 left\u201D that a customer disproves kills trust for every future festival. Real deadlines convert; fake ones corrode.")
    ),
    h2("Plan one month ahead: the repeatable workflow"),
    p(
      t("Here is the monthly rhythm that makes festival marketing boring in the best way \u2014 predictable, calm, done:")
    ),
    list(
      [t("T-minus 30 days: pick the festival's one hero product and one offer. Write the headline, the price, and the CTA on paper before any design starts.")],
      [t("T-minus 25 days: produce the three creatives \u2014 teaser, offer, last-call \u2014 in all the sizes you need (feed 4:5, stories 9:16). Batching all three at once is twice as fast as three separate sessions.")],
      [t("T-minus 10 days: post the teaser. Start the WhatsApp broadcast list warming with a \u201Cfestival catalog coming\u201D message.")],
      [t("T-minus 3 days: post the offer creative, boost it if you run ads, and pin it. Send the broadcast with the order link or WhatsApp CTA.")],
      [t("Festival day + last call: post the reminder in the morning. Close orders at the promised time \u2014 keeping the deadline trains customers to trust the next one.")],
      [t("T-plus 3 days: save everything \u2014 creatives, captions, numbers \u2014 in a festival folder. Next year you start from a template, not a blank page.")],
    ),
    h2("Dates shift: build in the lunar-calendar buffer"),
    p(
      t("Diwali, Holi, Eid, Raksha Bandhan, and Navratri all move on the lunar calendar \u2014 sometimes by weeks between years. Two practical defenses. First, design templates with the festival name but no date baked into the image; put the date in the caption, which you can edit in seconds. Second, confirm exact dates about two months out and set a phone reminder for T-minus-30 days the moment you do. The shops that miss festivals do not miss them because they forgot Diwali exists \u2014 they miss them because the date moved and nobody updated the plan.")
    ),
    h2("Repurpose: one festival, five pieces of content"),
    p(
      t("Three beats can become five assets with no extra shoot. The offer creative becomes the WhatsApp broadcast image (cropped square), the teaser becomes a 5-second reel opener with trending audio, the product photo becomes a carousel (\u201Cone card per gift combo\u201D), the last-call becomes a stories countdown sticker post, and the whole set becomes next year's template. Festival content has the longest shelf life of anything you will make \u2014 archive it properly and each year's effort compounds.")
    ),
    callout("tip",
      t("Start with ONE festival done properly rather than six done thinly. Pick the festival closest to your best product \u2014 a sweet shop owns Diwali, a kurti seller owns Rakhi and Eid \u2014 run all three beats for it, measure enquiries, and expand next quarter. Depth beats breadth in festival marketing.")
    ),
    cta(
      "Festival coming? Get the three beats made.",
      "Teaser, offer, and last-call creatives \u2014 a 4-pack of AI images is ₹49, a single image ₹15, a poster ₹29. Pay per creation, no subscription.",
      "Create festival creatives",
      "/create"
    ),
    p(
      t("Pair this calendar with the festive creative playbook for design ideas, and check the "),
      link("pricing page", "/pricing"),
      t(" for the full per-creation catalog before your next festival.")
    ),
  ],
};

export default post;
