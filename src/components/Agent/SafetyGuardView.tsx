import React, { useEffect, useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export const SafetyGuardView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/safety_guard_response.json");
        if (!response.ok) throw new Error("Failed to fetch safety data");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error("Error fetching safety data:", err);
        setError("Unable to load Safety Guard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm">
        Loading Safety Guard analysis...
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        {error}
      </div>
    );

  const {
    query,
    threat_level,
    violation_type,
    confidence_score,
    explanation,
    timestamp,
    recommendations,
    details,
  } = data || {};

  const blocked = threat_level === "high" || threat_level === "critical";

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <Shield className="w-5 h-5 text-red-600" />
          <span>Safety Guard Analysis</span>
        </h2>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            blocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {blocked ? "Blocked" : "Safe"}
        </span>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <p className="text-2xl font-bold text-green-700">
              {(1 - confidence_score).toFixed(2)}
            </p>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wide">
              Safety Index
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
            <p className="text-2xl font-bold text-red-700">
              {(confidence_score * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-slate-600 mt-1 uppercase tracking-wide">
              Threat Confidence
            </p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center border border-amber-200">
            <p className="text-2xl font-bold text-amber-700 capitalize">
              {violation_type || "None"}
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
                {threat_level?.toUpperCase()}
              </span>
            </div>
            <span className="px-2 py-1 bg-white rounded text-xs font-medium shadow-sm border border-slate-200">
              Confidence: {(confidence_score * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-slate-700 italic mb-2">"{query}"</p>

          <div className="text-xs text-slate-600 bg-white/60 rounded p-2 border border-slate-200/50">
            <p>
              <strong>Explanation:</strong> {explanation}
            </p>
            <p className="mt-1">
              <strong>Pattern Detected:</strong>
              {details?.pattern_check?.detection_method} (
              {details?.pattern_check?.injection_patterns_count} injections)
            </p>
            <p className="mt-1">
              <strong>Detection Method:</strong>
              {details?.llm_check?.detection_method}
            </p>
          </div>

          <div className="mt-3">
            <h4 className="font-semibold text-slate-800 text-sm mb-1">
              Recommendations:
            </h4>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
              {recommendations?.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end text-xs text-slate-500 mt-4">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(timestamp).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

export default SafetyGuardView;
