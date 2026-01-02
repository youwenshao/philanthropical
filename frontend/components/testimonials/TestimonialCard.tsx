"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Quote } from "lucide-react"

interface TestimonialCardProps {
  name: string
  role: string
  content: string
  image?: string
  className?: string
}

export function TestimonialCard({
  name,
  role,
  content,
  image,
  className,
}: TestimonialCardProps) {
  return (
    <Card variant="elevated" className={cn("h-full", className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Quote className="h-8 w-8 text-primary/50" />
          <p className="text-base leading-relaxed text-foreground">
            {content}
          </p>
          <div className="flex items-center gap-4 pt-4 border-t">
            {image ? (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-semibold">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

