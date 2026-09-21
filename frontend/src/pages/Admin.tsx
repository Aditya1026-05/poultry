import { useEffect, useRef, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Eye,
  IndianRupee,
  Loader2,
  Package,
  Save,
  Settings as SettingsIcon,
  Truck,
  Upload,
  XCircle,
  AlertTriangle,
  ChevronDown,
  Search,
  ArrowUpDown,
  X,
  Mail,
  Boxes,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/AppHeader";
import { getAlerts, dismissAlert, Alert } from "@/lib/alertsApi";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Order,
  PriceTier,
  Settings,
  ContactInquiry,
  getAllOrders,
  getSettings,
  getContactInquiries,
  updateOrder,
  updateSettings,
  getCachedOrders,
  getCachedSettings,
} from "@/lib/mockApi";
import { toast } from "sonner";

const DEFAULT_SETTINGS: Settings = {
  unitPrice: 180,
  advancePercent: 10,
  qrCodeUrl: "",
  tiers: [
    { minQty: 1, maxQty: 19, pricePerTray: 190 },
    { minQty: 20, maxQty: 99, pricePerTray: 180 },
    { minQty: 100, maxQty: null, pricePerTray: 170 },
  ],
  dailyProductionCapacity: 800,
};

export default function Admin() {
  const cachedOrders = getCachedOrders();
  const cachedSettings = getCachedSettings();

  const [orders, setOrders] = useState<Order[]>(() => cachedOrders ?? []);
  const [settings, setSettings] = useState<Settings>(() => cachedSettings ?? DEFAULT_SETTINGS);
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(() => !cachedOrders || cachedOrders.length === 0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (statusFilter !== "all" && o.status !== statusFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = o.businessName?.toLowerCase().includes(q);
          const matchEmail = o.email?.toLowerCase().includes(q);
          const matchId = o.id?.toLowerCase().includes(q);
          const matchPhone = o.phone ? o.phone.toLowerCase().includes(q) : false;
          if (!matchName && !matchEmail && !matchId && !matchPhone) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date_asc":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "date_desc":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "trays_desc":
            return b.quantity - a.quantity;
          case "trays_asc":
            return a.quantity - b.quantity;
          case "amount_desc":
            return b.totalAmount - a.totalAmount;
          case "amount_asc":
            return a.totalAmount - b.totalAmount;
          case "delivery_asc":
            return new Date(a.preferredDeliveryDate).getTime() - new Date(b.preferredDeliveryDate).getTime();
          case "status":
            return a.status.localeCompare(b.status);
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [orders, searchQuery, sortBy, statusFilter]);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, sortBy, statusFilter]);

  const checkCriticalAlerts = async () => {
    try {
      const allAlerts = await getAlerts();
      const unresolvedCritical = allAlerts.filter(
        (a) => a.severity === "critical" && !a.isRead && !a.isResolved && !a.isDismissed
      );
      if (unresolvedCritical.length > 0) {
        setCriticalAlerts(unresolvedCritical);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Failed to check critical alerts:", err);
    }
  };

  const refresh = async (forceFullSpinner = false) => {
    if (forceFullSpinner || orders.length === 0) {
      setOrdersLoading(true);
    } else {
      setIsSyncing(true);
    }
    setLoadError(null);
    try {
      // 1. Fetch settings & inquiries
      const [s, inq] = await Promise.all([
        getSettings().catch((err) => {
          console.warn("Could not load backend settings, using defaults:", err);
          return getCachedSettings() ?? DEFAULT_SETTINGS;
        }),
        getContactInquiries().catch((err) => {
          console.warn("Could not load inquiries:", err);
          return [];
        }),
      ]);
      setSettings(s);
      setInquiries(inq);

      // 2. Fetch orders from backend
      const freshOrders = await getAllOrders();
      setOrders(freshOrders);
    } catch (err) {
      console.error("Failed to load admin dashboard orders:", err);
      if (orders.length === 0) {
        setLoadError(err instanceof Error ? err.message : "Failed to load orders");
      }
    } finally {
      setOrdersLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refresh();
    checkCriticalAlerts();
  }, []);

  const stats = {
    pending: orders.filter((o) => o.status === "pending_payment_review").length,
    active: orders.filter((o) => o.status === "confirmed" || o.status === "delivered").length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders
      .filter((o) => o.status === "completed")
      .reduce((s, o) => s + o.totalAmount, 0),
  };

  // Today's date in Indian Standard Time (IST) YYYY-MM-DD
  const todayStr = useMemo(() => {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
  }, []);

  const dailyCapacity = settings.dailyProductionCapacity ?? 800;

  // Orders affecting today's inventory (scheduled delivery today or created today)
  const todaysOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = o.createdAt ? o.createdAt.slice(0, 10) : "";
      const deliveryDate = o.confirmedDeliveryDate || o.preferredDeliveryDate;
      return deliveryDate === todayStr || (!deliveryDate && orderDate === todayStr);
    });
  }, [orders, todayStr]);

  // Trays committed (confirmed, delivered, or completed) from today's batch
  const confirmedTraysToday = useMemo(() => {
    return todaysOrders
      .filter((o) => o.status === "confirmed" || o.status === "delivered" || o.status === "completed")
      .reduce((sum, o) => sum + o.quantity, 0);
  }, [todaysOrders]);

  // Trays in pending review queue waiting for confirmation
  const pendingReviewTraysToday = useMemo(() => {
    return todaysOrders
      .filter((o) => o.status === "pending_payment_review")
      .reduce((sum, o) => sum + o.quantity, 0);
  }, [todaysOrders]);

  // Available stock remaining for today (automatically decrements as orders are confirmed)
  const availableStockToday = Math.max(0, dailyCapacity - confirmedTraysToday);
  const stockAllocatedPercent = Math.min(100, Math.round((confirmedTraysToday / dailyCapacity) * 100));

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-8">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-2">
              Admin <span className="text-gradient-gold">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Manage orders, prices, stock, and payments</p>
          </div>

          {/* Today's Live Production & Stock Monitor */}
          <div className="glass-strong rounded-3xl p-5 md:p-6 mb-6 border border-primary/20 relative overflow-hidden">
            <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs uppercase tracking-wider font-semibold text-primary">Daily Production & Live Stock</span>
                  <span className="text-xs text-muted-foreground">• Today ({todayStr})</span>
                </div>
                <h2 className="text-xl md:text-2xl font-display font-semibold flex items-center gap-2 flex-wrap">
                  <span>Pending / Available Stock:</span>
                  <span className={`font-mono text-3xl font-bold ${availableStockToday > 100 ? "text-emerald-400" : availableStockToday > 0 ? "text-amber-400" : "text-rose-400"}`}>
                    {availableStockToday.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">/ {dailyCapacity} trays remaining</span>
                </h2>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="bg-background/50 border border-border/50 rounded-2xl px-4 py-2 text-right">
                  <div className="text-[11px] text-muted-foreground uppercase font-medium">Booked / Dispatched</div>
                  <div className="text-lg font-display font-bold text-foreground">
                    {confirmedTraysToday} <span className="text-xs font-normal text-muted-foreground">trays ({stockAllocatedPercent}%)</span>
                  </div>
                </div>
                {pendingReviewTraysToday > 0 && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl px-4 py-2 text-right">
                    <div className="text-[11px] text-yellow-400 uppercase font-medium flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3" /> In Review Queue
                    </div>
                    <div className="text-lg font-display font-bold text-yellow-300">
                      {pendingReviewTraysToday} <span className="text-xs font-normal text-yellow-400/80">trays</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Visual allocation progress bar */}
            <div className="space-y-1.5">
              <div className="h-3 w-full bg-secondary/60 rounded-full overflow-hidden p-0.5 flex">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 via-primary to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${stockAllocatedPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>0 Trays (Morning Batch)</span>
                <span className="text-primary font-medium">
                  {availableStockToday === 0 ? "Daily Batch Fully Allocated" : `${availableStockToday} trays ready for confirmation`}
                </span>
                <span>{dailyCapacity} Trays (Daily Target)</span>
              </div>
            </div>
          </div>

          {/* stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <StatCard icon={Clock} label="Pending review" value={stats.pending} />
            <StatCard icon={Truck} label="Active" value={stats.active} />
            <StatCard icon={CheckCircle2} label="Completed" value={stats.completed} />
            <StatCard icon={IndianRupee} label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} />
          </div>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="orders" className="flex items-center gap-1.5">
                <span>
                  Orders ({filteredAndSortedOrders.length}
                  {filteredAndSortedOrders.length !== orders.length ? ` of ${orders.length}` : ""})
                </span>
                {isSyncing && (
                  <span className="inline-flex items-center" title="Checking server for new orders...">
                    <Loader2 className="w-3 h-3 animate-spin text-accent" />
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="inquiries">
                <Mail className="w-4 h-4 mr-1.5" /> Inquiries ({inquiries.length})
              </TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className="w-4 h-4 mr-1.5" /> Pricing & QR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {ordersLoading && orders.length === 0 ? (
                <div className="glass-strong rounded-3xl p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-sm">Loading live orders…</p>
                </div>
              ) : loadError && orders.length === 0 ? (
                <div className="glass-strong rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                  <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
                  <h3 className="font-display text-lg">Unable to load orders</h3>
                  <p className="text-xs text-muted-foreground">{loadError}</p>
                  <Button size="sm" variant="outline" onClick={refresh}>Retry Orders</Button>
                </div>
              ) : orders.length === 0 ? (
                <div className="glass-strong rounded-3xl p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet.</p>
                </div>
              ) : (
                <>
                  {/* Search and Sort Toolbar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
                    {/* Search by Orderer Name, Email, or Order ID */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Search by orderer name, email, ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-8 glass-strong rounded-xl border-border/60 focus:border-accent text-sm"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5"
                          title="Clear search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter & Sort Controls */}
                    <div className="flex items-center gap-2">
                      {/* Status Filter */}
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] sm:w-[160px] glass-strong rounded-xl text-xs h-10 border-border/60">
                          <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-border/60">
                          <SelectItem value="all">All Statuses</SelectItem>
                          <SelectItem value="pending_payment_review">Pending Review</SelectItem>
                          <SelectItem value="confirmed">Confirmed</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Sorting options */}
                      <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[170px] sm:w-[195px] glass-strong rounded-xl text-xs h-10 border-border/60">
                          <div className="flex items-center gap-1.5 truncate">
                            <ArrowUpDown className="w-3.5 h-3.5 text-accent shrink-0" />
                            <SelectValue placeholder="Sort by" />
                          </div>
                        </SelectTrigger>
                        <SelectContent className="glass-strong border-border/60">
                          <SelectItem value="date_desc">Timeline: Newest First</SelectItem>
                          <SelectItem value="date_asc">Timeline: Oldest First</SelectItem>
                          <SelectItem value="trays_desc">Trays: High to Low</SelectItem>
                          <SelectItem value="trays_asc">Trays: Low to High</SelectItem>
                          <SelectItem value="amount_desc">Amount: High to Low</SelectItem>
                          <SelectItem value="amount_asc">Amount: Low to High</SelectItem>
                          <SelectItem value="delivery_asc">Delivery: Earliest First</SelectItem>
                          <SelectItem value="status">Status: Grouped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {filteredAndSortedOrders.length === 0 ? (
                    <div className="glass-strong rounded-2xl p-10 text-center">
                      <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                      <h3 className="font-display text-lg mb-1">No matching orders found</h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        {searchQuery
                          ? `No orders matching "${searchQuery}"`
                          : "No orders match the selected filters."}
                      </p>
                      {(searchQuery || statusFilter !== "all") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setStatusFilter("all");
                          }}
                          className="rounded-full text-xs"
                        >
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="grid gap-3">
                        {filteredAndSortedOrders.slice(0, visibleCount).map((o) => (
                          <OrderRow key={o.id} order={o} onView={() => setSelected(o)} />
                        ))}
                      </div>

                      {filteredAndSortedOrders.length > 10 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-border/40 text-sm text-muted-foreground">
                          <span>
                            Showing {Math.min(visibleCount, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
                          </span>
                          <div className="flex items-center gap-2">
                            {visibleCount < filteredAndSortedOrders.length ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setVisibleCount((prev) => prev + 10)}
                                className="glass-strong hover:bg-foreground/5 border-accent/40 text-foreground px-5 rounded-full flex items-center gap-1.5"
                              >
                                Show More
                                <ChevronDown className="w-3.5 h-3.5 text-accent" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setVisibleCount(10)}
                                className="text-muted-foreground hover:text-foreground text-xs"
                              >
                                Show Less
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="inquiries">
              {inquiries.length === 0 ? (
                <div className="glass-strong rounded-3xl p-12 text-center">
                  <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <h3 className="font-display text-lg mb-1">No inquiries yet</h3>
                  <p className="text-sm text-muted-foreground">
                    When visitors submit inquiries through the contact form on your website, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="glass-strong rounded-2xl p-5 border border-border/60 hover:border-accent/40 transition-all flex flex-col gap-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/40 pb-3">
                        <div>
                          <span className="font-display font-semibold text-foreground text-base mr-3">
                            {inq.name}
                          </span>
                          <a
                            href={`mailto:${inq.email}`}
                            className="text-xs text-accent hover:underline inline-block mr-3"
                          >
                            {inq.email}
                          </a>
                          {inq.phone && (
                            <a
                              href={`tel:${inq.phone}`}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              📞 {inq.phone}
                            </a>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(inq.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                        {inq.message}
                      </p>
                      <div className="pt-2 flex justify-end">
                        <a
                          href={`mailto:${inq.email}?subject=Regarding your inquiry - Star Poultry Farm`}
                          className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-accent/15 hover:bg-accent/25 text-accent border border-accent/30 transition-all font-medium"
                        >
                          <Mail className="w-3.5 h-3.5" /> Reply via Email
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings">
              <SettingsPanel
                settings={settings}
                onSaved={(s) => setSettings(s)}
              />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      <OrderDialog
        order={selected}
        onClose={() => setSelected(null)}
        onUpdated={async () => {
          await refresh();
          setSelected(null);
        }}
      />

      {/* Critical Alerts Dashboard Popup Modal */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="max-w-md glass-strong border-red-500/30">
          <DialogHeader className="flex flex-row items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
              <AlertTriangle className="h-6 w-6 animate-bounce" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl text-red-400">
                Critical Business Alert{criticalAlerts.length > 1 ? "s" : ""}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Please review these urgent issues impacting poultry farm operations.
              </p>
            </div>
          </DialogHeader>

          <div className="space-y-4 my-2 max-h-60 overflow-y-auto pr-1">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 space-y-1">
                <h4 className="font-semibold text-sm text-foreground">{alert.title}</h4>
                <p className="text-xs text-muted-foreground">{alert.message}</p>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs text-muted-foreground hover:bg-muted"
                    onClick={async () => {
                      try {
                        await dismissAlert(alert.id);
                        setCriticalAlerts((prev) => prev.filter((a) => a.id !== alert.id));
                        toast.success("Alert dismissed from popup");
                        if (criticalAlerts.length <= 1) {
                          setShowPopup(false);
                        }
                      } catch (err) {
                        toast.error("Failed to dismiss alert");
                      }
                    }}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 text-xs bg-red-600 hover:bg-red-500 text-white"
                    onClick={() => {
                      setShowPopup(false);
                      navigate("/admin/alerts");
                    }}
                  >
                    View Alert
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------- helpers / sub-components ----------------

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) => (
  <div className="glass-strong rounded-2xl p-4">
    <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <div className="font-display text-2xl">{value}</div>
  </div>
);

const statusColor: Record<Order["status"], string> = {
  pending_payment_review: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-primary/10 text-primary border-primary/30",
  delivered: "bg-accent/10 text-accent border-accent/30",
  completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
};

const OrderRow = ({ order, onView }: { order: Order; onView: () => void }) => (
  <div className="glass-strong rounded-2xl p-4 flex flex-wrap items-center gap-4">
    <div className="flex-1 min-w-[200px]">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium">{order.businessName}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[order.status]}`}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>
      <div className="text-xs text-muted-foreground">
        {order.email} · #{order.id.slice(-8).toUpperCase()}
      </div>
    </div>
    <div className="text-sm">
      <div className="text-muted-foreground text-xs">Trays</div>
      <div className="font-medium">{order.quantity}</div>
    </div>
    <div className="text-sm">
      <div className="text-muted-foreground text-xs">Total</div>
      <div className="font-medium">₹{order.totalAmount.toLocaleString("en-IN")}</div>
    </div>
    <div className="text-sm">
      <div className="text-muted-foreground text-xs">Adv {order.advancePaid ? "✓" : "✗"} · Final {order.finalPaid ? "✓" : "✗"}</div>
      <div className="text-xs">Req: {new Date(order.preferredDeliveryDate).toLocaleDateString()}</div>
    </div>
    <Button size="sm" variant="outline" onClick={onView}>
      <Eye className="w-3.5 h-3.5 mr-1.5" /> Review
    </Button>
  </div>
);

const OrderDialog = ({
  order,
  onClose,
  onUpdated,
}: {
  order: Order | null;
  onClose: () => void;
  onUpdated: () => void;
}) => {
  const [form, setForm] = useState({
    status: "" as Order["status"],
    advancePaid: false,
    finalPaid: false,
    confirmedDeliveryDate: "",
    advanceAmount: 0,
    adminNote: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      setForm({
        status: order.status,
        advancePaid: order.advancePaid,
        finalPaid: order.finalPaid,
        confirmedDeliveryDate: order.confirmedDeliveryDate || order.preferredDeliveryDate,
        advanceAmount: order.advanceAmount,
        adminNote: order.adminNote || "",
      });
    }
  }, [order]);

  if (!order) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateOrder(order.id, {
        status: form.status,
        advancePaid: form.advancePaid,
        finalPaid: form.finalPaid,
        confirmedDeliveryDate: form.confirmedDeliveryDate || null,
        advanceAmount: form.advanceAmount,
        adminNote: form.adminNote,
      });
      toast.success("Order updated");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  const quickAction = async (status: Order["status"], advancePaid?: boolean, finalPaid?: boolean) => {
    setSaving(true);
    try {
      await updateOrder(order.id, {
        status,
        ...(advancePaid !== undefined && { advancePaid }),
        ...(finalPaid !== undefined && { finalPaid }),
        confirmedDeliveryDate: form.confirmedDeliveryDate || order.preferredDeliveryDate,
      });
      toast.success("Order updated");
      onUpdated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!order} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Order #{order.id.slice(-8).toUpperCase()} — {order.businessName}
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* left: details + screenshot */}
          <div className="space-y-4">
            <div className="text-sm space-y-2">
              <Detail label="Email" value={order.email} />
              <Detail label="Phone" value={order.phone} />
              <Detail label="Quantity" value={`${order.quantity} trays (${order.quantity * 30} eggs)`} />
              <Detail label="Price/tray" value={`₹${order.pricePerTray}`} />
              <Detail label="Total" value={`₹${order.totalAmount.toLocaleString("en-IN")}`} />
              <Detail label="Requested delivery" value={new Date(order.preferredDeliveryDate).toLocaleDateString()} />
              <Detail label="Placed" value={new Date(order.createdAt).toLocaleString()} />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Payment screenshot</Label>
              {order.paymentScreenshot ? (
                <a href={order.paymentScreenshot} target="_blank" rel="noreferrer">
                  <img
                    src={order.paymentScreenshot}
                    alt="Payment proof"
                    className="rounded-xl border border-border max-h-64 hover:opacity-90 transition-opacity"
                  />
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">No screenshot uploaded</p>
              )}
            </div>
          </div>

          {/* right: edit */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                disabled={saving}
                className="bg-primary hover:bg-primary/90"
                onClick={() => quickAction("confirmed", true)}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve advance
              </Button>
              <Button
                size="sm"
                disabled={saving}
                variant="destructive"
                onClick={() => quickAction("rejected")}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
              </Button>
              <Button
                size="sm"
                disabled={saving}
                variant="outline"
                onClick={() => quickAction("delivered", true)}
              >
                <Truck className="w-3.5 h-3.5 mr-1" /> Mark delivered
              </Button>
              <Button
                size="sm"
                disabled={saving}
                className="bg-accent text-accent-foreground hover:opacity-90"
                onClick={() => quickAction("completed", true, true)}
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark fully paid
              </Button>
            </div>

            <div className="border-t border-border/40 pt-4 space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Manual edit</p>
              <div>
                <Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Order["status"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending_payment_review">Pending review</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Confirmed delivery date</Label>
                <Input
                  type="date"
                  value={form.confirmedDeliveryDate}
                  onChange={(e) => setForm({ ...form, confirmedDeliveryDate: e.target.value })}
                />
              </div>

              <div>
                <Label className="text-xs">Advance amount (₹)</Label>
                <Input
                  type="number"
                  value={form.advanceAmount}
                  onChange={(e) => setForm({ ...form, advanceAmount: parseInt(e.target.value) || 0 })}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Final = ₹{(order.totalAmount - form.advanceAmount).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.advancePaid}
                    onChange={(e) => setForm({ ...form, advancePaid: e.target.checked })}
                  />
                  Advance paid
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.finalPaid}
                    onChange={(e) => setForm({ ...form, finalPaid: e.target.checked })}
                  />
                  Final paid
                </label>
              </div>

              <div>
                <Label className="text-xs">Note to customer</Label>
                <Textarea
                  rows={2}
                  value={form.adminNote}
                  onChange={(e) => setForm({ ...form, adminNote: e.target.value })}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" /> Save changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-right">{value}</span>
  </div>
);

const SettingsPanel = ({
  settings,
  onSaved,
}: {
  settings: Settings;
  onSaved: (s: Settings) => void;
}) => {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleQrUpload = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error("QR image too large (max 2MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, qrCodeUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const updateTier = (i: number, patch: Partial<PriceTier>) => {
    const tiers = [...form.tiers];
    tiers[i] = { ...tiers[i], ...patch };
    setForm({ ...form, tiers });
  };

  const addTier = () => {
    const last = form.tiers[form.tiers.length - 1];
    setForm({
      ...form,
      tiers: [
        ...form.tiers,
        { minQty: (last?.maxQty || last?.minQty || 0) + 1, maxQty: null, pricePerTray: 150 },
      ],
    });
  };

  const removeTier = (i: number) => {
    setForm({ ...form, tiers: form.tiers.filter((_, idx) => idx !== i) });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const next = await updateSettings(form);
      onSaved(next);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* QR + advance */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <h3 className="font-display text-lg">Payment QR Code</h3>
        <p className="text-xs text-muted-foreground">
          Customers scan this to pay the advance. Recommend a UPI/bank QR.
        </p>
        {form.qrCodeUrl ? (
          <img src={form.qrCodeUrl} alt="QR" className="w-48 h-48 rounded-xl bg-white p-3" />
        ) : (
          <div className="w-48 h-48 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-sm">
            No QR uploaded
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleQrUpload(e.target.files[0])}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()}>
          <Upload className="w-4 h-4 mr-2" /> Upload QR
        </Button>

        <div className="border-t border-border/40 pt-4 space-y-4">
          <div>
            <Label className="text-sm">Advance payment %</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={form.advancePercent}
              onChange={(e) => setForm({ ...form, advancePercent: parseInt(e.target.value) || 0 })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              % of total amount the customer pays online upfront. Default 10%.
            </p>
          </div>

          <div>
            <Label className="text-sm">Daily Production Capacity (Trays)</Label>
            <Input
              type="number"
              min={1}
              value={form.dailyProductionCapacity ?? 800}
              onChange={(e) => setForm({ ...form, dailyProductionCapacity: parseInt(e.target.value) || 800 })}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Standard daily production capacity (default 800 trays). Powers real-time inventory and pending stock tracking.
            </p>
          </div>
        </div>
      </div>

      {/* tiers */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg">Price Tiers (per tray)</h3>
          <Button variant="outline" size="sm" onClick={addTier}>+ Tier</Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Bulk pricing brackets. Trays = 30 eggs each.
        </p>

        <div className="space-y-3">
          {form.tiers.map((t, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-end">
              <div>
                <Label className="text-[10px]">Min qty</Label>
                <Input
                  type="number"
                  value={t.minQty}
                  onChange={(e) => updateTier(i, { minQty: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label className="text-[10px]">Max qty (blank = ∞)</Label>
                <Input
                  type="number"
                  value={t.maxQty ?? ""}
                  onChange={(e) =>
                    updateTier(i, { maxQty: e.target.value === "" ? null : parseInt(e.target.value) })
                  }
                />
              </div>
              <div>
                <Label className="text-[10px]">₹/tray</Label>
                <Input
                  type="number"
                  value={t.pricePerTray}
                  onChange={(e) => updateTier(i, { pricePerTray: parseInt(e.target.value) || 0 })}
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => removeTier(i)}>
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="border-t border-border/40 pt-4">
          <Label className="text-sm">Fallback price (if no tier matches)</Label>
          <Input
            type="number"
            value={form.unitPrice}
            onChange={(e) => setForm({ ...form, unitPrice: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="lg:col-span-2">
        <Button onClick={handleSave} disabled={saving} className="bg-gradient-gold text-accent-foreground hover:opacity-90">
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" /> Save settings
        </Button>
      </div>
    </div>
  );
};
