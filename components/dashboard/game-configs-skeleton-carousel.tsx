"use client";

import { Carousel, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { CarouselContent, CarouselItem } from "../ui/carousel";
import { Card, CardHeader, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

interface GameConfigsSkeletonCarouselProps {
  count?: number;
  title?: string;
  showIcon?: boolean;
  showImage?: boolean;
  showBadge?: boolean;
  showSeparator?: boolean;
  itemsPerView?: "1/2" | "1/3" | "1/4" | "1/5" | "auto";
  className?: string;
  itemClassName?: string;
  renderCustomContent?: boolean;
}

/**
 * Skeleton card that matches exactly the structure of ContentCarousel cards
 */
function SkeletonCard({
  showIcon,
  showImage,
  showBadge,
  showSeparator,
  renderCustomContent
}: {
  showIcon?: boolean;
  showImage?: boolean;
  showBadge?: boolean;
  showSeparator?: boolean;
  renderCustomContent?: boolean;
}) {
  return (
    <Card className="h-full">
      {/* Header - matches exactly CardHeader structure */}
      <CardHeader className="flex flex-row items-center gap-2">
        {showIcon && (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full">
              <Skeleton className="w-6 h-6 rounded-full" />
            </div>
            {showSeparator && <Separator orientation="vertical" className="h-6" />}
          </>
        )}

        {showImage && (
          <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
            {showSeparator && <Separator orientation="vertical" className="h-6" />}
          </>
        )}

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32" /> {/* Title */}
            {showBadge && (
              <Skeleton className="h-5 w-16 rounded-full" /> {/* Badge */}
            )}
          </div>
        </div>
      </CardHeader>

      {/* Content - matches CardContent structure */}
      <CardContent>
        {renderCustomContent ? (
          // Skeleton for CardDashboardInfo structure
          <div className="space-y-3">
            {/* Description - 2 lines max with ellipsis */}
            <div className="space-y-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Stats Grid - matches the original 2x2 grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-3 w-6" />
                <Skeleton className="h-3 w-4" />
              </div>
              <div className="flex items-center gap-1.5">
                <Skeleton className="w-3 h-3 rounded-full" />
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
        ) : (
          // Simple description skeleton for non-custom content
          <div className="space-y-1">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton carousel that maintains the exact same structure as ContentCarousel
 */
export function GameConfigsSkeletonCarousel({
  count = 8,
  title,
  showIcon = false,
  showImage = true,
  showBadge = true,
  showSeparator = true,
  itemsPerView = "1/4",
  className = "",
  itemClassName = "",
  renderCustomContent = true
}: GameConfigsSkeletonCarouselProps) {

  const getBasisClass = () => {
    switch (itemsPerView) {
      case "1/2": return "basis-1/2";
      case "1/3": return "basis-1/3";
      case "1/4": return "basis-1/4";
      case "1/5": return "basis-1/5";
      case "auto": return "basis-auto";
      default: return "basis-1/3";
    }
  };

  // Create skeleton items array
  const skeletonItems = Array.from({ length: count }, (_, index) => ({
    id: `skeleton-${index}`
  }));

  return (
    <div className={className}>
      {title && (
        <Skeleton className="h-8 w-80 mb-4" />
      )}

      <Carousel>
        <CarouselContent>
          {skeletonItems.map((item) => (
            <CarouselItem
              key={item.id}
              className={`${getBasisClass()} ${itemClassName}`}
            >
              <SkeletonCard
                showIcon={showIcon}
                showImage={showImage}
                showBadge={showBadge}
                showSeparator={showSeparator}
                renderCustomContent={renderCustomContent}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </div>
  );
}
