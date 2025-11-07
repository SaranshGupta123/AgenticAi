import React from "react";
import {
  Brain,
  MessageSquare,
  BarChart3,
  GitBranch,
  Shield,
  Menu,
  BookOpen,
} from "lucide-react";

type Props = {
  activeTab: string;
  setActiveTab: (t: string) => void;
  onSidebarToggle?: () => void;
  onNotebookOpen?: () => void;
};

export const Header: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onSidebarToggle,
  onNotebookOpen,
}) => {
  const tabs = [
    { id: "chat", label: "Chat", Icon: MessageSquare },
    { id: "evaluation", label: "Metrics", Icon: BarChart3 },
    { id: "reasoning", label: "Reasoning", Icon: GitBranch },
    { id: "safety", label: "Safety", Icon: Shield },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-md shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Agentic Pipeline
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Advanced AI with Full Observability
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="hidden lg:flex items-center space-x-1 sm:space-x-2 bg-slate-100 p-1 rounded-lg">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-3 py-2 rounded-md flex items-center space-x-2 text-sm font-medium transition-colors ${
                activeTab === id
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        <button
          onClick={onNotebookOpen}
          className="px-3 py-2 rounded-md border border-slate-300 hover:bg-slate-100 flex items-center gap-2"
        >
          <BookOpen className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-slate-700">Notebooks</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
