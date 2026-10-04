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
npm run db:setup                # optional: checks the connection, creates indexes
npm run dev
```

Open http://localhost:3000/admin/login. On a fresh database it asks you to
create the Super Admin account; after that it only shows the sign-in form.

## Scripts

| Script                  | Purpose |
| ----------------------- | ------- |
| `npm run dev`           | Development server |
| `npm run build`         | Production build (needs the database) |
| `npm run start`         | Run the production build |
| `npm run typecheck`     | Generate route types and run `tsc` |
| `npm run lint`          | ESLint |
| `npm run db:setup`      | Check the MongoDB connection and create indexes |
| `npm run admin:recover` | Reset an existing admin's password (server access required) |
