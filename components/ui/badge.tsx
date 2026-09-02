import { cn } from "@/lib/utils";
import { OrderStatus } from "@prisma/client";
import { ORDER_STATUS_CONFIG } from "@/lib/constants";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  color?: "green" | "blue" | "yellow" | "red" | "purple" | "gray";
}

export function Badge({ children, className, color = "gray" }: BadgeProps) {
  const colorMap = {
    green: "bg-green-400/10 text-green-400 border-green-400/20",
    blue: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    yellow: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    red: "bg-red-400/10 text-red-400 border-red-400/20",
    purple: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    gray: "bg-ink-4/10 text-ink-3 border-line",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md border",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}

// Status badge spécifique au pipeline COD
export function StatusBadge({ status }: { status: OrderStatus }) {
  const config = ORDER_STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-md",
        config.bg,
        config.color
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}
