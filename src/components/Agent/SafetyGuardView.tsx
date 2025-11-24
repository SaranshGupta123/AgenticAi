import React, { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

const LS_METRICS = "agentic_metrics_data";

export const SafetyGuardView = ({
  selectedQuestion,
}: {
  selectedQuestion: number | null;
}) => {
  const [metricsData, setMetricsData] = useState<any[]>([]);
  const [internalSelected, setInternalSelected] = useState<number | null>(null);

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

  const handleQuestionClick = (questionNumber: number) => {
    setInternalSelected(
      internalSelected === questionNumber ? null : questionNumber
    );
  };

  const currentQuestion = internalSelected || selectedQuestion;
  const selectedEntry = metricsData.find(
    (m: any) => m.questionNumber === currentQuestion
  );

  const getSafetyColor = (sc: any) => {
    if (!sc)
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        border: "border-slate-300",
      };

    const threatLevel = sc.threat_level?.toLowerCase();
    if (threatLevel === "high" || threatLevel === "critical") {
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-300",
      };
    } else if (threatLevel === "medium" || threatLevel === "moderate") {
      return {
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-300",
      };
    } else if (threatLevel === "low") {
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        border: "border-yellow-300",
      };
    }
    return {
      bg: "bg-green-100",
      text: "text-green-700",
      border: "border-green-300",
    };
  };

  const safetyCheck = selectedEntry?.safety_check;
  const blocked =
    safetyCheck?.threat_level === "high" ||
    safetyCheck?.threat_level === "critical";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-600" />
          <span>Safety Guard Analysis</span>
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
            <h5 className="font-semibold mb-1">Safety Guard Panel</h5>
            • Shows safety evaluation for each question <br />
            • Displays threat level, violation type, and explanation <br />•
            Click any question above to view detailed analysis
          </div>
        </div>
      </div>

      <div
        className={`flex-1 p-6 space-y-6 ${
          currentQuestion && selectedEntry
            ? "overflow-y-auto"
            : "overflow-y-hidden"
        }`}
      >
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Safety Status (Questions)</span>
          </h3>

          {metricsData.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No questions asked yet. Start asking questions to see safety
              analysis.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {metricsData.map((data) => {
                const colors = getSafetyColor(data.safety_check);
                const isSelected = currentQuestion === data.questionNumber;
                const hasSafetyData =
                  data.safety_check &&
                  Object.keys(data.safety_check).length > 0;

                return (
                  <button
                    key={data.questionNumber}
                    onClick={() => handleQuestionClick(data.questionNumber)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-600 text-white shadow-lg ring-2 ring-blue-400"
                        : !hasSafetyData
                        ? "bg-slate-100 text-slate-500 border border-slate-300"
                        : `${colors.bg} ${colors.text} hover:opacity-80 border ${colors.border}`
                    }`}
                    title={`${data.question.substring(0, 50)}... - ${
                      data.safety_check?.threat_level || "No data"
                    }`}
                  >
                    Question {data.questionNumber}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3 text-xs text-slate-500 text-center">
            Click on any button to view detailed safety analysis below
          </div>
        </div>

        {currentQuestion && selectedEntry && safetyCheck ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                <p className="text-2xl font-bold text-green-700">
                  {(1 - safetyCheck.confidence_score).toFixed(2)}
                </p>
                <p className="text-xs text-slate-600 mt-1 uppercase tracking-wide">
                  Safety Index
                </p>
              </div>

              <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                <p className="text-2xl font-bold text-red-700">
                  {(safetyCheck.confidence_score * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-slate-600 mt-1 uppercase tracking-wide">
                  Threat Confidence
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
                <p className="text-2xl font-bold text-amber-700 capitalize">
                  {safetyCheck.violation_type || "None"}
                </p>
                <p className="text-xs text-slate-600 mt-1 uppercase tracking-wide">
                  Violation Type
                </p>
              </div>
            </div>

            <div
              className={`rounded-lg border-2 p-5 ${
                blocked
                  ? "border-red-200 bg-red-50"
                  : "border-green-200 bg-green-50"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {blocked ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <span
                    className={`font-semibold uppercase ${
                      blocked ? "text-red-700" : "text-green-700"
                    }`}
                  >
                    {safetyCheck.threat_level?.toUpperCase()}
                  </span>
                </div>

                <span className="px-2 py-1 bg-white rounded text-xs font-medium shadow-sm border border-slate-200">
                  Confidence: {(safetyCheck.confidence_score * 100).toFixed(0)}%
                </span>
              </div>

              <p className="text-sm text-slate-700 italic mb-2">
                "{selectedEntry.question}"
              </p>

              <div className="text-xs text-slate-600 bg-white/60 rounded p-2 border border-slate-200/50">
                <p>
                  <strong>Explanation:</strong> {safetyCheck.explanation}
                </p>

                {safetyCheck.details?.pattern_check && (
                  <p className="mt-1">
                    <strong>Pattern Detected:</strong>
                    {safetyCheck.details.pattern_check.detection_method} (
                    {safetyCheck.details.pattern_check
                      .injection_patterns_count || 0}
                    injections)
                  </p>
                )}

                {safetyCheck.details?.llm_check && (
                  <p className="mt-1">
                    <strong>Detection Method:</strong>
                    {safetyCheck.details.llm_check.detection_method}
                  </p>
                )}
              </div>

              {safetyCheck.recommendations &&
                safetyCheck.recommendations.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">
                      Recommendations:
                    </h4>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                      {safetyCheck.recommendations.map(
                        (r: string, i: number) => (
                          <li key={i}>{r}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </div>

            {selectedEntry.timestamp && (
              <div className="flex items-center justify-end text-xs text-slate-500 mt-4">
                <Clock className="w-3 h-3 mr-1" />
                {new Date(selectedEntry.timestamp).toLocaleString()}
              </div>
            )}
          </>
        ) : !currentQuestion ? (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            Select a question above to view safety analysis.
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            No safety data available for this question.
          </div>
        )}
      </div>
    </div>
  );
};

export default SafetyGuardView;
