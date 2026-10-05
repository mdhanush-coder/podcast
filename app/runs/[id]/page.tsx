"use client";
// Upstream EngineX run/sign bodies are undocumented beyond prose, so they stay loosely typed.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowDown, ArrowUpRight, Check, ChevronLeft, ChevronRight, Link2, Pause, Play, RotateCcw, X } from "lucide-react";
import { Footer, Header, Label, SHOT_COLORS, StatusPill, btn, fmt, wrap } from "@/components/kit";
import { cn } from "@/lib/utils";
import { readSession, readSessionRaw, writeSession } from "@/lib/session";

type Shot = { kind: string; start: number; end: number; people: string[] };
type Person = { name: string; talkingSec: number };
type Job = { progress: number; pod: string | null; startedAt: string | null } | null;
type Data = { run: any; outputs: Record<string, any>; urls: Record<string, string>; job: Job };
type Focus = { kind: string } | { person: string } | null;

const DOWNLOADS = [
  ["video", "MP4", "Edited video", "Ready to post"],
  ["premiere", "XML", "Premiere Pro", "FCP7 XML timeline"],
  ["fcpxml", "FCPXML", "Final Cut Pro · DaVinci Resolve", "Native timeline"],
  ["edl", "EDL", "Any editor", "CMX 3600 cut list"],
  ["timeline", "OTIO", "Timeline", "OpenTimelineIO document"],
  ["edit", "JSON", "Edit data", "Shots and framing"],
] as const;

const TERMINAL = ["succeeded", "failed", "canceled"];
const SETTINGS_SHOWN = ["aspect", "layout", "reactions", "motion", "framing", "pace", "codec", "quality"];
const AGAIN_KEYS = [...SETTINGS_SHOWN, "sync", "footage", "title", "height"];
const ON_INK = { label: "text-[#9FB8A6]", rule: "border-[#2B4238]", body: "text-[#C9D3CC]" };

const noSubscribe = () => () => {};

const num = (...v: unknown[]) => Number(v.find((x) => x != null) ?? 0);
const shotsOf = (raw: any): Shot[] =>
  (Array.isArray(raw) ? raw : raw?.shots ?? []).map((s: any) => ({
    kind: String(s.kind ?? s.type ?? s.layout ?? "wide").toLowerCase(),
    start: num(s.start, s.startSec, s.in),
    end: num(s.end, s.endSec, s.out),
    people: Array.isArray(s.people) ? s.people.map(String) : [],
  }));
const peopleOf = (raw: any): Person[] =>
  (Array.isArray(raw) ? raw : raw?.people ?? []).map((p: any, i: number) => ({
    name: p.label ?? p.name ?? `Person ${i + 1}`,
    talkingSec: num(p.talkingSec),
  }));
const hms = (sec: number) => (sec >= 3600 ? `${Math.floor(sec / 3600)}:${fmt(sec % 3600).padStart(5, "0")}` : fmt(sec));
const matches = (s: Shot, f: Focus) => !f || ("kind" in f ? s.kind === f.kind : s.people.includes(f.person));

export default function RunPage() {
  const { id } = useParams<{ id: string }>();
  const [fresh, setFresh] = useState<Data | null>(null);
  // Last result this tab saw, so a refresh shows it instantly; sessionStorage is cleared when the site is closed.
  const cachedRaw = useSyncExternalStore(noSubscribe, () => readSessionRaw(`run-data:${id}`), () => null);
  const cached = useMemo<Data | null>(() => (cachedRaw ? JSON.parse(cachedRaw) : null), [cachedRaw]);
  const data = fresh ?? cached;
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(0);
  // The run carries the settings it was started with; the studio's saved copy adds title/audio on this device.
  const saved = useSyncExternalStore(noSubscribe, () => readSessionRaw(`run:${id}`), () => null);
  const local = useMemo<Record<string, any> | null>(() => (saved ? JSON.parse(saved) : null), [saved]);
  const settings: Record<string, any> = { ...data?.run.input, ...local };

  // ponytail: polls every 3s; switch to /v1/runs/{id}/stream if runs get long or many tabs stay open.
  useEffect(() => {
    let stop = false;
    let timer: ReturnType<typeof setTimeout>;
    async function tick() {
      const res = await fetch(`/api/runs/${id}`).catch(() => null);
      const body = await res?.json().catch(() => null);
      if (stop) return;
      if (!res?.ok) setLoadError(body?.error?.message ?? "Couldn't load this edit.");
      else {
        setLoadError("");
        setFresh(body);
        writeSession(`run-data:${id}`, body);
        if (TERMINAL.includes(body.run.status)) return;
      }
      timer = setTimeout(tick, 3000);
    }
    tick();
    return () => {
      stop = true;
      clearTimeout(timer);
    };
  }, [id]);

  const status: string = data?.run.status ?? "queued";
  const done = status === "succeeded";
  const failed = status === "failed" || status === "canceled";

  useEffect(() => {
    if (done || failed) return;
    const tick = () => setNow(Date.now());
    const t = setInterval(tick, 1000);
    const first = setTimeout(tick, 0);
    return () => {
      clearInterval(t);
      clearTimeout(first);
    };
  }, [done, failed]);

  const title = settings.title || "Untitled edit";
  const againHref = `/studio?${new URLSearchParams(
    Object.entries(settings).filter(([k, v]) => AGAIN_KEYS.includes(k) && v != null).map(([k, v]) => [k, String(v)]),
  )}`;
  const createdAt = data?.run.timings?.createdAt ? Date.parse(data.run.timings.createdAt) : local?.startedAt;
  const elapsed = createdAt && now ? Math.max(0, (now - createdAt) / 1000) : null;
  const state = done ? "Ready" : failed ? "Didn't finish" : status === "queued" ? "Queued" : "Editing";

  return (
    <>
      <Header>
        <nav className="flex items-center gap-1">
          <Link href="/edits" className="hidden min-h-11 items-center px-3 text-[15px] text-muted-foreground hover:text-foreground sm:flex">my edits</Link>
          <Link href="/studio" className={btn.ghost}>New edit</Link>
        </nav>
      </Header>
      <main className={`${wrap} flex-1 pt-12 pb-24`}>
        <div className="flex flex-wrap justify-between gap-4 border-b border-border pb-4">
          <Label>(Edit)</Label>
          <Label className="hidden sm:flex">Run: {id.replace(/^run_/, "").slice(0, 8)}</Label>
          <Label>Status: {state}</Label>
        </div>

        {loadError && !data ? (
          <section className="py-16">
            <h1 className="text-[clamp(44px,7.2vw,92px)] text-foreground">Edit not found.</h1>
            <p className="mt-6 max-w-xl text-lg">{loadError}</p>
            <Link href="/studio" className={cn(btn.primary, "mt-8")}>Start a new edit</Link>
          </section>
        ) : !data ? (
          <p className="label py-16 text-muted-foreground">Loading…</p>
        ) : done ? (
          <Result id={id} data={data} title={title} settings={settings} againHref={againHref} />
        ) : failed ? (
          <Failed run={data.run} title={title} settings={settings} againHref={againHref} />
        ) : (
          <Rendering status={status} job={data.job} title={title} settings={settings} elapsed={elapsed} />
        )}
      </main>
      <Footer />
    </>
  );
}

function TitleBlock({ title, pill, settings, children }: { title: string; pill: "ready" | "editing" | "failed"; settings: Record<string, any>; children?: React.ReactNode }) {
  const tags = ["aspect", "layout", "reactions", "pace"].filter((k) => settings[k]).map((k) => (k === "aspect" ? settings[k] : `${settings[k]} ${k}`));
  return (
    <div className="flex flex-wrap items-end justify-between gap-8 pt-10">
      <div>
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-[clamp(44px,7.2vw,92px)] text-foreground">{title}</h1>
          <StatusPill state={pill} />
        </div>
        {tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-1.5">
            {tags.map((t) => <span key={t} className="rounded-full border border-border px-3 py-1 text-sm capitalize">{t}</span>)}
          </div>
        )}
      </div>
      {children && <div className="flex flex-wrap gap-3">{children}</div>}
    </div>
  );
}

function SectionHead({ title, n, label, children }: { title: string; n: number; label: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <h2 className="text-[clamp(32px,4.4vw,56px)] text-foreground">{title}</h2>
      {children ?? <Label n={n}>{label}</Label>}
    </div>
  );
}

// ---------- Rendering ----------

function Rendering({ status, job, title, settings, elapsed }: { status: string; job: Job; title: string; settings: Record<string, any>; elapsed: number | null }) {
  const pct = job && job.progress > 0 ? Math.min(job.progress, 1) : null;
  const at = status === "running" ? 2 : 1;
  const stages = [
    ["Uploaded", "Your footage is in storage."],
    ["Picked up by a GPU worker", job?.pod ? `Running on ${job.pod}.` : "Waiting for a free GPU."],
    ["Editing and rendering", "Finding who talks, choosing shots, rendering the cut."],
    ["Ready to download", "Video, timelines and shot list."],
  ];
  const aspect = String(settings.aspect ?? "9:16").replace(":", "/");

  return (
    <>
      <TitleBlock title={title} pill="editing" settings={settings} />
      <div className="mt-14 flex flex-wrap gap-6">
        <section className="min-w-[300px] flex-[3]">
          <Label>(Elapsed)</Label>
          <p className="mt-2 font-mono text-[clamp(64px,10vw,132px)] leading-none tracking-[-0.06em] text-foreground tabular-nums">
            {elapsed != null ? hms(elapsed) : "0:00"}
          </p>

          <div className="mt-8 h-2 overflow-hidden bg-muted" role="progressbar" aria-label="Editing progress" aria-valuenow={pct != null ? Math.round(pct * 100) : undefined}>
            {pct != null ? (
              <span className="block h-full bg-foreground transition-[width] duration-700" style={{ width: `${pct * 100}%` }} />
            ) : (
              <span className="block h-full w-2/5 bg-foreground" style={{ animation: "indeterminate 1.6s ease-in-out infinite" }} />
            )}
          </div>
          <div className="mt-2 flex justify-between">
            <Label>{pct != null ? `${Math.round(pct * 100)}% rendered` : status === "queued" ? "In the queue" : "Working"}</Label>
            <Label>GPU render</Label>
          </div>

          <ol className="mt-12 border-t border-foreground">
            {stages.map(([name, note], i) => {
              const s = i < at ? "Done" : i === at ? "In progress" : "Waiting";
              return (
                <li key={name} className={cn("flex flex-wrap items-baseline gap-x-8 gap-y-1 border-b border-border py-5", i > at && "opacity-50")}>
                  <span className="label w-12 text-muted-foreground">({String(i + 1).padStart(2, "0")})</span>
                  <span className="min-w-[200px] flex-1">
                    <span className="block text-[22px] font-medium tracking-[-0.03em] text-foreground">{name}</span>
                    <span className="block text-sm text-muted-foreground">{note}</span>
                  </span>
                  <span className={cn("label flex items-center gap-2", i === at ? "text-foreground" : i < at ? "text-success" : "text-muted-foreground")}>
                    {i < at && <Check size={14} />}
                    {i === at && <span className="size-2 rounded-full bg-foreground" style={{ animation: "pulse-dot 1.4s ease-in-out infinite" }} />}
                    {s}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="mt-6 max-w-lg text-muted-foreground">You can close this tab. This page&apos;s link brings you back to the result.</p>
        </section>

        <aside className={`flex min-w-[280px] flex-[2] flex-col bg-foreground p-6 ${ON_INK.body}`}>
          <div className="flex justify-between">
            <Label className={ON_INK.label}>(Preview)</Label>
            <Label className={ON_INK.label}>{settings.aspect ?? "9:16"}</Label>
          </div>
          <div className="flex flex-1 items-center justify-center py-10">
            <div className={`relative max-h-[420px] w-full max-w-[260px] overflow-hidden border ${ON_INK.rule}`} style={{ aspectRatio: aspect }}>
              <span aria-hidden className="absolute inset-x-0 h-px bg-highlight shadow-[0_0_24px_4px_rgba(198,244,50,.35)]" style={{ animation: "scan 2.8s ease-in-out infinite alternate" }} />
              <span className={`label absolute inset-x-0 bottom-4 text-center ${ON_INK.label}`}>Your cut appears here</span>
            </div>
          </div>
          <SettingsList settings={settings} />
        </aside>
      </div>
    </>
  );
}

function SettingsList({ settings }: { settings: Record<string, any> }) {
  return (
    <dl className={`divide-y divide-[#2B4238] border-t ${ON_INK.rule}`}>
      {SETTINGS_SHOWN.filter((k) => settings[k] != null).map((k) => (
        <div key={k} className="flex justify-between py-2.5">
          <dt className={`label ${ON_INK.label}`}>{k}</dt>
          <dd className="capitalize text-background">{String(settings[k])}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------- Failed ----------

function Failed({ run, title, settings, againHref }: { run: any; title: string; settings: Record<string, any>; againHref: string }) {
  const failedStep = (run.steps ?? []).find((s: any) => s.error);
  const err = run.error ?? failedStep?.error;
  const raw = typeof err === "string" ? err : err?.message ?? (run.status === "canceled" ? "The run was canceled." : "No details were returned.");
  const text = raw.toLowerCase();

  let headline = "The edit didn't finish.";
  let explain = "Something went wrong while editing. Your uploads are kept, so trying again is quick.";
  let fix = { label: "Try again", href: againHref };
  if (text.includes("sync") || text.includes("align")) {
    headline = "We couldn't line up the cameras.";
    explain = "The cameras' sound didn't match closely enough. If every camera started recording at the same moment, turn sync off.";
    fix = { label: "Try again with sync off", href: againHref.replace(/sync=true/, "sync=false") + (againHref.includes("sync=") ? "" : "&sync=false") };
  } else if (text.includes("audio") && !settings.audio) {
    headline = "The sound wasn't usable.";
    explain = "The video's own audio was too quiet or missing. Adding the clean recording from the mics usually fixes it.";
    fix = { label: "Add clean audio", href: againHref };
  }

  return (
    <>
      <TitleBlock title={title} pill="failed" settings={settings} />
      <div className="mt-14 flex flex-wrap gap-6">
        <section className="min-w-[300px] flex-[3] border-t border-foreground pt-8">
          <Label n={1}>What happened</Label>
          <h2 className="mt-4 text-[clamp(32px,4.4vw,56px)] text-foreground">{headline}</h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed">{explain}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={fix.href} className={btn.primary}><RotateCcw size={14} /> {fix.label}</Link>
            <Link href="/studio" className={btn.ghost}>Start over</Link>
          </div>
        </section>
        <section className="min-w-[280px] flex-[2] border border-border bg-destructive-soft/40 p-6">
          <Label n={2}>Details</Label>
          <pre className="mt-4 overflow-x-auto font-mono text-xs leading-relaxed whitespace-pre-wrap text-destructive">{raw}</pre>
          {run.runId && <p className="label mt-6 break-all text-muted-foreground">{run.runId}</p>}
        </section>
      </div>
    </>
  );
}

// ---------- Result ----------

// Eases a number up from 0 once; instant under reduced motion.
function useCountUp(target: number, ms = 1100) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const dur = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
    const t0 = performance.now();
    let raf = 0;
    const step = (n: number) => {
      const p = dur ? Math.min((n - t0) / dur, 1) : 1;
      setV(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Stat({ label, value, format }: { label: string; value: number | null; format: (n: number) => string }) {
  const v = useCountUp(value ?? 0);
  return (
    <div className="border-b border-border py-6 pr-4">
      <dt className="label text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-[clamp(36px,4.4vw,56px)] leading-none font-medium tracking-[-0.05em] text-foreground tabular-nums">
        {value == null ? "—" : format(v)}
      </dd>
    </div>
  );
}

function CopyLink() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className={btn.ghost}
      onClick={() =>
        navigator.clipboard.writeText(location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        })
      }
    >
      {copied ? <Check size={14} /> : <Link2 size={14} />} {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

function Result({ id, data, title, settings, againHref }: { id: string; data: Data; title: string; settings: Record<string, any>; againHref: string }) {
  const { run, outputs, urls } = data;
  const shots = useMemo(() => shotsOf(outputs.shots), [outputs.shots]);
  const people = peopleOf(outputs.people);
  const talkers = people.filter((p) => p.talkingSec > 0).sort((a, b) => b.talkingSec - a.talkingSec);
  const silent = people.length - talkers.length;
  const duration = shots.length ? shots[shots.length - 1].end : 0;
  const totalTalk = talkers.reduce((n, p) => n + p.talkingSec, 0) || 1;
  const url = (f: string) => urls[outputs[f]];
  const aspect = settings.aspect ?? "9:16";
  const counts = shots.reduce<Record<string, number>>((m, s) => ({ ...m, [s.kind]: (m[s.kind] ?? 0) + 1 }), {});
  const runMs = run.timings?.runMs ?? run.runMs;

  const video = useRef<HTMLVideoElement>(null);
  // Playback position and filter survive a refresh in this tab.
  const viewKey = `run-view:${id}`;
  const [view] = useState(() => readSession<{ t: number; focus: Focus }>(viewKey));
  const [t, setT] = useState(view?.t ?? 0);
  const [playing, setPlaying] = useState(false);
  const [focus, setFocus] = useState<Focus>(view?.focus ?? null);
  useEffect(() => writeSession(viewKey, { t, focus }), [viewKey, t, focus]);

  // Smooth playhead while playing; timeupdate alone only fires ~4x a second.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const loop = () => {
      if (video.current) setT(video.current.currentTime);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const idx = shots.findIndex((s) => t >= s.start && t < s.end);
  const current = idx >= 0 ? shots[idx] : null;
  const upNext = shots.filter((s) => s.start > t + 0.05 && matches(s, focus)).slice(0, 3);

  function seek(sec: number, play = true) {
    const v = video.current;
    const to = Math.max(0, Math.min(sec, duration || sec));
    setT(to);
    if (!v) return;
    v.currentTime = to;
    if (play) v.play().catch(() => {});
  }
  // Next/previous shot, respecting the active filter.
  function step(dir: 1 | -1) {
    const list = shots.filter((s) => matches(s, focus));
    const target = dir === 1 ? list.find((s) => s.start > t + 0.05) : [...list].reverse().find((s) => s.start < (current?.start ?? t) - 0.05);
    if (target) seek(target.start);
  }
  function focusPerson(name: string) {
    const same = focus && "person" in focus && focus.person === name;
    setFocus(same ? null : { person: name });
    if (!same) {
      const next = shots.find((s) => s.people.includes(name) && s.start > t + 0.05) ?? shots.find((s) => s.people.includes(name));
      if (next) seek(next.start);
    }
  }

  return (
    <>
      <TitleBlock title={title} pill="ready" settings={settings}>
        {url("video") && <a href={url("video")} className={btn.primary}><ArrowDown size={14} /> Download video</a>}
        <CopyLink />
      </TitleBlock>

      <dl className="reveal mt-14 grid grid-cols-2 border-t border-foreground sm:grid-cols-4">
        <Stat label="Length" value={duration || null} format={hms} />
        <Stat label="Shots" value={shots.length || null} format={(n) => String(Math.round(n))} />
        <Stat label="Speakers" value={talkers.length || null} format={(n) => String(Math.round(n))} />
        <Stat label="Render time" value={runMs ? runMs / 1000 : null} format={hms} />
      </dl>

      {/* Player + now playing */}
      <section className="reveal mt-14 flex flex-wrap bg-foreground">
        <div className="flex min-w-[280px] flex-[3] items-center justify-center p-6">
          {url("video") ? (
            <video
              ref={video}
              src={url("video")}
              controls
              playsInline
              onLoadedMetadata={(e) => {
                if (view?.t) e.currentTarget.currentTime = view.t;
              }}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onSeeked={(e) => setT(e.currentTarget.currentTime)}
              onTimeUpdate={(e) => !playing && setT(e.currentTarget.currentTime)}
              className="max-h-[72vh] w-full bg-black object-contain"
              style={{ aspectRatio: aspect.replace(":", "/") }}
            />
          ) : (
            <p className={`py-20 ${ON_INK.label}`}>The video link isn&apos;t available.</p>
          )}
        </div>
        <aside className={`flex min-w-[260px] flex-[2] flex-col border-t p-6 md:border-t-0 md:border-l ${ON_INK.rule} ${ON_INK.body}`}>
          <div className="flex justify-between">
            <Label className={ON_INK.label}>(Now playing)</Label>
            <Label className={ON_INK.label}>{hms(t)} / {hms(duration)}</Label>
          </div>
          <p className="mt-8 text-[clamp(40px,5vw,64px)] leading-none font-medium tracking-[-0.05em] text-background capitalize">
            {current ? current.kind : "—"}
          </p>
          <p className={`mt-3 ${ON_INK.label}`}>
            {current ? `Shot ${idx + 1} of ${shots.length} · ${(current.end - current.start).toFixed(1)}s` : "Press play or pick a shot below"}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {(current?.people ?? []).map((p) => (
              <span key={p} className="flex items-center gap-2 rounded-full bg-highlight px-3 py-1 text-sm text-foreground">
                <span className="size-1.5 rounded-full bg-foreground" style={{ animation: playing ? "pulse-dot 1.4s ease-in-out infinite" : undefined }} />
                {p}
              </span>
            ))}
          </div>
          {upNext.length > 0 && (
            <div className="mt-10">
              <Label className={ON_INK.label}>Up next</Label>
              <ul className={`mt-3 border-t ${ON_INK.rule}`}>
                {upNext.map((s) => (
                  <li key={s.start}>
                    <button
                      type="button"
                      onClick={() => seek(s.start)}
                      className={`group flex min-h-11 w-full items-center gap-3 border-b py-2 text-left ${ON_INK.rule} hover:text-highlight`}
                    >
                      <span className="size-2.5 shrink-0" style={{ background: SHOT_COLORS[s.kind] ?? SHOT_COLORS.wide, outline: "1px solid #2B4238" }} />
                      <span className="w-20 capitalize text-background group-hover:text-highlight">{s.kind}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{s.people.join(", ")}</span>
                      <span className="label">{hms(s.start)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-auto flex items-center gap-2 pt-10">
            <IconBtn label="Previous shot" onClick={() => step(-1)}><ChevronLeft size={18} /></IconBtn>
            <IconBtn
              label={playing ? "Pause" : "Play"}
              strong
              onClick={() => {
                const v = video.current;
                if (!v) return;
                if (v.paused) v.play().catch(() => {});
                else v.pause();
              }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </IconBtn>
            <IconBtn label="Next shot" onClick={() => step(1)}><ChevronRight size={18} /></IconBtn>
            {focus && (
              <span className="label ml-2 text-highlight">
                Stepping through {"kind" in focus ? focus.kind : focus.person}
              </span>
            )}
          </div>
        </aside>
      </section>

      {/* Interactive shot timeline */}
      {shots.length > 0 && (
        <section className="reveal mt-6">
          <Timeline shots={shots} duration={duration} t={t} focus={focus} onSeek={seek} />
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Label className="mr-2">Show</Label>
            <Chip active={!focus} onClick={() => setFocus(null)}>All {shots.length}</Chip>
            {Object.entries(counts).map(([k, n]) => (
              <Chip key={k} active={!!focus && "kind" in focus && focus.kind === k} onClick={() => setFocus(focus && "kind" in focus && focus.kind === k ? null : { kind: k })}>
                <span className="size-2.5" style={{ background: SHOT_COLORS[k] ?? SHOT_COLORS.wide }} />
                <span className="capitalize">{k}</span> <span className="opacity-60">{n}</span>
              </Chip>
            ))}
            {focus && (
              <button type="button" onClick={() => setFocus(null)} className="label ml-1 flex min-h-11 items-center gap-1 px-2 text-muted-foreground hover:text-foreground">
                <X size={12} /> Clear
              </button>
            )}
          </div>
        </section>
      )}

      {/* Speakers */}
      {people.length > 0 && (
        <section className="reveal mt-20">
          <SectionHead title="Speakers" n={1} label="Talk time · click to follow" />
          <ul className="mt-6 border-t border-foreground">
            {talkers.map((p) => {
              const share = p.talkingSec / totalTalk;
              const onScreen = current?.people.includes(p.name);
              const active = !!focus && "person" in focus && focus.person === p.name;
              return (
                <li key={p.name}>
                  <button
                    type="button"
                    aria-pressed={active}
                    onClick={() => focusPerson(p.name)}
                    className={cn("group flex w-full flex-wrap items-center gap-x-6 gap-y-2 border-b border-border py-5 text-left transition-colors hover:bg-card", active && "bg-card")}
                  >
                    <span className="flex w-40 items-center gap-2 text-lg font-medium tracking-[-0.02em] text-foreground">
                      <span className={cn("size-2 rounded-full transition-colors", onScreen ? "bg-foreground" : "bg-border")} style={onScreen && playing ? { animation: "pulse-dot 1.4s ease-in-out infinite" } : undefined} />
                      {p.name}
                    </span>
                    <span className="h-3 min-w-[160px] flex-1 bg-muted">
                      <span className={cn("bar block h-full transition-colors", active ? "bg-highlight" : "bg-foreground")} style={{ width: `${share * 100}%` }} />
                    </span>
                    <span className="label w-28 text-right text-foreground">{Math.round(share * 100)}% · {hms(p.talkingSec)}</span>
                    <span className="label hidden w-28 text-right text-muted-foreground group-hover:text-foreground sm:block">
                      {active ? "Following" : onScreen ? "On screen" : "Jump to →"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {silent > 0 && <p className="mt-3 text-sm text-muted-foreground">{silent} more on camera who didn&apos;t talk</p>}
        </section>
      )}

      {/* Downloads */}
      <section className="reveal mt-20">
        <SectionHead title="Downloads" n={2} label="Files" />
        <ul className="mt-6 grid border-t border-l border-border sm:grid-cols-2 lg:grid-cols-3">
          {DOWNLOADS.filter(([f]) => url(f)).map(([f, tag, name, desc], i) => (
            <li key={f} className="border-r border-b border-border">
              <a href={url(f)} className="group flex h-full flex-col gap-10 p-6 transition-colors hover:bg-foreground">
                <span className="flex justify-between">
                  <span className="label text-muted-foreground group-hover:text-[#9FB8A6]">({String(i + 1).padStart(2, "0")})</span>
                  <span className="label text-foreground group-hover:text-highlight">{tag}</span>
                </span>
                <span className="flex items-end justify-between gap-4">
                  <span>
                    <span className="block text-[22px] font-medium tracking-[-0.03em] text-foreground group-hover:text-background">{name}</span>
                    <span className="block text-sm text-muted-foreground group-hover:text-[#9FB8A6]">{desc}</span>
                  </span>
                  <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full border border-foreground text-foreground transition-all group-hover:-translate-y-1 group-hover:border-highlight group-hover:bg-highlight">
                    <ArrowDown size={16} />
                  </span>
                </span>
                <span className="sr-only">Download</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Settings used */}
      <section className="reveal mt-20">
        <SectionHead title="Settings used" n={3} label="Edit">
          <Link href={againHref} className={btn.ghost}>Edit again with new settings <ArrowUpRight size={14} /></Link>
        </SectionHead>
        <dl className="mt-6 grid grid-cols-2 border-t border-foreground sm:grid-cols-4">
          {SETTINGS_SHOWN.filter((k) => settings[k] != null).map((k) => (
            <div key={k} className="border-b border-border py-4 pr-4">
              <dt className="label text-muted-foreground">{k}</dt>
              <dd className="mt-1 text-lg capitalize text-foreground">{String(settings[k])}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function IconBtn({ label, onClick, strong, children }: { label: string; onClick: () => void; strong?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={cn(
        "grid size-11 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight",
        strong ? "border-highlight bg-highlight text-foreground hover:bg-[#d4ff4f]" : "border-[#2B4238] text-background hover:border-highlight hover:text-highlight",
      )}
    >
      {children}
    </button>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex min-h-9 items-center gap-2 rounded-full border px-3 text-sm transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border text-foreground hover:border-foreground",
      )}
    >
      {children}
    </button>
  );
}

// Scrubbable shot strip: hover for details, click to seek, arrow keys step 5s, playhead follows the video.
function Timeline({ shots, duration, t, focus, onSeek }: { shots: Shot[]; duration: number; t: number; focus: Focus; onSeek: (s: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; sec: number; w: number } | null>(null);
  const at = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - r.left, r.width));
    return { x, sec: (x / r.width) * duration, w: r.width };
  };
  const hovered = hover ? shots.find((s) => hover.sec >= s.start && hover.sec < s.end) : null;

  return (
    <div className="border border-border bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label>Shots · click to jump</Label>
        <Label>{hover ? hms(hover.sec) : hms(t)}</Label>
      </div>
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label="Shot timeline"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(t)}
        aria-valuetext={hms(t)}
        onMouseMove={(e) => setHover(at(e.clientX))}
        onMouseLeave={() => setHover(null)}
        onClick={(e) => onSeek(at(e.clientX).sec)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") onSeek(t + 5);
          else if (e.key === "ArrowLeft") onSeek(t - 5);
          else return;
          e.preventDefault();
        }}
        className="relative mt-5 h-20 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
      >
        <div className="flex h-full gap-px overflow-hidden">
          {shots.map((s, i) => (
            <span
              key={i}
              className="transition-opacity duration-300"
              style={{ flexGrow: Math.max(s.end - s.start, 0.01), background: SHOT_COLORS[s.kind] ?? SHOT_COLORS.wide, opacity: matches(s, focus) ? 1 : 0.15 }}
            />
          ))}
        </div>
        {/* playhead */}
        <span aria-hidden className="pointer-events-none absolute -top-2 -bottom-2 w-0.5 bg-highlight shadow-[0_0_0_1px_#10231C]" style={{ left: `${duration ? (t / duration) * 100 : 0}%` }}>
          <span className="absolute -top-1 left-1/2 size-3 -translate-x-1/2 rounded-full border-2 border-foreground bg-highlight" />
        </span>
        {/* hover tooltip */}
        {hover && hovered && (
          <span
            className="pointer-events-none absolute bottom-full z-10 mb-3 -translate-x-1/2 bg-foreground px-3 py-2 whitespace-nowrap text-background"
            style={{ left: Math.min(Math.max(hover.x, 70), hover.w - 70) }}
          >
            <span className="block text-sm font-medium capitalize">{hovered.kind}</span>
            <span className="label block text-[#9FB8A6]">
              {hms(hovered.start)}–{hms(hovered.end)}{hovered.people.length ? ` · ${hovered.people.join(", ")}` : ""}
            </span>
          </span>
        )}
      </div>
      <div className="mt-3 flex justify-between">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => <Label key={f}>{hms(duration * f)}</Label>)}
      </div>
    </div>
  );
}
