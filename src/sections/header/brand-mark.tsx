"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Brand } from "@/lib/cms/site";
import { cn } from "@/lib/utils/cn";

/**
 * CMS logo (with optional dark-mode variant), or a typographic brand from
 * the professional / website name when there's no logo or it fails to load.
 */
export function BrandMark({
  brand,
  showTitle = false,
  onNavigate,
  className,
}: {
  brand: Brand;
  /** Show the professional title beside a text brand (wide screens). */
  showTitle?: boolean;
  onNavigate?: () => void;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const logo = failed ? null : brand.logo;

  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label={`${brand.name}, home`}
      className={cn("group/brand inline-flex min-w-0 items-center rounded-xs", className)}
    >
      {logo ? (
        <>
          <Image
            src={logo.url}
            width={logo.width}
            height={logo.height}
            alt=""
            preload
            sizes="180px"
            onError={() => setFailed(true)}
            className={cn("h-8 w-auto max-w-44 object-contain object-left", brand.darkLogo && "dark:hidden")}
          />
          {brand.darkLogo && (
            <Image
              src={brand.darkLogo.url}
              width={brand.darkLogo.width}
              height={brand.darkLogo.height}
              alt=""
              sizes="180px"
              onError={() => setFailed(true)}
              className="hidden h-8 w-auto max-w-44 object-contain object-left dark:block"
            />
          )}
        </>
      ) : (
        <span className="flex min-w-0 items-baseline gap-3">
          <span className="truncate text-[1.0625rem] leading-none font-semibold tracking-[-0.02em] text-fg">
            {brand.name}
          </span>
          {showTitle && brand.title && (
            <span className="hidden truncate border-l border-line-strong pl-3 text-small leading-none text-fg-muted xl:inline">
              {brand.title}
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
