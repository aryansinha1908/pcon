import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

export const metadata = { title: "Sign in" };

const errorMessage = (code: string, domain: string): string =>
  ({
    AccessDenied: `Only @${domain} Google accounts can sign in.`,
    OAuthAccountNotLinked: "This email is already linked to another sign-in method.",
    Configuration: "Sign-in isn't configured correctly. Check the AUTH_* environment variables.",
  })[code] ?? "Sign-in failed. Please try again.";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const session = await auth();
  if (session?.user) redirect("/admin");

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
        <Link className="adm-login__back" href="/">
          ← Back to the site
        </Link>
      </div>
    </main>
  );
}
