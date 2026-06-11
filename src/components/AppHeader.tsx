import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Egg,
  LogOut,
  LayoutDashboard,
  ReceiptText,
  ShoppingCart,
  Shield,
  TrendingUp,
  Bot,
  Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAlerts, getUnreadCount, Alert } from "@/lib/alertsApi";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownAlerts, setDropdownAlerts] = useState<Alert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);

  // Fetch count of unread & unresolved alerts
  const fetchCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchCount();
      // Poll unread count every 30 seconds
      const interval = setInterval(fetchCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Fetch latest 5 alerts when user clicks the notification bell
  const handleDropdownOpen = async (open: boolean) => {
    if (open) {
      setAlertsLoading(true);
      try {
        const data = await getAlerts();
        setDropdownAlerts(data.slice(0, 5));
        
        // Refresh local count from list
        const activeUnread = data.filter((a) => !a.isRead && !a.isResolved).length;
        setUnreadCount(activeUnread);
      } catch (err) {
        console.error("Failed to fetch dropdown alerts:", err);
      } finally {
        setAlertsLoading(false);
      }
    }
  };

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
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">
                      <Shield className="w-4 h-4 mr-2" /> Admin
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/revenue">
                      <BarChart3 className="w-4 h-4 mr-2" /> Revenue
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/expenses">
                      <ReceiptText className="w-4 h-4 mr-2" /> Expenses
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/profit">
                      <TrendingUp className="w-4 h-4 mr-2" /> Profit
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild className="mr-1">
                    <Link to="/ai">
                      <Bot className="w-4 h-4 mr-2" /> AI Assistant
                    </Link>
                  </Button>

                  {/* Real-time Alerts Notification Bell */}
                  <DropdownMenu onOpenChange={handleDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full mr-2">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 glass-strong border-border/50 p-2">
                      <div className="flex items-center justify-between px-3 py-2 border-b border-border/40 mb-2">
                        <span className="font-display text-sm font-semibold">Recent Alerts</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>

                      {alertsLoading ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">Loading alerts...</div>
                      ) : dropdownAlerts.length === 0 ? (
                        <div className="py-8 text-center text-xs text-muted-foreground">No alerts found</div>
                      ) : (
                        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
                          {dropdownAlerts.map((alert) => {
                            const borderColors = {
                              critical: "border-l-red-500 bg-red-500/5",
                              warning: "border-l-amber-500 bg-amber-500/5",
                              info: "border-l-blue-500 bg-blue-500/5",
                            };
                            const textColors = {
                              critical: "text-red-400",
                              warning: "text-amber-400",
                              info: "text-blue-400",
                            };
                            return (
                              <DropdownMenuItem
                                key={alert.id}
                                className={`flex flex-col items-start p-2.5 rounded-xl border-l-4 ${borderColors[alert.severity]} hover:bg-muted/40 transition-colors focus:bg-muted/40 cursor-pointer`}
                                onClick={() => navigate("/admin/alerts")}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${textColors[alert.severity]}`}>
                                    {alert.severity}
                                  </span>
                                  {!alert.isRead && !alert.isResolved && (
                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                  )}
                                  {alert.isResolved && (
                                    <span className="text-[9px] text-emerald-400 font-medium">Resolved</span>
                                  )}
                                </div>
                                <h4 className="font-semibold text-xs mt-1 text-foreground">{alert.title}</h4>
                                <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{alert.message}</p>
                              </DropdownMenuItem>
                            );
                          })}
                        </div>
                      )}

                      <div className="border-t border-border/40 mt-2 pt-2 px-1">
                        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
                          <Link to="/admin/alerts">View All Alerts</Link>
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
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
