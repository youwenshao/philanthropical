"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Section } from "@/components/ui/Section"

const team = [
  {
    name: "Serena Ren",
    role: "Founder & CEO",
    bio: "FinTech Engineer, Project Manager",
  },
  {
    name: "Youwen Shao",
    role: "Founder & CTO",
    bio: "AI Engineer, Full-Stack Developer",
  },
]

export function TeamSection() {
  return (
    <Section padding="lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Team</h2>
          <p className="text-lg text-muted-foreground">
            Passionate individuals working to make charitable giving more transparent and effective
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 max-w-2xl mx-auto">
          {team.map((member, index) => (
            <Card key={index} variant="elevated" className="text-center">
              <CardContent className="p-6">
                <div className="mb-4 mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {member.name.charAt(0)}
                </div>
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-sm text-primary mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground">{member.bio}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  )
}

