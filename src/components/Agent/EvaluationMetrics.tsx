import React, { useState, useEffect } from "react";
import {
  BarChart3,
  CheckCircle,
  Target,
  GitBranch,
  ChevronDown,
  ChevronUp,
  Clock,
  Zap,
  ListOrdered,
  BookOpen,
  Users,
  MessageSquare,
  Shield,
  Maximize2,
  X,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
const LinkRenderer = (props: any) => {
  const href = props.href || "";
  const children = props.children;

  if (!href) return <>{children}</>;

  const isYT = href.includes("youtube.com") || href.includes("youtu.be");
  const isGitHub = href.includes("github.com");
  const isArxiv = href.includes("arxiv.org");
  const isPDF = href.endsWith(".pdf");

  let bg = "bg-blue-600 hover:bg-blue-700";
  let icon = "🔗";
  let label = children;

  if (isYT) {
    bg = "bg-red-600 hover:bg-red-700";
    icon = "▶️";
  } else if (isGitHub) {
    bg = "bg-slate-900 hover:bg-black";
    icon = "💻";
  } else if (isArxiv) {
    bg = "bg-purple-700 hover:bg-purple-800";
    icon = "📄";
  } else if (isPDF) {
    bg = "bg-rose-600 hover:bg-rose-700";
    icon = "📕";
  } else {
    bg = "bg-blue-500 hover:bg-blue-600";
    icon = "🌐";
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-sm transition-all duration-200 ${bg}`}
    >
      <span>{icon}</span>
      <span className="truncate max-w-[160px]">{label}</span>
    </a>
  );
};

const urlify = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s)]+)/g;

  return text.replace(urlRegex, (url) => {
    return `[${url}](${url})`;
  });
};

const LS_METRICS = "agentic_metrics_data";

type QuestionMetrics = {
  questionNumber: number;
  question: string;
  answer: string;
  metadata?: any;
  steps?: any[];
  evaluation?: any;
  agent_type?: string;
  timestamp?: string;
  mode?: string;
};

export const EvaluationMetrics: React.FC = () => {
  const [metricsData, setMetricsData] = useState<QuestionMetrics[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [agentType, setAgentType] = useState("react");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [fullTextModal, setFullTextModal] = useState<{
    isOpen: boolean;
    title: string;
    content: string;
  }>({ isOpen: false, title: "", content: "" });
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 7;
  const totalPages = Math.ceil(metricsData.length / PAGE_SIZE);

  const visibleQuestions = metricsData.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  useEffect(() => {
    const loadMetrics = () => {
      try {
        const raw = localStorage.getItem(LS_METRICS);
        if (raw) {
          const data = JSON.parse(raw);
          setMetricsData(data);
        }
      } catch (error) {
        console.error("Error loading metrics:", error);
      }
    };

    loadMetrics();
    const interval = setInterval(loadMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateOverallMetrics = () => {
    if (metricsData.length === 0) {
      return {
        taskSuccess: { rate: 0, successful: 0, total: 0 },
        responseRelevance: { average: 0, high: 0, low: 0 },
        knowledgeUtil: { utilization: 0, diversity: 0 },
        planning: { avgSteps: 0, toolEfficiency: 0 },
      };
    }

    const totalQuestions = metricsData.length;
    const successfulQuestions = metricsData.filter(
      (q) =>
        q.answer &&
        q.answer !== "Error fetching response." &&
        q.answer !== "No answer." &&
        !q.answer.startsWith("⚠️ Error:")
    ).length;
    const avgSteps =
      metricsData.reduce((acc, q) => acc + (q.steps?.length || 0), 0) /
      totalQuestions;
    let avgRelevance = 0;
    let highRelevanceCount = 0;
    let lowRelevanceCount = 0;

    metricsData.forEach((q) => {
      if (q.evaluation?.response_relevance?.average_relevance) {
        avgRelevance += q.evaluation.response_relevance.average_relevance;
        highRelevanceCount +=
          q.evaluation.response_relevance.high_relevance_count || 0;
        lowRelevanceCount +=
          q.evaluation.response_relevance.low_relevance_count || 0;
      } else {
        const hasAnswer = q.answer && q.answer.length > 50;
        const hasSteps = q.steps && q.steps.length > 0;
        const estimatedRelevance = hasAnswer ? (hasSteps ? 85 : 70) : 30;
        avgRelevance += estimatedRelevance;

        if (estimatedRelevance >= 80) highRelevanceCount++;
        else if (estimatedRelevance < 50) lowRelevanceCount++;
      }
    });
    avgRelevance = avgRelevance / totalQuestions;

    let avgUtilization = 0;
    let avgDiversity = 0;

    metricsData.forEach((q) => {
      if (q.evaluation?.knowledge_utilization) {
        avgUtilization +=
          q.evaluation.knowledge_utilization.average_utilization || 0;
        avgDiversity +=
          q.evaluation.knowledge_utilization.average_source_diversity || 0;
      } else if (q.explainability?.tool_attribution) {
        const toolUsage = q.explainability.tool_attribution.tool_usage_summary;
        const toolsUsed = toolUsage?.unique_tools_used || 0;
        const totalTools = toolUsage?.total_tools_invoked || 0;

        avgUtilization +=
          totalTools > 0 ? Math.min(100, (toolsUsed / totalTools) * 100) : 0;

        avgDiversity +=
          totalTools > 0
            ? Math.min(100, (toolsUsed / Math.max(1, totalTools)) * 100)
            : 0;
      } else if (q.steps && q.steps.length > 0) {
        const uniqueActions = new Set(
          q.steps.map((s) => s.action || s.step_type)
        ).size;
        avgUtilization += Math.min(100, (q.steps.length / 5) * 100);
        avgDiversity += Math.min(
          100,
          (uniqueActions / Math.max(1, q.steps.length)) * 100
        );
      } else {
        avgUtilization += 0;
        avgDiversity += 0;
      }
    });
    avgUtilization = avgUtilization / totalQuestions;
    avgDiversity = avgDiversity / totalQuestions;
    let avgToolEfficiency = 0;

    metricsData.forEach((q) => {
      if (q.evaluation?.planning_quality?.average_tool_efficiency) {
        avgToolEfficiency +=
          q.evaluation.planning_quality.average_tool_efficiency;
      } else {
        const steps = q.steps?.length || 1;
        const hasGoodAnswer =
          q.answer &&
          q.answer.length > 100 &&
          !q.answer.startsWith("⚠️ Error:");

        const efficiency = hasGoodAnswer
          ? Math.max(50, 100 - steps * 5)
          : Math.max(20, 60 - steps * 10);

        avgToolEfficiency += efficiency;
      }
    });
    avgToolEfficiency = avgToolEfficiency / totalQuestions;

    return {
      taskSuccess: {
        rate: (successfulQuestions / totalQuestions) * 100,
        successful: successfulQuestions,
        total: totalQuestions,
      },
      responseRelevance: {
        average: avgRelevance,
        high: highRelevanceCount,
        low: lowRelevanceCount,
      },
      knowledgeUtil: {
        utilization: avgUtilization,
        diversity: avgDiversity,
      },
      planning: {
        avgSteps: avgSteps,
        toolEfficiency: avgToolEfficiency,
      },
    };
  };

  const metrics = calculateOverallMetrics();
  const selectedData = metricsData.find(
    (q) => q.questionNumber === selectedQuestion
  );

  const toggleQuestion = (questionNumber: number) => {
    setSelectedQuestion(
      selectedQuestion === questionNumber ? null : questionNumber
    );
    setExpandedStep(null);
  };

  const toggleStep = (stepNumber: number) => {
    setExpandedStep(expandedStep === stepNumber ? null : stepNumber);
  };

  const openFullText = (title: string, content: string) => {
    setFullTextModal({ isOpen: true, title, content });
  };

  const closeFullText = () => {
    setFullTextModal({ isOpen: false, title: "", content: "" });
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="mt-6 bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <ListOrdered className="w-5 h-5" />
            <span>Performance Trend (Questions)</span>
          </h3>

          {metricsData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No questions asked yet. Start asking questions to see performance
              metrics.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <div className="relative w-full overflow-hidden h-[60px] border rounded-lg p-2">
                <div
                  className="transition-transform duration-500"
                  style={{ transform: `translateY(-${page * 200}px)` }}
                >
                  {Array.from({ length: totalPages }).map((_, pageIndex) => (
                    <div
                      key={pageIndex}
                      className="h-[200px] flex flex-wrap gap-2 justify-center items-start"
                    >
                      {metricsData
                        .slice(
                          pageIndex * PAGE_SIZE,
                          pageIndex * PAGE_SIZE + PAGE_SIZE
                        )
                        .map((data) => {
                          const hasError =
                            !data.answer ||
                            data.answer === "Error fetching response." ||
                            data.answer === "No answer.";
                          const isSelected =
                            selectedQuestion === data.questionNumber;

                          return (
                            <button
                              key={data.questionNumber}
                              onClick={() =>
                                toggleQuestion(data.questionNumber)
                              }
                              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                isSelected
                                  ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400"
                                  : hasError
                                  ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-300"
                                  : "bg-white text-slate-700 hover:bg-blue-50 border border-slate-300 hover:border-blue-400"
                              }`}
                              title={`${data.question.substring(0, 50)}...`}
                            >
                              Question {data.questionNumber}
                            </button>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-center w-full mb-4 gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                    page === 0
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  ↑ Up
                </button>

                <button
                  disabled={page === totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all shadow-sm ${
                    page === totalPages - 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  ↓ Down
                </button>
              </div>
            </div>
          )}

          <div className="mt-3 text-xs text-slate-500 text-center">
            Click on any button to view detailed information below
          </div>
        </div>
        <div className="flex items-center justify-between mb-6 mt-8">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Pipeline Evaluation Metrics</span>

            <div className="relative cursor-pointer group">
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
  rounded-lg shadow-xl leading-relaxed z-40 text-xs"
              >
                <h5 className="font-semibold mb-1">Evaluation Metrics Panel</h5>

                <p>• Shows aggregated performance metrics for all questions</p>
                <p>• Includes success rate, relevance, planning, etc.</p>
                <p>• Click a question to view detailed analysis</p>
              </div>
            </div>
          </h2>

          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Overall:
            {(
              selectedData?.evaluation?.summary?.overall_score ||
              metrics.taskSuccess.rate
            ).toFixed(1)}
            /100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Task Success Rate</span>
              </h3>
              <span className="text-2xl font-bold text-blue-700">
                {metrics.taskSuccess.rate.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Successful:</span>
                <span className="font-semibold">
                  {metrics.taskSuccess.successful}/{metrics.taskSuccess.total}
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${metrics.taskSuccess.rate}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Response Relevance</span>
              </h3>
              <span className="text-2xl font-bold text-green-700">
                {metrics.responseRelevance.average.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">High Relevance:</span>
                <span className="font-semibold text-green-700">
                  {metrics.responseRelevance.high}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Low Relevance:</span>
                <span className="font-semibold text-amber-700">
                  {metrics.responseRelevance.low}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span>Knowledge Utilization</span>
              </h3>
              <span className="text-2xl font-bold text-purple-700">
                {metrics.knowledgeUtil.utilization.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Source Diversity:</span>
                <span className="font-semibold">
                  {metrics.knowledgeUtil.diversity.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-5 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-amber-600" />
                <span>Planning Quality</span>
              </h3>
              <span className="text-2xl font-bold text-amber-700">
                {metrics.planning.toolEfficiency.toFixed(1)}%
              </span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Steps:</span>
                <span className="font-semibold">
                  {metrics.planning.avgSteps.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        </div>
        {selectedData && (
          <div className="mt-6 bg-white rounded-lg border-2 border-blue-200 overflow-hidden">
            <div className="bg-blue-50 px-5 py-3 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    {selectedData.questionNumber}
                  </span>
                  <span>Question {selectedData.questionNumber} Details</span>
                </h3>
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="text-slate-500 hover:text-slate-700 font-medium"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  Question:
                </h4>
                <p className="text-slate-900">{selectedData.question}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-slate-600">
                      Processing Time
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">
                    {selectedData.metadata?.total_time?.toFixed?.(2) ||
                      selectedData.metadata?.processing_time_seconds?.toFixed?.(
                        2
                      ) ||
                      "N/A"}
                    s
                  </p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-slate-600">Agent Type</span>
                  </div>
                  <p className="text-sm font-bold text-purple-700 capitalize">
                    {selectedData.agent_type ||
                      selectedData.metadata?.agent_type ||
                      "N/A"}
                  </p>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <ListOrdered className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-slate-600">Steps</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">
                    {selectedData.steps?.length || 0}
                  </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-4 h-4 text-amber-600" />
                    <span className="text-xs text-slate-600">Mode</span>
                  </div>
                  <p className="text-sm font-bold text-amber-700 capitalize">
                    {selectedData.mode || "Normal"}
                  </p>
                </div>
              </div>

              {selectedData.steps && selectedData.steps.length > 0 && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Agent Steps:
                  </h4>
                  <div className="space-y-2">
                    {selectedData.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg border border-slate-200 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleStep(idx)}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                              {step.step_number || idx + 1}
                            </span>
                            <span className="font-medium text-slate-900">
                              {step.action || "Action"}
                            </span>
                          </div>
                          {expandedStep === idx ? (
                            <ChevronUp className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          )}
                        </button>

                        {expandedStep === idx && (
                          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-3">
                            {step.step_number !== undefined && (
                              <div>
                                <h5 className="text-xs font-semibold text-slate-600 mb-1">
                                  Step Number:
                                </h5>
                                <p className="text-sm text-slate-700 font-mono bg-white p-2 rounded border border-slate-200">
                                  {step.step_number}
                                </p>
                              </div>
                            )}

                            {step.action && (
                              <div>
                                <h5 className="text-xs font-semibold text-slate-600 mb-1">
                                  Action:
                                </h5>
                                <p className="text-sm text-slate-700 font-mono bg-white p-2 rounded border border-slate-200">
                                  {step.action}
                                </p>
                              </div>
                            )}

                            {step.action_input && (
                              <div>
                                <h5 className="text-xs font-semibold text-slate-600 mb-1">
                                  Action Input:
                                </h5>
                                <pre className="text-xs bg-white p-3 rounded border border-slate-200 overflow-x-auto whitespace-pre-wrap break-words">
                                  {JSON.stringify(step.action_input, null, 2)}
                                </pre>
                              </div>
                            )}

                            {step.thought && (
                              <div>
                                <h5 className="text-xs font-semibold text-slate-600 mb-1">
                                  Thought:
                                </h5>
                                <p className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-200 whitespace-pre-wrap break-words">
                                  {step.thought}
                                </p>
                              </div>
                            )}

                            {step.observation && (
                              <div>
                                <h5 className="text-xs font-semibold text-slate-600 mb-1">
                                  Observation:
                                </h5>
                                <p className="text-sm text-slate-700 bg-white p-2 rounded border border-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                                  {step.observation}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">
                  Metadata & Timing:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                  {selectedData.metadata?.query_timestamp && (
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-slate-600 block text-xs font-semibold mb-1">
                        Query Timestamp:
                      </span>
                      <p className="text-slate-700 text-xs font-mono break-all">
                        {selectedData.metadata.query_timestamp}
                      </p>
                    </div>
                  )}

                  {selectedData.metadata?.completion_timestamp && (
                    <div className="bg-white p-3 rounded border border-slate-200">
                      <span className="text-slate-600 block text-xs font-semibold mb-1">
                        Completion Timestamp:
                      </span>
                      <p className="text-slate-700 text-xs font-mono break-all">
                        {selectedData.metadata.completion_timestamp}
                      </p>
                    </div>
                  )}

                  {selectedData.metadata?.total_time !== undefined && (
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <span className="text-slate-600 block text-xs font-semibold mb-1">
                        Total Time:
                      </span>
                      <p className="text-blue-700 text-lg font-bold">
                        {selectedData.metadata.total_time.toFixed(2)}s
                      </p>
                    </div>
                  )}

                  {selectedData.metadata?.agent_type && (
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <span className="text-slate-600 block text-xs font-semibold mb-1">
                        Agent Type:
                      </span>
                      <p className="text-purple-700 font-bold capitalize">
                        {selectedData.metadata.agent_type}
                      </p>
                    </div>
                  )}

                  {selectedData.metadata?.compilation_time !== undefined && (
                    <div className="bg-amber-50 p-3 rounded border border-amber-200">
                      <span className="text-slate-600 block text-xs font-semibold mb-1">
                        Compilation Time:
                      </span>
                      <p className="text-amber-700 font-bold">
                        {selectedData.metadata.compilation_time.toFixed(2)}ms
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {selectedData.evaluation && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Evaluation Metrics Detail:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                    {selectedData.evaluation.summary && (
                      <div className="bg-blue-100 p-3 rounded border border-blue-300 col-span-1 md:col-span-2 lg:col-span-3">
                        <span className="text-slate-800 font-bold flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-blue-600" />
                          <span>Overall Score:</span>
                          <span
                            className={`text-xl ml-2 font-extrabold ${
                              selectedData.evaluation.summary
                                .confidence_level === "high"
                                ? "text-green-700"
                                : "text-amber-700"
                            }`}
                          >
                            {selectedData.evaluation.summary.overall_score?.toFixed(
                              1
                            ) || "N/A"}
                            %
                          </span>
                        </span>
                        <p className="text-xs text-slate-600 mt-1">
                          Assessment:
                          {selectedData.evaluation.summary.overall_assessment}
                          (Confidence:
                          {selectedData.evaluation.summary.confidence_level})
                        </p>
                      </div>
                    )}

                    {selectedData.evaluation.completion_time && (
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center space-x-1">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span>Completion Time (Avg):</span>
                        </span>
                        <span className="font-bold text-blue-600 ml-2">
                          {selectedData.evaluation.completion_time.average_time_ms?.toFixed(
                            0
                          ) || "N/A"}
                          ms
                        </span>
                      </div>
                    )}

                    {selectedData.evaluation.planning_quality && (
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center space-x-1">
                          <GitBranch className="w-4 h-4 text-amber-600" />
                          <span>Planning Quality (Efficiency):</span>
                        </span>
                        <span className="font-bold text-amber-700 ml-2">
                          {selectedData.evaluation.planning_quality.average_tool_efficiency?.toFixed(
                            1
                          ) || "N/A"}
                          %
                        </span>
                      </div>
                    )}

                    {selectedData.evaluation.response_relevance && (
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center space-x-1">
                          <Target className="w-4 h-4 text-green-600" />
                          <span>Response Relevance (Avg):</span>
                        </span>
                        <span className="font-bold text-green-700 ml-2">
                          {selectedData.evaluation.response_relevance.average_relevance?.toFixed(
                            1
                          ) || "N/A"}
                          %
                        </span>
                      </div>
                    )}

                    {selectedData.evaluation.knowledge_utilization && (
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center space-x-1">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                          <span>Knowledge Utilization (Avg):</span>
                        </span>
                        <span className="font-bold text-purple-700 ml-2">
                          {selectedData.evaluation.knowledge_utilization.average_utilization?.toFixed(
                            1
                          ) || "N/A"}
                          %
                        </span>
                      </div>
                    )}

                    {selectedData.evaluation.clarification_effectiveness && (
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4 text-cyan-600" />
                          <span>Clarification Rate:</span>
                        </span>
                        <span className="font-bold text-cyan-700 ml-2">
                          {selectedData.evaluation.clarification_effectiveness.clarification_rate?.toFixed(
                            1
                          ) || "N/A"}
                          %
                        </span>
                      </div>
                    )}

                    {selectedData.evaluation.collaboration_quality && (
                      <div className="bg-white p-3 rounded border border-slate-200">
                        <span className="text-slate-600 flex items-center space-x-1">
                          <Users className="w-4 h-4 text-pink-600" />
                          <span>Collaboration Quality (Avg):</span>
                        </span>
                        <span className="font-bold text-pink-700 ml-2">
                          {selectedData.evaluation.collaboration_quality.average_efficiency?.toFixed(
                            1
                          ) || "N/A"}
                          %
                        </span>
                      </div>
                    )}

                    {selectedData.evaluation.safety_check && (
                      <div
                        className={`p-3 rounded border ${
                          selectedData.evaluation.safety_check.is_safe
                            ? "bg-green-50 border-green-300"
                            : "bg-red-50 border-red-300"
                        }`}
                      >
                        <span className="text-slate-600 flex items-center space-x-1">
                          <Shield
                            className={`w-4 h-4 ${
                              selectedData.evaluation.safety_check.is_safe
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          />
                          <span>Safety Check:</span>
                        </span>
                        <span
                          className={`font-bold ml-2 ${
                            selectedData.evaluation.safety_check.is_safe
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >
                          {selectedData.evaluation.safety_check.is_safe
                            ? "Safe"
                            : "Unsafe"}
                        </span>
                      </div>
                    )}
                  </div>

                  {selectedData.evaluation.summary && (
                    <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                      <h5 className="text-sm font-semibold text-slate-700">
                        Detailed Assessment:
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <h6 className="text-xs font-bold text-green-700 mb-1">
                            Strengths:
                          </h6>
                          <p className="text-xs text-slate-700 whitespace-pre-line">
                            {selectedData.evaluation.summary.strengths?.join(
                              "\n"
                            ) || "N/A"}
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200">
                          <h6 className="text-xs font-bold text-amber-700 mb-1">
                            Areas for Improvement:
                          </h6>
                          <p className="text-xs text-slate-700 whitespace-pre-line">
                            {selectedData.evaluation.summary.areas_for_improvement?.join(
                              "\n"
                            ) || "N/A"}
                          </p>
                        </div>
                      </div>
                      {selectedData.evaluation.summary.recommendations &&
                        selectedData.evaluation.summary.recommendations.length >
                          0 && (
                          <div className="bg-white p-3 rounded-lg border border-slate-200">
                            <h6 className="text-xs font-bold text-blue-700 mb-1">
                              Recommendations:
                            </h6>
                            <p className="text-xs text-slate-700 whitespace-pre-line">
                              {selectedData.evaluation.summary.recommendations.join(
                                "\n"
                              ) || "N/A"}
                            </p>
                          </div>
                        )}
                    </div>
                  )}
                </div>
              )}
              {selectedData.explainability && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-5 rounded-lg border-2 border-indigo-200">
                  <h4 className="font-semibold text-indigo-900 mb-4 flex items-center gap-2">
                    <GitBranch className="w-5 h-5" />
                    Complete Explainability Results
                  </h4>
                  {(selectedData.explainability.chain_of_thought?.summary ||
                    selectedData.explainability.summary) && (
                    <div className="mb-4 bg-white p-4 rounded border border-purple-200">
                      <h5 className="font-semibold text-purple-700 mb-2 text-sm">
                        Chain of Thought Summary
                      </h5>
                      <div className="space-y-2 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="text-slate-600">Total Steps:</span>
                            <span className="font-bold text-purple-700 ml-2">
                              {selectedData.explainability.chain_of_thought
                                ?.summary?.total_steps ||
                                selectedData.explainability.summary
                                  ?.reasoning_steps ||
                                0}
                            </span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="text-slate-600">
                              Quality Score:
                            </span>
                            <span className="font-bold text-purple-700 ml-2">
                              {(
                                selectedData.explainability.chain_of_thought
                                  ?.summary?.quality_score ||
                                selectedData.explainability.summary
                                  ?.research_quality ||
                                0
                              ).toFixed(3)}
                            </span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="text-slate-600">
                              Reasoning Time:
                            </span>
                            <span className="font-bold text-purple-700 ml-2">
                              {(
                                selectedData.explainability.chain_of_thought
                                  ?.summary?.reasoning_time ||
                                selectedData.explainability.summary
                                  ?.total_reasoning_time ||
                                0
                              ).toFixed(2)}
                              s
                            </span>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <span className="text-slate-600">Trace ID:</span>
                            <span className="font-mono text-xs text-purple-700 ml-2 truncate block max-w-[120px]">
                              {selectedData.explainability.chain_of_thought
                                ?.summary?.trace_id ||
                                selectedData.metadata?.cot_trace_id ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedData.explainability.chain_of_thought
                    ?.visualization && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-purple-700 text-sm">
                          Chain of Thought Trace (Full)
                        </h5>
                        <button
                          onClick={() =>
                            openFullText(
                              "Chain of Thought Visualization",
                              selectedData.explainability.chain_of_thought
                                .visualization
                            )
                          }
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Maximize2 className="w-3 h-3" />
                          Expand Full Trace
                        </button>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap overflow-x-auto bg-white p-3 rounded border border-purple-200 max-h-96 overflow-y-auto font-mono">
                        {
                          selectedData.explainability.chain_of_thought
                            .visualization
                        }
                      </pre>
                    </div>
                  )}
                  {selectedData.explainability.tool_attribution && (
                    <div className="mb-4 bg-white p-4 rounded border border-blue-200">
                      <h5 className="font-semibold text-blue-700 mb-2 text-sm">
                        Tool Attribution Summary
                      </h5>

                      {selectedData.explainability.tool_attribution
                        .tool_usage_summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-slate-600">
                              Tools Invoked:
                            </span>
                            <span className="font-bold text-blue-700 ml-2">
                              {selectedData.explainability.tool_attribution
                                .tool_usage_summary.total_tools_invoked || 0}
                            </span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-slate-600">
                              Unique Tools:
                            </span>
                            <span className="font-bold text-blue-700 ml-2">
                              {selectedData.explainability.tool_attribution
                                .tool_usage_summary.unique_tools_used || 0}
                            </span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-slate-600">Most Used:</span>
                            <span className="font-bold text-blue-700 ml-2 truncate block max-w-[100px]">
                              {selectedData.explainability.tool_attribution
                                .tool_usage_summary.most_used_tool || "N/A"}
                            </span>
                          </div>
                          <div className="bg-blue-50 p-2 rounded">
                            <span className="text-slate-600">Total Time:</span>
                            <span className="font-bold text-blue-700 ml-2">
                              {(
                                selectedData.explainability.tool_attribution
                                  .tool_usage_summary.total_execution_time || 0
                              ).toFixed(2)}
                              s
                            </span>
                          </div>
                        </div>
                      )}

                      {selectedData.explainability.tool_attribution
                        .answer_composition && (
                        <div className="mb-3">
                          <h6 className="text-xs font-semibold text-slate-700 mb-2">
                            Answer Composition:
                          </h6>
                          <div className="space-y-1">
                            {Object.entries(
                              selectedData.explainability.tool_attribution
                                .answer_composition
                            ).map(([tool, percentage]: [string, any]) => (
                              <div
                                key={tool}
                                className="flex items-center gap-2"
                              >
                                <span className="text-xs text-slate-600 w-32 truncate">
                                  {tool}:
                                </span>
                                <div className="flex-1 bg-slate-200 rounded-full h-4">
                                  <div
                                    className="bg-blue-600 h-4 rounded-full flex items-center justify-end px-2"
                                    style={{
                                      width: `${Math.min(
                                        100,
                                        Math.max(0, Number(percentage) || 0)
                                      )}%`,
                                    }}
                                  >
                                    <span className="text-xs text-white font-bold">
                                      {Number(percentage || 0).toFixed(1)}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedData.explainability.tool_attribution
                    ?.visual_report && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-blue-700 text-sm">
                          Tool Attribution Report (Visual)
                        </h5>
                        <button
                          onClick={() =>
                            openFullText(
                              "Tool Attribution Visual Report",
                              selectedData.explainability.tool_attribution
                                .visual_report
                            )
                          }
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Maximize2 className="w-3 h-3" />
                          Expand
                        </button>
                      </div>
                      <pre className="text-xs whitespace-pre-wrap overflow-x-auto bg-white p-3 rounded border border-blue-200 max-h-64 overflow-y-auto font-mono">
                        {
                          selectedData.explainability.tool_attribution
                            .visual_report
                        }
                      </pre>
                    </div>
                  )}
                  {selectedData.explainability.tool_attribution?.full_report &&
                    typeof selectedData.explainability.tool_attribution
                      .full_report === "object" &&
                    selectedData.explainability.tool_attribution.full_report
                      .tools_used && (
                      <div className="mb-4 bg-white p-4 rounded border border-green-200">
                        <h5 className="font-semibold text-green-700 mb-3 text-sm">
                          Detailed Tool Usage
                        </h5>

                        <div className="space-y-2">
                          {selectedData.explainability.tool_attribution.full_report.tools_used.map(
                            (tool: any, idx: number) => (
                              <div
                                key={idx}
                                className="bg-green-50 p-3 rounded border border-green-200"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-semibold text-green-900">
                                    {idx + 1}.{tool.tool_name || "Unknown Tool"}
                                  </span>
                                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                    {tool.tool_type || "N/A"}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-slate-600">
                                      Execution Time:
                                    </span>
                                    <span className="font-bold text-green-700 ml-2">
                                      {(tool.execution_duration || 0).toFixed(
                                        2
                                      )}
                                      s
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">
                                      Contribution:
                                    </span>
                                    <span className="font-bold text-green-700 ml-2">
                                      {(
                                        (tool.contribution_score || 0) * 100
                                      ).toFixed(1)}
                                      %
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">
                                      Used in Final:
                                    </span>
                                    <span className="font-bold text-green-700 ml-2">
                                      {tool.output_used_in_final
                                        ? "✓ Yes"
                                        : "✗ No"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">
                                      Success:
                                    </span>
                                    <span className="font-bold text-green-700 ml-2">
                                      {tool.error_occurred
                                        ? "✗ Error"
                                        : "✓ Success"}
                                    </span>
                                  </div>
                                </div>
                                {tool.input_provided && (
                                  <div className="mt-2">
                                    <span className="text-xs text-slate-600">
                                      Input:
                                    </span>
                                    <pre className="text-xs bg-white p-2 rounded mt-1 border border-green-100 overflow-x-auto max-h-32 overflow-y-auto">
                                      {JSON.stringify(
                                        tool.input_provided,
                                        null,
                                        2
                                      )}
                                    </pre>
                                  </div>
                                )}
                                {tool.output_generated && (
                                  <div className="mt-2">
                                    <span className="text-xs text-slate-600">
                                      Output Preview:
                                    </span>
                                    <pre className="text-xs bg-white p-2 rounded mt-1 border border-green-100 overflow-x-auto max-h-32 overflow-y-auto">
                                      {typeof tool.output_generated === "string"
                                        ? tool.output_generated.substring(
                                            0,
                                            200
                                          ) +
                                          (tool.output_generated.length > 200
                                            ? "..."
                                            : "")
                                        : JSON.stringify(
                                            tool.output_generated,
                                            null,
                                            2
                                          ).substring(0, 200) + "..."}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  {selectedData.explainability.tool_attribution?.citations && (
                    <div className="bg-white p-4 rounded border border-amber-200 mb-4">
                      <h5 className="font-semibold text-amber-700 mb-2 text-sm">
                        Source Citations
                      </h5>
                      <pre className="text-xs whitespace-pre-wrap bg-amber-50 p-3 rounded border border-amber-100 font-mono max-h-64 overflow-y-auto">
                        {selectedData.explainability.tool_attribution.citations}
                      </pre>
                    </div>
                  )}
                  {/* <details className="mt-4">
                    <summary className="cursor-pointer text-xs text-slate-600 hover:text-slate-900 font-semibold">
                      🔍 View Raw Explainability Data (Debug)
                    </summary>
                    <pre className="text-xs bg-slate-900 text-green-400 p-3 rounded mt-2 overflow-x-auto max-h-96 overflow-y-auto font-mono">
                      {JSON.stringify(selectedData.explainability, null, 2)}
                    </pre>
                  </details> */}
                </div>
              )}

              <div className="bg-slate-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-slate-700">
                    Answer Preview (Full Text):
                  </h4>
                  <button
                    onClick={() =>
                      openFullText("Full Answer", selectedData.answer)
                    }
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Maximize2 className="w-3 h-3" />
                    Expand
                  </button>
                </div>
                <div className="text-sm text-slate-700 prose prose-slate max-w-none">
                  <ReactMarkdown components={{ a: LinkRenderer }}>
                    {selectedData.answer || ""}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {fullTextModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                {fullTextModal.title}
              </h3>
              <button
                onClick={closeFullText}
                className="text-slate-500 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="prose prose-slate max-w-none text-sm text-slate-700">
                <ReactMarkdown components={{ a: LinkRenderer }}>
                  {fullTextModal.content || ""}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationMetrics;
