import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

/** Only accounts on this domain can sign in. */
const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN ?? "nitjsr.ac.in").toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Database sessions: a role change (e.g. demoting an admin) takes effect on
  // the very next request instead of waiting for a JWT to expire.
  session: { strategy: "database" },
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET,
      // Seeded users already have a User row but no linked Google account yet.
      // Linking by email is safe here: Google verifies the address and we only
      // accept the college domain (checked again in `signIn` below).
      allowDangerousEmailAccountLinking: true,
      // Google's account picker only offers college accounts. This is a UX
      // hint only; the real check is in `signIn` below.
      authorization: { params: { hd: ALLOWED_DOMAIN, prompt: "select_account" } },
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email || profile?.email_verified === false) return false;
      return email.endsWith("@" + ALLOWED_DOMAIN);
    },
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = user.role;
      return session;
    },
  },
});
