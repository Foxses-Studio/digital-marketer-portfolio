"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { showSuccess } from "@/lib/feedback/alerts";

/**
 * One-time notices after a redirect, e.g. `?notice=setup-complete`. Only
 * these predefined codes are shown, so the URL can't inject text.
 */
const NOTICES: Record<string, { title: string; text: string }> = {
  "setup-complete": {
    title: "Super Admin created",
    text: "Your account is ready and you're signed in.",
  },
};

export function NoticeAlert() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const code = params.get("notice");

  useEffect(() => {
    const notice = code ? NOTICES[code] : undefined;
    if (!code) return;
    router.replace(pathname, { scroll: false });
    if (notice) void showSuccess(notice.title, notice.text);
  }, [code, pathname, router]);

  return null;
}
