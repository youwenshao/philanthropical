"use client"

import * as React from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface FooterLink {
  label: string
  href: string
}

interface FooterLinkGroup {
  title: string
  links: FooterLink[]
}

const footerLinks: FooterLinkGroup[] = [
  {
    title: "Platform",
    links: [
      { label: "Donate", href: "/donate" },
      { label: "Transparency", href: "/transparency" },
      { label: "Analytics", href: "/analytics" },
    ],
  },
  {
    title: "About",
    links: [
      { label: "Our Mission", href: "/about" },
      { label: "Case Studies", href: "/case-studies" },
      { label: "Partners", href: "/partners" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "FAQ", href: "/faq" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Documentation", href: "#" },
    ],
  },
  {
    title: "Admin",
    links: [
      { label: "Dashboard", href: "/admin" },
      { label: "Charity Management", href: "/admin/charities" },
    ],
  },
]

export function FooterLinks() {
  return (
    <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
      {footerLinks.map((group, index) => (
        <div key={index}>
          <h3 className="font-semibold mb-4">{group.title}</h3>
          <ul className="space-y-2">
            {group.links.map((link, linkIndex) => (
              <li key={linkIndex}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

