import React, { useEffect, useState } from "react";
import { fetchDomains, selectDomain } from "../api/api";
export default function NotebookHome({ goBack, openNotebook }) {
  const [domains, setDomains] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  const DUMMY_DOMAINS = ["Sample Notebook", "My Notes", "Learning Journal"];

  const handleFetch = async () => {
    setLoading(true);
    setFetchError(false);

    try {
      const data = await fetchDomains();
      const newList = Array.isArray(data?.available_domains)
        ? data.available_domains
        : [];

      const merged = Array.from(new Set([...domains, ...newList]));

      setDomains(merged);
      localStorage.setItem("notebook_domains", JSON.stringify(merged));
    } catch {
      const merged = Array.from(new Set([...domains, ...DUMMY_DOMAINS]));
      setDomains(merged);
      localStorage.setItem("notebook_domains", JSON.stringify(merged));
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = localStorage.getItem("notebook_domains");

    if (cached) {
      setDomains(JSON.parse(cached));
    } else {
      setDomains(DUMMY_DOMAINS);
      localStorage.setItem("notebook_domains", JSON.stringify(DUMMY_DOMAINS));
    }
  }, []);

  // const handleOpen = async (domain: string) => {
  //   try {
  //     const res = await fetch(`/api/rag/api/rag/select-domain`, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ domain_name: domain }),
  //     });

  //     const result = await res.json();
  //     setAlertMsg(result?.message || "✅ Domain Selected");
  //     setTimeout(() => setAlertMsg(null), 3000);

  //     openNotebook(domain);
  //   } catch {
  //     setAlertMsg("❌ Failed to switch domain");
  //     setTimeout(() => setAlertMsg(null), 3000);
  //   }
  // };

  const handleOpen = async (domain: string) => {
    try {
      const result = await selectDomain(domain);

      setAlertMsg(result?.message || `✅ Switched to ${domain}`);
      setTimeout(() => setAlertMsg(null), 1500);

      // ✅ NOW NAVIGATE
      openNotebook(domain);
    } catch (err) {
      console.error("Domain Switch Error:", err);
      setAlertMsg("❌ Failed to switch domain");
      setTimeout(() => setAlertMsg(null), 3000);
    }
  };

  return (
    <div className="h-screen w-screen bg-[#1B1F24] text-white flex flex-col">
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <h1 className="text-xl font-semibold tracking-wide">NotebookLM</h1>
        <button
          onClick={goBack}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition-colors text-sm font-medium"
        >
          Return to Agentic
        </button>
      </header>

      {alertMsg && (
        <div className="fixed top-6 right-6 bg-green-600 px-4 py-2 rounded-lg shadow-lg text-sm animate-fade">
          {alertMsg}
        </div>
      )}

      <div className="flex-1 overflow-auto px-12 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-400 text-sm">Your Notebooks</h2>

          <button
            onClick={handleFetch}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-500 rounded-lg"
          >
            {loading ? "Fetching…" : "Fetch Domains"}
          </button>
        </div>

        {domains.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div
              onClick={() => openNotebook("dummy_notebook")}
              className="h-44 rounded-2xl border border-dashed border-gray-400 bg-[#252A32] p-4 cursor-pointer hover:border-blue-400 hover:bg-[#2F343C] transition-all"
            >
              <p className="font-medium text-blue-300">Demo Notebook</p>
              <p className="text-xs text-gray-400 mt-2">
                This is a sample notebook. Click to open.
              </p>
            </div>

            {domains.map((domain) => (
              <div
                key={domain}
                onClick={() => handleOpen(domain)}
                className="h-44 rounded-2xl border border-gray-600 bg-[#23272E] p-4 cursor-pointer hover:border-blue-500 hover:bg-[#2A2F37] transition-all"
              >
                <p className="font-medium">{domain}</p>
                <p className="text-xs text-gray-400 mt-2">
                  Click to open this domain
                </p>
              </div>
            ))}

            {fetchError && (
              <div className="h-44 rounded-2xl border border-red-600 bg-[#2C1F1F] p-4 text-red-300 flex flex-col justify-center">
                <p className="font-medium">Error fetching data</p>
                <p className="text-xs mt-2 text-red-400">
                  Server did not respond
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
