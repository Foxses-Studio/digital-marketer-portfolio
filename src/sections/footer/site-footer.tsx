import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { getFooterData } from "@/lib/cms/site";
import { SmartLink } from "@/sections/header/smart-link";
import { BackToTop } from "./back-to-top";

/**
 * Public footer, managed in Navigation → Footer and fed by the shared
 * brand, navigation, social and contact settings. Dark in both themes so
 * it continues the closing call to action.
 */
export async function SiteFooter() {
  const data = await getFooterData();
  const { brand, contact } = data;
  const logo = brand.darkLogo;

  return (
    <footer className="relative overflow-hidden bg-feature text-feature-fg">
      <div className="container-wide">
        <div className="grid gap-12 border-t border-feature-fg/12 pt-14 pb-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:pt-16">
          <div>
            {logo ? (
              <Image src={logo.url} width={logo.width} height={logo.height} alt={brand.name} sizes="180px" className="h-8 w-auto max-w-44 object-contain object-left" />
            ) : (
              <p className="text-h3">{brand.name}</p>
            )}
            {brand.title && <p className="mt-1 text-small text-feature-muted">{brand.title}</p>}
            {data.description && <p className="mt-6 max-w-[26rem] text-body text-feature-muted">{data.description}</p>}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {data.items.length > 0 && (
              <nav aria-label="Footer">
                <p className="text-label text-feature-muted">Pages</p>
                <ul className="mt-4 grid gap-1">
                  {data.items.map((item) => (
                    <li key={item.id}>
                      <SmartLink href={item.url} newTab={item.newTab} className="inline-flex min-h-9 items-center text-body text-feature-fg/85 transition-colors hover:text-accent">
                        {item.label}
                      </SmartLink>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            {data.social.length > 0 && (
              <div>
                <p className="text-label text-feature-muted">Elsewhere</p>
                <ul className="mt-4 grid gap-1">
                  {data.social.map((link) => (
                    <li key={link.platform}>
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="group/social inline-flex min-h-9 items-center gap-1.5 text-body text-feature-fg/85 transition-colors hover:text-accent">
                        {link.label}
                        <ArrowUpRight aria-hidden className="size-3.5 opacity-50 transition-transform duration-300 group-hover/social:translate-x-0.5 group-hover/social:-translate-y-0.5" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {(contact.email || contact.phone || contact.location) && (
              <div className="col-span-2 sm:col-span-1">
                <p className="text-label text-feature-muted">Contact</p>
                <ul className="mt-4 grid gap-1 text-body text-feature-fg/85">
                  {contact.email && (
                    <li>
                      <a href={`mailto:${contact.email}`} className="inline-flex min-h-9 items-center break-all transition-colors hover:text-accent">
                        {contact.email}
                      </a>
                    </li>
                  )}
                  {contact.phone && (
                    <li>
                      <a href={`tel:${contact.phone.replace(/[^\d+]/g, "")}`} className="inline-flex min-h-9 items-center transition-colors hover:text-accent">
                        {contact.phone}
                      </a>
                    </li>
                  )}
                  {contact.location && <li className="flex min-h-9 items-center text-feature-muted">{contact.location}</li>}
                </ul>
              </div>
            )}
          </div>
        </div>

        <p aria-hidden className="footer-wordmark select-none">{brand.name}</p>

        <div className="flex flex-col gap-4 border-t border-feature-fg/12 py-6 text-small text-feature-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{data.copyright}</p>
          <BackToTop />
        </div>
      </div>
    </footer>
  );
}
