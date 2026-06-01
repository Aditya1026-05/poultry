/**
 * API LAYER
 * =========
 * Auth now talks to the FastAPI backend.
 * Settings and orders are still mocked with localStorage until their backend routes are added.
 *
 * Suggested REST endpoints (you implement these on your server):
 *   POST   /api/auth/signup        { email, password, businessName, phone }    -> { user, token }
 *   POST   /api/auth/login         { email, password }                         -> { user, token }
 *   GET    /api/auth/me            (Bearer token)                              -> { user }
 *   GET    /api/settings                                                       -> { unitPrice, qrCodeUrl, advancePercent, tiers }
 *   PUT    /api/settings           (admin) { unitPrice, qrCodeUrl, advancePercent, tiers }
 *   POST   /api/orders             { quantity, deliveryDate, paymentScreenshot } -> Order
 *   GET    /api/orders/mine        (Bearer)                                    -> Order[]
 *   GET    /api/orders             (admin)                                     -> Order[]
 *   PATCH  /api/orders/:id         (admin) { status, advancePaid, finalPaid, deliveryDate, advanceAmount }
 */

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  email: string;
  businessName: string;
  phone: string;
  role: UserRole;
  createdAt: string;
}

export type OrderStatus =
  | "pending_payment_review" // customer uploaded screenshot, waiting for admin
  | "confirmed"              // admin approved advance, delivery scheduled
  | "delivered"              // delivered, awaiting final offline payment
  | "completed"              // final payment marked received
  | "rejected";              // admin rejected

export interface PriceTier {
  minQty: number; // inclusive
  maxQty: number | null; // null = unlimited
  pricePerTray: number;
}

export interface Settings {
  unitPrice: number;        // fallback price per tray
  advancePercent: number;   // 0-10
  qrCodeUrl: string;        // dataURL or hosted URL
  tiers: PriceTier[];
}

export interface Order {
  id: string;
  userId: string;
  businessName: string;
  email: string;
  phone: string;
  quantity: number;          // number of trays (30 eggs each)
  pricePerTray: number;
  totalAmount: number;
  advancePercent: number;
  advanceAmount: number;
  finalAmount: number;
  preferredDeliveryDate: string;
  confirmedDeliveryDate: string | null;
  paymentScreenshot: string; // dataURL
  status: OrderStatus;
  advancePaid: boolean;
  finalPaid: boolean;
  createdAt: string;
  updatedAt: string;
  adminNote?: string;
}

// ---------- storage keys ----------
const KEYS = {
  session: "Star_session",
  token: "Star_token",
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// ---------- helpers ----------
const read = <T>(k: string, fallback: T): T => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));

const getToken = () => localStorage.getItem(KEYS.token);

const parseApiError = async (res: Response, fallback: string) => {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
  } catch {
    // Ignore invalid JSON and use the fallback message.
  }
  return fallback;
};

// =============================================================
// AUTH
// =============================================================
export async function signup(input: {
  email: string;
  password: string;
  businessName: string;
  phone: string;
}): Promise<User> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Signup failed"));
  }

  const data = (await res.json()) as { user: User; token: string };
  localStorage.setItem(KEYS.token, data.token);
  write(KEYS.session, data.user);
  return data.user;
}

export async function login(email: string, password: string): Promise<User> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Invalid email or password."));
  }

  const data = (await res.json()) as { user: User; token: string };
  localStorage.setItem(KEYS.token, data.token);
  write(KEYS.session, data.user);
  return data.user;
}

export function logout() {
  localStorage.removeItem(KEYS.session);
  localStorage.removeItem(KEYS.token);
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("You must be logged in.");

  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update password"));
  }
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to send reset link"));
  }
}

export async function resetPassword(input: {
  token: string;
  newPassword: string;
}): Promise<void> {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to reset password"));
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    logout();
    return null;
  }

  const user = (await res.json()) as User;
  write(KEYS.session, user);
  return user;
}

// =============================================================
// SETTINGS
// =============================================================
export async function getSettings(): Promise<Settings> {
  const res = await fetch(`${API_URL}/settings`);
  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load settings"));
  }
  return res.json();
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const token = getToken();
  if (!token) throw new Error("You must be logged in as admin.");

  const current = await getSettings();
  const res = await fetch(`${API_URL}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...current, ...patch }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to save settings"));
  }

  return res.json();
}

export function getPriceForQuantity(qty: number, settings: Settings): number {
  const tier = settings.tiers.find(
    (t) => qty >= t.minQty && (t.maxQty === null || qty <= t.maxQty)
  );
  return tier ? tier.pricePerTray : settings.unitPrice;
}

// =============================================================
// ORDERS
// =============================================================
export async function createOrder(input: {
  quantity: number;
  preferredDeliveryDate: string;
  paymentScreenshot: string;
}): Promise<Order> {
  const token = getToken();
  if (!token) throw new Error("You must be logged in to place an order.");

  const res = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to place order"));
  }

  return res.json();
}

export async function getMyOrders(): Promise<Order[]> {
  const token = getToken();
  if (!token) return [];

  const res = await fetch(`${API_URL}/orders/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load orders"));
  }

  return res.json();
}

export async function getAllOrders(): Promise<Order[]> {
  const token = getToken();
  if (!token) throw new Error("You must be logged in as admin.");

  const res = await fetch(`${API_URL}/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to load orders"));
  }

  return res.json();
}

export async function updateOrder(
  id: string,
  patch: Partial<
    Pick<
      Order,
      | "status"
      | "advancePaid"
      | "finalPaid"
      | "confirmedDeliveryDate"
      | "advanceAmount"
      | "adminNote"
    >
  >
): Promise<Order> {
  const token = getToken();
  if (!token) throw new Error("You must be logged in as admin.");

  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res, "Failed to update order"));
  }

  return res.json();
}
