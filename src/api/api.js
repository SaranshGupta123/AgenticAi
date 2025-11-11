// const BASE_URL =
//   "https://see-qualifications-parallel-reaches.trycloudflare.com";

const BASE_URL = "  https://eb974b7a5ea5.ngrok-free.app";

export async function fetchChatResponse(query) {
  try {
    console.log("📤 Sending query to backend:", query);

    const url = `${BASE_URL}/rag/api/rag/chat-query`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        query,
        use_crag: false,
        agent_type: "react",
        include_steps: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Raw Chat API Response:", data);

    return {
      answer: data.final_answer ?? data.answer ?? "",
      steps: data.agent_steps ?? [],
      evaluation: data.evaluation_metrics ?? {},
      metadata: data.metadata ?? {},
      agent_type: data.agent_type ?? "react",
      user_query: query,
    };
  } catch (error) {
    console.error("🚨 fetchChatResponse Error:", error);
    throw error;
  }
}

export async function fetchExplainabilityChatResponse(query) {
  try {
    console.log("📤 Sending explainability chat query:", query);

    const url = `${BASE_URL}/rag/api/rag/chat-query-with-explainability?query=${encodeURIComponent(
      query
    )}&agent_type=react&include_steps=true&use_crag=false`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Explainability Chat Response:", data);
    return { ...data, user_query: query };
  } catch (error) {
    console.error("🚨 fetchExplainabilityChatResponse Error:", error);
    throw error;
  }
}

export async function fetchDomains() {
  try {
    console.log("📡 Fetching domains...");

    const url = `${BASE_URL}/rag/api/rag/domains`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Domain API Response:", data);
    return data;
  } catch (err) {
    console.error("🚨 fetchDomains Error:", err);
    throw err;
  }
}
export async function selectDomain(domainName) {
  const res = await fetch(`${BASE_URL}/rag/api/rag/select-domain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    body: JSON.stringify({ domain_name: domainName }),
  });

  if (!res.ok) throw new Error("Failed to select domain");
  return res.json();
}
export async function askRagQuestion(query, generateMindmap = false) {
  const url = `${BASE_URL}/rag/api/rag/doc_question?query=${encodeURIComponent(
    query
  )}&generate_mindmap=${generateMindmap ? "true" : "false"}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!res.ok) throw new Error("RAG request failed");
  const data = await res.json();

  return {
    answer: data.answer ?? "",
    // ✅ FIXED HERE
    retrieved_context:
      data.retrieved_context ?? data.context ?? data.sources ?? [],
    metadata: {
      active_domain: data.domain ?? data.active_domain ?? "Unknown",
      query,
      total_time: data.latency ?? data.time_taken ?? "N/A",
    },
    mindmap: data.mindmap ?? null,
  };
}

// export async function generateMindmap(topic) {
//   const res = await fetch(`${BASE_URL}/rag/api/rag/mindmap/full_vectorstore`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       topic,
//       num_documents: 20,
//       depth_preference: "balanced",
//     }),
//   });

//   if (!res.ok) throw new Error("Mindmap generation failed");
//   return res.json();
// }

export async function fetchLocalNotebookData(notebookName) {
  try {
    const res = await fetch(`/data/${notebookName}.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.error("⚠️ fetchLocalNotebookData Error:", err);
    return null;
  }
}

export async function generateMindmap(topic) {
  console.log("📁 Loading mindmap.json from public/data...");

  try {
    const res = await fetch(`/data/mindmap.json`);
    if (!res.ok) throw new Error("mindmap.json not found in /public/data");

    const data = await res.json();
    console.log("✅ Loaded Local Mindmap:", data);
    return data;
  } catch (err) {
    console.error("❌ Local Mindmap Load Error:", err);
    throw err;
  }
}

export async function fetchFAQ() {
  const res = await fetch("/data/faq.json");
  return res.json();
}

export async function fetchComparativeAnalysis() {
  const res = await fetch("/data/comparative_analysis.json");
  return res.json();
}

async function loadJSON(name) {
  const res = await fetch(`/data/${name}.json`);
  if (!res.ok) throw new Error(`${name}.json not found`);
  return res.json();
}

export const fetchTutorial = () => loadJSON("tutorial");
export const fetchTechnicalReport = () => loadJSON("technical_report");
export const fetchBlogPost = () => loadJSON("blog_post");
export const fetchStudyGuide = () => loadJSON("study_guide");
export const fetchBriefing = () => loadJSON("briefing");

export async function fetchDeepResearchResponse(query) {
  try {
    console.log("🔍 Sending deep research query:", query);

    const url = `${BASE_URL}/rag/api/rag/deep-research`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true", // ✅ REQUIRED FOR NGROK
      },
      body: JSON.stringify({
        query: query, // ✅ REQUIRED FIELD
        use_crag: false,
        agent_type: "deep_research",
        include_steps: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ HTTP Error:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Deep Research API Response:", data);

    return {
      answer: data.final_answer ?? data.answer ?? "",
      steps: data.agent_steps ?? [],
      evaluation: data.evaluation_metrics ?? {},
      metadata: data.metadata ?? {},
      agent_type: data.agent_type ?? "deep_research",
      user_query: query,
    };
  } catch (error) {
    console.error("🚨 fetchDeepResearchResponse Error:", error);
    throw error;
  }
}
