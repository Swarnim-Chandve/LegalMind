import { useState } from "react";
import { uploadPdf } from "../api/uploadApi";
import { useApp } from "../context/AppContext";

const MAX_FILE_SIZE_MB = 20;

export default function UploadCard() {
  const { darkMode, loadDocuments, addToast } = useApp();
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const card = darkMode ? "glass-dark" : "glass-light";

  const validateFile = (selected) => {
    if (!selected) return null;
    if (selected.type !== "application/pdf") {
      setStatus({ type: "error", message: "Only PDF files are supported." });
      return null;
    }
    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setStatus({ type: "error", message: `File exceeds the ${MAX_FILE_SIZE_MB}MB limit.` });
      return null;
    }
    setStatus(null);
    return selected;
  };

  const handleFileChange = (e) => {
    const f = validateFile(e.target.files[0]);
    if (f) setFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = validateFile(e.dataTransfer.files[0]);
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file) { setStatus({ type: "error", message: "Please select a PDF file first." }); return; }
    setUploading(true);
    setStatus(null);
    try {
      const response = await uploadPdf(file);
      await loadDocuments();
      setStatus({ type: "success", message: `"${response.file}" uploaded — ${response.chunks} chunks indexed` });
      addToast(`"${response.file}" uploaded successfully — ${response.chunks} chunks indexed`, "success");
      setFile(null);
      // Auto-clear status after 4 s — fix #24
      setTimeout(() => setStatus(null), 4000);
    } catch (err) {
      setStatus({ type: "error", message: err.message ?? "Upload failed." });
      addToast(err.message ?? "Upload failed. Please try again.", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`rounded-2xl p-5 mb-5 shadow-xl ${card}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${darkMode ? "bg-emerald-500/15" : "bg-emerald-100"}`}>
          <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h2 className={`text-sm font-semibold ${darkMode ? "text-white" : "text-slate-800"}`}>
          Upload Legal Document
        </h2>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`block w-full border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all duration-150 ${
          dragOver
            ? darkMode ? "border-emerald-500/60 bg-emerald-500/10" : "border-emerald-400 bg-emerald-50"
            : darkMode ? "border-white/10 hover:border-white/20 hover:bg-white/[0.02]" : "border-black/10 hover:border-black/20 hover:bg-black/[0.02]"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? "bg-red-500/10" : "bg-red-50"}`}>
              <span className="text-xs font-bold text-red-400">PDF</span>
            </div>
            <div className="text-left">
              <p className={`text-sm font-medium truncate max-w-48 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>{file.name}</p>
              <p className={`text-xs ${darkMode ? "text-slate-500" : "text-slate-400"}`}>{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setFile(null); }}
              className={`ml-2 text-xs px-2 py-1 rounded-lg ${darkMode ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center mb-3 ${darkMode ? "bg-white/5" : "bg-slate-100"}`}>
              <svg className={`w-5 h-5 ${darkMode ? "text-slate-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className={`text-sm font-medium ${darkMode ? "text-slate-300" : "text-slate-600"}`}>
              Drop PDF here or <span className="text-violet-400">browse</span>
            </p>
            <p className={`text-xs mt-1 ${darkMode ? "text-slate-500" : "text-slate-400"}`}>PDF up to {MAX_FILE_SIZE_MB}MB</p>
          </>
        )}
        <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
      </label>

      <div className="flex items-center justify-between mt-3">
        {status ? (
          <p className={`text-xs ${status.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {status.type === "success" ? "✓" : "✕"} {status.message}
          </p>
        ) : <span />}

        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-150 shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          {uploading ? (
            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full spin-slow" /> Uploading</>
          ) : (
            <><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg> Upload</>
          )}
        </button>
      </div>
    </div>
  );
}
