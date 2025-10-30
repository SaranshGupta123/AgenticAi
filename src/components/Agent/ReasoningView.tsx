import React, { useState, useEffect } from "react";
import { Search, Shield, Clock, Zap, GitBranch } from "lucide-react";

export const ReasoningView: React.FC = () => {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<any[]>([
    {
      question: "How does reinforcement learning work in AI?",
      answer:
        "Reinforcement Learning (RL) is a method where an agent learns to make decisions by interacting with an environment. It receives feedback in the form of rewards or penalties, gradually improving its strategy to maximize long-term rewards. RL powers applications like robotics, game-playing AI, and recommendation systems.",
      metadata: { total_time: 6.72, agent_type: "react" },
      reasoning_steps: [
        {
          step_number: 1,
          step_type: "query_analysis",
          reasoning:
            "Detected that the query is conceptual and related to AI learning paradigms.",
          input_data: { query: "How does reinforcement learning work in AI?" },
          output_data: {
            query_type: "conceptual",
            complexity: "medium",
            key_terms: ["reinforcement learning", "AI"],
          },
        },
        {
          step_number: 2,
          step_type: "knowledge_retrieval",
          reasoning:
            "Searched knowledge base for key concepts: agent, environment, reward, and policy.",
          input_data: { sources: ["AI textbooks", "DeepMind papers"] },
          output_data: {
            relevant_sections: [
              "Reward-based learning process",
              "Policy optimization",
            ],
          },
        },
        {
          step_number: 3,
          step_type: "concept_synthesis",
          reasoning:
            "Merged definitions and examples into a cohesive explanation of reinforcement learning.",
          input_data: { synthesis_method: "knowledge summarization" },
          output_data: { coherence_score: 0.92 },
        },
        {
          step_number: 4,
          step_type: "validation",
          reasoning:
            "Validated the explanation for factual accuracy using multiple trusted AI sources.",
          output_data: { validation_passed: true },
        },
        {
          step_number: 5,
          step_type: "final_response",
          reasoning:
            "Composed the final human-readable explanation for the user.",
          output_data: { decision: "Provide concise answer" },
        },
      ],
      safe: true,
    },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchExplainabilityData = async (customQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch("/data/explainability_response.json");
      if (!res.ok) throw new Error("Failed to fetch explainability data");
      const data = await res.json();

      setChats((prev) => [
        ...prev,
        {
          question: customQuery,
          answer: data.final_decision,
          metadata: {
            total_time: data.total_reasoning_time,
            agent_type: data.agent_type,
          },
          reasoning_steps: data.reasoning_steps,
          safe: true,
        },
      ]);
    } catch (error) {
      console.error("Error fetching explainability data:", error);
      alert("Failed to fetch reasoning trace.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    await fetchExplainabilityData(query);
    setQuery("");
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const container = document.getElementById("explain-scroll");
    if (container) container.scrollTop = container.scrollHeight;
  }, [chats, loading]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Reasoning Trace
          </h2>
        </div>
      </div>

      <div id="explain-scroll" className="flex-1 p-6 overflow-y-auto space-y-6">
        {chats.map((chat, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-purple-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-2xl shadow-md">
                <p>{chat.question}</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 max-w-3xl shadow-sm">
                {chat.safe && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-100 mb-3 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs text-green-700 font-semibold">
                      Safe
                    </span>
                  </div>
                )}

                <p className="text-slate-800 leading-relaxed mb-4">
                  {chat.answer}
                </p>

                {chat.reasoning_steps && (
                  <div className="space-y-3 border-t border-slate-200 pt-3">
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">
                      Reasoning Steps:
                    </h3>
                    {chat.reasoning_steps.map((step: any, idx: number) => (
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
                        <p className="text-slate-800 mb-1">{step.reasoning}</p>
                        {step.output_data && (
                          <p className="text-slate-600 italic text-xs">
                            {JSON.stringify(step.output_data).slice(0, 100)}...
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{chat.metadata?.total_time.toFixed(2)}s</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span className="capitalize">
                      {chat.metadata?.agent_type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center space-x-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="text-slate-600 text-sm">
              Fetching explainability trace...
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex space-x-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask a new explainability question..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center space-x-2 font-medium transition-colors duration-150 shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReasoningView;
