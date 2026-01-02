"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

interface PartnerCardProps {
  name: string
  description: string
  category: string
  website?: string
  logo?: string
  className?: string
}

export function PartnerCard({
  name,
  description,
  category,
  website,
  logo,
  className,
}: PartnerCardProps) {
  return (
    <Card variant="elevated" className={cn("h-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-4">
          {logo ? (
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center">
              <div className="h-12 w-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded" />
            </div>
          ) : (
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-bold text-primary">
              {name.charAt(0)}
            </div>
          )}
          <Badge variant="outline">{category}</Badge>
        </div>
        <CardTitle className="text-xl">{name}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      {website && (
        <CardContent>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Visit website <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      )}
    </Card>
  )
}

