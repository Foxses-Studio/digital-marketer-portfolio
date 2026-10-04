# Architecture

A CMS-driven portfolio for digital marketers. One Next.js App Router project
contains the public site, the admin panel, and all backend logic.

**Core rule: the CMS controls content, the application controls design.**
Text, images, metrics, links, SEO and section visibility/order come from
the database. Layout, typography, color and motion live in code and
cannot be changed from the admin.

---

## Stack

| Concern            | Choice                                   | Notes |
| ------------------ | ---------------------------------------- | ----- |
| Framework          | Next.js 16 (App Router), React 19, TypeScript | `cacheComponents` enabled |
| Styling            | Tailwind CSS v4 + design tokens           | `src/styles/tokens.css` |
| Database           | PostgreSQL + Drizzle ORM                  | Migrations in `drizzle/` |
| Validation         | Zod 4                                     | Shared by forms, actions, settings |
| Auth               | Email + password, scrypt hashes, signed JWT cookie (`jose`) | Single-tenant admin |
| Animation          | GSAP + ScrollTrigger via `@gsap/react`    | Public site only |
| Feedback dialogs   | SweetAlert2 (lazy-loaded)                 | Never `alert()` / `confirm()` |
| Rich text (planned)| Tiptap, stored as ProseMirror JSON        | Added with the blog/case-study step |
| Media (planned)    | Storage driver interface: local disk in dev, S3-compatible in production | Added with the media step |

## Folder structure

```
drizzle/                 Generated SQL migrations (commit these)
scripts/                 One-off CLI scripts (create-admin)
src/
  app/
    layout.tsx           Root: fonts, theme script, global metadata from settings
    (site)/              Public website routes
    admin/               Admin panel routes (built in the admin step)
    api/                 Route Handlers (uploads, webhooks) when needed
  proxy.ts               Optimistic /admin auth redirect (Next 16 "middleware")
  actions/               Server Actions (all mutations). Each one calls requireAdmin()
  admin/                 Admin-only components (forms, tables, media picker...)
  animations/            GSAP registration, motion config, reusable presets
  components/
    ui/                  Small shared primitives (Button, Container...) as they are needed
    theme/               Theme script + provider
  config/                Fonts, route constants — app config, never content
  db/
    index.ts             Drizzle client (server-only)
    schema/              One file per entity, re-exported from schema/index.ts
  hooks/                 Client hooks (useScrollAnimation, ...)
  lib/
    auth/                password, token, session, dal (Data Access Layer)
    cms/                 Cached read functions per entity + cache tags
    feedback/            SweetAlert2 wrappers
    seo/                 Metadata builders
    utils/
  sections/              Public page sections, one folder per section
  styles/                globals, tokens, typography utilities, SweetAlert theme
  types/                 Shared TS types (ActionResult, ...)
  validation/            Zod schemas (per entity, settings groups, SEO fields)
```

## Data flow

```
Admin form (client) ──> Server Action ──> requireAdmin() ──> Zod validate ──> Drizzle write ──> updateTag(tag)
Public page (server) ──> lib/cms/* read ('use cache' + cacheTag) ──> section component ──> HTML
```

- **Reads** for the public site live in `src/lib/cms/*`. Each is a
  `'use cache'` function tagged with a name from `cache-tags.ts`, so public
  pages prerender and stay static until content changes.
- **Writes** are Server Actions in `src/actions/*`. Each one authorizes
  with `requireAdmin()`, validates with Zod, writes, then calls
  `updateTag()` for every affected tag so the admin sees changes
  immediately.
- Actions return `ActionResult` (`src/types/actions.ts`); the admin UI turns
  that into field errors and SweetAlert2 feedback.
- Admin pages read the session, so their session-dependent parts sit
  inside `<Suspense>` (required by Cache Components).
- `next build` prerenders cached CMS reads, so the build needs a reachable
  database.

## Database conventions

- UUID primary keys, `created_at` / `updated_at` with time zone
  (`src/db/schema/columns.ts`).
- Schema grows **only when a feature is built**. Current tables: `users`,
  `settings`.
- Workflow: edit `src/db/schema/*` → `npm run db:generate` →
  review SQL → `npm run db:migrate`.

Planned conventions for content entities (added as each is built):

| Column            | Purpose |
| ----------------- | ------- |
| `status`          | `draft` \| `published` (publish/unpublish without deleting) |
| `published_at`    | Publish date, set on first publish |
| `slug`            | Unique, URL-safe; for projects, case studies, posts, pages |
| `sort_order`      | Manual ordering where order matters (services, skills, testimonials...) |
| `seo`             | `jsonb` validated by `seoFieldsSchema` (`src/validation/seo.ts`) |
| `*_media_id`      | Foreign keys to the shared `media` table |
| `content`         | Rich text as ProseMirror JSON (`jsonb`) |

### Settings

Global settings are one JSON document per group in the `settings` table,
validated by Zod schemas in `src/validation/settings.ts`. Each schema has
defaults, so the site renders before anything is saved. Adding a field is
a schema change, not a migration. Current groups: `site`, `seo`. Expected
later: `contact`, `social`, `navigation`, `footer`.

### Pages and sections (planned with the first homepage section)

Controlled, not a page builder:

- `pages` — fixed system pages (home, about, contact...) with SEO fields.
- `page_sections` — one row per section instance: `page_id`, `type`,
  `enabled`, `sort_order`, `content jsonb`.
- A **section registry** in code maps each `type` to its Zod content
  schema, defaults, admin form and public component. The admin can edit
  content, toggle visibility and reorder where allowed, but can only use
  section types the application defines.
- Sections that list entities (projects, testimonials...) store a heading
  and display options; the items themselves come from their own tables.

## Authentication

- `src/proxy.ts`: optimistic redirect for `/admin/*` based on the signed
  cookie only (no DB).
- `src/lib/auth/dal.ts`: `getCurrentAdmin()` / `requireAdmin()` verify the
  session against the database. **Every admin page, Server Action and
  Route Handler must call one of these**; the proxy is not authorization.
- Sessions: HS256 JWT in the `dm_session` httpOnly cookie, 7-day expiry,
  signed with `SESSION_SECRET`.
- Passwords: scrypt (N=2^17), constant-time compare.
- Create the first admin with `npm run admin:create`.
- Planned with the login UI: login rate limiting.

## Design system

- **Tokens only.** Colors, radii, shadows and easings are defined once in
  `src/styles/tokens.css`. Tailwind's default palette is removed, so
  utilities like `bg-canvas`, `bg-surface`, `bg-elevated`, `text-fg`,
  `text-fg-secondary`, `text-fg-muted`, `border-line`, `bg-accent`,
  `text-accent-2`, `bg-button-primary` are the only colors available.
- **Light and dark** are both declared per token with `light-dark()`. The
  dark palette is designed separately (warm near-black surfaces that get
  lighter as they elevate, re-tuned accents), not inverted.
- **Typography** utilities in `src/styles/typography.css`: `text-display`,
  `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`,
  `text-small`, `text-label`, `text-button`. Sizes are fluid. Do not use
  ad-hoc font sizes in sections.
- **Layout** utilities: `container-page`, `section-space`.
- Fonts: Geist (UI and headings) and Geist Mono (labels, metrics), via
  `next/font` in `src/config/fonts.ts`.
- Restraint: small radii, few gradients, no glassmorphism, no emojis.

## Theme

- Preference (`light` / `dark` / `system`) stored in `localStorage`.
- `ThemeScript` (in `<head>`) sets `data-theme` and `color-scheme` on
  `<html>` before first paint, so there is no flash.
- `ThemeProvider` / `useTheme()` expose `preference`, `resolvedTheme` and
  `setPreference`; they follow OS changes and sync across tabs.
- Shared by the public site and the admin panel.

## Animation

- Import GSAP only from `src/animations/gsap.ts` (plugins registered there).
- Build animations on `useScrollAnimation()` (`src/hooks`): it scopes
  selectors, runs only when `prefers-reduced-motion` allows, and reverts
  every tween and ScrollTrigger on unmount.
- Shared durations, eases and staggers in `src/animations/config.ts`.
- Reusable presets (text reveal, image reveal, counters) are added to
  `src/animations/` the first time a section needs them.
- Animate content that is server-rendered and visible without JS; no
  animations in the admin panel.

## SEO

- Root metadata (title template, default description, OG image,
  `metadataBase`) is generated from the `site` and `seo` settings.
- Entries use `buildEntryMetadata()` with their own `seo` fields, falling
  back to the entry's title/excerpt/cover, then to global defaults.
- Planned: `sitemap.ts`, `robots.ts`, JSON-LD for articles and the person.

## Section workflow

For each section: purpose → content/data requirements → what the admin
edits → schema/CMS changes → desktop design → mobile design → light/dark
→ interactions/GSAP → implement → connect to admin → test responsiveness
and themes → refine until approved.

## Local development

```bash
cp .env.example .env.local      # fill in SESSION_SECRET
docker compose up -d            # or any PostgreSQL 16
npm install
npm run db:migrate
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run admin:create
npm run dev
```

Checks: `npm run typecheck`, `npm run lint`, `npm run build`.
