const API_BASE = "http://localhost:8000";

export async function sendMessage(message: string) {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to contact AI");
  }

  return response.json();
}