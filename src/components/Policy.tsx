import { useState } from "react";
import { RUBRIC, RULE_GROUPS, RUNS } from "../data";
import { Reveal } from "../fx";

const TONE_TEXT = { mint: "text-mint", amber: "text-amber", red: "text-red", cy: "text-cy" } as const;
const TONE_CHIP = {
  mint: "border-mint/50 bg-mint/10 text-mint",
  amber: "border-amber/50 bg-amber/10 text-amber",
  red: "border-red/50 bg-red/10 text-red",
} as const;
const KNOB = { mint: "bg-mint", amber: "bg-amber", red: "bg-red" } as const;

export default function Policy() {
  const [groups, setGroups] = useState(() =>
    RULE_GROUPS.map((g) => ({ ...g, rules: g.rules.map((r) => ({ ...r })) }))
  );

  const toggle = (gi: number, ri: number) =>
    setGroups((gs) =>
      gs.map((g, i) =>
        i !== gi ? g : { ...g, rules: g.rules.map((r, j) => (j === ri ? { ...r, on: !r.on } : r)) }
      )
    );

  const bits = groups.flatMap((g) => g.rules.map((r) => (r.on ? "1" : "0"))).join("");
  let h = 0x9f31;
  for (const b of bits) h = (h * 31 + b.charCodeAt(0)) >>> 0;
  const hash = "0x" + h.toString(16).padStart(8, "0");

  const resCls = { PASS: "border-mint/60 text-mint", FAIL: "border-red/60 text-red", PARTIAL: "border-amber/60 text-amber" };

  return (
    <section id="policy" className="relative mx-auto max-w-[1200px] px-5 py-20 lg:px-8">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.32em] text-amber">{"// 03 · GUARDRAILS & SCORING"}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <h2 className="max-w-xl font-disp text-3xl font-bold leading-[1.04] tracking-tight lg:text-[2.6rem]">
            The cage that makes the hands <span className="text-amber">trustworthy.</span>
          </h2>
          <p className="max-w-sm text-[13.5px] leading-relaxed text-dim">
            Flip a rule and watch the policy hash change — in the real runtime, any change re-seals
            every open trace.
          </p>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        {/* rule ledger */}
        <Reveal delay={80}>
          <div className="border border-line bg-panel">
            <div className="flex items-center justify-between border-b border-line bg-panel2 px-4 py-2.5">
              <span className="font-mono text-[10px] tracking-[0.24em] text-mut">RUNTIME POLICY — LIVE</span>
              <span className="font-mono text-[10px] text-cy">{hash}</span>
            </div>
            <div className="divide-y divide-line">
              {groups.map((g, gi) => (
                <div key={g.label} className="px-4 py-4">
                  <p className={`font-mono text-[10px] tracking-[0.26em] ${TONE_TEXT[g.tone]}`}>{g.label}</p>
                  <ul className="mt-3 space-y-2.5">
                    {g.rules.map((r, ri) => (
                      <li key={r.text} className="flex items-center justify-between gap-4">
                        <span className={`text-[13px] ${r.on ? "text-fog/90" : "text-dim line-through decoration-dim/60"}`}>
                          {r.text}
                        </span>
                        <button
                          role="switch"
                          aria-checked={r.on}
                          onClick={() => toggle(gi, ri)}
                          className={`relative h-5 w-10 shrink-0 border transition-colors ${
                            r.on ? `${TONE_CHIP[g.tone]}` : "border-line2 bg-ink"
                          }`}
                        >
                          <span
                            className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 transition-all duration-200 ${
                              r.on ? `left-[22px] ${KNOB[g.tone]}` : "left-[3px] bg-dim"
                            }`}
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="border-t border-line bg-panel2 px-4 py-2 font-mono text-[9.5px] tracking-wider text-dim">
              on violation → freeze cursor · snapshot · SECURITY event · halt
            </p>
          </div>
        </Reveal>

        {/* scoring */}
        <div className="flex flex-col gap-4">
          <Reveal delay={140}>
            <div className="border border-line bg-panel p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-[0.24em] text-mut">RUBRIC — TRAILING 100 TRACES</span>
                <span className="border border-mint/50 bg-mint/10 px-2 py-px font-mono text-[10px] text-mint">
                  Ø 0.91 · bar 0.80
                </span>
              </div>
              <div className="mt-5 space-y-4">
                {RUBRIC.map((m, i) => (
                  <div key={m.label} className="meter">
                    <div className="mb-1.5 flex items-baseline justify-between">
                      <span className="text-[12.5px] capitalize text-mut">{m.label}</span>
                      <span className={`font-mono text-[11px] ${TONE_TEXT[m.tone]}`}>{m.value}</span>
                    </div>
                    <div className="h-[7px] w-full bg-line/60">
                      <div
                        className={`fill h-full ${m.tone === "mint" ? "bg-mint" : m.tone === "cy" ? "bg-cy" : "bg-amber"}`}
                        style={{ ["--w" as string]: `${m.value}%`, transitionDelay: `${i * 130}ms` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div className="flex-1 border border-line bg-panel">
              <div className="border-b border-line bg-panel2 px-4 py-2.5 font-mono text-[10px] tracking-[0.24em] text-mut">
                RECENT RUNS
              </div>
              <div className="divide-y divide-line">
                {RUNS.map((r) => (
                  <div
                    key={r.id}
                    className="grid grid-cols-[86px_1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-panel2 sm:grid-cols-[96px_1fr_52px_60px_74px]"
                  >
                    <span className="font-mono text-[10.5px] text-cy">{r.id}</span>
                    <span className="truncate text-[12px] text-fog/85">{r.task}</span>
                    <span className="hidden font-mono text-[10.5px] text-dim sm:block">{r.steps} act</span>
                    <span className="hidden font-mono text-[10.5px] text-dim sm:block">{r.wall}</span>
                    <span className={`justify-self-end border px-1.5 py-px text-right font-mono text-[9.5px] tracking-wider ${resCls[r.res]}`}>
                      {r.res}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
