import React, { useState } from "react";
import { analyseURL } from "../../api/api";

export default function AnalyseModal({ close, onCreate }) {
  const [url, setUrl] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!url.trim()) return;

    setLoading(true);
    const result = await analyseURL(url, question);
    setLoading(false);

    const session = {
      id: Date.now(),
      url,
      question,
      content: result.content || "",
      createdAt: new Date().toLocaleString(),
    };

    const existing = JSON.parse(
      localStorage.getItem("analyse_sessions") || "[]"
    );
    localStorage.setItem(
      "analyse_sessions",
      JSON.stringify([session, ...existing])
    );

    onCreate(session);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-lg w-full">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Create URL Analysis Session
        </h2>

        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Enter URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded mb-3"
          placeholder="Optional Question..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={close} className="px-4 py-2 border rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {loading ? "Processing..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
