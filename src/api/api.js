export async function fetchChatResponse(query) {
  const response = await fetch("/data/openai_response.json");
  if (!response.ok) throw new Error("Failed to fetch data");
  const data = await response.json();
  return { ...data, user_query: query };
}
