# Architecture

A CMS-driven portfolio for digital marketers. One Next.js App Router project
contains the public site, the admin panel and all backend logic.

**Core rule: the CMS controls content, the application controls design.**
Text, images, metrics, links, SEO and section visibility/order come from
the database. Layout, typography, color and motion live in code and
cannot be changed from the admin.

---

## Stack

| Concern          | Choice | Notes |
| ---------------- | ------ | ----- |
| Framework        | Next.js 16 (App Router), React 19, TypeScript | `cacheComponents` enabled |
| Styling          | Tailwind CSS v4 + design tokens | `src/styles/tokens.css` |
| Database         | MongoDB (Atlas) + official `mongodb` driver | Typed collections, `src/db/schema` |
| Validation       | Zod 4 | Same schemas on client (UX) and server (enforcement) |
| Auth             | Email + password, scrypt hashes, database sessions | No public registration |
| Authorization    | Role → permission map | `src/lib/permissions` |
| Rich text        | Tiptap 3, stored as ProseMirror JSON | Safe React renderer, no HTML strings |
| Media            | One upload pipeline + storage driver interface | Local disk driver implemented |
| Feedback         | SweetAlert2 (lazy-loaded) | `src/lib/feedback/alerts.ts` |
| Icons            | lucide-react | |
| Animation        | GSAP + ScrollTrigger | Public site only |

## Folder structure

```
scripts/                   CLI: db-setup, admin-recover
src/
  app/
    layout.tsx             Root: fonts, theme script, metadata from settings
    (site)/                Public website: layout (header) + pages
    admin/
      login/               Sign-in, or first-install "Create Super Admin"
      (panel)/             Authenticated shell (sidebar, topbar)
        dashboard/
        media/
        navigation/        Header menu, CTA and header behavior
        settings/          General · [tab]: branding, social, seo
        settings/admins/   Super Admin only
        forbidden/         Access denied page
        [module]/          Placeholder for modules not built yet
    api/admin/media/       Upload (POST) / list (GET)
    media/[...key]/        Serves files from the local storage driver
  proxy.ts                 Optimistic /admin and /api/admin cookie gate
  actions/                 Server Actions: auth, admins, media, pages, settings
  components/
    admin/                 Shell, nav, cards, empty states, admins, media
    auth/                  Login and setup forms
    editor/                Rich text editor + safe renderer
    theme/                 Theme script, provider, toggle
    ui/                    Button, fields
  config/                  Routes, admin nav, page definitions, fonts
  db/                      Mongo client, index setup, schema (types + indexes)
  hooks/                   useActionForm, useScrollAnimation, ...
  sections/header/         Public header (server data + client behavior)
  lib/
    actions.ts             runAction(): consistent Server Action errors
    api.ts                 apiError(): consistent Route Handler errors
    errors.ts              AppError types
    admins/                First-install bootstrap + admin management
    auth/                  password, session, dal (Data Access Layer)
    cms/                   Settings, pages, section registry, cache tags
    media/                 Upload service, type sniffing, storage drivers
    permissions/           Roles and permissions
    security/url.ts        URL allow-listing for links and images
    rate-limit.ts          MongoDB-backed rate limiting
  styles/                  Tokens, typography, rich text, SweetAlert theme
  types/                   ActionResult
  validation/              Zod schemas
```

## Data flow

```
Admin form ──> Zod (client) ──> Server Action ──> authorize(permission)
          ──> Zod (server) ──> service (src/lib/*) ──> MongoDB ──> updateTag()
Public page ──> lib/cms read ('use cache' + cacheTag) ──> section component
```

- Every Server Action is wrapped in `runAction()`: redirects pass through,
  expected errors (`ValidationError`, `AuthenticationError`,
  `AuthorizationError`, `NotFoundError`, `ConflictError`,
  `RateLimitError`) become `{ ok: false, error, fieldErrors? }`, and
  anything unexpected is logged on the server and returned as a generic
  message. Stack traces and database details never reach the browser.
- Route Handlers use `apiError()` for the same behavior as JSON.
- Forms use `useActionForm()`: the same Zod schema validates on the client
  for instant feedback and again on the server; failures show inline
  field errors or a SweetAlert2 dialog.
- Public reads are cached with `'use cache'` + tags from
  `src/lib/cms/cache-tags.ts`; mutations call `updateTag()`.

## Database

Collections (`src/db/schema/`): `users`, `sessions`, `rateLimits`,
`settings`, `media`, `pages`. Each file declares the document type and
its indexes; `src/db/schema/index.ts` registers them. Indexes are created
automatically on the first connection of each server process (and by
`npm run db:setup`).

Conventions: ObjectId `_id` (string only for natural keys), ids leave the
data layer as hex strings, every document has `createdAt`/`updatedAt`,
every write is validated with Zod first. New collections are added only
when their feature is built.

### User

| Field | Notes |
| ----- | ----- |
| `name`, `email` | email lowercased, unique index |
| `passwordHash` | `scrypt$N$r$p$salt$hash`, never plain text |
| `role` | `SUPER_ADMIN` \| `ADMIN` (extensible) |
| `status` | `ACTIVE` \| `INACTIVE` |
| `avatarMediaId` | reference to `media` (UI later) |
| `bootstrap` | only on the first Super Admin; unique sparse index |
| `createdBy`, `lastLoginAt`, `createdAt`, `updatedAt` | |

## Authentication

- **Sessions** are stored in MongoDB. The browser gets a random 32-byte
  token in an httpOnly, SameSite=Lax cookie (`__Host-dm_session`, Secure,
  in production); the database stores only its SHA-256 hash. Sessions last
  7 days. Sign-out deletes the session; deactivating an account deletes all
  of its sessions.
- **Every request re-checks** the session and that the account is
  `ACTIVE`, and reads the role from the database (`getCurrentAdmin()`).
- **Proxy** (`src/proxy.ts`) only redirects requests without a session
  cookie. It is not authorization.
- **Pages** call `requireAdmin()` / `requirePagePermission()`;
  **actions and routes** call `authorize(permission)`.
- **Login** gives the same message for unknown emails and wrong passwords,
  with equalized timing. "Deactivated" is only revealed after a correct
  password. Rate limit: 5 failures per email+IP and 30 per IP per
  15 minutes.
- **CSRF**: Server Actions only accept same-origin requests (Next.js
  Origin check); cookies are SameSite=Lax.

### First Super Admin (first install)

There is no registration page. `/admin/login` checks the database on every
request:

- **Zero accounts** → "Create Super Admin" form (name, email, password,
  confirm). No role field.
- **Any account** → sign-in form only.

`setupSuperAdmin` (server) re-checks that no account exists, hashes the
password, checks again, then inserts the user with role `SUPER_ADMIN` and
the `bootstrap` marker. The unique index on `bootstrap` makes the insert
atomic: if simultaneous requests pass the checks, only one insert can
succeed and the rest are rejected. Once an account exists the action
always rejects. The new owner is signed in and redirected to the dashboard.

### Roles and permissions

`src/lib/permissions/index.ts`:

| Permission | SUPER_ADMIN | ADMIN |
| ---------- | :---------: | :---: |
| dashboard:view, content:manage, media:manage, messages:manage, seo:manage, settings:manage | yes | yes |
| admins:manage | yes | no |

Admin management rules (enforced in `src/lib/admins/service.ts`): nobody
can grant a role above their own, change their own role or status, or
demote/deactivate the last active Super Admin. To add a role, add it to
`ROLES`, `ROLE_LABELS` and `ROLE_PERMISSIONS`.

## Settings and navigation

All global content lives in the `settings` collection, one document per
group, validated by `src/validation/settings.ts` (every field has a
default, so new fields need no migration):

| Group | Admin page | Contents |
| ----- | ---------- | -------- |
| `site` | Settings → General | Website name, professional name/title, site URL, contact email, phone + show, location + show |
| `branding` | Settings → Branding | Logo, dark-mode logo, favicon (media ids) |
| `social` | Settings → Social | LinkedIn, Facebook, Instagram, X, YouTube, Behance, Dribbble, GitHub, custom link: each `{ enabled, url, label }` |
| `seo` | Settings → SEO | Default title, title format (`%s`), description, share image |
| `navigation` | Navigation | Menu `items[]` (`id, label, url, enabled, newTab`, array order = display order, max 8), `cta`, `sticky`, `hideOnScroll` |

- Settings forms are parsed by `src/validation/settings-forms.ts` on both
  the client and in `saveSettingsForm` (one action, group bound on the
  client and re-checked on the server).
- Menu items have their own actions (`src/actions/navigation.ts`):
  create, update, show/hide, delete, reorder.
- Images are chosen with the reusable `MediaField` (media library picker +
  in-place upload); saving rejects ids that no longer exist.

### Header data flow

```
Admin saves (Server Action) → settings collection → updateTag("settings:<group>")
→ getHeaderData() / getBrand() ('use cache', src/lib/cms/site.ts) re-run on next request
→ SiteHeader (server) → HeaderClient (client: scroll state, active link, mobile menu)
```

The public header ships only behavior to the browser; all content is
fetched on the server and cached. Deleting a media file refreshes the
`media` tag, so a removed logo falls back to the text brand.

Header behavior: fixed at the top (or scrolls away when sticky is off),
compacts with a hairline after 12px of scroll, optionally hides on scroll
down and returns on scroll up (GSAP; never while focus is inside it),
CSS entrance on first paint, accent underline for the active item,
full-screen `<dialog>` mobile menu with a GSAP reveal and link stagger,
reversed on close. Reduced motion disables the animations.

## CMS: pages and sections

Controlled sections, not a page builder.

- `src/config/pages.ts` lists the fixed pages and which section types
  each uses, in default order.
- `src/lib/cms/sections/registry.ts` maps each section `type` to a
  definition (`defineSection`): label, Zod `content` schema (all fields
  have defaults) and `config` schema. The public component lives in
  `src/sections/<type>/`.
- A `pages` document stores `sections: [{ id, type, enabled, content,
  config }]`; array order is display order.
- `getPublicPage(key)` (cached) returns enabled sections with validated
  content; invalid stored data falls back to defaults.
- `getPageForAdmin(key)` creates the page and adds newly shipped
  sections automatically.
- Actions: `updateSection`, `setSectionEnabled`, `reorderSections`
  (permission `content:manage`).
- Shared field schemas: `src/validation/cms.ts` (`ctaSchema`,
  `linkUrlSchema`, `mediaIdSchema`).

No section types are registered yet; the Hero will be the first.

## Rich text

- Editor: `RichTextEditor` from `@/components/editor` (lazy-loaded, never
  in the public bundle). H1–H3, paragraph, bold, italic, underline, links,
  bulleted/numbered lists, blockquote, images, undo/redo. Images come from
  `onRequestImage` (URL prompt now; the media picker plugs in later).
- Storage: ProseMirror JSON, validated by `richTextSchema`
  (`src/validation/rich-text.ts`), an allow-list of nodes, marks and
  safe URLs (`javascript:`, `data:` and similar are rejected).
- Rendering: `RichTextRenderer` (`src/components/editor/rich-text-renderer.tsx`)
  turns JSON into React elements, re-checks every URL and ignores unknown
  nodes. No `dangerouslySetInnerHTML`. Works in Server Components.
- Styles: `.rich-text` in `src/styles/typography.css`, shared by editor and
  site.

## Media

- One pipeline: `uploadMedia()` in `src/lib/media/service.ts`, exposed at
  `POST /api/admin/media` (permission `media:manage`).
- Checks: size limit (`MEDIA_MAX_UPLOAD_MB`), real type from file bytes
  (JPG, PNG, WebP, AVIF, GIF; SVG refused), dimensions read, random file
  names.
- Storage: `StorageDriver` interface (`src/lib/media/storage/`). The local
  driver writes to `MEDIA_LOCAL_DIR` (outside `/public`) and serves files
  from `/media/...` with `nosniff` and a sandbox CSP. Cloud drivers (S3,
  R2, Cloudinary, Vercel Blob) are added as new driver files selected by
  `MEDIA_STORAGE_DRIVER`, with credentials from env vars.
- Features store the `media` document id and resolve it when rendering.

## Design system and theme

- Tokens only (`src/styles/tokens.css`), each declared with `light-dark()`;
  Tailwind's default palette is removed. Dark mode is its own palette.
- Typography utilities: `text-display`, `text-h1`–`text-h3`,
  `text-body-lg`, `text-body`, `text-small`, `text-label`, `text-button`,
  and `text-title` for admin page titles.
- Theme: light / dark / system, stored in `localStorage`, applied by an
  inline head script before paint (no flash), shared by site and admin.

## Security checklist

- Passwords: scrypt (N=2^17), 12+ chars with a letter and a number.
- Sessions: random tokens, hashed at rest, httpOnly/SameSite cookies,
  server-side revocation.
- Authorization on the server for every page, action and route; roles
  from the database only.
- Input: Zod on every action and route; rich text and URLs allow-listed.
- Uploads: byte sniffing, size limits, no SVG, files served with
  `nosniff` and a sandbox CSP.
- Headers: nosniff, Referrer-Policy, frame protection (DENY in admin),
  Permissions-Policy, HSTS in production, `noindex` on admin.
- Secrets only in server env vars; nothing sensitive uses `NEXT_PUBLIC_`.
- Not yet: Content Security Policy (needs nonces for the theme script).

## Local development

```bash
cp .env.example .env.local      # set MONGODB_URI
npm install
npm run db:setup                # optional: checks connection, creates indexes
npm run dev                     # open /admin/login to create the Super Admin
```

On Atlas, allow your IP under **Network Access**.

Checks: `npm run typecheck`, `npm run lint`, `npm run build` (the build
reads settings from the database, so it needs a connection).
