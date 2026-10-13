import { useApp } from "../context/AppContext";

const RISK_CONFIG = {
  High: {
    bg: "bg-red-500/10", border: "border-red-500/20",
    badge: "bg-red-500 text-white", dot: "bg-red-400",
    label: "HIGH RISK",
    explanation: "This contract has serious problems that could expose you to significant legal or financial risk. Do not sign without a lawyer reviewing it first.",
  },
  Medium: {
    bg: "bg-amber-500/10", border: "border-amber-500/20",
    badge: "bg-amber-400 text-slate-900", dot: "bg-amber-400",
    label: "MEDIUM RISK",
    explanation: "This contract has some issues worth addressing. It may be fine to sign, but you should clarify or negotiate the flagged points first.",
  },
  Low: {
    bg: "bg-emerald-500/10", border: "border-emerald-500/20",
    badge: "bg-emerald-500 text-white", dot: "bg-emerald-400",
    label: "LOW RISK",
    explanation: "This contract appears relatively standard. Review it yourself to confirm it matches your understanding, then it should be safe to sign.",
  },
  Unknown: {
    bg: "bg-slate-500/10", border: "border-slate-500/20",
    badge: "bg-slate-500 text-white", dot: "bg-slate-400",
    label: "UNKNOWN",
    explanation: "Risk assessment could not be completed. Please review the document manually or try again.",
  },
};

export default function RiskCard({ riskLevel, issues, plainEnglish }) {
  const { darkMode } = useApp();
  const config = RISK_CONFIG[riskLevel] ?? RISK_CONFIG.Unknown;
  const card = darkMode ? "glass-dark" : "glass-light";

  // Use LLM-generated plain English if available, otherwise fall back to static config text
  const explanation = plainEnglish || config.explanation;

  return (
    <div className={`rounded-2xl p-5 shadow-xl ${card}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-red-500/15" : "bg-red-50"}`}>
          <svg className="w-3.5 h-3.5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Risk Assessment</h2>
      </div>

      {/* Badge */}
      <div className={`rounded-xl border p-3 mb-3 ${config.bg} ${config.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full pulse-dot shrink-0 ${config.dot}`} />
          <span className={`text-sm font-bold tracking-wide ${config.badge.includes("text-white") ? "text-white" : "text-slate-900"}`}>
            {config.label}
          </span>
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-semibold shrink-0 ${config.badge}`}>
            {riskLevel}
          </span>
        </div>
      </div>

      {/* Plain English explanation */}
      <p className={`text-xs leading-relaxed mb-4 px-1 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
        {explanation}
      </p>

      {/* Issues */}
      {issues && issues.length > 0 ? (
        <ul className="space-y-2">
          {issues.map((issue, i) => (
            <li key={i} className={`flex items-start gap-2.5 text-xs p-3 rounded-xl ${darkMode ? "bg-red-500/5 border border-red-500/10" : "bg-red-50 border border-red-100"}`}>
              <span className="text-red-400 shrink-0 mt-0.5">⚠</span>
              <span className={darkMode ? "text-slate-300" : "text-slate-600"}>{issue}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`text-xs text-center py-2 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          No specific issues detected
        </p>
      )}
    </div>
  );
}
