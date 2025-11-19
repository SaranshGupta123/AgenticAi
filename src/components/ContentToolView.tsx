import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AnswerDetails from "./AnswerDetails";
import MindmapNotebookLM from "../pages/MindmapNotebookLM";

export function SearchModal({ tool, title }: any) {
  if (!tool.showSearchModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[600px] bg-[#1E2228] border border-white/10 rounded-2xl p-6 relative shadow-2xl">
        <button
          onClick={() => tool.setShowSearchModal(false)}
          className="absolute top-4 right-4 text-2xl text-gray-300 hover:text-red-400 p-1 rounded-full transition"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

        <input
          value={tool.question}
          onChange={(e) => tool.setQuestion(e.target.value)}
          placeholder="Ask something..."
          className="w-full px-4 py-3 bg-[#2B2F36] border border-white/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white transition-all duration-150"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => tool.setShowSearchModal(false)}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-[#33383F] text-gray-300 hover:bg-[#3E4550] transition"
          >
            Cancel
          </button>
          <button
            onClick={tool.search}
            disabled={!tool.question.trim()}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export function AnswerModal({ tool, title }: any) {
  if (!tool.showAnswerModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className={`
    ${
      title.toLowerCase().includes("mindmap")
        ? "w-[90vw] max-w-[1400px]"
        : "w-[700px]"
    }
    max-h-[90vh] flex flex-col bg-[#14171C] rounded-2xl 
    border border-blue-500/20 shadow-2xl shadow-black/60 
    p-6 relative backdrop-blur-md
  `}
      >
        <button
          onClick={() => tool.setShowAnswerModal(false)}
          className="absolute top-4 right-4 text-2xl text-gray-300 hover:text-red-400 p-1 rounded-full transition"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-white mb-4">{title}</h2>

        <div className="flex-1 h-0 overflow-y-auto text-gray-300 text-sm leading-relaxed border border-gray-700/50 rounded-xl p-5 space-y-4 bg-[#1A1D22]">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {tool.answer?.content ?? "No content available."}
          </ReactMarkdown>

          <AnswerDetails answer={tool.answer} />
          {title.toLowerCase().includes("mindmap") && tool.answer && (
            <div className="mt-5 p-3 rounded-xl bg-[#1E2228] border border-gray-700/50">
              <MindmapNotebookLM data={tool.answer} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ToolCard({
  icon: Icon,
  label,
  onClick,
  style = {},
  className = "",
}) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={`
        group
        rounded-2xl backdrop-blur-md 
        border border-white/10 
        px-4 py-6 text-white
        flex flex-col items-center justify-center space-y-2
        cursor-pointer select-none 
        transition-all duration-300
        shadow-[0_0_18px_rgba(0,0,0,0.5)]
        hover:shadow-[0_0_30px_rgba(0,0,0,0.65)]
        hover:scale-[1.07] hover:-translate-y-1
        active:scale-95
        ${className}
      `}
    >
      <div
        className="
          p-3 rounded-full 
          bg-black/40 border border-white/10 
          flex items-center justify-center
          transition-all duration-300
          group-hover:scale-125 group-hover:bg-black/60
          group-hover:shadow-[0_0_18px_rgba(255,255,255,0.18)]
        "
      >
        <Icon
          className="
            w-8 h-8 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.35)]
            transition-all duration-300
            group-hover:rotate-[12deg]
            group-hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]
          "
        />
      </div>

      <span className="text-sm font-semibold tracking-wide text-gray-200">
        {label}
      </span>
    </button>
  );
}
