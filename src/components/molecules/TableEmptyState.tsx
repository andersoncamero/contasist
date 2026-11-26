import React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { cn } from "@/lib/utils";

interface TableEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  actionDisabled?: boolean;
  action?: React.ReactNode;
  compact?: boolean;
  className?: string;
}

export const tableEmptyStateButtonClassName =
  "bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2";

export function TableEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionIcon: ActionIcon,
  onAction,
  actionDisabled,
  action,
  compact = false,
  className,
}: TableEmptyStateProps) {
  const hasAction = Boolean(action || (actionLabel && onAction));

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center bg-card border-2 border-dashed border-slate-200 dark:border-border rounded-2xl animate-in fade-in zoom-in duration-500 shadow-sm text-center",
        compact ? "p-8" : "p-12",
        className
      )}
    >
      <div
        className={cn(
          "bg-primary/10 rounded-full flex items-center justify-center",
          compact ? "p-4 mb-4" : "p-5 mb-6"
        )}
      >
        <Icon className={cn("text-primary", compact ? "h-8 w-8" : "h-10 w-10")} />
      </div>
      <h3
        className={cn(
          "font-extrabold text-foreground mb-2",
          compact ? "text-xl" : "text-2xl"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "text-muted-foreground text-center max-w-sm font-medium",
            hasAction && (compact ? "mb-6" : "mb-8")
          )}
        >
          {description}
        </p>
      )}
      {hasAction && (
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
          {action ?? (
            <Button
              type="button"
              onClick={onAction}
              disabled={actionDisabled}
              className={tableEmptyStateButtonClassName}
            >
              {ActionIcon && <ActionIcon className="h-5 w-5" />}
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
