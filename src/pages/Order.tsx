import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarDays, Loader2, Minus, Plus, Upload, Egg } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Settings,
  createOrder,
  getPriceForQuantity,
  getSettings,
} from "@/lib/mockApi";
import { toast } from "sonner";

export default function Order() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [screenshot, setScreenshot] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSettings().then(setSettings);
    // default delivery date = 3 days from now
    const d = new Date();
    d.setDate(d.getDate() + 3);
    setDeliveryDate(d.toISOString().slice(0, 10));
  }, []);

  const pricePerTray = useMemo(
    () => (settings ? getPriceForQuantity(quantity, settings) : 0),
    [quantity, settings]
  );
  const total = pricePerTray * quantity;
  const advance = settings ? Math.round((total * settings.advancePercent) / 100) : 0;
  const final = total - advance;

  const handleFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large (max 5MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      toast.error("Please upload your payment screenshot");
      return;
    }
    if (quantity < 1) {
      toast.error("Quantity must be at least 1 tray");
      return;
    }
    setSubmitting(true);
    try {
      await createOrder({
        quantity,
        preferredDeliveryDate: deliveryDate,
        paymentScreenshot: screenshot,
      });
      toast.success("Order placed! Awaiting admin approval.");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="container py-20 text-center text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="container py-10 md:py-16 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-10">
            <h1 className="font-display text-4xl md:text-5xl tracking-tight mb-2">
              Place an <span className="text-gradient-gold">Order</span>
            </h1>
            <p className="text-muted-foreground">
              Farm-fresh egg trays · 30 eggs per tray · bulk pricing
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_380px] gap-8">
            {/* form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* quantity */}
              <div className="glass-strong rounded-2xl p-6">
                <Label className="text-base mb-4 block">Quantity (trays)</Label>
                <div className="flex items-center gap-3 mb-4">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="text-center text-2xl font-display h-14 max-w-[140px]"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground ml-2">
                    = {quantity * 30} eggs
                  </span>
                </div>

                {/* tier hint */}
                <div className="grid sm:grid-cols-3 gap-2 text-xs">
                  {settings.tiers.map((t) => {
                    const active =
                      quantity >= t.minQty && (t.maxQty === null || quantity <= t.maxQty);
                    return (
                      <div
                        key={t.minQty}
                        className={`rounded-xl p-3 border transition-colors ${
                          active
                            ? "border-accent bg-accent/10 text-foreground"
                            : "border-border/40 text-muted-foreground"
                        }`}
                      >
                        <div className="font-medium">
                          {t.minQty}
                          {t.maxQty ? `–${t.maxQty}` : "+"} trays
                        </div>
                        <div>₹{t.pricePerTray}/tray</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* delivery */}
              <div className="glass-strong rounded-2xl p-6">
                <Label htmlFor="delivery" className="text-base mb-4 block">
                  <CalendarDays className="w-4 h-4 inline mr-2" />
                  Preferred delivery date
                </Label>
                <Input
                  id="delivery"
                  type="date"
                  required
                  min={minDate.toISOString().slice(0, 10)}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Admin will confirm the final delivery date after approval.
                </p>
              </div>

              {/* payment */}
              <div className="glass-strong rounded-2xl p-6">
                <Label className="text-base mb-3 block">
                  Pay {settings.advancePercent}% advance to confirm
                </Label>
                {settings.qrCodeUrl ? (
                  <div className="flex flex-col sm:flex-row gap-4 items-start mb-4">
                    <img
                      src={settings.qrCodeUrl}
                      alt="Payment QR code"
                      className="w-40 h-40 rounded-xl object-contain bg-white p-2"
                    />
                    <div className="text-sm text-muted-foreground">
                      <p className="text-foreground font-medium mb-1">
                        Scan & pay ₹{advance.toLocaleString("en-IN")}
                      </p>
                      <p>
                        After payment, upload your transaction screenshot below. Admin will verify
                        and confirm your order.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground mb-4">
                    QR code not configured by admin yet. Please contact us directly.
                  </div>
                )}

                <Label htmlFor="screenshot" className="block mb-2 text-sm">
                  Payment screenshot
                </Label>
                <input
                  ref={fileRef}
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                />
                {screenshot ? (
                  <div className="relative">
                    <img
                      src={screenshot}
                      alt="Payment proof"
                      className="max-h-64 rounded-xl border border-border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setScreenshot("")}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 hover:border-accent transition-colors flex flex-col items-center gap-2 text-muted-foreground"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm">Click to upload screenshot</span>
                    <span className="text-xs">PNG, JPG · max 5MB</span>
                  </button>
                )}
              </div>

              <Button
                type="submit"
                disabled={submitting}
                size="lg"
                className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Place Order
              </Button>
            </form>

            {/* summary */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="glass-strong rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Egg className="w-5 h-5 text-accent" />
                  <h3 className="font-display text-xl">Summary</h3>
                </div>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Trays</dt>
                    <dd>{quantity}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Total eggs</dt>
                    <dd>{quantity * 30}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Price per tray</dt>
                    <dd>₹{pricePerTray}</dd>
                  </div>
                  <div className="border-t border-border/40 my-2" />
                  <div className="flex justify-between text-base">
                    <dt>Total</dt>
                    <dd className="font-display">₹{total.toLocaleString("en-IN")}</dd>
                  </div>
                  <div className="flex justify-between text-accent">
                    <dt>Advance now ({settings.advancePercent}%)</dt>
                    <dd className="font-medium">₹{advance.toLocaleString("en-IN")}</dd>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <dt>Pay on delivery</dt>
                    <dd>₹{final.toLocaleString("en-IN")}</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
