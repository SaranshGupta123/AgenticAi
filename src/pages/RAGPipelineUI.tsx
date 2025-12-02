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
import AnalyseInterface from "../components/analyse/AnalyseInterface";
import AnalyseModal from "../components/analyse/AnalyseModal";

export default function RAGPipelineUI({ goToNotebook }) {
  const [activeTab, setActiveTab] = useState("chat");
  const [agentType, setAgentType] = useState("react");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("general");

  const [modalOpen, setModalOpen] = useState(false);

  const [analyseSessions, setAnalyseSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("analyseSessions");
    if (saved) {
      const parsed = JSON.parse(saved);
      setAnalyseSessions(parsed);
    }
  }, []);

  useEffect(() => {
    if (analyseSessions.length > 0) {
      localStorage.setItem("analyseSessions", JSON.stringify(analyseSessions));
    }
  }, [analyseSessions]);

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
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        analyseSessions={analyseSessions}
        setAnalyseSessions={setAnalyseSessions}
        currentSession={currentSession}
        setCurrentSession={setCurrentSession}
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
  modalOpen,
  setModalOpen,
  analyseSessions,
  setAnalyseSessions,
  currentSession,
  setCurrentSession,
}) {
  const { isLoading } = useLoading();

  useEffect(() => {
    const allowedTabs = ["reasoning", "evaluation", "safety"];
    if (agentType === "source" && !allowedTabs.includes(activeTab)) {
      setAgentType("react");
    }
  }, [activeTab, agentType, setAgentType]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex flex-col flex-1 bg-white shadow-xl overflow-hidden">
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => !isLoading && setActiveTab(tab)}
          onSidebarToggle={() => !isLoading && setSidebarOpen(!sidebarOpen)}
          onNotebookOpen={goToNotebook}
        />

        <div className="flex flex-1 min-h-0 overflow-hidden relative">
          <div
            className={`fixed z-40 inset-y-0 left-0 bg-white border-r border-slate-200 p-4 w-[260px]
              transition-transform duration-300 ease-in-out
              lg:static lg:translate-x-0 lg:w-[300px]
              ${
                sidebarOpen
                  ? "translate-x-0"
                  : "-translate-x-full lg:translate-x-0"
              }`}
          >
            <Sidebar
              activeTab={activeTab}
              agentType={agentType}
              setAgentType={setAgentType}
              selectedSubject={selectedSubject}
              setSelectedSubject={setSelectedSubject}
              selectedQuestion={selectedQuestion}
              setSelectedQuestion={setSelectedQuestion}
              onCreateChat={() => setModalOpen(true)}
              analyseSessions={analyseSessions}
              onSessionSelect={(session) => {
                setCurrentSession(session);
                setActiveTab("analyse");
              }}
            />
          </div>

          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/30 z-30 lg:hidden"
              onClick={() => !isLoading && setSidebarOpen(false)}
            />
          )}

          <div className="flex-1 min-h-0 overflow-hidden p-4 sm:p-6 lg:p-4">
            <div className="h-full flex flex-col min-h-0">
              {activeTab === "chat" &&
                (agentType === "deep_research" ? (
                  <ChatInterface key="chat-deep" mode="deep_research" />
                ) : (
                  <ChatInterface key="chat-react" mode="normal" />
                ))}

              {activeTab === "analyse" && (
                <AnalyseInterface session={currentSession} />
              )}

              {activeTab === "evaluation" && <EvaluationMetrics />}

              {activeTab === "reasoning" && (
                <ReasoningView
                  key={`reason-${agentType}-${selectedSubject}`}
                  agentType={agentType}
                  selectedSubject={selectedSubject}
                />
              )}

              {activeTab === "safety" && (
                <SafetyGuardView selectedQuestion={selectedQuestion} />
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <AnalyseModal
          close={() => setModalOpen(false)}
          onCreate={(session) => {
            const updatedSessions = [...analyseSessions, session];

            setAnalyseSessions(updatedSessions);
            localStorage.setItem(
              "analyseSessions",
              JSON.stringify(updatedSessions)
            );

            setCurrentSession(session);
            setModalOpen(false);
            setActiveTab("analyse");
          }}
        />
      )}
    </div>
  );
}
