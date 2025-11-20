import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AnswerDetails from "./AnswerDetails";
import MindmapNotebookLM from "../pages/MindmapNotebookLM";
import { X, Sparkles } from "lucide-react";

export function SearchModal({ tool, title }: any) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  if (!tool.showSearchModal) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <style>{`
        @keyframes searchModalIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .search-modal {
          animation: searchModalIn 0.3s ease-out;
        }
      `}</style>

      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => tool.setShowSearchModal(false)}
      />

      <div className="search-modal w-[600px] bg-gradient-to-br from-[#1E2228] to-[#1A1D24] border border-blue-600/30 rounded-2xl p-6 relative shadow-2xl shadow-purple-900/40 z-10">
        <button
          onClick={() => tool.setShowSearchModal(false)}
          className="absolute top-4 right-4 text-2xl text-gray-300 hover:text-red-400 p-1 rounded-full transition-all transform hover:scale-110 hover:rotate-90"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          {title}
        </h2>

        <input
          value={tool.question}
          onChange={(e) => tool.setQuestion(e.target.value)}
          placeholder="Ask something..."
          className="w-full px-4 py-3 bg-[#2B2F36] border border-blue-600/30 rounded-xl text-base outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500 transition-all duration-150 hover:border-blue-500/50"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => tool.setShowSearchModal(false)}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-[#33383F] text-gray-300 hover:bg-[#3E4550] transition-all transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={tool.search}
            disabled={!tool.question.trim()}
            className="px-5 py-2.5 text-sm font-medium rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Search
          </button>
        </div>
      </div>
    </div>
  );
}

export function AnswerModal({ tool, title }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  if (!tool.showAnswerModal) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      tool.setShowAnswerModal(false);
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <style>{`
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes modalSlideOut {
          from {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
          to {
            opacity: 0;
            transform: scale(0.92) translateY(20px);
          }
        }

        @keyframes contentFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          animation: ${
            isClosing ? "modalSlideOut" : "modalSlideIn"
          } 0.4s ease-out forwards;
        }

        .modal-header {
          animation: slideInDown 0.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes slideInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-body {
          animation: contentFadeIn 0.5s ease-out 0.2s forwards;
          opacity: 0;
        }

        .answer-text p {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }

        .answer-text p:nth-of-type(1) { animation-delay: 0.3s; }
        .answer-text p:nth-of-type(2) { animation-delay: 0.4s; }
        .answer-text p:nth-of-type(3) { animation-delay: 0.5s; }
        .answer-text p:nth-of-type(n+4) { animation-delay: 0.6s; }

        .answer-text h1,
        .answer-text h2,
        .answer-text h3 {
          animation: slideInLeft 0.5s ease-out forwards;
          opacity: 0;
          color: #ffffff;
        }

        .answer-text h1 { animation-delay: 0.25s; }
        .answer-text h2 { animation-delay: 0.35s; }
        .answer-text h3 { animation-delay: 0.45s; }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .answer-text strong {
          color: #ffffff;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.1);
          padding: 0 4px;
          border-radius: 3px;
        }

        .answer-text a {
          color: #ffffff;
          text-decoration: underline;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.1);
          padding: 0 4px;
          border-radius: 3px;
        }

        .answer-text a:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .close-btn-animated:hover {
          animation: spinRotate 0.3s ease-out forwards;
        }

        @keyframes spinRotate {
          from {
            transform: rotate(0deg) scale(1);
          }
          to {
            transform: rotate(90deg) scale(1.1);
          }
        }
      `}</style>

      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className={`modal-content
          ${
            title.toLowerCase().includes("mindmap")
              ? "w-[90vw] max-w-[1400px]"
              : "w-[700px]"
          }
          max-h-[90vh] flex flex-col bg-gradient-to-br from-[#14171C] to-[#0E1116] rounded-2xl 
          border border-blue-600/40 shadow-2xl shadow-blue-900/50
          p-6 relative z-10`}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/5 via-cyan-600/5 to-transparent pointer-events-none" />

        <button
          onClick={handleClose}
          className="close-btn-animated absolute top-4 right-4 text-gray-300 hover:text-red-400 p-1 rounded-full transition-all duration-300 z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="modal-header relative z-10 flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        <div className="modal-body flex-1 h-0 overflow-y-auto text-gray-300 text-base leading-relaxed border border-blue-600/30 rounded-xl p-5 space-y-4 bg-gradient-to-br from-[#1A1D22] to-[#15191F] relative z-10">
          <div className="answer-text">
            {tool.answer?.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {tool.answer.content}
              </ReactMarkdown>
            ) : (
              <p>No content available.</p>
            )}

            {tool.answer && (
              <>
                <AnswerDetails answer={tool.answer} />
              </>
            )}
            {title.toLowerCase().includes("mindmap") && tool.answer && (
              <div className="mt-5 p-3 rounded-xl bg-gradient-to-br from-[#1E2228] to-[#1A1D24] border border-blue-600/30">
                <MindmapNotebookLM data={tool.answer} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToolCard({
  icon: Icon,
  label,
  onClick,
  style = {},
  className = "",
}) {
  const [isHovering, setIsHovering] = useState(false);

  const bg = style.backgroundColor;

  function getTextColor(bg) {
    const match = bg?.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return "#F1F3F5";

    let [_, r, g, b] = match.map(Number);
    r = Math.min(255, r + 120);
    g = Math.min(255, g + 120);
    b = Math.min(255, b + 120);

    return `rgb(${r}, ${g}, ${b})`;
  }

  const glowColor = getTextColor(bg);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      style={style}
      className={`
        group
        rounded-2xl backdrop-blur-md 
        border border-white/10 
        px-4 py-6
        flex flex-col items-center justify-center space-y-2
        cursor-pointer select-none 
        transition-all duration-300
        shadow-[0_0_20px_rgba(0,0,0,0.45)]
        hover:scale-[1.1] hover:-translate-y-2
        hover:border-white/20
        active:scale-95
        relative overflow-hidden
        ${className}
      `}
    >
      <style>{`
        @keyframes shineSweep {
          0% { transform: translateX(-150%); opacity: 0; }
          50% { opacity: 0.7; }
          100% { transform: translateX(150%); opacity: 0; }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 15px ${glowColor}; }
          50% { box-shadow: 0 0 30px ${glowColor}; }
        }

        @keyframes iconFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px);}
        }
      `}</style>

      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
          animation: isHovering ? "shineSweep 1s ease-out" : "none",
        }}
      />

      <div
        className={`
          p-3 rounded-full 
          bg-black/40 border border-white/10 
          flex items-center justify-center
          transition-all duration-300
          group-hover:scale-125
          ${isHovering ? "animate-[glowPulse_2s_infinite]" : ""}
        `}
        style={{
          boxShadow: isHovering
            ? `0 0 20px ${glowColor}, 0 0 40px ${glowColor}66`
            : `0 0 10px rgba(0,0,0,0.4)`,
        }}
      >
        <Icon
          className={`w-8 h-8 transition-all duration-300`}
          style={{
            color: glowColor,
            filter: isHovering
              ? `drop-shadow(0px 0px 10px ${glowColor}) brightness(1.3)`
              : `drop-shadow(0px 0px 4px ${glowColor}88)`,
            animation: isHovering ? "iconFloat 3s ease-in-out infinite" : "",
            transform: isHovering ? "rotate(8deg)" : "none",
          }}
        />
      </div>

      <span
        className="
          text-sm font-semibold tracking-wide transition-all duration-300
        "
        style={{
          color: glowColor,
          textShadow: isHovering
            ? `0px 0px 12px ${glowColor}, 0px 0px 18px ${glowColor}AA`
            : `0px 0px 6px ${glowColor}66`,
        }}
      >
        {label}
      </span>
    </button>
  );
}
