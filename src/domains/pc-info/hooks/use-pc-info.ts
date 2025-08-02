import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { createPCInfoService } from '@/lib/services/pc-info-service'
import type { PCInfo, CompletePCInfo, PCInfoStats, UsePCInfoResult } from '../types/pc-info'

export function usePCInfo(user: any): UsePCInfoResult {
  const [pcInfo, setPCInfo] = useState<PCInfo | null>(null)
  const [completePCInfo, setCompletePCInfo] = useState<CompletePCInfo | null>(null)
  const [stats, setStats] = useState<PCInfoStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasScanned, setHasScanned] = useState(false)

  const supabase = createClient()
  const pcInfoService = createPCInfoService(supabase)

  const fetchPCInfo = () => {
    if (!user) {
      setLoading(false)
      return Promise.resolve()
    }

    setLoading(true)
    setError(null)

    return pcInfoService.hasUserScannedPC(user.id)
      .then(hasScannedResult => {
        setHasScanned(hasScannedResult)

        if (hasScannedResult) {
          return Promise.all([
            pcInfoService.getUserPCInfo(user.id),
            pcInfoService.getPCStats(user.id)
          ])
            .then(([basicResult, statsResult]) => {
              if (basicResult.error) {
                throw new Error(basicResult.error.message || 'Failed to fetch PC info')
              }
              setPCInfo(basicResult.data)

              if (statsResult.data) {
                setStats(statsResult.data)
              }
            })
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch PC info')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const fetchCompletePCInfo = () => {
    if (!user || !hasScanned) return Promise.resolve()

    return pcInfoService.getCompletePCInfo(user.id)
      .then(result => {
        if (result.error) {
          throw new Error(result.error.message || 'Failed to fetch complete PC info')
        }
        setCompletePCInfo(result.data)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to fetch complete PC info')
      })
  }

  const deletePCInfo = (): Promise<boolean> => {
    if (!user) return Promise.resolve(false)

    return pcInfoService.deletePCInfo(user.id)
      .then(result => {
        if (result.success) {
          setPCInfo(null)
          setCompletePCInfo(null)
          setStats(null)
          setHasScanned(false)
          return true
        } else {
          setError(result.error?.message || 'Failed to delete PC info')
          return false
        }
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Failed to delete PC info')
        return false
      })
  }

  useEffect(() => {
    fetchPCInfo()
  }, [user])

  useEffect(() => {
    if (hasScanned && !completePCInfo) {
      fetchCompletePCInfo()
    }
  }, [hasScanned, completePCInfo])

  return {
    pcInfo,
    completePCInfo,
    stats,
    loading,
    error,
    hasScanned,
    refetch: fetchPCInfo,
    deletePCInfo,
  }
}
