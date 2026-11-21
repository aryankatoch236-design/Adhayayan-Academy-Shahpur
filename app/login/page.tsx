"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function Login() {
  const [email, setEmail] = useState(""), [busy, setBusy] = useState(false), [sent, setSent] = useState(""), [error, setError] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await createClient().auth.signInWithOtp({ email: email.trim(), options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    setBusy(false);
    if (error) setError(error.message); else setSent(email.trim());
  }
  return <main className="admin-login">
    <a href="/" className="back-link">← Back to website</a>
    <div className="login-card">
      <img src="/logo-mark.png" alt="Adhyayan Academy" className="login-logo" />
      <p className="eyebrow">WELCOME</p>
      <h1>Login to Adhyayan Academy</h1>
      <p>Enter your email and we’ll send a one-tap sign-in link. No password needed.</p>
      {sent ? <p className="login-sent">Link sent to {sent}. Open it on this device to sign in. Please check Spam if you don’t see it.</p> :
        <form onSubmit={submit}>
          <label>Email<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@gmail.com" autoComplete="email" /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button" disabled={busy}>{busy ? "Sending…" : "Email me a sign-in link"}</button>
        </form>}
      <p className="login-note">We only store your email and the enquiries you send us.</p>
    </div>
  </main>;
}
