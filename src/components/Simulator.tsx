import { useEffect, useMemo, useRef, useState } from "react";
import { CODE_LINES, SIDEBAR_FILES, STEPS, TERM_LINES } from "../data";
import { Scramble, useReducedMotion } from "../fx";

const SPEEDS = [1, 1.5, 2, 0.5];
const SPEED_LABEL = ["1×", "1.5×", "2×", "½×"];
const LAST = STEPS.length - 1;
const IDLE_CURSOR: [number, number] = [86, 12];

const GROUND_BOXES = [
  { id: "e1", x: 17.5, y: 6.6, w: 13, h: 5.8, th: 0.12 },
  { id: "e2", x: 2, y: 71, w: 96, h: 26, th: 0.4 },
  { id: "e3", x: 18, y: 46, w: 56, h: 5.2, th: 0.68 },
];

type Entry = { k: number; type: "thought" | "tool" | "log"; text: string; ts: string };

export default function Walkthrough() {
  const reduced = useReducedMotion();
  const [step, setStep] = useState(0);
  const [prog, setProg] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [nonce, setNonce] = useState(0);
  const elapsed = useRef(0);
  const oneShot = useRef(false);
  const streamRef = useRef<HTMLDivElement>(null);

  const speed = SPEEDS[speedIdx];
  const st = STEPS[step];
  const done = step === LAST && prog >= 1;

  const go = (n: number, opts?: { single?: boolean }) => {
    const c = Math.max(0, Math.min(LAST, n));
    elapsed.current = 0;
    oneShot.current = !!opts?.single && !playing;
    setProg(0);
    setStep(c);
    setNonce((x) => x + 1);
  };
  const restart = () => {
    oneShot.current = false;
    go(0);
    setPlaying(true);
  };
  const toggle = () => {
    if (done) {
      restart();
      return;
    }
    setPlaying((p) => !p);
  };

  /* ---------------- playback loop ---------------- */
  useEffect(() => {
    const d = st.duration / speed;
    if (reduced) {
      elapsed.current = d;
      oneShot.current = false;
      setProg(1);
      if (playing) {
        if (step < LAST) {
          const t = window.setTimeout(() => go(step + 1), 420);
          return () => window.clearTimeout(t);
        }
        setPlaying(false);
      }
      return;
    }
    if (!playing && !oneShot.current) return; // paused: freeze the frame
    let raf = 0;
    let lastT = performance.now();
    const tick = (t: number) => {
      elapsed.current += t - lastT;
      lastT = t;
      const p = Math.min(1, elapsed.current / d);
      setProg(p);
      if (p >= 1) {
        if (playing) {
          if (step < LAST) {
            elapsed.current = 0;
            setProg(0);
            setStep(step + 1);
          } else setPlaying(false);
        } else {
          oneShot.current = false; // single step finished — hold the frame
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, step, speed, nonce, reduced]);

  /* ---------------- keyboard ---------------- */
  const api = useRef({
    toggle,
    next: () => go(step + 1, { single: true }),
    prev: () => go(step - 1, { single: true }),
    restart,
  });
  api.current = {
    toggle,
    next: () => go(step + 1, { single: true }),
    prev: () => go(step - 1, { single: true }),
    restart,
  };
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "BUTTON" || tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        api.current.toggle();
      } else if (e.code === "ArrowRight") api.current.next();
      else if (e.code === "ArrowLeft") api.current.prev();
      else if (e.code === "KeyR") api.current.restart();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  /* ---------------- derived scene ---------------- */
  const cursor = useMemo(() => {
    let c = IDLE_CURSOR;
    for (let i = 0; i <= step; i++) if (STEPS[i].cursor) c = STEPS[i].cursor!;
    return c;
  }, [step]);

  const editState =
    step < 5 ? "broken" : step === 5 ? (prog < 0.3 ? "select" : prog < 0.62 ? "t1" : "t2") : "fixed";

  const visibleTerm = TERM_LINES.filter(
    (l) => l.at < step || (l.at === step && (l.p === undefined || prog >= l.p))
  );

  const entries = useMemo(() => {
    const list: Entry[] = [];
    for (let k = 0; k <= step; k++) {
      const s = STEPS[k];
      const cur = k === step;
      const gate = (p: number) => !cur || prog >= p;
      const ts = `${(k * 3.9 + 1.2).toFixed(1)}s`;
      if (s.thought && gate(0.04)) list.push({ k, type: "thought", text: s.thought, ts });
      if (gate(0.22))
        list.push({ k, type: "tool", text: s.payload ? `${s.tool} ${s.payload}` : `${s.tool}()`, ts });
      s.logs.forEach((l, i) => {
        if (gate(0.42 + i * 0.16)) list.push({ k, type: "log", text: l, ts });
      });
    }
    return list;
  }, [step, prog]);

  useEffect(() => {
    const el = streamRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries.length, step]);

  const status = done
    ? { txt: "SEALED", cls: "text-mint", dot: "bg-mint" }
    : playing
      ? { txt: "REPLAYING", cls: "text-red", dot: "bg-red pulsedot" }
      : { txt: "HOLD", cls: "text-amber", dot: "bg-amber" };

  const lineTop = (n: number) => 13 + (n - 1) * 4.75;

  return (
    <section id="walkthrough" className="relative mx-auto max-w-[1200px] px-5 pt-28 pb-14 lg:px-8">
      {/* ---------- heading ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] tracking-[0.32em] text-amber">
            {"// SKILL WALKTHROUGH · CU-01 · ANTIGRAVITY-STYLE REPLAY"}
          </p>
          <h1 className="mt-4 font-disp text-[clamp(2.7rem,7vw,5.1rem)] font-bold leading-[0.95] tracking-tight">
            <Scramble text="COMPUTER USE" />
            <span className="mt-2 block text-[clamp(1.05rem,2.3vw,1.6rem)] font-medium tracking-normal text-mut">
              teaching a coding agent to{" "}
              <span className="text-fog underline decoration-amber decoration-2 underline-offset-4">
                walk your screen
              </span>
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-mut">
            This is the replay of <span className="font-mono text-[13px] text-cy">run_9f31</span> — one
            sealed trace where the agent observes a failing test, grounds the interface, makes a
            one-line fix and verifies it in green. Scrub it, step it, break it.
          </p>
        </div>
        <div className="w-full max-w-[240px] border border-line bg-panel font-mono text-[10.5px]">
          {[
            ["SKILL", "computer-use v0.9.2"],
            ["TRACE", "9F31·C2 · sealed"],
            ["WALL", "00:47"],
            ["TOKENS", "3.4k"],
            ["RESULT", "PASS", "text-mint"],
          ].map(([k, v, cls]) => (
            <div key={k as string} className="flex items-center justify-between border-b border-line px-3 py-2 last:border-b-0">
              <span className="text-dim">{k}</span>
              <span className={cls ?? "text-fog"}>{v}</span>
            </div>
          ))}
          <svg viewBox="0 0 240 44" className="block h-11 w-full border-t border-line">
            <path
              d="M8 34 C 60 34, 70 10, 120 12 S 200 30, 232 10"
              fill="none"
              stroke="#ffb224"
              strokeWidth="1.5"
              strokeDasharray="5 8"
              className="dashmove"
            />
            <circle cx="232" cy="10" r="3" fill="#3ddc97" />
          </svg>
        </div>
      </div>

      {/* ---------- briefing strip ---------- */}
      <div className="mt-10 grid items-center gap-4 border border-line bg-panel px-4 py-3.5 md:grid-cols-[auto_1fr_auto]">
        <div className="flex items-center gap-3">
          <span className="border border-amber/60 bg-amber/10 px-2.5 py-1 font-mono text-xs font-semibold tracking-[0.18em] text-amber">
            TASK-014
          </span>
          <div>
            <p className="font-disp text-[17px] font-bold leading-tight">Fix the failing assertion in main.py</p>
            <p className="font-mono text-[10px] text-dim">replay of run_9f31 · sealed at 00:47 · evidence attached</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 md:justify-center">
          {[
            ["DIFFICULTY", "LOW", "border-mint/50 text-mint"],
            ["BUDGET", "≤ 12 ACT", "border-line2 text-mut"],
            ["TOOLS", "computer · vision · terminal", "border-line2 text-mut"],
            ["ENV", "sandboxed-vm", "border-cy/50 text-cy"],
          ].map(([k, v, c]) => (
            <span key={k} className={`border bg-ink px-2 py-1 font-mono text-[9.5px] tracking-wider ${c}`}>
              {k}: <span className="text-fog">{v}</span>
            </span>
          ))}
        </div>
        <div className="hidden font-mono text-[10px] text-dim md:block">
          <span className={`mr-1.5 inline-block h-1.5 w-1.5 ${status.dot}`} />
          {status.txt}
        </div>
      </div>

      {/* ---------- simulator grid ---------- */}
      <div className="mt-4 grid gap-4 lg:grid-cols-12">
        {/* viewport */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between border border-b-0 border-line bg-panel2 px-3 py-2">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em]">
              <span className={`h-2 w-2 rounded-full ${status.dot}`} />
              <span className={status.cls}>{status.txt}</span>
            </div>
            <span className="hidden font-mono text-[10px] text-dim sm:block">AGENT VIEWPORT — SANDBOXED-VM</span>
            <span className="font-mono text-[10px] text-dim">1512×982 · png</span>
          </div>

          <div className="relative aspect-[16/11] select-none overflow-hidden border border-line bg-ink2">
            {/* window chrome */}
            <div className="absolute inset-0 flex flex-col">
              {/* title bar */}
              <div className="flex h-[6%] items-center gap-1.5 border-b border-line bg-panel px-2.5">
                <span className="h-[7px] w-[7px] rounded-full bg-red/80" />
                <span className="h-[7px] w-[7px] rounded-full bg-amber/80" />
                <span className="h-[7px] w-[7px] rounded-full bg-mint/80" />
                <span className="mx-auto font-mono text-[9px] tracking-widest text-dim">
                  main.py — agent-sandbox
                </span>
                {(step === 6 ? prog > 0.45 : step > 6) && (
                  <span key="saved" className="fadeup font-mono text-[8.5px] text-mint">
                    ● saved
                  </span>
                )}
                <span className="border border-line px-1.5 py-px font-mono text-[8.5px] text-dim">zsh</span>
              </div>

              {/* toolbar */}
              <div className="relative flex h-[7%] items-center gap-2 border-b border-line bg-panel px-2">
                <button
                  tabIndex={-1}
                  className={`flex h-[68%] items-center gap-1.5 border border-mint/60 bg-mint/10 px-2.5 font-mono text-[9px] tracking-wider text-mint ${
                    step === 7 && prog > 0.5 && prog < 0.85 ? "scale-95 bg-mint/30" : ""
                  }`}
                >
                  <svg viewBox="0 0 8 8" className="h-2 w-2 fill-mint">
                    <path d="M1 0l7 4-7 4z" />
                  </svg>
                  RUN TESTS
                </button>
                <span className="border border-line px-2 py-0.5 font-mono text-[8.5px] text-dim">FORMAT</span>
                <span className="border border-line px-2 py-0.5 font-mono text-[8.5px] text-dim">COMMIT</span>
                <span className="ml-auto font-mono text-[8.5px] text-dim">pytest 8.1 · py312</span>
              </div>

              {/* body */}
              <div className="flex min-h-0 flex-1">
                {/* sidebar */}
                <div className="hidden w-[17%] flex-col border-r border-line bg-panel/60 px-2 pt-2 sm:flex">
                  <p className="font-mono text-[8px] tracking-[0.25em] text-dim">EXPLORER</p>
                  <p className="mt-1.5 font-mono text-[9px] text-mut">▾ src/</p>
                  {SIDEBAR_FILES.map((f) => (
                    <p
                      key={f.name}
                      className={`pl-2.5 font-mono text-[9.5px] leading-[1.9] ${
                        f.active ? "bg-amber/10 text-amber" : "text-dim"
                      }`}
                    >
                      {f.name}
                    </p>
                  ))}
                  <p className="mt-auto pb-1.5 font-mono text-[8px] text-dim">4 files · git:clean</p>
                </div>

                {/* code */}
                <div className="relative min-w-0 flex-1">
                  {CODE_LINES.map((l) => {
                    const is8 = l.n === 8;
                    return (
                      <div
                        key={l.n}
                        className={`absolute left-0 right-0 flex items-center font-mono text-[10px] sm:text-[10.5px] ${
                          is8
                            ? editState === "fixed" || editState === "t2"
                              ? "border-l-2 border-mint bg-mint/10"
                              : "border-l-2 border-red bg-red/10"
                            : ""
                        }`}
                        style={{ top: `${((lineTop(l.n) - 13) / 57) * 100}%`, height: `${(4.75 / 57) * 100}%` }}
                      >
                        <span className="w-[11%] pr-2 text-right text-[9px] text-dim">{l.n}</span>
                        <span className={l.ind ? "pl-5" : ""}>
                          {is8 ? (
                            <>
                              <span className="text-fog/90">assert add(20, 21) == </span>
                              {editState === "broken" && (
                                <span className="text-red underline decoration-red/70 decoration-wavy underline-offset-2">
                                  41
                                </span>
                              )}
                              {editState === "select" && (
                                <span className="bg-mint/25 px-px text-mint outline outline-1 outline-mint/70">41</span>
                              )}
                              {(editState === "t1" || editState === "t2") && (
                                <>
                                  <span className="text-mint">{editState === "t1" ? "4" : "42"}</span>
                                  <span className="caret text-mint">▍</span>
                                </>
                              )}
                              {editState === "fixed" && <span className="text-mint">42</span>}
                            </>
                          ) : (
                            <span className={l.t.startsWith("#") ? "text-dim" : "text-fog/80"}>{l.t}</span>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* terminal */}
              <div className="flex h-[30%] flex-col border-t border-line bg-ink">
                <div className="flex items-center justify-between border-b border-line bg-panel px-2.5 py-1">
                  <span className="font-mono text-[8.5px] tracking-[0.2em] text-dim">TERMINAL · zsh — pytest</span>
                  <span
                    className={`font-mono text-[8.5px] ${
                      step >= 9 ? "text-mint" : "text-red"
                    }`}
                  >
                    {step >= 9 ? "exit 0" : "exit 1"}
                  </span>
                </div>
                <div className="scrolly min-h-0 flex-1 overflow-y-auto px-2.5 py-1.5 font-mono text-[9.5px] leading-[1.75] sm:text-[10.5px]">
                  {visibleTerm.map((l, i) => {
                    const col =
                      l.c === "red"
                        ? "text-red"
                        : l.c === "mint"
                          ? "text-mint"
                          : l.c === "amber"
                            ? "text-amber"
                            : l.c === "mut"
                              ? "text-dim"
                              : "text-fog/85";
                    const emph = l.emph && step === 3 && prog > 0.25;
                    return (
                      <p key={i} className={`${col} ${emph ? "bg-amber/10 outline outline-1 outline-amber/60" : ""}`}>
                        {l.t}
                      </p>
                    );
                  })}
                  {step === 8 && (
                    <p className="text-amber">
                      {["·", "··", "···"][Math.min(2, Math.floor(prog * 3.6))]} running
                    </p>
                  )}
                  {done && <p className="text-dim">— trace sealed, pane released —</p>}
                </div>
              </div>
            </div>

            {/* grounding boxes */}
            {step >= 1 &&
              GROUND_BOXES.map((b) => {
                const show = step > 1 || prog >= b.th;
                if (!show) return null;
                return (
                  <div
                    key={b.id}
                    className={`ground-in pointer-events-none absolute z-10 border border-dashed border-amber ${
                      step === 1 ? "" : "opacity-35"
                    }`}
                    style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}
                  >
                    <span className="absolute -top-2.5 left-1 border border-amber/60 bg-ink px-1 font-mono text-[8.5px] leading-tight text-amber">
                      {b.id}
                    </span>
                  </div>
                );
              })}

            {/* screenshot fx */}
            {(st.kind === "screenshot" || st.kind === "verify") && (
              <div key={`shot-${step}`} className="pointer-events-none absolute inset-0 z-20">
                <div className="shot-flash absolute inset-0 bg-fog/70" />
                <div className="shot-frame absolute inset-[3%] border-2 border-dashed border-cy" />
              </div>
            )}

            {/* click ripple */}
            {st.kind === "click" && prog > 0.68 && (
              <span
                key={`rip-${step}`}
                className="ripple pointer-events-none absolute z-20 h-10 w-10 rounded-full border-2 border-amber"
                style={{ left: `${cursor[0]}%`, top: `${cursor[1]}%` }}
              />
            )}

            {/* cursor */}
            <div
              className="pointer-events-none absolute z-30"
              style={{
                left: `${cursor[0]}%`,
                top: `${cursor[1]}%`,
                transition: reduced ? "none" : "left 0.95s cubic-bezier(0.22,0.9,0.26,1), top 0.95s cubic-bezier(0.22,0.9,0.26,1)",
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 -translate-x-1 -translate-y-1 drop-shadow-[0_2px_6px_rgba(255,178,36,0.45)]"
              >
                <path d="M4 2l16 8.2-7.1 1.9L9.5 19z" fill="#ffb224" stroke="#0b1120" strokeWidth="1.2" />
              </svg>
            </div>

            {/* verified stamp */}
            {step === LAST && prog > 0.4 && (
              <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
                <div className="stamp text-center">
                  <div className="inline-block border-[3px] border-mint bg-ink/80 px-7 py-2.5 font-disp text-xl font-bold tracking-[0.22em] text-mint sm:text-2xl">
                    TASK VERIFIED
                  </div>
                  <p className="mt-2 font-mono text-[9.5px] tracking-[0.25em] text-mint/80">
                    TRACE SEALED · 9F31C2 · DIFF 1 LINE
                  </p>
                </div>
              </div>
            )}

            {/* summary chip */}
            {step === LAST && prog > 0.68 && (
              <div className="fadeup absolute bottom-[3%] right-[2.5%] z-20 border border-line bg-panel/95 px-3 py-2 font-mono text-[9.5px] leading-relaxed text-mut">
                <p className="text-fog">9 actions · 47.2s · 3.4k tok</p>
                <p className="text-mint">✓ evidence: 12 frames + diff</p>
              </div>
            )}
          </div>
        </div>

        {/* trace stream */}
        <div className="flex flex-col lg:col-span-4">
          <div className="flex items-center justify-between border border-b-0 border-line bg-panel2 px-3 py-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-mut">AGENT TRACE</span>
            <span className="border border-line px-1.5 py-px font-mono text-[9.5px] text-dim">
              {entries.length} events
            </span>
          </div>
          <div
            ref={streamRef}
            className="scrolly h-[340px] min-h-0 flex-1 space-y-2 overflow-y-auto border border-line bg-panel p-3 lg:h-auto"
          >
            {entries.map((e, i) => (
              <div key={`${e.k}-${e.type}-${i}-${e.text.slice(0, 12)}`} className="fadeup grid grid-cols-[42px_1fr] gap-2">
                <span className="pt-px font-mono text-[9px] text-dim">{e.ts}</span>
                {e.type === "thought" && (
                  <p className="text-[11.5px] italic leading-snug text-amber/95">
                    <span className="mr-1.5 font-mono text-[8.5px] not-italic tracking-widest text-amber/60">THINK</span>
                    {e.text}
                  </p>
                )}
                {e.type === "tool" && (
                  <p className="break-all font-mono text-[10.5px] leading-snug text-cy">{e.text}</p>
                )}
                {e.type === "log" && (
                  <p className="break-all font-mono text-[10.5px] leading-snug text-mut">
                    <span className="mr-1.5 text-dim">·</span>
                    {e.text}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border border-t-0 border-line bg-panel2 px-3 py-1.5 font-mono text-[9px] text-dim">
            <span>trace 9f31·c2</span>
            <span>format v3</span>
          </div>
        </div>
      </div>

      {/* ---------- transport controls ---------- */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border border-line bg-panel px-3 py-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={restart}
            title="Restart (R)"
            className="grid h-9 w-9 place-items-center border border-line text-mut transition-colors hover:border-amber hover:text-amber"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5a7 7 0 1 1-6.4 4.2" />
              <path d="M5 4v5h5" />
            </svg>
          </button>
          <button
            onClick={() => go(step - 1, { single: true })}
            title="Previous step (←)"
            className="grid h-9 w-9 place-items-center border border-line text-mut transition-colors hover:border-amber hover:text-amber"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M6 5h2.4v14H6zM19 5l-9.5 7L19 19z" />
            </svg>
          </button>
          <button
            onClick={toggle}
            title="Play / pause (Space)"
            className="grid h-9 w-12 place-items-center border border-amber/70 bg-amber/10 text-amber transition-colors hover:bg-amber/20"
          >
            {playing && !done ? (
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M6 4l14 8-14 8z" />
              </svg>
            )}
          </button>
          <button
            onClick={() => go(step + 1, { single: true })}
            title="Next step (→)"
            className="grid h-9 w-9 place-items-center border border-line text-mut transition-colors hover:border-amber hover:text-amber"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
              <path d="M15.6 5H18v14h-2.4zM5 5l9.5 7L5 19z" />
            </svg>
          </button>
        </div>

        <button
          onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
          title="Playback speed"
          className="h-9 border border-line px-3 font-mono text-xs text-mut transition-colors hover:border-cy hover:text-cy"
        >
          {SPEED_LABEL[speedIdx]}
        </button>

        {/* scrubber */}
        <div className="flex h-9 min-w-[200px] flex-1 items-stretch gap-[3px]">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => go(i, { single: true })}
              title={`${i + 1}. ${s.title}`}
              className="group relative flex-1 overflow-hidden border border-line/70 bg-line/40 transition-colors hover:border-line2"
            >
              <span
                className={`absolute inset-y-0 left-0 ${i < step ? "w-full bg-amber/80" : "bg-amber"} transition-[width] duration-150 ease-linear`}
                style={{ width: i < step ? "100%" : i === step ? `${prog * 100}%` : "0%" }}
              />
            </button>
          ))}
        </div>

        <span className="font-mono text-[11px] tracking-[0.18em] text-mut">
          STEP <span className="text-amber">{String(step + 1).padStart(2, "0")}</span> / {STEPS.length}
        </span>
      </div>

      {/* narration */}
      <div className="mt-3 flex items-start gap-3 border border-line bg-ink2 px-4 py-3">
        <span className="mt-0.5 shrink-0 border border-amber/60 px-2 py-0.5 font-mono text-[9.5px] tracking-[0.18em] text-amber">
          {st.title}
        </span>
        <p key={step} className="fadeup text-[13.5px] leading-relaxed text-mut">
          {st.narration}
          <span className="caret ml-1 text-amber">▍</span>
        </p>
      </div>

      <p className="mt-3 font-mono text-[10px] tracking-wider text-dim">
        <span className="kbd">SPACE</span> play/pause <span className="mx-2 text-line2">·</span>
        <span className="kbd">←</span> <span className="kbd">→</span> step{" "}
        <span className="mx-2 text-line2">·</span>
        <span className="kbd">R</span> restart
      </p>
    </section>
  );
}
