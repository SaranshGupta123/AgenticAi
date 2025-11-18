import React, { useEffect, useState } from "react";
import { MessageSquare, Send, Shield, Clock, Zap } from "lucide-react";
import { fetchChatResponse, fetchDeepResearchResponse } from "../../api/api";
import ReactMarkdown from "react-markdown";

const LS_NORMAL = "agentic_normal_history";
const LS_DEEP = "agentic_deep_history";
const LS_METRICS = "agentic_metrics_data";

const loadingTexts = [
  "Thinking…",
  "Analyzing information…",
  "Checking relevant sources…",
  "Retrieving context…",
  "Generating answer…",
];

const longestLoadingText = loadingTexts.reduce((a, b) =>
  a.length > b.length ? a : b
);

type Chat = {
  question: string;
  answer: string;
  metadata?: any;
  streaming?: boolean;
  safe?: boolean;
  steps?: any[];
  evaluation?: any;
  agent_type?: string;
  questionNumber?: number;
  timestamp?: string;
};

export const ChatInterface = ({
  mode = "normal",
}: {
  mode?: "normal" | "deep_research";
}) => {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<Chat[]>(() => {
    try {
      const key = mode === "deep_research" ? LS_DEEP : LS_NORMAL;
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        question:
          mode === "deep_research"
            ? "What topic should we investigate in depth?"
            : "What are the latest updates from OpenAI?",
        answer:
          mode === "deep_research"
            ? "Deep Research mode allows multi-step reasoning, evidence gathering, structured analysis, and long-form synthesis. Ask a topic and I will begin the investigation."
            : "OpenAI recently made headlines with its $6.5 billion acquisition of io Products Inc., co-founded by Jony Ive. The company is exploring AI hardware collaborations and new ChatGPT improvements.",
        metadata: {
          total_time: 0,
          agent_type: mode === "deep_research" ? "deep_research" : "react",
        },
        safe: true,
        questionNumber: 0,
        timestamp: new Date().toISOString(),
      },
    ];
  });
  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  useEffect(() => {
    const key = mode === "deep_research" ? LS_DEEP : LS_NORMAL;
    localStorage.setItem(key, JSON.stringify(chats));

    let allMetrics: any[] = [];
    try {
      const raw = localStorage.getItem(LS_METRICS);
      if (raw) allMetrics = JSON.parse(raw);
    } catch {}

    const updatedMetrics = [...allMetrics];

    chats
      .filter((chat) => chat.questionNumber && chat.questionNumber > 0)
      .forEach((chat) => {
        const index = updatedMetrics.findIndex(
          (m) => m.questionNumber === chat.questionNumber
        );
        if (
          chat.answer &&
          chat.safety_check &&
          chat.answer !== "" &&
          chat.answer !== "Error fetching response."
        ) {
          const newEntry = {
            questionNumber: chat.questionNumber,
            question: chat.question,
            answer: chat.answer,
            metadata: chat.metadata,
            steps: chat.steps,
            evaluation: chat.evaluation,
            agent_type: chat.agent_type,
            safety_check: chat.safety_check,
            timestamp: chat.timestamp,
            mode,
          };

          if (index >= 0) {
            updatedMetrics[index] = newEntry;
          } else {
            updatedMetrics.push(newEntry);
          }
        }
      });

    updatedMetrics.sort((a, b) => a.questionNumber - b.questionNumber);
    localStorage.setItem(LS_METRICS, JSON.stringify(updatedMetrics));
  }, [chats, mode]);

  const streamAnswer = (fullText: string, fullData: any) => {
    let i = 0;
    const words = (fullText || "No response received.").split(" ");

    setChats((prev) => {
      const last = prev[prev.length - 1];
      const others = prev.slice(0, -1);
      return [
        ...others,
        {
          ...last,
          answer: "",
          streaming: true,
          metadata: fullData.metadata || last.metadata,
          steps: fullData.steps || last.steps,
          evaluation:
            fullData.evaluation_metrics ||
            fullData.evaluation ||
            last.evaluation,
          safety_check: fullData.safety_check || last.safety_check,
          agent_type: fullData.agent_type || last.agent_type,
        },
      ];
    });

    const id = setInterval(() => {
      setChats((prev) => {
        const last = prev[prev.length - 1];
        const others = prev.slice(0, -1);
        return [
          ...others,
          {
            ...last,
            answer: words.slice(0, i).join(" "),
            streaming: true,
            metadata: fullData.metadata || last.metadata,
            steps: fullData.steps || last.steps,
            evaluation:
              fullData.evaluation_metrics ||
              fullData.evaluation ||
              last.evaluation,
            agent_type: fullData.agent_type || last.agent_type,
            safety_check: fullData.safety_check || last.safety_check,
          },
        ];
      });
      i++;
      if (i > words.length) {
        clearInterval(id);
        setChats((prev) => {
          const last = prev[prev.length - 1];
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              streaming: false,
              answer: fullText,
              metadata: fullData.metadata || last.metadata,
              steps: fullData.steps || last.steps,
              evaluation:
                fullData.evaluation_metrics ||
                fullData.evaluation ||
                last.evaluation,
              agent_type: fullData.agent_type || last.agent_type,
              safety_check: fullData.safety_check || last.safety_check,
            },
          ];
        });
      }
    }, 40);
  };

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    const asked = query.trim();
    setQuery("");

    let allMetrics: any[] = [];
    try {
      const raw = localStorage.getItem(LS_METRICS);
      if (raw) allMetrics = JSON.parse(raw);
    } catch {}
    const questionNumber = allMetrics.length + 1;

    setChats((prev) => [
      ...prev,
      {
        question: asked,
        answer: "",
        streaming: true,
        metadata: {},
        safe: true,
        steps: [],
        evaluation: {},
        safety_check: {
          threat_level: "low",
          violation_type: "none",
          confidence_score: 0.0,
          explanation: "No issue detected.",
        },
        agent_type: mode === "deep_research" ? "deep_research" : "react",
        questionNumber: questionNumber,
        timestamp: new Date().toISOString(),
      },
    ]);

    setLoading(true);
    try {
      const data =
        mode === "deep_research"
          ? await fetchDeepResearchResponse(asked)
          : await fetchChatResponse(asked);

      console.log("[v0] API Response Data:", data);
      console.log("[v0] Steps:", data.steps?.length || 0);
      console.log("[v0] Evaluation:", data.evaluation ? "Present" : "Missing");
      console.log("[v0] Metadata:", data.metadata);

      streamAnswer(data.answer ?? data.final_answer ?? "No answer.", data);
    } catch (error) {
      console.error("[v0] Error fetching response:", error);
      streamAnswer("Error fetching response.", {});
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Query Interface{" "}
            {mode === "deep_research" ? "(Deep Research)" : "(React Agent)"}
          </h2>
        </div>
      </div>

      <div id="chat-scroll" className="flex-1 p-6 overflow-y-auto space-y-6">
        {chats.map((chat, index) => (
          <div key={index} className="space-y-3">
            <div className="w-full flex justify-center mt-24 mb-12">
              <div className="w-full max-w-[900px] mx-auto flex justify-end px-2">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-3 shadow-md">
                  <p>{chat.question}</p>
                  {chat.questionNumber && chat.questionNumber > 0 && (
                    <span className="text-xs opacity-75 mt-1 block">
                      Question #{chat.questionNumber}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full flex justify-center">
              <div className="w-full max-w-[900px] mx-auto">
                {!chat.streaming && chat.safe && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-100 mb-3 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs text-green-700 font-semibold">
                      Safe
                    </span>
                  </div>
                )}

                <div className="text-slate-800 leading-relaxed whitespace-pre-line prose prose-slate max-w-none">
                  {mode === "deep_research" ? (
                    <ReactMarkdown>{chat.answer}</ReactMarkdown>
                  ) : (
                    chat.answer
                  )}
                </div>

                {!chat.streaming && chat.metadata && (
                  <div className="flex items-center gap-4 mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {chat.metadata?.total_time?.toFixed?.(2) ??
                          chat.metadata?.processing_time_seconds?.toFixed?.(
                            2
                          ) ??
                          "—"}
                        s
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span className="capitalize">
                        {chat.agent_type ?? chat.metadata?.agent_type ?? "N/A"}
                      </span>
                    </div>

                    {chat.steps && chat.steps.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <span>Steps: {chat.steps.length}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
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
            placeholder="Ask about OpenAI, tech, weather, or any topic..."
            className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent text-sm"
            disabled={loading}
          />

          <button
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            title="Send query"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors duration-150 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
