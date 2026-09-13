import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Plus,
  Package,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  LockKeyhole,
  Loader2,
  Search,
  ArrowUpDown,
  X,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Order, changePassword, getMyOrders } from "@/lib/mockApi";
import { toast } from "sonner";

const statusMeta: Record<Order["status"], { label: string; icon: React.ElementType; className: string }> = {
  pending_payment_review: { label: "Awaiting approval", icon: Clock, className: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, className: "bg-primary/10 text-primary border-primary/30" },
  delivered: { label: "Delivered", icon: Truck, className: "bg-accent/10 text-accent border-accent/30" },
  completed: { label: "Completed", icon: CheckCircle2, className: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" },
  rejected: { label: "Rejected", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/30" },
};

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("date_desc");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    getMyOrders().then((o) => {
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const filteredAndSortedOrders = useMemo(() => {
    return orders
      .filter((o) => {
        if (statusFilter !== "all" && o.status !== statusFilter) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = o.id?.toLowerCase().includes(q);
          const matchQuantity = o.quantity?.toString().includes(q);
          const matchAmount = o.totalAmount?.toString().includes(q);
          if (!matchId && !matchQuantity && !matchAmount) {
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
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  }, [orders, searchQuery, sortBy, statusFilter]);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, sortBy, statusFilter]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
            <div>
              <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-2">
                My <span className="text-gradient-gold">Orders</span>
              </h1>
              <p className="text-muted-foreground">Track your bulk egg orders and payments</p>
            </div>
            <Button asChild className="bg-gradient-gold text-accent-foreground hover:opacity-90">
              <Link to="/order">
                <Plus className="w-4 h-4 mr-2" /> New Order
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground py-20">Loading…</div>
          ) : orders.length === 0 ? (
            <div className="glass-strong rounded-3xl p-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Place your first bulk order to get started.</p>
              <Button asChild className="bg-gradient-gold text-accent-foreground hover:opacity-90">
                <Link to="/order">Order now</Link>
              </Button>
            </div>
          ) : (
            <>
              {/* Search and Sort Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by order ID, quantity, amount..."
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

                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px] sm:w-[155px] glass-strong rounded-xl text-xs h-10 border-border/60">
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

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[170px] sm:w-[190px] glass-strong rounded-xl text-xs h-10 border-border/60">
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {filteredAndSortedOrders.length === 0 ? (
                <div className="glass-strong rounded-2xl p-10 text-center">
                  <Search className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                  <h3 className="font-display text-lg mb-1">No orders found</h3>
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
                  <div className="grid gap-4">
                    {filteredAndSortedOrders.slice(0, visibleCount).map((o) => {
                  const meta = statusMeta[o.status];
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={o.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-strong rounded-2xl p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-mono">#{o.id.slice(-8).toUpperCase()}</p>
                          <h3 className="font-display text-xl mt-1">{o.quantity} trays</h3>
                          <p className="text-sm text-muted-foreground">
                            Placed {new Date(o.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${meta.className}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {meta.label}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                            <IndianRupee className="w-3 h-3" /> Total
                          </div>
                          <div className="font-medium">₹{o.totalAmount.toLocaleString("en-IN")}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                            Advance ({o.advancePercent}%)
                          </div>
                          <div className={o.advancePaid ? "text-emerald-300" : "text-muted-foreground"}>
                            ₹{o.advanceAmount.toLocaleString("en-IN")} {o.advancePaid && "✓"}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                            Final (offline)
                          </div>
                          <div className={o.finalPaid ? "text-emerald-300" : "text-muted-foreground"}>
                            ₹{o.finalAmount.toLocaleString("en-IN")} {o.finalPaid && "✓"}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-1">
                            <CalendarDays className="w-3 h-3" /> Delivery
                          </div>
                          <div>
                            {o.confirmedDeliveryDate
                              ? new Date(o.confirmedDeliveryDate).toLocaleDateString()
                              : `Requested: ${new Date(o.preferredDeliveryDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>

                      {o.adminNote && (
                        <div className="mt-4 p-3 rounded-xl bg-muted/40 text-sm">
                          <span className="text-muted-foreground">Admin note: </span>
                          {o.adminNote}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
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

          <form onSubmit={handlePasswordChange} className="glass-strong rounded-2xl p-6 mt-8 max-w-2xl">
            <div className="flex items-center gap-2 mb-5">
              <LockKeyhole className="w-5 h-5 text-accent" />
              <h2 className="font-display text-xl">Change password</h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="current-password">Current password</Label>
                <Input
                  id="current-password"
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  minLength={6}
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  minLength={6}
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" disabled={savingPassword} className="mt-5">
              {savingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update password
            </Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
