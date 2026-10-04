/**
 * Demo content for the homepage sections after the hero. Fictional, like
 * everything in the seed: the brands, numbers and quotes are placeholders
 * for designing the site. Replace them in the admin before launch.
 *
 * Item ids are fixed so re-running the seed recognizes its own content.
 */

const id = (group: number, n: number) =>
  `5e7d2c10-8a4b-4c3e-9f1a-${String(group).padStart(4, "0")}${String(n).padStart(8, "0")}`;

export const DEMO_HERO_EXTRAS = {
  facts: [
    { id: id(1, 1), value: "9 yrs", label: "in paid acquisition" },
    { id: id(1, 2), value: "40+", label: "brands scaled" },
    { id: id(1, 3), value: "$3.4M", label: "annual spend managed" },
  ],
  status: "Scaling · Q4",
};

export const DEMO_BRANDS = {
  label: "Selected clients",
  heading: "Trusted by growth teams at e-commerce and SaaS brands.",
  highlight: "",
  brands: [
    { id: id(2, 1), name: "Halden", style: "sans", logoMediaId: null, url: "", enabled: true },
    { id: id(2, 2), name: "Brightloom", style: "serif", logoMediaId: null, url: "", enabled: true },
    { id: id(2, 3), name: "ORBITPAY", style: "wide", logoMediaId: null, url: "", enabled: true },
    { id: id(2, 4), name: "Marlow & Pine", style: "serif", logoMediaId: null, url: "", enabled: true },
    { id: id(2, 5), name: "tessellate", style: "mono", logoMediaId: null, url: "", enabled: true },
    { id: id(2, 6), name: "Copperleaf", style: "sans", logoMediaId: null, url: "", enabled: true },
    { id: id(2, 7), name: "FERNWAY", style: "wide", logoMediaId: null, url: "", enabled: true },
    { id: id(2, 8), name: "Quillstack", style: "sans", logoMediaId: null, url: "", enabled: true },
  ],
};

export const DEMO_RESULTS = {
  label: "Results",
  heading: "Numbers that moved the business, not just the dashboard.",
  highlight: "moved the business",
  description:
    "Every engagement is measured against revenue, pipeline and margin. These are the aggregate outcomes across the accounts I have led since 2023.",
  metrics: [
    { id: id(3, 1), label: "Revenue attributed", prefix: "$", value: "18.6", suffix: "M", note: "Tracked through each client's own analytics and CRM, not platform-reported conversions.", enabled: true },
    { id: id(3, 2), label: "Average CPA reduction", prefix: "−", value: "38", suffix: "%", note: "Within the first 90 days, by rebuilding account structure and creative testing.", enabled: true },
    { id: id(3, 3), label: "Blended ROAS", prefix: "", value: "5.2", suffix: "x", note: "Across e-commerce accounts, after returns and discounts are taken out.", enabled: true },
    { id: id(3, 4), label: "Qualified pipeline", prefix: "", value: "4.1", suffix: "x", note: "Growth in sales-accepted opportunities for B2B SaaS clients in year one.", enabled: true },
  ],
  chartLabel: "Blended ROAS by quarter",
  chartPoints: [2.1, 2.3, 2.2, 2.8, 3.1, 3.0, 3.6, 4.0, 4.3, 4.8, 5.2],
  footnote: "Aggregated across client accounts, Q1 2023 to Q3 2025. Attribution follows each client's agreed model.",
};

export const DEMO_ABOUT = {
  label: "About",
  statement:
    "I help ambitious brands turn paid media from a cost line into their most reliable growth channel, with strategy, creative and measurement working as one system.",
  highlight: "most reliable growth channel",
  body:
    "Before going independent I led paid acquisition at a venture-backed DTC brand and built the performance practice at a London agency. Today I work with a small number of teams at a time, embedded with their marketing and finance leads, so every pound of spend has a clear job.",
  details: [
    { id: id(4, 1), label: "Based in", value: "London, UK" },
    { id: id(4, 2), label: "Focus", value: "E-commerce & B2B SaaS" },
    { id: id(4, 3), label: "Channels", value: "Google, Meta, LinkedIn, TikTok" },
    { id: id(4, 4), label: "Working style", value: "Embedded, 3–4 clients at a time" },
  ],
  imageMediaId: null,
  imageAlt: "",
  cta: { enabled: true, label: "More about my approach", url: "/about" },
};

export const DEMO_SERVICES_SECTION = {
  label: "Services",
  heading: "Where I can help you grow next.",
  highlight: "grow next",
  description: "Focused engagements, each tied to a commercial goal you can measure.",
  limit: "6",
  cta: { enabled: false, label: "", url: "" },
};

export const DEMO_CASE_STUDIES_SECTION = {
  label: "Selected work",
  heading: "Case studies with the numbers left in.",
  highlight: "numbers left in",
  description: "A closer look at how strategy, creative and measurement came together for three very different brands.",
  limit: "3",
  cta: { enabled: true, label: "View all case studies", url: "/case-studies" },
};

export const DEMO_PROCESS = {
  label: "Process",
  heading: "A clear path from audit to scale.",
  highlight: "audit to scale",
  description: "Every engagement follows the same four stages, so you always know what is happening and why.",
  steps: [
    { id: id(5, 1), title: "Audit", detail: "Weeks 1–2", description: "A full review of accounts, tracking, creative and margins, ending with a prioritised plan and the quick wins worth taking now." },
    { id: id(5, 2), title: "Foundations", detail: "Weeks 2–4", description: "Server-side tracking, clean conversion events and an account structure built for the way your customers actually buy." },
    { id: id(5, 3), title: "Test", detail: "Months 1–3", description: "A disciplined creative and audience testing roadmap, with weekly readouts against the metrics finance cares about." },
    { id: id(5, 4), title: "Scale", detail: "Ongoing", description: "Budget moves to what is proven, new channels open one at a time, and reporting stays tied to revenue and payback." },
  ],
};

export const DEMO_TOOLS_SECTION = {
  label: "Tools & platforms",
  heading: "The stack I work in every day.",
  highlight: "",
  description: "Certified on the major ad platforms and fluent in the analytics and CRM tools that prove the results.",
  limit: "",
  cta: { enabled: false, label: "", url: "" },
};

export const DEMO_EXPERIENCE_SECTION = {
  label: "Experience",
  heading: "Nine years across in-house, agency and independent work.",
  highlight: "in-house, agency and independent",
  description: "",
  limit: "",
  cta: { enabled: true, label: "Full background", url: "/about" },
};

export const DEMO_TESTIMONIALS_SECTION = {
  label: "Testimonials",
  heading: "What it is like to work together.",
  highlight: "",
  description: "",
  limit: "",
  cta: { enabled: false, label: "", url: "" },
};

export const DEMO_CERTIFICATIONS_SECTION = {
  label: "Certifications",
  heading: "Current platform credentials.",
  highlight: "",
  description: "Renewed every year, alongside hands-on work in each platform.",
  limit: "",
  cta: { enabled: false, label: "", url: "" },
};

export const DEMO_BLOG_SECTION = {
  label: "Insights",
  heading: "Notes from the ad accounts.",
  highlight: "ad accounts",
  description: "Practical writing on paid media, measurement and creative testing.",
  limit: "4",
  cta: { enabled: true, label: "All articles", url: "/blog" },
};

export const DEMO_FINAL_CTA = {
  label: "Start a project",
  heading: "Let's make your next quarter your best one.",
  highlight: "best one",
  description:
    "Tell me where growth feels stuck. You will get an honest read on what is possible within a week, whether or not we end up working together.",
  primaryCta: { enabled: true, label: "Start a project", url: "/contact" },
  secondaryCta: { enabled: true, label: "See the case studies", url: "/case-studies" },
  note: "Replies within one business day",
  showEmail: true,
};

export const DEMO_FOOTER = {
  description: "Independent performance marketing lead helping e-commerce and B2B SaaS brands scale paid acquisition profitably.",
  copyright: "© {year} Nadia Karim. All rights reserved.",
  showNavigation: true,
  showSocial: true,
};
