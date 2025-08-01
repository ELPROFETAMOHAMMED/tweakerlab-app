"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import type { User, LoginData, RegisterData, ApiResponse } from "@/types/auth"
import { usePageVisibility } from "./use-page-visibility"

const CACHE_KEY = "tweakerlab_user_session"
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 minutes

interface CachedSession {
  user: User | null
  timestamp: number
}

// Cache utilities
const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached)

    // Handle both new format and legacy format
    let cachedData: CachedSession
    if (parsed.session) {
      // New format from auth-header
      const timestamp = parsed.timestamp || Date.now()
      cachedData = {
        user: parsed.session.user || parsed.session.profile,
        timestamp
      }
    } else if (parsed.user) {
      // Legacy format
      cachedData = parsed
    } else {
      return null
    }

    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }

    return cachedData.user
  } catch {
    localStorage.removeItem(CACHE_KEY)
    return null
  }
}

const setCachedUser = (user: User | null) => {
  try {
    const cached: CachedSession = {
      user,
      timestamp: Date.now()
    }

    // Try to preserve session format if it exists
    const existingCache = localStorage.getItem(CACHE_KEY)
    if (existingCache) {
      try {
        const existing = JSON.parse(existingCache)
        if (existing.session) {
          // Update session format
          existing.session.user = user
          existing.session.profile = user
          existing.timestamp = Date.now()
          localStorage.setItem(CACHE_KEY, JSON.stringify(existing))
          return
        }
      } catch {
        // Fall through to set new format
      }
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // Silently fail if localStorage is not available
  }
}

const clearCachedUser = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Silently fail
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isVisible, lastVisibilityChange } = usePageVisibility()

  // Memoize Supabase client to avoid recreation on each render
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    // Load cached user first to show data immediately
    const cachedUser = getCachedUser()
    if (cachedUser) {
      setUser(cachedUser)
      setLoading(false)
      // Still check session in background
      checkSession(true)
    } else {
      // No cached data, show loading and check session
      checkSession(false)
    }

    // Listen to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          clearCachedUser()
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          await checkSession(false)
        }
      }
    )

    // Listen for storage events to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "auth-refresh") {
        checkSession(true)
      }
    }

    // Listen for custom auth refresh events
    const handleAuthRefresh = () => {
      checkSession(true)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("auth-refresh", handleAuthRefresh)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("auth-refresh", handleAuthRefresh)
    }
  }, []) // Sin dependencias - solo se ejecuta una vez al montar

  // Handle page visibility changes for smart cache revalidation
  useEffect(() => {
    if (isVisible && user) {
      const cachedUser = getCachedUser()
      const timeSinceLastVisibility = Date.now() - lastVisibilityChange

      let timeSinceCache = Infinity
      try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (cached) {
          const parsed = JSON.parse(cached)
          const timestamp = parsed.timestamp || (parsed.session ? parsed.timestamp : 0)
          timeSinceCache = Date.now() - timestamp
        }
      } catch {
        // Ignore cache read errors
      }

      // If page was hidden for more than 30 seconds or cache is older than 2 minutes, revalidate
      if (timeSinceLastVisibility > 30000 || timeSinceCache > 2 * 60 * 1000) {
        checkSession(true)
      }
    }
  }, [isVisible, lastVisibilityChange, user])

  const checkSession = async (isBackgroundRevalidation = false) => {
    try {
      if (!isBackgroundRevalidation) {
        setLoading(true)
      }

      const response = await fetch("/api/auth/session")

      // Verificar si la respuesta es OK
      if (!response.ok) {
        console.error("Session API response not OK:", response.status, response.statusText)
        if (!isBackgroundRevalidation) {
          setUser(null)
          clearCachedUser()
        }
        return
      }

      // Verificar si la respuesta es JSON
      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Session API returned non-JSON response:", contentType)
        if (!isBackgroundRevalidation) {
          setUser(null)
          clearCachedUser()
        }
        return
      }

      const result: ApiResponse = await response.json()

      if (result.success && result.data.user) {
        setUser(result.data.user)
        setCachedUser(result.data.user)
      } else {
        if (!isBackgroundRevalidation) {
          setUser(null)
          clearCachedUser()
        }
      }
    } catch (error) {
      console.error("Session check failed:", error)
      if (!isBackgroundRevalidation) {
        setUser(null)
        clearCachedUser()
      }
    } finally {
      if (!isBackgroundRevalidation) {
        setLoading(false)
      }
    }
  }

  const login = async (data: LoginData) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        toast.success("Successfully signed in!")

        // Trigger auth refresh across tabs
        localStorage.setItem("auth-refresh", Date.now().toString())
        localStorage.removeItem("auth-refresh")

        // Dispatch custom event to update components immediately
        window.dispatchEvent(new Event('auth-refresh'))

        await checkSession(false)
        router.push("/dashboard")
        return { success: true }
      } else {
        toast.error(result.error || "Login failed")
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      return { success: false, error: "Network error" }
    }
  }

  const register = async (data: RegisterData) => {
    try {
      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)
      formData.append("full_name", data.full_name)
      formData.append("avatar", data.avatar)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        if (result.data.needsVerification) {
          toast.success("Registration successful! Please check your email to verify your account.")
          router.push("/verify-email")
        } else {
          toast.success("Registration successful!")

          // Trigger auth refresh across tabs
          localStorage.setItem("auth-refresh", Date.now().toString())
          localStorage.removeItem("auth-refresh")

          // Dispatch custom event to update components immediately
          window.dispatchEvent(new Event('auth-refresh'))

          await checkSession(false)
          router.push("/dashboard")
        }
        return { success: true }
      } else {
        toast.error(result.error || "Registration failed")
        return { success: false, error: result.error }
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      return { success: false, error: "Network error" }
    }
  }

  const logout = async () => {
    try {
      // First sign out from client
      await supabase.auth.signOut()

      // Luego llamar al endpoint del servidor
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      const result: ApiResponse = await response.json()

      if (result.success) {
        setUser(null)
        clearCachedUser()
        toast.success("Successfully signed out")

        // Trigger refresh across tabs
        localStorage.setItem("auth-refresh", Date.now().toString())
        localStorage.removeItem("auth-refresh")

        // Dispatch custom event to update components immediately
        window.dispatchEvent(new Event('auth-refresh'))

        router.push("/")
      } else {
        toast.error("Logout failed")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    }
  }

  return {
    user,
    loading,
    login: async (data: LoginData) => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        const result: ApiResponse = await response.json()

        if (result.success) {
          toast.success("Successfully signed in!")

          // Trigger auth refresh across tabs
          localStorage.setItem("auth-refresh", Date.now().toString())
          localStorage.removeItem("auth-refresh")

          // Dispatch custom event to update components immediately
          window.dispatchEvent(new Event('auth-refresh'))

          await checkSession(false)
          router.push("/dashboard")
          return { success: true }
        } else {
          toast.error(result.error || "Login failed")
          return { success: false, error: result.error }
        }
      } catch (error) {
        toast.error("An unexpected error occurred")
        return { success: false, error: "Network error" }
      }
    },
    register,
    logout,
    checkSession,
  }
}
