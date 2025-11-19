import React, { useState, useMemo, useCallback } from "react";
import {
  LinkIcon,
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
  fetchMindmapFromAPI,
  fetchFAQFromAPI,
  fetchComparativeAnalysisFromAPI,
  fetchTutorialFromAPI,
  fetchTechnicalReportFromAPI,
  fetchBlogPostFromAPI,
  fetchStudyGuideFromAPI,
  fetchBriefingFromAPI,
  fetchNotebookAnswerFromAPI,
  fetchLocalPDFsAPI,
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
import { saveLS, loadLS } from "../components/storage";

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
function useContentTool(
  fetcher: () => Promise<any>,
  splitter: Splitter,
  storageKey: string
) {
  const [data, setData] = useState<any | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<any | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(
    loadLS(`${storageKey}_modal`, false)
  );
  const [showCard, setShowCard] = useState(false);

  const open = async () => {
    try {
      const d = await fetcher();
      setData(d);
      setQuestion("");

      setTimeout(() => {
        let finalContent = "";

        if (Array.isArray(d.sections)) {
          finalContent = d.sections
            .map((s) => `## ${s.heading}\n\n${s.content}`)
            .join("\n\n");
        } else if (typeof d.content === "string") {
          finalContent = d.content.trim();
        } else if (typeof d.text === "string") {
          finalContent = d.text.trim();
        } else {
          finalContent = JSON.stringify(d, null, 2);
        }

        setAnswer({
          content: finalContent,
          metadata: d.metadata ?? null,
          sources: d.sources ?? [],
          citations: d.citations ?? [],
          quality_metrics: d.quality_metrics ?? null,
        });

        setShowSearchModal(false);
        setShowAnswerModal(true);
        setShowCard(true);
      }, 100);
    } catch (err) {
      console.error("⚠️ Error in open():", err);
    }
  };

  return {
    data,
    question,
    setQuestion,
    answer,
    showSearchModal,
    setShowSearchModal,
    showAnswerModal,
    setShowAnswerModal: (value) => {
      saveLS(`${storageKey}_modal`, value);
      setShowAnswerModal(value);
    },
    showCard,
    setShowCard,
    open,
    setAnswer,
  };
}

const MessageBubble: React.FC<{ m: Message }> = ({ m }) => {
  const isUser = m.role === "user";

  const bubbleClasses = isUser
    ? "bg-gray-700 text-white rounded-2xl shadow-xl shadow-black/60/50"
    : "bg-[#1D222A] text-gray-200 border border-gray-700/30 rounded-2xl shadow-xl shadow-black/30";

  return (
    <div key={m.text} className="w-full flex justify-center">
      <div
        className={`w-full max-w-[800px] flex flex-col space-y-3 ${
          isUser ? "items-end" : "items-center"
        }`}
      >
        <div
          className={`text-sm px-4 py-3 w-fit transition-all duration-300 hover:scale-[1.01] ${
            isUser ? "max-w-[420px] -translate-x-2" : "max-w-[780px]"
          } ${bubbleClasses}`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
        </div>

        {!isUser && m.sources?.length > 0 && (
          <div className="max-w-[780px] w-full bg-[#1A1D24] border border-teal-700/20 rounded-xl p-3 space-y-2 text-xs shadow-lg shadow-black/20">
            <p className="text-gray-400 font-semibold mb-2 border-b border-gray-700/50 pb-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-gray-300" />
              Sources Used
            </p>
            {m.sources.map((src, idx) => (
              <div
                key={idx}
                className="bg-[#21252C] border border-gray-700/50 p-3 rounded-lg space-y-2 hover:bg-[#282D35] transition"
              >
                <p className="text-gray-300 font-medium break-words flex items-center gap-1">
                  {src.href ? (
                    <a
                      href={src.href}
                      target="_blank"
                      className="text-gray-300 underline hover:text-teal-300"
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

                {src.content_snippet && (
                  <div className="pl-3 border-l-2 border-gray-600/70 mt-2">
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
          <div className="max-w-[780px] w-full bg-[#1A1D24] border border-white/10 rounded-xl p-3 text-xs text-gray-400 space-y-1 shadow-inner shadow-black/20">
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
    </div>
  );
};

type Props = { goBack: () => void; title?: string };

const AnimatedSourceGuide: React.FC<{ source: Source; onBack: () => void }> = ({
  source,
  onBack,
}) => {
  const [scrollProgress, setScrollProgress] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleScroll = () => {
      const progress =
        (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
      setScrollProgress(progress || 0);
    };

    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <button
        onClick={onBack}
        className="text-gray-300 hover:text-white flex items-center gap-2 mb-3"
      >
        <ChevronLeft /> Back
      </button>

      <div className="h-1 w-full bg-gray-700/40 rounded overflow-hidden">
        <div
          className="h-full bg-teal-500 transition-all"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-[#1A1D24] border border-gray-700/50 rounded-2xl p-4 prose prose-invert"
      >
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {(source as any).source_guide || "No content available."}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default function NotebookWorkspace({ goBack, title }: Props) {
  const STUDIO_CARD_COLORS = [
    "rgba(255, 87, 87, 0.35)",
    "rgba(255, 140, 66, 0.35)",
    "rgba(255, 220, 90, 0.35)",
    "rgba(78, 205, 113, 0.35)",
    "rgba(66, 135, 245, 0.35)",
    "rgba(138, 97, 225, 0.35)",
    "rgba(240, 98, 146, 0.35)",
    "rgba(32, 201, 180, 0.35)",
  ];
  const [sources, setSources] = useState<Source[]>(() =>
    loadLS("nb_sources", [])
  );
  const [messages, setMessages] = useState<Message[]>(() =>
    loadLS("nb_messages", [])
  );
  const [input, setInput] = useState("");

  const [collapseSources, setCollapseSources] = useState(
    loadLS("nb_col_src", false)
  );
  const [collapseStudio, setCollapseStudio] = useState(
    loadLS("nb_col_studio", false)
  );

  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);

  const [enableMindmap, setEnableMindmap] = useState(false);
  const [mindmapData, setMindmapData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTexts = [
    "Thinking…",
    "Analyzing information…",
    "Searching notebook…",
    "Retrieving context…",
    "Generating answer…",
  ];
  const [loadingIndex, setLoadingIndex] = useState(0);

  const [mindmapReady, setMindmapReady] = useState(false);
  const [showMindmapViewer, setShowMindmapViewer] = useState(false);
  const [showMindmapCreateModal, setShowMindmapCreateModal] = useState(false);
  const [mindmapTopic, setMindmapTopic] = useState("");
  const [mindmapLoading, setMindmapLoading] = useState(false);

  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [briefingTopic, setBriefingTopic] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [faqTopic, setFAQTopic] = useState("");
  const [faqLoading, setFAQLoading] = useState(false);

  const [showComparativeModal, setShowComparativeModal] = useState(false);
  const [comparativeTopic, setComparativeTopic] = useState("");
  const [comparativeLoading, setComparativeLoading] = useState(false);

  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [tutorialTopic, setTutorialTopic] = useState("");
  const [tutorialLoading, setTutorialLoading] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTopic, setReportTopic] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTopic, setBlogTopic] = useState("");
  const [blogLoading, setBlogLoading] = useState(false);

  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyTopic, setStudyTopic] = useState("");
  const [studyLoading, setStudyLoading] = useState(false);

  const [leftWidth, setLeftWidth] = useState(loadLS("nb_left_width", 320));
  const [rightWidth, setRightWidth] = useState(loadLS("nb_right_width", 360));

  const [draggingLeft, setDraggingLeft] = useState(false);
  const [draggingRight, setDraggingRight] = useState(false);

  const MIN_LEFT = 250;
  const MAX_LEFT = 900;

  const MIN_RIGHT = 250;
  const MAX_RIGHT = 900;

  const currentDomain = title || "Medical";
  const DOMAIN_FILE_MAP = {
    Medical: "medical_pdfs.json",
    "AI Testing": "ai_testing_sources.json",
  };

  async function fetchLocalPDFs() {
    try {
      const domain = title || "Medical";
      console.log("[v0] Fetching PDFs for domain:", domain);

      const files = await fetchLocalPDFsAPI(domain);
      console.log("[v0] PDF files loaded:", files.length);

      const formatted = files.map((f, i) => ({
        id: `pdf-${i}`,
        type: "file",
        title: f.file_name || f.title || `PDF ${i + 1}`,
        source_guide: f.source_guide || "No source guide available",
      }));

      setSources(formatted);
      saveLS("nb_sources", formatted);
    } catch (err) {
      console.error("[v0] PDF fetch error:", err);
      alert(
        "Failed to load PDFs. Make sure /data/medical_pdfs.json or /data/ai_testing_sources.json exists."
      );
    }
  }

  const faq = useContentTool(
    async () => {
      const response = await fetchFAQFromAPI(
        currentDomain,
        "Frequently Asked Questions"
      );
      return {
        content: response.answer,
        metadata: response.metadata,
        sources: response.retrieved_context,
        citations: [],
        quality_metrics: null,
      };
    },

    { splitRegex: /##\s+/g, addPrefix: (t) => "## " + t },
    "nb_tool_faq"
  );
  const mindmapTool = useContentTool(
    async () => {
      const response = await fetchMindmapFromAPI(mindmapTopic);
      return {
        content: response.answer || "",
        metadata: response.metadata,
        sources: response.retrieved_context,
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_mindmap"
  );

  const comparative = useContentTool(
    async () => {
      const response = await fetchComparativeAnalysisFromAPI(comparativeTopic);
      return {
        content: response.content,
        metadata: response.metadata,
        sources: response.sources,
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_comparative"
  );

  const tutorial = useContentTool(
    async () => {
      const response = await fetchTutorialFromAPI(tutorialTopic);
      return {
        content: response.content,
        metadata: response.metadata,
        sources: response.sources,
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_tutorial"
  );

  const report = useContentTool(
    async () => {
      const response = await fetchTechnicalReportFromAPI(reportTopic);
      return {
        content: response.content,
        metadata: response.metadata,
        sources: response.sources,
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_report"
  );

  const blog = useContentTool(
    async () => {
      const response = await fetchBlogPostFromAPI(blogTopic);
      return {
        content: response.content,
        metadata: response.metadata,
        sources: response.sources,
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_blog"
  );

  const study = useContentTool(
    async () => {
      const response = await fetchStudyGuideFromAPI(studyTopic);
      return {
        content: response.content,
        metadata: response.metadata,
        sources: response.sources,
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_study"
  );

  const briefing = useContentTool(
    async () => {
      const response = await fetchBriefingFromAPI(briefingTopic);
      return {
        content: response.content,
        metadata: response.metadata,
        sources: response.sources,
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_briefing"
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      const currentDomain = title || "Medical";

      const response = await fetchNotebookAnswerFromAPI(currentDomain, text);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "",
          sources: response.retrieved_context ?? [],
          metadata: response.metadata ?? null,
        },
      ]);
      const fullText = response.answer || "";
      const words = fullText.split(" ");
      let index = 0;

      const interval = setInterval(() => {
        setMessages((prev) => {
          const updated = [...prev];
          saveLS("nb_messages", updated);
          updated[updated.length - 1].text = words.slice(0, index).join(" ");
          return updated;
        });

        index++;

        if (index > words.length) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 40);
      if (response.mindmap) {
        setMindmapData(response.mindmap);
      }
    } catch (error) {
      console.error("❌ API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Failed to fetch data from API. Please check your backend or ngrok link.",
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
      const data = await fetchMindmapFromAPI(mindmapTopic);

      mindmapTool.setAnswer({
        content: data.answer || "",
        sources: data.sources || [],
        metadata: data.metadata || null,
      });

      mindmapTool.setShowCard(true);
      mindmapTool.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠ Mindmap Error", err);
    } finally {
      setMindmapLoading(false);
      setShowMindmapCreateModal(false);
    }
  };

  const handleBriefingGenerate = async () => {
    if (!briefingTopic.trim()) return;
    setBriefingLoading(true);

    try {
      const data = await fetchBriefingFromAPI(briefingTopic);

      briefing.setAnswer({
        content: data.content,
        sources: data.sources,
        metadata: data.metadata,
      });

      briefing.setShowCard(true);
      briefing.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠ Briefing Error", err);
    } finally {
      setBriefingLoading(false);
      setShowBriefingModal(false);
    }
  };

  const handleFAQGenerate = async () => {
    if (!faqTopic.trim()) return;
    setFAQLoading(true);

    try {
      const response = await fetchFAQFromAPI(currentDomain, faqTopic);

      faq.setAnswer({
        content: response.answer,
        sources: response.retrieved_context,
        metadata: response.metadata,
      });

      faq.setShowCard(true);
      faq.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠️ FAQ error:", err);
    } finally {
      setFAQLoading(false);
      setShowFAQModal(false);
    }
  };

  const handleComparativeGenerate = async () => {
    if (!comparativeTopic.trim()) return;
    setComparativeLoading(true);

    try {
      const data = await fetchComparativeAnalysisFromAPI(comparativeTopic);

      comparative.setAnswer({
        content: data.content,
        sources: data.sources,
        metadata: data.metadata,
      });

      comparative.setShowCard(true);
      comparative.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠ Comparative Error", err);
    } finally {
      setComparativeLoading(false);
      setShowComparativeModal(false);
    }
  };

  const handleTutorialGenerate = async () => {
    if (!tutorialTopic.trim()) return;
    setTutorialLoading(true);

    try {
      const data = await fetchTutorialFromAPI(tutorialTopic);

      tutorial.setAnswer({
        content: data.content,
        sources: data.sources,
        metadata: data.metadata,
      });

      tutorial.setShowCard(true);
      tutorial.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠ Tutorial Error", err);
    } finally {
      setTutorialLoading(false);
      setShowTutorialModal(false);
    }
  };

  const handleReportGenerate = async () => {
    if (!reportTopic.trim()) return;
    setReportLoading(true);

    try {
      const data = await fetchTechnicalReportFromAPI(reportTopic);

      report.setAnswer({
        content: data.content,
        sources: data.sources,
        metadata: data.metadata,
      });

      report.setShowCard(true);
      report.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠ Report Error", err);
    } finally {
      setReportLoading(false);
      setShowReportModal(false);
    }
  };

  const handleBlogGenerate = async () => {
    if (!blogTopic.trim()) return;
    setBlogLoading(true);

    try {
      const data = await fetchBlogPostFromAPI(blogTopic);

      blog.setAnswer({
        content: data.content,
        sources: data.sources,
        metadata: data.metadata,
      });

      blog.setShowCard(true);
      blog.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠ Blog Error", err);
    } finally {
      setBlogLoading(false);
      setShowBlogModal(false);
    }
  };

  const handleStudyGenerate = async () => {
    if (!studyTopic.trim()) return;
    setStudyLoading(true);

    try {
      const data = await fetchStudyGuideFromAPI(studyTopic);

      study.setAnswer({
        content: data.content,
        sources: data.sources,
        metadata: data.metadata,
      });

      study.setShowCard(true);
      study.setShowAnswerModal(false);
    } catch (err) {
      console.error("⚠ Study Error", err);
    } finally {
      setStudyLoading(false);
      setShowStudyModal(false);
    }
  };

  const renderInputModal = (
    title,
    placeholder,
    topic,
    setTopic,
    onGenerate,
    onCancel,
    loading
  ) => (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-[#10141A] border border-gray-600/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-black/60/40">
        <h3 className="text-2xl text-gray-300 font-bold border-b border-gray-700/50 pb-3">
          {title}
        </h3>
        <p className="text-sm text-gray-400">
          Enter the topic you want to generate content for.
        </p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-teal-500 transition-shadow text-white placeholder-gray-500"
          onKeyDown={(e) => e.key === "Enter" && onGenerate()}
        />
        <button
          onClick={onGenerate}
          disabled={!topic.trim() || loading}
          className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-lg shadow-black/60/60 disabled:shadow-none"
          aria-label="Send Message"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate"
          )}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all duration-200 transform hover:scale-[1.01] text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const handleLeftResize = useCallback(
    (e: MouseEvent) => {
      if (!draggingLeft) return;
      const newWidth = Math.min(Math.max(e.clientX, MIN_LEFT), MAX_LEFT);
      setLeftWidth(newWidth);
    },
    [draggingLeft]
  );

  const handleRightResize = useCallback(
    (e: MouseEvent) => {
      if (!draggingRight) return;
      const newWidth = Math.min(
        Math.max(window.innerWidth - e.clientX, MIN_RIGHT),
        MAX_RIGHT
      );
      setRightWidth(newWidth);
    },
    [draggingRight]
  );
  const stopDragging = useCallback(() => {
    setDraggingLeft(false);
    setDraggingRight(false);
  }, []);

  React.useEffect(() => {
    if (draggingLeft || draggingRight) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    } else {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    window.addEventListener("mousemove", handleLeftResize);
    window.addEventListener("mousemove", handleRightResize);
    window.addEventListener("mouseup", stopDragging);

    return () => {
      window.removeEventListener("mousemove", handleLeftResize);
      window.removeEventListener("mousemove", handleRightResize);
      window.removeEventListener("mouseup", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [
    draggingLeft,
    draggingRight,
    handleLeftResize,
    handleRightResize,
    stopDragging,
  ]);

  return (
    <div className="h-screen w-screen bg-[#0E1116] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-700/50 bg-[#14171C] shadow-2xl shadow-black/70 z-10">
        <h1 className="text-3xl font-extrabold text-gray-300 tracking-wider flex items-center gap-3">
          <Zap className="w-7 h-7" />
          {title ?? "Notebook Workspace"}
        </h1>
        <button
          onClick={goBack}
          className="px-5 py-2.5 rounded-full bg-[#1A1D24] border border-gray-700/50 text-sm font-bold text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-300 transform hover:scale-[1.03] shadow-md shadow-black/50 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
      </header>

      <div className="flex-1 h-full min-h-0 overflow-hidden flex">
        {!collapseSources && (
          <>
            <div
              className="flex-shrink-0 border-r border-gray-700/50 overflow-hidden"
              style={{ width: `${leftWidth}px` }}
            >
              <aside className="h-full p-6 flex flex-col gap-5 bg-[#14171C]">
                {selectedSourceId === null ? (
                  <>
                    <div className="flex justify-between items-center">
                      <h2>Sources ({sources.length})</h2>
                      <button onClick={() => setCollapseSources(true)}>
                        <ChevronLeft />
                      </button>
                    </div>

                    <button
                      onClick={fetchLocalPDFs}
                      className="w-full py-2 mb-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition"
                    >
                      Fetch PDFs
                    </button>

                    <div className="flex-1 bg-[#1A1D24] border border-gray-700/50 rounded-2xl p-4 space-y-4 overflow-y-auto shadow-inner shadow-black/40">
                      {sources.length === 0 ? (
                        <div className="text-center text-gray-500 text-sm py-8">
                          Start a conversation to automatically ingest and list
                          relevant sources here.
                        </div>
                      ) : (
                        sources.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => setSelectedSourceId(s.id)}
                            className="flex items-center gap-3 px-4 py-3 bg-[#1A1D24] border border-gray-700/50 rounded-xl hover:bg-[#2A2F37] transition-all duration-200 cursor-pointer shadow-md"
                          >
                            <FileText className="w-5 h-5 text-gray-300 flex-shrink-0" />
                            <span className="text-sm flex-1 font-medium text-gray-100 truncate">
                              {s.title}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {sources.map((s) =>
                      s.id === selectedSourceId ? (
                        <AnimatedSourceGuide
                          key={s.id}
                          source={s}
                          onBack={() => setSelectedSourceId(null)}
                        />
                      ) : null
                    )}
                  </>
                )}
              </aside>
            </div>
            <div
              onMouseDown={() => setDraggingLeft(true)}
              className="w-1 hover:w-1.5 bg-gray-700/30 hover:bg-teal-500/50 cursor-col-resize transition-all duration-150 flex-shrink-0"
              aria-label="Resize Sources Panel"
            />
          </>
        )}
        {collapseSources && (
          <div
            onClick={() => setCollapseSources(false)}
            className="flex-shrink-0 w-10 bg-[#14171C] border-r border-gray-700/50 flex justify-center items-center cursor-pointer hover:bg-[#1D222A]"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <section className="flex-1 h-full min-h-0 border-r border-gray-700/50 p-6 flex flex-col gap-4 bg-[#10141A]">
          <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
            <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-gray-300 animate-pulse" />
              Chatting with **{title ?? "Notebook"}**
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Context: Medical.json)
              </span>
            </p>
          </div>

          <div
            className="flex-1 bg-[#171A1F] border border-gray-700/50 rounded-2xl p-5 overflow-x-hidden
        overflow-y-auto space-y-8 shadow-xl shadow-black/30"
          >
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center w-full h-full text-center text-gray-500">
                <div className="w-full max-w-[900px] mx-auto flex flex-col items-center">
                  <MessageCircleQuestion className="w-10 h-10 mb-4 text-gray-600" />
                  <p className="text-lg font-semibold">
                    Start your knowledge exploration.
                  </p>
                  <p className="text-sm">
                    Ask a question to load sources and get AI answers.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => <MessageBubble key={idx} m={m} />)
            )}
            {isLoading && (
              <div className="w-full flex justify-center mt-4">
                <div className="w-full max-w-[900px] mx-auto flex gap-3 px-2 py-3">
                  <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                    AI
                  </div>

                  <div className="bg-[#1D222A] border border-gray-700/50 px-4 py-3 rounded-2xl max-w-[70%] shadow-md">
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-gray-600/30 rounded animate-pulse"></div>
                      <div className="h-3 w-2/3 bg-gray-600/30 rounded animate-pulse"></div>
                      <div className="h-3 w-1/3 bg-gray-600/30 rounded animate-pulse"></div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400 italic">
                        {loadingTexts[loadingIndex]}
                      </span>
                      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-150"></span>
                      <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                </div>
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
                className="p-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-black/60/50 disabled:shadow-none"
                aria-label="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
        {!collapseStudio && (
          <>
            <div
              onMouseDown={() => setDraggingRight(true)}
              className="w-1 hover:w-1.5 bg-gray-700/30 hover:bg-teal-500/50 cursor-col-resize transition-all duration-150 flex-shrink-0"
              aria-label="Resize Studio Panel"
            />
            <div
              className="flex-shrink-0 border-l border-gray-700/50 overflow-y-auto"
              style={{ width: `${rightWidth}px` }}
            >
              <aside className="h-full p-6 flex flex-col bg-[#14171C]">
                <div className="flex justify-between items-center pb-3 mb-5">
                  <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 border-b-2 border-gray-600/50 pb-1">
                    <Zap className="w-5 h-5 text-gray-300" />
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
                    style={{ backgroundColor: STUDIO_CARD_COLORS[0] }}
                    onClick={() => setShowMindmapCreateModal(true)}
                  />

                  <ToolCard
                    icon={MessageCircleQuestion}
                    label="FAQ"
                    style={{ backgroundColor: STUDIO_CARD_COLORS[1] }}
                    onClick={() => setShowFAQModal(true)}
                  />

                  <ToolCard
                    icon={Scale}
                    label="Comparative Analysis"
                    style={{ backgroundColor: STUDIO_CARD_COLORS[2] }}
                    onClick={() => setShowComparativeModal(true)}
                  />

                  <ToolCard
                    icon={BookOpen}
                    label="Tutorial"
                    style={{ backgroundColor: STUDIO_CARD_COLORS[3] }}
                    onClick={() => setShowTutorialModal(true)}
                  />

                  <ToolCard
                    icon={FileText}
                    label="Technical Report"
                    style={{ backgroundColor: STUDIO_CARD_COLORS[4] }}
                    onClick={() => setShowReportModal(true)}
                  />

                  <ToolCard
                    icon={Feather}
                    label="Blog Post"
                    style={{ backgroundColor: STUDIO_CARD_COLORS[5] }}
                    onClick={() => setShowBlogModal(true)}
                  />

                  <ToolCard
                    icon={GraduationCap}
                    label="Study Guide"
                    style={{ backgroundColor: STUDIO_CARD_COLORS[6] }}
                    onClick={() => setShowStudyModal(true)}
                  />

                  <ToolCard
                    icon={ClipboardList}
                    label="Briefing"
                    style={{ backgroundColor: STUDIO_CARD_COLORS[7] }}
                    onClick={() => setShowBriefingModal(true)}
                  />
                </div>

                <div className="mt-8 pt-4 border-t border-gray-700/50 space-y-3">
                  <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700/50 pb-2">
                    Tool Results
                  </h3>

                  <div className="space-y-3 max-h-[40vh] overflow-y-auto p-2 -m-2">
                    {mindmapTool.showCard && (
                      <ResultCardSimple
                        title="Mindmap Ready"
                        onClick={() => mindmapTool.setShowAnswerModal(true)}
                      />
                    )}

                    {faq.showCard && (
                      <ResultCardSimple
                        title="FAQ Results Ready"
                        onClick={() => faq.setShowAnswerModal(true)}
                      />
                    )}

                    {comparative.showCard && (
                      <ResultCardSimple
                        title="Comparative Analysis Ready"
                        onClick={() => comparative.setShowAnswerModal(true)}
                      />
                    )}

                    {tutorial.showCard && (
                      <ResultCardSimple
                        title="Tutorial Ready"
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
                        title="Blog Post Ready"
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
                  </div>

                  {mindmapTool.showAnswerModal && (
                    <AnswerModal tool={mindmapTool} title="Mindmap Result" />
                  )}

                  {faq.showAnswerModal && (
                    <AnswerModal tool={faq} title="FAQ Result" />
                  )}

                  {comparative.showAnswerModal && (
                    <AnswerModal
                      tool={comparative}
                      title="Comparative Result"
                    />
                  )}

                  {tutorial.showAnswerModal && (
                    <AnswerModal tool={tutorial} title="Tutorial" />
                  )}

                  {report.showAnswerModal && (
                    <AnswerModal tool={report} title="Technical Report" />
                  )}

                  {blog.showAnswerModal && (
                    <AnswerModal tool={blog} title="Blog Post" />
                  )}

                  {study.showAnswerModal && (
                    <AnswerModal tool={study} title="Study Guide" />
                  )}

                  {briefing.showAnswerModal && (
                    <AnswerModal tool={briefing} title="Briefing" />
                  )}
                </div>
              </aside>
            </div>
          </>
        )}

        {collapseStudio && (
          <div
            onClick={() => setCollapseStudio(false)}
            className="flex-shrink-0 w-10 bg-[#14171C] border-l border-gray-700/50 flex justify-center items-center cursor-pointer hover:bg-[#1D222A]"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </div>
        )}
      </div>

      {showMindmapViewer && mindmapData && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-hidden p-4"
          onWheel={(e) => e.preventDefault()}
        >
          <div className="w-[95vw] h-[95vh] bg-[#14171C] border border-gray-600/30 rounded-2xl relative p-5 flex flex-col mx-auto shadow-2xl shadow-black/60/50">
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

            <div className="flex-1 h-full overflow-hidden rounded-xl bg-[#1A1D24]">
              <MindmapNotebookLM data={mindmapData} />
            </div>
          </div>
        </div>
      )}

      {showMindmapCreateModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-[#10141A] border border-gray-600/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-black/60/40">
            <h3 className="text-2xl text-gray-300 font-bold border-b border-gray-700/50 pb-3">
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
              className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-lg shadow-black/60/60"
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
      {showBriefingModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-[#10141A] border border-gray-600/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-black/60/40">
            <h3 className="text-2xl text-gray-300 font-bold border-b border-gray-700/50 pb-3">
              Generate Briefing
            </h3>
            <p className="text-sm text-gray-400">
              Enter the topic for which you want to generate an AI-powered
              briefing summary.
            </p>
            <input
              value={briefingTopic}
              onChange={(e) => setBriefingTopic(e.target.value)}
              placeholder="E.g., Healthcare innovation trends"
              className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-teal-500 transition-shadow text-white placeholder-gray-500"
              onKeyDown={(e) => e.key === "Enter" && handleBriefingGenerate()}
            />
            <button
              onClick={handleBriefingGenerate}
              disabled={!briefingTopic.trim() || briefingLoading}
              className="w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-lg shadow-black/60/60"
            >
              {briefingLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Briefing...
                </span>
              ) : (
                "Generate Briefing"
              )}
            </button>
            <button
              onClick={() => setShowBriefingModal(false)}
              className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all duration-200 transform hover:scale-[1.01] text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showFAQModal &&
        renderInputModal(
          "Generate FAQ",
          "E.g., Common questions about healthcare AI",
          faqTopic,
          setFAQTopic,
          handleFAQGenerate,
          () => setShowFAQModal(false),
          faqLoading
        )}
      {showComparativeModal &&
        renderInputModal(
          "Generate Comparative Analysis",
          "E.g., Compare machine learning models in medicine",
          comparativeTopic,
          setComparativeTopic,
          handleComparativeGenerate,
          () => setShowComparativeModal(false),
          comparativeLoading
        )}
      {showTutorialModal &&
        renderInputModal(
          "Generate Tutorial",
          "E.g., How to use AI tools in diagnostics",
          tutorialTopic,
          setTutorialTopic,
          handleTutorialGenerate,
          () => setShowTutorialModal(false),
          tutorialLoading
        )}
      {showReportModal &&
        renderInputModal(
          "Generate Technical Report",
          "E.g., Deep dive on AI-powered diagnosis",
          reportTopic,
          setReportTopic,
          handleReportGenerate,
          () => setShowReportModal(false),
          reportLoading
        )}
      {showBlogModal &&
        renderInputModal(
          "Generate Blog Post",
          "E.g., Future of AI in healthcare",
          blogTopic,
          setBlogTopic,
          handleBlogGenerate,
          () => setShowBlogModal(false),
          blogLoading
        )}
      {showStudyModal &&
        renderInputModal(
          "Generate Study Guide",
          "E.g., Study materials for medical AI ethics",
          studyTopic,
          setStudyTopic,
          handleStudyGenerate,
          () => setShowStudyModal(false),
          studyLoading
        )}
    </div>
  );
}
