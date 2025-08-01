import type { NavigationItem } from "@/types"

export const MAIN_NAVIGATION: NavigationItem[] = [
  { href: "/features", label: "Features" },
  { href: "/tools", label: "Tools" },
  { href: "/support", label: "Support" },
]

export const AUTH_NAVIGATION: NavigationItem[] = [
  { href: "/login", label: "Login" },
  { href: "/register", label: "Register" },
]

export const PROTECTED_ROUTES = ["/dashboard", "/profile", "/settings", "/onboarding"]
export const AUTH_ROUTES = ["/login", "/register"]
export const ADMIN_ROUTES = ["/admin"]
