import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Egg, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { changePassword, forgotPassword } from "@/lib/mockApi";
import { toast } from "sonner";

export default function Auth() {
  const { user, login, signup } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const initialTab =
    params.get("mode") === "signup"
      ? "signup"
      : params.get("mode") === "password"
        ? "password"
        : params.get("mode") === "forgot"
          ? "forgot"
          : "login";
  
  const [loading, setLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    email: "",
    password: "",
    businessName: "",
    phone: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(loginForm.email, loginForm.password);
      toast.success(`Welcome back, ${u.businessName}`);
      navigate(u.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(signupForm);
      toast.success("Account created — welcome!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please sign in before changing your password");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Password updated");
      navigate(user.role === "admin" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(forgotEmail);
      toast.success("If that email exists, a reset link has been sent.");
      setForgotEmail("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reset link");
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

        <div className="glass-strong rounded-3xl p-8 shadow-soft">
          <h1 className="font-display text-2xl mb-1 text-center">Business Account</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Order farm-fresh egg trays in bulk
          </p>

          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Sign in
                </Button>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  <button
  type="button"
  className="hover:text-foreground transition-colors"
  onClick={() => navigate("/forgot-password")}
>
  Forgot password?
</button>
                </p>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="signup-business">Business name</Label>
                  <Input
                    id="signup-business"
                    required
                    value={signupForm.businessName}
                    onChange={(e) => setSignupForm({ ...signupForm, businessName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-phone">Phone</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    required
                    value={signupForm.phone}
                    onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    required
                    value={signupForm.email}
                    onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    minLength={6}
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create account
                </Button>
              </form>
            </TabsContent>

            {/* <TabsContent value="forgot">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter your account email and we will send a password reset link.
                </p>
                <div>
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90">
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send reset link
                </Button>
              </form>
            </TabsContent> */}

            <TabsContent value="password">
              {user ? (
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Signed in as <span className="text-foreground">{user.email}</span>
                  </p>
                  <div>
                    <Label htmlFor="auth-current-password">Current password</Label>
                    <Input
                      id="auth-current-password"
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="auth-new-password">New password</Label>
                    <Input
                      id="auth-new-password"
                      type="password"
                      minLength={6}
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="auth-confirm-password">Confirm new password</Label>
                    <Input
                      id="auth-confirm-password"
                      type="password"
                      minLength={6}
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90">
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update password
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Sign in first, then open this tab to update your password.
                  </p>
                  <Button type="button" className="w-full" onClick={() => toast.error("Please sign in first")}>
                    Change password
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
}
