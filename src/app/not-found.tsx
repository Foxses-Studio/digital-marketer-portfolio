import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container-page section-space">
      <p className="text-label text-fg-muted">404</p>
      <h1 className="mt-4 text-h2">Page not found</h1>
      <Link href="/" className="mt-6 inline-block text-body text-accent underline underline-offset-4">
        Go to the homepage
      </Link>
    </main>
  );
}
