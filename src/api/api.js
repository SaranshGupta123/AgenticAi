const BASE_URL = "https://123ae95f82ef.ngrok-free.app";
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
        "ngrok-skip-browser-warning": "true",
      },
      body: JSON.stringify({
        query: query,
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

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};

async function handleResponse(response, type) {
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ ${type} API Error:`, errorText);
    throw new Error(`Request failed with status ${response.status}`);
  }

  const data = await response.json();
  console.log(`✅ ${type} API Response:`, data);
  return data;
}

export async function fetchBriefingFromAPI(domain, topic) {
  const cleanTopic = topic?.trim() || "AI developments overview";
  console.log("📤 Fetching briefing for:", cleanTopic);

  const url = `${BASE_URL}/rag/api/rag/generate/briefing?topic=${encodeURIComponent(
    cleanTopic
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      tone: "professional",
      target_audience: "executives",
      num_sources: 5,
      include_citations: true,
      multi_stage: false,
    }),
  });

  const data = await handleResponse(response, "Briefing");
  return formatResponse(data, domain);
}

export async function fetchFAQFromAPI(domain, topic) {
  const cleanTopic = topic?.trim() || "Frequently Asked Questions";
  console.log("📤 Fetching FAQ for:", cleanTopic);

  const url = `${BASE_URL}/rag/api/rag/generate/faq?topic=${encodeURIComponent(
    cleanTopic
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      tone: "informative",
      target_audience: "general",
      num_sources: 5,
      include_citations: true,
      multi_stage: false,
    }),
  });

  const data = await handleResponse(response, "FAQ");
  return formatResponse(data, domain);
}

export async function fetchComparativeAnalysisFromAPI(domain, topic) {
  const cleanTopic = topic?.trim() || "Comparison Study";
  console.log("📤 Fetching Comparative Analysis for:", cleanTopic);

  const url = `${BASE_URL}/rag/api/rag/generate/comparative-analysis?topic=${encodeURIComponent(
    cleanTopic
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      tone: "analytical",
      target_audience: "researchers",
      num_sources: 5,
      include_citations: true,
      multi_stage: false,
    }),
  });

  const data = await handleResponse(response, "Comparative Analysis");
  return formatResponse(data, domain);
}

export async function fetchTutorialFromAPI(domain, topic) {
  const cleanTopic = topic?.trim() || "Step-by-Step Tutorial";
  console.log("📤 Fetching Tutorial for:", cleanTopic);

  const url = `${BASE_URL}/rag/api/rag/generate/tutorial?topic=${encodeURIComponent(
    cleanTopic
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      tone: "educational",
      target_audience: "students",
      num_sources: 5,
      include_citations: true,
      multi_stage: false,
    }),
  });

  const data = await handleResponse(response, "Tutorial");
  return formatResponse(data, domain);
}

export async function fetchTechnicalReportFromAPI(domain, topic) {
  const cleanTopic = topic?.trim() || "Technical Summary";
  console.log("📤 Fetching Technical Report for:", cleanTopic);

  const url = `${BASE_URL}/rag/api/rag/generate/technical-report?topic=${encodeURIComponent(
    cleanTopic
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      tone: "formal",
      target_audience: "engineers",
      num_sources: 5,
      include_citations: true,
      multi_stage: false,
    }),
  });

  const data = await handleResponse(response, "Technical Report");
  return formatResponse(data, domain);
}

export async function fetchBlogPostFromAPI(domain, topic) {
  const cleanTopic = topic?.trim() || "Blog Post";
  console.log("📤 Fetching Blog Post for:", cleanTopic);

  const url = `${BASE_URL}/rag/api/rag/generate/blog-post?topic=${encodeURIComponent(
    cleanTopic
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      tone: "conversational",
      target_audience: "general",
      num_sources: 5,
      include_citations: false,
      multi_stage: false,
    }),
  });

  const data = await handleResponse(response, "Blog Post");
  return formatResponse(data, domain);
}

export async function fetchStudyGuideFromAPI(domain, topic) {
  const cleanTopic = topic?.trim() || "Study Material";
  console.log("📤 Fetching Study Guide for:", cleanTopic);

  const url = `${BASE_URL}/rag/api/rag/generate/study-guide?topic=${encodeURIComponent(
    cleanTopic
  )}`;
  const response = await fetch(url, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      tone: "educational",
      target_audience: "students",
      num_sources: 5,
      include_citations: true,
      multi_stage: false,
    }),
  });

  const data = await handleResponse(response, "Study Guide");
  return formatResponse(data, domain);
}

function formatResponse(data, domain) {
  return {
    answer: data.content ?? data.answer ?? "",
    retrieved_context: data.sources ?? data.retrieved_context ?? [],
    metadata: {
      active_domain: data.metadata?.source_domain ?? domain,
      total_time: data.metadata?.total_time ?? "N/A",
    },
    mindmap: data.mindmap ?? null,
  };
}

export async function fetchNotebookAnswerFromAPI(domain, question) {
  try {
    console.log("📡 Fetching notebook answer from API:", question);

    const url = `${BASE_URL}/rag/api/rag/doc_question?query=${encodeURIComponent(
      question
    )}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Notebook API Error:", errorText);
      throw new Error(`Request failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Notebook API Response:", data);

    return {
      answer: data.answer ?? "",
      retrieved_context:
        data.retrieved_context ?? data.context ?? data.sources ?? [],
      metadata: {
        active_domain: data.domain ?? data.active_domain ?? domain,
        query: question,
        total_time: data.latency ?? data.time_taken ?? "N/A",
      },
      mindmap: data.mindmap ?? null,
    };
  } catch (err) {
    console.error("🚨 fetchNotebookAnswerFromAPI Error:", err);
    throw err;
  }
}
