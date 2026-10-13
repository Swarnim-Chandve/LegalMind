import { useApp } from "../context/AppContext";
import MarkdownRenderer from "./MarkdownRenderer";

export default function ChatHistory({ embedded = false }) {
  const { darkMode, messages } = useApp();
  const card = darkMode ? "glass-dark" : "glass-light";

  const userBubble = darkMode
    ? "bg-violet-600/25 border border-violet-500/30 text-white rounded-tr-md shadow-sm"
    : "bg-violet-50 border border-violet-200 text-slate-900 rounded-tr-md shadow-sm";
  const aiBubble = darkMode
    ? "bg-slate-900/90 border border-slate-700/60 text-slate-100 rounded-tl-md shadow-md"
    : "bg-white border border-slate-200 text-slate-800 rounded-tl-md shadow-sm";

  if (!messages || messages.length === 0) {
    if (embedded) {
      return (
        <p className={`text-xs text-center py-6 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          No messages yet in this conversation
        </p>
      );
    }
    return null;
  }

  const inner = (
    <div className="space-y-4">
      {messages.map((message) => (
        <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
          {message.role !== "user" && (
            <div className="shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs shadow-md shadow-violet-500/20 mt-1">
              ⚖️
            </div>
          )}
          <div className={`max-w-[88%] md:max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden ${message.role === "user" ? userBubble : aiBubble}`}>
            <div className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
              message.role === "user"
                ? darkMode ? "text-violet-300" : "text-violet-600"
                : darkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              {message.role === "user" ? "You" : "LegalMind AI"}
            </div>
            {message.role === "user" ? (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            ) : (
              <MarkdownRenderer content={message.content} darkMode={darkMode} />
            )}
          </div>
          {message.role === "user" && (
            <div className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold mt-1 ${
              darkMode ? "bg-slate-800 text-slate-200 border border-slate-700" : "bg-slate-100 text-slate-700 border border-slate-200"
            }`}>
              U
            </div>
          )}
        </div>
      ))}
    </div>
  );

  if (embedded) return inner;

  return (
    <div className={`rounded-2xl p-5 mt-4 shadow-xl fade-up ${card}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-blue-500/15" : "bg-blue-100"}`}>
            <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Conversation</h2>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-white/5 text-slate-400 border border-white/10" : "bg-slate-100 text-slate-500"}`}>
          {messages.length} messages
        </span>
      </div>
      {inner}
    </div>
  );
}
