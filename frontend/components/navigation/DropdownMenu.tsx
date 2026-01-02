"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface DropdownMenuItem {
  label: string
  href: string
  description?: string
}

interface DropdownMenuProps {
  trigger: string
  items: DropdownMenuItem[]
  className?: string
}

export function DropdownMenu({ trigger, items, className }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive>
      <DropdownMenuTrigger
        className={cn(
          "flex items-center gap-1 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md",
          className
        )}
      >
        {trigger}
        <ChevronDown className="h-4 w-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        {items.map((item, index) => (
          <DropdownMenuItem key={index} asChild>
            <Link
              href={item.href}
              className="flex flex-col gap-1 px-2 py-2 cursor-pointer"
            >
              <span className="font-medium">{item.label}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuPrimitive>
  )
}

