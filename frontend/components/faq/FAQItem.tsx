"use client"

import * as React from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface FAQItemProps {
  question: string
  answer: string
  value: string
}

export function FAQItem({ question, answer, value }: FAQItemProps) {
  return (
    <AccordionItem value={value}>
      <AccordionTrigger className="text-left font-semibold">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-muted-foreground leading-relaxed">
        {answer}
      </AccordionContent>
    </AccordionItem>
  )
}

