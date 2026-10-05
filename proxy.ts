// Signed-out visitors on these pages are sent to /login and back afterwards. API routes check auth themselves.
export { auth as proxy } from "@/lib/auth";

export const config = {
  matcher: ["/studio/:path*", "/runs/:path*", "/edits/:path*", "/account/:path*"],
};
