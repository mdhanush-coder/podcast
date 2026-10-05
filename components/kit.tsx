import Link from "next/link";
import { cn } from "@/lib/utils";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground";
const pill = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 font-mono text-[12px] uppercase tracking-[0.04em] transition-colors disabled:opacity-40";

export const btn = {
  primary: cn(pill, focus, "bg-foreground text-background hover:bg-[#1f3a2f]"),
  ghost: cn(pill, focus, "border border-foreground text-foreground hover:bg-foreground hover:text-background"),
  onDark: cn(pill, "bg-highlight text-foreground hover:bg-[#d4ff4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-highlight"),
};

export const card = "border border-border bg-card";
export const wrap = "mx-auto w-full max-w-[1280px] px-6";

export function Logo() {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2.5" aria-label="deepsoch podcast home">
      <span className="grid size-7 place-items-center bg-foreground">
        <span className="h-4 w-[9px] border-[1.5px] border-highlight" />
      </span>
      <span className="text-[17px] font-medium tracking-[-0.04em] text-foreground">deepsoch®</span>
      <span className="label text-muted-foreground">podcast</span>
    </Link>
  );
}

export function Header({ sticky, children }: { sticky?: boolean; children?: React.ReactNode }) {
  return (
    <header className={cn("border-b border-border", sticky ? "sticky top-0 z-20 bg-background/85 backdrop-blur-md" : "bg-background")}>
      <div className={cn(wrap, "flex h-16 items-center justify-between gap-4")}>
        <Logo />
        {children}
      </div>
    </header>
  );
}

// Small uppercase mono label with an optional (01)-style index, used above every section and field.
export function Label({ n, children, className }: { n?: number; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("label flex items-center gap-2 text-muted-foreground", className)}>
      {n != null && <span>({String(n).padStart(2, "0")})</span>}
      {children}
    </span>
  );
}

// Native radios give radiogroup semantics and arrow-key navigation for free.
export function Segmented<T extends string>({
  label, name, options, value, onChange,
}: { label: string; name: string; options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <fieldset>
      <legend className="label mb-2 text-muted-foreground">{label}</legend>
      <div className="flex border border-border">
        {options.map((o) => (
          <label
            key={o}
            className="flex min-h-10 flex-1 cursor-pointer items-center justify-center border-r border-border px-2 text-sm capitalize text-muted-foreground last:border-r-0 hover:text-foreground has-checked:bg-foreground has-checked:text-background has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-highlight"
          >
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function Switch({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4">
      <span>
        <span className="block font-medium text-foreground">{label}</span>
        {hint && <span className="block text-sm text-muted-foreground">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn(
          "relative h-6 w-11 shrink-0 cursor-pointer appearance-none rounded-full border border-foreground bg-transparent transition-colors before:absolute before:left-[3px] before:top-[3px] before:size-4 before:rounded-full before:bg-foreground before:transition-transform checked:bg-foreground checked:before:translate-x-5 checked:before:bg-highlight",
          focus,
        )}
      />
    </label>
  );
}

export function AspectShape({ aspect, className }: { aspect: string; className?: string }) {
  const [w, h] = aspect.split(":").map(Number);
  const s = 28 / Math.max(w, h);
  return <span className={cn("block border-[1.5px] border-current", className)} style={{ width: w * s, height: h * s }} />;
}

export function StatusPill({ state }: { state: "ready" | "editing" | "failed" }) {
  const map = {
    ready: ["bg-success-soft text-success", "Ready"],
    editing: ["bg-foreground text-highlight", "Editing"],
    failed: ["bg-destructive-soft text-destructive", "Didn't finish"],
  } as const;
  const [cls, text] = map[state];
  return (
    <span className={cn("label inline-flex items-center gap-2 rounded-full px-3 py-1.5", cls)}>
      <span className="size-1.5 rounded-full bg-current" style={state === "editing" ? { animation: "pulse-dot 1.4s ease-in-out infinite" } : undefined} />
      {text}
    </span>
  );
}

// Differ in lightness, not hue alone.
export const SHOT_COLORS: Record<string, string> = { wide: "#CFC8BA", single: "#10231C", reaction: "#9FB8A6", split: "#4F7A62" };

export function ShotStrip({ shots, className }: { shots: { kind: string; start: number; end: number }[]; className?: string }) {
  return (
    <div className={cn("flex h-8 gap-px overflow-hidden", className)}>
      {shots.map((s, i) => (
        <span
          key={i}
          title={`${s.kind} · ${fmt(s.start)}–${fmt(s.end)}`}
          style={{ flexGrow: Math.max(s.end - s.start, 0.01), background: SHOT_COLORS[s.kind] ?? SHOT_COLORS.wide }}
        />
      ))}
    </div>
  );
}

export const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;

const FOOTER_LINKS = [
  ["Product", [["/#how", "How it works"], ["/#controls", "Controls"], ["/#exports", "Exports"], ["/#faq", "FAQ"]]],
  ["Studio", [["/studio", "New edit"], ["/studio?footage=angles", "Multi-camera edit"]]],
  ["Exports to", [["/#exports", "Premiere Pro"], ["/#exports", "Final Cut Pro"], ["/#exports", "DaVinci Resolve"], ["/#exports", "Any editor (EDL)"]]],
] as const;

export function Footer() {
  return (
    <footer className="mt-auto bg-foreground text-[#C9D3CC]">
      <div className={cn(wrap, "pt-20 pb-8")}>
        <div className="flex flex-wrap justify-between gap-12">
          <div className="max-w-sm">
            <Label className="text-[#9FB8A6]">(Deepsoch podcast)</Label>
            <p className="mt-5 text-[28px] leading-tight font-medium tracking-[-0.04em] text-background">
              Your conversation, re-cut for every screen.
            </p>
            <Link href="/studio" className={cn(btn.onDark, "mt-8")}>Start editing ↗</Link>
          </div>
          <div className="flex flex-wrap gap-x-16 gap-y-10">
            {FOOTER_LINKS.map(([title, links]) => (
              <nav key={title} aria-label={title}>
                <Label className="text-[#9FB8A6]">{title}</Label>
                <ul className="mt-4">
                  {links.map(([href, text]) => (
                    <li key={text}>
                      <Link href={href} className="flex min-h-9 items-center hover:text-highlight">{text}</Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <p aria-hidden className="mt-20 text-[clamp(64px,17vw,236px)] leading-[0.8] font-medium tracking-[-0.07em] text-background select-none">
          deepsoch<span className="text-highlight">®</span>
        </p>
        <div className="mt-8 flex flex-wrap justify-between gap-4 border-t border-[#2B4238] pt-6">
          <Label className="text-[#9FB8A6]">© 2026 Deepsoch</Label>
          <Label className="text-[#9FB8A6]">Renders on GPU · Made for podcasts</Label>
        </div>
      </div>
    </footer>
  );
}
