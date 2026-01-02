"use client"

import * as React from "react"
import Link from "next/link"
import { FooterLinks } from "./FooterLinks"
import { NewsletterSignup } from "./NewsletterSignup"
import { Github, Twitter, Linkedin, Mail } from "lucide-react"

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
]

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 mb-12">
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <h2 className="text-2xl font-bold">Philanthropical</h2>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Transparent charity platform powered by blockchain. Making charitable giving
              more accountable, verifiable, and impactful.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="h-10 w-10 rounded-md border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                )
              })}
            </div>
          </div>

          <div className="lg:col-span-2">
            <FooterLinks />
          </div>

          <div>
            <NewsletterSignup />
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Philanthropical. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

