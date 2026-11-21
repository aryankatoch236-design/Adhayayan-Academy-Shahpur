export function youtubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(/^https?:\/\//.test(s) ? s : `https://${s}`);
    const h = u.hostname.replace(/^(www|m)\./, "");
    if (h === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (h.endsWith("youtube.com") || h.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {}
  return null;
}
