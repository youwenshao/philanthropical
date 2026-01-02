"use client"

import * as React from "react"
import { PartnerCard } from "./PartnerCard"

interface Partner {
  name: string
  description: string
  category: string
  website?: string
  logo?: string
}

interface PartnerGridProps {
  partners: Partner[]
  className?: string
}

export function PartnerGrid({ partners, className }: PartnerGridProps) {
  return (
    <div className={className}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {partners.map((partner, index) => (
          <PartnerCard key={index} {...partner} />
        ))}
      </div>
    </div>
  )
}

