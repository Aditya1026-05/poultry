import { useEffect, useRef, useState } from "react";
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
  getAllOrders,
  getSettings,
  updateOrder,
  updateSettings,
} from "@/lib/mockApi";
import { toast } from "sonner";

export default function Admin() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Order | null>(null);
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

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


  const refresh = async () => {
    const [o, s] = await Promise.all([getAllOrders(), getSettings()]);
    setOrders(o);
    setSettings(s);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    checkCriticalAlerts();
  }, []);


  if (loading || !settings) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="container py-20 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const stats = {
    pending: orders.filter((o) => o.status === "pending_payment_review").length,
    active: orders.filter((o) => o.status === "confirmed" || o.status === "delivered").length,
    completed: orders.filter((o) => o.status === "completed").length,
    revenue: orders
      .filter((o) => o.status === "completed")
      .reduce((s, o) => s + o.totalAmount, 0),
  };

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 md:py-16">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-2">
              Admin <span className="text-gradient-gold">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">Manage orders, prices, and payments</p>
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
              <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
              <TabsTrigger value="settings">
                <SettingsIcon className="w-4 h-4 mr-1.5" /> Pricing & QR
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              {orders.length === 0 ? (
                <div className="glass-strong rounded-3xl p-12 text-center">
                  <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {orders.map((o) => (
                    <OrderRow key={o.id} order={o} onView={() => setSelected(o)} />
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

        <div className="border-t border-border/40 pt-4">
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
