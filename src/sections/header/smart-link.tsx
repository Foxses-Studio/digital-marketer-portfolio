import Link from "next/link";
import type { ReactNode } from "react";
import { externalProps, isInternalPath } from "./links";

/**
 * Internal paths use next/link (prefetch, client navigation); anchors,
 * external, mailto and tel links render a plain <a>. New-tab links are
 * announced to screen readers.
 */
export function SmartLink({
  href,
  newTab,
  className,
  children,
  current,
  onClick,
}: {
  href: string;
  newTab: boolean;
  className?: string;
  children: ReactNode;
  current?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      {children}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </>
  );
  const common = {
    className,
    onClick,
    "aria-current": current ? ("page" as const) : undefined,
    ...externalProps(newTab),
  };
  return isInternalPath(href) && !newTab ? (
    <Link href={href} {...common}>
      {content}
    </Link>
  ) : (
    <a href={href} {...common}>
      {content}
    </a>
  );
}
