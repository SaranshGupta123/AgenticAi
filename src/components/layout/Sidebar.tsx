import React from "react";
import { Settings } from "lucide-react";

type Props = {
  agentType: string;
  setAgentType: (s: string) => void;
};

export const Sidebar: React.FC<Props> = ({ agentType, setAgentType }) => {
  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      {/* ================== CONFIGURATION CARD ================== */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Configuration</span>
        </h3>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Agent Type
          </label>
          <select
            value={agentType}
            onChange={(e) => setAgentType(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
          >
            <option value="react">ReAct Agent</option>
            <option value="plan_and_execute">Plan & Execute</option>
          </select>
        </div>
      </div>

      {/* ================== SYSTEM STATUS ================== */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4">System Status</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">MCP Connectors</span>
            <span className="text-sm font-semibold text-green-600">
              15 Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Vector Store</span>
            <span className="text-sm font-semibold text-green-600">Ready</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600">Safety Guard</span>
            <span className="text-sm font-semibold text-green-600">Active</span>
          </div>
        </div>
      </div>

      {/* ================== AVAILABLE TOOLS ================== */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center space-x-2">
          <Settings className="w-4 h-4" />
          <span>Available Tools</span>
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
