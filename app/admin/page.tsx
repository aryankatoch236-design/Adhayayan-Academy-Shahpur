import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function Admin() {
  const c = await createClient(); if (!c) notFound();
  const { data: { user } } = await c.auth.getUser(); if (!user) notFound();
  const { data } = await c.rpc("is_site_admin"); if (!data) notFound();
  redirect("/admin/dashboard");
}
