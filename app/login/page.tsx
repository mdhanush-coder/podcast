import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Footer, Header, PageHead, btn, wrap } from "@/components/kit";
import { auth, signIn } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

// Keep only the path of the callback (Auth.js sends an absolute URL), so it can't bounce people to another domain.
function safe(u: unknown) {
  if (typeof u !== "string") return "/studio";
  const url = new URL(u, "http://x");
  return url.pathname + url.search;
}

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { callbackUrl, error } = await searchParams;
  const to = safe(callbackUrl);
  if (await auth()) redirect(to);

  return (
    <>
      <Header />
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(Sign in)", "Google account"]} title="Sign in to start editing.">
          Your edits are saved to your account, so you can come back to them from any device.
        </PageHead>
        {error && (
          <p role="alert" className="mt-8 max-w-xl border border-border bg-destructive-soft/40 p-4 text-destructive">
            Sign-in didn&apos;t complete. Try again, or use a different Google account.
          </p>
        )}
        <form
          className="mt-10"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: to });
          }}
        >
          <button type="submit" className={btn.primary}>Continue with Google</button>
        </form>
        <p className="mt-8 max-w-xl text-sm text-muted-foreground">
          By continuing you agree to the <Link href="/terms" className="underline hover:text-foreground">terms</Link> and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">privacy policy</Link>.
        </p>
      </main>
      <Footer />
    </>
  );
}
