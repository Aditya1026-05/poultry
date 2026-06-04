import { formatCurrency } from "@/lib/financeApi";

interface TooltipPayload {
  name: string;
  value: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  label?: string;
  payload?: TooltipPayload[];
  currencyKeys?: string[];
}

export default function ChartTooltip({
  active,
  label,
  payload,
  currencyKeys = [],
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-xl border border-border bg-card/95 p-3 shadow-soft">
      <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
      <div className="space-y-1">
        {payload.map((item) => {
          const isCurrency = currencyKeys.includes(item.name);
          return (
            <div key={item.name} className="flex items-center justify-between gap-5 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-medium text-foreground">
                {isCurrency ? formatCurrency(item.value) : item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
