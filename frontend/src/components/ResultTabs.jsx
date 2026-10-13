import { useState } from "react";
import { useApp } from "../context/AppContext";
import AgentTrace from "./AgentTrace";
import ChatHistory from "./ChatHistory";

export default function ResultTabs({ workflow }) {
  const { darkMode, messages } = useApp();
  const [activeTab, setActiveTab] = useState("workflow");

  const card = darkMode ? "glass-dark" : "glass-light";

  const tab = (id, label, count) => {
    const active = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
          active
            ? darkMode
              ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
              : "bg-violet-50 text-violet-700 border border-violet-200"
            : darkMode
              ? "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
              : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
        }`}
      >
        {label}
        {count != null && (
          <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
            active
              ? darkMode ? "bg-violet-500/20 text-violet-300" : "bg-violet-100 text-violet-600"
              : darkMode ? "bg-white/5 text-slate-500" : "bg-slate-100 text-slate-400"
          }`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className={`rounded-2xl shadow-xl overflow-hidden ${card}`}>
      {/* Tab bar */}
      <div className={`flex items-center gap-2 px-4 pt-4 pb-0 border-b ${darkMode ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
        <div className="flex items-center gap-1.5 pb-3">
          {tab("workflow", "Agent Workflow", workflow?.length)}
          {tab("conversation", "Conversation", messages?.length)}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-4">
        {activeTab === "workflow" && (
          <AgentTrace workflow={workflow} embedded />
        )}
        {activeTab === "conversation" && (
          <ChatHistory embedded />
        )}
      </div>
    </div>
  );
}
