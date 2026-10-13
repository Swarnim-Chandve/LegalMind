import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export const getMarkdownComponents = (darkMode) => ({
  h1: ({ children }) => (
    <h1 className={`text-base font-bold mb-2.5 mt-2 ${darkMode ? "text-white" : "text-slate-900"}`}>
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className={`text-sm font-bold mb-2 mt-4 pb-1 border-b ${darkMode ? "text-slate-100 border-white/10" : "text-slate-800 border-slate-200"}`}>
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className={`text-sm font-semibold mb-1.5 mt-3 ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className={`mb-2.5 leading-relaxed break-words text-sm ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className={`font-semibold ${darkMode ? "text-white font-bold" : "text-slate-900 font-bold"}`}>
      {children}
    </strong>
  ),
  em: ({ children }) => <em className="italic text-inherit">{children}</em>,
  ul: ({ children }) => (
    <ul className="list-disc list-outside space-y-1.5 mb-3 ml-4 text-sm">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-outside space-y-1.5 mb-3 ml-4 text-sm">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className={`text-sm leading-relaxed ${darkMode ? "text-slate-200" : "text-slate-700"}`}>
      {children}
    </li>
  ),
  // Table Components with proper contrast and overflow boundaries
  table: ({ children }) => (
    <div className={`w-full my-4 overflow-x-auto rounded-xl border shadow-sm ${
      darkMode ? "border-slate-700/60 bg-slate-900/60" : "border-slate-200 bg-white"
    }`}>
      <table className="w-full text-left border-collapse text-xs sm:text-sm">
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className={darkMode ? "bg-slate-800/90 text-slate-100 border-b border-slate-700" : "bg-slate-100 text-slate-800 border-b border-slate-200"}>
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className={`divide-y ${darkMode ? "divide-slate-800/80" : "divide-slate-100"}`}>
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className={`transition-colors ${darkMode ? "hover:bg-white/[0.03]" : "hover:bg-slate-50/80"}`}>
      {children}
    </tr>
  ),
  th: ({ children }) => (
    <th className={`px-4 py-3 font-semibold text-xs uppercase tracking-wider ${
      darkMode ? "text-slate-100" : "text-slate-800"
    }`}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className={`px-4 py-3 align-top leading-relaxed break-words ${
      darkMode ? "text-slate-200" : "text-slate-700"
    }`}>
      {children}
    </td>
  ),
  // Code & Pre (boundary overflow fixes)
  pre: ({ children }) => (
    <pre className={`w-full max-w-full my-3 p-3.5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap break-words border shadow-inner ${
      darkMode ? "bg-slate-950/80 text-violet-300 border-slate-800" : "bg-slate-900 text-violet-200 border-slate-800"
    }`}>
      {children}
    </pre>
  ),
  code: ({ inline, children }) => (
    <code className={`px-1.5 py-0.5 rounded text-xs font-mono break-words ${
      darkMode ? "bg-white/10 text-violet-300" : "bg-violet-50 text-violet-700"
    }`}>
      {children}
    </code>
  ),
  blockquote: ({ children }) => (
    <blockquote className={`border-l-4 pl-3.5 my-3 italic ${
      darkMode ? "border-violet-500/50 text-slate-300 bg-violet-500/[0.03] py-1 rounded-r" : "border-violet-400 text-slate-600 bg-violet-50/50 py-1 rounded-r"
    }`}>
      {children}
    </blockquote>
  ),
  hr: () => (
    <hr className={`my-4 ${darkMode ? "border-white/10" : "border-slate-200"}`} />
  ),
});

export default function MarkdownRenderer({ content, darkMode, className = "" }) {
  if (!content) return null;
  const components = getMarkdownComponents(darkMode);

  return (
    <div className={`w-full max-w-full overflow-hidden break-words ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
