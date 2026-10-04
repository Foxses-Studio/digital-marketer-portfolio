/**
 * Social platforms the site supports, in display order. Each one can be
 * turned on with a URL in Settings → Social; empty or disabled links are
 * never rendered.
 */
export const SOCIAL_PLATFORMS = [
  { key: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/in/your-name" },
  { key: "facebook", label: "Facebook", placeholder: "https://www.facebook.com/your-page" },
  { key: "instagram", label: "Instagram", placeholder: "https://www.instagram.com/your-handle" },
  { key: "x", label: "X / Twitter", placeholder: "https://x.com/your-handle" },
  { key: "youtube", label: "YouTube", placeholder: "https://www.youtube.com/@your-channel" },
  { key: "behance", label: "Behance", placeholder: "https://www.behance.net/your-name" },
  { key: "dribbble", label: "Dribbble", placeholder: "https://dribbble.com/your-name" },
  { key: "github", label: "GitHub", placeholder: "https://github.com/your-name" },
  { key: "website", label: "Website / Custom link", placeholder: "https://" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["key"];
