import { useApp } from "../context/AppContext";

const AGENT_COLORS = {
  "Query Agent":      { bg: "bg-blue-500/10",    border: "border-blue-500/20",    dot: "bg-blue-400",     icon: "🔍" },
  "Research Agent":   { bg: "bg-purple-500/10",  border: "border-purple-500/20",  dot: "bg-purple-400",   icon: "📚" },
  "Contract Agent":   { bg: "bg-amber-500/10",   border: "border-amber-500/20",   dot: "bg-amber-400",    icon: "📄" },
  "Compliance Agent": { bg: "bg-cyan-500/10",    border: "border-cyan-500/20",    dot: "bg-cyan-400",     icon: "✅" },
  "Risk Agent":       { bg: "bg-red-500/10",     border: "border-red-500/20",     dot: "bg-red-400",      icon: "⚠️" },
  "Summary Agent":    { bg: "bg-emerald-500/10", border: "border-emerald-500/20", dot: "bg-emerald-400",  icon: "💡" },
};

const DEFAULT = { bg: "bg-slate-500/10", border: "border-slate-500/20", dot: "bg-slate-400", icon: "🤖" };

function formatDuration(ms) {
  if (ms == null) return null;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AgentTrace({ workflow, embedded = false }) {
  const { darkMode } = useApp();
  const card = darkMode ? "glass-dark" : "glass-light";

  const inner = (
    <>
      {workflow?.length > 0 ? (
        <div className="relative">
          <div className={`absolute left-[22px] top-4 bottom-4 w-px ${darkMode ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />
          <ol className="space-y-3">
            {workflow.map((event, index) => {
              const cfg = AGENT_COLORS[event.agent] ?? DEFAULT;
              const duration = formatDuration(event.duration_ms);
              return (
                <li key={index} className="flex items-center gap-3 relative">
                  <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center border text-lg z-10 ${cfg.bg} ${cfg.border}`}>
                    {cfg.icon}
                  </div>
                  <div className={`flex-1 flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs ${cfg.bg} ${cfg.border}`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      <span className={`font-semibold ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{event.agent}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`${darkMode ? "text-slate-600" : "text-slate-400"}`}>{event.time}</span>
                      {duration && (
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${darkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                          {duration}
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-medium ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                        done
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Total duration */}
          {workflow.every(e => e.duration_ms != null) && (
            <div className={`mt-3 flex items-center justify-end gap-2 text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
              <span>Total pipeline time:</span>
              <span className={`font-mono font-semibold ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
                {formatDuration(workflow.reduce((sum, e) => sum + e.duration_ms, 0))}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className={`text-xs text-center py-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No workflow data</p>
      )}
    </>
  );

  if (embedded) return inner;

  return (
    <div className={`rounded-2xl p-5 shadow-xl ${card}`}>
      <div className="flex items-center gap-2 mb-5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-indigo-500/15" : "bg-indigo-100"}`}>
          <svg className="w-3.5 h-3.5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Agent Workflow</h2>
        {workflow?.length > 0 && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
            {workflow.length} agents
          </span>
        )}
      </div>
      {inner}
    </div>
  );
}
