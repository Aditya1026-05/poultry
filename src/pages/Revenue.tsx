import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download, IndianRupee, PackageCheck, RefreshCcw, TrendingUp, WalletCards } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AnalyticsEmptyState from "@/components/analytics/AnalyticsEmptyState";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import ChartTooltip from "@/components/analytics/ChartTooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DateFilters,
  RevenueKpis,
  RevenueRecord,
  RevenueTrend,
  downloadCsv,
  formatCurrency,
  getRevenueExportPath,
  getRevenueKpis,
  getRevenueRecords,
  getRevenueTrends,
} from "@/lib/financeApi";
import { toast } from "sonner";

export default function Revenue() {
  const [kpis, setKpis] = useState<RevenueKpis | null>(null);
  const [trends, setTrends] = useState<RevenueTrend[]>([]);
  const [records, setRecords] = useState<RevenueRecord[]>([]);
  const [filters, setFilters] = useState<DateFilters>({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const loadRecords = useCallback(async (nextFilters: DateFilters) => {
    setRecordsLoading(true);
    try {
      setRecords(await getRevenueRecords(nextFilters));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load revenue records");
    } finally {
      setRecordsLoading(false);
    }
  }, []);

  const loadPage = useCallback(async (nextFilters: DateFilters) => {
    setLoading(true);
    try {
      const [nextKpis, nextTrends] = await Promise.all([
        getRevenueKpis(),
        getRevenueTrends(),
      ]);
      setKpis(nextKpis);
      setTrends(nextTrends);
      await loadRecords(nextFilters);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load revenue dashboard");
    } finally {
      setLoading(false);
    }
  }, [loadRecords]);

  useEffect(() => {
    void loadPage({ startDate: "", endDate: "" });
  }, [loadPage]);

  const hasFilters = Boolean(filters.startDate || filters.endDate);

  const applyFilters = () => {
    void loadRecords(filters);
  };

  const resetFilters = () => {
    const cleared = { startDate: "", endDate: "" };
    setFilters(cleared);
    void loadRecords(cleared);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      await downloadCsv(getRevenueExportPath(filters), "revenue.csv");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export revenue");
    } finally {
      setExporting(false);
    }
  };

  const yAxisWidth = useMemo(() => {
    const maxValue = Math.max(...trends.map((trend) => trend.revenue), 0);
    return maxValue >= 100000 ? 88 : 72;
  }, [trends]);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Analytics</p>
            <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-normal">
              Revenue <span className="text-gradient-gold">Dashboard</span>
            </h1>
            <p className="mt-2 text-muted-foreground">Monitor completed-order revenue, trends, and records.</p>
          </div>
          <Button variant="outline" onClick={() => void loadPage(filters)}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {loading || !kpis ? (
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="glass-strong border-border/50">
                <CardContent className="p-5">
                  <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                  <div className="mt-4 h-8 w-32 rounded bg-muted animate-pulse" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <AnalyticsKpiCard title="Total Revenue" value={formatCurrency(kpis.totalRevenue)} icon={IndianRupee} tone="success" />
              <AnalyticsKpiCard title="Month Revenue" value={formatCurrency(kpis.monthRevenue)} icon={TrendingUp} />
              <AnalyticsKpiCard title="Today's Revenue" value={formatCurrency(kpis.todayRevenue)} icon={WalletCards} />
              <AnalyticsKpiCard title="Completed Orders" value={String(kpis.completedOrders)} icon={PackageCheck} tone="warning" />
              <AnalyticsKpiCard title="Average Order Value" value={formatCurrency(kpis.averageOrderValue)} icon={IndianRupee} />
            </>
          )}
        </div>

        <Card className="glass-strong mt-8 border-border/50">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="font-display text-2xl">Monthly Revenue Trend</CardTitle>
              <p className="text-sm text-muted-foreground">Completed orders grouped by month.</p>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[360px] rounded-2xl bg-muted/40 animate-pulse" />
            ) : trends.length === 0 ? (
              <AnalyticsEmptyState icon={TrendingUp} title="No revenue trend yet" description="Completed orders will appear here as monthly revenue." />
            ) : (
              <div className="h-[320px] md:h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis
                      width={yAxisWidth}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value: number) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value)}
                    />
                    <Tooltip content={<ChartTooltip currencyKeys={["revenue"]} />} />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="revenue"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      fill="url(#revenueFill)"
                    />
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
                <CardTitle className="font-display text-2xl">Revenue Records</CardTitle>
                <p className="text-sm text-muted-foreground">Filter completed orders and export the same date range.</p>
              </div>
              <Button onClick={exportCsv} disabled={exporting} className="bg-gradient-gold text-accent-foreground hover:opacity-90">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto] md:items-end">
              <div>
                <Label htmlFor="revenue-start">Start date</Label>
                <Input id="revenue-start" type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="revenue-end">End date</Label>
                <Input id="revenue-end" type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              </div>
              <Button variant="outline" onClick={applyFilters}>Apply Filter</Button>
              <Button variant="ghost" onClick={resetFilters} disabled={!hasFilters}>Reset Filter</Button>
            </div>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-12 rounded-xl bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : records.length === 0 ? (
              <AnalyticsEmptyState icon={PackageCheck} title="No revenue records found" description="Try changing the selected date range or complete an order first." />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Business Name</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.createdAt.slice(0, 10)}</TableCell>
                        <TableCell className="font-medium">{record.businessName}</TableCell>
                        <TableCell>{record.quantity} trays</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(record.totalAmount)}</TableCell>
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
