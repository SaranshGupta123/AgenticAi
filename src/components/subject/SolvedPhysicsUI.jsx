import React from "react";
import {
  Shield,
  Clock,
  Zap,
  BookOpen,
  Settings,
  TrendingUp,
  CheckCircle,
  GitBranch,
  Brain,
  MessageSquare,
} from "lucide-react";

// Using a basic react-markdown without external math plugins to prevent dependency errors
import ReactMarkdown from "react-markdown";

// === ADDING REQUIRED MATH/MARKDOWN PLUGINS ===
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm"; // For better table, task list, etc. support

// You must ensure that the KaTeX CSS library is loaded globally
// for the math rendering to look correct. (Assumed to be loaded in environment)
// ===========================================

export default function SolvedPhysicsUI({ data }) {
  const steps = data.steps || [];
  const metadata = data.metadata || {};
  const parsedInfo = metadata.parsed_info || {};
  const computationDetails = metadata.computation_details || {};
  const confidence = data.confidence || metadata.confidence || {}; // Check both data and metadata for confidence

  // Get final answer
  const finalAnswer = data.final_answer || data.answer || "";

  // Helper component to render the answer with basic markdown/styling and math support
  const AnswerRenderer = ({ content }) => {
    if (!content)
      return <p className="text-slate-500 italic">No content provided.</p>;

    return (
      // FIX APPLIED: className moved from ReactMarkdown to a wrapper div
      // Added max-w-none to ensure it uses full container width
      <div className="prose max-w-none text-slate-700 space-y-4">
        <ReactMarkdown
          // === PLUGINS FOR MATH AND GFM ===
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          // ===============================
          components={{
            // Customizing components for better styling and readability
            p: ({ children }) => <p className="mb-4">{children}</p>,
            h3: ({ children }) => (
              <h3 className="text-xl font-bold mt-6 mb-3 text-slate-800 border-b border-slate-200 pb-1">
                {children}
              </h3>
            ),
            strong: ({ children }) => (
              <strong className="font-extrabold text-slate-900">
                {children}
              </strong>
            ),
            li: ({ children }) => (
              <li className="mb-1 text-slate-700">{children}</li>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside ml-4 mb-4 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside ml-4 mb-4 space-y-1">
                {children}
              </ol>
            ),
            hr: () => <hr className="my-6 border-slate-300" />,
            // Render code blocks nicely if they exist
            code: ({ inline, className, children, ...props }) => {
              const isMath = className && className.includes("language-katex");
              if (isMath) {
                // KaTeX handles math from the rehypeKatex plugin, so we can ignore this.
                return (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              }
              if (inline) {
                return (
                  <code
                    className="bg-slate-100 px-1 py-0.5 rounded text-red-600 text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                );
              }
              return (
                <pre className="p-3 bg-gray-800 text-white rounded-lg overflow-x-auto text-sm">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            },
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  };

  // Helper to format timestamps
  const formatTimestamp = (isoString) => {
    try {
      if (!isoString) return "N/A";
      return new Date(isoString).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch (e) {
      return isoString;
    }
  };

  // Helper to set color based on confidence level
  const getConfidenceStyle = (level) => {
    const defaultStyle = "text-slate-500 bg-slate-100 border-slate-300";
    if (!level) return defaultStyle;

    switch (level.toUpperCase()) {
      case "HIGH":
        return "text-emerald-700 bg-emerald-100 border-emerald-400"; // Darker text for visibility
      case "MEDIUM":
        return "text-amber-700 bg-amber-100 border-amber-400";
      case "LOW":
        return "text-red-700 bg-red-100 border-red-400";
      default:
        return defaultStyle;
    }
  };

  // Helper to get success styling
  const getParseSuccessStyle = (success) => {
    return success
      ? "text-emerald-700 bg-emerald-200"
      : "text-red-700 bg-red-200";
  };

  // Clean and prepare the answer text for markdown
  const prepareAnswer = (text) => {
    if (!text) return "";
    // Clean up excessive markdown formatting that LLMs sometimes generate
    let cleaned = text
      .replace(/(\*\*+)/g, (match, p1) => (p1.length > 2 ? "**" : p1))
      .trim();
    return cleaned;
  };

  const cleanedAnswer = prepareAnswer(finalAnswer);
  const confidenceScore =
    confidence.score !== undefined && confidence.score !== null
      ? (confidence.score * 100)?.toFixed(1)
      : "N/A";

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen font-inter">
      <div className="max-w-7xl mx-auto rounded-xl bg-white shadow-xl overflow-hidden">
        {/* Header - Query and Subject */}
        <div className="p-6 bg-blue-600 text-white rounded-t-xl">
          <h1 className="text-xl sm:text-2xl font-semibold mb-1 flex items-center">
            <Settings className="w-5 h-5 mr-3" />
            Query:{" "}
            <span className="ml-2 font-mono font-normal text-blue-100">
              {data.query}
            </span>
          </h1>
          <p className="text-sm opacity-90">
            Subject:{" "}
            <span className="font-medium capitalize">{data.subject}</span>
            {data.problem_type && ` | Type: ${data.problem_type}`}
            {data.subtype && ` | Subtype: ${data.subtype}`}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Main Content Area (Answer and Steps) */}
          <div className="lg:w-2/3 space-y-8">
            {/* 1. Final Answer Card */}
            <div className="bg-white p-6 border border-blue-200 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Final Answer
              </h2>
              <AnswerRenderer content={cleanedAnswer} />
            </div>

            {/* 2. Reasoning Steps Timeline */}
            {steps.length > 0 && (
              <div className="bg-white p-6 border border-purple-200 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold text-purple-600 mb-6 flex items-center">
                  <GitBranch className="w-5 h-5 mr-2" />
                  Agent Reasoning Steps
                </h2>
                <div className="relative border-l-4 border-purple-200 pl-6 space-y-8">
                  {steps.map((step, index) => (
                    <div key={index} className="relative">
                      {/* Timeline Dot */}
                      <div className="absolute -left-8 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 text-white shadow-md font-bold text-sm">
                        {step.step_num}
                      </div>

                      <div className="p-4 bg-purple-50 rounded-lg shadow-sm border border-purple-300">
                        <p className="text-sm font-semibold text-purple-700 mb-1">
                          Action:{" "}
                          <span className="font-mono text-purple-900">
                            {step.action}
                          </span>
                        </p>
                        <p className="text-sm font-medium text-slate-700 mb-2 flex items-start">
                          <Brain className="w-4 h-4 mr-2 mt-1 flex-shrink-0 text-slate-500" />
                          Thought:{" "}
                          <span className="ml-1 italic">{step.thought}</span>
                        </p>
                        <div className="p-3 bg-white rounded border border-slate-200 text-slate-600 text-sm">
                          <p className="font-semibold text-slate-800 mb-1 flex items-center">
                            <MessageSquare className="w-4 h-4 mr-2 text-slate-500" />
                            Observation:
                          </p>
                          {/* Render Observation using AnswerRenderer for proper markdown/math formatting */}
                          <div className="mt-2">
                            <AnswerRenderer content={step.observation} />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Area (Metadata and Confidence) */}
          <div className="lg:w-1/3 space-y-6">
            {/* 3. Confidence Section */}
            <div
              className={`p-5 rounded-xl border-4 ${getConfidenceStyle(
                confidence.level
              )} shadow-lg`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Confidence
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold capitalize ${getConfidenceStyle(
                    confidence.level
                  )}`}
                >
                  {confidence.level || "UNKNOWN"}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="font-medium text-slate-600">Score:</span>
                  <span className="font-semibold flex items-center text-lg text-slate-800">
                    <TrendingUp className="w-4 h-4 mr-1 text-blue-500" />
                    {confidenceScore}%
                  </span>
                </div>
                <div className="pt-2">
                  <span className="font-medium text-slate-600 block mb-1">
                    Interpretation:
                  </span>
                  <p className="italic text-slate-700 text-xs">
                    {confidence.interpretation || "No interpretation provided."}
                  </p>
                </div>
                {confidence.factors && confidence.factors.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-medium text-slate-600 block mb-1">
                      Contributing Factors:
                    </span>
                    <ul className="list-disc list-inside ml-4 text-xs text-slate-600 space-y-0.5">
                      {confidence.factors.map((factor, i) => (
                        <li key={i}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Metadata & Computation Details */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-lg">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center border-b border-slate-200 pb-2">
                <Settings className="w-5 h-5 mr-2 text-slate-500" />
                Computation Details
              </h3>

              <div className="space-y-3 text-sm">
                {/* Processing Time and Timestamp */}
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Processing Time:
                  </span>
                  <span className="font-semibold text-blue-700">
                    {metadata.processing_time_seconds?.toFixed(3) || "N/A"}s
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Timestamp:
                  </span>
                  <span className="text-slate-500">
                    {formatTimestamp(metadata.timestamp)}
                  </span>
                </div>

                {/* Parsing Info */}
                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-700 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Parsing Info
                  </h4>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Method:</span>
                    <span className="font-semibold text-slate-800">
                      {parsedInfo.parsing_method || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Parse Success:</span>
                    <span
                      className={`px-2 rounded-full font-semibold text-xs capitalize ${getParseSuccessStyle(
                        parsedInfo.parse_success
                      )}`}
                    >
                      {String(parsedInfo.parse_success) === "true"
                        ? "Success"
                        : "Failure"}
                    </span>
                  </div>
                </div>

                {/* Knowledge Sources */}
                {computationDetails.knowledge_sources &&
                  computationDetails.knowledge_sources.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-2">
                      <h4 className="font-bold text-slate-700 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2" />
                        Knowledge Sources Used (
                        {computationDetails.num_sources || 0})
                      </h4>
                      <ul className="list-disc list-inside ml-4 text-xs text-slate-600 space-y-0.5">
                        {computationDetails.knowledge_sources.map(
                          (source, i) => (
                            <li key={i}>{source}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
