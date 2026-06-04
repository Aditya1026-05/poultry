import { useCallback, useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, Pencil, Plus, ReceiptText, RefreshCcw, Trash2, WalletCards } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AnalyticsEmptyState from "@/components/analytics/AnalyticsEmptyState";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import ChartTooltip from "@/components/analytics/ChartTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Expense,
  ExpenseCategory,
  ExpenseFilters,
  ExpenseInput,
  ExpenseKpis,
  ExpenseTrend,
  createExpense,
  deleteExpense,
  downloadCsv,
  expenseCategories,
  formatCurrency,
  getExpenseExportPath,
  getExpenseKpis,
  getExpenseTrends,
  getExpenses,
  updateExpense,
} from "@/lib/financeApi";
import { toast } from "sonner";

const emptyExpenseForm: ExpenseInput = {
  title: "",
  category: "Feed",
  amount: 0,
  description: "",
  expenseDate: new Date().toISOString().slice(0, 10),
};

export default function Expenses() {
  const [kpis, setKpis] = useState<ExpenseKpis | null>(null);
  const [trends, setTrends] = useState<ExpenseTrend[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>({ startDate: "", endDate: "", category: "" });
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState<ExpenseInput>(emptyExpenseForm);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadTable = useCallback(async (nextFilters: ExpenseFilters) => {
    setTableLoading(true);
    try {
      const [nextExpenses, nextTrends] = await Promise.all([
        getExpenses(nextFilters),
        getExpenseTrends(nextFilters),
      ]);
      setExpenses(nextExpenses);
      setTrends(nextTrends);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load expenses");
    } finally {
      setTableLoading(false);
    }
  }, []);

  const loadPage = useCallback(async (nextFilters: ExpenseFilters) => {
    setLoading(true);
    try {
      const nextKpis = await getExpenseKpis();
      setKpis(nextKpis);
      await loadTable(nextFilters);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load expense dashboard");
    } finally {
      setLoading(false);
    }
  }, [loadTable]);

  useEffect(() => {
    void loadPage({ startDate: "", endDate: "", category: "" });
  }, [loadPage]);

  const openCreateDialog = () => {
    setEditing(null);
    setForm(emptyExpenseForm);
    setDialogOpen(true);
  };

  const openEditDialog = (expense: Expense) => {
    setEditing(expense);
    setForm({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      description: expense.description,
      expenseDate: expense.expenseDate,
    });
    setDialogOpen(true);
  };

  const saveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateExpense(editing.id, form);
        toast.success("Expense updated");
      } else {
        await createExpense(form);
        toast.success("Expense added");
      }
      setDialogOpen(false);
      await Promise.all([getExpenseKpis().then(setKpis), loadTable(filters)]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const removeExpense = async (expense: Expense) => {
    if (!window.confirm(`Delete ${expense.title}?`)) return;
    try {
      await deleteExpense(expense.id);
      toast.success("Expense deleted");
      await Promise.all([getExpenseKpis().then(setKpis), loadTable(filters)]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete expense");
    }
  };

  const applyFilters = () => {
    void loadTable(filters);
  };

  const resetFilters = () => {
    const cleared = { startDate: "", endDate: "", category: "" };
    setFilters(cleared);
    void loadTable(cleared);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadCsv(getExpenseExportPath(filters), "expenses.csv");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export expenses");
    } finally {
      setExporting(false);
    }
  };

  const hasFilters = Boolean(filters.startDate || filters.endDate || filters.category);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Operations</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-normal">
              Expense <span className="text-gradient-gold">Dashboard</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Track spending by category, date, and monthly movement.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void loadPage(filters)}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog} className="bg-gradient-gold text-accent-foreground hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Expense" : "Add Expense"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={saveExpense} className="space-y-4">
                  <div>
                    <Label htmlFor="expense-title">Title</Label>
                    <Input id="expense-title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label>Category</Label>
                      <Select value={form.category} onValueChange={(value) => setForm({ ...form, category: value as ExpenseCategory })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((category) => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="expense-amount">Amount</Label>
                      <Input
                        id="expense-amount"
                        type="number"
                        min={0}
                        required
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: Number(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expense-date">Expense Date</Label>
                    <Input id="expense-date" type="date" required value={form.expenseDate} onChange={(e) => setForm({ ...form, expenseDate: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="expense-description">Description</Label>
                    <Textarea id="expense-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={saving} className="w-full">
                    {editing ? "Save Expense" : "Create Expense"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {loading || !kpis ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="glass-strong border-border/50">
                <CardContent className="p-5">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="mt-4 h-8 w-32 rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <AnalyticsKpiCard title="Total Expenses" value={formatCurrency(kpis.totalExpenses)} icon={ReceiptText} tone="danger" />
              <AnalyticsKpiCard title="Month Expenses" value={formatCurrency(kpis.monthExpenses)} icon={WalletCards} tone="warning" />
              <AnalyticsKpiCard title="Today Expenses" value={formatCurrency(kpis.todayExpenses)} icon={ReceiptText} />
            </>
          )}
        </div>

        <Card className="glass-strong mt-8 border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Monthly Expense Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Filtered expense totals grouped by month.</p>
          </CardHeader>
          <CardContent>
            {tableLoading ? (
              <div className="h-[340px] rounded-2xl bg-muted/40 animate-pulse" />
            ) : trends.length === 0 ? (
              <AnalyticsEmptyState icon={ReceiptText} title="No expense trend yet" description="Add expenses to see monthly spend here." />
            ) : (
              <div className="h-[320px] md:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="expenseFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis
                      width={82}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value: number) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value)}
                    />
                    <Tooltip content={<ChartTooltip currencyKeys={["expenses"]} />} />
                    <Area type="monotone" dataKey="expenses" name="expenses" stroke="#f87171" strokeWidth={3} fill="url(#expenseFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-strong mt-8 border-border/50">
          <CardHeader className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <CardTitle className="font-display text-2xl">Expense Records</CardTitle>
                <p className="text-sm text-muted-foreground">Filter by date or category and export the same view.</p>
              </div>
              <Button onClick={exportCsv} disabled={exporting} className="bg-gradient-gold text-accent-foreground hover:opacity-90">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto_auto] lg:items-end">
              <div>
                <Label htmlFor="expense-start">Start date</Label>
                <Input id="expense-start" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="expense-end">End date</Label>
                <Input id="expense-end" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              </div>
              <div>
                <Label>Category</Label>
                <Select value={filters.category || "all"} onValueChange={(value) => setFilters({ ...filters, category: value === "all" ? "" : value as ExpenseCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {expenseCategories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={applyFilters}>Apply Filter</Button>
              <Button variant="ghost" onClick={resetFilters} disabled={!hasFilters}>Reset Filter</Button>
            </div>
          </CardHeader>
          <CardContent>
            {tableLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <AnalyticsEmptyState icon={ReceiptText} title="No expenses found" description="Add a new expense or adjust your filters." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.expenseDate}</TableCell>
                        <TableCell>
                          <div className="font-medium">{expense.title}</div>
                          {expense.description && <div className="text-xs text-muted-foreground">{expense.description}</div>}
                        </TableCell>
                        <TableCell>{expense.category}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditDialog(expense)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => void removeExpense(expense)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
