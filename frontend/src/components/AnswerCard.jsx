import { useState } from "react";
import { useApp } from "../context/AppContext";
import MarkdownRenderer from "./MarkdownRenderer";

export default function AnswerCard({ answer }) {
  const { darkMode, addToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const card = darkMode ? "glass-dark" : "glass-light";
  const isLong = answer?.length > 1200;
  const displayAnswer = isLong && !expanded ? answer.slice(0, 1200) + "…" : answer;

  const handleCopy = () => {
    navigator.clipboard.writeText(answer);
    setCopied(true);
    addToast("Answer copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-2xl p-5 shadow-xl ${card}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-violet-500/15" : "bg-violet-100"}`}>
            <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>AI Analysis</h2>
        </div>

        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-150 ${
            copied
              ? "bg-emerald-500/10 text-emerald-400"
              : darkMode ? "bg-white/5 text-slate-300 hover:bg-white/10" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>

      <div className={`rounded-xl p-4 text-sm overflow-hidden ${darkMode ? "bg-white/[0.03]" : "bg-black/[0.02]"}`}>
        <MarkdownRenderer content={displayAnswer} darkMode={darkMode} />
      </div>

      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`mt-3 w-full text-xs py-2 rounded-xl transition-colors ${
            darkMode
              ? "bg-white/[0.03] text-slate-400 hover:bg-white/[0.06] hover:text-slate-300 border border-white/[0.06]"
              : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-100"
          }`}
        >
          {expanded ? "▲ Show less" : "▼ Show full answer"}
        </button>
      )}
    </div>
  );
}
