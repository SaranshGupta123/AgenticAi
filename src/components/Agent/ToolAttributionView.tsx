import React, { useEffect, useState } from "react";
import { Layers, CheckCircle, Clock, Zap } from "lucide-react";

export const ToolAttributionView: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/attribute_response.json");
        if (!response.ok) throw new Error("Failed to fetch attribution data");
        const jsonData = await response.json();
        setData(jsonData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Unable to load tool attribution data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-600 text-sm">
        Loading tool attribution data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 text-sm">
        {error}
      </div>
    );
  }

  const totalTime = data?.total_execution_time?.toFixed(2) || "0.00";
  const query = data?.query || "N/A";
  const finalAnswer = data?.final_answer || "No final answer provided.";
  const toolsUsed = data?.tools_used || [];
  const attribution = data?.source_attributions || [];
  const toolSummary = data?.tool_usage_summary || {};

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
          <Layers className="w-5 h-5 text-indigo-600" />
          <span>Tool Attribution Report</span>
        </h2>
        <div className="flex items-center space-x-2 text-sm text-slate-600">
          <Clock className="w-4 h-4" />
          <span>Total Time: {totalTime}s</span>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <p className="text-sm font-medium text-slate-900 mb-1">Query</p>
          <p className="text-sm text-slate-700">{query}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
          <p className="text-sm font-medium text-slate-900 mb-1">
            Final Answer
          </p>
          <p className="text-sm text-slate-700 leading-relaxed">
            {finalAnswer}
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3">
            Tool Contribution Breakdown
          </h3>
          <div className="space-y-2">
            {toolsUsed.map((tool: any, idx: number) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-700 font-medium">
                    {tool.tool_name}
                  </span>
                  <span className="font-semibold text-indigo-600">
                    {(tool.contribution_score * 100).toFixed(0) || 100}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${(tool.contribution_score
                        ? tool.contribution_score * 100
                        : 100
                      ).toFixed(0)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">
            Execution Timeline
          </h3>
          <div className="space-y-3">
            {toolsUsed.map((tool: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-lg p-4 border border-slate-200"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 text-indigo-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {tool.tool_name}
                      </p>
                      <p className="text-xs text-slate-500 capitalize">
                        {tool.tool_type}
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mt-3 pt-3 border-t border-slate-200">
                  <div>
                    <p className="text-slate-500 text-xs uppercase">Duration</p>
                    <p className="font-semibold text-slate-800">
                      {tool.execution_duration.toFixed(2)}s
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs uppercase">
                      Contribution
                    </p>
                    <p className="font-semibold text-slate-800">
                      {(tool.contribution_score * 100).toFixed(0) || 100}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-3">
            Source Attribution
          </h3>
          {attribution.map((src: any, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-lg p-3 text-sm shadow-sm"
            >
              <p className="font-medium text-slate-800">
                {src.source_type} → {src.source_identifier}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Relevance Score: {(src.relevance_score * 100).toFixed(0)}%
              </p>
            </div>
          ))}
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 mt-6">
          <h3 className="font-semibold text-slate-900 mb-2">
            Summary Statistics
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <p>
              <strong>Total Tools:</strong> "}
              {toolSummary.total_tools_invoked || 0}
            </p>
            <p>
              <strong>Unique Tools:</strong> "}
              {toolSummary.unique_tools_used || 0}
            </p>
            <p>
              <strong>Most Used Tool:</strong> "}
              {toolSummary.most_used_tool || "N/A"}
            </p>
            <p>
              <strong>Tool Success Rate:</strong> "}
              {toolSummary.tool_success_rates?.smart_search || 0}%
            </p>
            <p>
              <strong>Total Execution Time:</strong> {totalTime}s
            </p>
            <p>
              <strong>Agent Type:</strong> {data?.metadata?.agent_type || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolAttributionView;
