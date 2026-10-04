"use client";

/** Last-resort error screen (root layout failed). No error details shown. */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem 1.5rem" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Something went wrong</h1>
        <p style={{ marginTop: "0.5rem" }}>Please try again in a moment.</p>
        <button type="button" onClick={reset} style={{ marginTop: "1.5rem", textDecoration: "underline" }}>
          Try again
        </button>
      </body>
    </html>
  );
}
