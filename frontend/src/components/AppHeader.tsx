import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  MoreVertical,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAlerts, getUnreadCount, Alert } from "@/lib/alertsApi";

export default function AppHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // Bottom dock tabs for Admin
  const adminBottomTabs = [
    { label: "Admin", href: "/admin", icon: Shield },
    { label: "Revenue", href: "/revenue", icon: BarChart3 },
    { label: "Expenses", href: "/expenses", icon: ReceiptText },
    { label: "Profit", href: "/profit", icon: TrendingUp },
    { label: "AI", href: "/ai", icon: Bot },
  ];

  // Bottom dock tabs for Customer
  const customerBottomTabs = [
    { label: "Home", href: "/", icon: Egg },
    { label: "New Order", href: "/order", icon: ShoppingCart },
    { label: "My Orders", href: "/dashboard", icon: LayoutDashboard },
  ];

  const getTabClass = (path: string) => {
    const isActive = location.pathname === path;
    return isActive
      ? "bg-gradient-gold text-accent-foreground font-semibold shadow-glow hover:opacity-95 hover:bg-gradient-gold hover:text-accent-foreground rounded-full px-3.5"
      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full px-3.5";
  };

  return (
    <>
      <header className="sticky top-0 z-40 glass-strong border-b border-border/40">
        <nav className="container flex items-center justify-between py-3 md:py-4">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="relative inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-gold shadow-glow">
              <Egg className="w-4 h-4 text-accent-foreground" />
            </span>
            <span className="font-display text-lg md:text-xl tracking-tight">Star Poultry</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all ${getTabClass("/order")}`}
                  asChild
                >
                  <Link to="/order">
                    <ShoppingCart className="w-4 h-4 mr-1.5" /> New Order
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`transition-all ${getTabClass("/dashboard")}`}
                  asChild
                >
                  <Link to="/dashboard">
                    <LayoutDashboard className="w-4 h-4 mr-1.5" /> My Orders
                  </Link>
                </Button>
                {user.role === "admin" && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`transition-all ${getTabClass("/admin")}`}
                      asChild
                    >
                      <Link to="/admin">
                        <Shield className="w-4 h-4 mr-1.5" /> Admin
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`transition-all ${getTabClass("/revenue")}`}
                      asChild
                    >
                      <Link to="/revenue">
                        <BarChart3 className="w-4 h-4 mr-1.5" /> Revenue
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`transition-all ${getTabClass("/expenses")}`}
                      asChild
                    >
                      <Link to="/expenses">
                        <ReceiptText className="w-4 h-4 mr-1.5" /> Expenses
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`transition-all ${getTabClass("/profit")}`}
                      asChild
                    >
                      <Link to="/profit">
                        <TrendingUp className="w-4 h-4 mr-1.5" /> Profit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`mr-1 transition-all ${getTabClass("/ai")}`}
                      asChild
                    >
                      <Link to="/ai">
                        <Bot className="w-4 h-4 mr-1.5" /> AI Assistant
                      </Link>
                    </Button>

                    {/* Desktop Real-time Alerts Notification Bell */}
                    <DropdownMenu onOpenChange={handleDropdownOpen}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full mr-1">
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
                <span className="hidden lg:inline text-xs text-muted-foreground px-2">{user.businessName}</span>
                <Button variant="outline" size="sm" onClick={handleLogout} title="Sign Out">
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

          {/* Mobile Top Header Actions */}
          <div className="flex md:hidden items-center gap-1.5">
            {user && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2.5 text-xs rounded-full border-accent/40 text-accent hover:bg-accent/10"
                  asChild
                >
                  <Link to="/order">
                    <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                    Order
                  </Link>
                </Button>

                {user.role === "admin" && (
                  <DropdownMenu onOpenChange={handleDropdownOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full">
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[8px] font-bold text-white animate-pulse">
                            {unreadCount}
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 glass-strong border-border/50 p-2">
                      <div className="flex items-center justify-between px-2 py-1.5 border-b border-border/40 mb-2">
                        <span className="font-display text-xs font-semibold">Alerts</span>
                        {unreadCount > 0 && (
                          <span className="text-[9px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded-full">
                            {unreadCount} unread
                          </span>
                        )}
                      </div>
                      <div className="max-h-64 overflow-y-auto space-y-1.5">
                        {dropdownAlerts.map((alert) => (
                          <DropdownMenuItem
                            key={alert.id}
                            className="p-2 text-xs rounded-lg cursor-pointer"
                            onClick={() => navigate("/admin/alerts")}
                          >
                            <div>
                              <div className="font-medium text-foreground">{alert.title}</div>
                              <div className="text-[10px] text-muted-foreground line-clamp-1">{alert.message}</div>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </div>
                      <div className="border-t border-border/40 mt-2 pt-2">
                        <Button variant="outline" size="sm" className="w-full text-xs h-7" asChild>
                          <Link to="/admin/alerts">View All Alerts</Link>
                        </Button>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Mobile User & Secondary Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full glass">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 glass-strong border-border/50 p-2">
                    <DropdownMenuLabel className="font-normal text-xs text-muted-foreground truncate">
                      {user.businessName || user.email}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuItem onClick={() => navigate("/dashboard")} className="text-xs cursor-pointer">
                      <LayoutDashboard className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> My Orders
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/order")} className="text-xs cursor-pointer">
                      <ShoppingCart className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Place New Order
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem onClick={() => navigate("/admin/alerts")} className="text-xs cursor-pointer">
                        <Bell className="w-3.5 h-3.5 mr-2 text-amber-400" /> Farm Alerts
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate("/")} className="text-xs cursor-pointer">
                      <Egg className="w-3.5 h-3.5 mr-2 text-muted-foreground" /> Landing Page
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border/40" />
                    <DropdownMenuItem onClick={handleLogout} className="text-xs text-red-400 cursor-pointer focus:text-red-400">
                      <LogOut className="w-3.5 h-3.5 mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
            {!user && (
              <Button asChild size="sm" className="bg-gradient-gold text-accent-foreground text-xs h-8 px-3">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </nav>
      </header>

      {/* Mobile App Bottom Navigation Bar (Dock) */}
      {user && (
        <nav
          className="md:hidden fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-border/50 py-1 px-1 flex items-center justify-around shadow-2xl backdrop-blur-xl"
          style={{ paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))" }}
          aria-label="Mobile Navigation"
        >
          {(user.role === "admin" ? adminBottomTabs : customerBottomTabs).map((tab) => {
            const isActive = location.pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                to={tab.href}
                className={`relative flex-1 flex flex-col items-center justify-center py-1.5 px-1 transition-all rounded-xl ${
                  isActive
                    ? "text-accent font-medium bg-accent/10 shadow-[0_0_15px_hsl(var(--accent)/0.15)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1 w-6 h-0.5 rounded-full bg-accent shadow-[0_0_8px_hsl(var(--accent))]" />
                )}
                <Icon
                  className={`w-4 h-4 mb-0.5 transition-transform ${
                    isActive ? "scale-110 text-accent drop-shadow-[0_0_6px_hsl(var(--accent)/0.6)]" : ""
                  }`}
                />
                <span className={`text-[10px] tracking-tight leading-tight ${isActive ? "font-semibold text-accent" : ""}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
