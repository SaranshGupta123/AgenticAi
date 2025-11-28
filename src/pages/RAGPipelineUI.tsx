import React, { useState, useEffect } from "react";
import {
  ChatInterface,
  EvaluationMetrics,
  ReasoningView,
  SafetyGuardView,
} from "../components/Agent";
import {
  LoadingProvider,
  useLoading,
} from "../components/context/LoadingContext";

import { Header, Sidebar } from "../components/layout";

export default function RAGPipelineUI({ goToNotebook }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [agentType, setAgentType] = useState("react");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  // NEW STATE: For Source mode subject selection
  const [selectedSubject, setSelectedSubject] = useState("general");

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
    <LoadingProvider>
      <RAGPipelineContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agentType={agentType}
        setAgentType={setAgentType}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        selectedQuestion={selectedQuestion}
        setSelectedQuestion={setSelectedQuestion}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        goToNotebook={goToNotebook}
      />
    </LoadingProvider>
  );
}

function RAGPipelineContent({
  activeTab,
  setActiveTab,
  agentType,
  setAgentType,
  sidebarOpen,
  setSidebarOpen,
  selectedQuestion,
  setSelectedQuestion,
  selectedSubject,
  setSelectedSubject,
  goToNotebook,
}) {
  const { isLoading } = useLoading();

  // AUTO RESET: If user leaves Source-allowed tabs
  useEffect(() => {
    const allowedTabs = ["reasoning", "evaluation", "safety"];

    if (agentType === "source" && !allowedTabs.includes(activeTab)) {
      setAgentType("react");
    }
  }, [activeTab, agentType, setAgentType]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col flex-1 bg-white shadow-xl overflow-hidden">
        {/* HEADER */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onSidebarToggle={() => !isLoading && setSidebarOpen((prev) => !prev)}
          onNotebookOpen={goToNotebook}
        />

        {/* LAYOUT */}
        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          {/* SIDEBAR */}
          <div
            className={`
              fixed z-40 inset-y-0 left-0 bg-white border-r border-slate-200 p-4 w-[260px]
              transition-transform duration-300 ease-in-out
              lg:static lg:translate-x-0 lg:w-[300px]
              ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }
            `}
          >
            <Sidebar
              activeTab={activeTab}
              agentType={agentType}
              setAgentType={setAgentType}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
            />
          </div>

          {/* SIDEBAR BG OVERLAY */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => !isLoading && setSidebarOpen(false)}
            />
          )}

          {/* MAIN CONTENT */}
          <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6 lg:p-4">
            <div className="h-full flex flex-col min-h-0">
              {/* CHAT MODE */}
              {activeTab === "chat" &&
                (agentType === "deep_research" ? (
                  <ChatInterface key="chat-deep" mode="deep_research" />
                ) : (
                  <ChatInterface key="chat-react" mode="normal" />
                ))}

              {/* EVALUATION */}
              {activeTab === "evaluation" && <EvaluationMetrics />}

              {/* REASONING VIEW (now subject-based!) */}
              {activeTab === "reasoning" && (
                <ReasoningView
                  key={`reason-${agentType}-${selectedSubject}`}
                  agentType={agentType}
                  selectedSubject={selectedSubject}
                />
              )}

              {/* SAFETY */}
              {activeTab === "safety" && (
                <SafetyGuardView selectedQuestion={selectedQuestion} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
