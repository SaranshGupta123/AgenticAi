import React, { useState, useEffect } from "react";
import {
  ChatInterface,
  EvaluationMetrics,
  ReasoningView,
  SafetyGuardView,
} from "../components/Agent";

import { Header, Sidebar } from "../components/layout";

export default function RAGPipelineUI() {
  const [activeTab, setActiveTab] = useState("chat");
  const [agentType, setAgentType] = useState("react");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col flex-1 bg-white shadow-xl overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          <div
            className={`
              fixed z-40 inset-y-0 left-0 transform bg-white border-r border-slate-200 p-4
              w-[300px] sm:w-[320px] md:w-[340px] lg:w-[360px]
              overflow-y-auto transition-transform duration-300 ease-in-out
              lg:static lg:translate-x-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            <Sidebar agentType={agentType} setAgentType={setAgentType} />
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6 lg:p-8">
            <div className="h-full flex flex-col min-h-0">
              {activeTab === "chat" && (
                <div className="flex-1 min-h-0 overflow-auto">
                  <ChatInterface />
                </div>
              )}
              {activeTab === "evaluation" && (
                <div className="flex-1 min-h-0 overflow-auto">
                  <EvaluationMetrics />
                </div>
              )}
              {activeTab === "reasoning" && (
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ReasoningView />
                </div>
              )}
              {activeTab === "safety" && (
                <div className="flex-1 min-h-0 overflow-auto">
                  <SafetyGuardView />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
