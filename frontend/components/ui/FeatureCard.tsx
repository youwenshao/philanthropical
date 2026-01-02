"use client"

import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
  title: string
  description: string
  icon?: LucideIcon
  href?: string
  className?: string
  variant?: "default" | "elevated" | "outlined" | "gradient"
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  className,
  variant = "default",
}: FeatureCardProps) {
  const content = (
    <Card variant={variant} hover={!!href} className={cn("h-full", className)}>
      <CardHeader>
        {Icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      {href && (
        <CardContent>
          <Link
            href={href}
            className="text-sm font-medium text-primary hover:underline"
          >
            Learn more →
          </Link>
        </CardContent>
      )}
    </Card>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {content}
      </Link>
    )
  }

  return content
}

