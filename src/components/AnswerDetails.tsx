import React from "react";

export default function AnswerDetails({ answer }: { answer: any }) {
  if (!answer) return null;

  const { metadata, sources, citations, quality_metrics } = answer;

  return (
    <div className="mt-6 space-y-6">
      {metadata && (
        <div className="p-4 border border-white/20 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Metadata</h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
            {Object.entries(metadata).map(([key, value]) => (
              <div key={key}>
                <span className="text-gray-400">{key}: </span>
                {String(value)}
              </div>
            ))}
          </div>
        </div>
      )}
      {sources?.length > 0 && (
        <div className="p-4 border border-white/20 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Sources</h3>
          <div className="space-y-3 text-xs text-gray-300">
            {sources.map((src: any, i: number) => (
              <div
                key={i}
                className="p-2 bg-[#2B2F36] rounded border border-white/10"
              >
                <p>
                  <b>{src.source}</b> {src.page && `(page ${src.page})`}
                </p>
                {src.snippet || src.content_snippet ? (
                  <p className="italic mt-1">
                    "{src.snippet ?? src.content_snippet}"
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
      {citations?.length > 0 && (
        <div className="p-4 border border-yellow-600/30 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Citations</h3>
          <div className="space-y-3 text-xs text-gray-300">
            {citations.map((c: any, i: number) => (
              <div
                key={i}
                className="p-2 bg-[#2E2E2E] rounded border border-white/10"
              >
                <p>
                  <b>Document:</b> {c.doc_id}
                </p>
                {c.page && (
                  <p>
                    <b>Page:</b> {c.page}
                  </p>
                )}
                {c.cited_text && (
                  <p className="italic mt-1">"{c.cited_text}"</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {quality_metrics && (
        <div className="p-4 border border-green-600/30 rounded-lg">
          <h3 className="text-white font-semibold mb-3">Quality Metrics</h3>
          <div className="text-xs text-gray-300 space-y-1">
            {Object.entries(quality_metrics).map(([key, value]) => (
              <p key={key}>
                <span className="text-gray-400">{key}</span>: {String(value)}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
