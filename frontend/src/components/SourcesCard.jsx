import { useApp } from "../context/AppContext";

export default function SourcesCard({ sources }) {
  const { darkMode } = useApp();
  const card = darkMode ? "glass-dark" : "glass-light";

  return (
    <div className={`rounded-2xl p-5 shadow-xl ${card}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-cyan-500/15" : "bg-cyan-100"}`}>
          <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>Sources</h2>
        {sources?.length > 0 && (
          <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${darkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
            {sources.length}
          </span>
        )}
      </div>

      {sources?.length > 0 ? (
        <ul className="space-y-2">
          {sources.map((source, i) => (
            <li key={source} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs ${darkMode ? "bg-white/[0.03] border border-white/[0.06]" : "bg-slate-50 border border-slate-100"}`}>
              <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[9px] font-bold ${darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"}`}>
                PDF
              </div>
              <span className={`truncate ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{source}</span>
              <span className={`ml-auto shrink-0 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>#{i + 1}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={`text-xs text-center py-4 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>
          No sources available
        </p>
      )}
    </div>
  );
}
