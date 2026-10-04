/** Route constants shared by the proxy, auth helpers and navigation. */
export const routes = {
  home: "/",
  admin: {
    root: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
    forbidden: "/admin/forbidden",
    admins: "/admin/settings/admins",
    media: "/admin/media",
    navigation: "/admin/navigation",
    pages: "/admin/pages",
    settings: "/admin/settings",
  },
} as const;
