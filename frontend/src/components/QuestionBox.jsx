import { useApp } from "../context/AppContext";

const TEMPLATES = [
  { label: "Summarise", prompt: "Summarise this document and highlight the key points." },
  { label: "My obligations", prompt: "What are my obligations under this contract?" },
  { label: "Risks", prompt: "What are the main risks in this contract for me?" },
  { label: "Termination", prompt: "How can this contract be terminated and what notice is required?" },
  { label: "What I can't do", prompt: "What am I not allowed to do under this agreement?" },
  { label: "Missing clauses", prompt: "What important clauses are missing from this contract?" },
];

export default function QuestionBox({ question, setQuestion, onAnalyze, loading }) {
  const { darkMode } = useApp();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) onAnalyze();
  };

  const card = darkMode ? "glass-dark" : "glass-light";
  const textarea = darkMode
    ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-violet-500/50 focus:ring-violet-500/20"
    : "bg-black/[0.02] border-black/10 text-slate-900 placeholder-slate-400 focus:border-violet-400 focus:ring-violet-400/20";
  const chipBase = darkMode
    ? "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-violet-500/10 hover:border-violet-500/30 hover:text-violet-300"
    : "bg-white border-slate-200 text-slate-600 hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700";

  return (
    <div className={`rounded-2xl p-5 mb-5 shadow-xl ${card}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-violet-500/15" : "bg-violet-100"}`}>
          <svg className="w-3.5 h-3.5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
          Ask About Your Document
        </h2>
      </div>

      {/* Template chips */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => setQuestion(t.prompt)}
            className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all duration-150 ${chipBase}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        rows={3}
        className={`w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all duration-150 disabled:opacity-50 ${textarea}`}
        placeholder="Ask anything about your uploaded document… (Ctrl+Enter to submit)"
      />

      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          {question.length > 0 ? `${question.length} chars` : "Click a template above or type your own question"}
        </span>
        <button
          onClick={onAnalyze}
          disabled={loading || !question.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          {loading ? (
            <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full spin-slow" /> Analyzing</>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> Analyze</>
          )}
        </button>
      </div>
    </div>
  );
}
