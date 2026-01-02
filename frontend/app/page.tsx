"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GradientBackground } from "@/components/ui/GradientBackground";
import { Section } from "@/components/ui/Section";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { StatCard } from "@/components/ui/StatCard";
import { 
  Shield, 
  Eye, 
  TrendingUp, 
  Heart,
  DollarSign,
  Users,
  Building2,
  CheckCircle
} from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <GradientBackground variant="primary">
        <Section padding="lg" className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl text-center space-y-8">
              <div className="space-y-4 animate-fade-in">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                  Transparent charity platform
                </h1>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-muted-foreground">
                  Powered by blockchain
                </h2>
              </div>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Make donations with full transparency and track impact in real-time. 
                Reduce fraud in cross-border donations with verified charities and on-chain accountability.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
                <Link href="/donate" className="w-full sm:w-auto">
                  <Button size="xl" variant="hero" className="w-full sm:w-auto">
                    Make a Donation
                  </Button>
                </Link>
                <Link href="/transparency" className="w-full sm:w-auto">
                  <Button size="xl" variant="outline" className="text-base font-semibold px-8 py-6 w-full sm:w-auto">
                    View Transparency
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </GradientBackground>

      {/* Features Section */}
      <Section padding="lg" background="muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why choose Philanthropical?
            </h2>
            <p className="text-lg text-muted-foreground">
              Built for transparency, trust, and real impact
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              title="Blockchain Verified"
              description="All donations are recorded on-chain with full transparency and immutability."
              icon={Shield}
              href="/transparency"
              variant="elevated"
            />
            <FeatureCard
              title="Real-time Tracking"
              description="Track your donations and see their impact in real-time through our transparency dashboard."
              icon={Eye}
              href="/transparency"
              variant="elevated"
            />
            <FeatureCard
              title="Verified Charities"
              description="Multi-tier verification system ensures you're donating to legitimate organizations."
              icon={CheckCircle}
              href="/about"
              variant="elevated"
            />
            <FeatureCard
              title="Impact Escrow"
              description="Funds are released based on verified impact milestones, ensuring accountability."
              icon={TrendingUp}
              href="/about"
              variant="elevated"
            />
          </div>
        </div>
      </Section>

      {/* Statistics Section */}
      <Section padding="md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Making a difference
            </h2>
            <p className="text-lg text-muted-foreground">
              See the numbers behind our impact
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Donated"
              value="$2.5M+"
              description="All time donations"
              icon={DollarSign}
              variant="gradient"
            />
            <StatCard
              title="Active Charities"
              value="150+"
              description="Verified organizations"
              icon={Building2}
              variant="gradient"
            />
            <StatCard
              title="Donors"
              value="5,000+"
              description="Trusted community"
              icon={Users}
              variant="gradient"
            />
            <StatCard
              title="Success Rate"
              value="98%"
              description="Verified impact"
              icon={Heart}
              variant="gradient"
            />
          </div>
        </div>
      </Section>

      {/* CTA Section */}
      <Section padding="md" background="gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to make an impact?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of donors making a difference with transparent, verified donations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/donate">
                <Button size="lg" variant="default">
                  Start Donating
                </Button>
              </Link>
              <Link href="/case-studies">
                <Button size="lg" variant="outline">
                  View Success Stories
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
