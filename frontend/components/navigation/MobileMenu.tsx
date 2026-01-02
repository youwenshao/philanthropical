"use client"

import * as React from "react"
import Link from "next/link"
import { X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

interface MobileMenuProps {
  items: NavItem[]
  isOpen: boolean
  onToggle: () => void
}

export function MobileMenu({ items, isOpen, onToggle }: MobileMenuProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onToggle}
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={onToggle}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-background shadow-xl">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="text-lg font-semibold">Menu</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                  {items.map((item, index) => (
                    <li key={index}>
                      {item.children ? (
                        <div className="space-y-2">
                          <div className="px-3 py-2 font-semibold text-foreground">
                            {item.label}
                          </div>
                          <ul className="pl-4 space-y-1">
                            {item.children.map((child, childIndex) => (
                              <li key={childIndex}>
                                <Link
                                  href={child.href}
                                  onClick={onToggle}
                                  className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                                >
                                  {child.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onToggle}
                          className="block px-3 py-2 font-medium text-foreground hover:bg-accent rounded-md transition-colors"
                        >
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="p-4 border-t">
                <ConnectButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

