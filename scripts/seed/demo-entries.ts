/**
 * Demo entries for the content collections (services, case studies, blog
 * posts, testimonials, experience, certifications, tools). Fictional
 * placeholders: clients, people, quotes and figures are invented for
 * designing the site and must be replaced before launch. Certifications
 * name real programmes only as examples of the format; they are not claims
 * about a real person and carry no credential links.
 *
 * `_id`s are fixed so re-running the seed recognizes its own entries.
 */
import type { RichTextNode } from "../../src/validation/rich-text";

/** Fixed ObjectId hex: 64d0 + collection code + sequence. */
const oid = (collection: number, n: number) => `64d0${String(collection).padStart(4, "0")}${String(n).padStart(16, "0")}`;
const uid = (group: number, n: number) =>
  `9a3f6b21-4c7d-4e2a-8b5f-${String(group).padStart(4, "0")}${String(n).padStart(8, "0")}`;

// -------------------------------------------------------- rich text helpers
const text = (value: string): RichTextNode => ({ type: "text", text: value });
const p = (value: string): RichTextNode => ({ type: "paragraph", content: [text(value)] });
const h2 = (value: string): RichTextNode => ({ type: "heading", attrs: { level: 2 }, content: [text(value)] });
const ul = (items: string[]): RichTextNode => ({
  type: "bulletList",
  content: items.map((item) => ({ type: "listItem", content: [p(item)] })),
});
const quote = (value: string): RichTextNode => ({ type: "blockquote", content: [p(value)] });
const doc = (...content: RichTextNode[]) => ({ type: "doc" as const, content });

export type DemoEntry = { _id: string; enabled: boolean; sortOrder: number; data: Record<string, unknown> };

const entries = (collection: number, items: Array<Record<string, unknown>>): DemoEntry[] =>
  items.map((data, index) => ({ _id: oid(collection, index + 1), enabled: true, sortOrder: index, data }));

// ----------------------------------------------------------------- services
export const DEMO_SERVICES = entries(1, [
  {
    title: "Paid media strategy",
    summary: "A channel plan built from your margins, not platform best practice.",
    description:
      "We start from unit economics: target CAC, payback and contribution margin. From there I build the channel mix, budget pacing and testing roadmap that gets you there, and the reporting to prove it.",
    metricValue: "90 days",
    metricLabel: "to a profitable plan",
    tags: ["Unit economics", "Channel mix", "Budget pacing"],
  },
  {
    title: "Google Ads & Shopping",
    summary: "Search, Shopping and Performance Max structured for profit.",
    description:
      "Feed optimisation, query mining and campaign structures that separate brand from prospecting, so Performance Max scales what is profitable instead of cannibalising branded demand.",
    metricValue: "−32%",
    metricLabel: "average CPA",
    tags: ["Performance Max", "Merchant Center", "Search"],
  },
  {
    title: "Meta & TikTok acquisition",
    summary: "Creative-led prospecting that keeps finding new customers.",
    description:
      "A structured creative testing system: hooks, formats and offers tested in a set cadence, with winners scaled and fatigue caught early. Built with your creative team or mine.",
    metricValue: "3.8x",
    metricLabel: "first-purchase ROAS",
    tags: ["Creative testing", "Advantage+", "Spark Ads"],
  },
  {
    title: "B2B demand generation",
    summary: "LinkedIn and search programmes measured on pipeline.",
    description:
      "Account-based targeting, offer strategy and CRM integration so paid campaigns are judged on sales-accepted opportunities and revenue, not cost per lead.",
    metricValue: "4.1x",
    metricLabel: "qualified pipeline",
    tags: ["LinkedIn Ads", "ABM", "HubSpot"],
  },
  {
    title: "Measurement & tracking",
    summary: "Server-side tracking and reporting finance will sign off.",
    description:
      "GA4, server-side tagging, Conversions API and offline conversion imports, tied together in a single dashboard with an attribution model your leadership agrees on.",
    metricValue: "+27%",
    metricLabel: "conversions recovered",
    tags: ["GA4", "Server-side GTM", "Looker Studio"],
  },
  {
    title: "Conversion rate optimisation",
    summary: "Landing pages and funnels that make every click worth more.",
    description:
      "Research-led landing page tests and post-click improvements, prioritised by revenue impact, so the same budget produces more customers.",
    metricValue: "+41%",
    metricLabel: "landing page CVR",
    tags: ["A/B testing", "Landing pages", "Funnels"],
  },
  {
    title: "Team training & audits",
    summary: "Hands-on audits and coaching for in-house teams.",
    description:
      "A detailed account audit with a prioritised action list, followed by coaching sessions so your team can run the playbook confidently on its own.",
    metricValue: "",
    metricLabel: "",
    tags: ["Audits", "Workshops"],
  },
]);

// ------------------------------------------------------------- case studies
export const DEMO_CASE_STUDIES = entries(2, [
  {
    title: "Rebuilding paid social to take a DTC skincare brand past £10M",
    slug: "halden-skincare-paid-social",
    client: "Halden",
    industry: "DTC skincare",
    service: "Meta & TikTok acquisition",
    year: "2025",
    challenge: "Rising CPMs and creative fatigue had pushed first-order CPA above target, and growth had stalled at £6M a year.",
    result: "A weekly creative testing system and a rebuilt account structure brought CPA back under target while spend doubled.",
    metrics: [
      { id: uid(1, 1), label: "Annual revenue", prefix: "£", value: "10.4", suffix: "M" },
      { id: uid(1, 2), label: "First-order CPA", prefix: "−", value: "36", suffix: "%" },
      { id: uid(1, 3), label: "Monthly spend", prefix: "", value: "2.1", suffix: "x" },
    ],
    coverMediaId: "media:cover-halden",
    coverStyle: "ember",
    featured: true,
    body: doc(
      h2("The situation"),
      p("Halden had grown quickly on a handful of founder-led videos. When those stopped working, the account kept spending against the same audiences and CPA climbed month after month."),
      h2("What we changed"),
      ul([
        "Consolidated 34 ad sets into four broad prospecting campaigns with clear jobs.",
        "Introduced a weekly testing cadence: five new hooks, two new formats, one new offer.",
        "Moved reporting to first-order contribution margin, agreed with the finance team.",
      ]),
      quote("For the first time, our weekly marketing meeting starts with margin, not ROAS screenshots."),
      h2("The outcome"),
      p("Twelve months later the brand passed £10M in annual revenue, with first-order CPA 36% lower and monthly spend more than double."),
    ),
  },
  {
    title: "Turning LinkedIn into a pipeline engine for a fintech platform",
    slug: "orbitpay-b2b-pipeline",
    client: "Orbitpay",
    industry: "B2B fintech",
    service: "B2B demand generation",
    year: "2024",
    challenge: "Paid campaigns produced plenty of leads but sales rejected most of them, and nobody could connect spend to revenue.",
    result: "An account-based programme tied to the CRM shifted budget to the segments that closed, and pipeline per pound quadrupled.",
    metrics: [
      { id: uid(2, 1), label: "Qualified pipeline", prefix: "", value: "4.1", suffix: "x" },
      { id: uid(2, 2), label: "Cost per opportunity", prefix: "−", value: "52", suffix: "%" },
      { id: uid(2, 3), label: "Sales acceptance", prefix: "", value: "68", suffix: "%" },
    ],
    coverMediaId: "media:cover-orbitpay",
    coverStyle: "slate",
    featured: true,
    body: doc(
      h2("The situation"),
      p("Orbitpay was spending heavily on lead-generation forms. Volume looked healthy, but sales accepted fewer than one lead in five."),
      h2("What we changed"),
      ul([
        "Built target account lists with sales and suppressed everyone else.",
        "Replaced gated e-books with a product-led offer: a live payments audit.",
        "Imported opportunity and revenue data back into LinkedIn and Google for bidding.",
      ]),
      h2("The outcome"),
      p("Within two quarters, qualified pipeline was four times higher on a similar budget, and sales accepted 68% of paid leads."),
    ),
  },
  {
    title: "Scaling Shopping profitably for an outdoor retailer",
    slug: "marlow-pine-google-shopping",
    client: "Marlow & Pine",
    industry: "Outdoor retail",
    service: "Google Ads & Shopping",
    year: "2024",
    challenge: "Performance Max was absorbing branded searches and reporting inflated returns while new customer growth flattened.",
    result: "Separating brand from prospecting and restructuring the feed by margin grew new customer revenue without raising spend.",
    metrics: [
      { id: uid(3, 1), label: "New customer revenue", prefix: "+", value: "58", suffix: "%" },
      { id: uid(3, 2), label: "Blended ROAS", prefix: "", value: "6.3", suffix: "x" },
      { id: uid(3, 3), label: "Added spend", prefix: "", value: "0", suffix: "%" },
    ],
    coverMediaId: "media:cover-marlow",
    coverStyle: "moss",
    featured: true,
    body: doc(
      h2("The situation"),
      p("Reported ROAS looked excellent, but most of it came from customers who were already searching for the brand by name."),
      h2("What we changed"),
      ul([
        "Excluded branded queries from Performance Max and gave brand its own campaign.",
        "Grouped products by margin band so bidding targets reflected real profit.",
        "Rewrote titles and attributes for the 200 products with the most search demand.",
      ]),
      h2("The outcome"),
      p("New customer revenue grew 58% year on year with no increase in spend, and blended ROAS reached 6.3x."),
    ),
  },
  {
    title: "Launching a subscription coffee brand on TikTok",
    slug: "copperleaf-tiktok-launch",
    client: "Copperleaf",
    industry: "Food & drink",
    service: "Meta & TikTok acquisition",
    year: "2023",
    challenge: "A new subscription brand needed to find its first customers profitably with a small launch budget.",
    result: "Creator-led Spark Ads and a first-box offer found a profitable audience within six weeks.",
    metrics: [
      { id: uid(4, 1), label: "Subscribers in 90 days", prefix: "", value: "6200", suffix: "" },
      { id: uid(4, 2), label: "Payback period", prefix: "", value: "2.4", suffix: " mo" },
    ],
    coverMediaId: null,
    coverStyle: "sand",
    featured: false,
    body: doc(p("Copperleaf launched with a modest budget and no existing audience. We tested creator partnerships first, then scaled the formats that converted.")),
  },
]);

// ---------------------------------------------------------------- blog posts
export const DEMO_BLOG_POSTS = entries(3, [
  {
    title: "Performance Max is not a strategy: how to keep it honest",
    slug: "performance-max-keep-it-honest",
    excerpt: "Performance Max can scale profitably, but only when you stop it from claiming credit for demand you already had. Here is the structure I use.",
    category: "Google Ads",
    publishedAt: "2026-09-18",
    coverMediaId: "media:cover-pmax",
    coverStyle: "ink",
    featured: true,
    body: doc(
      p("Performance Max is very good at finding conversions. The problem is that many of those conversions would have happened anyway."),
      h2("Separate brand from prospecting"),
      p("Start by excluding branded queries and giving brand its own Search campaign. Reported ROAS will drop. Real growth usually goes up."),
      h2("Feed the algorithm margin, not revenue"),
      ul(["Group products by margin band.", "Set targets per group.", "Review the search terms insights every week."]),
      p("Do this and Performance Max becomes a reliable prospecting engine rather than a black box that takes credit for your brand."),
    ),
  },
  {
    title: "The weekly creative testing system behind our best Meta accounts",
    slug: "weekly-creative-testing-system",
    excerpt: "Creative is the biggest lever left on Meta. A simple weekly cadence of hooks, formats and offers keeps winners coming and fatigue in check.",
    category: "Paid Social",
    publishedAt: "2026-08-27",
    coverMediaId: "media:cover-creative",
    coverStyle: "ember",
    featured: false,
    body: doc(
      p("Most accounts do not have a targeting problem. They have a creative volume problem."),
      h2("The cadence"),
      ul(["Five new hooks on proven concepts.", "Two new formats.", "One new offer or angle."]),
      p("Run it every week, judge on first-purchase CPA after seven days, and move budget to winners on a fixed day."),
    ),
  },
  {
    title: "Measuring B2B paid media on pipeline, not leads",
    slug: "b2b-paid-media-pipeline",
    excerpt: "Cost per lead rewards the wrong behaviour. Connecting your CRM to the ad platforms changes what the algorithms optimise for.",
    category: "B2B",
    publishedAt: "2026-07-30",
    coverMediaId: "media:cover-pipeline",
    coverStyle: "slate",
    featured: false,
    body: doc(
      p("If your paid campaigns are judged on cost per lead, they will find the cheapest leads available. Those are rarely the ones sales wants."),
      h2("Import what happens next"),
      p("Send opportunity and closed-won events back to LinkedIn and Google so bidding learns from revenue, not form fills."),
    ),
  },
  {
    title: "Server-side tracking in plain English",
    slug: "server-side-tracking-plain-english",
    excerpt: "Browser restrictions hide a growing share of conversions. Here is what server-side tracking does, what it costs and when it is worth it.",
    category: "Measurement",
    publishedAt: "2026-06-12",
    coverMediaId: "media:cover-tracking",
    coverStyle: "moss",
    featured: false,
    body: doc(
      p("Ad blockers, browser privacy features and consent choices all reduce what browser-based tags can see."),
      h2("What changes with server-side"),
      p("Events are sent from your own server to the platforms, with consent respected, so more real conversions are counted and bidding improves."),
    ),
  },
  {
    title: "How to brief a performance creative team",
    slug: "brief-performance-creative-team",
    excerpt: "A good brief starts from the customer problem and the hook, not the format. A one-page template that consistently gets better ads.",
    category: "Creative",
    publishedAt: "2026-05-08",
    coverMediaId: null,
    coverStyle: "sand",
    featured: false,
    body: doc(p("The best performance creative starts with a sharp customer insight and a clear hook. Format comes last.")),
  },
]);

// -------------------------------------------------------------- testimonials
export const DEMO_TESTIMONIALS = entries(4, [
  {
    quote: "Nadia rebuilt our paid social from the ground up. Within two quarters our acquisition costs were down a third and, for the first time, finance trusted the numbers.",
    name: "Eleanor Hughes",
    role: "Chief Marketing Officer",
    company: "Halden",
    avatarMediaId: null,
  },
  {
    quote: "We stopped arguing about lead quality. Every campaign is now judged on pipeline, and the sales team asks for more budget to go to paid, not less.",
    name: "Marcus Adeyemi",
    role: "VP Growth",
    company: "Orbitpay",
    avatarMediaId: null,
  },
  {
    quote: "Clear thinking, fast execution and no jargon. Nadia found growth in an account we thought was already fully optimised.",
    name: "Sofia Lindqvist",
    role: "E-commerce Director",
    company: "Marlow & Pine",
    avatarMediaId: null,
  },
  {
    quote: "The training sessions changed how our in-house team works. We run the testing playbook ourselves now and the results have held.",
    name: "Daniel Okafor",
    role: "Head of Performance",
    company: "Brightloom",
    avatarMediaId: null,
  },
]);

// ---------------------------------------------------------------- experience
export const DEMO_EXPERIENCE = entries(5, [
  {
    role: "Independent Performance Marketing Lead",
    company: "Self-employed",
    period: "2023 – Present",
    location: "London · Remote",
    description: "Embedded with three to four growth teams at a time across e-commerce and B2B SaaS, owning paid acquisition strategy, measurement and creative testing.",
    achievement: "$18.6M in attributed revenue across client accounts since 2023.",
  },
  {
    role: "Head of Paid Acquisition",
    company: "Brightloom",
    period: "2020 – 2023",
    location: "London",
    description: "Built and led a team of five running Google, Meta and TikTok for a venture-backed DTC home brand through two funding rounds.",
    achievement: "Grew paid revenue from £3M to £14M while improving contribution margin.",
  },
  {
    role: "Performance Lead",
    company: "Tessellate Agency",
    period: "2018 – 2020",
    location: "London",
    description: "Set up the agency's performance practice and managed a portfolio of retail and subscription clients.",
    achievement: "Grew the practice from two to eleven retained clients.",
  },
  {
    role: "PPC Specialist",
    company: "Fernway Digital",
    period: "2016 – 2018",
    location: "Manchester",
    description: "Managed search and shopping campaigns for travel and retail brands, from account builds to bid strategy.",
    achievement: "",
  },
]);

// ------------------------------------------------------------ certifications
export const DEMO_CERTIFICATIONS = entries(6, [
  { name: "Google Ads Search Certification", issuer: "Google", year: "2026", credentialUrl: "", logoMediaId: null },
  { name: "Google Ads Shopping Certification", issuer: "Google", year: "2026", credentialUrl: "", logoMediaId: null },
  { name: "Meta Certified Media Buying Professional", issuer: "Meta", year: "2025", credentialUrl: "", logoMediaId: null },
  { name: "LinkedIn Marketing Strategy", issuer: "LinkedIn", year: "2025", credentialUrl: "", logoMediaId: null },
  { name: "Google Analytics Certification", issuer: "Google", year: "2025", credentialUrl: "", logoMediaId: null },
  { name: "HubSpot Inbound Marketing", issuer: "HubSpot Academy", year: "2024", credentialUrl: "", logoMediaId: null },
]);

// --------------------------------------------------------------------- tools
export const DEMO_TOOLS = entries(7, [
  { name: "Google Ads", category: "advertising", note: "Daily" },
  { name: "Meta Ads Manager", category: "advertising", note: "Daily" },
  { name: "TikTok Ads", category: "advertising", note: "" },
  { name: "LinkedIn Campaign Manager", category: "advertising", note: "" },
  { name: "Microsoft Advertising", category: "advertising", note: "" },
  { name: "GA4", category: "analytics", note: "" },
  { name: "Google Tag Manager", category: "analytics", note: "Server-side" },
  { name: "Looker Studio", category: "analytics", note: "" },
  { name: "BigQuery", category: "analytics", note: "" },
  { name: "Triple Whale", category: "analytics", note: "" },
  { name: "Semrush", category: "seo", note: "" },
  { name: "Google Search Console", category: "seo", note: "" },
  { name: "HubSpot", category: "crm", note: "" },
  { name: "Klaviyo", category: "crm", note: "" },
  { name: "Salesforce", category: "crm", note: "" },
  { name: "Figma", category: "content", note: "" },
  { name: "CapCut", category: "content", note: "" },
  { name: "Motion", category: "content", note: "Creative analytics" },
]);
