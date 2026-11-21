"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function AuthMenu() {
  const [state, setState] = useState<{ email: string; admin: boolean } | null | undefined>(undefined);
  useEffect(() => {
    let off = false;
    (async () => {
      const db = createClient();
      const { data: { user } } = await db.auth.getUser();
      if (off) return;
      if (!user) { setState(null); return; }
      const { data } = await db.rpc("is_site_admin");
      if (!off) setState({ email: user.email || "", admin: !!data });
    })();
    return () => { off = true; };
  }, []);
  async function out() { await createClient().auth.signOut(); location.href = "/"; }
  if (state === undefined) return <span className="auth-slot" />;
  if (!state) return <a className="button button-small button-outline login-btn" href="/login">Login</a>;
  return <details className="auth-menu">
    <summary aria-label="Account menu"><span className="auth-avatar">{state.email[0]?.toUpperCase()}</span></summary>
    <div className="auth-pop">
      <small>{state.email}</small>
      {state.admin && <a href="/admin">Dashboard</a>}
      <a href="/account">My account</a>
      <button type="button" onClick={out}>Sign out</button>
    </div>
  </details>;
}
