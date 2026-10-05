import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

// ponytail: demo login with one hardcoded user; swap back to Google (next-auth/providers/google) for real accounts.
export const DEMO_USER = { username: "demo", password: "deepsoch123", email: "demo@deepsoch.ai", name: "Demo User" };

// JWT sessions, no adapter: the only per-user state is the runs table, keyed by email.
// Env: AUTH_SECRET.
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { username: {}, password: {} },
      authorize: ({ username, password }) =>
        username === DEMO_USER.username && password === DEMO_USER.password ? { id: "demo", email: DEMO_USER.email, name: DEMO_USER.name } : null,
    }),
  ],
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
