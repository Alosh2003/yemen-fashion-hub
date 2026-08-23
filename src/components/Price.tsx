import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { formatNumber, formatNewCurrency } from "@/lib/price";
import { cn } from "@/lib/utils";

interface PriceProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  /** Show the two currencies side by side (default) or stacked */
  layout?: "row" | "column";
}

const sizeMap = {
  sm: { main: "text-sm", second: "text-[10px]" },
  md: { main: "text-base", second: "text-[11px]" },
  lg: { main: "text-3xl", second: "text-sm" },
};

/** Displays a price in the old currency and, next to it, the same price in the new currency. */
const Price = ({ value, className, size = "md", layout = "row" }: PriceProps) => {
  const { settings } = useSiteSettings();
  const rate = Number(settings.currency_rate) || 0;
  const dual = settings.show_dual_currency !== false && rate > 0;

  return (
    <span
      className={cn(
        "inline-flex gap-x-2 gap-y-0.5",
        layout === "row" ? "flex-wrap items-baseline" : "flex-col items-start",
        className
      )}
    >
      <span className={cn("font-black text-primary whitespace-nowrap", sizeMap[size].main)}>
        {formatNumber(value)}
        <span className="mx-1 font-normal opacity-80">{settings.currency_old_label || "ريال قديم"}</span>
      </span>
      {dual && (
        <span
          className={cn(
            "whitespace-nowrap rounded-md bg-secondary/60 px-1.5 py-0.5 font-bold text-muted-foreground",
            sizeMap[size].second
          )}
        >
          {formatNewCurrency(value, rate)}
          <span className="mx-1 font-normal">{settings.currency_new_label || "ريال جديد"}</span>
        </span>
      )}
    </span>
  );
};

export default Price;
