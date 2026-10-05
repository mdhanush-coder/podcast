"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";
import { Footer, Header, Label, PageHead, btn, wrap } from "@/components/kit";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  // ponytail: console only; wire Sentry (or similar) here when you have one.
  useEffect(() => console.error(error), [error]);

  return (
    <>
      <Header />
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(Error)", "Something broke"]} title="That didn't load.">
          Something went wrong on our side. Your uploads and edits are safe. Try again, and if it keeps happening, contact us.
        </PageHead>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={retry} className={btn.primary}><RotateCcw size={14} /> Try again</button>
          <Link href="/contact" className={btn.ghost}>Contact us</Link>
        </div>
        {error.digest && <Label className="mt-10">Reference: {error.digest}</Label>}
      </main>
      <Footer />
    </>
  );
}
