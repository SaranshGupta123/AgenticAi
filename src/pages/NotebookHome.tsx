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
      <header className="flex items-center justify-between px-10 py-6 shadow-xl border-b border-[#1C1C20] bg-[#0D1117]/80 backdrop-blur-xl">
        <h1 className="text-xl font-semibold tracking-wide text-gray-300 drop-shadow">
          Notebook Home
        </h1>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleFetch}
            className="px-4 py-2 text-sm flex items-center space-x-2 
              bg-[#1A1A1D] border border-[#2A2A30]
              hover:bg-[#121216] hover:border-[#4A4A55]
              rounded-xl transition-all shadow-md"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Refreshing…" : "Fetch Domains"}</span>
          </button>

          <button
            onClick={goBack}
            className="px-4 py-2 rounded-xl bg-[#1A1A1D] hover:bg-[#121216]
              transition-colors text-sm font-medium shadow-md border border-[#2A2A30]"
          >
            Back to Agentic
          </button>
        </div>
      </header>

      {alertMsg && (
        <div className="fixed top-6 right-6 bg-[#1A1A1D] border border-gray-600 px-4 py-2 rounded-xl shadow-lg text-sm animate-fade-in">
          {alertMsg}
        </div>
      )}

      <div className="flex-1 px-12 py-10 overflow-y-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-gray-200">
            Welcome back 👋
          </h2>
          <p className="text-gray-500 mt-1">
            Select a notebook to continue working.
          </p>

          {fetchError && (
            <p className="text-red-400 mt-3 text-sm">
              ⚠ Failed to reach server – showing local cache
            </p>
          )}
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <div
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
          </div>

          {domains.length > 0 &&
            domains.map((domain, index) => {
              const Icon = CARD_ICONS[index % CARD_ICONS.length];
              const bg = CARD_COLORS[index % CARD_COLORS.length];

              return (
                <div
                  key={domain}
                  onClick={() => handleOpen(domain)}
                  style={{ backgroundColor: bg }}
                  className="h-48 border border-[#252530] rounded-2xl p-5 cursor-pointer
                             hover:scale-[1.03] hover:border-gray-500
                             transition-all duration-300 shadow-lg group"
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
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
