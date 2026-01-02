"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface CaseStudyCardProps {
  title: string
  description: string
  category: string
  impact: string
  image?: string
  href?: string
  className?: string
}

export function CaseStudyCard({
  title,
  description,
  category,
  impact,
  image,
  href,
  className,
}: CaseStudyCardProps) {
  const content = (
    <Card variant="elevated" hover={!!href} className={cn("h-full", className)}>
      {image && (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl bg-muted relative">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline" className="mb-2">
            {category}
          </Badge>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-1">Impact</p>
            <p className="text-lg font-bold text-primary">{impact}</p>
          </div>
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Read full story <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </CardContent>
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

