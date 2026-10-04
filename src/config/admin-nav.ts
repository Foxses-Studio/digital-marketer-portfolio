import {
  Award,
  BookOpenText,
  Briefcase,
  FileText,
  FolderKanban,
  History,
  Images,
  Inbox,
  LayoutDashboard,
  Layers,
  MessageSquareQuote,
  PanelTop,
  Search,
  Settings,
  Tags,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/permissions";

/**
 * Admin navigation. Each item declares the permission it needs; the
 * sidebar hides items the current role lacks, and each page enforces the
 * same permission on the server. `planned` modules render a placeholder
 * page until they are built.
 */
export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  /** One line shown on the placeholder page. */
  description: string;
  planned?: boolean;
};

export type AdminNavGroup = { label: string; items: AdminNavItem[] };

export const adminNav: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        href: "/admin/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        permission: "dashboard:view",
        description: "Overview of your website content.",
      },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/pages", label: "Pages", icon: Layers, permission: "content:manage", description: "Edit the content and visibility of page sections." },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban, permission: "content:manage", description: "Showcase campaigns and client work.", planned: true },
      { href: "/admin/case-studies", label: "Case Studies", icon: FileText, permission: "content:manage", description: "Long-form stories with measurable results.", planned: true },
      { href: "/admin/blog", label: "Blog", icon: BookOpenText, permission: "content:manage", description: "Write and publish articles.", planned: true },
      { href: "/admin/categories", label: "Categories", icon: Tags, permission: "content:manage", description: "Organize blog posts and projects.", planned: true },
      { href: "/admin/services", label: "Services", icon: Briefcase, permission: "content:manage", description: "The services you offer.", planned: true },
      { href: "/admin/testimonials", label: "Testimonials", icon: MessageSquareQuote, permission: "content:manage", description: "Quotes from clients and colleagues.", planned: true },
      { href: "/admin/experience", label: "Experience", icon: History, permission: "content:manage", description: "Roles and career history.", planned: true },
      { href: "/admin/skills", label: "Skills", icon: Wrench, permission: "content:manage", description: "Skills and marketing tools.", planned: true },
      { href: "/admin/certifications", label: "Certifications", icon: Award, permission: "content:manage", description: "Certificates and credentials.", planned: true },
    ],
  },
  {
    label: "Library",
    items: [
      { href: "/admin/media", label: "Media", icon: Images, permission: "media:manage", description: "Images used across the website." },
      { href: "/admin/messages", label: "Messages", icon: Inbox, permission: "messages:manage", description: "Enquiries from the contact form.", planned: true },
    ],
  },
  {
    label: "Configuration",
    items: [
      { href: "/admin/navigation", label: "Navigation", icon: PanelTop, permission: "settings:manage", description: "Header menu, call to action and header behavior." },
      { href: "/admin/seo", label: "SEO", icon: Search, permission: "seo:manage", description: "Search settings for individual pages, projects and posts.", planned: true },
      { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings:manage", description: "Website details, branding and defaults." },
      { href: "/admin/settings/admins", label: "Administrators", icon: Users, permission: "admins:manage", description: "Manage who can access the admin panel." },
    ],
  },
];

/** Planned module slug → nav item, for the placeholder route. */
export const plannedModules = new Map(
  adminNav
    .flatMap((group) => group.items)
    .filter((item) => item.planned)
    .map((item) => [item.href.replace("/admin/", ""), item]),
);
