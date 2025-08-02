import { useFeaturedTweaks, useTweaks, useTweaksCount } from './use-tweaks-cache';

/**
 * Optimized hook for tweaks preview - gets count first for dynamic skeletons
 */
export function useOptimizedTweaksPreview() {
  // Get count immediately (super fast, usually cached)
  const { data: totalCount = 0, isLoading: isCountLoading } = useTweaksCount();

  // Get featured tweaks (might take longer)
  const { data: featuredData, isLoading: isFeaturedLoading, error, refetch } = useFeaturedTweaks(4);

  // Calculate skeleton count for preview (max 4)
  const skeletonCount = Math.min(totalCount || 4, 4);

  // Return optimized loading state
  const isLoadingData = isFeaturedLoading;
  const hasCount = !isCountLoading && totalCount > 0;

  return {
    tweaks: featuredData?.tweaks || [],
    totalCount,
    skeletonCount,
    isLoadingData,
    hasCount,
    error,
    refetch
  };
}

/**
 * Optimized hook for full tweaks page - gets count first for dynamic skeletons
 */
export function useOptimizedTweaksGrid(filters: any) {
  // Get count immediately (super fast, usually cached)
  const { data: totalCount = 0, isLoading: isCountLoading } = useTweaksCount();

  // Get filtered tweaks (might take longer)
  const { data: tweaksData, isLoading: isTweaksLoading, error, refetch } = useTweaks(filters);

  // Calculate skeleton count for grid (reasonable max for performance)
  const skeletonCount = Math.min(totalCount || 12, 20);

  // Return optimized loading state
  const isLoadingData = isTweaksLoading;
  const hasCount = !isCountLoading && totalCount > 0;

  return {
    tweaks: tweaksData?.tweaks || [],
    totalCount,
    skeletonCount,
    isLoadingData,
    hasCount,
    error,
    refetch
  };
}
