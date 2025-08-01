"use client";

import { useState, useEffect } from 'react';
import { MOCK_TWEAKS, getFeaturedTweaks } from '@/constants/tweaks-mock';
import { transformTweaksToContentItems } from '@/lib/transformers/tweak-transformer';
import CardTweakInfo from './card-tweak-info';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { ContentItem } from './categories-carrousel';

interface TweaksPreviewProps {
  onViewAll: () => void;
}

export default function TweaksPreview({ onViewAll }: TweaksPreviewProps) {
  const [tweaks, setTweaks] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTweaks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Get featured tweaks from mock data - limit to 4
        const featuredTweaks = getFeaturedTweaks().slice(0, 4);

        // Transform to ContentItem format
        const transformedTweaks = transformTweaksToContentItems(featuredTweaks);

        setTweaks(transformedTweaks);
      } catch (err) {
        console.error('Error loading tweaks preview:', err);
        setError('Failed to load tweaks preview. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadTweaks();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">System Tweaks</h2>
          <LoadingSpinner />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted rounded-lg h-80 w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">System Tweaks</h2>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-destructive hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (tweaks.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">System Tweaks</h2>
        <div className="bg-muted/50 border border-muted rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No tweaks available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">⚙️ System Tweaks</h2>
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-medium">
            {MOCK_TWEAKS.filter(t => t.is_active).length} available
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Featured Windows optimization tweaks
        </p>
      </div>

      {/* Tweaks Grid - 4 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tweaks.map((tweak) => (
          <CardTweakInfo
            key={tweak.id}
            id={String(tweak.id)}
            title={tweak.title}
            description={tweak.description}
            metadata={tweak.metadata as any}
          />
        ))}
      </div>


    </div>
  );
}
