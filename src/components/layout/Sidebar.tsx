import React from "react";
import { Settings } from "lucide-react";
import { useLoading } from "../context/LoadingContext";

type Props = {
  agentType: string;
  setAgentType: (s: string) => void;
  activeTab: string;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
};

export const Sidebar: React.FC<Props> = ({
  agentType,
  setAgentType,
  activeTab,
  selectedSubject,
  setSelectedSubject,
}) => {
  const { isLoading } = useLoading();

  const showSource =
    activeTab === "reasoning" ||
    activeTab === "evaluation" ||
    activeTab === "safety";

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Configuration
        </h3>

        <label className="block text-sm font-medium text-slate-700 mb-2">
          Agent Type
        </label>

        <select
          value={agentType}
          disabled={isLoading}
          onChange={(e) => !isLoading && setAgentType(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-not-allowed"
        >
          <option value="react">ReAct Agent</option>
          <option value="deep_research">Deep Research</option>
          {showSource && <option value="source">Source</option>}
        </select>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            agentType === "source" ? "max-h-32 mt-4" : "max-h-0"
          }`}
        >
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Broad Subject
          </label>

          <select
            value={selectedSubject}
            disabled={isLoading}
            onChange={(e) => !isLoading && setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-not-allowed"
          >
            <option value="mathematics">Mathematics</option>
            <option value="physics">Physics</option>
            <option value="economics">Economics</option>
            <option value="psychology">Psychology</option>
            <option value="statistics">Statistics</option>
            <option value="social_science">Social Science</option>
            <option value="general">General</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">System Status</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">MCP Connectors</span>
            <span className="text-green-600 font-semibold">15 Active</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Vector Store</span>
            <span className="text-green-600 font-semibold">Ready</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Safety Guard</span>
            <span className="text-green-600 font-semibold">Active</span>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          Available Tools
        </h3>

        <div className="flex flex-wrap gap-2">
          {[
            "Search",
            "Calculator",
            "Weather",
            "Stocks",
            "News",
            "ArXiv",
            "Wikipedia",
            "GitHub",
            "Reddit",
          ].map((tool) => (
            <span
              key={tool}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
