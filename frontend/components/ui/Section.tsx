"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div"
  padding?: "none" | "sm" | "md" | "lg"
  background?: "default" | "muted" | "gradient"
}

export function Section({
  as: Component = "section",
  padding = "md",
  background = "default",
  className,
  children,
  ...props
}: SectionProps) {
  const paddingClasses = {
    none: "",
    sm: "py-12 md:py-16",
    md: "py-16 md:py-24",
    lg: "py-24 md:py-32",
  }

  const backgroundClasses = {
    default: "bg-background",
    muted: "bg-muted/30",
    gradient: "bg-gradient-to-br from-primary/5 via-background to-secondary/5",
  }

  return (
    <Component
      className={cn(
        paddingClasses[padding],
        backgroundClasses[background],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

