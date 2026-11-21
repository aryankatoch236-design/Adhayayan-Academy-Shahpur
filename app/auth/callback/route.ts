import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifySignup } from "@/lib/notify";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const c = await createClient();
  let dest = "/account";
  if (c && code) {
    await c.auth.exchangeCodeForSession(code);
    const { data: { user } } = await c.auth.getUser();
    if (user) {
      const { data: isAdmin } = await c.rpc("is_site_admin");
      if (isAdmin) dest = "/admin";
      else if (Date.now() - new Date(user.created_at).getTime() < 120000) {
        try { await notifySignup(user.email || ""); } catch (e) { console.error("Signup email failed", e); }
      }
    }
  }
  return NextResponse.redirect(new URL(dest, url.origin));
}
