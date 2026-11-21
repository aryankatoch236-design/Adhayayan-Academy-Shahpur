import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Dashboard } from "@/components/admin-dashboard";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const c = await createClient(); if (!c) notFound();
  const { data: { user } } = await c.auth.getUser(); if (!user) notFound();
  const { data } = await c.rpc("is_site_admin"); if (!data) notFound();
  return <Dashboard email={user.email || ""} />;
}
