import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { signIn } from "@/auth";
import { getCurrentUser } from "@/lib/auth-guards";

export const metadata = { title: "Sign in" };

const errorMessage = (code: string, domain: string): string =>
  ({
    AccessDenied: `Only @${domain} Google accounts can sign in.`,
    OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
    // Auth.js reports every server-side failure as "Configuration", including the
    // database being down or missing tables, so don't point only at AUTH_* here.
    Configuration:
      "Sign-in failed on the server. If you run this site, check the server logs (the terminal running the app): usually the PostgreSQL database isn't reachable or its tables are missing, or the Google OAuth credentials / an AUTH_* variable are wrong.",
  })[code] ?? "Sign-in failed. Please try again.";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect("/admin");

  const { error } = await searchParams;
  const domain = process.env.ALLOWED_EMAIL_DOMAIN ?? "nitjsr.ac.in";

  return (
    <main className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__brand">
          <Image src="/pcon-logo.png" alt="" width={74} height={44} priority />
          <div>
            <strong>PCON</strong>
            <span>Admin panel</span>
          </div>
        </div>
        <h1>Sign in</h1>
        <p className="adm-muted">Use your @{domain} Google account.</p>
        {error && (
          <p className="adm-notice adm-notice--error" role="alert">
            {errorMessage(error, domain)}
          </p>
        )}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
        >
          <button className="adm-btn adm-btn--primary adm-btn--block" type="submit">
            Continue with Google
          </button>
        </form>

        {process.env.NODE_ENV === "development" && (
          <form
            action={async () => {
              "use server";
              const cookieStore = await cookies();
              cookieStore.set("pcon_dev_admin_session", "yashpandey040709@gmail.com", {
                httpOnly: true,
                path: "/",
                maxAge: 60 * 60 * 24 * 7,
              });
              redirect("/admin/blogs");
            }}
          >
            <button className="adm-btn adm-btn--ghost adm-btn--block adm-login__dev" type="submit">
              <span>Dev admin sign-in</span>
              <small>yashpandey040709@gmail.com</small>
            </button>
          </form>
        )}

        <Link className="adm-login__back" href="/">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}