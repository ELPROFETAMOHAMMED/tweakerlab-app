"use client"

import Link from "next/link"
import { AuthHeader } from "@/components/layout/auth-header"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Separator } from "@/components/ui/separator"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
          <span className="text-xl font-bold">TweakerLab</span>
        </Link>

        {/* Right side - Theme toggle, separator, and auth */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <ThemeToggle />

          {/* Separator */}
          <Separator orientation="vertical" className="h-6" />

          {/* Auth header with avatar */}
          <AuthHeader />
        </div>
      </div>
    </header>
  )
}
