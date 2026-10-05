"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, FileVideo, Music, Upload, X } from "lucide-react";
import { AspectShape, Label, Segmented, Switch, btn, card, wrap } from "@/components/kit";
import { ASPECTS, DEFAULTS, ENUMS } from "@/lib/podcast-run";
import { cn } from "@/lib/utils";
import { readSession, writeSession } from "@/lib/session";

type Item = { id: string; name: string; size: number; file?: File; progress: number; key?: string; error?: string };
type Saved = { multi: boolean; videos: Item[]; audio: Item | null; settings: Settings };
type Settings = typeof DEFAULTS & { title: string; height: string };

const SETTING_KEYS = ["layout", "reactions", "motion", "framing", "pace"] as const;

// Presign through our API, then PUT the bytes straight to storage. XHR because fetch has no upload progress.
async function upload(file: File, onProgress: (p: number) => void): Promise<string> {
  const res = await fetch("/api/uploads", { method: "POST", body: JSON.stringify({ filename: file.name }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? "Couldn't start the upload");
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", data.url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`)));
    xhr.onerror = () => reject(new Error("Upload failed — check your connection"));
    xhr.send(file);
  });
  return data.key;
}

const size = (b: number) => (b > 1e9 ? `${(b / 1e9).toFixed(1)} GB` : `${(b / 1e6).toFixed(0)} MB`);

const SESSION_KEY = "studio";
// Only finished uploads survive a refresh; an upload in flight can't be resumed.
const keepUploaded = (it: Item | null): Item | null => (it?.key ? { ...it, file: undefined } : null);

// Rendered client-only (see page.tsx) so the lazy initialisers can read sessionStorage.
export default function StudioForm({ q }: { q: Record<string, string | string[] | undefined> }) {
  const router = useRouter();
  const fromLink = Object.keys(q).length > 0;
  const [saved] = useState(() => (fromLink ? null : readSession<Saved>(SESSION_KEY)));
  const [multi, setMulti] = useState(saved?.multi ?? q.footage === "angles");
  const [videos, setVideos] = useState<Item[]>(saved?.videos ?? []);
  const [audio, setAudio] = useState<Item | null>(saved?.audio ?? null);
  // "Edit again" links pass the previous settings in the query string; otherwise restore this tab's last settings.
  const [s, setS] = useState<Settings>(() => {
    if (saved?.settings) return saved.settings;
    const next: Record<string, unknown> = { ...DEFAULTS, title: "", height: "" };
    for (const [k, v] of Object.entries(q))
      if (k in next && typeof v === "string") next[k] = k === "sync" ? v === "true" : k === "quality" ? Number(v) : v;
    return next as Settings;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const kept = videos.map(keepUploaded).filter((v): v is Item => !!v);
    writeSession(SESSION_KEY, { multi, videos: kept, audio: keepUploaded(audio), settings: s });
  }, [multi, videos, audio, s]);

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((p) => ({ ...p, [k]: v }));

  function start(file: File, apply: (fn: (it: Item) => Item) => void) {
    upload(file, (p) => apply((it) => ({ ...it, progress: p })))
      .then((key) => apply((it) => ({ ...it, key, progress: 1 })))
      .catch((e) => apply((it) => ({ ...it, error: e.message })));
  }

  function addVideos(files: FileList | null) {
    if (!files?.length) return;
    const picked = multi ? [...files] : [files[0]];
    const items = picked.map((file) => ({ id: crypto.randomUUID(), name: file.name, size: file.size, file, progress: 0 }));
    setVideos((prev) => (multi ? [...prev, ...items] : items));
    for (const it of items) start(it.file, (fn) => setVideos((prev) => prev.map((x) => (x.id === it.id ? fn(x) : x))));
  }

  function addAudio(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const it = { id: crypto.randomUUID(), name: file.name, size: file.size, file, progress: 0 };
    setAudio(it);
    start(file, (fn) => setAudio((prev) => (prev?.id === it.id ? fn(prev) : prev)));
  }

  const uploading = videos.some((v) => !v.key && !v.error) || (audio && !audio.key && !audio.error);
  const failed = videos.some((v) => v.error) || audio?.error;
  const canSubmit = videos.length > 0 && !uploading && !failed && !submitting;

  async function submit() {
    setSubmitting(true);
    setError("");
    const body = {
      ...s,
      footage: multi ? "angles" : "edited",
      sync: multi ? s.sync : undefined,
      input: videos[0].key,
      cameras: multi ? videos.slice(1).map((v) => v.key) : undefined,
      audio: audio?.key,
      height: s.height ? Number(s.height) : undefined,
      title: s.title.trim() || undefined,
    };
    const res = await fetch("/api/podcast", { method: "POST", body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    const runId = data.runId ?? data.id;
    if (!res.ok || !runId) {
      setError(data?.error?.message ?? "Couldn't start the edit. Try again.");
      setSubmitting(false);
      return;
    }
    writeSession(`run:${runId}`, { ...body, startedAt: Date.now() });
    router.push(`/runs/${runId}`);
  }

  const summary = [s.aspect, `${s.layout} layout`, `${s.reactions} reactions`, `${s.pace} pace`].join(" · ");

  return (
    <>
      <main className={`${wrap} flex-1 py-12`}>
        <div className="flex flex-wrap justify-between gap-4 border-b border-border pb-4">
          <Label>(Studio)</Label>
          <Label>Renders on: GPU</Label>
        </div>
        <h1 className="mt-8 text-[clamp(40px,5.6vw,72px)] text-foreground">New edit.</h1>
        <div className="mt-10 flex flex-wrap items-start gap-6">
          {/* Footage */}
          <section className={`${card} min-w-[300px] flex-[3] p-7`}>
            <Label n={1}>Footage</Label>
            <h2 className="mt-3 text-[28px] text-foreground">What did you record?</h2>
            <div className="mt-4">
              <Switch
                label="Multiple cameras"
                checked={multi}
                onChange={(v) => {
                  setMulti(v);
                  if (!v) setVideos((prev) => prev.slice(0, 1));
                }}
                hint={multi ? "Upload every camera. The first file is the main camera." : "One video that already has the whole conversation."}
              />
            </div>

            <Dropzone
              className="mt-5"
              icon={<Upload size={20} />}
              title={multi ? "Drop camera files here" : "Drop the episode video here"}
              note="MP4 or MOV · up to 5 GB per file"
              accept="video/mp4,video/quicktime,.mp4,.mov"
              multiple={multi}
              onFiles={addVideos}
            />

            {videos.length > 0 && (
              <ul className="mt-4 divide-y divide-hairline">
                {videos.map((v, i) => (
                  <FileRow
                    key={v.id}
                    item={v}
                    icon={<FileVideo size={18} />}
                    tag={i === 0 ? "Main camera" : `Camera ${i + 1}`}
                    onRemove={() => setVideos((prev) => prev.filter((x) => x.id !== v.id))}
                  />
                ))}
              </ul>
            )}

            <div className="mt-8 border-t border-hairline pt-6">
              <h3 className="text-sm font-medium text-foreground">
                Clean audio <span className="font-normal text-muted-foreground">· optional</span>
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">A separate recording from the mics. It becomes the edit&apos;s sound.</p>
              {audio ? (
                <ul className="mt-3">
                  <FileRow item={audio} icon={<Music size={18} />} onRemove={() => setAudio(null)} />
                </ul>
              ) : (
                <Dropzone className="mt-3" icon={<Music size={20} />} title="Add clean audio" note="WAV, MP3 or M4A" accept="audio/*" onFiles={addAudio} />
              )}
            </div>

            {multi && (
              <div className="mt-6 border-t border-hairline pt-4">
                <Switch
                  label="Line up cameras by sound"
                  hint="Turn off if every camera started recording at the same moment."
                  checked={s.sync}
                  onChange={(v) => set("sync", v)}
                />
              </div>
            )}
          </section>

          {/* Settings */}
          <section className={`${card} min-w-[300px] flex-[2] space-y-6 p-7`}>
            <div>
              <Label n={2}>Edit settings</Label>
              <h2 className="mt-3 text-[28px] text-foreground">Set the feel.</h2>
            </div>

            <fieldset>
              <legend className="label mb-2 text-muted-foreground">Shape</legend>
              <div className="grid grid-cols-4 gap-2">
                {ASPECTS.map((a) => (
                  <label
                    key={a}
                    className="flex min-h-20 cursor-pointer flex-col items-center justify-end gap-2 border border-input p-2 text-muted-foreground has-checked:border-primary has-checked:bg-primary-soft has-checked:text-primary has-focus-visible:outline-2 has-focus-visible:outline-primary"
                  >
                    <input type="radio" name="aspect" className="sr-only" checked={s.aspect === a} onChange={() => set("aspect", a)} />
                    <AspectShape aspect={a} />
                    <span className="font-mono text-xs">{a}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {SETTING_KEYS.map((k) => (
              <Segmented key={k} label={k[0].toUpperCase() + k.slice(1)} name={k} options={ENUMS[k]} value={s[k] as never} onChange={(v) => set(k, v)} />
            ))}

            <details className="group border border-border">
              <summary className="label flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-foreground">
                Advanced <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <div className="space-y-5 border-t border-border p-4">
                <Field label="Timeline name">
                  <input className={inputCls} maxLength={200} value={s.title} onChange={(e) => set("title", e.target.value)} placeholder="Episode 12" />
                </Field>
                <Field label="Height (px)">
                  <input className={inputCls} type="number" min={64} max={4096} value={s.height} onChange={(e) => set("height", e.target.value)} placeholder="Auto" />
                </Field>
                <Segmented label="Codec" name="codec" options={ENUMS.codec} value={s.codec as "h264" | "hevc"} onChange={(v) => set("codec", v)} />
                <Field label={<>Quality <span className="ml-1 font-mono text-muted-foreground">{s.quality}</span></>}>
                  <input type="range" min={10} max={40} value={s.quality} onChange={(e) => set("quality", Number(e.target.value))} className="w-full accent-primary" />
                  <span className="mt-1 flex justify-between text-xs text-muted-foreground"><span>Best</span><span>Smallest</span></span>
                </Field>
              </div>
            </details>

            <div className="border-t border-hairline pt-5">
              <p className="font-mono text-xs capitalize text-muted-foreground">{summary}</p>
              <button type="button" disabled={!canSubmit} onClick={submit} className={cn(btn.primary, "mt-4 w-full")}>
                {submitting ? "Starting…" : uploading ? "Waiting for uploads…" : "Create edit"}
              </button>
              {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
              <p className="mt-3 text-sm text-muted-foreground">Renders on a GPU. You can leave — the result page link keeps your edit.</p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

const inputCls =
  "min-h-11 w-full border border-input bg-card px-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary";

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label mb-2 block text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Dropzone({
  icon, title, note, accept, multiple, onFiles, className,
}: { icon: React.ReactNode; title: string; note: string; accept: string; multiple?: boolean; onFiles: (f: FileList | null) => void; className?: string }) {
  return (
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        onFiles(e.dataTransfer.files);
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-3 border-2 border-dashed border-input px-6 py-8 text-center transition-colors hover:border-primary has-focus-visible:border-primary",
        className,
      )}
    >
      <span className="grid size-10 place-items-center bg-primary-soft text-primary">{icon}</span>
      <span className="font-medium text-foreground">{title}</span>
      <span className="text-sm text-muted-foreground">{note} · or click to browse</span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="sr-only"
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
}

function FileRow({ item, icon, tag, onRemove }: { item: Item; icon: React.ReactNode; tag?: string; onRemove: () => void }) {
  const done = !!item.key;
  return (
    <li className="flex items-center gap-3 py-3">
      <span className="grid size-9 shrink-0 place-items-center bg-muted text-muted-foreground">{icon}</span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
          {tag && <span className="label shrink-0 text-muted-foreground">{tag}</span>}
        </div>
        {item.error ? (
          <p className="text-sm text-destructive">{item.error}</p>
        ) : done ? (
          <p className="flex items-center gap-1 text-sm text-success"><Check size={14} /> Uploaded · {size(item.size)}</p>
        ) : (
          <div className="mt-1.5 flex items-center gap-2">
            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={Math.round(item.progress * 100)} aria-label={`Uploading ${item.name}`}>
              <span className="block h-full bg-primary transition-[width]" style={{ width: `${item.progress * 100}%` }} />
            </span>
            <span className="w-10 text-right font-mono text-xs text-muted-foreground">{Math.round(item.progress * 100)}%</span>
          </div>
        )}
      </div>
      <button type="button" onClick={onRemove} aria-label={`Remove ${item.name}`} className="grid size-11 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted">
        <X size={16} />
      </button>
    </li>
  );
}
