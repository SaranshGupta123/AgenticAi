import React, { useEffect, useState } from "react";
import { fetchDomains, selectDomain } from "../api/api";
import { FolderOpen, PlusCircle, RefreshCw } from "lucide-react";

export default function NotebookHome({ goBack, openNotebook }) {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const FALLBACK = ["Sample Notebook", "My Notes", "Learning Journal"];

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
    <div className="h-screen w-screen bg-[#0E1116] text-white flex flex-col">
      <header className="flex items-center justify-between px-10 py-6 shadow-xl border-b border-[#1C2129] bg-[#14171C]/80 backdrop-blur-xl">
        <h1 className="text-xl font-semibold tracking-wide text-teal-400 drop-shadow">
          Notebook Home
        </h1>

        <button
          onClick={goBack}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 transition-colors text-sm font-medium shadow-md"
        >
          Back to Agentic
        </button>
      </header>

      {alertMsg && (
        <div className="fixed top-6 right-6 bg-teal-700 px-4 py-2 rounded-xl shadow-lg text-sm animate-fade-in">
          {alertMsg}
        </div>
      )}

      <div className="flex-1 px-12 py-10 overflow-y-auto">
        <div className="mb-10">
          <h2 className="text-3xl font-semibold text-white/90">
            Welcome back 👋
          </h2>
          <p className="text-gray-400 mt-1">
            Select a notebook to continue working.
          </p>

          <button
            onClick={handleFetch}
            className="mt-4 px-4 py-2 text-sm flex items-center space-x-2 
              bg-[#1A1F25] border border-[#222830] 
              hover:border-teal-500 hover:bg-[#1E242C] 
              rounded-xl transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Refreshing…" : "Fetch Domains"}</span>
          </button>

          {fetchError && (
            <p className="text-red-400 mt-3 text-sm">
              ⚠ Failed to reach server – showing local cache
            </p>
          )}
        </div>

        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          <div
            onClick={() => openNotebook("Demo Notebook")}
            className="h-48 bg-[#14171C] border border-[#1F242C] rounded-2xl p-5 cursor-pointer
                       hover:bg-[#1A1F25] hover:border-teal-500 hover:scale-[1.02]
                       transition-all duration-300 shadow-lg group"
          >
            <div className="p-3 bg-teal-500/20 rounded-xl inline-flex items-center justify-center">
              <PlusCircle className="w-6 h-6 text-teal-400" />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
              Demo Notebook
            </h3>
            <p className="text-gray-400 text-sm mt-1">
              A sample notebook to explore.
            </p>
          </div>

          {domains.length > 0 &&
            domains.map((domain) => (
              <div
                key={domain}
                onClick={() => handleOpen(domain)}
                className="h-48 bg-[#14171C] border border-[#1F242C] rounded-2xl p-5 cursor-pointer
                           hover:bg-[#1A1F25] hover:border-teal-500 hover:scale-[1.02]
                           transition-all duration-300 shadow-lg group"
              >
                <div className="p-3 bg-teal-500/20 rounded-xl inline-flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-teal-400" />
                </div>

                <h3 className="mt-4 text-lg font-semibold text-white group-hover:text-teal-400 transition-colors">
                  {domain}
                </h3>
                <p className="text-gray-400 text-sm mt-1">Open this notebook</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
