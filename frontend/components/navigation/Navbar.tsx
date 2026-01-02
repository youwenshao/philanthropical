"use client"

import * as React from "react"
import Link from "next/link"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { DropdownMenu } from "./DropdownMenu"
import { MobileMenu } from "./MobileMenu"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string; description?: string }[]
}

const navItems: NavItem[] = [
  {
    label: "Donate",
    href: "/donate",
  },
  {
    label: "Transparency",
    href: "/transparency",
  },
  {
    label: "About",
    href: "/about",
    children: [
      { label: "Our Mission", href: "/about", description: "Learn about our goals" },
      { label: "Case Studies", href: "/case-studies", description: "Success stories" },
      { label: "Partners", href: "/partners", description: "Our partners" },
    ],
  },
  {
    label: "Resources",
    href: "#",
    children: [
      { label: "FAQ", href: "/faq", description: "Common questions" },
      { label: "Testimonials", href: "/testimonials", description: "User stories" },
      { label: "Analytics", href: "/analytics", description: "Platform insights" },
    ],
  },
  {
    label: "Admin",
    href: "/admin",
  },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all",
        isScrolled && "shadow-sm"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center space-x-2 text-xl font-bold text-foreground hover:text-primary transition-colors"
          >
            <span>Philanthropical</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {navItems.map((item, index) => {
              if (item.children && item.children.length > 0) {
                return (
                  <DropdownMenu
                    key={index}
                    trigger={item.label}
                    items={item.children.map((child) => ({
                      label: child.label,
                      href: child.href,
                      description: child.description,
                    }))}
                  />
                )
              }
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md"
                >
                  {item.label}
                </Link>
              )
            })}
          </div>

          {/* Right side - Connect Button & Mobile Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:block">
              <ConnectButton />
            </div>
            <MobileMenu
              items={navItems}
              isOpen={mobileMenuOpen}
              onToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
            />
          </div>
        </div>
      </nav>
    </header>
  )
}

