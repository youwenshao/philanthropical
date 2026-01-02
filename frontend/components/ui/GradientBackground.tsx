"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface GradientBackgroundProps {
  variant?: "primary" | "secondary" | "accent" | "custom"
  className?: string
  children: React.ReactNode
}

const gradientVariants = {
  primary: "from-primary/10 via-primary/5 to-transparent",
  secondary: "from-secondary/10 via-secondary/5 to-transparent",
  accent: "from-primary/10 via-secondary/10 to-transparent",
  custom: "",
}

export function GradientBackground({
  variant = "primary",
  className,
  children,
}: GradientBackgroundProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        variant !== "custom" && `bg-gradient-to-br ${gradientVariants[variant]}`,
        className
      )}
    >
      {children}
    </div>
  )
}

