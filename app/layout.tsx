import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Header } from "@/components/layout/header"
import { AnimatedBackground } from "@/components/animated-background"
import { Toaster } from "@/components/ui/sonner"
import { CacheStatus } from "@/components/ui/cache-status"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TweakerLab - Free PC Optimization Tools",
  description: "Free, open-source PC optimization tools and utilities for maximum performance",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="relative min-h-screen">
              <AnimatedBackground />
              <div className="relative z-10">
                <Header />
                <main>{children}</main>
              </div>
            </div>
            <Toaster />
            <CacheStatus />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
