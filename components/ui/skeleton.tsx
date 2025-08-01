import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/**
 * Skeleton for game configuration cards
 */
function GameConfigCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* Card Header */}
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Card Content */}
      <div className="p-6 pt-0 space-y-4">
        {/* Game Image */}
        <Skeleton className="h-48 w-full rounded-md" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-8" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-3 w-3 rounded-full" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-12 rounded" />
          </div>
        </div>

        {/* Download Button */}
        <div className="pt-2 border-t">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for the entire game configs carousel
 */
function GameConfigsCarouselSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {/* Title Skeleton */}
      <Skeleton className="h-8 w-80" />

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-12">
          {Array.from({ length: count }, (_, index) => (
            <GameConfigCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { Skeleton, GameConfigCardSkeleton, GameConfigsCarouselSkeleton }
