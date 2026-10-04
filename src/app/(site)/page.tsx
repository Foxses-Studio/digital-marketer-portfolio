import { getPublicPage } from "@/lib/cms/pages";
import { getSettings } from "@/lib/cms/settings";
import { RenderSections } from "@/sections/render-sections";

/** Home page: CMS-managed sections in their saved order. */
export default async function HomePage() {
  const [page, site] = await Promise.all([getPublicPage("home"), getSettings("site")]);
  const hasHero = page.sections.some((section) => section.type === "hero");
  return (
    <>
      {/* The hero provides the page's H1; keep one when it's turned off. */}
      {!hasHero && <h1 className="sr-only">{site.professionalName || site.siteName}</h1>}
      <RenderSections sections={page.sections} />
    </>
  );
}
