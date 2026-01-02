import { Section } from "@/components/ui/Section"
import { PartnerGrid } from "@/components/partners/PartnerGrid"
import { Button } from "@/components/ui/button"

const dummyPartners = [
  {
    name: "Global Health Foundation",
    description: "Leading healthcare charity working in 30+ countries to provide medical care and supplies.",
    category: "Healthcare",
    website: "#",
  },
  {
    name: "Education First Initiative",
    description: "Dedicated to improving access to quality education in underserved communities worldwide.",
    category: "Education",
    website: "#",
  },
  {
    name: "Environmental Action Network",
    description: "Focused on climate change mitigation and environmental conservation projects.",
    category: "Environment",
    website: "#",
  },
  {
    name: "Tech for Good Alliance",
    description: "Bridging the digital divide by providing technology and training to developing regions.",
    category: "Technology",
    website: "#",
  },
  {
    name: "Clean Water Project",
    description: "Building water infrastructure and providing clean water access to communities in need.",
    category: "Infrastructure",
    website: "#",
  },
  {
    name: "Women's Empowerment Fund",
    description: "Supporting women entrepreneurs and leaders through funding and mentorship programs.",
    category: "Economic Development",
    website: "#",
  },
]

export default function PartnersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Section padding="lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Partners
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Trusted organizations working together to create positive change
            </p>
            <Button variant="outline">Become a Partner</Button>
          </div>

          <PartnerGrid partners={dummyPartners} />
        </div>
      </Section>
    </div>
  )
}

