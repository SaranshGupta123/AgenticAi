import React, { useState } from "react";
import {
  Link as LinkIcon,
  Trash2,
  Send,
  Mic,
  Video,
  Network,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  askRagQuestion,
  generateMindmap,
  fetchLocalNotebookData,
  fetchFAQ,
  fetchComparativeAnalysis,
  fetchTutorial,
  fetchTechnicalReport,
  fetchBlogPost,
  fetchStudyGuide,
  fetchBriefing,
} from "../api/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MindmapNotebookLM from "./MindmapNotebookLM";
import AnswerDetails from "../components/AnswerDetails";
import {
  SearchModal,
  AnswerModal,
  ToolCard,
} from "../components/ContentToolView";
import ResultCardSimple from "../components/ResultCardSimple";

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

type Splitter = {
  splitRegex: RegExp;
  addPrefix?: (text: string) => string;
};

function scoreBestMatch(blocks: string[], query: string) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  const parts = q.split(/\s+/).filter((w) => w.length > 3);
  let best: { block: string; score: number } | null = null;
  for (const b of blocks) {
    const t = b.toLowerCase();
    const score = parts.reduce((s, w) => (t.includes(w) ? s + 1 : s), 0);
    if (!best || score > best.score) best = { block: b, score };
  }
  return best && best.score > 0 ? best.block.trim() : null;
}

function useContentTool(fetcher: () => Promise<any>, splitter: Splitter) {
  const [data, setData] = useState<any | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<any | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const open = async () => {
    const d = await fetcher();
    setData(d);
    setQuestion("");
    setAnswer("");
    setShowSearchModal(true);
  };

  const search = () => {
    if (!data) return;

    let finalContent = "";
    if (Array.isArray(data.sections)) {
      finalContent = data.sections
        .map((s) => `## ${s.heading}\n\n${s.content}`)
        .join("\n\n");
    } else if (typeof data.content === "string") {
      finalContent = data.content.trim();
    } else if (typeof data.text === "string") {
      finalContent = data.text.trim();
    } else {
      finalContent = JSON.stringify(data, null, 2);
    }

    setAnswer({
      content: finalContent,
      metadata: data.metadata ?? null,
      sources: data.sources ?? [],
      citations: data.citations ?? [],
      quality_metrics: data.quality_metrics ?? null,
    });

    setShowSearchModal(false);
    setShowAnswerModal(true);
    setShowCard(true);
  };

  return {
    data,
    question,
    setQuestion,
    answer,
    showSearchModal,
    setShowSearchModal,
    showAnswerModal,
    setShowAnswerModal,
    showCard,
    setShowCard,
    open,
    search,
  };
}

type Props = { goBack: () => void; title?: string };

export default function NotebookWorkspace({ goBack, title }: Props) {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [collapseSources, setCollapseSources] = useState(false);
  const [collapseStudio, setCollapseStudio] = useState(false);

  const [enableMindmap, setEnableMindmap] = useState(false);
  const [mindmapData, setMindmapData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [mindmapReady, setMindmapReady] = useState(false);
  const [showMindmapViewer, setShowMindmapViewer] = useState(false);
  const [showMindmapCreateModal, setShowMindmapCreateModal] = useState(false);
  const [mindmapTopic, setMindmapTopic] = useState("");
  const [mindmapLoading, setMindmapLoading] = useState(false);

  const [studioTab, setStudioTab] = useState<"tools" | "mindmap">("tools");

  const faq = useContentTool(fetchFAQ, {
    splitRegex: /##\s+/g,
    addPrefix: (t) => "## " + t,
  });

  const comparative = useContentTool(fetchComparativeAnalysis, {
    splitRegex: /\n#+\s+/g,
  });

  const tutorial = useContentTool(fetchTutorial, {
    splitRegex: /##\s+/g,
    addPrefix: (t) => "## " + t,
  });

  const report = useContentTool(fetchTechnicalReport, {
    splitRegex: /\n#+\s+/g,
  });

  const blog = useContentTool(fetchBlogPost, {
    splitRegex: /##\s+/g,
    addPrefix: (t) => "## " + t,
  });

  const study = useContentTool(fetchStudyGuide, {
    splitRegex: /##\s+/g,
    addPrefix: (t) => "## " + t,
  });

  const briefing = useContentTool(fetchBriefing, {
    splitRegex: /##\s+/g,
    addPrefix: (t) => "## " + t,
  });

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
      if (res.mindmap) setMindmapData(res.mindmap?.mindmap ?? res.mindmap);
    } catch {
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

      setMindmapReady(true);
      setShowMindmapCreateModal(false);
      setShowMindmapViewer(true);
    } finally {
      setMindmapLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-[#0B0E12] via-[#13171D] to-[#1B1F24] text-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0D1014]/70 backdrop-blur-md shadow-md shadow-black/40">
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
                      ? "bg-blue-600 ml-auto text-white shadow-lg shadow-blue-900/40"
                      : "bg-[#23272F] text-gray-200 border border-white/5 shadow-md shadow-black/30"
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
          } border-l border-white/10 overflow-hidden`}
        >
          {!collapseStudio && (
            <aside className="h-full p-4 flex flex-col">
              <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                <h2 className="text-sm text-gray-300">Studio</h2>
                <button onClick={() => setCollapseStudio(true)}>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {studioTab === "tools" && (
                <div className="grid grid-cols-2 gap-3">
                  <ToolCard
                    icon={Network}
                    label="Mind Map"
                    onClick={() => setShowMindmapCreateModal(true)}
                  />
                  <ToolCard
                    icon={Mic}
                    label="Comparative Analysis"
                    onClick={comparative.open}
                  />
                  <ToolCard icon={Video} label="FAQ" onClick={faq.open} />
                  <ToolCard
                    icon={BookOpen}
                    label="Tutorial"
                    onClick={tutorial.open}
                  />
                  <ToolCard
                    icon={FileText}
                    label="Technical Report"
                    onClick={report.open}
                  />
                  <ToolCard
                    icon={BookOpen}
                    label="Blog Post"
                    onClick={blog.open}
                  />
                  <ToolCard
                    icon={FileText}
                    label="Study Guide"
                    onClick={study.open}
                  />
                  <ToolCard
                    icon={FileText}
                    label="Briefing"
                    onClick={briefing.open}
                  />
                </div>
              )}

              {faq.showCard && (
                <ResultCardSimple
                  title="FAQ Results Ready"
                  onClick={() => faq.setShowAnswerModal(true)}
                />
              )}
              {comparative.showCard && (
                <ResultCardSimple
                  title="Comparative Insights Ready"
                  onClick={() => comparative.setShowAnswerModal(true)}
                />
              )}
              {tutorial.showCard && (
                <ResultCardSimple
                  title="Tutorial Result Ready"
                  onClick={() => tutorial.setShowAnswerModal(true)}
                />
              )}
              {report.showCard && (
                <ResultCardSimple
                  title="Technical Report Result Ready"
                  onClick={() => report.setShowAnswerModal(true)}
                />
              )}
              {blog.showCard && (
                <ResultCardSimple
                  title="Blog Content Ready"
                  onClick={() => blog.setShowAnswerModal(true)}
                />
              )}
              {study.showCard && (
                <ResultCardSimple
                  title="Study Guide Ready"
                  onClick={() => study.setShowAnswerModal(true)}
                />
              )}
              {briefing.showCard && (
                <ResultCardSimple
                  title="Briefing Ready"
                  onClick={() => briefing.setShowAnswerModal(true)}
                />
              )}
              {mindmapReady && (
                <ResultCardSimple
                  title="Mindmap Ready"
                  onClick={() => setShowMindmapViewer(true)}
                />
              )}
            </aside>
          )}
        </div>

        {collapseStudio && (
          <button
            onClick={() => setCollapseStudio(false)}
            className="w-6 flex justify-center items-center border-l border-white/10"
          >
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {showMindmapViewer && mindmapData && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm overflow-auto p-6">
          <div className="w-[90vw] min-h-[85vh] bg-[#1E2228] border border-white/10 rounded-xl relative p-3 flex flex-col mx-auto shadow-2xl">
            <button
              onClick={() => {
                setShowMindmapViewer(false);
                setShowMindmapCreateModal(false);
                setStudioTab("tools");
              }}
              className="absolute top-4 right-4 text-white text-2xl hover:text-red-400 z-50"
            >
              ✕
            </button>

            <div className="flex-1 overflow-hidden rounded-lg">
              <MindmapNotebookLM data={mindmapData} />
            </div>
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

      <SearchModal tool={faq} title="FAQ Search" />
      <SearchModal tool={comparative} title="Comparative Analysis" />
      <SearchModal tool={tutorial} title="Tutorial Search" />
      <SearchModal tool={report} title="Technical Report Search" />
      <SearchModal tool={blog} title="Blog Search" />
      <SearchModal tool={study} title="Study Guide Search" />
      <SearchModal tool={briefing} title="Briefing Search" />

      <AnswerModal tool={faq} title="FAQ Result" />
      <AnswerModal tool={comparative} title="Comparison Result" />
      <AnswerModal tool={tutorial} title="Tutorial Result" />
      <AnswerModal tool={report} title="Technical Report Result" />
      <AnswerModal tool={blog} title="Blog Result" />
      <AnswerModal tool={study} title="Study Guide Result" />
      <AnswerModal tool={briefing} title="Briefing Result" />
    </div>
  );
}
