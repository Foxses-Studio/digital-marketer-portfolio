# Digital Marketer Portfolio

A CMS-driven portfolio and admin panel for digital marketers, built as a
single Next.js application. Marketers manage projects, case studies, blog
posts, services, results, testimonials, media, SEO and site content from
`/admin` without touching code.

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the stack, folder
structure, data flow and conventions.

## Getting started

```bash
cp .env.example .env.local      # set SESSION_SECRET (openssl rand -base64 48)
docker compose up -d            # local PostgreSQL
npm install
npm run db:migrate
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='a-long-password' npm run admin:create
npm run dev
```

## Scripts

| Script                 | Purpose |
| ---------------------- | ------- |
| `npm run dev`          | Development server |
| `npm run build`        | Production build (needs the database) |
| `npm run typecheck`    | Generate route types and run `tsc` |
| `npm run lint`         | ESLint |
| `npm run db:generate`  | Generate a migration from schema changes |
| `npm run db:migrate`   | Apply migrations |
| `npm run db:studio`    | Browse the database |
| `npm run admin:create` | Create or reset an admin account |
