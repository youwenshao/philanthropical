import { Section } from "@/components/ui/Section"
import { CaseStudyGrid } from "@/components/case-studies/CaseStudyGrid"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const dummyCaseStudies = [
  {
    title: "Clean Water Initiative in Rural Kenya",
    description: "A comprehensive water well project that brought clean drinking water to over 5,000 people across 12 villages.",
    category: "Infrastructure",
    impact: "5,000+ people with clean water access",
    image: "/case-studies/clean-water-kenya.jpg",
    href: "#",
  },
  {
    title: "Education Technology for Remote Learning",
    description: "Providing tablets and internet connectivity to enable remote learning for 2,000 students during the pandemic.",
    category: "Education",
    impact: "2,000 students with digital access",
    image: "/case-studies/education-technology.jpg",
    href: "#",
  },
  {
    title: "Medical Supplies Distribution in Conflict Zones",
    description: "Delivering critical medical supplies and equipment to hospitals in conflict-affected regions.",
    category: "Healthcare",
    impact: "15 hospitals supplied, 50,000+ patients served",
    image: "/case-studies/medical-supplies.jpg",
    href: "#",
  },
  {
    title: "Sustainable Agriculture Training Program",
    description: "Training local farmers in sustainable farming techniques, increasing crop yields by 40%.",
    category: "Agriculture",
    impact: "500 farmers trained, 40% yield increase",
    image: "/case-studies/sustainable-agriculture.jpg",
    href: "#",
  },
  {
    title: "Women's Entrepreneurship Support",
    description: "Providing microloans and business training to 300 women entrepreneurs in developing countries.",
    category: "Economic Development",
    impact: "300 businesses launched, $2M+ in revenue",
    image: "/case-studies/women-entrepreneurship.jpg",
    href: "#",
  },
  {
    title: "Reforestation Project in Amazon Basin",
    description: "Planting 100,000 trees and supporting local communities in sustainable forest management.",
    category: "Environment",
    impact: "100,000 trees planted, 500 hectares restored",
    image: "/case-studies/reforestation-amazon.jpg",
    href: "#",
  },
]

export default function CaseStudiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Section padding="lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Success Stories
          </h1>
          <p className="text-lg text-muted-foreground">
            Real impact from verified donations on our platform
          </p>
        </div>

        {/* Search and Filter (Placeholder) */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search case studies..."
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="sm:w-auto">
            Filter by Category
          </Button>
        </div>

        <CaseStudyGrid studies={dummyCaseStudies} />
      </div>
      </Section>
    </div>
  )
}

