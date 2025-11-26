import React, { useEffect, useState } from "react";
import { fetchDomains, selectDomain } from "../api/api";
import {
  FolderTree,
  FileText,
  BookOpen,
  BookMarked,
  NotebookPen,
  PlusCircle,
  RefreshCw,
} from "lucide-react";

import { motion } from "framer-motion";

export default function NotebookHome({ goBack, openNotebook }) {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const CARD_COLORS = [
    "#0B0C10",
    "#16213E",
    "#2A0F36",
    "#1F2421",
    "#2C1A47",
    "#112D32",
  ];

  const CARD_ICONS = [BookOpen, FileText, BookMarked, NotebookPen, FolderTree];

  const handleFetch = async () => {
    setLoading(true);
    setFetchError(false);

    try {
      const data = await fetchDomains();
      const list = Array.isArray(data?.available_domains)
        ? data.available_domains
        : [];

      setDomains(list);
      localStorage.setItem("notebook_domains", JSON.stringify(list));
    } catch {
      setDomains([]);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("notebook_domains");
    const parsed = cached ? JSON.parse(cached) : [];
    setDomains(Array.isArray(parsed) ? parsed : []);
  }, []);

  const handleOpen = async (domain: string) => {
    try {
      const result = await selectDomain(domain);

      setAlertMsg(result?.message || `Switched to ${domain}`);
      setTimeout(() => setAlertMsg(null), 1800);

      openNotebook(domain);
    } catch {
      setAlertMsg("Failed to switch domain");
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#0A0A0C] text-white flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center justify-between px-10 py-6 shadow-xl border-b border-[#1C1C20] bg-[#0D1117]/80 backdrop-blur-xl"
      >
        <h1 className="text-xl font-semibold tracking-wide text-gray-300 drop-shadow">
          Notebook Home
        </h1>

        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.25 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={goBack}
          className="px-4 py-2 rounded-xl bg-[#1A1A1D] hover:bg-[#121216]
            transition-colors text-sm font-medium shadow-md 
            border border-[#2A2A30]"
        >
          Back to Agentic
        </motion.button>
      </motion.header>

      {alertMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 10 }}
          exit={{ opacity: 0 }}
          className="fixed top-24 right-6 
                     bg-[#2A2424] text-red-300 
                     border border-red-500/40 
                     px-4 py-2 rounded-xl shadow-lg text-sm"
        >
          {alertMsg}
        </motion.div>
      )}

      <div className="flex-1 px-12 py-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <h2 className="text-3xl font-semibold text-gray-200 flex items-center">
            Welcome back 👋
            <div className="relative group cursor-pointer ml-3">
              <div
                className="peer w-5 h-5 flex items-center justify-center
                  bg-[#1A1D21] border border-[#2A2D33]
                  rounded-full text-xs text-gray-300
                  hover:bg-[#15171A] transition-all"
              >
                i
              </div>

              <div
                className="absolute left-1/2 -translate-x-1/2 mt-2 w-72 opacity-0 pointer-events-none
                 group-hover:opacity-100 
                 bg-[#0E1114] border border-[#2A2D33] text-gray-300 
                 text-xs p-4 rounded-lg shadow-xl leading-relaxed z-40"
              >
                <h5>Check available domain databases</h5>
                • Select any domain you want to work with <br />• If the domain
                isn't available, use the
                <span
                  className="ml-1 px-2 py-0.5 bg-[#1A1D21] 
                  border border-[#31343A] rounded-md text-gray-200"
                >
                  Fetch Domains
                </span>
                button <br />• All future queries use the selected domain until
                switched
              </div>
            </div>
          </h2>

          <p className="text-gray-500 mt-1">
            Select a notebook to continue working.
          </p>

          <div className="flex justify-start mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleFetch}
              className="px-4 py-2 text-sm flex items-center space-x-2
                bg-[#2A2E33] border border-[#3A3F45]
                hover:bg-[#1D2126] hover:border-[#5A5F66]
                rounded-xl transition-all shadow-md"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>{loading ? "Refreshing…" : "Fetch Domains"}</span>
            </motion.button>

            <div className="relative ml-2 cursor-pointer group">
              <div
                className="w-5 h-5 flex items-center justify-center 
                bg-[#1A1D21] border border-[#2A2D33] 
                rounded-full text-xs text-gray-300
                hover:bg-[#15171A] transition-all
                 mt-2"
              >
                i
              </div>

              <div
                className="absolute left-0 mt-2 min-w-[18rem] opacity-0 pointer-events-none
                group-hover:opacity-100 transition-all bg-[#0E1114]
                border border-[#2A2D33] text-gray-300 text-xs p-4 
                rounded-lg shadow-xl leading-relaxed z-40"
              >
                <h5>Select which domain database to use</h5>
                • Lists all domain folders found in dataset/ <br />
                • Shows which domain is currently active <br />• Shows which
                domains are initialized (vector stores)
              </div>
            </div>
          </div>

          {fetchError && (
            <p className="text-red-400 mt-3 text-sm">
              ⚠ Failed to reach server – showing local cache
            </p>
          )}
        </motion.div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 mt-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openNotebook("Demo Notebook")}
            className="h-48 bg-[#0D1117] border border-[#1F242C] rounded-2xl p-5 cursor-pointer
                       hover:scale-[1.03] hover:border-gray-500 hover:bg-[#10141A]
                       transition-all duration-300 shadow-lg group"
          >
            <div className="p-3 bg-[#ffffff10] rounded-xl inline-flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-gray-300" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-gray-300 transition-colors">
              Demo Notebook
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              A sample notebook to explore.
            </p>
          </motion.div>

          {domains.length > 0 &&
            domains.map((domain, index) => {
              const Icon = CARD_ICONS[index % CARD_ICONS.length];
              const bg = CARD_COLORS[index % CARD_COLORS.length];

              return (
                <motion.div
                  key={domain}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 + index * 0.05 }}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpen(domain)}
                  style={{ backgroundColor: bg }}
                  className="h-48 border border-[#252530] rounded-2xl p-5 cursor-pointer
                             hover:scale-[1.03] hover:border-gray-500
                             transition-all duration-300 shadow-lg relative"
                >
                  <div className="p-3 bg-[#ffffff10] rounded-xl inline-flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-300" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-gray-300 transition-colors">
                    {domain}
                  </h3>
                  <p className="text-gray-500 text-sm mt-1">
                    Open this notebook
                  </p>

                  <div
                    className="absolute top-3 right-3 group cursor-pointer z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="w-5 h-5 flex items-center justify-center 
                      bg-[#1A1D21] border border-[#2A2D33] 
                      rounded-full text-xs text-gray-300
                      hover:bg-[#15171A] transition-all"
                    >
                      i
                    </div>

                    <div
                      className="absolute right-0 mt-2 min-w-[16rem] opacity-0 pointer-events-none
                      group-hover:opacity-100 transition-all bg-[#0E1114]
                      border border-[#2A2D33] text-gray-300 text-xs p-3 
                      rounded-lg shadow-xl leading-relaxed z-50"
                    >
                      <strong className="text-gray-200">Domain:</strong>
                      {domain}
                      <br />
                      <br />
                      <span className="text-gray-400">
                        <h5>
                          Generate embeddings and create vector database for a
                          domain
                        </h5>
                        • Processes all PDFs in dataset/{domain}/
                        <br />• Creates vector store in database/chromadb/
                        {domain}/
                        <br />• Automatically sets this domain as active
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
