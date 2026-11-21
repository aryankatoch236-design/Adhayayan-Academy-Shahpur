"use client";
import { useEffect, useState } from "react";
import { youtubeId } from "@/lib/youtube";

type V = { id: string; title: string; youtube_url: string; display_order: number; published: boolean };
const thumb = (id: string) => `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

export function VideoManager({ db, notify }: { db: any; notify: (m: string) => void }) {
  const [list, setList] = useState<V[]>([]), [url, setUrl] = useState(""), [title, setTitle] = useState(""), [auto, setAuto] = useState(""), [busy, setBusy] = useState(false);
  const id = youtubeId(url);
  async function load() { const { data } = await db.from("videos").select("*").order("display_order"); setList(data || []); }
  useEffect(() => { void load(); }, []);
  useEffect(() => {
    setAuto("");
    if (!id) return;
    let off = false;
    fetch(`https://noembed.com/embed?url=${encodeURIComponent("https://www.youtube.com/watch?v=" + id)}`).then(r => r.json()).then(j => { if (!off && j.title) setAuto(j.title); }).catch(() => {});
    return () => { off = true; };
  }, [id]);
  async function add() {
    if (!id) return;
    if (list.some(v => youtubeId(v.youtube_url) === id)) { notify("That video is already on the website."); return; }
    setBusy(true);
    const { error } = await db.from("videos").insert({ title: (title || auto || "Academy video").slice(0, 120), youtube_url: `https://www.youtube.com/watch?v=${id}`, display_order: (list[list.length - 1]?.display_order ?? 0) + 1, published: true });
    setBusy(false);
    if (error) { notify(error.message); return; }
    notify("Video added. It will show on the website within a minute.");
    setUrl(""); setTitle(""); setAuto(""); await load();
  }
  async function patch(v: V, p: Partial<V>) { const { error } = await db.from("videos").update(p).eq("id", v.id); if (error) notify(error.message); await load(); }
  async function swap(i: number, d: number) { const a = list[i], b = list[i + d]; if (!a || !b) return; await Promise.all([db.from("videos").update({ display_order: b.display_order }).eq("id", a.id), db.from("videos").update({ display_order: a.display_order }).eq("id", b.id)]); await load(); }
  async function remove(v: V) { if (!confirm(`Delete “${v.title}”?`)) return; await db.from("videos").delete().eq("id", v.id); notify("Video deleted."); await load(); }

  return <>
    <section className="checklist-card">
      <p className="eyebrow">ADD A VIDEO</p>
      <h2>Paste a YouTube link</h2>
      <p className="admin-help">Works with normal links, youtu.be, Shorts and live links. Just paste it and press Add.</p>
      <div className="vm-add">
        <input className="vm-url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" inputMode="url" />
        {url && !id && <p className="form-error">That doesn’t look like a YouTube link.</p>}
        {id && <div className="vm-preview">
          <img src={thumb(id)} alt="Video preview" />
          <div>
            <label>Title<input value={title} onChange={e => setTitle(e.target.value)} placeholder={auto || "Video title"} /></label>
            <small>{auto ? "Title found automatically. Type to change it." : "Add a title, or leave blank."}</small>
            <button className="button button-small" onClick={add} disabled={busy}>{busy ? "Adding…" : "Add to website"} →</button>
          </div>
        </div>}
      </div>
    </section>
    <section className="checklist-card">
      <div className="admin-section-title"><div><p className="eyebrow">ON YOUR WEBSITE</p><h2>Videos ({list.length})</h2></div></div>
      {list.length === 0 ? <p className="empty-admin">No videos yet. Paste your first link above.</p> :
        <div className="vm-list">{list.map((v, i) => { const vid = youtubeId(v.youtube_url); return <div className="vm-item" key={v.id}>
          {vid ? <img src={thumb(vid)} alt="" /> : <div className="vm-nothumb">?</div>}
          <div className="vm-main">
            <input defaultValue={v.title} onBlur={e => e.target.value !== v.title && void patch(v, { title: e.target.value })} aria-label="Video title" />
            <a href={v.youtube_url} target="_blank" rel="noreferrer">Open on YouTube ↗</a>
          </div>
          <div className="vm-actions">
            <button type="button" title="Move up" disabled={i === 0} onClick={() => void swap(i, -1)}>↑</button>
            <button type="button" title="Move down" disabled={i === list.length - 1} onClick={() => void swap(i, 1)}>↓</button>
            <label className="publish-toggle"><input type="checkbox" checked={v.published} onChange={e => void patch(v, { published: e.target.checked })} /> Show</label>
            <button type="button" className="delete-button" onClick={() => void remove(v)}>Delete</button>
          </div>
        </div>; })}</div>}
    </section>
  </>;
}
