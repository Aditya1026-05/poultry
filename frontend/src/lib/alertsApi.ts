const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "Star_token";

export interface Alert {
  id: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  isRead: boolean;
  isResolved: boolean;
  isDismissed: boolean;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

const getToken = () => localStorage.getItem(TOKEN_KEY);

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
  } catch {
    // Keep fallback when the backend returns plain text.
  }
  return fallback;
};

async function apiFetch<T>(path: string, options: RequestInit = {}, fallback = "Request failed"): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  if (!headers.has("Content-Type") && options.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await parseApiError(res, fallback));
  return res.json() as Promise<T>;
}

// REST endpoints
export const getAlerts = () => apiFetch<Alert[]>("/alerts");

export const getUnreadCount = () => apiFetch<{ count: number }>("/alerts/unread-count");

export const markAlertRead = (id: string) =>
  apiFetch<Alert>(`/alerts/${id}/read`, { method: "PATCH" }, "Failed to mark alert as read");

export const dismissAlert = (id: string) =>
  apiFetch<Alert>(`/alerts/${id}/dismiss`, { method: "PATCH" }, "Failed to dismiss alert");

export const markAllAlertsRead = () =>
  apiFetch<{ message: string }>("/alerts/read-all", { method: "PATCH" }, "Failed to mark all alerts as read");

export const deleteAlert = (id: string) =>
  apiFetch<{ message: string }>(`/alerts/${id}`, { method: "DELETE" }, "Failed to delete alert");
