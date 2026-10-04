/**
 * Development demo content: a fictional performance marketer. Everything
 * here is placeholder data for designing and testing the site. It is not
 * a claim about a real person; replace it in the admin panel before launch.
 *
 * IDs are fixed so re-running the seed recognizes its own records.
 */

export const DEMO_IDENTITY = {
  siteName: "Nadia Karim",
  professionalName: "Nadia Karim",
  professionalTitle: "Performance Marketing Lead",
  siteUrl: "",
  contactEmail: "hello@nadiakarim.example",
  phone: "+44 20 7946 0321",
  showPhone: true,
  location: "London · Working with teams worldwide",
  showLocation: true,
};

export const DEMO_SEO = {
  defaultTitle: "Nadia Karim · Performance Marketing Lead",
  titleTemplate: "%s · Nadia Karim",
  defaultDescription:
    "Performance marketer helping e-commerce and B2B SaaS brands scale paid acquisition profitably across Google, Meta and LinkedIn.",
  defaultOgImageMediaId: null,
};

const off = { enabled: false, url: "", label: "" };
export const DEMO_SOCIAL = {
  linkedin: { enabled: true, url: "https://www.linkedin.com/in/nadiakarim-demo", label: "" },
  facebook: off,
  instagram: off,
  x: { enabled: true, url: "https://x.com/nadiakarim_demo", label: "" },
  youtube: { enabled: true, url: "https://www.youtube.com/@nadiakarim-demo", label: "" },
  behance: off,
  dribbble: off,
  github: off,
  website: { enabled: true, url: "https://newsletter.nadiakarim.example", label: "Newsletter" },
};

/** Same ids as the built-in default menu, so seeding never duplicates them. */
export const DEMO_NAV_ITEMS = [
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0001", label: "Home", url: "/", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0002", label: "About", url: "/about", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0003", label: "Case Studies", url: "/case-studies", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0004", label: "Insights", url: "/blog", enabled: true, newTab: false },
  { id: "7f1b8f5e-0c55-4d55-9d2e-7b0d1b1e0005", label: "Contact", url: "/contact", enabled: true, newTab: false },
];

export const DEMO_HEADER = {
  cta: { enabled: true, label: "Start a project", url: "/contact", newTab: false },
  sticky: true,
  hideOnScroll: false,
};

export const DEMO_HERO = {
  eyebrow: "Performance marketing · Paid media & growth",
  heading: "Paid media built to grow revenue, not vanity metrics.",
  highlight: "grow revenue",
  description:
    "I plan, launch and scale profitable campaigns across Google, Meta and LinkedIn for e-commerce and B2B SaaS brands, and prove every result in the numbers.",
  primaryCta: { enabled: true, label: "Start a project", url: "/contact" },
  secondaryCta: { enabled: true, label: "See the results", url: "/case-studies" },
  imageMediaId: null,
  imageAlt: "",
  availability: { enabled: true, text: "Taking on two new clients for Q1 2027" },
  visualLabel: "Blended performance",
  chart: {
    label: "Attributed revenue",
    startLabel: "Jan",
    endLabel: "Dec",
    points: [142, 151, 148, 176, 189, 204, 231, 226, 268, 297, 334, 392],
  },
  channels: ["Google Ads", "Meta", "LinkedIn", "TikTok"],
  metrics: [
    { id: "3b0c6f8e-5d1a-4a7e-9c2b-1f0a00000001", label: "Blended ROAS", prefix: "", value: "5.2", suffix: "x", enabled: true },
    { id: "3b0c6f8e-5d1a-4a7e-9c2b-1f0a00000002", label: "Revenue attributed", prefix: "$", value: "18.6", suffix: "M", enabled: true },
    { id: "3b0c6f8e-5d1a-4a7e-9c2b-1f0a00000003", label: "Ad spend managed", prefix: "$", value: "3.4", suffix: "M", enabled: true },
    { id: "3b0c6f8e-5d1a-4a7e-9c2b-1f0a00000004", label: "Qualified leads", prefix: "", value: "12400", suffix: "+", enabled: true },
  ],
};
