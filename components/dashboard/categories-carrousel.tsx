"use client";

import { ReactNode } from "react";
import { Carousel, CarouselNext, CarouselPrevious } from "../ui/carousel";
import { CarouselContent, CarouselItem } from "../ui/carousel";
import { Card, CardTitle, CardHeader, CardDescription, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

export interface ContentItem {
  id: string | number;
  title: string;
  description: string;
  icon?: ReactNode;
  image?: string;
  badge?: string;
  metadata?: Record<string, any>;
}

interface ContentCarouselProps {
  items: ContentItem[];
  title?: string;
  showIcon?: boolean;
  showImage?: boolean;
  showBadge?: boolean;
  showSeparator?: boolean;
  itemsPerView?: "1/2" | "1/3" | "1/4" | "1/5" | "auto";
  className?: string;
  itemClassName?: string;
  onItemClick?: (item: ContentItem) => void;
  renderCustomContent?: (item: ContentItem) => ReactNode;
}

export default function ContentCarousel({
  items,
  title,
  showIcon = false,
  showImage = false,
  showBadge = false,
  showSeparator = true,
  itemsPerView = "1/3",
  className = "",
  itemClassName = "",
  onItemClick,
  renderCustomContent
}: ContentCarouselProps) {

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

  const handleItemClick = (item: ContentItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  return (
    <div className={className}>
      {title && (
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
      )}

      <Carousel>
        <CarouselContent>
          {items.map((item) => (
            <CarouselItem
              key={item.id}
              className={`${getBasisClass()} ${itemClassName}`}
            >
              <Card
                className={`h-full ${onItemClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                onClick={() => handleItemClick(item)}
              >
                {/* Header con icono/imagen */}
                <CardHeader className="flex flex-row items-center gap-2">
                  {(showIcon && item.icon) && (
                    <>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full text-primary">
                        {item.icon}
                      </div>
                      {showSeparator && <Separator orientation="vertical" className="h-6" />}
                    </>
                  )}

                  {(showImage && item.image) && (
                    <>
                      <div className="flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {showSeparator && <Separator orientation="vertical" className="h-6" />}
                    </>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {(showBadge && item.badge) && (
                        <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>

                {/* Custom content or default description */}
                <CardContent>
                  {renderCustomContent ? (
                    renderCustomContent(item)
                  ) : (
                    <CardDescription className="text-muted-foreground line-clamp-2">
                      {item.description}
                    </CardDescription>
                  )}
                </CardContent>
              </Card>
            </CarouselItem>
          ))}

        </CarouselContent>
        <CarouselNext />
        <CarouselPrevious />
      </Carousel>
    </div>
  );
}
