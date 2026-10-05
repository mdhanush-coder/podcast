import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// JWT sessions, no adapter: the only per-user state is the runs table, keyed by email.
// Env: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: "/login" },
  callbacks: {
    // Used by proxy.ts: signed-out visitors on a protected page go to /login?callbackUrl=…
    authorized: ({ auth }) => !!auth?.user,
  },
});

export async function userEmail() {
  const session = await auth();
  return session?.user?.email ?? null;
}

export const unauthorized = () => Response.json({ error: { message: "Sign in to continue." } }, { status: 401 });
