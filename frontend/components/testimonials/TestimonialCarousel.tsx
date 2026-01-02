"use client"

import * as React from "react"
import { TestimonialCard } from "./TestimonialCard"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Testimonial {
  name: string
  role: string
  content: string
  image?: string
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[]
  className?: string
}

export function TestimonialCarousel({
  testimonials,
  className,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const previous = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={index} className="min-w-full px-2">
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          onClick={previous}
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted hover:bg-primary/50"
              )}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={next}
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

