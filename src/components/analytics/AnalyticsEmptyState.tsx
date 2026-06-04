import { LucideIcon } from "lucide-react";

interface AnalyticsEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function AnalyticsEmptyState({
  icon: Icon,
  title,
  description,
}: AnalyticsEmptyStateProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/20 p-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-muted-foreground" />
      <h3 className="mt-4 font-display text-xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
