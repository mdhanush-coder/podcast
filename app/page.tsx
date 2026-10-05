import Link from "next/link";
import { ArrowDown, ArrowUpRight, Plus } from "lucide-react";
import { AspectShape, Footer, Header, Label, ShotStrip, btn, wrap } from "@/components/kit";
import { ASPECTS, DEFAULTS, ENUMS } from "@/lib/podcast-run";

const DEMO_SHOTS = [
  ["wide", 0, 6], ["single", 6, 17], ["reaction", 17, 20], ["single", 20, 31], ["split", 31, 38],
  ["single", 38, 49], ["reaction", 49, 52], ["single", 52, 63], ["wide", 63, 67], ["single", 67, 77],
].map(([kind, start, end]) => ({ kind: kind as string, start: start as number, end: end as number }));

const STEPS = [
  ["Upload", "One edited video, or every camera plus the clean recording from the mics. Files go straight to storage."],
  ["Set the feel", "Pick the shape, how often it cuts to reactions, how much it moves. The defaults are a good start."],
  ["Download", "The vertical cut, plus timelines for Premiere, Final Cut, Resolve or any editor to keep refining."],
];

const EXPORTS = [
  ["MP4", "Edited video", "Ready to post"],
  ["XML", "Premiere Pro", "FCP7 XML timeline"],
  ["FCPXML", "Final Cut Pro · Resolve", "Native timeline"],
  ["EDL", "Any editor", "CMX 3600 cut list"],
  ["JSON", "Shot list", "Every shot and its framing"],
];

const FAQ = [
  ["What files can I upload?", "MP4 or MOV video up to 5 GB per file, and WAV, MP3 or M4A for clean audio. One edited video works, and so do up to 99 separate camera clips."],
  ["What does lining up cameras by sound do?", "Cameras rarely start at the same moment. Sync matches each clip's sound to the others so they line up. Turn it off if every camera started together."],
  ["How long does an edit take?", "It renders on a GPU, usually a fraction of the episode's length. You can close the tab — the result page link brings you back."],
  ["Can I keep editing afterwards?", "Yes. Every edit comes with Premiere, Final Cut, Resolve and EDL timelines, so you can open the cut in your editor and change anything."],
  ["What if an edit doesn't finish?", "The result page says why in plain words and offers the fix, like trying again with sync off or adding clean audio. Your uploads are kept."],
];

const big = "text-[clamp(44px,7.2vw,92px)] text-foreground";
const h2 = "text-[clamp(36px,5.2vw,68px)] text-foreground";

export default function Home() {
  return (
    <>
      <Header sticky>
        <nav className="flex items-center gap-1 text-[15px]">
          {[["#how", "how it works"], ["#exports", "exports"], ["/pricing", "pricing"], ["/edits", "my edits"]].map(([href, t]) => (
            <a key={href} href={href} className="hidden min-h-11 items-center px-3 text-muted-foreground hover:text-foreground md:flex">{t}</a>
          ))}
          <Link href="/studio" className={btn.primary}>Start editing</Link>
        </nav>
      </Header>

      <main className="flex-1">
        {/* Hero */}
        <section className={`${wrap} pt-14 pb-24`}>
          <div className="flex flex-wrap justify-between gap-4 border-b border-border pb-4">
            <Label>(Smart podcast editing — v1.0)</Label>
            <Label>Renders on: GPU</Label>
            <Label>Exports: 5 formats</Label>
          </div>
          <h1 className={`${big} mt-10 max-w-[13ch]`}>
            Your conversation, re-cut for <span className="bg-highlight px-2">every screen.</span>
          </h1>
          <div className="mt-12 flex flex-wrap items-end justify-between gap-8">
            <p className="max-w-xl text-lg leading-relaxed">
              Upload the episode — one video or every camera. The edit follows whoever is talking, cuts to reactions, and leans in as a
              point builds. You get a vertical cut <em className="not-italic text-foreground">and the timeline to keep refining it.</em>
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/studio" className={btn.primary}>Start editing <ArrowUpRight size={14} /></Link>
              <a href="#how" className={btn.ghost}><ArrowDown size={14} /> See how it works</a>
            </div>
          </div>

          <div className="mt-16 border border-border bg-card p-4 sm:p-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative aspect-video flex-1 overflow-hidden bg-foreground">
                <Speaker className="left-[13%]" />
                <Speaker className="left-[67%]" />
                <span
                  aria-hidden
                  className="absolute top-0 h-full w-[31.6%] border-2 border-highlight"
                  style={{ animation: "reframe 9s ease-in-out infinite" }}
                />
                <Label className="absolute left-3 top-3 text-[#9FB8A6]">16:9 source</Label>
              </div>
              <div className="relative aspect-[9/16] w-[22%] overflow-hidden border-4 border-foreground bg-foreground">
                <Speaker className="left-1/2 -translate-x-1/2" width="80%" />
              </div>
            </div>
            <ShotStrip shots={DEMO_SHOTS} className="mt-5" />
            <div className="mt-2 flex justify-between">
              <Label>The first 77 seconds of a real edit</Label>
              <Label>0:00 — 1:17</Label>
            </div>
          </div>
        </section>

        {/* Statement */}
        <section className="border-y border-border bg-card py-24">
          <div className={`${wrap} flex flex-wrap gap-12`}>
            <Label n={1} className="w-40 shrink-0 self-start">Why it works</Label>
            <div className="min-w-[280px] flex-1">
              <h2 className={h2}>
                Follow
                <br />
                the voice.
              </h2>
              <p className="mt-10 max-w-3xl text-[clamp(22px,2.4vw,32px)] leading-snug tracking-[-0.03em] text-foreground">
                People decide whether to keep watching in the first seconds. The cut stays on <span className="bg-highlight px-1">whoever is talking</span>,
                shows the listener when it lands, and moves in as a point builds — <span className="text-muted-foreground">so the frame never feels like a static camera.</span>
              </p>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className={`${wrap} py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className={h2}>From raw footage<br />to a finished cut</h2>
            <Label n={2}>How it works</Label>
          </div>
          <ol className="mt-14 border-t border-foreground">
            {STEPS.map(([title, body], i) => (
              <li key={title} className="flex flex-wrap items-baseline gap-x-10 gap-y-3 border-b border-border py-8">
                <span className="label w-16 text-muted-foreground">({String(i + 1).padStart(2, "0")})</span>
                <h3 className="min-w-[220px] flex-1 text-[clamp(28px,3.4vw,44px)]">{title}</h3>
                <p className="min-w-[240px] max-w-md flex-1 leading-relaxed">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Controls */}
        <section id="controls" className={`${wrap} py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className={h2}>You set the feel.<br /><span className="text-muted-foreground">It does the cutting.</span></h2>
            <Label n={3}>Controls</Label>
          </div>
          <div className="mt-14 flex flex-wrap border border-border bg-card">
            <div className="flex min-w-[260px] flex-1 flex-wrap items-end justify-around gap-6 border-b border-border p-8 md:border-r md:border-b-0">
              {ASPECTS.map((a) => (
                <div key={a} className={`flex flex-col items-center ${a === "9:16" ? "text-foreground" : "text-muted-foreground"}`}>
                  <AspectShape aspect={a} className="origin-bottom scale-[2]" />
                  <span className="label mt-8">{a}</span>
                </div>
              ))}
            </div>
            <div className="min-w-[300px] flex-[2] divide-y divide-hairline">
              {(["layout", "reactions", "motion", "framing", "pace"] as const).map((k) => (
                <div key={k} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                  <span className="label text-muted-foreground">{k}</span>
                  <span className="flex flex-wrap gap-1.5">
                    {ENUMS[k].map((o) => (
                      <span key={o} className={`rounded-full border px-3 py-1 text-sm capitalize ${o === DEFAULTS[k] ? "border-foreground bg-foreground text-background" : "border-border"}`}>{o}</span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Multi-camera + numbers */}
        <section className="bg-foreground py-24 text-[#C9D3CC]">
          <div className={`${wrap}`}>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <h2 className="text-[clamp(36px,5.2vw,68px)] text-background">Bring every<br />angle.</h2>
              <Label n={4} className="text-[#9FB8A6]">Multi-camera</Label>
            </div>
            <div className="mt-14 flex flex-wrap gap-12">
              <div className="min-w-[280px] flex-[3] space-y-3">
                {[["Clean audio", 0], ["Camera 1", 4], ["Camera 2", 14], ["Camera 3", 8]].map(([name, offset]) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="label w-24 shrink-0 text-[#9FB8A6]">{name}</span>
                    <span className="relative h-8 flex-1 overflow-hidden border border-[#2B4238]">
                      <span className="absolute inset-y-0 flex items-center gap-[2px]" style={{ left: `${offset}%`, right: 0 }}>
                        {Array.from({ length: 48 }, (_, i) => (
                          <span key={i} className={`w-[3px] ${name === "Clean audio" ? "bg-highlight" : "bg-[#6F8F7C]"}`} style={{ height: `${20 + ((i * 37) % 70)}%` }} />
                        ))}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <ul className="min-w-[260px] flex-[2] divide-y divide-[#2B4238] border-y border-[#2B4238]">
                {[["99", "clips per edit, in any order"], ["Sync", "off when every camera started together"], ["1", "clean audio track becomes the soundtrack"]].map(([n, t]) => (
                  <li key={t} className="flex items-baseline gap-5 py-5">
                    <span className="w-20 shrink-0 text-[40px] font-medium leading-none tracking-[-0.05em] text-highlight">{n}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Exports */}
        <section id="exports" className={`${wrap} py-24`}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <h2 className={h2}>Finish it in<br />your editor.</h2>
            <Label n={5}>Exports</Label>
          </div>
          <ul className="mt-14 border-t border-foreground">
            {EXPORTS.map(([tag, name, desc], i) => (
              <li key={tag} className="flex flex-wrap items-center gap-x-10 gap-y-2 border-b border-border py-6">
                <span className="label w-16 text-muted-foreground">({String(i + 1).padStart(2, "0")})</span>
                <span className="min-w-[200px] flex-1 text-[clamp(22px,2.6vw,32px)] font-medium tracking-[-0.04em] text-foreground">{name}</span>
                <span className="min-w-[180px] flex-1 text-muted-foreground sm:max-w-56">{desc}</span>
                <span className="label w-20 text-right text-foreground">{tag}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section id="faq" className="border-t border-border bg-card py-24 pb-32">
          <div className={`${wrap} flex flex-wrap gap-12`}>
            <div className="min-w-[260px] flex-1">
              <Label n={6}>FAQ</Label>
              <h2 className={`${h2} mt-6`}>Before you<br />upload.</h2>
            </div>
            <div className="min-w-[300px] flex-[1.4] border-t border-foreground">
              {FAQ.map(([q, a]) => (
                <details key={q} className="group border-b border-border">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg font-medium tracking-[-0.02em] text-foreground">
                    {q}
                    <Plus size={18} className="shrink-0 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="max-w-2xl pb-6 leading-relaxed">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

function Speaker({ className, width = "20%" }: { className: string; width?: string }) {
  return (
    <span aria-hidden className={`absolute bottom-0 flex flex-col items-center ${className}`} style={{ width }}>
      <span className="aspect-square w-[46%] rounded-full bg-[#9FB8A6]" />
      <span className="mt-[6%] aspect-[2/1] w-full rounded-t-full bg-[#4F7A62]" />
    </span>
  );
}
