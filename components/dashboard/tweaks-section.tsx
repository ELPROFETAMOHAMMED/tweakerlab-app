"use client";

import { useState, useEffect } from 'react';
import ContentCarousel from './categories-carrousel';
import { ContentItem } from './categories-carrousel';
import { MOCK_TWEAKS, getFeaturedTweaks } from '@/constants/tweaks-mock';
import { transformTweaksToContentItems } from '@/lib/transformers/tweak-transformer';
import CardTweakInfo from './card-tweak-info';
import { LoadingSpinner } from '@/components/ui/loading-states';

export default function TweaksSection() {
  const [tweaks, setTweaks] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTweaks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Get featured tweaks from mock data
        const featuredTweaks = getFeaturedTweaks();

        // Transform to ContentItem format
        const transformedTweaks = transformTweaksToContentItems(featuredTweaks);

        setTweaks(transformedTweaks);
      } catch (err) {
        console.error('Error loading tweaks:', err);
        setError('Failed to load tweaks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTweaks();
  }, []);

  // Custom render function for tweak cards
  const renderTweakCard = (item: ContentItem) => {
    return (
      <CardTweakInfo
        key={item.id}
        id={String(item.id)}
        title={item.title}
        description={item.description}
        metadata={item.metadata as any} // Type assertion for now
      />
    );
  };



  return (
    <ContentCarousel
      items={tweaks}
      renderCustomContent={renderTweakCard}
      itemsPerView="1/3"
      title="System Tweaks"
      variant="clean"
      className="pb-4"
    />
  );
}
