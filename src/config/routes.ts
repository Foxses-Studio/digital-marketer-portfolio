/** Route constants shared by the proxy, auth helpers and navigation. */
export const routes = {
  home: "/",
  admin: {
    root: "/admin",
    login: "/admin/login",
    dashboard: "/admin/dashboard",
  },
} as const;
