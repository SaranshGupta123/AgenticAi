import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import AnswerDetails from "./AnswerDetails";
import MindmapNotebookLM from "../pages/MindmapNotebookLM";
import { X, Sparkles } from "lucide-react";
import ReactDOM from "react-dom";

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
  const [activeTab, setActiveTab] = useState<"graph" | "info">("graph");

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

  return ReactDOM.createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen && !isClosing ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <style>{`
      @keyframes modalSlideIn {
        from { opacity: 0; transform: scale(0.92) translateY(20px); }
        to { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes modalSlideOut {
        from { opacity: 1; transform: scale(1) translateY(0); }
        to { opacity: 0; transform: scale(0.92) translateY(20px); }
      }
      @keyframes contentFadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `}</style>

      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div
        className={`modal-content ${
          title.toLowerCase().includes("mindmap")
            ? "w-[90vw] max-w-[1400px]"
            : "w-[700px]"
        }
        max-h-[90vh] flex flex-col bg-gradient-to-br from-[#14171C] to-[#0E1116]
        rounded-2xl border border-blue-600/40 shadow-2xl shadow-blue-900/50 p-6 relative z-10`}
      >
        <button
          onClick={handleClose}
          className="close-btn-animated absolute top-4 right-4 text-gray-300 hover:text-red-400 p-1 rounded-full transition-all duration-300 z-20"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          <h2 className="text-xl font-bold text-white">{title}</h2>
        </div>

        <div className="flex-1 h-0 overflow-y-auto text-gray-300 text-base leading-relaxed border border-blue-600/30 rounded-xl p-5 space-y-4 bg-gradient-to-br from-[#1A1D22] to-[#15191F]">
          <div className="answer-text">
            {tool.answer?.content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {tool.answer.content}
              </ReactMarkdown>
            ) : (
              <p>No content available.</p>
            )}

            {tool.answer && <AnswerDetails answer={tool.answer} />}

            {title.toLowerCase().includes("mindmap") && tool.answer && (
              <div className="mt-5 p-3 rounded-xl bg-gradient-to-br from-[#1E2228] to-[#1A1D24] border border-blue-600/30">
                <MindmapNotebookLM data={tool.answer} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export function ToolCard({
  icon: Icon,
  label,
  onClick,
  style = {},
  className = "",
  tooltip = "",
}) {
  const [isHovering, setIsHovering] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const buttonRef = React.useRef<HTMLButtonElement>(null);

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

  const handleInfoHover = (e: React.MouseEvent) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const padding = 10;

      let top = rect.top;
      let left = rect.right + padding;

      if (left + tooltipWidth > window.innerWidth) {
        left = rect.left - tooltipWidth - padding;
      }

      if (left < 0) {
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        top = rect.bottom + padding;
      }

      if (top + tooltipHeight > window.innerHeight) {
        top = rect.top - tooltipHeight - padding;
      }

      if (top < 0) {
        top = padding;
      }

      if (left < padding) {
        left = padding;
      }

      if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }

      setTooltipPosition({ top, left });
      setShowTooltip(true);
    }
  };

  const handleTooltipMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <>
      <button
        ref={buttonRef}
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
          
          @keyframes tooltipFadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>

        {tooltip && (
          <div
            className="absolute top-2 right-2 z-20"
            onMouseEnter={handleInfoHover}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-5 h-5 flex items-center justify-center bg-black/70 border border-white/30 rounded-full text-xs text-gray-200 hover:bg-black/90 hover:border-white/50 transition-all cursor-help">
              i
            </div>
          </div>
        )}

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

      {showTooltip &&
        tooltip &&
        ReactDOM.createPortal(
          <div
            className="fixed z-[9999] w-[20rem] bg-[#0E1114] border border-[#2A2D33] text-gray-300 text-sm p-4 rounded-lg shadow-2xl leading-relaxed overflow-y-auto"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              maxHeight: "350px",
              animation: "tooltipFadeIn 0.2s ease-out",
            }}
            onMouseEnter={handleTooltipMouseEnter}
            onMouseLeave={handleTooltipMouseLeave}
          >
            <div dangerouslySetInnerHTML={{ __html: tooltip }} />
          </div>,
          document.body
        )}
    </>
  );
}
