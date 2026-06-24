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

export async function confirmAction() {
  const response = await fetch(`${API_BASE}/ai/confirm-action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to cancel action");
  }

  return response.json();
}