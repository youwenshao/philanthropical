import { Section } from "@/components/ui/Section"
import { TestimonialCarousel } from "@/components/testimonials/TestimonialCarousel"
import { TestimonialCard } from "@/components/testimonials/TestimonialCard"

const dummyTestimonials = [
  {
    name: "Sarah Johnson",
    role: "Regular Donor",
    content: "I've been donating through Philanthropical for over a year now, and the transparency is incredible. I can see exactly where my donations go and the impact they're making. It's given me so much confidence in my giving.",
  },
  {
    name: "Michael Chen",
    role: "Corporate Donor",
    content: "As a business owner, I needed a platform that could provide accountability for our corporate donations. Philanthropical's blockchain verification gives us the audit trail we need, and the impact tracking helps us report to stakeholders.",
  },
  {
    name: "Emma Rodriguez",
    role: "Charity Director",
    content: "The verification process was thorough but fair. Once verified, we've seen a significant increase in donations. Donors trust the platform, and that trust extends to us. It's been transformative for our organization.",
  },
  {
    name: "David Thompson",
    role: "Impact Investor",
    content: "The escrow system is brilliant. Funds are released based on verified milestones, which means we can be confident our donations are actually creating impact. This is the future of charitable giving.",
  },
  {
    name: "Lisa Park",
    role: "First-time Donor",
    content: "I was skeptical about crypto donations, but Philanthropical made it so easy. The transparency dashboard showed me exactly how my donation was being used, and I could track it in real-time. I'm definitely donating again.",
  },
]

export default function TestimonialsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Section padding="lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              What Our Community Says
            </h1>
            <p className="text-lg text-muted-foreground">
              Real stories from donors and charities using our platform
            </p>
          </div>

          {/* Carousel for featured testimonials */}
          <div className="mb-16 max-w-4xl mx-auto">
            <TestimonialCarousel testimonials={dummyTestimonials.slice(0, 3)} />
          </div>

          {/* Grid of all testimonials */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dummyTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} {...testimonial} />
            ))}
          </div>
        </div>
      </Section>
    </div>
  )
}

