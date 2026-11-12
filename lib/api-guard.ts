import { getCurrentUser } from "@/lib/auth-guards";
import { hasRole } from "@/lib/roles";
import { NextResponse } from "next/server";

export async function requireAdminApi() {
  const user = await getCurrentUser();
  if (!user?.id) {
    return {
      error: NextResponse.json({ error: "Authentication required." }, { status: 401 }),
      user: null,
    };
  }

  const role = user.role;
  if (!hasRole(role, "ADMIN")) {
    return {
      error: NextResponse.json({ error: "Administrator privileges required." }, { status: 403 }),
      user: null,
    };
  }

  return { error: null, user };
}

