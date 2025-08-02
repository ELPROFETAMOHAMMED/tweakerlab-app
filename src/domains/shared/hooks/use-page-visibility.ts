"use client"

import { useState, useEffect } from "react"

export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof document !== 'undefined') {
      return !document.hidden
    }
    return true
  })

  const [lastVisibilityChange, setLastVisibilityChange] = useState<number>(Date.now())

  useEffect(() => {
    const handleVisibilityChange = () => {
      const visible = !document.hidden
      setIsVisible(visible)
      setLastVisibilityChange(Date.now())
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also listen for focus/blur events as fallback
    window.addEventListener('focus', () => {
      setIsVisible(true)
      setLastVisibilityChange(Date.now())
    })

    window.addEventListener('blur', () => {
      setIsVisible(false)
      setLastVisibilityChange(Date.now())
    })

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
      window.removeEventListener('blur', handleVisibilityChange)
    }
  }, [])

  return {
    isVisible,
    lastVisibilityChange
  }
}
