import { useEffect, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { IndianRupee, Percent, ReceiptText, TrendingUp } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AnalyticsEmptyState from "@/components/analytics/AnalyticsEmptyState";
import AnalyticsKpiCard from "@/components/analytics/AnalyticsKpiCard";
import ChartTooltip from "@/components/analytics/ChartTooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ProfitKpis,
  ProfitTrend,
  formatCurrency,
  getProfitKpis,
  getProfitTrends,
} from "@/lib/financeApi";
import { toast } from "sonner";

export default function Profit() {
  const [kpis, setKpis] = useState<ProfitKpis | null>(null);
  const [trends, setTrends] = useState<ProfitTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [nextKpis, nextTrends] = await Promise.all([
          getProfitKpis(),
          getProfitTrends(),
        ]);
        setKpis(nextKpis);
        setTrends(nextTrends);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load profit dashboard");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 md:py-16">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Finance</p>
          <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-normal">
            Profit <span className="text-gradient-gold">Dashboard</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Revenue minus expenses, tracked month by month.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {loading || !kpis ? (
            Array.from({ length: 4 }).map((_, index) => (
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
              <AnalyticsKpiCard title="Total Expenses" value={formatCurrency(kpis.totalExpenses)} icon={ReceiptText} tone="danger" />
              <AnalyticsKpiCard title="Net Profit" value={formatCurrency(kpis.netProfit)} icon={TrendingUp} tone={kpis.netProfit >= 0 ? "success" : "danger"} />
              <AnalyticsKpiCard title="Profit Margin" value={`${kpis.profitMargin}%`} icon={Percent} />
            </>
          )}
        </div>

        <Card className="glass-strong mt-8 border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-2xl">Monthly Profit Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Revenue, expenses, and calculated profit by month.</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[380px] rounded-2xl bg-muted/40 animate-pulse" />
            ) : trends.length === 0 ? (
              <AnalyticsEmptyState icon={TrendingUp} title="No profit data yet" description="Completed revenue and expenses will combine here." />
            ) : (
              <div className="h-[340px] md:h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={trends} margin={{ top: 12, right: 8, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis
                      width={86}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                      tickFormatter={(value: number) => new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value)}
                    />
                    <Tooltip content={<ChartTooltip currencyKeys={["revenue", "expenses", "profit"]} />} />
                    <Bar dataKey="revenue" name="revenue" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="expenses" name="expenses" fill="#f87171" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="profit" name="profit" stroke="hsl(var(--accent))" strokeWidth={3} dot={{ r: 3 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
