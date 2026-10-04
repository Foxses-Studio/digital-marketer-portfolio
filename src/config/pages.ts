/**
 * The site's fixed system pages and the sections each one is built from,
 * in default order. Section types must exist in the section registry.
 * Admins edit the content of these sections, toggle and reorder them; they
 * can't add pages or section types that aren't defined here.
 */
export const PAGE_DEFINITIONS = {
  home: {
    title: "Home",
    path: "/",
    sections: [
      "hero",
      "brands",
      "results",
      "about",
      "services",
      "caseStudies",
      "process",
      "tools",
      "experience",
      "testimonials",
      "certifications",
      "blog",
      "finalCta",
    ] as string[],
  },
  about: { title: "About", path: "/about", sections: [] as string[] },
  caseStudies: { title: "Case Studies", path: "/case-studies", sections: [] as string[] },
  blog: { title: "Blog", path: "/blog", sections: [] as string[] },
  contact: { title: "Contact", path: "/contact", sections: [] as string[] },
} as const;

export type PageKey = keyof typeof PAGE_DEFINITIONS;

export function isPageKey(value: string): value is PageKey {
  return Object.hasOwn(PAGE_DEFINITIONS, value);
}
