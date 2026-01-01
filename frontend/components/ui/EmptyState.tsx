import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        {icon && <div className="mx-auto mb-4 text-muted-foreground">{icon}</div>}
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      {(action || secondaryAction) && (
        <CardContent className="flex flex-col sm:flex-row gap-2 justify-center">
          {action && (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

