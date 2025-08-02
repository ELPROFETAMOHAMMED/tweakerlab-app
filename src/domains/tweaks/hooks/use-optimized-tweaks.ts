import { useFeaturedTweaks, useTweaks, useTweaksCount } from './use-tweaks'

export function useOptimizedTweaksPreview() {
  const { data: totalCount = 0, isLoading: isCountLoading } = useTweaksCount()
  const { data: featuredData, isLoading: isFeaturedLoading, error, refetch } = useFeaturedTweaks(4)

  const skeletonCount = Math.min(totalCount || 4, 4)
  const isLoadingData = isFeaturedLoading
  const hasCount = !isCountLoading && totalCount > 0

  return {
    tweaks: featuredData?.tweaks || [],
    totalCount,
    skeletonCount,
    isLoadingData,
    hasCount,
    error,
    refetch
  }
}

export function useOptimizedTweaksGrid(filters: any) {
  const { data: totalCount = 0, isLoading: isCountLoading } = useTweaksCount()
  const { data: tweaksData, isLoading: isTweaksLoading, error, refetch } = useTweaks(filters)

  const skeletonCount = Math.min(totalCount || 12, 20)
  const isLoadingData = isTweaksLoading
  const hasCount = !isCountLoading && totalCount > 0

  return {
    tweaks: tweaksData?.tweaks || [],
    totalCount,
    skeletonCount,
    isLoadingData,
    hasCount,
    error,
    refetch
  }
}
