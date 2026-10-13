import { useState } from "react";
import { analyzeQuestion } from "../api/legalApi";
import { useApp } from "../context/AppContext";
import { exportAnalysisPdf } from "../utils/exportPdf";

import Sidebar from "../components/Sidebar";
import UploadCard from "../components/UploadCard";
import QuestionBox from "../components/QuestionBox";
import AnswerCard from "../components/AnswerCard";
import RiskCard from "../components/RiskCard";
import SourcesCard from "../components/SourcesCard";
import ResultTabs from "../components/ResultTabs";
import LiveAgentStatus from "../components/LiveAgentStatus";
import LegalAssistant from "../components/LegalAssistant";
import RedlineCard from "../components/RedlineCard";
import EmptyState from "../components/EmptyState";
import ToastContainer from "../components/Toast";

const MODES = [
  {
    id: "document",
    label: "Document Analysis",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    ),
    desc: "Upload a contract and ask specific questions about it",
  },
  {
    id: "assistant",
    label: "Legal Assistant",
    icon: (
      <svg
        className="w-3.5 h-3.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    ),
    desc: "Ask any legal question — no document needed",
  },
];

export default function ChatPage() {
  const {
    darkMode,
    result,
    setResult,
    openChat,
    loadChats,
    addToast,
    documents,
  } = useApp();

  const [mode, setMode] = useState("document");
  const [question, setQuestion] = useState("");
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await analyzeQuestion(question, selectedDocuments);
      setResult(response);
      setQuestion("");
      addToast("Analysis complete", "success");
      await loadChats();
      if (response.chat_id) await openChat(response.chat_id);
    } catch (err) {
      const msg = err.message ?? "Analysis failed. Please try again.";
      setError(msg);
      addToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!result) return;
    try {
      exportAnalysisPdf(result, result._question ?? "Legal document analysis");
      addToast("Report downloaded", "success");
    } catch (err) {
      addToast("Export failed: " + (err.message ?? "unknown error"), "error");
    }
  };

  const handleModeSwitch = (id) => {
    setMode(id);
    setError(null);
  };

  const activeTab = (id) =>
    mode === id
      ? darkMode
        ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
        : "bg-violet-50 text-violet-700 border border-violet-200"
      : darkMode
        ? "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent";

  return (
    <div
      className={`min-h-screen ${darkMode ? "bg-[#070b14]" : "bg-[#f0f4ff]"}`}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? "bg-violet-600" : "bg-violet-300"}`}
        />
        <div
          className={`absolute top-1/2 -right-40 w-80 h-80 rounded-full blur-3xl opacity-15 ${darkMode ? "bg-cyan-500" : "bg-cyan-300"}`}
        />
        <div
          className={`absolute -bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-10 ${darkMode ? "bg-indigo-600" : "bg-indigo-300"}`}
        />
      </div>

      <div className="relative flex h-screen overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Header */}
            <div className="text-center mb-8 fade-up">
              <div className="inline-flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? "bg-violet-500/20" : "bg-violet-100"}`}
                >
                  <span className="text-lg">⚖️</span>
                </div>
                <span
                  className={`text-xs font-semibold uppercase tracking-widest ${darkMode ? "text-violet-400" : "text-violet-600"}`}
                >
                  Multi-Agent Platform
                </span>
              </div>
              <h1
                className={`text-4xl font-bold mb-2 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Legal<span className="gradient-text">Mind</span> AI
              </h1>
              <p
                className={`text-sm ${darkMode ? "text-slate-400" : "text-slate-500"}`}
              >
                Upload legal documents · Ask questions · Get AI-powered insights
              </p>
            </div>

            {/* Mode toggle */}
            <div
              className={`flex rounded-2xl p-1.5 mb-4 gap-1.5 ${darkMode ? "glass-dark" : "glass-light"} shadow-xl`}
            >
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeSwitch(m.id)}
                  className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab(m.id)}`}
                >
                  {m.icon}
                  <span>{m.label}</span>
                  {m.id === "assistant" && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide ${
                        mode === "assistant"
                          ? darkMode
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "bg-cyan-100 text-cyan-600"
                          : darkMode
                            ? "bg-white/5 text-slate-500"
                            : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      New
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p
              className={`text-xs text-center mb-6 ${darkMode ? "text-slate-500" : "text-slate-400"}`}
            >
              {MODES.find((m) => m.id === mode)?.desc}
            </p>

            {/* ── Document Analysis mode ── */}
            {mode === "document" && (
              <>
                <UploadCard />

                <div
                  className={`rounded-2xl p-4 mb-4 shadow-xl border transition-all duration-200 ${
                    darkMode
                      ? "bg-gradient-to-r from-violet-500/10 via-indigo-500/10 to-cyan-500/10 border-violet-500/20"
                      : "bg-gradient-to-r from-violet-50 via-indigo-50 to-cyan-50 border-violet-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <label
                      className={`block text-xs font-semibold tracking-wide ${darkMode ? "text-violet-300" : "text-violet-700"}`}
                    >
                      Scope
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedDocuments([])}
                      className={`text-[11px] px-2 py-1 rounded-full border transition-all ${
                        darkMode
                          ? "border-white/10 text-slate-300 hover:bg-white/5"
                          : "border-violet-200 text-violet-700 hover:bg-violet-100"
                      }`}
                    >
                      All docs
                    </button>
                  </div>

                  <div className="space-y-2">
                    {documents?.length ? (
                      documents.map((doc) => {
                        const checked = selectedDocuments.includes(
                          doc.filename,
                        );
                        return (
                          <label
                            key={doc.id}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm cursor-pointer transition-all ${
                              darkMode
                                ? checked
                                  ? "border-violet-500/40 bg-violet-500/10 text-white"
                                  : "border-white/10 bg-slate-950/30 text-slate-300 hover:border-violet-500/30"
                                : checked
                                  ? "border-violet-200 bg-violet-50 text-slate-800"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-violet-200"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setSelectedDocuments((prev) =>
                                  prev.includes(doc.filename)
                                    ? prev.filter(
                                        (name) => name !== doc.filename,
                                      )
                                    : [...prev, doc.filename],
                                );
                              }}
                              className="h-4 w-4 accent-violet-600"
                            />
                            <span className="truncate">{doc.filename}</span>
                          </label>
                        );
                      })
                    ) : (
                      <p
                        className={`text-sm ${darkMode ? "text-slate-500" : "text-slate-400"}`}
                      >
                        No documents uploaded yet.
                      </p>
                    )}
                  </div>

                  <p
                    className={`mt-2 text-[11px] ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Select one or more documents for a focused answer. Leave all
                    unchecked to search the full knowledge base.
                  </p>
                </div>

                <QuestionBox
                  question={question}
                  setQuestion={setQuestion}
                  onAnalyze={handleAnalyze}
                  loading={loading}
                />

                {(loading || result) && (
                  <div className="fade-up">
                    <LiveAgentStatus
                      loading={loading}
                      completedWorkflow={result?.workflow}
                    />
                  </div>
                )}

                {error && !loading && (
                  <div className="fade-up mb-5 rounded-2xl p-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20">
                    <span className="text-red-400 text-lg shrink-0">⚠</span>
                    <p className="text-sm text-red-400 flex-1">{error}</p>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-400 opacity-60 hover:opacity-100 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Empty state — shown before first analysis */}
                {!loading && !result && !error && (
                  <EmptyState onExampleClick={(ex) => setQuestion(ex)} />
                )}

                {/* Results */}
                {result && (
                  <div className="fade-up space-y-4 mb-6">
                    {/* Export button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleExport}
                        className={`flex items-center gap-2 text-xs px-4 py-2 rounded-xl border transition-all duration-150 hover:-translate-y-0.5 ${
                          darkMode
                            ? "bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-white/20"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                        } shadow-sm`}
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Export PDF Report
                      </button>
                    </div>

                    <AnswerCard answer={result.answer} />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <RiskCard
                        riskLevel={result.risk_level}
                        issues={result.issues}
                        plainEnglish={result.risk_plain_english}
                      />
                      <SourcesCard sources={result.sources} />
                    </div>

                    <RedlineCard redlines={result.redlines} />

                    <ResultTabs workflow={result.workflow} />
                  </div>
                )}
              </>
            )}

            {/* ── Legal Assistant mode ── */}
            {mode === "assistant" && <LegalAssistant />}
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
