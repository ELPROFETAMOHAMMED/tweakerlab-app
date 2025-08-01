"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { usePageVisibility } from "@/hooks/use-page-visibility"

interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url?: string
  has_scanned_pc?: boolean
}

interface AuthSession {
  user: UserProfile | null
  profile: UserProfile | null
}

const CACHE_KEY = "tweakerlab_user_session"
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

interface CachedSession {
  session: AuthSession
  timestamp: number
}

// Cache utilities
const getCachedSession = (): AuthSession | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const { session, timestamp }: CachedSession = JSON.parse(cached)

    // Check if cache is expired
    if (Date.now() - timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return session
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

const setCachedSession = (session: AuthSession) => {
  try {
    const cached: CachedSession = {
      session,
      timestamp: Date.now()
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // Silently fail if localStorage is not available
  }
}

const clearCachedSession = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Silently fail
  }
}

export function AuthHeader() {
  const [session, setSession] = useState<AuthSession>({ user: null, profile: null })
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isRevalidating, setIsRevalidating] = useState(false)
  const router = useRouter()
  const { isVisible, lastVisibilityChange } = usePageVisibility()

  // Memoize Supabase client to avoid recreation on each render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Load cached session first to show avatar immediately
    const cachedSession = getCachedSession()
    if (cachedSession && cachedSession.user) {
      setSession(cachedSession)
      setIsLoading(false)
      // Still check auth status in background but don't show loading
      checkAuthStatus(true)
    } else {
      // No cached data, show loading and check auth
      checkAuthStatus(false)
    }

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setSession({ user: null, profile: null })
          clearCachedSession()
          setIsLoading(false)
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkAuthStatus(false)
        }
      }
    )

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-refresh") {
        checkAuthStatus(true)
      }
    }

    // Listen for custom auth refresh events
    const handleAuthRefresh = () => {
      checkAuthStatus(true)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-refresh", handleAuthRefresh)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-refresh", handleAuthRefresh)
    }
  }, [])

  // Handle page visibility changes for smart cache revalidation
  useEffect(() => {
    if (isVisible && session.user) {
      const cachedSession = getCachedSession()
      const timeSinceLastVisibility = Date.now() - lastVisibilityChange
      const timeSinceCache = cachedSession ? Date.now() - (JSON.parse(localStorage.getItem(CACHE_KEY) || '{}').timestamp || 0) : Infinity

      // If page was hidden for more than 30 seconds or cache is older than 2 minutes, revalidate
      if (timeSinceLastVisibility > 30000 || timeSinceCache > 2 * 60 * 1000) {
        checkAuthStatus(true)
      }
    }
  }, [isVisible, lastVisibilityChange, session.user])

  const checkAuthStatus = async (isBackgroundRevalidation = false) => {
    try {
      if (!isBackgroundRevalidation) {
        setIsLoading(true)
      } else {
        setIsRevalidating(true)
      }

      // First check if user is authenticated
      const authResponse = await fetch("/api/auth/session", {
        credentials: "include",
        cache: "no-store",
      })

      if (!authResponse.ok) {
        const newSession = { user: null, profile: null }
        setSession(newSession)
        clearCachedSession()
        return
      }

      const authData = await authResponse.json()

      if (!authData.success || !authData.data?.user) {
        const newSession = { user: null, profile: null }
        setSession(newSession)
        clearCachedSession()
        return
      }

      // Get full profile data including avatar
      const profileResponse = await fetch("/api/user/profile", {
        credentials: "include",
        cache: "no-store",
      })

      let newSession: AuthSession
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.success && profileData.profile) {
          newSession = {
            user: authData.data.user,
            profile: profileData.profile,
          }
        } else {
          // Fallback to auth user data
          newSession = {
            user: authData.data.user,
            profile: authData.data.user,
          }
        }
      } else {
        // Fallback to auth user data
        newSession = {
          user: authData.data.user,
          profile: authData.data.user,
        }
      }

      setSession(newSession)
      setCachedSession(newSession)
    } catch (error) {
      console.error("Auth check failed:", error)
      // Only clear session if it's not a background revalidation
      if (!isBackgroundRevalidation) {
        const newSession = { user: null, profile: null }
        setSession(newSession)
        clearCachedSession()
      }
    } finally {
      if (!isBackgroundRevalidation) {
        setIsLoading(false)
      } else {
        setIsRevalidating(false)
      }
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Sign out from Supabase client first
      await supabase.auth.signOut()

      // Then call server logout endpoint
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      })

      if (response.ok) {
        setSession({ user: null, profile: null })
        clearCachedSession()
        toast.success("Logged out successfully")

        // Trigger refresh across tabs
        localStorage.setItem("auth-refresh", Date.now().toString())
        localStorage.removeItem("auth-refresh")

        // Dispatch custom event
        window.dispatchEvent(new Event('auth-refresh'))

        router.push("/")
      } else {
        throw new Error("Logout failed")
      }
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout")
    } finally {
      setIsLoggingOut(false)
    }
  }

  const { user, profile } = session

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    )
  }

  // Use profile data if available, fallback to user data
  const displayData = profile || user
  const displayName = displayData.full_name || user.email?.split("@")[0] || "User"
  const avatarUrl = displayData.avatar_url

  // Generate initials from display name
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10 ring-2 ring-background/20 transition-all duration-200 hover:ring-primary/20">
              <AvatarImage
                src={avatarUrl || "/placeholder.svg?height=40&width=40&text=" + encodeURIComponent(initials)}
                alt={displayName}
                className="object-cover"
                onError={(e) => {
                  // Fallback if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=40&width=40&text=" + encodeURIComponent(initials)
                }}
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="text-red-600 focus:text-red-600"
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Visual indicator for background revalidation */}
      {isRevalidating && (
        <div className="absolute -top-1 -right-1 h-3 w-3">
          <div className="h-full w-full bg-blue-500 rounded-full animate-pulse opacity-60" />
        </div>
      )}
    </div>
  )
}
