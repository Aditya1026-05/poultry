import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Package, CalendarDays, IndianRupee, CheckCircle2, Clock, XCircle, Truck, LockKeyhole, Loader2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            <div className="grid gap-4">
              {orders.map((o) => {
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
