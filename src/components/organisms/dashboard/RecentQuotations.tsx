import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/atoms/StatusBadge';
import { formatCurrency } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { useQuotation } from '@/useCases/useQuotation';

export function RecentQuotations() {
  const { quotations } = useQuotation();
  const recentQuotations = [...quotations]
    .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="border-2 border-border bg-card rounded-lg">
      <div className="flex items-center justify-between border-b-2 border-border p-4">
        <h2 className="text-lg font-bold">Cotizaciones Recientes</h2>
        <Link
          to="/quotations"
          className="flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="divide-y-2 divide-border">
        {recentQuotations.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No hay cotizaciones aún
          </div>
        ) : (
          recentQuotations.map((quotation) => (
            <Link
              key={quotation.ID}
              to={`/quotations/${quotation.ID}`}
              className="flex items-center justify-between p-4 transition-colors hover:bg-accent"
            >
              <div>
                <p className="font-bold">{quotation.Number}</p>
                <p className="text-sm text-muted-foreground">{quotation.ClientName}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold">
                  {formatCurrency(quotation.Total)}
                </span>
                <StatusBadge status={quotation.Status} />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
