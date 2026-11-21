import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPublicData } from "@/lib/data";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
export const dynamic = "force-dynamic";
const label: Record<string, string> = { new: "Received", contacted: "We have contacted you", admitted: "Admitted" };

export default async function Account() {
  const c = await createClient(); if (!c) redirect("/login");
  const { data: { user } } = await c.auth.getUser(); if (!user) redirect("/login");
  const { settings } = await getPublicData();
  const { data } = await c.from("enquiries").select("id,course,message,status,created_at").eq("user_id", user.id).order("created_at", { ascending: false });
  return <>
    <Header settings={settings} />
    <main className="account-wrap"><div className="container account-card">
      <p className="eyebrow">MY ACCOUNT</p>
      <h1>Welcome</h1>
      <p className="muted">Signed in as <strong>{user.email}</strong></p>
      <h2>My enquiries</h2>
      {data?.length ? <ul className="enq-list">{data.map((e: any) => <li key={e.id}>
        <div><strong>{e.course || "General enquiry"}</strong><small>{new Date(e.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</small></div>
        <span className={`enq-status s-${e.status}`}>{label[e.status] || e.status}</span>
      </li>)}</ul> : <p className="muted">You haven’t sent an enquiry yet.</p>}
      <a className="button" href="/#contact">Send an enquiry</a>
    </div></main>
    <Footer settings={settings} />
  </>;
}
