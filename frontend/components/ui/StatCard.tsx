"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon?: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  className?: string
  variant?: "default" | "elevated" | "outlined" | "gradient"
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  variant = "default",
}: StatCardProps) {
  return (
    <Card variant={variant} className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          {Icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {trend && (
            <div
              className={cn(
                "text-sm font-medium",
                trend.isPositive ? "text-secondary" : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

