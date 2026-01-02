import { Section } from "@/components/ui/Section"
import { MissionSection } from "@/components/about/MissionSection"
import { TeamSection } from "@/components/about/TeamSection"
import { ImpactSection } from "@/components/about/ImpactSection"
import { GradientBackground } from "@/components/ui/GradientBackground"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <GradientBackground variant="primary">
        <Section padding="lg" className="relative">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                About Philanthropical
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
                We're building the future of transparent, accountable charitable giving
                through blockchain technology and innovative verification systems.
              </p>
            </div>
          </div>
        </Section>
      </GradientBackground>

      <MissionSection />
      <ImpactSection />
      <TeamSection />
    </div>
  )
}

