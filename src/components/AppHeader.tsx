import { Link, useNavigate } from "react-router-dom";
import { Egg, LogOut, LayoutDashboard, ShoppingCart, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-border/40">
      <nav className="container flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-gradient-gold shadow-glow">
            <Egg className="w-4 h-4 text-accent-foreground" />
          </span>
          <span className="font-display text-xl tracking-tight">Star Poultry</span>
        </Link>

        <div className="flex items-center gap-2">
          {user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/order">
                  <ShoppingCart className="w-4 h-4 mr-2" /> New Order
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">
                  <LayoutDashboard className="w-4 h-4 mr-2" /> My Orders
                </Link>
              </Button>
              {user.role === "admin" && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin">
                    <Shield className="w-4 h-4 mr-2" /> Admin
                  </Link>
                </Button>
              )}
              <span className="hidden sm:inline text-sm text-muted-foreground px-2">{user.businessName}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
          {!user && (
            <Button asChild size="sm" className="bg-gradient-gold text-accent-foreground hover:opacity-90">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </nav>
    </header>
  );
}
