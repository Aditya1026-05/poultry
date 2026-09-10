import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Info,
  Check,
  RefreshCcw,
  Clock,
  ExternalLink,
} from "lucide-react";
import AppHeader from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAlerts,
  markAlertRead,
  markAllAlertsRead,
  deleteAlert,
  Alert,
} from "@/lib/alertsApi";
import { toast } from "sonner";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await getAlerts();
      setAlerts(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markAlertRead(id);
      setAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isRead: true } : a))
      );
      toast.success("Alert marked as read");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
      toast.success("Alert deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAlertsRead();
      setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
      toast.success("All alerts marked as read");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Action failed");
    }
  };

  // Group alerts by severity
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warningAlerts = alerts.filter((a) => a.severity === "warning");
  const infoAlerts = alerts.filter((a) => a.severity === "info");

  // Format Date ISO helper
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen pb-12">
      <AppHeader />
      <main className="container py-10 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-semibold">Admin Area</p>
              <h1 className="mt-3 font-display text-4xl md:text-5xl tracking-normal">
                Alert <span className="text-gradient-gold">Center</span>
              </h1>
              <p className="mt-2 text-muted-foreground">
                Track and manage automated real-time business health and operation metrics.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadAlerts}>
                <RefreshCcw className="w-4 h-4 mr-2" /> Refresh
              </Button>
              {alerts.some((a) => !a.isRead) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"
                  onClick={handleMarkAllRead}
                >
                  <Check className="w-4 h-4 mr-2" /> Mark All Read
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Clock className="w-8 h-8 animate-spin text-accent" />
              <span>Loading business alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="glass-strong rounded-3xl p-16 text-center max-w-2xl mx-auto">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
              <h3 className="font-display text-2xl mb-2 text-foreground">Everything looks perfect!</h3>
              <p className="text-muted-foreground">
                No active health warnings, profit risks, or client issues found. Check back later as operations change.
              </p>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Critical Alerts */}
              {criticalAlerts.length > 0 && (
                <AlertSection
                  title="Critical Alerts"
                  description="Immediate action items impacting business health or profitability."
                  alerts={criticalAlerts}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                />
              )}

              {/* Warning Alerts */}
              {warningAlerts.length > 0 && (
                <AlertSection
                  title="Warning Alerts"
                  description="Potential risks and operational inefficiencies needing review."
                  alerts={warningAlerts}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                />
              )}

              {/* Informational Alerts */}
              {infoAlerts.length > 0 && (
                <AlertSection
                  title="Informational Alerts"
                  description="Operational changes and status notifications."
                  alerts={infoAlerts}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                />
              )}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

// Subsection component to organize lists cleanly
interface AlertSectionProps {
  title: string;
  description: string;
  alerts: Alert[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (iso: string) => string;
}

function AlertSection({
  title,
  description,
  alerts,
  onMarkRead,
  onDelete,
  formatDate,
}: AlertSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-2xl text-foreground flex items-center gap-2">
          {title === "Critical Alerts" ? (
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          ) : title === "Warning Alerts" ? (
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          )}
          {title}
          <Badge variant="secondary" className="ml-2 font-mono">
            {alerts.length}
          </Badge>
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="grid gap-4">
        {alerts.map((alert) => {
          // Determine visual styling based on status
          const isResolved = alert.isResolved;
          const isUnread = !alert.isRead && !isResolved;
          
          let severityBadgeColor = "";
          let icon = <Info className="w-5 h-5 text-blue-400" />;
          let borderStyle = "border-l-blue-500";
          
          if (alert.severity === "critical") {
            severityBadgeColor = "bg-red-500/10 text-red-400 border-red-500/20";
            icon = <AlertTriangle className="w-5 h-5 text-red-500" />;
            borderStyle = "border-l-red-500";
          } else if (alert.severity === "warning") {
            severityBadgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
            icon = <AlertTriangle className="w-5 h-5 text-amber-500" />;
            borderStyle = "border-l-amber-500";
          } else {
            severityBadgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
          }

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`glass-strong rounded-2xl p-5 border-l-4 ${borderStyle} ${
                isResolved ? "opacity-75" : ""
              } transition-all duration-300 hover:border-r hover:border-r-border/20`}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="mt-1 p-2 rounded-xl bg-muted/30">{icon}</div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-lg text-foreground">
                        {alert.title}
                      </h3>
                      <Badge variant="outline" className={`text-[10px] ${severityBadgeColor}`}>
                        {alert.severity}
                      </Badge>
                      {isResolved ? (
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                          Resolved
                        </Badge>
                      ) : isUnread ? (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                          Unread
                        </Badge>
                      ) : null}
                    </div>

                    <p className="mt-1.5 text-sm text-foreground/90 font-medium">
                      {alert.message}
                    </p>

                    {/* Metadata rendering */}
                    {alert.metadata && Object.keys(alert.metadata).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {Object.entries(alert.metadata).map(([k, v]) => (
                          <div
                            key={k}
                            className="bg-muted/40 px-2.5 py-1 rounded-lg border border-border/20 flex gap-1.5"
                          >
                            <span className="font-medium capitalize text-foreground/50">{k}:</span>
                            <span className="font-semibold text-foreground/80">
                              {typeof v === "number" && k.toLowerCase().includes("profit")
                                ? `₹${v.toLocaleString("en-IN")}`
                                : typeof v === "number" && k.toLowerCase().includes("revenue")
                                ? `₹${v.toLocaleString("en-IN")}`
                                : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Created {formatDate(alert.createdAt)}</span>
                      {alert.updatedAt && alert.updatedAt !== alert.createdAt && (
                        <>
                          <span className="mx-1.5">•</span>
                          <span>Updated {formatDate(alert.updatedAt)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-center sm:self-auto">
                  {isUnread && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs hover:bg-muted"
                      onClick={() => onMarkRead(alert.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5 text-muted-foreground" />
                      Mark Read
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive-foreground"
                    onClick={() => onDelete(alert.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
