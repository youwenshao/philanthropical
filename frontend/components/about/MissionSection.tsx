"use client"

import * as React from "react"
import { Section } from "@/components/ui/Section"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Shield, Eye } from "lucide-react"

const missionValues = [
  {
    icon: Target,
    title: "Our Mission",
    description: "To revolutionize charitable giving through blockchain technology, ensuring every donation reaches its intended recipient and creates measurable impact.",
  },
  {
    icon: Shield,
    title: "Transparency First",
    description: "We believe transparency builds trust. Every transaction is recorded on-chain, providing an immutable record of all donations and their outcomes.",
  },
  {
    icon: Eye,
    title: "Accountability",
    description: "Our multi-tier verification system and impact escrow ensure that charities are legitimate and funds are used as intended, with real-time tracking for donors.",
  },
]

export function MissionSection() {
  return (
    <Section padding="lg" background="muted">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Mission & Values</h2>
          <p className="text-lg text-muted-foreground">
            Building trust in charitable giving through technology and transparency
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {missionValues.map((value, index) => {
            const Icon = value.icon
            return (
              <Card key={index} variant="elevated" className="h-full">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-6 w-6" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </Section>
  )
}

