import React, { useEffect, useState, useRef } from "react";
import { Send, Shield } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { analyseURL } from "../../api/api";
import { useLoading } from "../context/LoadingContext";

const loadingTexts = [
  "Thinking…",
  "Analyzing webpage…",
  "Extracting meaningful content…",
  "Processing patterns…",
  "Generating structured response…",
];

const longestLoadingText = loadingTexts.reduce((a, b) =>
  a.length > b.length ? a : b
);

export default function AnalyseInterface({ session }) {
  const { isLoading, setIsLoading } = useLoading();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loadingIndex, setLoadingIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!session) return;

    const saved = localStorage.getItem(`chat_${session.id}`);

    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      setMessages(
        [
          session.question
            ? {
                role: "user",
                text: session.question,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }
            : null,

          session.content
            ? {
                role: "ai",
                text: session.content,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              }
            : null,
        ].filter(Boolean)
      );
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    localStorage.setItem(`chat_${session.id}`, JSON.stringify(messages));
  }, [messages, session]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    const interval = setInterval(() => {
      setLoadingIndex((prev) => (prev + 1) % loadingTexts.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMsg = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);

    const question = input;
    setInput("");

    setMessages((prev) => [...prev, { role: "loading", text: "..." }]);

    const response = await analyseURL(session.url, question);

    setMessages((prev) => prev.filter((m) => m.role !== "loading"));

    setMessages((prev) => [
      ...prev,
      {
        role: "ai",
        text: response?.content || response?.error || "⚠️ No response",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-6">
        {session && (
          <div className="w-full max-w-[900px] mx-auto p-4 mb-4 bg-white border border-slate-300 rounded-xl shadow-md flex items-center gap-4 hover:shadow-lg transition-all duration-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-xl">
              🌐
            </div>

            <div className="flex-1 overflow-hidden">
              <p className="font-semibold text-slate-900 truncate">
                {session.url}
              </p>

              {session?.question && (
                <p className="text-xs text-slate-500 truncate mt-1">
                  Query: "{session.question}"
                </p>
              )}

              <p className="text-[11px] text-slate-400 mt-1">
                Created: {session.createdAt}
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="space-y-3">
            {msg.role === "user" && (
              <div className="w-full flex justify-center mt-20 mb-10">
                <div className="w-full max-w-[900px] mx-auto flex justify-end px-2">
                  <div className="bg-blue-600 text-white rounded-2xl rounded-tr-sm px-6 py-3 shadow-md">
                    <p>{msg.text}</p>
                    <span className="text-xs opacity-75 mt-1 block">
                      {msg.time}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {msg.role === "loading" && (
              <div className="w-full flex justify-center mt-4">
                <div className="w-full max-w-[900px] mx-auto flex gap-3 px-2 py-3">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                    AI
                  </div>

                  <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 w-full shadow-sm">
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-2/3 bg-slate-200 rounded animate-pulse" />
                      <div className="h-3 w-1/3 bg-slate-200 rounded animate-pulse" />
                    </div>

                    <div className="flex items-center gap-2 mt-3 ml-1">
                      <span
                        className="text-slate-500 text-xs italic"
                        style={{ width: `${longestLoadingText.length + 2}ch` }}
                      >
                        {loadingTexts[loadingIndex]}
                      </span>
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce" />
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-150" />
                      <span className="h-2 w-2 bg-purple-500 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {msg.role !== "user" && msg.role !== "loading" && (
              <div className="w-full flex justify-center">
                <div className="w-full max-w-[900px] mx-auto px-2">
                  <div className="inline-flex items-center space-x-1 px-2 py-1 bg-green-50 rounded-full border border-green-100 mb-3 shadow-sm">
                    <Shield className="w-3 h-3 text-green-600" />
                    <span className="text-xs text-green-700 font-semibold">
                      Safe
                    </span>
                  </div>

                  <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-tl-sm px-6 py-3 shadow-md prose prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                    <span className="text-xs opacity-60 mt-1 block text-right">
                      {msg.time}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border-t p-4 bg-slate-50">
        <div className="relative w-full">
          <input
            type="text"
            value={input}
            disabled={isLoading}
            placeholder={isLoading ? "Please wait..." : "Ask your question..."}
            className="w-full px-4 py-3 pr-12 border rounded-xl focus:ring-2"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full disabled:bg-gray-400"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
