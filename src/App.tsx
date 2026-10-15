import { Footer, Ticker, TopBar } from "./components/Chrome";
import Actions from "./components/Actions";
import Drill from "./components/Drill";
import Policy from "./components/Policy";
import Simulator from "./components/Simulator";
import SkillFile from "./components/SkillFile";

function Backdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div
        className="gridlines absolute inset-0"
        style={{ maskImage: "radial-gradient(ellipse 90% 70% at 50% 30%, black 30%, transparent 78%)" }}
      />
      <div className="drift1 absolute -left-44 -top-44 h-[560px] w-[560px] rounded-full bg-amber/[0.07] blur-[130px]" />
      <div className="drift2 absolute -right-48 top-1/4 h-[600px] w-[600px] rounded-full bg-cy/[0.06] blur-[140px]" />
      <div className="drift1 absolute -bottom-52 left-1/4 h-[520px] w-[520px] rounded-full bg-mint/[0.05] blur-[130px]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(11,17,32,0.85)_100%)]" />
    </div>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen font-body text-fog">
      <Backdrop />
      <div className="noise pointer-events-none fixed inset-0 z-[70] opacity-[0.05]" />
      <TopBar />
      <main>
        <Simulator />
        <Ticker />
        <SkillFile />
        <Actions />
        <Policy />
        <Drill />
      </main>
      <Footer />
    </div>
  );
}
