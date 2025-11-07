import React, { useState } from "react";
import RAGPipelineUI from "./pages/RAGPipelineUI";
import NotebookHome from "./pages/NotebookHome";
import NotebookWorkspace from "./pages/NotebookWorkspace";

export default function App() {
  const [page, setPage] = useState("agentic");
  const [selectedTopic, setSelectedTopic] = useState(null);

  if (page === "workspace")
    return (
      <NotebookWorkspace
        topicId={selectedTopic}
        goBack={() => setPage("home")}
      />
    );

  if (page === "home")
    return (
      <NotebookHome
        goBack={() => setPage("agentic")}
        openNotebook={(id) => {
          setSelectedTopic(id);
          setPage("workspace");
        }}
      />
    );

  return <RAGPipelineUI goToNotebook={() => setPage("home")} />;
}
