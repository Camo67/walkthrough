import { TICKER } from "../data";

const NAV = [
  ["#walkthrough", "WALKTHROUGH"],
  ["#skill", "SKILL FILE"],
  ["#actions", "ACTIONS"],
  ["#policy", "GUARDRAILS"],
  ["#drill", "DRILL"],
] as const;

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-8">
        <a href="#walkthrough" className="group flex items-center gap-2.5">
          <svg viewBox="0 0 26 26" className="h-6 w-6">
            <path d="M2 2h7M2 2v7M24 2h-7M24 2v7M2 24h7M2 24v-7M24 24h-7M24 24v-7" stroke="#5bc9ff" strokeWidth="1.6" fill="none" />
            <path d="M8 7l11 5.6-4.9 1.3-2.3 4.6z" fill="#ffb224" stroke="#0b1120" strokeWidth="0.8" />
          </svg>
          <span className="font-disp text-[15px] font-bold tracking-tight">
            computer<span className="text-amber">·</span>use
          </span>
          <span className="hidden border border-line px-1.5 py-px font-mono text-[9px] tracking-[0.2em] text-dim sm:inline">
            SKILL v0.9.2
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="navlink font-mono text-[10.5px] tracking-[0.22em] text-mut transition-colors hover:text-fog"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.15em] text-dim">
          <span className="pulsedot h-1.5 w-1.5 rounded-full bg-red" />
          <span className="hidden sm:inline">TRACE 9F31·C2</span>
          <span className="border border-amber/50 bg-amber/10 px-1.5 py-px text-amber">REPLAY</span>
        </div>
      </div>
    </header>
  );
}

export function Ticker() {
  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center">
      {TICKER.map((t) => (
        <span key={`${key}-${t}`} className="flex items-center font-mono text-[11px] tracking-[0.3em] text-dim">
          <span className="px-5 text-amber/70">▸</span>
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <div className="tickerwrap overflow-hidden border-y border-line bg-ink2 py-2.5">
      <div className="ticker flex w-max">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-ink2/60">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-disp text-lg font-bold">
            computer<span className="text-amber">·</span>use
          </p>
          <p className="mt-2 max-w-xs text-[12.5px] leading-relaxed text-dim">
            A skill walkthrough for coding agents that must earn their pixels: observe, ground, act,
            verify — and leave a trace a human can audit.
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-dim">SHORTCUTS</p>
          <ul className="mt-3 space-y-2 font-mono text-[11px] text-mut">
            <li>
              <span className="kbd">SPACE</span> play / pause the replay
            </li>
            <li>
              <span className="kbd">←</span> <span className="kbd">→</span> step the trace
            </li>
            <li>
              <span className="kbd">R</span> restart from frame zero
            </li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.28em] text-dim">COLOPHON</p>
          <ul className="mt-3 space-y-1.5 font-mono text-[11px] text-dim">
            <li>trace format v3 · schema 2020-12</li>
            <li>set in Space Grotesk & IBM Plex</li>
            <li>rendered for humans & agents alike</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center font-mono text-[10px] tracking-[0.2em] text-dim">
        NO PIXELS WERE HARMED — EVERY ACTION IN THIS TRACE WAS CONSENTED TO BY A SANDBOX
      </div>
    </footer>
  );
}
