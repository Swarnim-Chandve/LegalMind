import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

// The 6 agents in pipeline order — matches the backend workflow exactly
const PIPELINE = [
  { name: "Query Agent",      icon: "🔍", color: "blue",    desc: "Detecting intent & keywords" },
  { name: "Research Agent",   icon: "📚", color: "purple",  desc: "Searching knowledge base" },
  { name: "Contract Agent",   icon: "📄", color: "amber",   desc: "Analysing contract clauses" },
  { name: "Compliance Agent", icon: "✅", color: "cyan",    desc: "Checking compliance rules" },
  { name: "Risk Agent",       icon: "⚠️", color: "red",     desc: "Assessing risk factors" },
  { name: "Summary Agent",    icon: "💡", color: "emerald", desc: "Generating final answer" },
];

// Contract/compliance are mutually exclusive — only one runs per request
// We show all 6 but grey out the one that won't run (we don't know which until done,
// so we show both during loading and reveal the winner from workflow on completion)

const COLOR_MAP = {
  blue:    { active: "border-blue-500   bg-blue-500/10   text-blue-400",    done: "border-blue-500/40   bg-blue-500/5   text-blue-400/70",   idle: "border-white/8 bg-white/[0.02] text-slate-500" },
  purple:  { active: "border-purple-500 bg-purple-500/10 text-purple-400",  done: "border-purple-500/40 bg-purple-500/5 text-purple-400/70", idle: "border-white/8 bg-white/[0.02] text-slate-500" },
  amber:   { active: "border-amber-500  bg-amber-500/10  text-amber-400",   done: "border-amber-500/40  bg-amber-500/5  text-amber-400/70",  idle: "border-white/8 bg-white/[0.02] text-slate-500" },
  cyan:    { active: "border-cyan-500   bg-cyan-500/10   text-cyan-400",    done: "border-cyan-500/40   bg-cyan-500/5   text-cyan-400/70",   idle: "border-white/8 bg-white/[0.02] text-slate-500" },
  red:     { active: "border-red-500    bg-red-500/10    text-red-400",     done: "border-red-500/40    bg-red-500/5    text-red-400/70",    idle: "border-white/8 bg-white/[0.02] text-slate-500" },
  emerald: { active: "border-emerald-500 bg-emerald-500/10 text-emerald-400", done: "border-emerald-500/40 bg-emerald-500/5 text-emerald-400/70", idle: "border-white/8 bg-white/[0.02] text-slate-500" },
};

const LIGHT_COLOR_MAP = {
  blue:    { active: "border-blue-400   bg-blue-50   text-blue-600",    done: "border-blue-200   bg-blue-50/50   text-blue-400",   idle: "border-slate-200 bg-slate-50 text-slate-400" },
  purple:  { active: "border-purple-400 bg-purple-50 text-purple-600",  done: "border-purple-200 bg-purple-50/50 text-purple-400", idle: "border-slate-200 bg-slate-50 text-slate-400" },
  amber:   { active: "border-amber-400  bg-amber-50  text-amber-600",   done: "border-amber-200  bg-amber-50/50  text-amber-400",  idle: "border-slate-200 bg-slate-50 text-slate-400" },
  cyan:    { active: "border-cyan-400   bg-cyan-50   text-cyan-600",    done: "border-cyan-200   bg-cyan-50/50   text-cyan-400",   idle: "border-slate-200 bg-slate-50 text-slate-400" },
  red:     { active: "border-red-400    bg-red-50    text-red-600",     done: "border-red-200    bg-red-50/50    text-red-400",    idle: "border-slate-200 bg-slate-50 text-slate-400" },
  emerald: { active: "border-emerald-400 bg-emerald-50 text-emerald-600", done: "border-emerald-200 bg-emerald-50/50 text-emerald-400", idle: "border-slate-200 bg-slate-50 text-slate-400" },
};

export default function LiveAgentStatus({ loading, completedWorkflow }) {
  const { darkMode } = useApp();
  // activeIndex: which agent is currently "running" (-1 = none)
  const [activeIndex, setActiveIndex] = useState(-1);
  // doneIndices: set of indices that have completed
  const [doneIndices, setDoneIndices] = useState(new Set());

  const colorMap = darkMode ? COLOR_MAP : LIGHT_COLOR_MAP;
  const card = darkMode ? "glass-dark" : "glass-light";

  // Simulate agent progression while loading
  useEffect(() => {
    if (!loading) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex(0);
    setDoneIndices(new Set());

    // Step through agents. Contract OR Compliance runs, but during loading
    // we don't know which, so we step through all 6 sequentially.
    // Timing: ~1.2s per agent to fill a typical 6-8s response window.
    const timers = [];
    PIPELINE.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setActiveIndex(i);
        setDoneIndices((prev) => {
          const next = new Set(prev);
          if (i > 0) next.add(i - 1);
          return next;
        });
      }, i * 1200));
    });

    return () => timers.forEach(clearTimeout);
  }, [loading]);

  // When result arrives, snap to the actual completed agents
  useEffect(() => {
    if (!completedWorkflow?.length) return;
    const completedNames = new Set(completedWorkflow.map((e) => e.agent));
    const completedSet = new Set(
      PIPELINE.map((a, i) => completedNames.has(a.name) ? i : null).filter((i) => i !== null)
    );
    setDoneIndices(completedSet);
    setActiveIndex(-1);
  }, [completedWorkflow]);

  // Agents that were skipped (the unused branch of contract/compliance)
  const skippedNames = (() => {
    if (!completedWorkflow?.length) return new Set();
    const completed = new Set(completedWorkflow.map((e) => e.agent));
    const skipped = new Set();
    if (completed.has("Contract Agent") && !completed.has("Compliance Agent")) skipped.add("Compliance Agent");
    if (completed.has("Compliance Agent") && !completed.has("Contract Agent")) skipped.add("Contract Agent");
    return skipped;
  })();

  const getState = (index) => {
    if (!loading && !completedWorkflow?.length) return "idle";
    const agentName = PIPELINE[index].name;
    if (skippedNames.has(agentName)) return "skipped";
    if (doneIndices.has(index)) return "done";
    if (activeIndex === index) return "active";
    return "idle";
  };

  return (
    <div className={`rounded-2xl p-5 shadow-xl mb-5 ${card}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-indigo-500/15" : "bg-indigo-100"}`}>
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
          </svg>
        </div>
        <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
          Agent Pipeline
        </h2>
        <div className="ml-auto flex items-center gap-2">
          {loading && (
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${darkMode ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-violet-50 text-violet-600 border border-violet-200"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 pulse-dot" />
              Running
            </span>
          )}
          {!loading && completedWorkflow?.length > 0 && (
            <span className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${darkMode ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-emerald-50 text-emerald-600 border border-emerald-200"}`}>
              ✓ Complete
            </span>
          )}
          {!loading && !completedWorkflow?.length && (
            <span className={`text-xs px-2.5 py-1 rounded-full ${darkMode ? "bg-white/5 text-slate-500 border border-white/8" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
              Idle
            </span>
          )}
        </div>
      </div>

      {/* Agent grid */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {PIPELINE.map((agent, index) => {
          const state = getState(index);
          const colors = colorMap[agent.color];
          const cls = colors[state] ?? colors["idle"];
          const isActive = state === "active";
          const isDone = state === "done";
          const isSkipped = state === "skipped";

          return (
            <div
              key={agent.name}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-500 ${cls}`}
            >
              {/* Active pulse ring */}
              {isActive && (
                <span className="absolute inset-0 rounded-xl border-2 border-current animate-ping opacity-20" />
              )}

              {/* Icon */}
              <span className={`text-xl transition-transform duration-300 ${isActive ? "scale-110" : "scale-100"} ${isSkipped ? "grayscale opacity-30" : ""}`}>
                {isDone ? "✓" : isSkipped ? "—" : agent.icon}
              </span>

              {/* Name */}
              <span className={`text-[10px] font-semibold leading-tight ${isSkipped ? "opacity-30" : (darkMode ? (state === "idle" ? "text-slate-600" : "") : (state === "idle" ? "text-slate-400" : ""))}`}>
                {agent.name.replace(" Agent", "")}
              </span>

              {/* Status label */}
              <span className={`text-[9px] leading-none ${
                isActive   ? darkMode ? "text-current opacity-80" : "text-current opacity-70"
                : isSkipped ? "opacity-25 " + (darkMode ? "text-slate-500" : "text-slate-400")
                : darkMode ? "text-slate-600" : "text-slate-400"
              }`}>
                {isActive ? "running…" : isDone ? "done" : isSkipped ? "n/a" : "waiting"}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active agent detail bar */}
      {loading && activeIndex >= 0 && (
        <div className={`mt-3 px-3 py-2.5 rounded-xl flex items-center gap-3 text-xs transition-all duration-300 ${darkMode ? "bg-white/[0.03] border border-white/[0.06]" : "bg-slate-50 border border-slate-100"}`}>
          <div className="w-2 h-2 rounded-full bg-violet-400 pulse-dot shrink-0" />
          <span className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
            {PIPELINE[activeIndex].name}
          </span>
          <span className={`${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            — {PIPELINE[activeIndex].desc}
          </span>
        </div>
      )}
    </div>
  );
}
