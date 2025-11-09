import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AnswerDetails from "./AnswerDetails";

export function SearchModal({ tool, title }: any) {
  if (!tool.showSearchModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[600px] bg-[#1E2228] border border-white/10 rounded-xl p-5 relative">
        <button
          onClick={() => tool.setShowSearchModal(false)}
          className="absolute top-3 right-4 text-xl text-gray-300 hover:text-red-400"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>

        <input
          value={tool.question}
          onChange={(e) => tool.setQuestion(e.target.value)}
          placeholder="Ask something..."
          className="w-full px-3 py-2 bg-[#2B2F36] border border-white/10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white"
        />

        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={() => tool.setShowSearchModal(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-[#33383F] text-gray-300 hover:bg-[#3E4550] transition"
          >
            Cancel
          </button>
          <button
            onClick={tool.search}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition"
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
      <div className="w-[650px] bg-[#14171C]/90 rounded-xl border border-white/10 shadow-xl shadow-black/60 p-6 relative backdrop-blur-md">
        <button
          onClick={() => tool.setShowAnswerModal(false)}
          className="absolute top-3 right-4 text-xl text-gray-300 hover:text-red-400"
        >
          ✕
        </button>
        <h2 className="text-lg font-semibold text-white mb-4">{title}</h2>

        <div className="text-gray-300 text-sm leading-relaxed border border-white/10 rounded-lg p-4 max-h-[80vh] overflow-y-scroll space-y-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {tool.answer?.content ?? "No content available."}
          </ReactMarkdown>

          <AnswerDetails answer={tool.answer} />
        </div>
      </div>
    </div>
  );
}

export function ToolCard({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-[#1A1D22]/70 backdrop-blur-sm border border-white/10
      hover:border-blue-500/40 hover:bg-[#23272F]
      px-4 py-6 text-white text-center flex flex-col items-center justify-center space-y-2 transition-all duration-200"
    >
      <Icon size={24} className="text-blue-400" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
