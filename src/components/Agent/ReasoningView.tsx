import React, { useEffect, useState } from "react";
import { Search, Shield, Clock, Zap, GitBranch } from "lucide-react";
import {
  fetchExplainabilityChatResponse,
  fetchDeepResearchExplainabilityResponse,
} from "../../api/api";

import ReactMarkdown from "react-markdown";

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
}: {
  agentType: "react" | "deep_research";
}) => {
  const REASON_KEY =
    agentType === "deep_research" ? LS_REASON_DEEP : LS_REASON_REACT;
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

  const [loading, setLoading] = useState(false);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(REASON_KEY, JSON.stringify(chats));
  }, [chats, REASON_KEY]);

  useEffect(() => {
    const el = document.getElementById("explain-scroll");
    if (el) el.scrollTop = el.scrollHeight;
  }, [chats, loading]);

  useEffect(() => {
    if (!loading) return;
    const id = setInterval(
      () => setLoadingIndex((i) => (i + 1) % loadingTexts.length),
      1200
    );
    return () => clearInterval(id);
  }, [loading]);

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
    setError(null);
    try {
      const data =
        agentType === "deep_research"
          ? await fetchDeepResearchExplainabilityResponse(customQuery)
          : await fetchExplainabilityChatResponse(customQuery);

      const finalAnswer =
        data.final_answer ??
        data.final_decision ??
        data.final_decision_text ??
        "No answer.";

      const blocks: any[] = [];

      if (data.agent_steps) {
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
        total_time:
          data.metadata?.total_execution_time ??
          data.metadata?.total_reasoning_time ??
          data.metadata?.total_time ??
          0,
        agent_type: data.metadata?.agent_type ?? agentType,
      };

      setChats((prev) => [
        ...prev,
        {
          question: customQuery,
          answer: finalAnswer,
          metadata,
          reasoning_steps: steps,
          safe: true,
        },
      ]);
    } catch (err: any) {
      setError(err?.message || "Failed to fetch reasoning trace.");
      streamAnswer("⚠️ Error fetching explainability response.");
    }
  };

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    const asked = query.trim();
    setQuery("");
    setChats((prev) => [
      ...prev,
      {
        question: asked,
        answer: "",
        streaming: true,
        metadata: {},
        safe: true,
      },
    ]);
    setLoading(true);
    try {
      await fetchExplainabilityData(asked);
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
      <div className="border-b border-slate-200 px-6 py-4 flex items-center space-x-2">
        <GitBranch className="w-5 h-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-slate-900">
          Reasoning Trace
        </h2>
      </div>

      <div id="explain-scroll" className="flex-1 p-6 overflow-y-auto space-y-6">
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

                <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed mb-4">
                  <ReactMarkdown>{chat.answer}</ReactMarkdown>
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
                            <pre className="text-xs bg-slate-100 p-2 rounded border mb-2 whitespace-pre-wrap overflow-x-auto">
                              {formatOutput(step.input_data)}
                            </pre>
                          )}

                          {step.output_data && (
                            <pre
                              className={`text-xs ${bg} p-3 rounded border whitespace-pre-wrap overflow-x-auto`}
                            >
                              {formatted}
                            </pre>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {!chat.streaming && (
                  <div className="flex items-center gap-4 mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {chat.metadata?.total_time?.toFixed?.(2) ?? "—"}s
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span className="capitalize">
                        {chat.metadata?.agent_type ?? "N/A"}
                      </span>
                    </div>
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
            placeholder="Ask something..."
            disabled={loading}
            className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"
          />

          <button
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
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

// import React, { useState, useEffect } from "react";
// import { Search, Shield, Clock, Zap, GitBranch } from "lucide-react";
// import {
//   fetchExplainabilityChatResponse,
//   fetchChatResponse,
//   fetchDeepResearchResponse,
// } from "../../api/api";

// export const ReasoningView: React.FC = () => {
//   const [query, setQuery] = useState("");
//   const [chats, setChats] = useState<any[]>([
//     {
//       question: "How does reinforcement learning work in AI?",
//       answer:
//         "Reinforcement Learning (RL) is a method where an agent learns to make decisions by interacting with an environment. It receives feedback in the form of rewards or penalties, gradually improving its strategy to maximize long-term rewards. RL powers applications like robotics, game-playing AI, and recommendation systems.",
//       metadata: { total_time: 6.72, agent_type: "react" },
//       reasoning_steps: [
//         {
//           step_number: 1,
//           step_type: "query_analysis",
//           reasoning:
//             "Detected that the query is conceptual and related to AI learning paradigms.",
//           input_data: { query: "How does reinforcement learning work in AI?" },
//           output_data: {
//             query_type: "conceptual",
//             complexity: "medium",
//             key_terms: ["reinforcement learning", "AI"],
//           },
//         },
//         {
//           step_number: 2,
//           step_type: "knowledge_retrieval",
//           reasoning:
//             "Searched knowledge base for key concepts: agent, environment, reward, and policy.",
//           input_data: { sources: ["AI textbooks", "DeepMind papers"] },
//           output_data: {
//             relevant_sections: [
//               "Reward-based learning process",
//               "Policy optimization",
//             ],
//           },
//         },
//         {
//           step_number: 3,
//           step_type: "concept_synthesis",
//           reasoning:
//             "Merged definitions and examples into a cohesive explanation of reinforcement learning.",
//           input_data: { synthesis_method: "knowledge summarization" },
//           output_data: { coherence_score: 0.92 },
//         },
//         {
//           step_number: 4,
//           step_type: "validation",
//           reasoning:
//             "Validated the explanation for factual accuracy using multiple trusted AI sources.",
//           output_data: { validation_passed: true },
//         },
//         {
//           step_number: 5,
//           step_type: "final_response",
//           reasoning:
//             "Composed the final human-readable explanation for the user.",
//           output_data: { decision: "Provide concise answer" },
//         },
//       ],
//       safe: true,
//     },
//   ]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const loadingTexts = [
//     "Thinking…",
//     "Analyzing information…",
//     "Retrieving context…",
//     "Synthesizing response…",
//     "Generating answer…",
//   ];
//   const longestLoadingText = loadingTexts.reduce((a, b) =>
//     a.length > b.length ? a : b
//   );
//   const [loadingIndex, setLoadingIndex] = useState(0);

//   const fetchExplainabilityData = async (customQuery: string) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await fetchExplainabilityChatResponse(customQuery);

//       const finalText =
//         data.final_answer ??
//         data.final_decision ??
//         data.final_decision_text ??
//         "No answer.";

//       const reasoningBlocks: any[] = [];

//       if (data.agent_steps) {
//         reasoningBlocks.push(
//           ...data.agent_steps.map((s) => ({
//             ...s,
//             step_type: s.step_type ?? s.action ?? "agent_step",
//             raw_type: "agent_steps",
//           }))
//         );
//       }

//       if (data.explainability_results?.chain_of_thought?.summary) {
//         reasoningBlocks.push({
//           step_type: "cot_summary",
//           reasoning:
//             "Summary of chain-of-thought (aggregated reasoning statistics).",
//           output_data: data.explainability_results.chain_of_thought.summary,
//           raw_type: "cot_summary",
//         });
//       }

//       if (data.explainability_results?.chain_of_thought?.visualization) {
//         reasoningBlocks.push({
//           step_type: "cot_visualization",
//           reasoning: "Chain-of-thought visualization (text trace).",
//           output_data:
//             data.explainability_results.chain_of_thought.visualization,
//           raw_type: "cot_visualization",
//         });
//       }

//       if (
//         data.explainability_results?.chain_of_thought?.full_trace
//           ?.reasoning_steps
//       ) {
//         reasoningBlocks.push(
//           ...data.explainability_results.chain_of_thought.full_trace.reasoning_steps.map(
//             (s) => ({
//               ...s,
//               step_type: s.step_type ?? "full_trace_step",
//               reasoning: s.reasoning ?? "",
//               output_data: s.output_data,
//               raw_type: "full_trace",
//             })
//           )
//         );
//       }

//       if (
//         data.explainability_results?.chain_of_thought?.full_trace
//           ?.final_decision
//       ) {
//         reasoningBlocks.push({
//           step_type: "final_decision",
//           reasoning: "Model’s final reasoning decision.",
//           output_data:
//             data.explainability_results.chain_of_thought.full_trace
//               .final_decision,
//           raw_type: "final_decision",
//         });
//       }

//       if (data.explainability_results?.tool_attribution?.full_report) {
//         reasoningBlocks.push({
//           step_type: "tool_attribution_full",
//           reasoning: "Full tool attribution report.",
//           output_data: data.explainability_results.tool_attribution.full_report,
//           raw_type: "tool_attribution_full",
//         });
//       }

//       if (data.explainability_results?.tool_attribution?.visual_report) {
//         reasoningBlocks.push({
//           step_type: "tool_attribution_visual",
//           reasoning: "Tool usage visual report.",
//           output_data:
//             data.explainability_results.tool_attribution.visual_report,
//           raw_type: "tool_attribution_visual",
//         });
//       }

//       if (
//         data.explainability_results?.tool_attribution?.full_report
//           ?.answer_composition
//       ) {
//         reasoningBlocks.push({
//           step_type: "answer_composition",
//           output_data:
//             data.explainability_results.tool_attribution.full_report
//               .answer_composition,
//           raw_type: "answer_composition",
//         });
//       }

//       if (
//         data.explainability_results?.tool_attribution?.full_report
//           ?.source_attributions
//       ) {
//         reasoningBlocks.push({
//           step_type: "source_attributions",
//           output_data:
//             data.explainability_results.tool_attribution.full_report
//               .source_attributions,
//           raw_type: "source_attributions",
//         });
//       }

//       const steps = reasoningBlocks.map((s, i) => ({
//         step_number: i + 1,
//         ...s,
//       }));

//       const metadata = data.metadata ??
//         data.explainability_results?.summary ??
//         data?.explainability_results ?? {
//           total_time:
//             data.total_execution_time ??
//             data.total_reasoning_time ??
//             data.metadata?.total_time,
//         };

//       setChats((prev) => [
//         ...prev,
//         {
//           question: customQuery,
//           answer: finalText,
//           metadata: {
//             total_time:
//               metadata.total_execution_time ??
//               metadata.total_reasoning_time ??
//               metadata.total_time ??
//               data.metadata?.total_execution_time ??
//               data.metadata?.total_reasoning_time ??
//               data.metadata?.total_time ??
//               0,
//             agent_type: data.metadata?.agent_type ?? data.agent_type ?? "react",
//           },
//           reasoning_steps: steps,
//           explainability_results:
//             data.explainability_results ?? data.explainability_results ?? null,
//           safe: true,
//         },
//       ]);
//     } catch (err: any) {
//       console.error("Error fetching explainability data:", err);
//       setError(err.message || "Failed to fetch reasoning trace.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async () => {
//     if (!query.trim() || loading) return;

//     const asked = query;
//     setQuery("");
//     setChats((prev) => [
//       ...prev,
//       {
//         question: asked,
//         answer: "",
//         streaming: true,
//         metadata: {},
//         safe: true,
//       },
//     ]);

//     setLoading(true);

//     try {
//       await fetchExplainabilityData(asked);
//     } catch (e) {
//       streamAnswer("Error fetching response.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit();
//     }
//   };

//   useEffect(() => {
//     const container = document.getElementById("explain-scroll");
//     if (container) container.scrollTop = container.scrollHeight;
//   }, [chats, loading]);
//   useEffect(() => {
//     if (!loading) return;

//     const interval = setInterval(() => {
//       setLoadingIndex((i) => (i + 1) % loadingTexts.length);
//     }, 1200);

//     return () => clearInterval(interval);
//   }, [loading]);
//   const streamAnswer = (fullText: string) => {
//     let i = 0;
//     const words = fullText.split(" ");

//     const interval = setInterval(() => {
//       setChats((prev) => {
//         const lastMsg = prev[prev.length - 1];
//         const others = prev.slice(0, -1);

//         return [
//           ...others,
//           {
//             ...lastMsg,
//             answer: words.slice(0, i).join(" "),
//             streaming: true,
//           },
//         ];
//       });

//       i++;

//       if (i > words.length) {
//         clearInterval(interval);

//         setChats((prev) => {
//           const lastMsg = prev[prev.length - 1];
//           const others = prev.slice(0, -1);

//           return [
//             ...others,
//             {
//               ...lastMsg,
//               streaming: false,
//             },
//           ];
//         });
//       }
//     }, 40);
//   };

//   return (
//     <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
//       <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <GitBranch className="w-5 h-5 text-purple-600" />
//           <h2 className="text-lg font-semibold text-slate-900">
//             Reasoning Trace
//           </h2>
//         </div>
//       </div>

//       <div id="explain-scroll" className="flex-1 p-6 overflow-y-auto space-y-6">
//         {error && (
//           <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
//             {error}
//           </div>
//         )}

//         {chats.map((chat, index) => (
//           <div key={index} className="space-y-3">
//             <div className="w-full flex justify-center mt-24 mb-12">
//               <div className="w-full max-w-[900px] mx-auto flex justify-end px-2">
//                 <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-3 shadow-md">
//                   <p>{chat.question}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="w-full flex justify-center">
//               <div className="w-full max-w-[900px] mx-auto">
//                 {!chat.streaming && chat.safe && (
//                   <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-100 mb-3 shadow-sm">
//                     <Shield className="w-3.5 h-3.5 text-green-600" />
//                     <span className="text-xs text-green-700 font-semibold">
//                       Safe
//                     </span>
//                   </div>
//                 )}

//                 <p className="text-slate-800 leading-relaxed mb-4">
//                   {chat.answer}
//                 </p>

//                 {chat.reasoning_steps && chat.reasoning_steps.length > 0 && (
//                   <div className="space-y-3 border-t border-slate-200 pt-3">
//                     <h3 className="text-sm font-semibold text-slate-700 mb-2">
//                       Reasoning Steps:
//                     </h3>

//                     {chat.reasoning_steps.map((step: any, idx: number) => (
//                       <div
//                         key={idx}
//                         className="bg-white border border-slate-200 rounded-lg p-3 text-sm shadow-sm"
//                       >
//                         <div className="flex justify-between text-xs text-slate-500 mb-1">
//                           <span>
//                             Step {step.step_number ?? idx + 1}:
//                             {step.step_type ??
//                               step.action ??
//                               step.action?.toString() ??
//                               "step"}
//                           </span>
//                           <Clock className="w-3 h-3" />
//                         </div>

//                         <p className="text-slate-800 mb-2">
//                           {step.reasoning ??
//                             step.thought ??
//                             step.observation ??
//                             ""}
//                         </p>

//                         {(() => {
//                           const formatOutput = (data: any) => {
//                             if (!data) return "";

//                             if (typeof data === "string") return data;

//                             if (Array.isArray(data)) {
//                               return data
//                                 .map((item) =>
//                                   typeof item === "object"
//                                     ? Object.entries(item)
//                                         .map(
//                                           ([k, v]) =>
//                                             `${k}: ${
//                                               typeof v === "object"
//                                                 ? formatOutput(v)
//                                                 : v
//                                             }`
//                                         )
//                                         .join("\n")
//                                     : String(item)
//                                 )
//                                 .join("\n\n");
//                             }

//                             if (typeof data === "object") {
//                               return Object.entries(data)
//                                 .map(([k, v]) => {
//                                   if (typeof v === "object") {
//                                     return `${k}:\n${formatOutput(v)
//                                       .split("\n")
//                                       .map((line) => "  " + line)
//                                       .join("\n")}`;
//                                   }
//                                   return `${k}: ${v}`;
//                                 })
//                                 .join("\n");
//                             }

//                             return String(data);
//                           };

//                           const formatted = formatOutput(step.output_data);

//                           if (step.raw_type === "cot_visualization") {
//                             return (
//                               <pre className="text-xs bg-purple-50 p-3 rounded border whitespace-pre-wrap overflow-x-auto">
//                                 {formatted}
//                               </pre>
//                             );
//                           }

//                           if (step.raw_type === "tool_attribution_visual") {
//                             return (
//                               <pre className="text-xs bg-blue-50 p-3 rounded border whitespace-pre-wrap overflow-x-auto">
//                                 {formatted}
//                               </pre>
//                             );
//                           }

//                           if (step.raw_type === "tool_attribution_full") {
//                             return (
//                               <pre className="text-xs bg-green-50 p-3 rounded border whitespace-pre-wrap overflow-x-auto h-64">
//                                 {formatted}
//                               </pre>
//                             );
//                           }

//                           if (step.raw_type === "answer_composition") {
//                             return (
//                               <pre className="text-xs bg-yellow-50 p-3 rounded border whitespace-pre-wrap overflow-x-auto">
//                                 {formatted}
//                               </pre>
//                             );
//                           }

//                           if (step.raw_type === "source_attributions") {
//                             return (
//                               <pre className="text-xs bg-orange-50 p-3 rounded border whitespace-pre-wrap overflow-x-auto">
//                                 {formatted}
//                               </pre>
//                             );
//                           }

//                           return (
//                             <pre className="text-xs bg-slate-50 p-3 rounded border whitespace-pre-wrap overflow-x-auto">
//                               {formatted}
//                             </pre>
//                           );
//                         })()}
//                       </div>
//                     ))}
//                   </div>
//                 )}

//                 {!chat.streaming && (
//                   <div className="w-full flex justify-center">
//                     <div className="w-full max-w-[900px] mx-auto">
//                       <div className="flex items-center gap-4 mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
//                         <div className="flex items-center space-x-1">
//                           <Clock className="w-3 h-3" />
//                           <span>
//                             {chat.metadata?.total_time?.toFixed(2) ?? "—"}s
//                           </span>
//                         </div>

//                         <div className="flex items-center space-x-1">
//                           <Zap className="w-3 h-3" />
//                           <span className="capitalize">
//                             {chat.metadata?.agent_type ?? "N/A"}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}

//         {loading && (
//           <div className="w-full flex justify-center mt-4">
//             <div className="w-full max-w-[900px] mx-auto flex gap-3 px-2 py-3">
//               <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
//                 AI
//               </div>

//               <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 w-full shadow-sm">
//                 <div className="space-y-2">
//                   <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse"></div>
//                   <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse"></div>
//                   <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse"></div>
//                 </div>

//                 <div className="flex items-center gap-2 mt-3 ml-1">
//                   <div
//                     key={loadingIndex}
//                     className="text-slate-500 text-xs italic transition-opacity duration-700 ease-in-out"
//                     style={{ width: `${longestLoadingText.length + 2}ch` }}
//                   >
//                     {loadingTexts[loadingIndex]}
//                   </div>
//                   <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce"></span>
//                   <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-150"></span>
//                   <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-300"></span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       <div className="border-t border-slate-200 p-4 bg-slate-50">
//         <div className="relative w-full">
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             onKeyDown={handleKey}
//             placeholder="Ask something..."
//             className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl
//                focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent text-sm"
//             disabled={loading}
//           />

//           <button
//             onClick={handleSubmit}
//             disabled={!query.trim() || loading}
//             className="absolute right-3 top-1/2 -translate-y-1/2
//                p-2 rounded-full bg-blue-600 hover:bg-blue-700
//                text-white disabled:bg-slate-300 disabled:cursor-not-allowed
//                transition-colors duration-150 shadow-sm"
//           >
//             <Search className="w-4 h-4" />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReasoningView;
