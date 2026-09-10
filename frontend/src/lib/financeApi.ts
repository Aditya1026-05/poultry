const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
const TOKEN_KEY = "Star_token";

export const expenseCategories = [
  "Feed",
  "Medicine",
  "Electricity",
  "Transport",
  "Labor",
  "Maintenance",
  "Equipment",
  "Miscellaneous",
] as const;

export type ExpenseCategory = (typeof expenseCategories)[number];

export interface RevenueKpis {
  todayRevenue: number;
  monthRevenue: number;
  totalRevenue: number;
  completedOrders: number;
  averageOrderValue: number;
}

export interface RevenueRecord {
  id: string;
  businessName: string;
  quantity: number;
  totalAmount: number;
  createdAt: string;
}

export interface RevenueTrend {
  month: string;
  revenue: number;
  orders: number;
}

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseInput {
  title: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  expenseDate: string;
}

export interface ExpenseKpis {
  todayExpenses: number;
  monthExpenses: number;
  totalExpenses: number;
}

export interface ExpenseTrend {
  month: string;
  expenses: number;
  records: number;
}

export interface ProfitKpis {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

export interface ProfitTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface DateFilters {
  startDate?: string;
  endDate?: string;
}

export interface ExpenseFilters extends DateFilters {
  category?: ExpenseCategory | "";
}

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getToken = () => localStorage.getItem(TOKEN_KEY);

const makeQuery = (params: Record<string, string | undefined>) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
};

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

export const getRevenueKpis = () => apiFetch<RevenueKpis>("/orders/revenue/kpis");
export const getRevenueTrends = () => apiFetch<RevenueTrend[]>("/orders/revenue/trends");
export const getRevenueRecords = (filters: DateFilters) =>
  apiFetch<RevenueRecord[]>(`/orders/revenue/records${makeQuery(filters)}`);
export const getRevenueExportUrl = (filters: DateFilters) =>
  `${API_URL}/orders/revenue/export${makeQuery(filters)}`;

export const getExpenseKpis = () => apiFetch<ExpenseKpis>("/expenses/kpis");
export const getExpenseTrends = (filters: ExpenseFilters) =>
  apiFetch<ExpenseTrend[]>(`/expenses/trends${makeQuery(filters)}`);
export const getExpenses = (filters: ExpenseFilters) =>
  apiFetch<Expense[]>(`/expenses${makeQuery(filters)}`);
export const createExpense = (input: ExpenseInput) =>
  apiFetch<Expense>("/expenses", { method: "POST", body: JSON.stringify(input) }, "Failed to create expense");
export const updateExpense = (id: string, input: Partial<ExpenseInput>) =>
  apiFetch<Expense>(`/expenses/${id}`, { method: "PATCH", body: JSON.stringify(input) }, "Failed to update expense");
export const deleteExpense = (id: string) =>
  apiFetch<{ message: string }>(`/expenses/${id}`, { method: "DELETE" }, "Failed to delete expense");
export const getExpenseExportUrl = (filters: ExpenseFilters) =>
  `${API_URL}/expenses/export${makeQuery(filters)}`;

export const getProfitKpis = () => apiFetch<ProfitKpis>("/profit/kpis");
export const getProfitTrends = () => apiFetch<ProfitTrend[]>("/profit/trends");

export async function downloadCsv(path: string, filename: string) {
  const token = getToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, { headers });
  if (!res.ok) throw new Error(await parseApiError(res, "Failed to export CSV"));

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const getRevenueExportPath = (filters: DateFilters) =>
  `/orders/revenue/export${makeQuery(filters)}`;
export const getExpenseExportPath = (filters: ExpenseFilters) =>
  `/expenses/export${makeQuery(filters)}`;
