# Digital Marketer Portfolio

A CMS-driven portfolio and admin panel for digital marketers, built as a
single Next.js application. Marketers manage projects, case studies, blog
posts, services, results, testimonials, media, SEO and site content from
`/admin` without touching code.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the stack, structure,
security model and conventions.

## Getting started

```bash
cp .env.example .env.local      # set MONGODB_URI (MongoDB Atlas or local)
npm install
npm run dev:setup               # create indexes + load demo content
npm run dev
```

Open http://localhost:3000 for the demo portfolio, and
http://localhost:3000/admin/login to create your Super Admin account (shown
once, on a database without accounts).

## Demo content (development seed)

`npm run db:seed` fills the database with a complete fictional portfolio
(a performance marketer, "Nadia Karim") so every section can be designed
and reviewed with realistic content. It writes to the same collections the
admin uses: everything it creates can be edited, hidden, reordered or
deleted in the admin panel. All names, figures and links are placeholders,
not claims about a real person; replace them before launch.

| Command | What it does |
| ------- | ------------ |
| `npm run db:seed` | Adds missing demo content and updates demo content you haven't touched. Safe to run any time. |
| `npm run db:seed -- --dry-run` | Shows what would change, writes nothing. |
| `npm run db:seed:reset` | Restores all demo content to its original version, including items you edited or deleted. |

How it stays safe:

- Every seeded item (a settings group, each menu item, each page section)
  is recorded in the `seedLedger` collection with a fingerprint, so
  re-running never creates duplicates.
- Items you edited in the admin are kept; items you deleted stay deleted
  (unless you use `--reset`).
- Content the seed didn't create is never touched, even with `--reset`.
- It refuses to run with `NODE_ENV=production` (override with
  `--allow-production`).
- A running `npm run dev` is refreshed automatically after seeding. A
  production build (`npm run start`) needs `npm run build` again.

Each new section ships with its own demo content in
`scripts/seed/demo-content.ts` and a module in `scripts/seed/modules/`.

## Scripts

| Script                  | Purpose |
| ----------------------- | ------- |
| `npm run dev`           | Development server |
| `npm run dev:setup`     | `db:setup` + `db:seed` for a fresh local database |
| `npm run build`         | Production build (needs the database) |
| `npm run start`         | Run the production build |
| `npm run typecheck`     | Generate route types and run `tsc` |
| `npm run lint`          | ESLint |
| `npm run db:setup`      | Check the MongoDB connection and create indexes |
| `npm run db:seed`       | Load or update demo content (see above) |
| `npm run db:seed:reset` | Restore demo content to its original version |
| `npm run admin:recover` | Reset an existing admin's password (server access required) |
