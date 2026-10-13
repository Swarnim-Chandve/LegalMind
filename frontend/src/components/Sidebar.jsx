import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";

function TrashIcon({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function ConfirmDeleteModal({ message, onConfirm, onCancel, darkMode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className={`relative rounded-2xl p-6 shadow-2xl w-80 ${darkMode ? "bg-[#0d1117] border border-white/10" : "bg-white border border-black/10"}`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4 ${darkMode ? "bg-red-500/10" : "bg-red-50"}`}>
          <TrashIcon className="w-5 h-5 text-red-400" />
        </div>
        <p className={`text-sm text-center mb-5 ${darkMode ? "text-slate-300" : "text-slate-600"}`}>{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${darkMode ? "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl text-sm font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Skeleton shimmer row
function SkeletonRow({ darkMode, wide = false }) {
  return (
    <div className={`h-9 rounded-xl shimmer ${darkMode ? "bg-white/[0.04]" : "bg-slate-100"} ${wide ? "w-full" : "w-3/4"}`} />
  );
}

export default function Sidebar() {
  const {
    darkMode, toggleDarkMode,
    chats, documents,
    selectedChat, openChat, resetSession,
    chatsError, documentsError,
    deleteChatById, deleteDocumentById,
    loadChats, loadDocuments,
  } = useApp();

  const [confirmChat, setConfirmChat] = useState(null);
  const [confirmDoc,  setConfirmDoc]  = useState(null);
  const [chatSearch,  setChatSearch]  = useState("");
  const [chatsLoaded, setChatsLoaded] = useState(true);
  const [docsLoaded,  setDocsLoaded]  = useState(true);

  // Filter chats by search query
  const filteredChats = useMemo(() => {
    if (!chatSearch.trim()) return chats;
    const q = chatSearch.toLowerCase();
    return chats.filter((c) => c.title?.toLowerCase().includes(q));
  }, [chats, chatSearch]);

  const base = darkMode
    ? "h-full bg-[#0d1117] border-r border-white/[0.06] text-white"
    : "h-full bg-white border-r border-black/[0.06] text-slate-900";

  const sectionLabel = "text-[10px] font-bold uppercase tracking-widest mb-3 " +
    (darkMode ? "text-slate-500" : "text-slate-400");

  const chatRowBtn = (active) =>
    `flex-1 min-w-0 text-left px-3 py-2.5 rounded-xl text-sm truncate transition-all duration-150 flex items-center gap-2.5 ` +
    (active
      ? darkMode ? "bg-violet-500/15 text-violet-300 border border-violet-500/20" : "bg-violet-50 text-violet-700 border border-violet-200"
      : darkMode ? "text-slate-300 hover:bg-white/5 border border-transparent" : "text-slate-600 hover:bg-slate-50 border border-transparent");

  const docItem = darkMode
    ? "px-3 py-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] text-sm flex items-start gap-2.5 group"
    : "px-3 py-2.5 rounded-xl border border-black/[0.06] bg-slate-50 text-sm flex items-start gap-2.5 group";

  const trashBtn =
    `shrink-0 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-150 hover:bg-red-500/10 text-red-400`;

  const searchInput = darkMode
    ? "bg-white/[0.04] border border-white/10 text-slate-200 placeholder-slate-600 focus:border-violet-500/40"
    : "bg-slate-50 border border-slate-200 text-slate-700 placeholder-slate-400 focus:border-violet-300";

  const retryBtn = darkMode
    ? "text-[10px] text-violet-400 hover:text-violet-300 underline underline-offset-2"
    : "text-[10px] text-violet-500 hover:text-violet-700 underline underline-offset-2";

  return (
    <>
      <aside className={`w-72 shrink-0 flex flex-col ${base}`} style={{ minHeight: "100vh" }}>

        {/* Logo */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <span className="text-lg">⚖️</span>
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">LegalMind</h1>
              <p className={`text-[10px] ${darkMode ? "text-slate-500" : "text-slate-400"}`}>AI Legal Platform</p>
            </div>
          </div>

          <button onClick={resetSession} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-violet-500/20 hover:-translate-y-0.5 mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>

          <button onClick={toggleDarkMode} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${darkMode ? "bg-white/5 hover:bg-white/8 text-slate-300 border border-white/[0.06]" : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"}`}>
            {darkMode ? <><span>☀️</span> Light Mode</> : <><span>🌙</span> Dark Mode</>}
          </button>
        </div>

        <div className={`mx-5 h-px ${darkMode ? "bg-white/[0.06]" : "bg-black/[0.06]"}`} />

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* ── Recent Chats ── */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <p className={sectionLabel}>Recent Chats</p>
              <div className="flex items-center gap-2">
                {chats.length > 0 && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${darkMode ? "bg-white/5 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                    {chats.length}
                  </span>
                )}
              </div>
            </div>

            {/* Search box — fix #21 */}
            {chats.length > 2 && (
              <div className="mb-2 relative">
                <svg className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 ${darkMode ? "text-slate-500" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                </svg>
                <input
                  type="text"
                  value={chatSearch}
                  onChange={(e) => setChatSearch(e.target.value)}
                  placeholder="Search chats…"
                  className={`w-full pl-7 pr-3 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-colors ${searchInput}`}
                />
                {chatSearch && (
                  <button onClick={() => setChatSearch("")} className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-50 hover:opacity-100 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>✕</button>
                )}
              </div>
            )}

            {/* Error with retry — fix #23 */}
            {chatsError && (
              <div className="mb-2 flex items-center gap-2">
                <p className="text-red-400 text-xs flex-1">{chatsError}</p>
                <button onClick={loadChats} className={retryBtn}>Retry</button>
              </div>
            )}

            {/* Skeleton — fix #19 */}
            {!chatsLoaded && !chatsError && (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => <SkeletonRow key={i} darkMode={darkMode} wide />)}
              </div>
            )}

            {filteredChats.length === 0 && !chatsError ? (
              <div className={`text-center py-6 rounded-xl ${darkMode ? "bg-white/[0.02] border border-white/[0.04]" : "bg-slate-50 border border-slate-100"}`}>
                {chatSearch
                  ? <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No chats match "{chatSearch}"</p>
                  : <>
                      <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No chats yet</p>
                      <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-600" : "text-slate-300"}`}>Ask a question to start</p>
                    </>
                }
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredChats.map((chat) => (
                  <li key={chat.id} className="flex items-center gap-1 group">
                    <button onClick={() => openChat(chat.id)} className={chatRowBtn(selectedChat === chat.id)}>
                      <span className="shrink-0 text-xs opacity-50">💬</span>
                      <span className="truncate">{chat.title}</span>
                      {selectedChat === chat.id && <span className="ml-auto shrink-0 w-1.5 h-1.5 rounded-full bg-violet-400" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); setConfirmChat(chat.id); }} className={trashBtn} title="Delete chat">
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ── Knowledge Base ── */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <p className={sectionLabel}>Knowledge Base</p>
              {documents.length > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${darkMode ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600"}`}>
                  {documents.length} docs
                </span>
              )}
            </div>

            {/* Error with retry — fix #23 */}
            {documentsError && (
              <div className="mb-2 flex items-center gap-2">
                <p className="text-red-400 text-xs flex-1">{documentsError}</p>
                <button onClick={loadDocuments} className={retryBtn}>Retry</button>
              </div>
            )}

            {/* Skeleton — fix #19 */}
            {!docsLoaded && !documentsError && (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => <SkeletonRow key={i} darkMode={darkMode} wide />)}
              </div>
            )}

            {documents.length === 0 && !documentsError ? (
              <div className={`text-center py-6 rounded-xl ${darkMode ? "bg-white/[0.02] border border-white/[0.04]" : "bg-slate-50 border border-slate-100"}`}>
                <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>No documents yet</p>
                <p className={`text-[10px] mt-1 ${darkMode ? "text-slate-600" : "text-slate-300"}`}>Upload a PDF to begin</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li key={doc.id} className={docItem}>
                    <div className={`mt-0.5 shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs ${darkMode ? "bg-red-500/10 text-red-400" : "bg-red-50 text-red-500"}`}>
                      PDF
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`truncate text-xs font-medium ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{doc.filename}</div>
                      <div className={`text-[10px] mt-0.5 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{doc.chunk_count} chunks indexed</div>
                    </div>
                    <button onClick={() => setConfirmDoc({ id: doc.id, filename: doc.filename })} className={trashBtn} title="Remove from knowledge base">
                      <TrashIcon />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className={`px-5 py-4 border-t ${darkMode ? "border-white/[0.06]" : "border-black/[0.06]"}`}>
          <p className={`text-[10px] text-center ${darkMode ? "text-slate-600" : "text-slate-400"}`}>
            Powered by GPT-4o · LangGraph · PostgreSQL · ChromaDB
          </p>
        </div>
      </aside>

      {confirmChat && (
        <ConfirmDeleteModal
          darkMode={darkMode}
          message="Delete this chat and all its messages? This cannot be undone."
          onConfirm={() => { deleteChatById(confirmChat); setConfirmChat(null); }}
          onCancel={() => setConfirmChat(null)}
        />
      )}
      {confirmDoc && (
        <ConfirmDeleteModal
          darkMode={darkMode}
          message={`Remove "${confirmDoc.filename}" from the knowledge base? All indexed chunks will be deleted.`}
          onConfirm={() => { deleteDocumentById(confirmDoc.id); setConfirmDoc(null); }}
          onCancel={() => setConfirmDoc(null)}
        />
      )}
    </>
  );
}
