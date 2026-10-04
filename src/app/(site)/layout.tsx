import { SiteFooter } from "@/sections/footer/site-footer";
import { SiteHeader } from "@/sections/header/site-header";

/** Public website frame. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
