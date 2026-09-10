const API_BASE =
    import.meta.env.VITE_API_URL?.replace("/api", "") ??
    "http://localhost:8000";
const TOKEN_KEY = "Star_token";

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export async function sendMessage(message: string) {
  const response = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      message,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to contact AI");
  }

  return response.json();
}

export async function confirmAction() {
  const response = await fetch(`${API_BASE}/ai/confirm-action`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to confirm action");
  }

  return response.json();
}

export async function cancelAction() {
  const response = await fetch(`${API_BASE}/ai/cancel-action`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to cancel action");
  }

  return response.json();
}