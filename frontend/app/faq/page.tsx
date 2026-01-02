import { Section } from "@/components/ui/Section"
import { FAQAccordion } from "@/components/faq/FAQAccordion"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

const dummyFAQs = [
  {
    question: "How does blockchain ensure transparency?",
    answer: "All donations are recorded on the blockchain as immutable transactions. This means every donation, its amount, recipient, and timestamp are permanently recorded and publicly verifiable. You can track your donation from start to finish through our transparency dashboard.",
  },
  {
    question: "What is the verification process for charities?",
    answer: "We use a three-tier verification system: professional verification by experts, crowdsourced verification from the community, and charity self-verification. Charities must pass multiple checks including legal registration, financial transparency, and impact reporting before being approved.",
  },
  {
    question: "How does the impact escrow system work?",
    answer: "When you donate to a project, funds are held in an escrow smart contract. Charities submit impact verification for milestones, which are reviewed by our verification system. Once verified, funds are automatically released. This ensures your donation creates real, measurable impact.",
  },
  {
    question: "What cryptocurrencies can I use to donate?",
    answer: "Currently, we support USDC (USD Coin) on the Polygon network. This provides low transaction fees while maintaining security. We're working on adding support for more tokens and networks in the future.",
  },
  {
    question: "Are there any fees?",
    answer: "We charge a small platform fee (typically 2-3%) to cover verification costs, smart contract operations, and platform maintenance. This fee is clearly displayed before you confirm your donation. The rest goes directly to the charity.",
  },
  {
    question: "How do I track my donation?",
    answer: "After making a donation, you'll receive a unique receipt token (NFT) that proves your donation. You can view all your donations, their status, and impact updates in your donor dashboard. All transactions are also visible on the public transparency page.",
  },
  {
    question: "What happens if a charity misuses funds?",
    answer: "Our verification system includes fraud detection and monitoring. If misuse is detected, we have a dispute resolution process. In severe cases, charities can be suspended or removed from the platform. The blockchain record ensures all transactions are auditable.",
  },
  {
    question: "Can I get a tax receipt?",
    answer: "Yes! Your donation receipt token serves as proof of donation. We also provide downloadable tax receipts in PDF format. However, please consult with a tax professional as cryptocurrency donation tax treatment varies by jurisdiction.",
  },
  {
    question: "How do I become a verified charity?",
    answer: "Charities can apply through our admin portal. You'll need to provide legal registration documents, financial statements, and details about your programs. Our team reviews applications and conducts verification checks. The process typically takes 2-4 weeks.",
  },
  {
    question: "Is my personal information secure?",
    answer: "Yes. We use industry-standard security practices. Your wallet address is public (as required for blockchain transactions), but we don't store or share personal information beyond what's necessary for the donation process. We comply with data protection regulations.",
  },
]

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Section padding="lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Everything you need to know about using Philanthropical
            </p>

            {/* Search (Placeholder) */}
            <div className="relative max-w-xl mx-auto mb-12">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search FAQs..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <FAQAccordion faqs={dummyFAQs} />
          </div>
        </div>
      </Section>
    </div>
  )
}

