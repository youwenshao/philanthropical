"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

export function NewsletterSignup() {
  const [email, setEmail] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Dummy submission
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setEmail("")
    }, 3000)
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Stay Updated</h3>
      <p className="text-sm text-muted-foreground">
        Get the latest updates on new charities, impact stories, and platform features.
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            required
          />
        </div>
        <Button type="submit" disabled={submitted}>
          {submitted ? "Subscribed!" : "Subscribe"}
        </Button>
      </form>
    </div>
  )
}

