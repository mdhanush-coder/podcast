import Link from "next/link";
import { Footer, Header, PageHead, btn, wrap } from "@/components/kit";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(404)", "Page not found"]} title="Nothing here.">
          The link may be old or mistyped. If you were looking for an edit, it&apos;s in your list of edits.
        </PageHead>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/edits" className={btn.primary}>My edits</Link>
          <Link href="/" className={btn.ghost}>Home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
