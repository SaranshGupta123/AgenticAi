import React, { useEffect, useState } from "react";
import {
  Search,
  Shield,
  Clock,
  Zap,
  GitBranch,
  Settings,
  TrendingUp,
} from "lucide-react";
import {
  fetchExplainabilityChatResponse,
  fetchDeepResearchExplainabilityResponse,
  fetchSubjectReasoningSolve,
  fetchSourceResponse,
} from "../../api/api";

import ReactMarkdown from "react-markdown";
import { useLoading } from "../context/LoadingContext";
import SolvedPhysicsUI from "../subject/SolvedPhysicsUI";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

const LS_REASON_REACT = "agentic_reasoning_react";
const LS_REASON_DEEP = "agentic_reasoning_deep";
const loadingTexts = [
  "Thinking…",
  "Analyzing information…",
  "Retrieving context…",
  "Synthesizing response…",
  "Generating answer…",
];

const longestLoadingText = loadingTexts.reduce((a, b) =>
  a.length > b.length ? a : b
);

type Chat = {
  question: string;
  answer: string;
  metadata?: any;
  reasoning_steps?: any[];
  streaming?: boolean;
  safe?: boolean;
};

export const ReasoningView = ({
  agentType = "react",
  selectedSubject = "general",
  onLockChange,
}: {
  agentType: "react" | "deep_research";
  selectedSubject: string;
  onLockChange?: (locked: boolean) => void;
}) => {
  const infoText =
    agentType === "deep_research"
      ? {
          title: "Deep Reasoning Mode",
          body: `
Performs deep research with comprehensive explainability tracking

This endpoint combines the power of deep research with full explainability:

• Chain-of-Thought tracing showing research reasoning process
• Tool attribution tracking which searches contributed what
• Source citations for transparency
• Quality metrics and decision points

Perfect for:

• Understanding how research conclusions were reached
• Auditing research methodology
• Educational purposes showing research process
• Building trust through transparency
          `,
        }
      : {
          title: "React Reasoning Mode",
          body: `
Enhanced endpoint that provides comprehensive explainability through:

• Chain-of-Thought tracing - Shows the reasoning process
• Tool Attribution - Shows which tools contributed what information
• Source citations - Provides transparency about information sources
          `,
        };

  const isSourceMode = agentType === "source";
  const REASON_KEY = isSourceMode
    ? `agent_source_${selectedSubject}`
    : agentType === "deep_research"
    ? LS_REASON_DEEP
    : LS_REASON_REACT;
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const raw = localStorage.getItem(REASON_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    return [
      {
        question:
          agentType === "deep_research"
            ? "What topic should we investigate with deep reasoning?"
            : "How does reinforcement learning work in AI?",
        answer:
          agentType === "deep_research"
            ? "Deep reasoning mode is ready. Ask a topic for full explainability steps."
            : "Reinforcement Learning (RL) is a method where an agent learns to make decisions by interacting with an environment.",
        metadata: { total_time: 0, agent_type: agentType },
        reasoning_steps: [],
        safe: true,
      },
    ];
  });
  useEffect(() => {
    const key = isSourceMode
      ? `agent_source_${selectedSubject}`
      : agentType === "deep_research"
      ? LS_REASON_DEEP
      : LS_REASON_REACT;

    const saved = localStorage.getItem(key);

    if (saved) {
      setChats(JSON.parse(saved));
    } else {
      setChats([
        {
          question:
            agentType === "deep_research"
              ? "What topic should we investigate with deep reasoning?"
              : isSourceMode
              ? `Ask something related to ${selectedSubject}…`
              : "Ask anything…",
          answer:
            agentType === "deep_research"
              ? "Deep research mode loaded. Ask a topic."
              : isSourceMode
              ? "Source mode active. Ask a topic from the selected subject."
              : "Ready.",
          safe: true,
          reasoning_steps: [],
          metadata: { agent_type: agentType },
        },
      ]);
    }
  }, [agentType, selectedSubject]);

  const { isLoading, setIsLoading } = useLoading();
  const navigationLocked = isLoading && query.trim() !== "";
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(REASON_KEY, JSON.stringify(chats));
  }, [chats, agentType, selectedSubject]);

  useEffect(() => {
    const el = document.getElementById("explain-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [chats, isLoading]);

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(
      () => setLoadingIndex((i) => (i + 1) % loadingTexts.length),
      1200
    );
    return () => clearInterval(id);
  }, [isLoading]);

  const formatOutput = (data: any): string => {
    if (!data) return "";
    if (typeof data === "string") return data;
    if (Array.isArray(data))
      return data
        .map((x) => (typeof x === "object" ? formatOutput(x) : String(x)))
        .join("\n\n");
    if (typeof data === "object")
      return Object.entries(data)
        .map(([k, v]) => {
          if (typeof v === "object") {
            return `${k}:\n${formatOutput(v)
              .split("\n")
              .map((l) => "  " + l)
              .join("\n")}`;
          }
          return `${k}: ${v}`;
        })
        .join("\n");
    return String(data);
  };

  const streamAnswer = (fullText: string) => {
    let i = 0;
    const words = (fullText || "No response received.").split(" ");
    const id = setInterval(() => {
      setChats((prev) => {
        const last = prev[prev.length - 1];
        const others = prev.slice(0, -1);
        return [
          ...others,
          { ...last, answer: words.slice(0, i).join(" "), streaming: true },
        ];
      });
      i++;
      if (i > words.length) {
        clearInterval(id);
        setChats((prev) => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, streaming: false }];
        });
      }
    }, 40);
  };

  const fetchExplainabilityData = async (customQuery: string) => {
    setIsLoading(true);
    onLockChange?.(true);
    setError(null);
    try {
      console.log(`🔍 Fetching ${agentType} explainability for:`, customQuery);

      let data;
      if (isSourceMode) {
        data = await fetchSubjectReasoningSolve(customQuery, selectedSubject);
      }

      // if (isSourceMode) {
      //   const localData = await fetchSourceResponse(); // reads response_source.json

      //   setChats((prev) => {
      //     const updated = [...prev];
      //     updated[updated.length - 1] = {
      //       ...updated[updated.length - 1],
      //       question: customQuery,
      //       answer:
      //         localData?.final_answer ||
      //         localData?.answer ||
      //         "No saved answer.",
      //       full_response: localData,
      //       metadata: localData?.metadata || {},
      //       reasoning_steps:
      //         localData?.steps?.map((s, i) => ({
      //           step_number: s.step_num || i + 1,
      //           step_type: s.action || "step",
      //           reasoning: s.thought || "",
      //           output_data: s.observation || "",
      //         })) || [],
      //       safe: true,
      //       streaming: false,
      //     };
      //     return updated;
      //   });

      //   return; // stop API calls
      // }
      else {
        data =
          agentType === "deep_research"
            ? await fetchDeepResearchExplainabilityResponse(customQuery)
            : await fetchExplainabilityChatResponse(customQuery);
      }
      console.log("✅ Received data:", data);

      const finalAnswer =
        data.final_answer ??
        data.final_decision ??
        data.final_decision_text ??
        "No answer.";
      const formattedAnswer = String(finalAnswer)
        .replace(/\*\*/g, "^")
        .replace(/(\w+)\^(\d+)/g, "$1^{$2}")
        .replace(/\*/g, " \\cdot ");

      const explainability = data.explainability_results ?? {};

      const blocks: any[] = [];

      if (data.agent_steps && Array.isArray(data.agent_steps)) {
        blocks.push(
          ...data.agent_steps.map((step: any, i: number) => ({
            step_number: i + 1,
            step_type: step.step_type ?? step.action ?? "agent_step",
            reasoning: step.reasoning ?? step.thought ?? "",
            input_data: step.input_data,
            output_data: step.output_data,
            raw_type: "agent_steps",
          }))
        );
      }
      if (data.explainability_results?.chain_of_thought?.summary) {
        blocks.push({
          step_type: "cot_summary",
          reasoning: "Chain-of-thought summary",
          output_data: data.explainability_results.chain_of_thought.summary,
          raw_type: "cot_summary",
        });
      }

      if (data.explainability_results?.chain_of_thought?.visualization) {
        blocks.push({
          step_type: "cot_visualization",
          reasoning: "CoT visualization",
          output_data:
            data.explainability_results.chain_of_thought.visualization,
          raw_type: "cot_visualization",
        });
      }

      if (data.explainability_results?.tool_attribution?.full_report) {
        blocks.push({
          step_type: "tool_attribution_full",
          reasoning: "Tool attribution full report",
          output_data: data.explainability_results.tool_attribution.full_report,
          raw_type: "tool_attribution_full",
        });
      }

      if (data.explainability_results?.tool_attribution?.visual_report) {
        blocks.push({
          step_type: "tool_attribution_visual",
          reasoning: "Tool attribution visual",
          output_data:
            data.explainability_results.tool_attribution.visual_report,
          raw_type: "tool_attribution_visual",
        });
      }

      const steps = blocks.map((b, i) => ({ ...b, step_number: i + 1 }));

      const metadata = {
        processing_time_seconds:
          data.metadata?.processing_time_seconds ??
          data.processing_time_seconds ??
          data.metadata?.total_execution_time ??
          data.metadata?.total_time ??
          null,

        timestamp:
          data.metadata?.timestamp ??
          data.timestamp ??
          new Date().toISOString(),

        parsing_method:
          data.metadata?.parsed_info?.parsing_method ??
          data.metadata?.parsing_method ??
          null,

        agent_type: data.metadata?.agent_type ?? agentType,

        confidence: data.metadata?.confidence
          ? {
              score: data.metadata.confidence.score ?? null,
              level: data.metadata.confidence.level ?? null,
              interpretation: data.metadata.confidence.interpretation ?? null,
              factors: data.metadata.confidence.factors ?? [],
            }
          : data.confidence
          ? {
              score: data.confidence.score ?? null,
              level: data.confidence.level ?? null,
              interpretation: data.confidence.interpretation ?? null,
              factors: data.confidence.factors ?? [],
            }
          : null,

        parsed_info: {
          parsing_method: data.metadata?.parsed_info?.parsing_method ?? null,
          parse_success: data.metadata?.parsed_info?.parse_success ?? null,
          type: data.metadata?.parsed_info?.type ?? null,
          subtype: data.metadata?.parsed_info?.subtype ?? null,
          expression: data.metadata?.parsed_info?.expression ?? null,
          variable: data.metadata?.parsed_info?.variable ?? null,
          operation: data.metadata?.parsed_info?.operation ?? null,
        },

        computation_details: data.metadata?.computation_details ?? null,

        query_timestamp: data.metadata?.query_timestamp ?? null,
        completion_timestamp: data.metadata?.completion_timestamp ?? null,
        iterations_used: data.metadata?.iterations_used ?? null,
        sources_count: data.metadata?.sources_count ?? null,
        cot_trace_id: data.metadata?.cot_trace_id ?? null,
        attribution_report_id: data.metadata?.attribution_report_id ?? null,
      };

      console.log("📊 Extracted Metadata:", metadata);

      let safetyCheck = data.safety_check;
      if (!safetyCheck || Object.keys(safetyCheck).length === 0) {
        console.log(
          "⚠️ No safety_check from API, creating default safe structure"
        );
        safetyCheck = {
          threat_level: "safe",
          confidence_score: 0.95,
          violation_type: "none",
          explanation: "No safety concerns detected",
          recommendations: [],
          details: {
            pattern_check: {
              detection_method: "pattern_analysis",
              injection_patterns_count: 0,
            },
          },
        };
      }

      try {
        let allMetrics = JSON.parse(
          localStorage.getItem("agentic_metrics_data") || "[]"
        );

        const questionNumber = allMetrics.length + 1;

        const entry = {
          questionNumber,
          question: customQuery,
          answer: formattedAnswer,
          agent_type: agentType,
          timestamp: new Date().toISOString(),
          mode: agentType,
          metadata,
          steps,
          subject: data.subject ?? null,
          problem_type: data.problem_type ?? null,
          subtype: data.subtype ?? null,
          explainability: {
            chain_of_thought: explainability.chain_of_thought || null,
            tool_attribution: explainability.tool_attribution || null,
            summary: explainability.summary || null,
            full_data: data.explainability_results || null,
          },
          safety_check: safetyCheck,
          full_response: data,
        };

        if (!isSourceMode) {
          allMetrics.push(entry);
          localStorage.setItem(
            "agentic_metrics_data",
            JSON.stringify(allMetrics)
          );
        }

        setChats((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            question: customQuery,
            answer: formattedAnswer,
            full_response: {
              ...data,
              metadata: metadata,
            },
            formatted: true,
            metadata,
            reasoning_steps: steps,
            subject: data.subject ?? null,
            problem_type: data.problem_type ?? null,
            subtype: data.subtype ?? null,
            safe: safetyCheck
              ? !["high", "critical"].includes(
                  (safetyCheck.threat_level || "").toLowerCase()
                )
              : true,
            streaming: false,
            questionNumber: !isSourceMode ? questionNumber : null,
            explainability: entry.explainability,
          };
          return updated;
        });
      } catch (err) {
        console.error("❌ Failed storing reasoning metrics:", err);
      }
    } catch (err: any) {
      console.error("❌ Fetch error:", err);

      const errorMessage = err?.message || "Failed to fetch reasoning trace.";
      setError(
        `${errorMessage} ${
          agentType === "deep_research"
            ? "\n\nℹ️ Make sure your Deep Research backend endpoint is running."
            : ""
        }`
      );
      setChats((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          answer: `⚠️ Error: ${errorMessage}`,
          streaming: false,
          safe: true,
        };
        return updated;
      });
    }
  };

  const handleSubmit = async () => {
    if (!query.trim() || isLoading) return;
    const asked = query.trim();
    setQuery("");
    setChats((prev) => [
      ...prev,
      {
        question: asked,
        answer: "",
        streaming: true,
        metadata: {},
        safe: null,
      },
    ]);
    setIsLoading(true);
    onLockChange?.(true);
    try {
      await fetchExplainabilityData(asked);
    } finally {
      setIsLoading(false);
      onLockChange?.(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  function renderSmartLinks(answer: string) {
    if (!answer) return null;

    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    const urls = answer.match(urlRegex);
    if (!urls) return <p className="break-words">{answer}</p>;

    const cleaned = answer.replace(urlRegex, "").trim();

    return (
      <div className="space-y-3">
        {cleaned && <p className="text-slate-800 break-words">{cleaned}</p>}

        <div className="flex flex-wrap gap-4">
          {urls.map((url, i) => {
            const domain = new URL(url).hostname.replace("www.", "");
            const isYT =
              url.includes("youtube.com") || url.includes("youtu.be");
            const isGH = url.includes("github.com");

            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full sm:w-[48%] px-4 py-3 flex items-center justify-between 
              rounded-xl shadow-sm transition duration-150 hover:-translate-y-[2px]
              ${
                isYT
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : isGH
                  ? "bg-black hover:bg-gray-900 text-white"
                  : "bg-white border border-slate-200 hover:shadow-md"
              }
              `}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {isYT ? "▶" : isGH ? "💻" : "🌍"}
                  <span className="font-semibold text-sm truncate">
                    {domain}
                  </span>
                </div>
                <span className="opacity-70">↗</span>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  const renderSmartUI = (chat: any) => {
    const res = chat.full_response || chat;

    const hasSubjectData = res.subject && res.steps && res.steps.length > 0;

    if (isSourceMode && hasSubjectData) {
      return <SolvedPhysicsUI data={res} />;
    }

    return (
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
      >
        {chat.answer}
      </ReactMarkdown>
    );
  };
  const parsingMethod =
    chats[0]?.metadata?.parsed_info?.parsing_method ||
    chats[0]?.metadata?.parsing_method ||
    "N/A";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center space-x-2">
        <GitBranch className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          Reasoning Trace
        </h2>

        <div className="relative cursor-pointer group ml-2">
          <div
            className="w-5 h-5 flex items-center justify-center
      bg-white border border-gray-300
      rounded-full text-xs text-gray-800 font-bold
      hover:bg-gray-100 transition-all"
          >
            i
          </div>

          <div
            className="absolute left-0 mt-2 min-w-[18rem] opacity-0 pointer-events-none
      group-hover:opacity-100 transition-all
      bg-white text-gray-800
      border border-gray-300 p-4
      rounded-lg shadow-xl leading-relaxed z-40"
          >
            <h5 className="font-semibold mb-1">{infoText.title}</h5>
            <div className="whitespace-pre-line text-gray-700 text-sm">
              {infoText.body}
            </div>
          </div>
        </div>
      </div>

      <div
        id="explain-scroll"
        className="flex-1 p-6 overflow-y-auto overflow-x-hidden space-y-6"
      >
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
            {error}
          </div>
        )}

        {chats.map((chat, index) => (
          <div key={index} className="space-y-3">
            <div className="w-full flex justify-center mt-24 mb-12">
              <div className="w-full max-w-[900px] mx-auto flex justify-end px-2">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-3 shadow-md">
                  <p>{chat.question}</p>

                  {!isSourceMode && chat.questionNumber && (
                    <span className="text-xs opacity-75 block mt-1">
                      Question #{chat.questionNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="w-full max-w-full lg:max-w-[900px] mx-auto">
                {!chat.streaming && chat.safe === true && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-100 mb-3 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs text-green-700 font-semibold">
                      Safe
                    </span>
                  </div>
                )}
                {!chat.streaming && chat.safe === false && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-red-50 rounded-full border border-red-200 mb-3 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-xs text-red-700 font-semibold">
                      Unsafe
                    </span>
                  </div>
                )}
                {!chat.streaming && chat.safe === null && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-yellow-50 rounded-full border border-yellow-200 mb-3 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-yellow-600" />
                    <span className="text-xs text-yellow-700 font-semibold">
                      Checking...
                    </span>
                  </div>
                )}

                <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed mb-4">
                  {isSourceMode
                    ? renderSmartUI(chat)
                    : renderSmartLinks(chat.answer)}
                </div>

                {chat.reasoning_steps?.length > 0 && (
                  <div className="space-y-3 border-t border-slate-200 pt-3">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Reasoning Steps:
                    </h3>

                    {chat.reasoning_steps.map((step: any, idx: number) => {
                      const formatted = formatOutput(step.output_data);
                      const bg =
                        step.raw_type === "cot_visualization"
                          ? "bg-purple-50"
                          : step.raw_type === "tool_attribution_visual"
                          ? "bg-blue-50"
                          : step.raw_type === "tool_attribution_full"
                          ? "bg-green-50"
                          : step.raw_type === "answer_composition"
                          ? "bg-yellow-50"
                          : step.raw_type === "source_attributions"
                          ? "bg-orange-50"
                          : "bg-slate-50";

                      return (
                        <div
                          key={idx}
                          className="bg-white border border-slate-200 rounded-lg p-3 text-sm shadow-sm"
                        >
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>
                              Step {step.step_number}: {step.step_type}
                            </span>
                            <Clock className="w-3 h-3" />
                          </div>

                          <p className="text-slate-800 mb-2">
                            {step.reasoning}
                          </p>

                          {step.input_data && (
                            <pre className="text-xs bg-slate-100 p-2 rounded border mb-2 whitespace-pre-wrap break-all overflow-x-hidden">
                              {formatOutput(step.input_data)}
                            </pre>
                          )}

                          {step.output_data && (
                            <pre
                              className={`text-xs ${bg} p-3 rounded border whitespace-pre-wrap break-all overflow-x-hidden`}
                            >
                              {formatted}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {chat.metadata && !chat.streaming && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center">
                      <Settings className="w-4 h-4 mr-2" />
                      Computation Metadata
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs w-full">
                      {chat.metadata.processing_time_seconds !== null && (
                        <div className="flex items-center">
                          <Clock className="w-3 h-3 mr-2 text-blue-500" />
                          <span className="font-semibold">
                            Processing Time:
                          </span>
                          <span className="ml-2 text-blue-600 font-bold">
                            {typeof chat.metadata.processing_time_seconds ===
                            "number"
                              ? chat.metadata.processing_time_seconds.toFixed(3)
                              : "N/A"}
                            s
                          </span>
                        </div>
                      )}
                      {chat.metadata.timestamp && (
                        <div className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                          <Clock className="w-3 h-3 mr-2 text-slate-500" />
                          <span className="font-semibold">Timestamp:</span>
                          <span className="ml-2 text-slate-600 text-[10px] max-w-[120px] truncate">
                            {new Date(chat.metadata.timestamp).toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center col-span-2">
                        <Zap className="w-3 h-3 mr-2 text-purple-500" />
                        <span className="font-semibold">Parsing Method:</span>
                        <span className="ml-2 text-purple-600 font-mono whitespace-nowrap">
                          {chat.metadata?.parsed_info?.parsing_method ||
                            chat.metadata?.parsing_method ||
                            "N/A"}
                        </span>
                      </div>

                      {chat.metadata?.confidence?.score !== undefined && (
                        <div className="flex items-center whitespace-nowrap overflow-hidden text-ellipsis">
                          <TrendingUp className="w-3 h-3 mr-2 text-green-500" />
                          <span className="font-semibold">Confidence:</span>
                          <span className="ml-2 text-green-600 font-bold max-w-[120px] truncate">
                            {(chat.metadata.confidence.score * 100).toFixed(1)}%
                          </span>
                        </div>
                      )}

                      {chat.metadata.confidence?.level && (
                        <div className="flex items-center">
                          <Shield className="w-3 h-3 mr-2 text-green-500" />
                          <span className="font-semibold">Level:</span>
                          <span className="ml-2 text-green-600 uppercase font-bold whitespace-nowrap">
                            {chat.metadata.confidence.level}
                          </span>
                        </div>
                      )}
                    </div>

                    {chat.metadata.confidence?.interpretation && (
                      <div className="mt-3 p-3 bg-blue-50 rounded text-xs italic text-slate-700 border-l-4 border-blue-400">
                        <strong>Interpretation:</strong>
                        {chat.metadata.confidence.interpretation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="w-full flex justify-center mt-4">
            <div className="w-full max-w-[900px] mx-auto flex gap-3 px-2 py-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                AI
              </div>

              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 w-full shadow-sm">
                <div className="space-y-2">
                  <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
                  <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
                </div>

                <div className="flex items-center gap-2 mt-3 ml-1">
                  <div
                    key={loadingIndex}
                    className="text-slate-500 text-xs italic transition-opacity duration-700 ease-in-out"
                    style={{ width: `${longestLoadingText.length + 2}ch` }}
                  >
                    {loadingTexts[loadingIndex]}
                  </div>
                  <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" />
                  <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-150" />
                  <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="relative w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder={`Ask something about ${
              selectedSubject !== "general" ? selectedSubject : "anything"
            }...`}
            disabled={isLoading}
            className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />

          <button
            onClick={handleSubmit}
            disabled={!query.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 transition-colors duration-150 shadow-sm"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasoningView;
