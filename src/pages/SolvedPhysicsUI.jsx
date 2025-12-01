import React from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import {
  Shield,
  Calculator,
  Target,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  BookOpen,
  Settings,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

export default function SolvedPhysicsUI({ data }) {
  const steps = data.steps || [];
  const metadata = data.metadata || {};
  const parsedInfo = metadata.parsed_info || {};
  const computationDetails = metadata.computation_details || {};
  const confidence = metadata.confidence || {};

  const finalAnswer = data.final_answer || data.answer || "";

  const prepareAnswer = (text) => {
    if (!text) return "";

    let cleaned = text
      .replace(/\*\*\*\*/g, "**")
      .replace(/\*\*\*/g, "**")
      .trim();

    return cleaned;
  };

  const cleanedAnswer = prepareAnswer(finalAnswer);

  const renderConfidenceBadge = () => {
    const score = confidence.score || 0;
    const level = confidence.level || "UNKNOWN";

    const getColorClasses = () => {
      if (score >= 0.9)
        return {
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          fill: "text-emerald-100",
        };
      if (score >= 0.7)
        return {
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          fill: "text-blue-100",
        };
      if (score >= 0.5)
        return {
          bg: "bg-yellow-50",
          text: "text-yellow-700",
          border: "border-yellow-200",
          fill: "text-yellow-100",
        };
      return {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        fill: "text-red-100",
      };
    };

    const colors = getColorClasses();

    return (
      <div
        className={`flex items-center gap-2 ${colors.bg} ${colors.text} px-4 py-2 rounded-full ${colors.border} shadow-sm`}
      >
        <Shield className={`w-5 h-5 ${colors.fill}`} />
        <span className="font-semibold text-sm">
          {Math.round(score * 100)}% Confidence
        </span>
      </div>
    );
  };

  const renderParsedVariables = () => {
    if (!parsedInfo.known_values && !parsedInfo.expression) return null;

    const variables = [];

    if (parsedInfo.expression) {
      variables.push({
        label: "Expression",
        value: parsedInfo.expression,
        icon: Calculator,
      });
    }

    if (parsedInfo.known_values) {
      Object.entries(parsedInfo.known_values).forEach(([key, val]) => {
        variables.push({
          label: key.toUpperCase(),
          value: String(val),
          icon: Zap,
        });
      });
    }

    if (parsedInfo.find) {
      variables.push({
        label: "Find",
        value: parsedInfo.find,
        icon: Target,
      });
    }

    if (variables.length === 0) return null;

    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {variables.map((v, idx) => {
          const Icon = v.icon || Calculator;

          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {v.label === "EXPRESSION"
                    ? "Expression"
                    : v.label === "U"
                    ? "Initial Velocity"
                    : v.label === "A"
                    ? "Acceleration"
                    : v.label === "T"
                    ? "Time"
                    : v.label === "S"
                    ? "Displacement"
                    : v.label === "FORCE"
                    ? "Force"
                    : v.label === "MASS"
                    ? "Mass"
                    : v.label}
                </span>
                <Icon className="w-4 h-4 text-orange-400" />
              </div>
              <div className="text-lg font-mono font-bold text-slate-700 break-words">
                {v.value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const renderProcessingTimeline = () => {
    if (steps.length === 0) return null;

    const getStepColorClasses = (action) => {
      const colorMap = {
        parse_problem: {
          bg: "bg-indigo-50",
          border: "border-indigo-100",
          text: "text-indigo-600",
          tagBg: "bg-indigo-50",
          tagText: "text-indigo-500",
        },
        identify_operation: {
          bg: "bg-blue-50",
          border: "border-blue-100",
          text: "text-blue-600",
          tagBg: "bg-blue-50",
          tagText: "text-blue-500",
        },
        extract_values: {
          bg: "bg-orange-50",
          border: "border-orange-100",
          text: "text-orange-600",
          tagBg: "bg-orange-50",
          tagText: "text-orange-500",
        },
        unit_conversion: {
          bg: "bg-yellow-50",
          border: "border-yellow-100",
          text: "text-yellow-600",
          tagBg: "bg-yellow-50",
          tagText: "text-yellow-500",
        },
        physics_calculation: {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          text: "text-emerald-600",
          tagBg: "bg-emerald-50",
          tagText: "text-emerald-500",
        },
        sympy_calculation: {
          bg: "bg-green-50",
          border: "border-green-100",
          text: "text-green-600",
          tagBg: "bg-green-50",
          tagText: "text-green-500",
        },
        default: {
          bg: "bg-slate-50",
          border: "border-slate-100",
          text: "text-slate-600",
          tagBg: "bg-slate-50",
          tagText: "text-slate-500",
        },
      };
      return colorMap[action] || colorMap.default;
    };

    return (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-400" />
            Processing Log
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded border border-slate-200">
            {steps.length} Steps
          </span>
        </div>

        <div className="relative space-y-0">
          {steps.map((step, idx) => {
            const colors = getStepColorClasses(step.action);
            const isLast = idx === steps.length - 1;

            return (
              <div key={idx} className="relative pl-8 pb-8 last:pb-0">
                {!isLast && (
                  <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-slate-200 z-0" />
                )}

                <div
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full ${colors.bg} ${colors.border} flex items-center justify-center z-10 text-xs font-bold ${colors.text}`}
                >
                  {step.step_num || idx + 1}
                </div>

                <div>
                  <span
                    className={`text-[10px] font-mono ${colors.tagText} ${colors.tagBg} px-1 rounded uppercase mb-1 inline-block`}
                  >
                    {step.action}
                  </span>
                  <p className="text-sm text-slate-600 italic mb-1">
                    "{step.thought}"
                  </p>
                  <div className="bg-slate-50 p-2 rounded border border-slate-100 text-xs font-mono text-slate-500 break-words">
                    {step.observation}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 bg-slate-50 p-6 rounded-xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
            <span className="text-indigo-600 font-medium capitalize">
              {data.subject || "Mathematics"}
            </span>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-600 font-medium capitalize">
              {data.problem_type || parsedInfo.type || "Problem"}
            </span>
            {parsedInfo.subtype && (
              <>
                <span className="text-slate-300">/</span>
                <span className="capitalize">{parsedInfo.subtype}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {data.question || parsedInfo.raw_problem || "Solution"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right mr-2 hidden md:block">
            <div className="text-xs text-slate-400 font-mono">
              {metadata.timestamp
                ? new Date(metadata.timestamp).toLocaleString()
                : ""}
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Time: {metadata.processing_time_seconds?.toFixed(2) || 0}s
            </div>
          </div>
          {confidence.score && renderConfidenceBadge()}
        </div>
      </div>

      {renderParsedVariables()}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="font-semibold text-slate-800 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Solution
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="prose prose-slate max-w-none prose-p:text-slate-700 prose-strong:text-slate-900 prose-strong:font-bold">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-2xl font-bold text-slate-900 mt-6 mb-4"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-xl font-bold text-slate-900 mt-5 mb-3"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-lg font-bold text-slate-900 mt-4 mb-2"
                        {...props}
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-base font-bold text-slate-900 mt-3 mb-2"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p
                        className="text-slate-700 mb-3 leading-relaxed"
                        {...props}
                      />
                    ),
                    strong: ({ node, ...props }) => (
                      <strong className="font-bold text-slate-900" {...props} />
                    ),
                    em: ({ node, ...props }) => (
                      <em className="italic text-slate-700" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc pl-6 mb-4 text-slate-700 space-y-2"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal pl-6 mb-4 text-slate-700 space-y-2"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-relaxed" {...props} />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="my-6 border-slate-200" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-indigo-500 pl-4 my-4 italic text-slate-600 bg-slate-50 py-2 rounded-r"
                        {...props}
                      />
                    ),
                    code: ({ node, inline, className, children, ...props }) => {
                      return !inline ? (
                        <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg mb-4 overflow-x-auto">
                          <code className="font-mono text-sm" {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code
                          className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-sm font-medium"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    pre: ({ node, ...props }) => (
                      <div className="my-4" {...props} />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-indigo-600 hover:text-indigo-700 underline font-medium"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table
                          className="min-w-full divide-y divide-slate-200 border border-slate-200 rounded-lg"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-slate-50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase tracking-wider"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="px-4 py-3 text-slate-700 text-sm"
                        {...props}
                      />
                    ),
                    tr: ({ node, ...props }) => (
                      <tr
                        className="border-b border-slate-200 last:border-0"
                        {...props}
                      />
                    ),
                  }}
                >
                  {cleanedAnswer}
                </ReactMarkdown>
              </div>

              {computationDetails.steps &&
                computationDetails.steps.length > 0 && (
                  <div className="mt-6 space-y-3 pt-6 border-t border-slate-200">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-indigo-500" />
                      Step-by-Step Computation
                    </h3>
                    {computationDetails.steps.map((step, idx) => (
                      <div
                        key={idx}
                        className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-sm">
                            {idx + 1}
                          </div>
                          <p className="text-slate-800 font-medium flex-1 leading-relaxed">
                            {step}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              {(computationDetails.simplified ||
                computationDetails.derivative) && (
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-6 rounded-xl shadow-lg text-white mt-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="w-5 h-5" />
                    <h3 className="font-semibold text-lg">Final Result</h3>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="text-3xl font-mono font-bold text-center">
                      {computationDetails.simplified ||
                        computationDetails.derivative}
                    </div>
                  </div>
                </div>
              )}

              {parsedInfo.operation && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Key Principles Applied
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-200 font-medium">
                      {parsedInfo.operation}
                    </span>
                    {metadata.parsing_method && (
                      <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200 font-medium">
                        {metadata.parsing_method}
                      </span>
                    )}
                    {computationDetails.method && (
                      <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200 font-medium">
                        {computationDetails.method}
                      </span>
                    )}
                    {parsedInfo.subtype && (
                      <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm border border-emerald-200 font-medium">
                        {parsedInfo.subtype}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="xl:col-span-1 space-y-6">
          {renderProcessingTimeline()}

          <div className="bg-slate-900 rounded-xl p-5 text-slate-300 shadow-lg text-xs font-mono space-y-2">
            <h4 className="text-white font-bold mb-3 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Debug Info
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Subject:</span>
                <span className="text-indigo-300 font-semibold">
                  {data.subject}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Type:</span>
                <span className="text-blue-300 font-semibold">
                  {data.problem_type || parsedInfo.type}
                </span>
              </div>
              {parsedInfo.subtype && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Subtype:</span>
                  <span className="text-purple-300 font-semibold">
                    {parsedInfo.subtype}
                  </span>
                </div>
              )}
              {metadata.parsing_method && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Parse Method:</span>
                  <span className="text-green-300 font-semibold">
                    {metadata.parsing_method}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-yellow-300 font-semibold">
                  {metadata.processing_time_seconds?.toFixed(2)}s
                </span>
              </div>
              <div className="border-t border-slate-700 pt-2 mt-2">
                <div className="text-slate-400 mb-1">Parse Success:</div>
                <div
                  className={
                    parsedInfo.parse_success
                      ? "text-emerald-400 font-semibold"
                      : "text-red-400 font-semibold"
                  }
                >
                  {String(parsedInfo.parse_success)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
