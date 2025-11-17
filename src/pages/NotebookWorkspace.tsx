// import React, { useState, useEffect } from "react";
// import {
//   Link as LinkIcon,
//   Send,
//   Scale,
//   MessageCircleQuestion,
//   GitBranch,
//   FileText,
//   BookOpen,
//   ChevronLeft,
//   ChevronRight,
//   RefreshCw,
//   Feather,
//   GraduationCap,
//   ClipboardList,
//   Zap,
//   Cpu,
// } from "lucide-react";

// import {
//   fetchMindmapFromAPI,
//   fetchFAQFromAPI,
//   fetchComparativeAnalysisFromAPI,
//   fetchTutorialFromAPI,
//   fetchTechnicalReportFromAPI,
//   fetchBlogPostFromAPI,
//   fetchStudyGuideFromAPI,
//   fetchBriefingFromAPI,
//   fetchNotebookAnswerFromAPI,
// } from "../api/api";

// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import MindmapNotebookLM from "./MindmapNotebookLM";

// import {
//   SearchModal,
//   AnswerModal,
//   ToolCard,
// } from "../components/ContentToolView";

// import ResultCardSimple from "../components/ResultCardSimple";

// type Source = {
//   id: string;
//   type: "url" | "file";
//   title: string;
//   href?: string;
// };
// type Message = {
//   role: "user" | "assistant";
//   text: string;
//   sources?: any[];
//   metadata?: any;
// };

// const SourceItem: React.FC<{ s: Source }> = ({ s }) => (
//   <a
//     href={s.href}
//     target="_blank"
//     rel="noopener noreferrer"
//     className="flex items-center gap-3 px-4 py-3 bg-[#1A1D24] border border-gray-700/50 rounded-xl hover:bg-[#2A2F37]
//       transition-all duration-200 cursor-pointer shadow-md shadow-black/20 group transform
//       hover:scale-[1.01] active:scale-[0.98] hover:border-teal-500/50"
//     title={s.title}
//   >
//     <FileText className="w-5 h-5 text-teal-400 group-hover:text-teal-300 flex-shrink-0" />
//     <span className="text-sm flex-1 font-medium text-gray-100 truncate group-hover:text-white">
//       {s.title}
//     </span>
//     {s.href && (
//       <LinkIcon className="w-4 h-4 text-gray-500 group-hover:text-teal-400 flex-shrink-0" />
//     )}
//   </a>
// );

// const MessageBubble: React.FC<{ m: Message }> = ({ m }) => {
//   const isUser = m.role === "user";

//   const bubbleClasses = isUser
//     ? "bg-teal-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md shadow-xl shadow-teal-900/50"
//     : "bg-[#1D222A] text-gray-200 border border-teal-600/30 rounded-t-2xl rounded-br-2xl rounded-bl-md shadow-xl shadow-black/30";

//   return (
//     <div className="space-y-3">
//       <div
//         className={`w-full flex ${
//           isUser ? "justify-center" : "justify-center"
//         } my-4`}
//         style={isUser ? { transform: "translateX(130px)" } : {}}
//       >
//         <div
//           className={`text-sm px-4 py-3 transition-all duration-300 transform hover:scale-[1.01] ${bubbleClasses} ${
//             isUser ? "max-w-[650px]" : "max-w-[900px]"
//           }`}
//         >
//           <div className="text-[15px] leading-relaxed space-y-4">
//             <ReactMarkdown
//               remarkPlugins={[remarkGfm]}
//               components={{
//                 h1: ({ children }) => (
//                   <h1 className="text-2xl font-bold text-white mt-4 mb-3">
//                     {children}
//                   </h1>
//                 ),
//                 h2: ({ children }) => (
//                   <h2 className="text-xl font-semibold text-white mt-4 mb-2">
//                     {children}
//                   </h2>
//                 ),
//                 h3: ({ children }) => (
//                   <h3 className="text-lg font-semibold text-white mt-3 mb-2">
//                     {children}
//                   </h3>
//                 ),
//                 p: ({ children }) => (
//                   <p className="text-[15px] leading-relaxed text-gray-200 mb-4">
//                     {children}
//                   </p>
//                 ),
//                 li: ({ children }) => (
//                   <li className="mb-2 text-gray-300 leading-relaxed">
//                     {children}
//                   </li>
//                 ),
//                 strong: ({ children }) => (
//                   <strong className="font-semibold text-white">
//                     {children}
//                   </strong>
//                 ),
//               }}
//             >
//               {m.text}
//             </ReactMarkdown>
//           </div>
//         </div>
//       </div>

//       {!isUser && m.sources?.length > 0 && (
//         <div className="w-full flex justify-center">
//           <div className="w-full max-w-[900px] bg-[#1A1D24] border border-teal-700/20 rounded-xl p-3 space-y-2 text-xs shadow-lg shadow-black/20">
//             <p className="text-gray-400 font-semibold mb-2 border-b border-gray-700/50 pb-1 flex items-center gap-2">
//               <FileText className="w-3.5 h-3.5 text-teal-400" />
//               Sources Used
//             </p>

//             {m.sources.map((src, idx) => (
//               <div
//                 key={idx}
//                 className="bg-[#21252C] border border-gray-700/50 p-3 rounded-lg space-y-2 hover:bg-[#282D35] transition-colors"
//               >
//                 <p className="text-gray-300 font-medium break-words">
//                   {src.href ? (
//                     <a
//                       href={src.href}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-teal-400 underline hover:text-teal-300"
//                     >
//                       {src.source}
//                     </a>
//                   ) : (
//                     src.source
//                   )}
//                   {src.page && (
//                     <span className="text-gray-500 text-xs ml-2">
//                       (Page {src.page})
//                     </span>
//                   )}
//                 </p>

//                 {src.content_snippet && (
//                   <div className="pl-3 border-l-2 border-teal-500/70 mt-2">
//                     <p className="italic text-gray-400 text-xs leading-relaxed">
//                       "{src.content_snippet}"
//                     </p>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {!isUser && m.metadata && (
//         <div className="w-full flex justify-center">
//           <div className="w-full max-w-[900px] bg-[#1A1D24] border border-white/10 rounded-xl p-3 text-xs text-gray-400 space-y-1 shadow-inner shadow-black/20">
//             <p>
//               <span className="text-gray-300 font-medium">Domain:</span>
//               {m.metadata.active_domain}
//             </p>
//             <p>
//               <span className="text-gray-300 font-medium">Response Time:</span>
//               {m.metadata.total_time}s
//             </p>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// const InputModal = ({
//   title,
//   placeholder,
//   topic,
//   setTopic,
//   onGenerate,
//   loading,
//   onCancel,
// }) => (
//   <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
//     <div className="bg-[#10141A] border border-teal-500/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-teal-900/40">
//       <h3 className="text-2xl text-teal-400 font-bold border-b border-gray-700/50 pb-3">
//         {title}
//       </h3>

//       <p className="text-sm text-gray-400">
//         Enter the topic you want to generate content for.
//       </p>

//       <input
//         value={topic}
//         onChange={(e) => setTopic(e.target.value)}
//         placeholder={placeholder}
//         className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base outline-none
//         focus:ring-2 focus:ring-teal-500 transition-shadow text-white placeholder-gray-500"
//         onKeyDown={(e) => e.key === "Enter" && onGenerate()}
//       />

//       <button
//         onClick={onGenerate}
//         disabled={!topic.trim() || loading}
//         className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-base font-bold
//         transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]
//         shadow-lg shadow-teal-900/60"
//       >
//         {loading ? (
//           <span className="flex items-center justify-center gap-2">
//             <RefreshCw className="w-4 h-4 animate-spin" />
//             Generating...
//           </span>
//         ) : (
//           "Generate"
//         )}
//       </button>

//       <button
//         onClick={onCancel}
//         className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all duration-200
//         transform hover:scale-[1.01] text-gray-200"
//       >
//         Cancel
//       </button>
//     </div>
//   </div>
// );

// export default function NotebookWorkspace({ goBack, title }) {
//   const [sources, setSources] = useState<Source[]>([]);
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [input, setInput] = useState("");

//   const [collapseSources, setCollapseSources] = useState(false);
//   const [collapseStudio, setCollapseStudio] = useState(false);

//   const [enableMindmap, setEnableMindmap] = useState(false);
//   const [mindmapData, setMindmapData] = useState(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [animateEntry, setAnimateEntry] = useState(false);
//   const loadingTexts = [
//     "Thinking…",
//     "Analyzing information…",
//     "Searching notebook…",
//     "Retrieving context…",
//     "Generating answer…",
//   ];
//   const [loadingIndex, setLoadingIndex] = useState(0);

//   useEffect(() => {
//     if (!isLoading) return;
//     const id = setInterval(() => {
//       setLoadingIndex((i) => (i + 1) % loadingTexts.length);
//     }, 1200);
//     return () => clearInterval(id);
//   }, [isLoading]);
//   const toolState = {
//     mindmap: { show: false, topic: "", loading: false },
//     faq: { show: false, topic: "", loading: false },
//     comparative: { show: false, topic: "", loading: false },
//     tutorial: { show: false, topic: "", loading: false },
//     report: { show: false, topic: "", loading: false },
//     blog: { show: false, topic: "", loading: false },
//     study: { show: false, topic: "", loading: false },
//     briefing: { show: false, topic: "", loading: false },
//   };
//   useEffect(() => {
//     setTimeout(() => setAnimateEntry(true), 50);
//   }, []);

//   const [tools, setTools] = useState(toolState);

//   const updateTool = (key, updates) =>
//     setTools((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }));

//   const domain = title || "Medical";

//   const TOOL_FETCHERS = {
//     mindmap: fetchMindmapFromAPI, // ⭐ ADD THIS
//     faq: fetchFAQFromAPI,
//     comparative: fetchComparativeAnalysisFromAPI,
//     tutorial: fetchTutorialFromAPI,
//     report: fetchTechnicalReportFromAPI,
//     blog: fetchBlogPostFromAPI,
//     study: fetchStudyGuideFromAPI,
//     briefing: fetchBriefingFromAPI,
//   };

//   const toolResults = {
//     mindmap: useState(false), // ⭐ ADD THIS
//     faq: useState(false),
//     comparative: useState(false),
//     tutorial: useState(false),
//     report: useState(false),
//     blog: useState(false),
//     study: useState(false),
//     briefing: useState(false),
//   };

//   const toolAnswers = {
//     mindmap: useState(null), // ⭐ ADD THIS
//     faq: useState(null),
//     comparative: useState(null),
//     tutorial: useState(null),
//     report: useState(null),
//     blog: useState(null),
//     study: useState(null),
//     briefing: useState(null),
//   };
//   const generateToolContent = async (key) => {
//     const { topic } = tools[key];
//     if (!topic.trim()) return;

//     updateTool(key, { loading: true });

//     try {
//       const response =
//         key === "mindmap"
//           ? await fetchMindmapFromAPI(topic.trim()) // ⭐ Mindmap special case
//           : await TOOL_FETCHERS[key](domain, topic.trim());

//       toolAnswers[key][1](response);
//       toolResults[key][1](true);
//       if (key === "mindmap") {
//         setMindmapData(response);
//       }
//     } catch (err) {
//       console.error(`⚠️ ${key} generation failed:`, err);
//     } finally {
//       updateTool(key, { loading: false, show: false });
//     }
//   };

//   const sendMessage = async () => {
//     const text = input.trim();
//     if (!text || isLoading) return;
//     setInput("");
//     setIsLoading(true);

//     setMessages((prev) => [...prev, { role: "user", text }]);

//     try {
//       const response = await fetchNotebookAnswerFromAPI(domain, text);

//       if (Array.isArray(response.retrieved_context)) {
//         setSources((prev) => {
//           const normalized = response.retrieved_context.map((src, i) => ({
//             id: `src-${Date.now()}-${i}`,
//             type: "file",
//             title: src.source || "Unknown Document",
//             href: src.href,
//           }));

//           const merged = [...prev, ...normalized];
//           const unique = new Map();
//           merged.forEach((s) => unique.set(s.title, s));

//           return [...unique.values()];
//         });
//       }
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           text: "",
//           sources: response.retrieved_context,
//           metadata: response.metadata,
//         },
//       ]);
//       const fullText = response.answer || "";
//       const words = fullText.split(" ");
//       let index = 0;

//       const id = setInterval(() => {
//         setMessages((prev) => {
//           const newList = [...prev];
//           newList[newList.length - 1].text = words.slice(0, index).join(" ");
//           return newList;
//         });

//         index++;
//         if (index > words.length) {
//           clearInterval(id);
//           setIsLoading(false);
//         }
//       }, 40);
//       if (response.mindmap) setMindmapData(response.mindmap);
//     } catch (err) {
//       console.error("API error:", err);
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           text: "⚠️ API error — check backend or ngrok link.",
//           sources: [],
//           metadata: null,
//         },
//       ]);
//       setIsLoading(false);
//     }
//   };

//   const generateMindmap = async () => {
//     const topic = tools.mindmap.topic.trim();
//     if (!topic) return;

//     updateTool("mindmap", { loading: true });

//     try {
//       const data = await fetchMindmapFromAPI(topic);
//       setMindmapData(data);
//       updateTool("mindmap", { show: false });
//     } catch (err) {
//       console.error("Mindmap error:", err);
//       setMessages((prev) => [
//         ...prev,
//         {
//           role: "assistant",
//           text: "⚠️ Failed to generate mindmap from API.",
//           sources: [],
//           metadata: null,
//         },
//       ]);
//     } finally {
//       updateTool("mindmap", { loading: false });
//     }
//   };

//   return (
//     <div
//       className={`h-screen w-screen bg-[#0E1116] text-white flex flex-col transform transition-all duration-700 ease-out
//   ${animateEntry ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
//     >
//       <header className="flex items-center justify-between px-8 py-4 border-b border-gray-700/50 bg-[#14171C] shadow-2xl shadow-black/70 z-10">
//         <h1 className="text-3xl font-extrabold text-teal-400 tracking-wider flex items-center gap-3">
//           <Zap className="w-7 h-7" />
//           {title ?? "Notebook Workspace"}
//         </h1>

//         <button
//           onClick={goBack}
//           className="px-5 py-2.5 rounded-full bg-[#1A1D24] border border-teal-600/50 text-sm font-bold text-teal-400
//           hover:bg-teal-600 hover:text-white transition-all duration-300 transform hover:scale-[1.03] shadow-md shadow-black/50 flex items-center gap-1"
//         >
//           <ChevronLeft className="w-4 h-4" /> Back to Home
//         </button>
//       </header>
//       <div
//         className="flex-1 h-full min-h-0 overflow-hidden grid"
//         style={{
//           gridTemplateColumns: `${collapseSources ? "64px" : "320px"} 1fr ${
//             collapseStudio ? "64px" : "360px"
//           }`,
//         }}
//       >
//         {!collapseSources && (
//           <div
//             className="flex-shrink-0 border-r border-gray-700/50 overflow-hidden
//   transition-all duration-500 ease-in-out transform"
//           >
//             <aside className="h-full p-6 flex flex-col gap-5 bg-[#14171C]">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-xl font-bold text-gray-100 border-b-2 border-teal-500/50 pb-1">
//                   Sources ({sources.length})
//                 </h2>

//                 <button
//                   onClick={() => setCollapseSources(true)}
//                   className="p-1.5 rounded-full hover:bg-[#3E4550] transition-colors duration-200"
//                 >
//                   <ChevronLeft className="w-5 h-5 text-gray-400" />
//                 </button>
//               </div>

//               <div
//                 className="flex-1 bg-[#1A1D24] border border-gray-700/50 rounded-2xl p-4
//               space-y-4 overflow-y-auto shadow-inner shadow-black/40"
//               >
//                 {sources.length === 0 ? (
//                   <div className="text-center text-gray-500 text-sm py-8">
//                     Start a conversation to automatically ingest sources here.
//                   </div>
//                 ) : (
//                   sources.map((s) => <SourceItem key={s.id} s={s} />)
//                 )}
//               </div>
//             </aside>
//           </div>
//         )}
//         {collapseSources && (
//           <button
//             onClick={() => setCollapseSources(false)}
//             className={`
//   w-full h-full border-r border-gray-700/50 flex justify-center items-center
//   hover:bg-[#1D222A] transition-all duration-500 ease-in-out transform
//   ${collapseSources ? "translate-x-0 opacity-100" : "-translate-x-4 opacity-0"}
// `}
//           >
//             <ChevronRight className="w-5 h-5 text-gray-400" />
//           </button>
//         )}
//         <section className="flex-1 h-full min-h-0 border-r border-gray-700/50 p-6 flex flex-col gap-4 bg-[#10141A]">
//           <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
//             <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
//               <Cpu className="w-4 h-4 text-teal-400 animate-pulse" />
//               Chatting with **{title ?? "Notebook"}**
//               <span className="text-xs text-gray-500 ml-2">
//                 (Context: Medical.json)
//               </span>
//             </p>

//             <div className="flex items-center gap-3">
//               <span className="text-xs text-gray-400">Mindmap Mode</span>

//               <label className="relative inline-flex cursor-pointer group">
//                 <input
//                   type="checkbox"
//                   className="sr-only"
//                   checked={enableMindmap}
//                   onChange={() => setEnableMindmap(!enableMindmap)}
//                 />
//                 <div
//                   className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-teal-600
//                 transition-colors group-hover:ring-1 ring-teal-500/50"
//                 ></div>
//                 <span
//                   className="absolute left-1 top-1 w-3.5 h-3.5 bg-white
//                 rounded-full peer-checked:translate-x-5 transition-transform shadow-md"
//                 ></span>
//               </label>
//             </div>
//           </div>
//           <div
//             className="flex-1 bg-[#171A1F] border border-gray-700/50 rounded-2xl p-5 overflow-x-hidden
//           overflow-y-auto space-y-8 shadow-xl shadow-black/30"
//           >
//             {messages.length === 0 && !isLoading ? (
//               <div className="flex flex-col items-center justify-center w-full h-full text-center text-gray-500">
//                 <div className="w-full max-w-[900px] mx-auto flex flex-col items-center">
//                   <MessageCircleQuestion className="w-10 h-10 mb-4 text-gray-600" />
//                   <p className="text-lg font-semibold">
//                     Start your knowledge exploration.
//                   </p>
//                   <p className="text-sm">
//                     Ask a question to load sources and get AI answers.
//                   </p>
//                 </div>
//               </div>
//             ) : (
//               messages.map((m, idx) => <MessageBubble key={idx} m={m} />)
//             )}
//             {isLoading && (
//               <div className="w-full flex justify-center mt-4">
//                 <div className="w-full max-w-[900px] mx-auto flex gap-3 px-2 py-3">
//                   <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
//                     AI
//                   </div>

//                   <div className="bg-[#1D222A] border border-gray-700/50 px-4 py-3 rounded-2xl max-w-[70%] shadow-md">
//                     <div className="space-y-2">
//                       <div className="h-3 w-3/4 bg-gray-600/30 rounded animate-pulse"></div>
//                       <div className="h-3 w-2/3 bg-gray-600/30 rounded animate-pulse"></div>
//                       <div className="h-3 w-1/3 bg-gray-600/30 rounded animate-pulse"></div>
//                     </div>

//                     <div className="flex items-center gap-2 mt-3">
//                       <span className="text-xs text-gray-400 italic">
//                         {loadingTexts[loadingIndex]}
//                       </span>
//                       <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
//                       <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-150"></span>
//                       <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-300"></span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//           <div className="px-1 pb-1">
//             <div
//               className="flex items-center bg-[#1D222A] border border-teal-700/50 rounded-full px-5 py-3
//             focus-within:ring-2 focus-within:ring-teal-500/70 transition-all duration-300 shadow-xl shadow-black/40"
//             >
//               <input
//                 disabled={isLoading}
//                 className="flex-1 bg-transparent outline-none text-base text-gray-100
//                 placeholder-gray-500"
//                 placeholder="Ask a question or generate a summary..."
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//               />

//               <button
//                 onClick={sendMessage}
//                 disabled={!input.trim() || isLoading}
//                 className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-500
//                 disabled:bg-gray-700 disabled:cursor-not-allowed transform hover:scale-105
//                 active:scale-95 transition-all shadow-md shadow-teal-900/50"
//               >
//                 <Send className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         </section>
//         {!collapseStudio && (
//           <div
//             className="flex-shrink-0 border-l border-gray-700/50 overflow-y-auto
//   transition-all duration-500 ease-in-out transform"
//           >
//             <aside className="h-full p-6 flex flex-col bg-[#14171C]">
//               <div className="flex justify-between items-center pb-3 mb-5">
//                 <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 border-b-2 border-teal-500/50 pb-1">
//                   <Zap className="w-5 h-5 text-teal-400" />
//                   AI Studio Tools
//                 </h2>

//                 <button
//                   onClick={() => setCollapseStudio(true)}
//                   className="p-1.5 rounded-full hover:bg-[#3E4550] transition-colors duration-200"
//                 >
//                   <ChevronRight className="w-5 h-5 text-gray-400" />
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <ToolCard
//                   icon={GitBranch}
//                   label="Mind Map"
//                   onClick={() => updateTool("mindmap", { show: true })}
//                 />
//                 <ToolCard
//                   icon={MessageCircleQuestion}
//                   label="FAQ"
//                   onClick={() => updateTool("faq", { show: true })}
//                 />
//                 <ToolCard
//                   icon={Scale}
//                   label="Comparative Analysis"
//                   onClick={() => updateTool("comparative", { show: true })}
//                 />
//                 <ToolCard
//                   icon={BookOpen}
//                   label="Tutorial"
//                   onClick={() => updateTool("tutorial", { show: true })}
//                 />
//                 <ToolCard
//                   icon={FileText}
//                   label="Technical Report"
//                   onClick={() => updateTool("report", { show: true })}
//                 />
//                 <ToolCard
//                   icon={Feather}
//                   label="Blog Post"
//                   onClick={() => updateTool("blog", { show: true })}
//                 />
//                 <ToolCard
//                   icon={GraduationCap}
//                   label="Study Guide"
//                   onClick={() => updateTool("study", { show: true })}
//                 />
//                 <ToolCard
//                   icon={ClipboardList}
//                   label="Briefing"
//                   onClick={() => updateTool("briefing", { show: true })}
//                 />
//               </div>

//               <div className="mt-8 pt-4 border-t border-gray-700/50 space-y-3">
//                 <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700/50 pb-2">
//                   Tool Results
//                 </h3>

//                 <div className="space-y-3 max-h-[40vh] overflow-y-auto p-2 -m-2">
//                   {Object.entries(toolResults).map(([key, state]) =>
//                     state[0] ? (
//                       <ResultCardSimple
//                         key={key}
//                         title={`${
//                           key.charAt(0).toUpperCase() + key.slice(1)
//                         } Ready`}
//                         onClick={() => toolResults[key][1](true)}
//                       />
//                     ) : null
//                   )}
//                 </div>
//               </div>
//             </aside>
//           </div>
//         )}
//         {collapseStudio && (
//           <button
//             onClick={() => setCollapseStudio(false)}
//             className={`
//   w-full h-full flex justify-center items-center border-l border-gray-700/50
//   hover:bg-[#1D222A] transition-all duration-500 ease-in-out transform
//   ${collapseStudio ? "translate-x-0 opacity-100" : "translate-x-4 opacity-0"}
// `}
//           >
//             <ChevronLeft className="w-5 h-5 text-gray-400" />
//           </button>
//         )}
//       </div>

//       {Object.entries(tools).map(([key, t]) =>
//         t.show ? (
//           <div
//             key={key}
//             className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md"
//           >
//             <div className="bg-[#10141A] border border-teal-500/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-teal-900/40">
//               <h3 className="text-2xl text-teal-400 font-bold border-b border-gray-700/50 pb-3">
//                 Generate {key.charAt(0).toUpperCase() + key.slice(1)}
//               </h3>

//               <p className="text-sm text-gray-400">
//                 Enter a topic for this tool.
//               </p>

//               <input
//                 value={t.topic}
//                 onChange={(e) => updateTool(key, { topic: e.target.value })}
//                 className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base
//                 outline-none focus:ring-2 focus:ring-teal-500 text-white placeholder-gray-500"
//                 placeholder="Enter topic here..."
//                 onKeyDown={(e) => e.key === "Enter" && generateToolContent(key)}
//               />

//               <button
//                 disabled={!t.topic.trim() || t.loading}
//                 onClick={() => generateToolContent(key)}
//                 className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 font-bold transition-all disabled:opacity-50
//                 transform hover:scale-[1.01] shadow-lg shadow-teal-900/60"
//               >
//                 {t.loading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <RefreshCw className="w-4 h-4 animate-spin" />
//                     Generating...
//                   </span>
//                 ) : (
//                   "Generate"
//                 )}
//               </button>

//               <button
//                 onClick={() => updateTool(key, { show: false })}
//                 className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all transform hover:scale-[1.01] text-gray-200"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         ) : null
//       )}

//       {Object.entries(toolResults).map(([key, state]) => {
//         const [val] = state;
//         const [answer] = toolAnswers[key];
//         return (
//           <AnswerModal
//             key={key}
//             tool={{
//               answer: answer
//                 ? {
//                     content: answer.answer || answer.content || "",
//                     metadata: answer.metadata,
//                     sources: answer.retrieved_context,
//                     citations: [],
//                     quality_metrics: null,
//                   }
//                 : null,
//               showAnswerModal: val,
//               setShowAnswerModal: (v) => toolResults[key][1](v),
//             }}
//             title={`${key.charAt(0).toUpperCase() + key.slice(1)} Result`}
//           />
//         );
//       })}
//     </div>
//   );
// }

import React, { useState, useMemo, useCallback } from "react";
import {
  Link as LinkIcon,
  Send,
  Scale,
  MessageCircleQuestion,
  GitBranch,
  Network,
  FileText,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Feather,
  GraduationCap,
  ClipboardList,
  Zap,
  Cpu,
} from "lucide-react";
import {
  fetchMindmapFromAPI,
  fetchFAQFromAPI,
  fetchComparativeAnalysisFromAPI,
  fetchTutorialFromAPI,
  fetchTechnicalReportFromAPI,
  fetchBlogPostFromAPI,
  fetchStudyGuideFromAPI,
  fetchBriefingFromAPI,
  fetchNotebookAnswerFromAPI,
} from "../api/api";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import MindmapNotebookLM from "./MindmapNotebookLM";
import {
  SearchModal,
  AnswerModal,
  ToolCard,
} from "../components/ContentToolView";
import ResultCardSimple from "../components/ResultCardSimple";

type Source = {
  id: string;
  type: "url" | "file";
  title: string;
  href?: string;
};
type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: any[];
  metadata?: any;
};

type Splitter = {
  splitRegex: RegExp;
  addPrefix?: (text: string) => string;
};

function useContentTool(fetcher: () => Promise<any>, splitter: Splitter) {
  const [data, setData] = useState<any | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<any | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [showCard, setShowCard] = useState(false);

  const open = async () => {
    try {
      const d = await fetcher();
      setData(d);
      setQuestion("");

      setTimeout(() => {
        let finalContent = "";

        if (Array.isArray(d.sections)) {
          finalContent = d.sections
            .map((s) => `## ${s.heading}\n\n${s.content}`)
            .join("\n\n");
        } else if (typeof d.content === "string") {
          finalContent = d.content.trim();
        } else if (typeof d.text === "string") {
          finalContent = d.text.trim();
        } else {
          finalContent = JSON.stringify(d, null, 2);
        }

        setAnswer({
          content: finalContent,
          metadata: d.metadata ?? null,
          sources: d.sources ?? [],
          citations: d.citations ?? [],
          quality_metrics: d.quality_metrics ?? null,
        });

        setShowSearchModal(false);
        setShowAnswerModal(true);
        setShowCard(true);
      }, 100);
    } catch (err) {
      console.error("⚠️ Error in open():", err);
    }
  };

  return {
    data,
    question,
    setQuestion,
    answer,
    showSearchModal,
    setShowSearchModal,
    showAnswerModal,
    setShowAnswerModal,
    showCard,
    setShowCard,
    open,
  };
}

const SourceItem: React.FC<{ s: Source }> = ({ s }) => (
  <a
    href={s.href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 px-4 py-3 bg-[#1A1D24] border border-gray-700/50 rounded-xl hover:bg-[#2A2F37] transition-all duration-200 cursor-pointer shadow-md shadow-black/20 group transform hover:scale-[1.01] active:scale-[0.98] hover:border-teal-500/50"
    title={s.title}
  >
    <FileText className="w-5 h-5 text-teal-400 group-hover:text-teal-300 flex-shrink-0" />
    <span className="text-sm flex-1 font-medium text-gray-100 truncate group-hover:text-white">
      {s.title}
    </span>
    {s.href && (
      <LinkIcon className="w-4 h-4 text-gray-500 group-hover:text-teal-400 flex-shrink-0" />
    )}
  </a>
);

const MessageBubble: React.FC<{ m: Message }> = ({ m }) => {
  const isUser = m.role === "user";

  const bubbleClasses = isUser
    ? "bg-teal-600 text-white rounded-2xl shadow-xl shadow-teal-900/50"
    : "bg-[#1D222A] text-gray-200 border border-teal-600/30 rounded-2xl shadow-xl shadow-black/30";

  return (
    <div key={m.text} className="w-full flex justify-center">
      <div
        className={`w-full max-w-[800px] flex flex-col space-y-3 ${
          isUser ? "items-end" : "items-center"
        }`}
      >
        {/* Bubble */}
        <div
          className={`text-sm px-4 py-3 w-fit transition-all duration-300 hover:scale-[1.01] ${
            isUser ? "max-w-[420px] -translate-x-2" : "max-w-[780px]"
          } ${bubbleClasses}`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
        </div>

        {/* Sources */}
        {!isUser && m.sources?.length > 0 && (
          <div className="max-w-[780px] w-full bg-[#1A1D24] border border-teal-700/20 rounded-xl p-3 space-y-2 text-xs shadow-lg shadow-black/20">
            <p className="text-gray-400 font-semibold mb-2 border-b border-gray-700/50 pb-1 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-teal-400" />
              Sources Used
            </p>
            {m.sources.map((src, idx) => (
              <div
                key={idx}
                className="bg-[#21252C] border border-gray-700/50 p-3 rounded-lg space-y-2 hover:bg-[#282D35] transition"
              >
                <p className="text-gray-300 font-medium break-words flex items-center gap-1">
                  {src.href ? (
                    <a
                      href={src.href}
                      target="_blank"
                      className="text-teal-400 underline hover:text-teal-300"
                    >
                      {src.source}
                    </a>
                  ) : (
                    src.source
                  )}

                  {src.page && (
                    <span className="text-gray-500 text-xs ml-2">
                      (Page {src.page})
                    </span>
                  )}
                </p>

                {src.content_snippet && (
                  <div className="pl-3 border-l-2 border-teal-500/70 mt-2">
                    <p className="italic text-gray-400 text-xs leading-relaxed">
                      "{src.content_snippet}"
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        {!isUser && m.metadata && (
          <div className="max-w-[780px] w-full bg-[#1A1D24] border border-white/10 rounded-xl p-3 text-xs text-gray-400 space-y-1 shadow-inner shadow-black/20">
            <p>
              <span className="text-gray-300 font-medium">Domain:</span>{" "}
              {m.metadata.active_domain}
            </p>
            <p>
              <span className="text-gray-300 font-medium">Response Time:</span>{" "}
              {m.metadata.total_time}s
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

type Props = { goBack: () => void; title?: string };

export default function NotebookWorkspace({ goBack, title }: Props) {
  const [sources, setSources] = useState<Source[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [collapseSources, setCollapseSources] = useState(false);
  const [collapseStudio, setCollapseStudio] = useState(false);

  const [enableMindmap, setEnableMindmap] = useState(false);
  const [mindmapData, setMindmapData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadingTexts = [
    "Thinking…",
    "Analyzing information…",
    "Searching notebook…",
    "Retrieving context…",
    "Generating answer…",
  ];
  const [loadingIndex, setLoadingIndex] = useState(0);

  React.useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setLoadingIndex((i) => (i + 1) % loadingTexts.length);
    }, 1200);

    return () => clearInterval(interval);
  }, [isLoading]);

  const [mindmapReady, setMindmapReady] = useState(false);
  const [showMindmapViewer, setShowMindmapViewer] = useState(false);
  const [showMindmapCreateModal, setShowMindmapCreateModal] = useState(false);
  const [mindmapTopic, setMindmapTopic] = useState("");
  const [mindmapLoading, setMindmapLoading] = useState(false);

  const [showBriefingModal, setShowBriefingModal] = useState(false);
  const [briefingTopic, setBriefingTopic] = useState("");
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [showFAQModal, setShowFAQModal] = useState(false);
  const [faqTopic, setFAQTopic] = useState("");
  const [faqLoading, setFAQLoading] = useState(false);

  const [showComparativeModal, setShowComparativeModal] = useState(false);
  const [comparativeTopic, setComparativeTopic] = useState("");
  const [comparativeLoading, setComparativeLoading] = useState(false);

  const [showTutorialModal, setShowTutorialModal] = useState(false);
  const [tutorialTopic, setTutorialTopic] = useState("");
  const [tutorialLoading, setTutorialLoading] = useState(false);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportTopic, setReportTopic] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogTopic, setBlogTopic] = useState("");
  const [blogLoading, setBlogLoading] = useState(false);

  const [showStudyModal, setShowStudyModal] = useState(false);
  const [studyTopic, setStudyTopic] = useState("");
  const [studyLoading, setStudyLoading] = useState(false);

  const currentDomain = title || "Medical";

  const faq = useContentTool(
    async () => {
      const response = await fetchFAQFromAPI(
        currentDomain,
        "Frequently Asked Questions"
      );
      return {
        content: response.answer,
        metadata: response.metadata,
        sources: response.retrieved_context,
        citations: [],
        quality_metrics: null,
      };
    },
    { splitRegex: /##\s+/g, addPrefix: (t) => "## " + t }
  );

  const comparative = useContentTool(
    async () => {
      const response = await fetchComparativeAnalysisFromAPI(
        currentDomain,
        "Comparison Study"
      );
      return {
        content: response.answer,
        metadata: response.metadata,
        sources: response.retrieved_context,
        citations: [],
        quality_metrics: null,
      };
    },
    { splitRegex: /\n#+\s+/g }
  );

  const tutorial = useContentTool(
    async () => {
      const response = await fetchTutorialFromAPI(
        currentDomain,
        "Step by Step Tutorial"
      );
      return {
        content: response.answer,
        metadata: response.metadata,
        sources: response.retrieved_context,
        citations: [],
        quality_metrics: null,
      };
    },
    { splitRegex: /##\s+/g, addPrefix: (t) => "## " + t }
  );

  const report = useContentTool(
    async () => {
      const response = await fetchTechnicalReportFromAPI(
        currentDomain,
        "Detailed Technical Report"
      );
      return {
        content: response.answer,
        metadata: response.metadata,
        sources: response.retrieved_context,
        citations: [],
        quality_metrics: null,
      };
    },
    { splitRegex: /\n#+\s+/g }
  );

  const blog = useContentTool(
    async () => {
      const response = await fetchBlogPostFromAPI(
        currentDomain,
        "Write a Blog Post"
      );
      return {
        content: response.answer,
        metadata: response.metadata,
        sources: response.retrieved_context,
        citations: [],
        quality_metrics: null,
      };
    },
    { splitRegex: /##\s+/g, addPrefix: (t) => "## " + t }
  );

  const study = useContentTool(
    async () => {
      const response = await fetchStudyGuideFromAPI(
        currentDomain,
        "Create Study Guide"
      );
      return {
        content: response.answer,
        metadata: response.metadata,
        sources: response.retrieved_context,
        citations: [],
        quality_metrics: null,
      };
    },
    { splitRegex: /##\s+/g, addPrefix: (t) => "## " + t }
  );

  const briefing = useContentTool(
    async () => {
      const currentDomain = title || "Medical";
      const topic = briefingTopic.trim() || "AI developments overview";

      setBriefingLoading(true);
      try {
        const response = await fetchBriefingFromAPI(currentDomain, topic);
        return {
          content: response.answer,
          metadata: response.metadata,
          sources: response.retrieved_context,
          citations: [],
          quality_metrics: null,
        };
      } finally {
        setBriefingLoading(false);
      }
    },
    {
      splitRegex: /##\s+/g,
      addPrefix: (t) => "## " + t,
    }
  );

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    setInput("");
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", text }]);

    try {
      const currentDomain = title || "Medical";

      const response = await fetchNotebookAnswerFromAPI(currentDomain, text);

      if (
        response.retrieved_context &&
        Array.isArray(response.retrieved_context)
      ) {
        setSources((prev) => {
          const normalized = response.retrieved_context.map((src, index) => ({
            id: `src-${Date.now()}-${index}`,
            type: "file" as const,
            title: src.source || "Unknown Document",
            href: src.href || undefined,
          }));

          const combinedSources = [...prev, ...normalized];
          const uniqueMap = new Map();
          for (const s of combinedSources) {
            if (!uniqueMap.has(s.title)) uniqueMap.set(s.title, s);
          }

          return Array.from(uniqueMap.values());
        });
      }
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "",
          sources: response.retrieved_context ?? [],
          metadata: response.metadata ?? null,
        },
      ]);
      const fullText = response.answer || "";
      const words = fullText.split(" ");
      let index = 0;

      const interval = setInterval(() => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1].text = words.slice(0, index).join(" ");
          return updated;
        });

        index++;

        if (index > words.length) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 40);
      if (response.mindmap) {
        setMindmapData(response.mindmap);
      }
    } catch (error) {
      console.error("❌ API error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Failed to fetch data from API. Please check your backend or ngrok link.",
          sources: [],
          metadata: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMindmapGenerate = async () => {
    if (!mindmapTopic.trim()) return;
    setMindmapLoading(true);

    try {
      const data = await fetchMindmapFromAPI(mindmapTopic);
      setMindmapData(data);

      setMindmapReady(true);
      setShowMindmapCreateModal(false);
      setShowMindmapViewer(true);
    } catch (err) {
      console.error("⚠️ Mindmap API generation failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "⚠️ Failed to generate mindmap from API. Check backend logs or ngrok link.",
          sources: [],
          metadata: null,
        },
      ]);
    } finally {
      setMindmapLoading(false);
    }
  };

  const renderInputModal = (
    title,
    placeholder,
    topic,
    setTopic,
    onGenerate,
    onCancel,
    loading
  ) => (
    <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
      <div className="bg-[#10141A] border border-teal-500/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-teal-900/40">
        <h3 className="text-2xl text-teal-400 font-bold border-b border-gray-700/50 pb-3">
          {title}
        </h3>
        <p className="text-sm text-gray-400">
          Enter the topic you want to generate content for.
        </p>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-teal-500 transition-shadow text-white placeholder-gray-500"
          onKeyDown={(e) => e.key === "Enter" && onGenerate()}
        />
        <button
          onClick={onGenerate}
          disabled={!topic.trim() || loading}
          className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-lg shadow-teal-900/60"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </span>
          ) : (
            "Generate"
          )}
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all duration-200 transform hover:scale-[1.01] text-gray-200"
        >
          Cancel
        </button>
      </div>
    </div>
  );
  const handleFAQGenerate = async () => {
    if (!faqTopic.trim()) return;
    setFAQLoading(true);
    try {
      await faq.open();
      setShowFAQModal(false);
    } catch (err) {
      console.error("⚠️ FAQ generation failed:", err);
    } finally {
      setFAQLoading(false);
    }
  };

  const handleComparativeGenerate = async () => {
    if (!comparativeTopic.trim()) return;
    setComparativeLoading(true);
    try {
      await comparative.open();
      setShowComparativeModal(false);
    } catch (err) {
      console.error("⚠️ Comparative generation failed:", err);
    } finally {
      setComparativeLoading(false);
    }
  };

  const handleTutorialGenerate = async () => {
    if (!tutorialTopic.trim()) return;
    setTutorialLoading(true);
    try {
      await tutorial.open();
      setShowTutorialModal(false);
    } catch (err) {
      console.error("⚠️ Tutorial generation failed:", err);
    } finally {
      setTutorialLoading(false);
    }
  };

  const handleReportGenerate = async () => {
    if (!reportTopic.trim()) return;
    setReportLoading(true);
    try {
      await report.open();
      setShowReportModal(false);
    } catch (err) {
      console.error("⚠️ Report generation failed:", err);
    } finally {
      setReportLoading(false);
    }
  };

  const handleBlogGenerate = async () => {
    if (!blogTopic.trim()) return;
    setBlogLoading(true);
    try {
      await blog.open();
      setShowBlogModal(false);
    } catch (err) {
      console.error("⚠️ Blog generation failed:", err);
    } finally {
      setBlogLoading(false);
    }
  };

  const handleStudyGenerate = async () => {
    if (!studyTopic.trim()) return;
    setStudyLoading(true);
    try {
      await study.open();
      setShowStudyModal(false);
    } catch (err) {
      console.error("⚠️ Study generation failed:", err);
    } finally {
      setStudyLoading(false);
    }
  };

  const handleBriefingGenerate = async () => {
    if (!briefingTopic.trim()) return;
    setBriefingLoading(true);
    try {
      await briefing.open();
      setShowBriefingModal(false);
    } catch (err) {
      console.error("⚠️ Briefing generation failed:", err);
    } finally {
      setBriefingLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0E1116] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-4 border-b border-gray-700/50 bg-[#14171C] shadow-2xl shadow-black/70 z-10">
        <h1 className="text-3xl font-extrabold text-teal-400 tracking-wider flex items-center gap-3">
          <Zap className="w-7 h-7" />
          {title ?? "Notebook Workspace"}
        </h1>
        <button
          onClick={goBack}
          className="px-5 py-2.5 rounded-full bg-[#1A1D24] border border-teal-600/50 text-sm font-bold text-teal-400 hover:bg-teal-600 hover:text-white transition-all duration-300 transform hover:scale-[1.03] shadow-md shadow-black/50 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </button>
      </header>

      <div
        className="flex-1 h-full min-h-0 overflow-hidden grid"
        style={{
          gridTemplateColumns: `${collapseSources ? "64px" : "320px"} 1fr ${
            collapseStudio ? "64px" : "360px"
          }`,
        }}
      >
        {!collapseSources && (
          <div className="flex-shrink-0 border-r border-gray-700/50 overflow-hidden">
            <aside className="h-full p-6 flex flex-col gap-5 bg-[#14171C]">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-100 border-b-2 border-teal-500/50 pb-1">
                  Sources ({sources.length})
                </h2>
                <button
                  onClick={() => setCollapseSources(true)}
                  className="p-1.5 rounded-full hover:bg-[#3E4550] transition-colors duration-200"
                  aria-label="Collapse Sources"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="flex-1 bg-[#1A1D24] border border-gray-700/50 rounded-2xl p-4 space-y-4 overflow-y-auto shadow-inner shadow-black/40">
                {sources.length === 0 ? (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Start a conversation to automatically ingest and list
                    relevant sources here.
                  </div>
                ) : (
                  sources.map((s) => <SourceItem key={s.id} s={s} />)
                )}
              </div>
            </aside>
          </div>
        )}

        {collapseSources && (
          <button
            onClick={() => setCollapseSources(false)}
            className="w-full h-full border-r border-gray-700/50 flex justify-center items-center hover:bg-[#1D222A] transition-colors duration-200"
            aria-label="Expand Sources"
          >
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <section className="flex-1 h-full min-h-0 border-r border-gray-700/50 p-6 flex flex-col gap-4 bg-[#10141A]">
          <div className="flex items-center justify-between border-b border-gray-700/50 pb-3">
            <p className="text-sm text-gray-300 font-medium flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-400 animate-pulse" />
              Chatting with **{title ?? "Notebook"}**
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Context: Medical.json)
              </span>
            </p>
            <div className="flex items-center gap-3">
              {/* <span className="text-xs text-gray-400">Mindmap Mode</span> */}
              {/* <label className="relative inline-flex cursor-pointer group">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={enableMindmap}
                  onChange={() => setEnableMindmap(!enableMindmap)}
                />
                <div className="w-10 h-5 bg-gray-600 rounded-full peer peer-checked:bg-teal-600 transition-colors group-hover:ring-1 ring-teal-500/50"></div>
                <span className="absolute left-1 top-1 w-3.5 h-3.5 bg-white rounded-full peer-checked:translate-x-5 transition-transform shadow-md"></span>
              </label> */}
            </div>
          </div>

          <div
            className="flex-1 bg-[#171A1F] border border-gray-700/50 rounded-2xl p-5 overflow-x-hidden
          overflow-y-auto space-y-8 shadow-xl shadow-black/30"
          >
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center w-full h-full text-center text-gray-500">
                <div className="w-full max-w-[900px] mx-auto flex flex-col items-center">
                  <MessageCircleQuestion className="w-10 h-10 mb-4 text-gray-600" />
                  <p className="text-lg font-semibold">
                    Start your knowledge exploration.
                  </p>
                  <p className="text-sm">
                    Ask a question to load sources and get AI answers.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => <MessageBubble key={idx} m={m} />)
            )}
            {isLoading && (
              <div className="w-full flex justify-center mt-4">
                <div className="w-full max-w-[900px] mx-auto flex gap-3 px-2 py-3">
                  <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    AI
                  </div>

                  <div className="bg-[#1D222A] border border-gray-700/50 px-4 py-3 rounded-2xl max-w-[70%] shadow-md">
                    <div className="space-y-2">
                      <div className="h-3 w-3/4 bg-gray-600/30 rounded animate-pulse"></div>
                      <div className="h-3 w-2/3 bg-gray-600/30 rounded animate-pulse"></div>
                      <div className="h-3 w-1/3 bg-gray-600/30 rounded animate-pulse"></div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-xs text-gray-400 italic">
                        {loadingTexts[loadingIndex]}
                      </span>
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></span>
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-150"></span>
                      <span className="w-2 h-2 bg-teal-500 rounded-full animate-bounce delay-300"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-1 pb-1">
            <div className="flex items-center bg-[#1D222A] border border-teal-700/50 rounded-full px-5 py-3 focus-within:ring-2 focus-within:ring-teal-500/70 transition-all duration-300 shadow-xl shadow-black/40">
              <input
                disabled={isLoading}
                className="flex-1 bg-transparent outline-none text-base text-gray-100 placeholder-gray-500"
                placeholder="Ask a question or generate a quick summary..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-full bg-teal-600 text-white hover:bg-teal-500 disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md shadow-teal-900/50 disabled:shadow-none"
                aria-label="Send Message"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>
        {!collapseStudio && (
          <div className="flex-shrink-0 border-l border-gray-700/50 overflow-y-auto">
            <aside className="h-full p-6 flex flex-col bg-[#14171C]">
              <div className="flex justify-between items-center pb-3 mb-5">
                <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 border-b-2 border-teal-500/50 pb-1">
                  <Zap className="w-5 h-5 text-teal-400" />
                  AI Studio Tools
                </h2>
                <button
                  onClick={() => setCollapseStudio(true)}
                  className="p-1.5 rounded-full hover:bg-[#3E4550] transition-colors duration-200"
                  aria-label="Collapse Studio"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <ToolCard
                  icon={GitBranch}
                  label="Mind Map"
                  onClick={() => setShowMindmapCreateModal(true)}
                />
                <ToolCard
                  icon={MessageCircleQuestion}
                  label="FAQ"
                  onClick={() => setShowFAQModal(true)}
                />
                <ToolCard
                  icon={Scale}
                  label="Comparative Analysis"
                  onClick={() => setShowComparativeModal(true)}
                />
                <ToolCard
                  icon={BookOpen}
                  label="Tutorial"
                  onClick={() => setShowTutorialModal(true)}
                />
                <ToolCard
                  icon={FileText}
                  label="Technical Report"
                  onClick={() => setShowReportModal(true)}
                />
                <ToolCard
                  icon={Feather}
                  label="Blog Post"
                  onClick={() => setShowBlogModal(true)}
                />
                <ToolCard
                  icon={GraduationCap}
                  label="Study Guide"
                  onClick={() => setShowStudyModal(true)}
                />
                <ToolCard
                  icon={ClipboardList}
                  label="Briefing"
                  onClick={() => setShowBriefingModal(true)}
                />
              </div>

              <div className="mt-8 pt-4 border-t border-gray-700/50 space-y-3">
                <h3 className="text-lg font-semibold text-gray-100 border-b border-gray-700/50 pb-2">
                  Tool Results
                </h3>

                <div className="space-y-3 max-h-[40vh] overflow-y-auto p-2 -m-2">
                  {faq.showCard && (
                    <ResultCardSimple
                      title="FAQ Results Ready"
                      onClick={() => faq.setShowAnswerModal(true)}
                    />
                  )}
                  {comparative.showCard && (
                    <ResultCardSimple
                      title="Comparative Insights Ready"
                      onClick={() => comparative.setShowAnswerModal(true)}
                    />
                  )}
                  {tutorial.showCard && (
                    <ResultCardSimple
                      title="Tutorial Result Ready"
                      onClick={() => tutorial.setShowAnswerModal(true)}
                    />
                  )}
                  {report.showCard && (
                    <ResultCardSimple
                      title="Technical Report Ready"
                      onClick={() => report.setShowAnswerModal(true)}
                    />
                  )}
                  {blog.showCard && (
                    <ResultCardSimple
                      title="Blog Content Ready"
                      onClick={() => blog.setShowAnswerModal(true)}
                    />
                  )}
                  {study.showCard && (
                    <ResultCardSimple
                      title="Study Guide Ready"
                      onClick={() => study.setShowAnswerModal(true)}
                    />
                  )}
                  {briefing.showCard && (
                    <ResultCardSimple
                      title="Briefing Ready"
                      onClick={() => briefing.setShowAnswerModal(true)}
                    />
                  )}
                  {mindmapReady && (
                    <ResultCardSimple
                      title="Mindmap Ready"
                      onClick={() => setShowMindmapViewer(true)}
                    />
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {collapseStudio && (
          <button
            onClick={() => setCollapseStudio(false)}
            className="w-full h-full flex justify-center items-center border-l border-gray-700/50 hover:bg-[#1D222A] transition-colors duration-200"
            aria-label="Expand Studio"
          >
            <ChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
      </div>

      {showMindmapViewer && mindmapData && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-auto p-4">
          <div className="w-[95vw] h-[95vh] bg-[#14171C] border border-teal-500/30 rounded-2xl relative p-5 flex flex-col mx-auto shadow-2xl shadow-teal-900/50">
            <h3 className="text-xl font-bold text-white mb-4 border-b border-gray-700/50 pb-2">
              Mind Map Viewer
            </h3>
            <button
              onClick={() => setShowMindmapViewer(false)}
              className="absolute top-5 right-5 text-gray-300 text-2xl hover:text-red-400 z-50 p-2 rounded-full bg-black/50 hover:bg-black/80 transition-all duration-200 transform hover:scale-110"
              aria-label="Close Mindmap Viewer"
            >
              ✕
            </button>

            <div className="flex-1 h-full overflow-y-auto rounded-xl bg-[#1A1D24]">
              <MindmapNotebookLM data={mindmapData} />
            </div>
          </div>
        </div>
      )}

      {showMindmapCreateModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-[#10141A] border border-teal-500/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-teal-900/40">
            <h3 className="text-2xl text-teal-400 font-bold border-b border-gray-700/50 pb-3">
              Generate Mind Map
            </h3>
            <p className="text-sm text-gray-400">
              Enter the main topic for the AI to analyze your notebook data and
              generate a visual mind map.
            </p>
            <input
              value={mindmapTopic}
              onChange={(e) => setMindmapTopic(e.target.value)}
              placeholder="E.g., Key concepts of Medical.json"
              className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-teal-500 transition-shadow text-white placeholder-gray-500"
              onKeyDown={(e) => e.key === "Enter" && handleMindmapGenerate()}
            />
            <button
              onClick={handleMindmapGenerate}
              disabled={!mindmapTopic.trim() || mindmapLoading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-lg shadow-teal-900/60"
            >
              {mindmapLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Mindmap...
                </span>
              ) : (
                "Generate Mind Map"
              )}
            </button>
            <button
              onClick={() => setShowMindmapCreateModal(false)}
              className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all duration-200 transform hover:scale-[1.01] text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showBriefingModal && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md">
          <div className="bg-[#10141A] border border-teal-500/30 rounded-2xl p-8 w-[450px] space-y-5 shadow-2xl shadow-teal-900/40">
            <h3 className="text-2xl text-teal-400 font-bold border-b border-gray-700/50 pb-3">
              Generate Briefing
            </h3>
            <p className="text-sm text-gray-400">
              Enter the topic for which you want to generate an AI-powered
              briefing summary.
            </p>
            <input
              value={briefingTopic}
              onChange={(e) => setBriefingTopic(e.target.value)}
              placeholder="E.g., Healthcare innovation trends"
              className="w-full px-4 py-3 bg-[#1A1D24] border border-white/10 rounded-xl text-base outline-none focus:ring-2 focus:ring-teal-500 transition-shadow text-white placeholder-gray-500"
              onKeyDown={(e) => e.key === "Enter" && handleBriefingGenerate()}
            />
            <button
              onClick={handleBriefingGenerate}
              disabled={!briefingTopic.trim() || briefingLoading}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-base font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01] shadow-lg shadow-teal-900/60"
            >
              {briefingLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Generating Briefing...
                </span>
              ) : (
                "Generate Briefing"
              )}
            </button>
            <button
              onClick={() => setShowBriefingModal(false)}
              className="w-full py-3 rounded-xl bg-[#21252C] hover:bg-[#343A45] text-base transition-all duration-200 transform hover:scale-[1.01] text-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {showFAQModal &&
        renderInputModal(
          "Generate FAQ",
          "E.g., Common questions about healthcare AI",
          faqTopic,
          setFAQTopic,
          handleFAQGenerate,
          () => setShowFAQModal(false),
          faqLoading
        )}
      {showComparativeModal &&
        renderInputModal(
          "Generate Comparative Analysis",
          "E.g., Compare machine learning models in medicine",
          comparativeTopic,
          setComparativeTopic,
          handleComparativeGenerate,
          () => setShowComparativeModal(false),
          comparativeLoading
        )}
      {showTutorialModal &&
        renderInputModal(
          "Generate Tutorial",
          "E.g., How to use AI tools in diagnostics",
          tutorialTopic,
          setTutorialTopic,
          handleTutorialGenerate,
          () => setShowTutorialModal(false),
          tutorialLoading
        )}
      {showReportModal &&
        renderInputModal(
          "Generate Technical Report",
          "E.g., Deep dive on AI-powered diagnosis",
          reportTopic,
          setReportTopic,
          handleReportGenerate,
          () => setShowReportModal(false),
          reportLoading
        )}
      {showBlogModal &&
        renderInputModal(
          "Generate Blog Post",
          "E.g., Future of AI in healthcare",
          blogTopic,
          setBlogTopic,
          handleBlogGenerate,
          () => setShowBlogModal(false),
          blogLoading
        )}
      {showStudyModal &&
        renderInputModal(
          "Generate Study Guide",
          "E.g., Study materials for medical AI ethics",
          studyTopic,
          setStudyTopic,
          handleStudyGenerate,
          () => setShowStudyModal(false),
          studyLoading
        )}

      <AnswerModal tool={faq} title="FAQ Result" />
      <AnswerModal tool={comparative} title="Comparison Result" />
      <AnswerModal tool={tutorial} title="Tutorial Result" />
      <AnswerModal tool={report} title="Technical Report Result" />
      <AnswerModal tool={blog} title="Blog Result" />
      <AnswerModal tool={study} title="Study Guide Result" />
      <AnswerModal tool={briefing} title="Briefing Result" />
    </div>
  );
}
