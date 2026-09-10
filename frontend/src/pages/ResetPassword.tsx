import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Egg, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/mockApi";
import { toast } from "sonner";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Reset link is missing a token");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ token, newPassword: form.newPassword });
      toast.success("Password reset. Please sign in.");
      navigate("/auth");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-radial-gold)" }} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-gold shadow-glow">
            <Egg className="w-5 h-5 text-accent-foreground" />
          </span>
          <span className="font-display text-2xl tracking-tight">Star Poultry</span>
        </Link>

        <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-8 shadow-soft space-y-4">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl mb-1">Reset Password</h1>
            <p className="text-sm text-muted-foreground">Choose a new password for your account</p>
          </div>

          <div>
            <Label htmlFor="reset-new-password">New password</Label>
            <Input
              id="reset-new-password"
              type="password"
              minLength={6}
              required
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="reset-confirm-password">Confirm password</Label>
            <Input
              id="reset-confirm-password"
              type="password"
              minLength={6}
              required
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
          <Button type="submit" disabled={loading || !token} className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Reset password
          </Button>
          {!token && <p className="text-xs text-destructive text-center">This reset link is invalid.</p>}
        </form>
      </motion.div>
    </div>
  );
}
