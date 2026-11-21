"use client";
import { useEffect, useState } from "react";

type A = { email: string; notify: boolean; added_by: string | null };

export function AdminsPanel({ db, me, notify }: { db: any; me: string; notify: (m: string) => void }) {
  const [list, setList] = useState<A[]>([]), [email, setEmail] = useState("");
  async function load() { const { data } = await db.from("admin_emails").select("*").order("created_at"); setList(data || []); }
  useEffect(() => { void load(); }, []);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    const v = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(v)) { notify("Enter a valid email address."); return; }
    const { error } = await db.from("admin_emails").upsert({ email: v, notify: true, added_by: me }, { onConflict: "email" });
    if (error) { notify(error.message); return; }
    setEmail(""); notify(`${v} can now sign in at /admin and will receive enquiry emails.`); await load();
  }
  async function toggle(a: A) { await db.from("admin_emails").update({ notify: !a.notify }).eq("email", a.email); await load(); }
  async function remove(a: A) {
    if (a.email === me.toLowerCase() || list.length < 2) { notify("You can’t remove yourself or the last admin."); return; }
    if (!confirm(`Remove ${a.email}? They will lose access.`)) return;
    await db.from("admin_emails").delete().eq("email", a.email); notify("Admin removed."); await load();
  }
  return <>
    <section className="checklist-card">
      <p className="eyebrow">TEAM ACCESS</p><h2>Add an admin</h2>
      <p className="admin-help">Only the emails listed here can open this panel. They sign in with a one-tap email link, no password needed.</p>
      <form className="vm-add-admin" onSubmit={add}><input type="email" required placeholder="name@gmail.com" value={email} onChange={e => setEmail(e.target.value)} /><button className="button button-small">Add admin</button></form>
    </section>
    <section className="checklist-card">
      <div className="admin-section-title"><div><p className="eyebrow">WHO HAS ACCESS</p><h2>Admins ({list.length})</h2></div></div>
      <div className="vm-list">{list.map(a => <div className="vm-item" key={a.email}>
        <div className="vm-nothumb">{a.email[0]?.toUpperCase()}</div>
        <div className="vm-main"><strong>{a.email}</strong><small>{a.email === me.toLowerCase() ? "You" : a.added_by ? `Added by ${a.added_by}` : ""}</small></div>
        <div className="vm-actions">
          <label className="publish-toggle"><input type="checkbox" checked={a.notify} onChange={() => void toggle(a)} /> Email me enquiries</label>
          <button type="button" className="delete-button" onClick={() => void remove(a)}>Remove</button>
        </div>
      </div>)}</div>
    </section>
  </>;
}
