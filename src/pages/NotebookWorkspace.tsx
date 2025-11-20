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
  Sparkles,
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
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const bubbleClasses = isUser
    ? "bg-gradient-to-br from-gray-700 to-gray-800 text-white rounded-2xl shadow-xl shadow-black/60"
    : "bg-gradient-to-br from-[#1D222A] to-[#15191F] text-gray-200 border border-blue-600/30 rounded-2xl shadow-xl shadow-black/30";

  return (
    <div
      key={m.text}
      className={`w-full flex justify-center transition-all duration-700 transform ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div
        className={`w-full max-w-[940px] flex flex-col space-y-3 ${
          isUser ? "items-end" : "items-center"
        }`}
      >
        <div
          className={`text-lg px-4 py-3 w-fit transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${
            isUser ? "max-w-[690px] -translate-x-2" : "max-w-[1600px]"
          } ${bubbleClasses} ${
            !isUser ? "hover:border-blue-500/50 hover:shadow-blue-900/30" : ""
          }`}
          style={{
            animation: `slide${isUser ? "InRight" : "InLeft"} 0.5s ease-out`,
          }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
        </div>

        {!isUser && m.sources?.length > 0 && (
          <div
            className="max-w-[1000px] w-full bg-gradient-to-br from-[#1A1D24]/90 to-[#15191F]/90 border border-blue-600/30 rounded-xl p-3 space-y-2 text-base shadow-lg shadow-blue-900/20 backdrop-blur-sm transition-all duration-700 hover:border-blue-500/50 hover:shadow-blue-900/40 transform"
            style={{
              animation: "slideInUp 0.6s ease-out 0.2s both",
            }}
          >
            <p className="text-gray-400 font-semibold mb-2 border-b border-blue-600/30 pb-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              Sources Used
            </p>
            {m.sources.map((src, idx) => (
              <div
                key={idx}
                className="bg-[#21252C]/80 border border-blue-600/20 p-3 rounded-lg space-y-2 hover:bg-[#282D35] hover:border-blue-500/40 transition-all duration-300 transform hover:scale-105"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
              >
                <p className="text-gray-300 font-medium break-words flex items-center gap-1">
                  {src.href ? (
                    <a
                      href={src.href}
                      target="_blank"
                      className="text-white underline hover:text-cyan-300 transition-colors duration-300 font-semibold bg-white/10 px-2 py-0.5 rounded"
                    >
                      {src.source}
                    </a>
                  ) : (
                    <span className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded">
                      {src.source}
                    </span>
                  )}

                  {src.page && (
                    <span className="text-gray-500 text-sm2 bg-blue-600/20 px-2 py-0.5 rounded-full">
                      Page {src.page}
                    </span>
                  )}
                </p>

                {src.content_snippet && (
                  <div className="pl-3 border-l-2 border-blue-600/50 mt-2">
                    <p className="italic text-gray-400 text-sm leading-relaxed hover:text-gray-300 transition-colors">
                      "{src.content_snippet}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!isUser && m.metadata && (
          <div
            className="max-w-[1000px] w-full bg-gradient-to-br from-[#1A1D24]/90 to-[#15191F]/90 border border-blue-600/20 rounded-xl p-3 text-sm text-gray-400 space-y-1 shadow-inner shadow-blue-900/10 backdrop-blur-sm transition-all duration-700 transform"
            style={{
              animation: "slideInUp 0.6s ease-out 0.4s both",
            }}
          >
            <p>
              <span className="text-blue-400 font-semibold">Domain:</span>{" "}
              <span className="text-gray-300">{m.metadata.active_domain}</span>
            </p>
            <p>
              <span className="text-blue-400 font-semibold">
                Response Time:
              </span>{" "}
              <span className="text-gray-300">{m.metadata.total_time}s</span>
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
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setIsOpen(true);
  }, []);

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

  const handleBack = () => {
    setIsOpen(false);
    setTimeout(onBack, 300);
  };

  return (
    <div className="space-y-4 h-full flex flex-col relative">
      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInText {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .prose-animated h1,
        .prose-animated h2,
        .prose-animated h3 {
          animation: slideInUp 0.6s ease-out forwards;
          opacity: 0;
          color: #ffffff; 
        }

        .prose-animated h1 { animation-delay: 0.1s; }
        .prose-animated h2 { animation-delay: 0.2s; }
        .prose-animated h3 { animation-delay: 0.3s; }

        .prose-animated p {
          animation: fadeInText 0.8s ease-out forwards;
          opacity: 0;
          color: #d1d5db;
        }

        .prose-animated p:nth-of-type(1) { animation-delay: 0.4s; }
        .prose-animated p:nth-of-type(2) { animation-delay: 0.6s; }
        .prose-animated p:nth-of-type(3) { animation-delay: 0.8s; }
        .prose-animated p:nth-of-type(n+4) { animation-delay: 1s; }

        .prose-animated strong {
          color: #ffffff;  
          font-weight: 700;
        }

        .prose-animated a {
          color: #3b82f6;
          text-decoration: underline;
          transition: all 0.3s ease;
        }

        .prose-animated a:hover {
           color: #60a5fa;
          text-decoration-thickness: 2px;
        }
      `}</style>

      <div
        className={`absolute inset-0 backdrop-blur-md transition-all duration-500 rounded-2xl pointer-events-none ${
          isOpen ? "opacity-40" : "opacity-0"
        }`}
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.15), rgba(37,99,235,0.05))",
        }}
      />

      <button
        onClick={handleBack}
        className={`text-gray-300 hover:text-white flex items-center gap-2 mb-3 transition-all duration-500 transform hover:scale-110 group relative z-10 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        }`}
      >
        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
        <span className="text-sm font-medium group-hover:text-blue-300 transition-colors">
          Back
        </span>
      </button>

      <div
        className={`h-1.5 w-full bg-gray-700/40 rounded-full overflow-hidden transition-all duration-500 relative z-10 ${
          isOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-75"
        }`}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 transition-all duration-300 shadow-lg shadow-purple-500/60 rounded-full"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div
        ref={containerRef}
        className={`flex-1 overflow-y-auto bg-gradient-to-br from-[#1A1D24]/98 via-[#1D222A]/95 to-[#161A20]/98 border border-blue-600/40 rounded-2xl p-6 prose prose-invert transition-all duration-700 transform relative z-10 ${
          isOpen
            ? "scale-100 opacity-100 shadow-2xl shadow-purple-900/40"
            : "scale-95 opacity-0 shadow-lg"
        }`}
        style={{
          backdropFilter: "blur(10px)",
          background:
            "linear-gradient(135deg, rgba(26,29,36,0.98) 0%, rgba(29,34,42,0.95) 50%, rgba(22,26,32,0.98) 100%)",
        }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/5 via-transparent to-pink-600/5 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="prose-animated">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {(source as any).source_guide || "No content available."}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div
        className={`flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-600/10 to-blue-400/10 rounded-lg border border-blue-500/20 backdrop-blur-sm transition-all duration-500 relative z-10 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <p className="text-sm text-gray-400 font-medium">
          {Math.round(scrollProgress)}% scrolled
        </p>
      </div>
    </div>
  );
};

export default function NotebookWorkspace({ goBack, title }: Props) {
  const STUDIO_CARD_COLORS = [
    "rgba(77, 87, 111, 0.55)",
    "rgba(68, 86, 72, 0.55)",
    "rgba(97, 73, 92, 0.55)",
    "rgba(90, 90, 65, 0.55)",
    "rgba(88, 73, 54, 0.55)",
    "rgba(70, 87, 96, 0.55)",
    "rgba(97, 73, 92, 0.55)",
    "rgba(68, 86, 72, 0.55)",
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
        content: response.answer || response.content || "",
        metadata: response.metadata,
        sources: response.sources || response.retrieved_context || [],
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_comparative"
  );

  const tutorial = useContentTool(
    async () => {
      const response = await fetchTutorialFromAPI(tutorialTopic);
      return {
        content: response.answer || response.content || "",
        metadata: response.metadata,
        sources: response.sources || response.retrieved_context || [],
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_tutorial"
  );

  const report = useContentTool(
    async () => {
      const response = await fetchTechnicalReportFromAPI(reportTopic);
      return {
        content: response.answer || response.content || "",
        metadata: response.metadata,
        sources: response.sources || response.retrieved_context || [],
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_report"
  );

  const blog = useContentTool(
    async () => {
      const response = await fetchBlogPostFromAPI(blogTopic);
      return {
        content: response.answer || response.content || "",
        metadata: response.metadata,
        sources: response.sources || response.retrieved_context || [],
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_blog"
  );

  const study = useContentTool(
    async () => {
      const response = await fetchStudyGuideFromAPI(studyTopic);
      return {
        content: response.answer || response.content || "",
        metadata: response.metadata,
        sources: response.sources || response.retrieved_context || [],
      };
    },
    { splitRegex: /##\s+/g },
    "nb_tool_study"
  );

  const briefing = useContentTool(
    async () => {
      const response = await fetchBriefingFromAPI(briefingTopic);
      return {
        content: response.answer || response.content || "",
        metadata: response.metadata,
        sources: response.sources || response.retrieved_context || [],
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

    setMessages((prev) => [
      ...prev,
      { role: "user", text, sources: [], metadata: null },
    ]);

    setTimeout(() => {
      const chatContainer = document.querySelector(
        '[aria-label="Chat Messages"]'
      );
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100);

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

        setTimeout(() => {
          const chatContainer = document.querySelector(
            '[aria-label="Chat Messages"]'
          );
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        }, 0);

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
        content: data.answer || data.content || "",
        sources: data.sources || data.retrieved_context || [],
        metadata: data.metadata || null,
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
        content: data.answer || data.content || data.text || "",
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
        content: data.answer || data.content || data.text || "",
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
        content: data.answer || data.content || data.text || "",
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
        content: data.answer || data.content || data.text || "",
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
        content: data.answer || data.content || data.text || "",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <style>{`
      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.92) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      @keyframes modalBackdropIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 0.7;
        }
      }

      @keyframes modalFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
    `}</style>

      <div
        className="absolute inset-0 bg-black backdrop-blur-sm"
        style={{
          animation: "modalBackdropIn 0.4s ease-out forwards",
        }}
        onClick={onCancel}
      />

      <div
        className="
        relative w-[450px] bg-gradient-to-br from-[#1A1D24] to-[#10141A]
        border border-gray-700/40 rounded-2xl p-8 shadow-2xl shadow-black/70
      "
        style={{
          animation: "modalSlideIn 0.4s ease-out forwards",
        }}
      >
        <h3
          className="text-2xl text-gray-200 font-bold mb-4 flex items-center gap-2"
          style={{
            animation: "modalFadeIn 0.4s ease-out 0.2s forwards",
            opacity: 0,
          }}
        >
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          {title}
        </h3>

        <p
          className="text-sm text-gray-400 mb-3"
          style={{
            animation: "modalFadeIn 0.4s ease-out 0.3s forwards",
            opacity: 0,
          }}
        >
          Enter the topic you want the AI to generate:
        </p>

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={placeholder}
          className="
          w-full px-4 py-3 bg-[#151A20] border border-white/10 rounded-xl
          text-base outline-none text-white placeholder-gray-500
          focus:ring-2 focus:ring-teal-500 transition-all
        "
          style={{
            animation: "modalFadeIn 0.4s ease-out 0.4s forwards",
            opacity: 0,
          }}
          onKeyDown={(e) => e.key === "Enter" && onGenerate()}
        />

        <button
          onClick={onGenerate}
          disabled={!topic.trim() || loading}
          className="
          mt-5 w-full py-3 rounded-xl bg-gray-700 hover:bg-gray-600
          font-bold transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          transform hover:scale-[1.03]
        "
          style={{
            animation: "modalFadeIn 0.4s ease-out 0.5s forwards",
            opacity: 0,
          }}
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
          className="
          mt-3 w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45]
          text-base text-gray-200 transition-all duration-200
        "
          style={{
            animation: "modalFadeIn 0.4s ease-out 0.6s forwards",
            opacity: 0,
          }}
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
              <span className="text-sm text-gray-500 font-normal ml-2">
                (Context: Medical.json)
              </span>
            </p>
          </div>

          <div
            aria-label="Chat Messages"
            className="flex-1 bg-[#171A1F] border border-gray-700/50 rounded-2xl p-5 overflow-x-hidden
  overflow-y-auto space-y-8 shadow-xl shadow-black/30"
          >
            <style>{`
    @keyframes messageSlideIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .chat-message {
      animation: messageSlideIn 0.4s ease-out forwards;
      opacity: 0;
    }

    .typing-indicator {
      animation: fadeIn 0.3s ease-out forwards;
    }
  `}</style>

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
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className="chat-message"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <MessageBubble m={m} />
                </div>
              ))
            )}

            {isLoading && (
              <div className="typing-indicator w-full flex justify-center mt-4">
                <div className="w-full max-w-[900px] mx-auto flex gap-3 px-2 py-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    AI
                  </div>

                  <div className="bg-gradient-to-br from-[#1D222A] to-[#15191F] border border-blue-600/30 px-4 py-3 rounded-2xl max-w-[70%] shadow-md hover:shadow-lg hover:shadow-blue-900/30 transition-shadow">
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-blue-600/30 rounded animate-pulse"></div>
                      <div className="h-3 w-2/3 bg-blue-600/30 rounded animate-pulse delay-100"></div>
                      <div className="h-3 w-1/3 bg-blue-600/30 rounded animate-pulse delay-200"></div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-sm text-blue-400 italic font-semibold">
                        {loadingTexts[loadingIndex]}
                      </span>
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-150"></span>
                      <span className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-300"></span>
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

      {showMindmapCreateModal &&
        renderInputModal(
          "Generate Mind Map",
          "E.g., Key concepts of Medical.json",
          mindmapTopic,
          setMindmapTopic,
          handleMindmapGenerate,
          () => setShowMindmapCreateModal(false),
          mindmapLoading
        )}

      {showBriefingModal &&
        renderInputModal(
          "Generate Briefing",
          "E.g., Healthcare innovation trends",
          briefingTopic,
          setBriefingTopic,
          handleBriefingGenerate,
          () => setShowBriefingModal(false),
          briefingLoading
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
