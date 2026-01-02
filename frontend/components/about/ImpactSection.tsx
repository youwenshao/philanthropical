"use client"

import * as React from "react"
import { StatCard } from "@/components/ui/StatCard"
import { Section } from "@/components/ui/Section"
import { DollarSign, Users, Building2, Globe } from "lucide-react"

export function ImpactSection() {
  return (
    <Section padding="lg" background="gradient">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Impact</h2>
          <p className="text-lg text-muted-foreground">
            Numbers that reflect our commitment to transparency and real change
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Donations"
            value="$2.5M+"
            description="Raised on platform"
            icon={DollarSign}
            variant="gradient"
          />
          <StatCard
            title="Active Donors"
            value="5,000+"
            description="Trusted community"
            icon={Users}
            variant="gradient"
          />
          <StatCard
            title="Verified Charities"
            value="150+"
            description="Organizations"
            icon={Building2}
            variant="gradient"
          />
          <StatCard
            title="Countries Served"
            value="45+"
            description="Global reach"
            icon={Globe}
            variant="gradient"
          />
        </div>
      </div>
    </Section>
  )
}

