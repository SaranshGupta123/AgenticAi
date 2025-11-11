import React, { useState, useMemo, useCallback } from "react";
import {
  Link as LinkIcon,
  Send,
  Scale,
  MessageCircleQuestion,
  GitBranch,
  Network,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Feather,
  GraduationCap,
  ClipboardList,
  Zap,
  Cpu,
} from "lucide-react";
import {
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

const SourceItem: React.FC<{ s: Source }> = ({ s }) => (
  <a
    href={s.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 px-4 py-3 bg-[#1A1D24] border border-gray-700/50 rounded-xl hover:bg-[#2A2F37] transition-all duration-200 cursor-pointer shadow-md shadow-black/20 group transform hover:scale-[1.01] active:scale-[0.98] hover:border-teal-500/50"
    title={s.title}
  >
    <FileText className="w-5 h-5 text-teal-400 group-hover:text-teal-300 flex-shrink-0" />
    <span className="text-sm flex-1 font-medium text-gray-100 truncate group-hover:text-white">
      {s.title}
    </span>
    {s.href && (
      <LinkIcon className="w-4 h-4 text-gray-500 group-hover:text-teal-400 flex-shrink-0" />
    )}
  </a>
);

const MessageBubble: React.FC<{ m: Message }> = ({ m }) => {
  const isUser = m.role === "user";
  const bubbleClasses = isUser
    ? "bg-teal-600 ml-auto text-white rounded-t-2xl rounded-bl-2xl rounded-br-md shadow-xl shadow-teal-900/50"
    : "bg-[#1D222A] text-gray-200 border border-teal-600/30 rounded-t-2xl rounded-br-2xl rounded-bl-md shadow-xl shadow-black/30";

  return (
    <div key={m.text} className="space-y-3">
      <div
        className={`text-sm max-w-[80%] px-4 py-3 transition-all duration-300 transform hover:scale-[1.01] ${bubbleClasses}`}
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
      </div>

      {!isUser && m.sources?.length > 0 && (
        <div className="max-w-[80%] bg-[#1A1D24] border border-teal-700/20 rounded-xl p-3 space-y-2 text-xs shadow-lg shadow-black/20">
          <p className="text-gray-400 font-semibold mb-2 border-b border-gray-700/50 pb-1 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-teal-400" />
            Sources Used
          </p>
          {m.sources.map((src, idx) => (
            <div
              key={idx}
              className="bg-[#21252C] border border-gray-700/50 p-3 rounded-lg space-y-2 hover:bg-[#282D35] transition-colors"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-300 font-medium break-words flex items-center gap-1">
                    {src.href ? (
                      <a
                        href={src.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-400 underline hover:text-teal-300 transition-colors"
                      >
                        {src.source}
                      </a>
                    ) : (
                      src.source
                    )}
                    {src.page && (
                      <span className="text-gray-500 text-xs ml-2">
                        (Page {src.page})
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {src.content_snippet && (
                <div className="pl-3 border-l-2 border-teal-500/70 mt-2">
                  <p className="italic text-gray-400 text-xs leading-relaxed">
                    "{src.content_snippet}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {!isUser && m.metadata && (
        <div className="max-w-[80%] bg-[#1A1D24] border border-white/10 rounded-xl p-3 text-xs text-gray-400 space-y-1 shadow-inner shadow-black/20">
          <p>
            <span className="text-gray-300 font-medium">Domain:</span>{" "}
            {m.metadata.active_domain}
          </p>
          <p>
            <span className="text-gray-300 font-medium">Response Time:</span>{" "}
            {m.metadata.total_time}s
          </p>
        </div>
      )}
    </div>
  );
};
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
      const offline = await fetchLocalNotebookData("Medical");

      if (!offline) {
        throw new Error("Failed to load Medical.json");
      }

      if (
        offline.retrieved_context &&
        Array.isArray(offline.retrieved_context)
      ) {
        setSources((prev) => {
          const normalized = offline.retrieved_context.map((src, index) => ({
            id: `src-${Date.now()}-${index}`,
            type: "file" as const,
            title: src.source || "Unknown Document",
            href: src.href || undefined,
          }));

          const combinedSources = [...prev, ...normalized];
          const uniqueSourcesMap = new Map();
          for (const source of combinedSources) {
            if (!uniqueSourcesMap.has(source.title)) {
              uniqueSourcesMap.set(source.title, source);
            }
          }

          return Array.from(uniqueSourcesMap.values());
        });
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: offline.answer ?? "⚠️ No answer available.",
          sources: offline.retrieved_context ?? [],
          metadata: offline.metadata ?? null,
        },
      ]);

      if (offline.mindmap) {
        setMindmapData(offline.mindmap?.mindmap ?? offline.mindmap);
      }
    } catch (error) {
      console.error("❌ Error loading local data:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Failed to load data. Please ensure Medical.json exists in /public/data/ folder or check your API mock.",
          sources: [],
          metadata: null,
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
    <div className="h-screen w-screen bg-[#0E1116] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-700/50 bg-[#14171C] shadow-2xl shadow-black/70 z-10">
        <h1 className="text-3xl font-extrabold text-teal-400 tracking-wider flex items-center gap-3">
          <Zap className="w-7 h-7" />
          {title ?? "Notebook Workspace"}
        </h1>
        <button
          onClick={goBack}
          className="px-5 py-2.5 rounded-full bg-[#1A1D24] border border-teal-600/50 text-sm font-bold text-teal-400 hover:bg-teal-600 hover:text-white transition-all duration-300 transform hover:scale-[1.03] shadow-md shadow-black/50 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
      </header>

      <div
        className="flex-1 h-full min-h-0 overflow-hidden grid"
        style={{
          gridTemplateColumns: `${collapseSources ? "64px" : "320px"} 1fr ${
            collapseStudio ? "64px" : "360px"
          }`,
        }}
      >
        {!collapseSources && (
          <div className="flex-shrink-0 border-r border-gray-700/50 overflow-hidden">
            <aside className="h-full p-6 flex flex-col gap-5 bg-[#14171C]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-100 border-b-2 border-teal-500/50 pb-1">
                  Sources ({sources.length})
                </h2>
                <button
                  onClick={() => setCollapseSources(true)}
                  className="p-1.5 rounded-full hover:bg-[#3E4550] transition-colors duration-200"
                  aria-label="Collapse Sources"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 bg-[#1A1D24] border border-gray-700/50 rounded-2xl p-4 space-y-4 overflow-y-auto shadow-inner shadow-black/40">
                {sources.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Start a conversation to automatically ingest and list
                    relevant sources here.
                  </div>
                ) : (
                  sources.map((s) => <SourceItem key={s.id} s={s} />)
                )}
              </div>
            </aside>
          </div>
        )}

        {collapseSources && (
          <button
            onClick={() => setCollapseSources(false)}
            className="w-full h-full border-r border-gray-700/50 flex justify-center items-center hover:bg-[#1D222A] transition-colors duration-200"
            aria-label="Expand Sources"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <section className="flex-1 h-full min-h-0 border-r border-gray-700/50 p-6 flex flex-col gap-4 bg-[#10141A]">
          <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
            <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400 animate-pulse" />
              Chatting with **{title ?? "Notebook"}**{" "}
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Context: Medical.json)
              </span>
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">Mindmap Mode</span>
              <label className="relative inline-flex cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={enableMindmap}
                  onChange={() => setEnableMindmap(!enableMindmap)}
                />
                <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 transition-colors group-hover:ring-1 ring-teal-500/50"></div>
                <span className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full peer-checked:translate-x-5 transition-transform shadow-md"></span>
              </label>
            </div>
          </div>

          <div
            className="flex-1 bg-[#171A1F] border border-gray-700/50 rounded-2xl p-5
     overflow-y-auto overflow-x-hidden space-y-8 shadow-xl shadow-black/30"
          >
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <MessageCircleQuestion className="w-10 h-10 mb-4 text-gray-600" />
                <p className="text-lg font-semibold">
                  Start your knowledge exploration.
                </p>
                <p className="text-sm">
                  Ask a question to load sources and get an answer from your
                  notebook data.
                </p>
              </div>
            ) : (
              messages.map((m, i) => <MessageBubble key={i} m={m} />)
            )}

            {isLoading && (
              <div className="text-gray-300 flex gap-3 items-center ml-2">
                <RefreshCw
                  className="w-4 h-4 text-teal-400 animate-spin"
                  aria-hidden="true"
                />
                <span className="text-sm">
                  Generating intelligent response...
                </span>
              </div>
            )}
          </div>

          <div className="px-1 pb-1">
            <div className="flex items-center bg-[#1D222A] border border-teal-700/50 rounded-full px-5 py-3 focus-within:ring-2 focus-within:ring-teal-500/70 transition-all duration-300 shadow-xl shadow-black/40">
              <input
                disabled={isLoading}
                className="flex-1 bg-transparent outline-none text-base text-gray-100 placeholder-gray-500"
                placeholder="Ask a question or generate a quick summary..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-teal-900/50 disabled:shadow-none"
                aria-label="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
        {!collapseStudio && (
          <div className="flex-shrink-0 border-l border-gray-700/50 overflow-y-auto">
            <aside className="h-full p-6 flex flex-col bg-[#14171C]">
              <div className="flex justify-between items-center pb-3 mb-5">
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 border-b-2 border-teal-500/50 pb-1">
                  <Zap className="w-5 h-5 text-teal-400" />
                  AI Studio Tools
                </h2>
                <button
                  onClick={() => setCollapseStudio(true)}
                  className="p-1.5 rounded-full hover:bg-[#3E4550] transition-colors duration-200"
                  aria-label="Collapse Studio"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ToolCard
                  icon={GitBranch}
                  label="Mind Map"
                  onClick={() => setShowMindmapCreateModal(true)}
                />
                <ToolCard
                  icon={Scale}
                  label="Comparative Analysis"
                  onClick={comparative.open}
                />
                <ToolCard
                  icon={MessageCircleQuestion}
                  label="FAQ"
                  onClick={faq.open}
                />
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
                  icon={Feather}
                  label="Blog Post"
                  onClick={blog.open}
                />
                <ToolCard
                  icon={GraduationCap}
                  label="Study Guide"
                  onClick={study.open}
                />
                <ToolCard
                  icon={ClipboardList}
                  label="Briefing"
                  onClick={briefing.open}
                />
              </div>

              <div className="mt-8 pt-4 border-t border-gray-700/50 space-y-3">
                <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700/50 pb-2">
                  Tool Results
                </h3>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto p-2 -m-2">
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
                      title="Technical Report Ready"
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
                </div>
              </div>
            </aside>
          </div>
        )}

        {collapseStudio && (
          <button
            onClick={() => setCollapseStudio(false)}
            className="w-full h-full flex justify-center items-center border-l border-gray-700/50 hover:bg-[#1D222A] transition-colors duration-200"
            aria-label="Expand Studio"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {showMindmapViewer && mindmapData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-auto p-4">
          <div className="w-[95vw] h-[95vh] bg-[#14171C] border border-teal-500/30 rounded-2xl relative p-5 flex flex-col mx-auto shadow-2xl shadow-teal-900/50">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700/50 pb-2">
              Mind Map Viewer
            </h3>
            <button
              onClick={() => setShowMindmapViewer(false)}
              className="absolute top-5 right-5 text-gray-300 text-2xl hover:text-red-400 z-50 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all duration-200 transform hover:scale-110"
              aria-label="Close Mindmap Viewer"
            >
              ✕
            </button>

            <div className="flex-1 h-full overflow-y-auto rounded-xl bg-[#1A1D24]">
              <MindmapNotebookLM data={mindmapData} />
            </div>
          </div>
        </div>
      )}

      {showMindmapCreateModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-[#10141A] border border-teal-500/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-teal-900/40">
            <h3 className="text-2xl text-teal-400 font-bold border-b border-gray-700/50 pb-3">
              Generate Mind Map
            </h3>
            <p className="text-sm text-gray-400">
              Enter the main topic for the AI to analyze your notebook data and
              generate a visual mind map.
            </p>
            <input
              value={mindmapTopic}
              onChange={(e) => setMindmapTopic(e.target.value)}
              placeholder="E.g., Key concepts of Medical.json"
              className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-teal-500 transition-shadow text-white placeholder-gray-500"
              onKeyDown={(e) => e.key === "Enter" && handleMindmapGenerate()}
            />
            <button
              onClick={handleMindmapGenerate}
              disabled={!mindmapTopic.trim() || mindmapLoading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-lg shadow-teal-900/60"
            >
              {mindmapLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Mindmap...
                </span>
              ) : (
                "Generate Mind Map"
              )}
            </button>
            <button
              onClick={() => setShowMindmapCreateModal(false)}
              className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all duration-200 transform hover:scale-[1.01] text-gray-200"
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
