import { useEffect, useRef, useState } from "react";
import { DRILL_PRAISE, DRILL_TARGETS } from "../data";
import { Reveal } from "../fx";

const ROUNDS = 5;
const WINDOW_MS = 2200;

type Phase = "idle" | "run" | "end";

export default function Drill() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [target, setTarget] = useState({ x: 46, y: 42, label: DRILL_TARGETS[0] });
  const [msg, setMsg] = useState<{ t: string; ok: boolean; id: number } | null>(null);
  const roundRef = useRef(0);
  const startRef = useRef(0);
  const timer = useRef(0);
  const advance = useRef(0);
  const locked = useRef(false);

  const cleanup = () => {
    window.clearTimeout(timer.current);
    window.clearTimeout(advance.current);
  };
  useEffect(() => cleanup, []);

  const spawn = (r: number) => {
    locked.current = false;
    roundRef.current = r;
    setRound(r);
    setTarget({
      x: 10 + Math.random() * 70,
      y: 16 + Math.random() * 60,
      label: DRILL_TARGETS[r % DRILL_TARGETS.length],
    });
    startRef.current = performance.now();
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => resolve(false, true), WINDOW_MS);
  };

  const resolve = (hit: boolean, timeout = false) => {
    if (locked.current) return;
    locked.current = true;
    window.clearTimeout(timer.current);
    if (hit) {
      const bonus = Math.max(0, Math.round((1 - (performance.now() - startRef.current) / WINDOW_MS) * 100));
      setScore((s) => s + 100 + bonus);
      setHits((v) => v + 1);
      setMsg({ t: `${DRILL_PRAISE[Math.floor(Math.random() * DRILL_PRAISE.length)]} +${100 + bonus}`, ok: true, id: Date.now() });
    } else {
      setMisses((v) => v + 1);
      setMsg({ t: timeout ? "too slow — frame expired" : "misclick — trace penalty", ok: false, id: Date.now() });
    }
    const next = roundRef.current + 1;
    window.clearTimeout(advance.current);
    if (next >= ROUNDS) advance.current = window.setTimeout(() => setPhase("end"), 620);
    else advance.current = window.setTimeout(() => spawn(next), 620);
  };

  const start = () => {
    cleanup();
    setScore(0);
    setHits(0);
    setMisses(0);
    setMsg(null);
    setPhase("run");
    spawn(0);
  };

  const acc = Math.round((hits / ROUNDS) * 100);
  const rating = acc >= 90 ? "SURGEON" : acc >= 70 ? "CALIBRATED" : acc >= 50 ? "DRIFTING" : "RECALIBRATE";

  return (
    <section id="drill" className="relative border-t border-line bg-ink2/50">
      <div className="mx-auto max-w-[1200px] px-5 py-20 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.32em] text-amber">{"// 04 · CALIBRATION DRILL"}</p>
              <h2 className="mt-4 font-disp text-3xl font-bold leading-[1.04] tracking-tight lg:text-[2.6rem]">
                Click like the
                <br />
                agent <span className="text-amber">clicks.</span>
              </h2>
              <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-mut">
                Five grounded elements, {WINDOW_MS / 1000} seconds each. The arena is your viewport;
                the chip is the element ref. Hit it before the frame expires — speed pays a bonus,
                misclicks cost you the trace.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 flex items-end gap-8">
                <div>
                  <p className="font-mono text-[10px] tracking-[0.26em] text-dim">SCORE</p>
                  <p className="font-disp text-5xl font-bold leading-none text-fog">
                    {score}
                    <span className="text-amber">.</span>
                  </p>
                </div>
                <div className="space-y-1.5 pb-1 font-mono text-[11px]">
                  <p className="text-mut">
                    HITS <span className="text-mint">{hits}</span> / {ROUNDS}
                  </p>
                  <p className="text-mut">
                    MISSES <span className="text-red">{misses}</span>
                  </p>
                  <p className="text-mut">
                    ROUND{" "}
                    <span className="text-amber">{phase === "run" ? Math.min(round + 1, ROUNDS) : phase === "end" ? ROUNDS : "—"}</span>{" "}
                    / {ROUNDS}
                  </p>
                </div>
              </div>
              {phase !== "run" && (
                <button
                  onClick={start}
                  className="mt-8 border border-amber bg-amber px-6 py-2.5 font-mono text-[12px] font-semibold tracking-[0.22em] text-ink transition-all hover:bg-transparent hover:text-amber"
                >
                  {phase === "end" ? "RUN IT BACK ↻" : "START DRILL ▸"}
                </button>
              )}
            </Reveal>
          </div>

          {/* arena */}
          <div className="lg:col-span-7">
            <Reveal delay={100}>
              <div className="relative h-[340px] overflow-hidden border border-line bg-ink sm:h-[400px]">
                <div className="gridlines absolute inset-0 opacity-70" />
                <div className="absolute left-3 top-3 font-mono text-[9.5px] tracking-[0.22em] text-dim">
                  VIEWPORT · 1512×982
                </div>
                <div className="absolute right-3 top-3 font-mono text-[9.5px] tracking-[0.22em] text-dim">
                  {phase === "run" ? `ELEMENT ${round + 1}/${ROUNDS}` : "STANDBY"}
                </div>

                {/* crosshair following nothing — ambient */}
                <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.13]">
                  <line x1="50" y1="0" x2="50" y2="100" stroke="#5bc9ff" strokeWidth="0.2" strokeDasharray="1.5 2.5" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="#5bc9ff" strokeWidth="0.2" strokeDasharray="1.5 2.5" />
                  <circle cx="50" cy="50" r="16" fill="none" stroke="#5bc9ff" strokeWidth="0.25" strokeDasharray="2 3" />
                </svg>

                {phase === "run" && (
                  <>
                    <div key={round} className="drain absolute left-0 top-0 h-[3px] bg-amber" />
                    <button
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        resolve(true);
                      }}
                      key={`t-${round}`}
                      className="fadeup absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-crosshair border border-amber bg-ink px-3.5 py-2 font-mono text-[11px] font-semibold tracking-[0.14em] text-amber shadow-[0_0_24px_rgba(255,178,36,0.28)] transition-transform hover:scale-110"
                      style={{ left: `${target.x}%`, top: `${target.y}%` }}
                    >
                      <span className="absolute -left-1 -top-1 h-2 w-2 border-l border-t border-amber" />
                      <span className="absolute -right-1 -top-1 h-2 w-2 border-r border-t border-amber" />
                      <span className="absolute -bottom-1 -left-1 h-2 w-2 border-b border-l border-amber" />
                      <span className="absolute -bottom-1 -right-1 h-2 w-2 border-b border-r border-amber" />
                      {target.label}
                    </button>
                    <div
                      className="absolute inset-0 z-0"
                      onPointerDown={() => resolve(false)}
                    />
                  </>
                )}

                {msg && phase !== "idle" && (
                  <p
                    key={msg.id}
                    className={`fadeup pointer-events-none absolute inset-x-0 bottom-4 z-20 text-center font-mono text-[11px] tracking-[0.18em] ${
                      msg.ok ? "text-mint" : "text-red"
                    }`}
                  >
                    {msg.t}
                  </p>
                )}

                {phase === "idle" && (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="border border-line bg-panel/90 px-8 py-6 text-center">
                      <svg viewBox="0 0 24 24" className="mx-auto h-8 w-8">
                        <path d="M4 2l16 8.2-7.1 1.9L9.5 19z" fill="none" stroke="#ffb224" strokeWidth="1.4" />
                      </svg>
                      <p className="mt-3 font-mono text-[11px] tracking-[0.24em] text-mut">CURSOR COLD</p>
                      <p className="mt-1 text-[12px] text-dim">start the drill to ground your first element</p>
                    </div>
                  </div>
                )}

                {phase === "end" && (
                  <div className="absolute inset-0 z-30 grid place-items-center bg-ink/85 backdrop-blur-[2px]">
                    <div className="fadeup text-center">
                      <p className="font-mono text-[10px] tracking-[0.3em] text-dim">DRILL COMPLETE</p>
                      <p className="mt-2 font-disp text-5xl font-bold text-fog">
                        {acc}
                        <span className="text-2xl text-amber">%</span>
                      </p>
                      <p className={`mt-2 font-disp text-xl font-bold tracking-[0.28em] ${acc >= 70 ? "text-mint" : acc >= 50 ? "text-amber" : "text-red"}`}>
                        {rating}
                      </p>
                      <p className="mt-1 font-mono text-[10.5px] text-dim">
                        {score} pts · {hits}/{ROUNDS} grounded
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
