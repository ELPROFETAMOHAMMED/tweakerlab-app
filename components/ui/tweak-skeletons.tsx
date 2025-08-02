"use client";

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton that matches exactly the structure of CardTweakInfo
 */
export function TweakCardSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Header - matches CardTweakInfo header */}
      <div className="p-4 pb-2 flex-shrink-0">
        <div className="flex items-start gap-3 mb-3">
          {/* Category Icon */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              <Skeleton className="w-5 h-5 rounded-sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            {/* Title */}
            <Skeleton className="h-4 w-3/4 mb-2" />
          </div>
        </div>

        {/* Description */}
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-2/3 mb-3" />

        {/* Compatibility - Compact */}
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center gap-1">
            <Skeleton className="h-2.5 w-2.5 rounded-sm" />
            <Skeleton className="h-2.5 w-2.5 rounded-sm" />
            <Skeleton className="h-2 w-8" />
          </div>
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-3 w-8 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
      </div>

      {/* Middle - Stats */}
      <div className="px-4 pb-2 flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Skeleton className="h-2.5 w-2.5 rounded-sm" />
              <Skeleton className="h-2 w-6" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-2.5 w-2.5 rounded-sm" />
              <Skeleton className="h-2 w-4" />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-2.5 w-2.5 rounded-sm" />
              <Skeleton className="h-2 w-6" />
            </div>
          </div>
          <Skeleton className="h-2 w-8" />
        </div>
        <Skeleton className="h-2 w-16 mx-auto" />
      </div>

      {/* Bottom - Actions */}
      <div className="p-4 pt-2">
        <div className="flex gap-2 mb-2">
          <Skeleton className="h-8 flex-1 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Risk Level */}
        <div className="flex items-center justify-center gap-1">
          <Skeleton className="h-2 w-12" />
          <Skeleton className="h-3 w-8 rounded-full" />
        </div>
      </div>
    </Card>
  );
}

/**
 * Skeleton for tweaks preview section (4 featured tweaks)
 */
export function TweaksPreviewSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Grid of featured tweaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }, (_, index) => (
          <TweakCardSkeleton key={`tweak-skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for full tweaks page with filters
 */
export function TweaksGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Active filters indicator */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: count }, (_, index) => (
          <TweakCardSkeleton key={`tweak-grid-skeleton-${index}`} />
        ))}
      </div>
    </div>
  );
}
