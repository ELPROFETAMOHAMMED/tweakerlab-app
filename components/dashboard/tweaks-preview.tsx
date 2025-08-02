"use client";

import { Button } from '@/components/ui/button';
import CardTweakInfo from './card-tweak-info';
import { TweaksPreviewSkeleton } from '@/components/ui/tweak-skeletons';
import { useFeaturedTweaks, useTweaksCount } from '@/tweaks';
import { transformDatabaseTweaksToContentItems } from '@/lib/transformers/tweak-transformer';

export default function TweaksPreview() {
  // Get count first (fast), then get featured tweaks
  const { data: totalCount = 0, isLoading: isCountLoading } = useTweaksCount();
  const { data: featuredData, isLoading: isFeaturedLoading, error: featuredError } = useFeaturedTweaks(4);

  const tweaks = featuredData?.tweaks ? transformDatabaseTweaksToContentItems(featuredData.tweaks) : [];

  // Convert error to string if it exists
  const error = featuredError ?
    (featuredError instanceof Error ? featuredError.message : 'Unknown error') : null;

  // Show skeleton with dynamic count (max 4 for preview)
  if (isFeaturedLoading) {
    const skeletonCount = Math.min(totalCount || 4, 4); // Show real count or fallback to 4
    return <TweaksPreviewSkeleton count={skeletonCount} />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">⚙️ System Tweaks</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Featured tweaks to optimize your Windows system
          </p>
        </div>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-muted-foreground mb-4">{error}</p>

            {error.includes('Database not configured') && (
              <div className="text-left bg-muted/50 p-4 rounded-lg text-sm space-y-2">
                <p className="font-medium">🔧 Database Setup Required:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Go to your Supabase dashboard → SQL Editor</li>
                  <li>Run <code className="bg-muted px-1 rounded font-mono">scripts/010-create-tweaks-table.sql</code></li>
                  <li>Run <code className="bg-muted px-1 rounded font-mono">scripts/011-create-tweaks-functions.sql</code></li>
                  <li>Run <code className="bg-muted px-1 rounded font-mono">scripts/012-insert-sample-tweaks.sql</code></li>
                  <li>Refresh this page</li>
                </ol>
                <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950 rounded border-l-2 border-blue-400">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    💡 <strong>Tip:</strong> You can also run <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded font-mono">scripts/debug-database-status.sql</code> to check what's missing.
                  </p>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-sm"
            >
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">⚙️ System Tweaks</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Featured tweaks to optimize your Windows system • Explore {totalCount}+ available tweaks
        </p>
      </div>

      {/* Grid of featured tweaks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tweaks.map((tweak) => (
          <CardTweakInfo
            key={tweak.id}
            id={tweak.id}
            title={tweak.title}
            description={tweak.description}
            metadata={tweak.metadata}
          />
        ))}
      </div>
    </div>
  );
}
