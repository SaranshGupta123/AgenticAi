import React from "react";
import { Settings } from "lucide-react";
import { useLoading } from "../context/LoadingContext";
import reactLogo from "../../assets/logo/logo.png";

type Props = {
  agentType: string;
  setAgentType: (s: string) => void;
  activeTab: string;
  selectedSubject: string;
  setSelectedSubject: (s: string) => void;
  onCreateChat?: () => void;
  analyseSessions?: any[];
  onSessionSelect?: (s: any) => void;
};

export const Sidebar: React.FC<Props> = ({
  agentType,
  setAgentType,
  activeTab,
  selectedSubject,
  setSelectedSubject,
  onCreateChat,
  analyseSessions = [],
  onSessionSelect,
}) => {
  const { isLoading } = useLoading();

  const showSource = activeTab === "reasoning";
  const isNavigationLocked = isLoading;

  return (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Settings className="w-4 h-4" />
          {activeTab === "analyse" ? "Analysis Setup" : "Configuration"}
        </h3>

        {activeTab === "analyse" ? (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Create New URL Chat
            </label>

            <button
              onClick={onCreateChat}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700
                text-white rounded-lg text-sm font-medium shadow-sm transition-all"
            >
              + Create Chat
            </button>

            {analyseSessions.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">
                  History
                </h4>

                <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
                  {analyseSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() =>
                        onSessionSelect && onSessionSelect(session)
                      }
                      className="w-full text-left px-3 py-2 border rounded-lg hover:bg-blue-50 
                        text-sm transition"
                    >
                      <p className="font-medium truncate">{session.url}</p>
                      <p className="text-xs text-slate-500">
                        {session.createdAt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Agent Type
            </label>

            <select
              value={agentType}
              disabled={isNavigationLocked}
              onChange={(e) =>
                !isNavigationLocked && setAgentType(e.target.value)
              }
              className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm
              focus:ring-2 focus:ring-blue-500 transition-all ${
                isNavigationLocked
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer hover:border-blue-400"
              }`}
            >
              <option value="react">ReAct Agent</option>
              <option value="deep_research">Deep Research</option>
              {showSource && <option value="source">Reasoning</option>}
            </select>

            <div
              className={`overflow-hidden transition-all duration-300 ${
                showSource && agentType === "source"
                  ? "max-h-32 mt-4"
                  : "max-h-0"
              }`}
            >
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Broad Subject
              </label>

              <select
                value={selectedSubject}
                disabled={isNavigationLocked}
                onChange={(e) =>
                  !isNavigationLocked && setSelectedSubject(e.target.value)
                }
                className={`w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-sm 
                focus:ring-2 focus:ring-blue-500 transition-all ${
                  isNavigationLocked
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-blue-400"
                }`}
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
          </>
        )}
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

      <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Available Tools
          </h3>

          <div className="flex flex-wrap gap-2 mb-5">
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

        <div className="flex justify-center mt-2 pb-2">
          <img
            src={reactLogo}
            alt="System Logo"
            className="w-46 h-11 opacity-80 hover:opacity-100 transition"
          />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
