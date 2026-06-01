import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { forgotPassword } from "@/lib/mockApi";

export default function ForgotPassword() {
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      await forgotPassword(forgotEmail);

      alert("Password reset link sent successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-20">
      <h1 className="text-3xl font-bold mb-2">
        Forgot Password
      </h1>

      <p className="text-muted-foreground mb-6">
        Enter your account email and we will send a password reset link.
      </p>

      <form
        onSubmit={handleForgotPassword}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="forgot-email">
            Email
          </Label>

          <Input
            id="forgot-email"
            type="email"
            required
            value={forgotEmail}
            onChange={(e) =>
              setForgotEmail(e.target.value)
            }
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-gold text-accent-foreground hover:opacity-90"
        >
          {loading && (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          )}

          Send reset link
        </Button>
      </form>
    </div>
  );
}