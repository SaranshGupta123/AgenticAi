export const BASE_URL = "https://4b57cf056170.ngrok-free.app";

const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
};
async function apiRequest(method, route, body = null, type = "API") {
  try {
    const res = await fetch(`${BASE_URL}${route}`, {
      method,
      headers: defaultHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`❌ ${type} Error:`, errText);
      throw new Error(`Request failed (${res.status})`);
    }

    const data = await res.json();
    console.log(`✅ ${type} Response:`, data);
    return data;
  } catch (err) {
    console.error(`🚨 ${type} Exception:`, err);
    throw err;
  }
}

const apiGet = (route, type) => apiRequest("GET", route, null, type);
const apiPost = (route, body, type) => apiRequest("POST", route, body, type);

function formatResponse(data, fallbackDomain) {
  return {
    answer: data.content ?? data.answer ?? "",
    retrieved_context: data.sources ?? data.retrieved_context ?? [],
    metadata: {
      active_domain: data.metadata?.source_domain ?? fallbackDomain,
      total_time: data.metadata?.total_time ?? "N/A",
    },
    mindmap: data.mindmap ?? null,
  };
}
export async function fetchChatResponse(query) {
  const body = {
    query,
    use_crag: false,
    agent_type: "react",
    include_steps: true,
  };

  const data = await apiPost("/rag/api/rag/chat-query", body, "Chat Query");

  return {
    answer:
      data.final_answer ??
      data.answer ??
      data.final_decision ??
      data.final_decision_text ??
      data.report ??
      data.summary ??
      JSON.stringify(data, null, 2),
    steps: data.agent_steps ?? [],
    evaluation: data.evaluation_metrics ?? {},
    metadata: data.metadata ?? {},
    agent_type: data.agent_type ?? "react",
    user_query: query,
  };
}

export async function fetchExplainabilityChatResponse(query) {
  const route = `/rag/api/rag/chat-query-with-explainability?query=${encodeURIComponent(
    query
  )}&agent_type=react&include_steps=true&use_crag=false`;

  const data = await apiPost(route, null, "Explainability Chat");
  return { ...data, user_query: query };
}
export const fetchDomains = () =>
  apiGet("/rag/api/rag/domains", "Fetch Domains");

export const selectDomain = (domain) =>
  apiPost(
    "/rag/api/rag/select-domain",
    { domain_name: domain },
    "Select Domain"
  );
export async function fetchNotebookAnswerFromAPI(domain, question) {
  const route = `/rag/api/rag/doc_question?query=${encodeURIComponent(
    question
  )}`;

  const data = await apiPost(route, null, "Notebook Question");

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
}
export async function fetchDeepResearchResponse(query) {
  const body = {
    query: query,
    agent_type: "deep_research",
    include_steps: true,
    use_crag: false,
  };

  const data = await apiPost(
    "/rag/api/rag/deep-research",
    body,
    "Deep Research"
  );

  return {
    answer:
      data.final_answer ??
      data.answer ??
      data.final_decision ??
      data.final_decision_text ??
      "No answer.",
    steps: data.agent_steps ?? [],
    evaluation: data.evaluation_metrics ?? {},
    metadata: data.metadata ?? {},
    agent_type: data.agent_type ?? "deep_research",
    user_query: query,
  };
}

function generatorConfig(tone, audience) {
  return {
    tone,
    target_audience: audience,
    num_sources: 5,
    include_citations: true,
    multi_stage: false,
  };
}
export const fetchFAQFromAPI = (domain, topic) =>
  apiPost(
    `/rag/api/rag/generate/faq?topic=${encodeURIComponent(
      topic?.trim() || "FAQ"
    )}`,
    generatorConfig("informative", "general"),
    "FAQ"
  ).then((d) => formatResponse(d, domain));

export const fetchComparativeAnalysisFromAPI = (domain, topic) =>
  apiPost(
    `/rag/api/rag/generate/comparative-analysis?topic=${encodeURIComponent(
      topic?.trim() || "Comparison Study"
    )}`,
    generatorConfig("analytical", "researchers"),
    "Comparative Analysis"
  ).then((d) => formatResponse(d, domain));

export const fetchTutorialFromAPI = (domain, topic) =>
  apiPost(
    `/rag/api/rag/generate/tutorial?topic=${encodeURIComponent(
      topic?.trim() || "Tutorial"
    )}`,
    generatorConfig("educational", "students"),
    "Tutorial"
  ).then((d) => formatResponse(d, domain));

export const fetchTechnicalReportFromAPI = (domain, topic) =>
  apiPost(
    `/rag/api/rag/generate/technical-report?topic=${encodeURIComponent(
      topic?.trim() || "Technical Report"
    )}`,
    generatorConfig("formal", "engineers"),
    "Technical Report"
  ).then((d) => formatResponse(d, domain));

export const fetchBlogPostFromAPI = (domain, topic) =>
  apiPost(
    `/rag/api/rag/generate/blog-post?topic=${encodeURIComponent(
      topic?.trim() || "Blog Post"
    )}`,
    {
      ...generatorConfig("conversational", "general"),
      include_citations: false,
    },
    "Blog Post"
  ).then((d) => formatResponse(d, domain));

export const fetchStudyGuideFromAPI = (domain, topic) =>
  apiPost(
    `/rag/api/rag/generate/study-guide?topic=${encodeURIComponent(
      topic?.trim() || "Study Guide"
    )}`,
    generatorConfig("educational", "students"),
    "Study Guide"
  ).then((d) => formatResponse(d, domain));

export const fetchBriefingFromAPI = (domain, topic) =>
  apiPost(
    `/rag/api/rag/generate/briefing?topic=${encodeURIComponent(
      topic?.trim() || "Briefing"
    )}`,
    generatorConfig("professional", "executives"),
    "Briefing"
  ).then((d) => formatResponse(d, domain));

export async function fetchMindmapFromAPI(topic = "General") {
  const route = `/rag/api/rag/mindmap/full_vectorstore?topic=${encodeURIComponent(
    topic
  )}&max_nodes=50&depth_preference=balanced&num_documents=20&export_mermaid=false`;

  const data = await apiPost(route, null, "Mindmap");
  return data.mindmap ?? data;
}
export async function fetchDeepResearchExplainabilityResponse(query) {
  const route = `/rag/api/rag/deep-research-with-explainability?query=${encodeURIComponent(
    query
  )}&agent_type=deep_research&include_steps=true&use_crag=false`;

  const data = await apiPost(route, null, "Deep Research Explainability");

  return { ...data, user_query: query };
}

// const BASE_URL = "https://123ae95f82ef.ngrok-free.app";
// export async function fetchChatResponse(query) {
//   try {
//     console.log("📤 Sending query to backend:", query);

//     const url = `${BASE_URL}/rag/api/rag/chat-query`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//       body: JSON.stringify({
//         query,
//         use_crag: false,
//         agent_type: "react",
//         include_steps: true,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ HTTP Error:", errorText);
//       throw new Error(`Request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("✅ Raw Chat API Response:", data);

//     return {
//       answer:
//         data.final_answer ??
//         data.answer ??
//         data.final_decision ??
//         data.final_decision_text ??
//         data.report ??
//         data.summary ??
//         JSON.stringify(data, null, 2),
//       steps: data.agent_steps ?? [],
//       evaluation: data.evaluation_metrics ?? {},
//       metadata: data.metadata ?? {},
//       agent_type: data.agent_type ?? "react",
//       user_query: query,
//     };
//   } catch (error) {
//     console.error("🚨 fetchChatResponse Error:", error);
//     throw error;
//   }
// }

// export async function fetchExplainabilityChatResponse(query) {
//   try {
//     console.log("📤 Sending explainability chat query:", query);

//     const url = `${BASE_URL}/rag/api/rag/chat-query-with-explainability?query=${encodeURIComponent(
//       query
//     )}&agent_type=react&include_steps=true&use_crag=false`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ HTTP Error:", errorText);
//       throw new Error(`Request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("✅ Explainability Chat Response:", data);
//     return { ...data, user_query: query };
//   } catch (error) {
//     console.error("🚨 fetchExplainabilityChatResponse Error:", error);
//     throw error;
//   }
// }

// export async function fetchDomains() {
//   try {
//     console.log("📡 Fetching domains...");

//     const url = `${BASE_URL}/rag/api/rag/domains`;
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         Accept: "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ HTTP Error:", errorText);
//       throw new Error(`Request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("✅ Domain API Response:", data);
//     return data;
//   } catch (err) {
//     console.error("🚨 fetchDomains Error:", err);
//     throw err;
//   }
// }

// export async function selectDomain(domainName) {
//   const res = await fetch(`${BASE_URL}/rag/api/rag/select-domain`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "ngrok-skip-browser-warning": "true",
//     },
//     body: JSON.stringify({ domain_name: domainName }),
//   });

//   if (!res.ok) throw new Error("Failed to select domain");
//   return res.json();
// }

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

// export async function fetchDeepResearchResponse(query) {
//   try {
//     console.log("🔍 Sending deep research query:", query);

//     const url = `${BASE_URL}/rag/api/rag/deep-research`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//       body: JSON.stringify({
//         query: query,
//         use_crag: false,
//         agent_type: "deep_research",
//         include_steps: true,
//       }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ HTTP Error:", errorText);
//       throw new Error(`Request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("✅ Deep Research API Response:", data);

//     return {
//       answer: data.final_answer ?? data.answer ?? "",
//       steps: data.agent_steps ?? [],
//       evaluation: data.evaluation_metrics ?? {},
//       metadata: data.metadata ?? {},
//       agent_type: data.agent_type ?? "deep_research",
//       user_query: query,
//     };
//   } catch (error) {
//     console.error("🚨 fetchDeepResearchResponse Error:", error);
//     throw error;
//   }
// }

// const defaultHeaders = {
//   "Content-Type": "application/json",
//   Accept: "application/json",
//   "ngrok-skip-browser-warning": "true",
// };

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

// export async function fetchBriefingFromAPI(domain, topic) {
//   const cleanTopic = topic?.trim() || "AI developments overview";
//   console.log("📤 Fetching briefing for:", cleanTopic);

//   const url = `${BASE_URL}/rag/api/rag/generate/briefing?topic=${encodeURIComponent(
//     cleanTopic
//   )}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: defaultHeaders,
//     body: JSON.stringify({
//       tone: "professional",
//       target_audience: "executives",
//       num_sources: 5,
//       include_citations: true,
//       multi_stage: false,
//     }),
//   });

//   const data = await handleResponse(response, "Briefing");
//   return formatResponse(data, domain);
// }

// export async function fetchFAQFromAPI(domain, topic) {
//   const cleanTopic = topic?.trim() || "Frequently Asked Questions";
//   console.log("📤 Fetching FAQ for:", cleanTopic);

//   const url = `${BASE_URL}/rag/api/rag/generate/faq?topic=${encodeURIComponent(
//     cleanTopic
//   )}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: defaultHeaders,
//     body: JSON.stringify({
//       tone: "informative",
//       target_audience: "general",
//       num_sources: 5,
//       include_citations: true,
//       multi_stage: false,
//     }),
//   });

//   const data = await handleResponse(response, "FAQ");
//   return formatResponse(data, domain);
// }

// export async function fetchComparativeAnalysisFromAPI(domain, topic) {
//   const cleanTopic = topic?.trim() || "Comparison Study";
//   console.log("📤 Fetching Comparative Analysis for:", cleanTopic);

//   const url = `${BASE_URL}/rag/api/rag/generate/comparative-analysis?topic=${encodeURIComponent(
//     cleanTopic
//   )}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: defaultHeaders,
//     body: JSON.stringify({
//       tone: "analytical",
//       target_audience: "researchers",
//       num_sources: 5,
//       include_citations: true,
//       multi_stage: false,
//     }),
//   });

//   const data = await handleResponse(response, "Comparative Analysis");
//   return formatResponse(data, domain);
// }

// export async function fetchTutorialFromAPI(domain, topic) {
//   const cleanTopic = topic?.trim() || "Step-by-Step Tutorial";
//   console.log("📤 Fetching Tutorial for:", cleanTopic);

//   const url = `${BASE_URL}/rag/api/rag/generate/tutorial?topic=${encodeURIComponent(
//     cleanTopic
//   )}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: defaultHeaders,
//     body: JSON.stringify({
//       tone: "educational",
//       target_audience: "students",
//       num_sources: 5,
//       include_citations: true,
//       multi_stage: false,
//     }),
//   });

//   const data = await handleResponse(response, "Tutorial");
//   return formatResponse(data, domain);
// }

// export async function fetchTechnicalReportFromAPI(domain, topic) {
//   const cleanTopic = topic?.trim() || "Technical Summary";
//   console.log("📤 Fetching Technical Report for:", cleanTopic);

//   const url = `${BASE_URL}/rag/api/rag/generate/technical-report?topic=${encodeURIComponent(
//     cleanTopic
//   )}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: defaultHeaders,
//     body: JSON.stringify({
//       tone: "formal",
//       target_audience: "engineers",
//       num_sources: 5,
//       include_citations: true,
//       multi_stage: false,
//     }),
//   });

//   const data = await handleResponse(response, "Technical Report");
//   return formatResponse(data, domain);
// }

// export async function fetchBlogPostFromAPI(domain, topic) {
//   const cleanTopic = topic?.trim() || "Blog Post";
//   console.log("📤 Fetching Blog Post for:", cleanTopic);

//   const url = `${BASE_URL}/rag/api/rag/generate/blog-post?topic=${encodeURIComponent(
//     cleanTopic
//   )}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: defaultHeaders,
//     body: JSON.stringify({
//       tone: "conversational",
//       target_audience: "general",
//       num_sources: 5,
//       include_citations: false,
//       multi_stage: false,
//     }),
//   });

//   const data = await handleResponse(response, "Blog Post");
//   return formatResponse(data, domain);
// }

// export async function fetchStudyGuideFromAPI(domain, topic) {
//   const cleanTopic = topic?.trim() || "Study Material";
//   console.log("📤 Fetching Study Guide for:", cleanTopic);

//   const url = `${BASE_URL}/rag/api/rag/generate/study-guide?topic=${encodeURIComponent(
//     cleanTopic
//   )}`;
//   const response = await fetch(url, {
//     method: "POST",
//     headers: defaultHeaders,
//     body: JSON.stringify({
//       tone: "educational",
//       target_audience: "students",
//       num_sources: 5,
//       include_citations: true,
//       multi_stage: false,
//     }),
//   });

//   const data = await handleResponse(response, "Study Guide");
//   return formatResponse(data, domain);
// }

// function formatResponse(data, domain) {
//   return {
//     answer: data.content ?? data.answer ?? "",
//     retrieved_context: data.sources ?? data.retrieved_context ?? [],
//     metadata: {
//       active_domain: data.metadata?.source_domain ?? domain,
//       total_time: data.metadata?.total_time ?? "N/A",
//     },
//     mindmap: data.mindmap ?? null,
//   };
// }

// export async function fetchNotebookAnswerFromAPI(domain, question) {
//   try {
//     console.log("📡 Fetching notebook answer from API:", question);

//     const url = `${BASE_URL}/rag/api/rag/doc_question?query=${encodeURIComponent(
//       question
//     )}`;

//     const response = await fetch(url, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Accept: "application/json",
//         "ngrok-skip-browser-warning": "true",
//       },
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error("❌ Notebook API Error:", errorText);
//       throw new Error(`Request failed with status ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("✅ Notebook API Response:", data);

//     return {
//       answer: data.answer ?? "",
//       retrieved_context:
//         data.retrieved_context ?? data.context ?? data.sources ?? [],
//       metadata: {
//         active_domain: data.domain ?? data.active_domain ?? domain,
//         query: question,
//         total_time: data.latency ?? data.time_taken ?? "N/A",
//       },
//       mindmap: data.mindmap ?? null,
//     };
//   } catch (err) {
//     console.error("🚨 fetchNotebookAnswerFromAPI Error:", err);
//     throw err;
//   }
// }
// export async function fetchMindmapFromAPI(topic = "General") {
//   console.log("📤 Fetching mindmap:", topic);

//   const url = `${BASE_URL}/rag/api/rag/mindmap/full_vectorstore?topic=${encodeURIComponent(
//     topic
//   )}&max_nodes=50&depth_preference=balanced&num_documents=20&export_mermaid=false`;

//   try {
//     const response = await fetch(url, {
//       method: "POST",
//       headers: defaultHeaders,
//     });

//     const data = await handleResponse(response, "Mindmap");
//     return data.mindmap ?? data;
//   } catch (err) {
//     console.error("🚨 fetchMindmapFromAPI Error:", err);
//     throw err;
//   }
// }
