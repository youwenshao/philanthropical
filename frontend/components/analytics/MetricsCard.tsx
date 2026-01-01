import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  description?: string;
}

export function MetricsCard({ title, value, change, description }: MetricsCardProps) {
  const isPositive = change !== undefined && change >= 0;
  const hasChange = change !== undefined;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {hasChange && (
          <div className={cn("flex items-center text-xs mt-2", isPositive ? "text-green-600" : "text-red-600")}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 mr-1" />
            )}
            <span>{Math.abs(change).toFixed(1)}% from last period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

