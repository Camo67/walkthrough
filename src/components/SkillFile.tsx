import { useState, type ReactNode } from "react";
import { SKILL_FILES } from "../data";
import { Reveal } from "../fx";

function paintLine(line: string): ReactNode {
  if (!line.trim()) return <span>&nbsp;</span>;
  if (/^\s*#/.test(line)) return <span className="text-dim">{line}</span>;
  if (/^---\s*$/.test(line)) return <span className="text-amber/70">{line}</span>;
  if (/^#{1,6}\s/.test(line)) return <span className="font-semibold text-amber">{line}</span>;
  const parts: ReactNode[] = [];
  const re = /("(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|(\b(?:true|false|null)\b)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(line))) {
    if (m.index > last) parts.push(<span key={i++} className="text-fog/85">{line.slice(last, m.index)}</span>);
    const cls = m[1] ? "text-mint" : m[2] ? "text-cy" : "text-red";
    parts.push(<span key={i++} className={cls}>{m[0]}</span>);
    last = m.index + m[0].length;
  }
  if (last < line.length) parts.push(<span key={i++} className="text-fog/85">{line.slice(last)}</span>);
  return <>{parts}</>;
}

export default function SkillFile() {
  const [tab, setTab] = useState(0);
  const [copied, setCopied] = useState(false);
  const file = SKILL_FILES[tab];
  const lines = file.body.split("\n");

  const copy = () => {
    try {
      void navigator.clipboard.writeText(file.body);
    } catch {
      /* clipboard unavailable — feedback still shown */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section id="skill" className="relative mx-auto max-w-[1200px] px-5 py-20 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-12">
        {/* sticky intro */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.32em] text-amber">{"// 01 · SKILL ANATOMY"}</p>
              <h2 className="mt-4 font-disp text-3xl font-bold leading-[1.04] tracking-tight lg:text-[2.6rem]">
                One folder the agent
                <br />
                can hold in <span className="text-amber">its head.</span>
              </h2>
              <p className="mt-5 max-w-md text-[14.5px] leading-relaxed text-mut">
                A computer-use skill is four small files: the contract (<span className="font-mono text-[12.5px] text-cy">SKILL.md</span>),
                the shape of every move (<span className="font-mono text-[12.5px] text-cy">actions.schema.json</span>),
                the cage (<span className="font-mono text-[12.5px] text-cy">policy.md</span>) and the
                scoreboard (<span className="font-mono text-[12.5px] text-cy">rubric.yaml</span>). Small
                enough to load whole, strict enough to audit.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <div className="mt-8 grid grid-cols-3 gap-px border border-line bg-line">
                {[
                  ["4", "files"],
                  ["10", "primitives"],
                  ["v3", "trace fmt"],
                ].map(([v, l]) => (
                  <div key={l} className="bg-panel px-4 py-4 transition-colors hover:bg-panel2">
                    <p className="font-disp text-2xl font-bold text-fog">{v}</p>
                    <p className="mt-0.5 font-mono text-[9.5px] tracking-[0.22em] text-dim">{l.toUpperCase()}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-8 space-y-3">
                {[
                  "Load the whole skill in one context window.",
                  "Every primitive is validated against the schema before it touches pixels.",
                  "Policy is checked per-action, not per-session.",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[13.5px] text-mut">
                    <svg viewBox="0 0 14 14" className="mt-1 h-3 w-3 shrink-0">
                      <path d="M2 7.5l3.4 3.5L12 3.5" fill="none" stroke="#3ddc97" strokeWidth="1.8" />
                    </svg>
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>

        {/* file browser */}
        <div className="lg:col-span-7">
          <Reveal delay={80}>
            <div className="border border-line bg-panel">
              <div className="flex items-end justify-between gap-2 overflow-x-auto border-b border-line bg-panel2 px-2 pt-2">
                <div className="flex gap-1">
                  {SKILL_FILES.map((f, i) => (
                    <button
                      key={f.name}
                      onClick={() => setTab(i)}
                      className={`whitespace-nowrap border-x border-t px-3 py-2 font-mono text-[10.5px] transition-colors ${
                        i === tab
                          ? "border-line bg-ink text-amber"
                          : "border-transparent text-dim hover:text-mut"
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={copy}
                  className={`mb-1.5 shrink-0 border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.15em] transition-colors ${
                    copied
                      ? "border-mint/60 bg-mint/10 text-mint"
                      : "border-line text-dim hover:border-amber hover:text-amber"
                  }`}
                >
                  {copied ? "COPIED ✓" : "COPY"}
                </button>
              </div>
              <div className="scrolly h-[430px] overflow-auto bg-ink px-0 py-3 font-mono text-[11.5px] leading-[1.75]">
                {lines.map((l, i) => (
                  <div key={i} className="flex hover:bg-panel2/60">
                    <span className="w-11 shrink-0 select-none pr-3 text-right text-[10px] leading-[1.95] text-dim/70">
                      {i + 1}
                    </span>
                    <span className="whitespace-pre pr-4">{paintLine(l)}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between border-t border-line bg-panel2 px-3 py-1.5 font-mono text-[9.5px] text-dim">
                <span>{file.path}</span>
                <span>LF · UTF-8 · {file.lang} · sha 9f31c2</span>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
