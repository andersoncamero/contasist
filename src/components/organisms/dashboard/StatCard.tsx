import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/molecules/Card";

interface StatCardProps {
  title: React.ReactNode;
  value: string | number;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <Card className="border-2 border-border shadow-sm transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6 py-4 pb-2 gap-4">
        <CardTitle className="text-xs font-bold uppercase tracking-wide text-muted-foreground line-clamp-2">
          {title}
        </CardTitle>
        <div className="shrink-0 border-2 border-border bg-secondary p-2 rounded-lg">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
      </CardHeader>
      <CardContent className="px-6 pb-4 pt-0">
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground truncate">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
