import { cn } from '@/lib/utils';

type Status = 'draft' | 'sent' | 'approved' | 'rejected';

const statusConfig: Record<Status, { label: string; className: string }> = {
  draft: {
    label: 'Borrador',
    className: 'bg-muted text-muted-foreground border-border',
  },
  sent: {
    label: 'Enviada',
    className: 'bg-accent text-accent-foreground border-border',
  },
  approved: {
    label: 'Aprobada',
    className: 'bg-primary text-primary-foreground border-border',
  },
  rejected: {
    label: 'Rechazada',
    className: 'bg-destructive text-destructive-foreground border-destructive',
  },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() as Status;
  const config = statusConfig[normalizedStatus] || {
    label: status || 'Desconocido',
    className: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wide border-2 rounded-lg',
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
