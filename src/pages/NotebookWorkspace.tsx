import React, { useState, useEffect } from "react";
import {
  Upload,
  Link as LinkIcon,
  Trash2,
  Send,
  Mic,
  Video,
  Network,
  FileText,
  BookOpen,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  askRagQuestion,
  generateMindmap,
  fetchLocalNotebookData,
} from "../api/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MindmapNotebookLM from "./MindmapNotebookLM";

type Source = {
  id: string;
  type: "url" | "file";
  title: string;
  href?: string;
};

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: any[];
  metadata?: any;
};

type Props = {
  goBack: () => void;
  title?: string;
};

export default function NotebookWorkspace({ goBack, title }: Props) {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [collapseSources, setCollapseSources] = useState(false);
  const [collapseStudio, setCollapseStudio] = useState(false);

  const [enableMindmap, setEnableMindmap] = useState(false);
  const [mindmapData, setMindmapData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [showMindmapCreateModal, setShowMindmapCreateModal] = useState(false);
  const [mindmapTopic, setMindmapTopic] = useState("");
  const [mindmapLoading, setMindmapLoading] = useState(false);

  const [studioTab, setStudioTab] = useState<"tools" | "mindmap">("tools"); // ✅ NEW

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      const res = await askRagQuestion(text);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: res.answer ?? "No answer returned.",
          sources: res.retrieved_context ?? [],
          metadata: res.metadata ?? null,
        },
      ]);

      if (res.mindmap) {
        setMindmapData(res.mindmap?.mindmap ?? res.mindmap);
      }
    } catch {
      console.log("⚠️ API failed → Using offline JSON");
      const offline = await fetchLocalNotebookData(title ?? "default");

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: offline?.answer ?? "⚠️ No offline data available.",
          sources: offline?.retrieved_context ?? [],
          metadata: offline?.metadata ?? null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMindmapGenerate = async () => {
    if (!mindmapTopic.trim()) return;
    setMindmapLoading(true);

    try {
      const data = await generateMindmap(mindmapTopic);
      setMindmapData(data);
      setShowMindmapCreateModal(false);
    } catch (err) {
      console.error("Mindmap Error:", err);
    } finally {
      setMindmapLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#1B1F24] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-[20px] font-semibold">{title ?? "Notebook"}</h1>
        <button
          onClick={goBack}
          className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm"
        >
          Back
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`transition-all duration-300 ${
            collapseSources ? "w-0" : "w-[340px]"
          } border-r border-white/10 overflow-hidden`}
        >
          {!collapseSources && (
            <aside className="h-full p-4 flex flex-col gap-3">
              <div className="flex justify-between">
                <h2 className="text-sm text-gray-300">Sources</h2>
                <button onClick={() => setCollapseSources(true)}>
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="flex-1 bg-[#1E2228] border border-white/10 rounded-xl p-2 space-y-2 overflow-auto">
                {sources.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-2 px-2 py-2 bg-[#2A2F37] border border-white/10 rounded-lg"
                  >
                    <LinkIcon className="w-4 h-4 text-red-400" />
                    <span className="text-sm flex-1 truncate">{s.title}</span>
                    <button
                      onClick={() =>
                        setSources((prev) => prev.filter((x) => x.id !== s.id))
                      }
                    >
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </aside>
          )}
        </div>

        {collapseSources && (
          <button
            onClick={() => setCollapseSources(false)}
            className="w-6 border-r border-white/10 flex justify-center items-center"
          >
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <section className="flex-1 border-r border-white/10 p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <p className="text-sm text-gray-300">Chat with your notebook</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Mindmap Mode</span>
              <label className="relative inline-flex cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={enableMindmap}
                  onChange={() => setEnableMindmap(!enableMindmap)}
                />
                <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-blue-600"></div>
                <span className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full peer-checked:translate-x-5 transition"></span>
              </label>
            </div>
          </div>

          <div className="flex-1 bg-[#1E2228] border border-white/10 rounded-xl p-4 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <div key={i} className="space-y-3">
                <div
                  className={`text-sm max-w-[80%] px-3 py-2 rounded-lg ${
                    m.role === "user"
                      ? "bg-blue-600 ml-auto text-white"
                      : "bg-[#2B2F36] text-gray-200"
                  }`}
                >
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.text}
                  </ReactMarkdown>
                </div>

                {m.role === "assistant" && m.sources?.length > 0 && (
                  <div className="max-w-[80%] bg-[#1E2228] border border-white/10 rounded-md p-3 space-y-2 text-xs">
                    <p className="text-gray-400 font-semibold">Sources Used:</p>
                    {m.sources.map((src, idx) => (
                      <div
                        key={idx}
                        className="bg-[#2B2F36] border border-white/10 p-2 rounded-md"
                      >
                        <p>
                          <span className="text-gray-400">Source:</span>{" "}
                          {src.source}
                        </p>
                        <p>
                          <span className="text-gray-400">Page:</span>{" "}
                          {src.page}
                        </p>
                        <p className="italic text-gray-300 mt-1">
                          "{src.content_snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {m.role === "assistant" && m.metadata && (
                  <div className="max-w-[80%] bg-[#1E2228] border border-white/10 rounded-md p-3 text-xs text-gray-300">
                    <p>
                      <span className="text-gray-400">Domain:</span>{" "}
                      {m.metadata.active_domain}
                    </p>
                    <p>
                      <span className="text-gray-400">Query:</span>{" "}
                      {m.metadata.query}
                    </p>
                    <p>
                      <span className="text-gray-400">Response Time:</span>{" "}
                      {m.metadata.total_time}s
                    </p>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="text-gray-300 flex gap-2 items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-300"></span>
              </div>
            )}
          </div>

          <div className="px-1 pb-1">
            <div className="flex items-center bg-[#2B2F36] border border-white/10 rounded-xl px-2 py-2">
              <input
                disabled={isLoading}
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <Send
                onClick={sendMessage}
                className="w-5 h-5 text-gray-300 hover:text-white cursor-pointer"
              />
            </div>
          </div>
        </section>

        <div
          className={`transition-all duration-300 ${
            collapseStudio ? "w-0" : "w-[360px]"
          } overflow-hidden`}
        >
          {!collapseStudio && (
            <aside className="h-full p-4 flex flex-col">
              {/* TAB BUTTONS */}
              <div className="flex gap-2 border-b border-white/10 pb-2 mb-3">
                <button
                  onClick={() => setStudioTab("tools")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    studioTab === "tools" ? "bg-blue-600" : "bg-[#2B2F36]"
                  }`}
                >
                  Tools
                </button>

                <button
                  onClick={() => mindmapData && setStudioTab("mindmap")}
                  className={`px-3 py-1 rounded-md text-sm ${
                    studioTab === "mindmap" ? "bg-blue-600" : "bg-[#2B2F36]"
                  }`}
                  disabled={!mindmapData}
                >
                  Mindmap
                </button>
              </div>

              {studioTab === "tools" && (
                <div className="grid grid-cols-2 gap-3">
                  <ToolCard
                    icon={Network}
                    label="Mind Map"
                    onClick={() => setShowMindmapCreateModal(true)}
                  />
                  <ToolCard icon={Mic} label="Audio Overview" />
                  <ToolCard icon={Video} label="Video Overview" />
                  <ToolCard icon={FileText} label="Reports" />
                  <ToolCard icon={BookOpen} label="Flashcards" />
                  <ToolCard icon={HelpCircle} label="Quiz" />
                </div>
              )}

              {studioTab === "mindmap" && (
                <div className="flex-1 flex justify-center items-center">
                  <button
                    onClick={() => setShowMindmapCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
                  >
                    View Mindmap
                  </button>
                </div>
              )}
            </aside>
          )}
        </div>
      </div>
      {(showMindmapCreateModal || studioTab === "mindmap") && mindmapData && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="w-[90vw] h-[85vh] bg-[#1E2228] border border-white/10 rounded-xl relative p-3">
            <button
              onClick={() => setShowMindmapCreateModal(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-red-400"
            >
              ✕
            </button>
            <MindmapNotebookLM data={mindmapData} />
          </div>
        </div>
      )}

      {showMindmapCreateModal && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1E2228] border border-white/10 rounded-xl p-6 w-[380px] space-y-4">
            <h3 className="text-sm text-gray-200 font-semibold">
              Generate Mind Map
            </h3>

            <input
              value={mindmapTopic}
              onChange={(e) => setMindmapTopic(e.target.value)}
              placeholder="Enter topic..."
              className="w-full px-3 py-2 bg-[#2B2F36] border border-white/10 rounded-lg text-sm outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleMindmapGenerate()}
            />

            <button
              onClick={handleMindmapGenerate}
              disabled={mindmapLoading}
              className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            >
              {mindmapLoading ? "Generating..." : "Generate"}
            </button>

            <button
              onClick={() => setShowMindmapCreateModal(false)}
              className="w-full py-2 rounded-lg bg-[#33383F] hover:bg-[#3E4550]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ToolCard({ icon: Icon, label, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl bg-[#1E2228] border border-white/10 hover:bg-[#262B33] px-3 py-3 flex items-center gap-3 transition"
    >
      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
        <Icon className="w-4 h-4 text-gray-200" />
      </div>
      <span className="text-sm text-gray-200">{label}</span>
    </button>
  );
}
