import { useState } from "react";
import { askGeneral } from "../api/legalApi";
import { useApp } from "../context/AppContext";
import MarkdownRenderer from "./MarkdownRenderer";


const SUGGESTIONS = [
  "What is an NDA and when do I need one?",
  "What does 'unlimited liability' mean in plain English?",
  "What is the difference between a contractor and an employee?",
  "What is GDPR and does it apply to my business?",
  "What clauses should every employment contract have?",
  "What happens if I breach a contract?",
  "What is force majeure?",
  "Can a company change my contract without my consent?",
];

export default function LegalAssistant() {
  const { darkMode, addToast } = useApp();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const card = darkMode ? "glass-dark" : "glass-light";
  const textarea = darkMode
    ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-cyan-500/50 focus:ring-cyan-500/20"
    : "bg-black/[0.02] border-black/10 text-slate-900 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20";

  const handleAsk = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await askGeneral(question);
      setAnswer(res.answer);
      setQuestion("");
      addToast("Answer ready", "success");
    } catch (err) {
      const msg = err.message ?? "Failed to get answer. Please try again.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleAsk();
  };

  const handleSuggestion = (s) => {
    setQuestion(s);
    setAnswer(null);
    setError(null);
  };


  return (
    <div className="space-y-5">

      {/* Input card */}
      <div className={`rounded-2xl p-5 shadow-xl ${card}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-cyan-500/15" : "bg-cyan-100"}`}>
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
            Ask Anything Legal
          </h2>
          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-medium ${darkMode ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-200"}`}>
            No document needed
          </span>
        </div>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          rows={3}
          className={`w-full rounded-xl border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 transition-all duration-150 disabled:opacity-50 ${textarea}`}
          placeholder="e.g. What does unlimited liability mean? Is my NDA enforceable? What is GDPR?"
        />

        <div className="flex items-center justify-between mt-3">
          <span className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            {question.length > 0 ? `${question.length} chars · Ctrl+Enter to submit` : "Powered by GPT-4o legal knowledge"}
          </span>
          <button
            onClick={handleAsk}
            disabled={loading || !question.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:-translate-y-0.5 active:translate-y-0"
          >
            {loading ? (
              <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full spin-slow" /> Thinking…</>
            ) : (
              <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> Ask</>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions */}
      {!answer && !loading && (
        <div>
          <p className={`text-xs font-semibold uppercase tracking-widest mb-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
            Common questions
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 ${
                  darkMode
                    ? "bg-white/[0.03] border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:border-cyan-500/30"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-cyan-50 hover:border-cyan-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl p-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20">
          <span className="text-red-400 shrink-0">⚠</span>
          <p className="text-sm text-red-400">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 opacity-60 hover:opacity-100 text-xs">✕</button>
        </div>
      )}

      {/* Answer */}
      {answer && (
        <div className={`rounded-2xl p-5 shadow-xl fade-up ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-cyan-500/15" : "bg-cyan-100"}`}>
                <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Legal Answer</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${darkMode ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-amber-50 text-amber-600 border border-amber-200"}`}>
                ⚠ Not legal advice — consult a lawyer
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(answer); addToast("Copied", "success"); }}
                className={`text-xs px-2.5 py-1 rounded-lg transition-colors ${darkMode ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
              >
                Copy
              </button>
            </div>
          </div>
          <div className={`rounded-xl p-4 text-sm overflow-hidden ${darkMode ? "bg-white/[0.03]" : "bg-black/[0.02]"}`}>
            <MarkdownRenderer content={answer} darkMode={darkMode} />
          </div>

          <button
            onClick={() => { setAnswer(null); }}
            className={`mt-3 w-full text-xs py-2 rounded-xl transition-colors ${darkMode ? "bg-white/[0.03] text-slate-500 hover:bg-white/[0.06] border border-white/[0.06]" : "bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-100"}`}
          >
            Ask another question
          </button>
        </div>
      )}
    </div>
  );
}
