import Link from "next/link";
import { Footer, Header, btn, wrap } from "@/components/kit";

// Shared shell for /privacy and /terms. Headings and paragraphs inside get legal-doc spacing.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header>
        <Link href="/studio" className={btn.primary}>Start editing</Link>
      </Header>
      <main
        className={`${wrap} flex-1 pt-12 pb-24 [&_h2]:mt-14 [&_h2]:border-t [&_h2]:border-foreground [&_h2]:pt-6 [&_h2]:text-[clamp(24px,2.6vw,32px)] [&_h2]:font-medium [&_h2]:tracking-[-0.04em] [&_h2]:text-foreground [&_li]:mt-2 [&_p]:mt-4 [&_p]:max-w-3xl [&_p]:leading-relaxed [&_ul]:mt-4 [&_ul]:max-w-3xl [&_ul]:list-disc [&_ul]:pl-5`}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
