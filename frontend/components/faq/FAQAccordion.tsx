"use client"

import * as React from "react"
import { Accordion } from "@/components/ui/accordion"
import { FAQItem } from "./FAQItem"

interface FAQ {
  question: string
  answer: string
}

interface FAQAccordionProps {
  faqs: FAQ[]
  className?: string
}

export function FAQAccordion({ faqs, className }: FAQAccordionProps) {
  return (
    <Accordion type="single" collapsible className={className}>
      {faqs.map((faq, index) => (
        <FAQItem
          key={index}
          question={faq.question}
          answer={faq.answer}
          value={`item-${index}`}
        />
      ))}
    </Accordion>
  )
}

