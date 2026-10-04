import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

/**
 * Typefaces are part of the design system, not CMS content. To change the
 * site's fonts, swap them here; the CSS variables feed the font tokens in
 * src/styles/tokens.css.
 */
export const fontSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Editorial accent: italic serif for emphasized words in display headings. */
export const fontSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
});

export const fontVariables = `${fontSans.variable} ${fontMono.variable} ${fontSerif.variable}`;
