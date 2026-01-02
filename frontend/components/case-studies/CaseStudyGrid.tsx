"use client"

import * as React from "react"
import { CaseStudyCard } from "./CaseStudyCard"
import { Section } from "@/components/ui/Section"

interface CaseStudy {
  title: string
  description: string
  category: string
  impact: string
  image?: string
  href?: string
}

interface CaseStudyGridProps {
  studies: CaseStudy[]
  className?: string
}

export function CaseStudyGrid({ studies, className }: CaseStudyGridProps) {
  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {studies.map((study, index) => (
          <CaseStudyCard key={index} {...study} />
        ))}
      </div>
    </div>
  )
}

