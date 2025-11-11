import React, { useState, useEffect } from "react";
import { MessageSquare, Search, Shield, Clock, Zap } from "lucide-react";
import { fetchChatResponse, fetchDeepResearchResponse } from "../../api/api";
import ReactMarkdown from "react-markdown";

export const ChatInterface = ({ mode = "normal" }) => {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const defaultChat =
    mode === "deep_research"
      ? {
          question: "What topic should we investigate in depth?",
          answer:
            "Deep Research mode allows multi-step reasoning, evidence gathering, structured analysis, and long-form synthesis. Ask a topic and I will begin the investigation.",
          metadata: { total_time: 0, agent_type: "deep_research" },
          safe: true,
        }
      : {
          question: "What are the latest updates from OpenAI?",
          answer:
            "OpenAI recently made headlines with its $6.5 billion acquisition of io Products Inc., co-founded by Jony Ive. The company is exploring AI hardware collaborations and new ChatGPT improvements.",
          metadata: { total_time: 4.21, agent_type: "react" },
          safe: true,
        };

  useEffect(() => {
    const storageKey =
      mode === "deep_research"
        ? "agentic_chat_history_deep"
        : "agentic_chat_history_react";

    const savedChats = localStorage.getItem(storageKey);

    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        setChats([defaultChat, ...parsed]);
      } catch {
        setChats([defaultChat]);
      }
    } else {
      setChats([defaultChat]);
    }
  }, [mode]);

  useEffect(() => {
    const storageKey =
      mode === "deep_research"
        ? "agentic_chat_history_deep"
        : "agentic_chat_history_react";

    if (chats.length > 1) {
      localStorage.setItem(storageKey, JSON.stringify(chats.slice(1)));
    }
  }, [chats, mode]);

  const handleSubmit = async () => {
    if (!query.trim() || loading) return;
    setLoading(true);

    try {
      const data =
        mode === "deep_research"
          ? await fetchDeepResearchResponse(query)
          : await fetchChatResponse(query);

      // ✅ SHORTEN RESPONSE ONLY IN REACT MODE
      let formattedAnswer = data.answer;
      if (mode === "normal") {
        // Normalize whitespace & convert to lines
        const cleaned = formattedAnswer
          .replace(/\n+/g, "\n")
          .replace(/\s+/g, " ")
          .trim();

        // Break into meaningful bullet-like sentences
        let points = cleaned
          .replace(/[\•\-–]/g, "") // remove bullet symbols
          .split(/\. |\n|;/)
          .map((p) => p.trim())
          .filter((p) => p.length > 8); // remove junk short lines

        // Sort by relevance (longer sentences first looks more structured)
        points = points.sort((a, b) => b.length - a.length);

        // Take top 3 lines & format nicely
        formattedAnswer = points
          .slice(0, 3)
          .map((p) => `• ${p}`)
          .join("\n");
      }

      const newChat = {
        question: query,
        answer: formattedAnswer,
        metadata: data.metadata,
        safe: data.safe ?? true,
      };

      setChats((prev) => [...prev, newChat]);
      setQuery("");
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-scroll");
    if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
  }, [chats, loading]);

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-slate-900">
              Query Interface
            </h2>
          </div>
        </div>
      </div>

      <div id="chat-scroll" className="flex-1 p-6 overflow-y-auto space-y-6">
        {chats.map((chat, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-2xl shadow-md">
                <p>{chat.question}</p>
              </div>
            </div>

            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 max-w-3xl shadow-sm">
                {chat.safe && (
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-100 mb-3 shadow-sm">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs text-green-700 font-semibold">
                      Safe
                    </span>
                  </div>
                )}

                <div className="text-slate-800 leading-relaxed whitespace-pre-line prose prose-slate max-w-none">
                  {mode === "deep_research" ? (
                    <ReactMarkdown>{chat.answer}</ReactMarkdown>
                  ) : (
                    chat.answer
                  )}
                </div>

                <div className="flex items-center gap-4 mt-4 pt-2 border-t border-slate-200 text-xs text-slate-500">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{chat.metadata?.total_time?.toFixed(2) ?? "—"}s</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span className="capitalize">
                      {chat.metadata?.agent_type ?? "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center justify-center space-x-3 py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-slate-600 text-sm">
              Processing your query...
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-4 bg-slate-50">
        <div className="flex space-x-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about OpenAI, tech, weather, or any topic..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-transparent text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSubmit}
            disabled={!query.trim() || loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center space-x-2 font-medium transition-colors duration-150 shadow-sm"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
