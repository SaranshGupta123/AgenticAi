import React from "react";
import { BarChart3, CheckCircle, Target, GitBranch } from "lucide-react";

export const EvaluationMetrics: React.FC = () => {
  const metrics = {
    taskSuccess: { rate: 87.5, successful: 35, total: 40 },
    responseRelevance: { average: 82.3, high: 28, low: 3 },
    knowledgeUtil: { utilization: 76.8, diversity: 84.2 },
    planning: { avgSteps: 3.4, toolEfficiency: 88.1 },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <span>Pipeline Evaluation Metrics</span>
          </h2>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Overall: 82.4/100</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span>Task Success Rate</span>
              </h3>
              <span className="text-2xl font-bold text-blue-700">{metrics.taskSuccess.rate}%</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Successful:</span>
                <span className="font-semibold">{metrics.taskSuccess.successful}/{metrics.taskSuccess.total}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${metrics.taskSuccess.rate}%` }} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <Target className="w-5 h-5 text-green-600" />
                <span>Response Relevance</span>
              </h3>
              <span className="text-2xl font-bold text-green-700">{metrics.responseRelevance.average}%</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">High Relevance:</span>
                <span className="font-semibold text-green-700">{metrics.responseRelevance.high}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Low Relevance:</span>
                <span className="font-semibold text-amber-700">{metrics.responseRelevance.low}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-purple-600" />
                <span>Knowledge Utilization</span>
              </h3>
              <span className="text-2xl font-bold text-purple-700">{metrics.knowledgeUtil.utilization}%</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Source Diversity:</span>
                <span className="font-semibold">{metrics.knowledgeUtil.diversity}%</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-5 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
                <GitBranch className="w-5 h-5 text-amber-600" />
                <span>Planning Quality</span>
              </h3>
              <span className="text-2xl font-bold text-amber-700">{metrics.planning.toolEfficiency}%</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Avg Steps:</span>
                <span className="font-semibold">{metrics.planning.avgSteps}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 bg-slate-50 rounded-lg p-5 border border-slate-200">
          <h3 className="font-semibold text-slate-900 mb-4">Performance Trend</h3>
          <div className="flex items-end justify-between h-32 space-x-2">
            {[65, 72, 78, 81, 85, 82, 87, 89].map((val, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors" style={{ height: `${val}%` }} />
                <span className="text-xs text-slate-500 mt-2">W{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default EvaluationMetrics;
