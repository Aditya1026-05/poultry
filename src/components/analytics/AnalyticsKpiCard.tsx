import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyticsKpiCardProps {
  title: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}

const toneClass: Record<NonNullable<AnalyticsKpiCardProps["tone"]>, string> = {
  default: "text-accent bg-accent/10 border-accent/20",
  success: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  warning: "text-yellow-300 bg-yellow-500/10 border-yellow-500/20",
  danger: "text-red-300 bg-red-500/10 border-red-500/20",
};

export default function AnalyticsKpiCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "default",
}: AnalyticsKpiCardProps) {
  return (
    <Card className="glass-strong border-border/50">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 font-display text-2xl md:text-3xl leading-none">{value}</p>
            {description && <p className="mt-2 text-xs text-muted-foreground">{description}</p>}
          </div>
          <span className={`rounded-xl border p-2.5 ${toneClass[tone]}`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
