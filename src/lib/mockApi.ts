/**
 * MOCK API LAYER
 * ==============
 * This file simulates a backend using localStorage.
 * Replace each function body with real fetch() calls to your MongoDB/Express backend.
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
  users: "aviora_users",
  session: "aviora_session",
  settings: "aviora_settings",
  orders: "aviora_orders",
};

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
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

// ---------- bootstrap defaults ----------
const defaultSettings: Settings = {
  unitPrice: 180,
  advancePercent: 10,
  qrCodeUrl: "",
  tiers: [
    { minQty: 1, maxQty: 10, pricePerTray: 180 },
    { minQty: 11, maxQty: 50, pricePerTray: 165 },
    { minQty: 51, maxQty: null, pricePerTray: 150 },
  ],
};

const ensureBootstrap = () => {
  if (!localStorage.getItem(KEYS.settings)) write(KEYS.settings, defaultSettings);
  if (!localStorage.getItem(KEYS.users)) {
    // seed default admin (REPLACE with real admin via your backend)
    const admin: User & { password: string } = {
      id: uid(),
      email: "admin@aviora.com",
      password: "admin123",
      businessName: "Aviora Admin",
      phone: "0000000000",
      role: "admin",
      createdAt: new Date().toISOString(),
    };
    write(KEYS.users, [admin]);
  }
  if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, []);
};
ensureBootstrap();

// =============================================================
// AUTH
// =============================================================
export async function signup(input: {
  email: string;
  password: string;
  businessName: string;
  phone: string;
}): Promise<User> {
  await wait();
  const users = read<(User & { password: string })[]>(KEYS.users, []);
  if (users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user: User & { password: string } = {
    id: uid(),
    email: input.email,
    password: input.password,
    businessName: input.businessName,
    phone: input.phone,
    role: "customer",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  write(KEYS.users, users);
  const { password: _pw, ...safe } = user;
  write(KEYS.session, safe);
  return safe;
}

export async function login(email: string, password: string): Promise<User> {
  await wait();
  const users = read<(User & { password: string })[]>(KEYS.users, []);
  const found = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  if (!found) throw new Error("Invalid email or password.");
  const { password: _pw, ...safe } = found;
  write(KEYS.session, safe);
  return safe;
}

export function logout() {
  localStorage.removeItem(KEYS.session);
}

export function getCurrentUser(): User | null {
  return read<User | null>(KEYS.session, null);
}

// =============================================================
// SETTINGS
// =============================================================
export async function getSettings(): Promise<Settings> {
  await wait(150);
  return read<Settings>(KEYS.settings, defaultSettings);
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  await wait();
  const current = read<Settings>(KEYS.settings, defaultSettings);
  const next = { ...current, ...patch };
  write(KEYS.settings, next);
  return next;
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
  await wait();
  const user = getCurrentUser();
  if (!user) throw new Error("You must be logged in to place an order.");
  const settings = await getSettings();
  const pricePerTray = getPriceForQuantity(input.quantity, settings);
  const total = pricePerTray * input.quantity;
  const advance = Math.round((total * settings.advancePercent) / 100);
  const order: Order = {
    id: uid(),
    userId: user.id,
    businessName: user.businessName,
    email: user.email,
    phone: user.phone,
    quantity: input.quantity,
    pricePerTray,
    totalAmount: total,
    advancePercent: settings.advancePercent,
    advanceAmount: advance,
    finalAmount: total - advance,
    preferredDeliveryDate: input.preferredDeliveryDate,
    confirmedDeliveryDate: null,
    paymentScreenshot: input.paymentScreenshot,
    status: "pending_payment_review",
    advancePaid: false,
    finalPaid: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const orders = read<Order[]>(KEYS.orders, []);
  orders.unshift(order);
  write(KEYS.orders, orders);
  return order;
}

export async function getMyOrders(): Promise<Order[]> {
  await wait(150);
  const user = getCurrentUser();
  if (!user) return [];
  const orders = read<Order[]>(KEYS.orders, []);
  return orders.filter((o) => o.userId === user.id);
}

export async function getAllOrders(): Promise<Order[]> {
  await wait(150);
  return read<Order[]>(KEYS.orders, []);
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
  await wait();
  const orders = read<Order[]>(KEYS.orders, []);
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Order not found");
  const next = { ...orders[idx], ...patch, updatedAt: new Date().toISOString() };
  // recalc final amount if advance changed
  if (patch.advanceAmount !== undefined) {
    next.finalAmount = next.totalAmount - patch.advanceAmount;
  }
  orders[idx] = next;
  write(KEYS.orders, orders);
  return next;
}
