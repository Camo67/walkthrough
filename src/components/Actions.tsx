import { useState } from "react";
import { ACTIONS } from "../data";
import { Reveal } from "../fx";

function LoopDiagram() {
  const nodes = [
    { label: "OBSERVE", x: 130, y: 34, c: "#5bc9ff" },
    { label: "ORIENT", x: 226, y: 130, c: "#ffb224" },
    { label: "ACT", x: 130, y: 226, c: "#3ddc97" },
    { label: "VERIFY", x: 34, y: 130, c: "#ff5d5d" },
  ];
  return (
    <svg viewBox="0 0 260 260" className="mx-auto w-full max-w-[300px]">
      <g className="spin-slow">
        <circle cx="130" cy="130" r="88" fill="none" stroke="#2a3a5e" strokeWidth="1.4" strokeDasharray="6 7" />
      </g>
      <circle cx="130" cy="130" r="52" fill="none" stroke="#1f2b47" strokeWidth="1" />
      {/* center cursor glyph */}
      <path d="M120 116l22 11.3-9.8 2.6-4.6 9.3z" fill="#ffb224" stroke="#0b1120" strokeWidth="1" />
      <text x="130" y="152" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="8" letterSpacing="2" fill="#5d6f92">
        CU-LOOP
      </text>
      {nodes.map((n) => (
        <g key={n.label}>
          <rect x={n.x - 5} y={n.y - 5} width="10" height="10" fill="#0b1120" stroke={n.c} strokeWidth="1.5" transform={`rotate(45 ${n.x} ${n.y})`} />
          <text
            x={n.x}
            y={n.y > 130 ? n.y + 24 : n.y - 16}
            textAnchor="middle"
            fontFamily="IBM Plex Mono, monospace"
            fontSize="10"
            letterSpacing="2.5"
            fill={n.c}
          >
            {n.label}
          </text>
        </g>
      ))}
      <path d="M178 52l8-2-2 8" fill="none" stroke="#5bc9ff" strokeWidth="1.5" />
      <path d="M208 178l2 8-8-2" fill="none" stroke="#ffb224" strokeWidth="1.5" />
      <path d="M82 208l-8 2 2-8" fill="none" stroke="#3ddc97" strokeWidth="1.5" />
      <path d="M52 82l-2-8 8 2" fill="none" stroke="#ff5d5d" strokeWidth="1.5" />
    </svg>
  );
}

export default function Actions() {
  const [open, setOpen] = useState(0);
  return (
    <section id="actions" className="relative border-t border-line bg-ink2/50">
      <div className="mx-auto max-w-[1200px] px-5 py-20 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <Reveal>
                <p className="font-mono text-[11px] tracking-[0.32em] text-amber">{"// 02 · ACTION VOCABULARY"}</p>
                <h2 className="mt-4 font-disp text-3xl font-bold leading-[1.04] tracking-tight lg:text-[2.6rem]">
                  Ten primitives.
                  <br />
                  That's the whole <span className="text-amber">hands.</span>
                </h2>
                <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-mut">
                  Everything the agent does on screen compiles down to one of these ten calls, each
                  schema-checked and each appended to the trace with before/after frames. Open a row
                  to see the exact payload.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <div className="mt-10 border border-line bg-panel p-6">
                  <LoopDiagram />
                  <p className="mt-4 text-center font-mono text-[10px] tracking-[0.2em] text-dim">
                    NO ACTION WITHOUT A PRIOR FRAME · NO LOOP CLOSED WITHOUT A VERIFY
                  </p>
                </div>
              </Reveal>
            </div>
          </div>

          {/* ledger */}
          <div className="space-y-2 lg:col-span-7">
            {ACTIONS.map((a, i) => {
              const isOpen = open === i;
              return (
                <Reveal key={a.name} delay={Math.min(i * 50, 250)}>
                  <div
                    className={`border bg-panel transition-all duration-300 ${
                      isOpen ? "border-amber/50" : "border-line hover:border-line2 hover:bg-panel2"
                    }`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      className="grid w-full grid-cols-[118px_1fr_26px] items-center gap-3 px-4 py-3.5 text-left sm:grid-cols-[150px_1fr_26px]"
                    >
                      <span>
                        <span className={`font-mono text-[13px] font-semibold tracking-tight ${isOpen ? "text-amber" : "text-fog"}`}>
                          {a.name}
                        </span>
                        <span className="mt-1 block font-mono text-[9px] tracking-wider text-dim">{a.params}</span>
                      </span>
                      <span className="text-[12.5px] leading-snug text-mut">{a.desc}</span>
                      <svg
                        viewBox="0 0 16 16"
                        className={`h-3.5 w-3.5 justify-self-end text-dim transition-transform duration-300 ${isOpen ? "rotate-90 text-amber" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M6 3l5 5-5 5" />
                      </svg>
                    </button>
                    {isOpen && (
                      <pre className="fadeup overflow-x-auto border-t border-line bg-ink px-4 py-3 font-mono text-[11px] leading-relaxed text-cy">
                        {a.payload}
                      </pre>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
