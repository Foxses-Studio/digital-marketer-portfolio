import type { Metadata } from "next";
import { ThemeProvider, ThemeScript } from "@/components/theme";
import { fontVariables } from "@/config/fonts";
import { getSettings } from "@/lib/cms/settings";
import { getMetadataAssets } from "@/lib/cms/site";
import { buildRootMetadata } from "@/lib/seo/metadata";
import "@/styles/globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [site, seo, assets] = await Promise.all([
    getSettings("site"),
    getSettings("seo"),
    getMetadataAssets(),
  ]);
  return buildRootMetadata(site, seo, assets);
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={fontVariables} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
