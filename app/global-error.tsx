"use client";

import "./globals.css";

// Replaces the root layout when it crashes, so it carries its own html/body and no shared components.
export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col justify-center bg-background px-6 text-text-body antialiased">
        <title>Something went wrong · deepsoch podcast</title>
        <div className="mx-auto w-full max-w-[1280px]">
          <p className="label text-muted-foreground">(Error)</p>
          <h1 className="mt-6 text-[clamp(44px,7.2vw,92px)] text-foreground">The site hit a problem.</h1>
          <p className="mt-6 max-w-xl text-lg">Your uploads and edits are safe. Reload to try again.</p>
          <button
            type="button"
            onClick={retry}
            className="mt-8 inline-flex min-h-11 items-center rounded-full bg-foreground px-5 font-mono text-[12px] uppercase tracking-[0.04em] text-background"
          >
            Try again
          </button>
          {error.digest && <p className="label mt-8 text-muted-foreground">Reference: {error.digest}</p>}
        </div>
      </body>
    </html>
  );
}
