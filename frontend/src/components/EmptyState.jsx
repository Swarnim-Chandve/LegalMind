import { useApp } from "../context/AppContext";

const STEPS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    title: "Upload a document",
    desc: "Drag & drop any legal PDF — NDA, contract, agreement",
    color: "emerald",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Ask in plain English",
    desc: "\"What are my obligations?\" or use a template chip",
    color: "violet",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Get instant analysis",
    desc: "AI agents extract risks, obligations and recommendations",
    color: "blue",
  },
];

const COLOR = {
  emerald: {
    wrap: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    light: "bg-emerald-50 border-emerald-200 text-emerald-600",
  },
  violet: {
    wrap: "bg-violet-500/10 border-violet-500/20 text-violet-400",
    light: "bg-violet-50 border-violet-200 text-violet-600",
  },
  blue: {
    wrap: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    light: "bg-blue-50 border-blue-200 text-blue-600",
  },
};

const EXAMPLES = [
  "Summarise this NDA",
  "What am I not allowed to do?",
  "Is there unlimited liability?",
  "What is the notice period?",
  "What are my termination rights?",
];

export default function EmptyState({ onExampleClick }) {
  const { darkMode } = useApp();

  return (
    <div className="fade-up text-center py-4">

      {/* Illustration */}
      <div className="relative inline-flex mb-8">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-5xl shadow-2xl ${
          darkMode ? "bg-gradient-to-br from-violet-500/20 to-indigo-600/20 border border-violet-500/20" : "bg-gradient-to-br from-violet-100 to-indigo-100 border border-violet-200"
        }`}>
          ⚖️
        </div>
        {/* Orbiting dots */}
        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${darkMode ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-emerald-50 text-emerald-500 border border-emerald-200"}`}>✓</div>
        <div className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs ${darkMode ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "bg-violet-50 text-violet-500 border border-violet-200"}`}>⚡</div>
      </div>

      <h2 className={`text-xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-800"}`}>
        Ready to analyse your legal documents
      </h2>
      <p className={`text-sm mb-8 max-w-sm mx-auto ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
        Upload a contract and ask questions in plain English. Our AI agents will break it down for you in seconds.
      </p>

      {/* Steps */}
      <div className="grid grid-cols-3 gap-3 mb-8 max-w-lg mx-auto">
        {STEPS.map((step, i) => {
          const c = COLOR[step.color];
          return (
            <div
              key={i}
              className={`rounded-2xl p-4 border text-left transition-all duration-200 ${
                darkMode ? "glass-dark hover:bg-white/[0.04]" : "glass-light hover:bg-white"
              }`}
            >
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${darkMode ? c.wrap : c.light}`}>
                {step.icon}
              </div>
              <div className={`text-xs font-semibold mb-1 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
                {step.title}
              </div>
              <div className={`text-[10px] leading-relaxed ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
                {step.desc}
              </div>
            </div>
          );
        })}
      </div>

      {/* Example questions */}
      <div>
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          Try asking
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => onExampleClick?.(ex)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 ${
                darkMode
                  ? "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-violet-500/10 hover:border-violet-500/30"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-200"
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
