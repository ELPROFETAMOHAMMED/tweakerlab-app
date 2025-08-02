'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import type { User, LoginData, RegisterData, ApiResponse, CachedSession, AuthResponse } from '../types/auth'
import { usePageVisibility } from '@/shared'

const CACHE_KEY = 'tweakerlab_user_session'
const CACHE_EXPIRY = 5 * 60 * 1000

const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (!cached) return null

    const parsed = JSON.parse(cached)
    let cachedData: CachedSession

    if (parsed.session) {
      const timestamp = parsed.timestamp || Date.now()
      cachedData = {
        user: parsed.session.user || parsed.session.profile,
        timestamp
      }
    } else if (parsed.user) {
      cachedData = parsed
    } else {
      return null
    }

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

    const existingCache = localStorage.getItem(CACHE_KEY)
    if (existingCache) {
      try {
        const existing = JSON.parse(existingCache)
        if (existing.session) {
          existing.session.user = user
          existing.session.profile = user
          existing.timestamp = Date.now()
          localStorage.setItem(CACHE_KEY, JSON.stringify(existing))
          return
        }
      } catch {
        // Fall through
      }
    }

    localStorage.setItem(CACHE_KEY, JSON.stringify(cached))
  } catch {
    // Silent fail
  }
}

const clearCachedUser = () => {
  try {
    localStorage.removeItem(CACHE_KEY)
  } catch {
    // Silent fail
  }
}

const triggerAuthRefresh = () => {
  localStorage.setItem('auth-refresh', Date.now().toString())
  localStorage.removeItem('auth-refresh')
  window.dispatchEvent(new Event('auth-refresh'))
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { isVisible, lastVisibilityChange } = usePageVisibility()
  const supabase = useMemo(() => createClient(), [])

  const checkSession = (isBackgroundRevalidation = false) => {
    if (!isBackgroundRevalidation) {
      setLoading(true)
    }

    return fetch('/api/auth/session')
      .then(response => {
        if (!response.ok) {
          throw new Error('Session check failed')
        }

        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response type')
        }

        return response.json()
      })
      .then((result: ApiResponse) => {
        if (result.success && result.data.user) {
          setUser(result.data.user)
          setCachedUser(result.data.user)
        } else if (!isBackgroundRevalidation) {
          setUser(null)
          clearCachedUser()
        }
      })
      .catch(() => {
        if (!isBackgroundRevalidation) {
          setUser(null)
          clearCachedUser()
        }
      })
      .finally(() => {
        if (!isBackgroundRevalidation) {
          setLoading(false)
        }
      })
  }

  const login = (data: LoginData): Promise<AuthResponse> =>
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(response => response.json())
      .then((result: ApiResponse) => {
        if (result.success) {
          toast.success('Successfully signed in!')
          triggerAuthRefresh()
          checkSession(false)
          router.push('/dashboard')
          return { success: true }
        } else {
          toast.error(result.error || 'Login failed')
          return { success: false, error: result.error }
        }
      })
      .catch(() => {
        toast.error('An unexpected error occurred')
        return { success: false, error: 'Network error' }
      })

  const register = (data: RegisterData): Promise<AuthResponse> => {
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    formData.append('full_name', data.full_name)
    formData.append('avatar', data.avatar)

    return fetch('/api/auth/register', {
      method: 'POST',
      body: formData,
    })
      .then(response => response.json())
      .then((result: ApiResponse) => {
        if (result.success) {
          if (result.data.needsVerification) {
            toast.success('Registration successful! Please check your email to verify your account.')
            router.push('/verify-email')
          } else {
            toast.success('Registration successful!')
            triggerAuthRefresh()
            checkSession(false)
            router.push('/dashboard')
          }
          return { success: true }
        } else {
          toast.error(result.error || 'Registration failed')
          return { success: false, error: result.error }
        }
      })
      .catch(() => {
        toast.error('An unexpected error occurred')
        return { success: false, error: 'Network error' }
      })
  }

  const logout = () =>
    supabase.auth.signOut()
      .then(() => fetch('/api/auth/logout', { method: 'POST' }))
      .then(response => response.json())
      .then((result: ApiResponse) => {
        if (result.success) {
          setUser(null)
          clearCachedUser()
          toast.success('Successfully signed out')
          triggerAuthRefresh()
          router.push('/')
        } else {
          toast.error('Logout failed')
        }
      })
      .catch(() => {
        toast.error('An unexpected error occurred')
      })

  useEffect(() => {
    const cachedUser = getCachedUser()
    if (cachedUser) {
      setUser(cachedUser)
      setLoading(false)
      checkSession(true)
    } else {
      checkSession(false)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          clearCachedUser()
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkSession(false)
        }
      }
    )

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth-refresh') {
        checkSession(true)
      }
    }

    const handleAuthRefresh = () => {
      checkSession(true)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('auth-refresh', handleAuthRefresh)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('auth-refresh', handleAuthRefresh)
    }
  }, [])

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

      if (timeSinceLastVisibility > 30000 || timeSinceCache > 2 * 60 * 1000) {
        checkSession(true)
      }
    }
  }, [isVisible, lastVisibilityChange, user])

  return {
    user,
    loading,
    login,
    register,
    logout,
    checkSession,
  }
}
