import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { Footer, Header, PageHead, btn, wrap } from "@/components/kit";
import { DEMO_USER, auth, signIn } from "@/lib/auth";

export const metadata: Metadata = { title: "Sign in" };

// Keep only the path of the callback (Auth.js sends an absolute URL), so it can't bounce people to another domain.
function safe(u: unknown) {
  if (typeof u !== "string") return "/studio";
  const url = new URL(u, "http://x");
  return url.pathname + url.search;
}

const inputCls =
  "min-h-11 w-full border border-input bg-card px-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { callbackUrl, error } = await searchParams;
  const to = safe(callbackUrl);
  if (await auth()) redirect(to);

  return (
    <>
      <Header />
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <PageHead labels={["(Sign in)", "Demo account"]} title="Sign in to start editing.">
          Demo login: <span className="font-mono">{DEMO_USER.username}</span> / <span className="font-mono">{DEMO_USER.password}</span>
        </PageHead>
        {error && (
          <p role="alert" className="mt-8 max-w-xl border border-border bg-destructive-soft/40 p-4 text-destructive">
            Wrong username or password. Try again.
          </p>
        )}
        <form
          className="mt-10 flex max-w-sm flex-col gap-4"
          action={async (form: FormData) => {
            "use server";
            try {
              await signIn("credentials", { username: form.get("username"), password: form.get("password"), redirectTo: to });
            } catch (e) {
              // Bad credentials come back as AuthError; the success redirect is a different throw and must pass through.
              if (e instanceof AuthError) redirect(`/login?error=1&callbackUrl=${encodeURIComponent(to)}`);
              throw e;
            }
          }}
        >
          <label className="flex flex-col gap-1.5">
            <span className="label text-muted-foreground">Username</span>
            <input name="username" required autoComplete="username" className={inputCls} />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="label text-muted-foreground">Password</span>
            <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
          </label>
          <button type="submit" className={`${btn.primary} mt-2 self-start`}>Log in</button>
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
