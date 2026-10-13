import { useState } from "react";
import { useApp } from "../context/AppContext";

export default function RedlineCard({ redlines = [] }) {
  const { darkMode } = useApp();
  const card = darkMode ? "glass-dark" : "glass-light";
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!redlines || redlines.length === 0) {
    return null;
  }

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className={`rounded-2xl p-5 shadow-xl ${card} mt-4`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-amber-500/15" : "bg-amber-50"}`}>
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
              Negotiation & Redline Recommendations
            </h2>
            <p className={`text-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              AI-generated counter-clauses to balance contract terms and eliminate risk
            </p>
          </div>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
          {redlines.length} {redlines.length === 1 ? "Suggestion" : "Suggestions"}
        </span>
      </div>

      <div className="space-y-4">
        {redlines.map((item, idx) => {
          const risky = item.risky_clause || "Unspecified clause";
          const replacement = item.recommended_replacement || item.suggested_redline || "";
          const rationale = item.negotiation_rationale || "";

          return (
            <div
              key={idx}
              className={`rounded-xl border p-4 transition-all ${
                darkMode
                  ? "bg-slate-900/60 border-slate-700/50 hover:border-slate-600"
                  : "bg-slate-50/80 border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Risky Clause */}
              <div className="mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-red-400">
                    Flagged Problematic Clause
                  </span>
                </div>
                <p className={`text-xs pl-3.5 border-l-2 border-red-500/30 italic ${darkMode ? "text-slate-300" : "text-slate-700"}`}>
                  "{risky}"
                </p>
              </div>

              {/* Recommended Replacement */}
              {replacement && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                        Proposed Counter-Clause
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(replacement, idx)}
                      className={`text-[11px] flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors ${
                        copiedIdx === idx
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : darkMode
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                      title="Copy counter-clause to clipboard"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied!
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Clause
                        </>
                      )}
                    </button>
                  </div>
                  <div
                    className={`text-xs p-3 rounded-lg font-mono leading-relaxed border ${
                      darkMode
                        ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-200"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    {replacement}
                  </div>
                </div>
              )}

              {/* Negotiation Rationale */}
              {rationale && (
                <div className={`flex items-start gap-2 pt-2 border-t text-xs ${darkMode ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-600"}`}>
                  <svg className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>
                    <strong className={darkMode ? "text-slate-300" : "text-slate-700"}>Negotiation Strategy: </strong>
                    {rationale}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
