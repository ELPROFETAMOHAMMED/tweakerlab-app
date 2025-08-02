"use client";

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import CardTweakInfo from './card-tweak-info';
import { TweaksGridSkeleton } from '@/components/ui/tweak-skeletons';
import { TweakCategory, TweakRiskLevel, DeviceType, WindowsVersion, TweakStatus } from '@/types/tweak';
import { useTweaks, useSearchTweaks, useTweaksCount } from '@/hooks/use-tweaks-cache';
import { transformDatabaseTweaksToContentItems } from '@/lib/transformers/tweak-transformer';

export default function TweaksFullPage() {
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TweakCategory | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<TweakRiskLevel | 'all'>('all');
  const [deviceFilter, setDeviceFilter] = useState<DeviceType | 'all'>('all');
  const [windowsFilter, setWindowsFilter] = useState<WindowsVersion | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TweakStatus | 'all'>('all');

  // Prepare filters for the cache hooks
  const filters = useMemo(() => ({
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
    riskLevel: riskFilter !== 'all' ? riskFilter : undefined,
    deviceType: deviceFilter !== 'all' ? deviceFilter : undefined,
    windowsVersion: windowsFilter !== 'all' ? windowsFilter : undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    limit: 100
  }), [categoryFilter, riskFilter, deviceFilter, windowsFilter, statusFilter]);

  // Get count first for dynamic skeletons
  const { data: totalCount = 0 } = useTweaksCount();

  // Use cache hooks - automatically handle loading and caching
  const { data: tweaksData, isLoading: isTweaksLoading, error: tweaksError } = useTweaks(filters);
  const { data: searchData, isLoading: isSearchLoading, error: searchError } = useSearchTweaks(
    searchQuery,
    100
  );

  // Determine which data to use and loading state
  const isUsingSearch = searchQuery.length > 2;
  const currentData = isUsingSearch ? searchData : tweaksData;
  const isLoading = isUsingSearch ? isSearchLoading : isTweaksLoading;
  const error = isUsingSearch ? searchError : tweaksError;

  // Transform to UI format
  const tweaks = useMemo(() => {
    if (!currentData?.tweaks) return [];
    return transformDatabaseTweaksToContentItems(currentData.tweaks);
  }, [currentData]);

  // Convert error to string for display
  const errorMessage = error ? (error instanceof Error ? error.message : 'Unknown error') : null;



  // Count active filters
  const activeFiltersCount = [
    categoryFilter !== 'all',
    riskFilter !== 'all',
    deviceFilter !== 'all',
    windowsFilter !== 'all',
    statusFilter !== 'all'
  ].filter(Boolean).length;

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setRiskFilter('all');
    setDeviceFilter('all');
    setWindowsFilter('all');
    setStatusFilter('all');
  };

  if (isLoading) {
    // Calculate dynamic skeleton count based on total count or reasonable default
    const skeletonCount = Math.min(totalCount || 12, 20); // Show real count or max 20 for performance
    return <TweaksGridSkeleton count={skeletonCount} />;
  }

  if (errorMessage) {
    return (
      <div className="space-y-6">
        <div className="space-y-1 mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">⚙️ All System Tweaks</h2>
          </div>
          <p className="text-muted-foreground text-sm">
            Search and filter Windows optimization tweaks
          </p>
        </div>
        <div className="text-center py-12">
          <div className="max-w-md mx-auto space-y-4">
            <p className="text-muted-foreground mb-4">{errorMessage}</p>

            {errorMessage.includes('Database not configured') && (
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
      <div className="space-y-1 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">⚙️ All System Tweaks</h2>
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground font-medium">
            {tweaks.length} total
          </span>
        </div>
        <p className="text-muted-foreground text-sm">
          Search and filter Windows optimization tweaks
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="w-full max-w-md">
          <Input
            placeholder="Search tweaks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="gaming">🎮 Gaming</SelectItem>
              <SelectItem value="performance">⚡ Performance</SelectItem>
              <SelectItem value="privacy">🛡️ Privacy</SelectItem>
              <SelectItem value="battery">🔋 Battery</SelectItem>
              <SelectItem value="appearance">🎨 Appearance</SelectItem>
              <SelectItem value="network">🌐 Network</SelectItem>
              <SelectItem value="system">⚙️ System</SelectItem>
              <SelectItem value="security">🔒 Security</SelectItem>
            </SelectContent>
          </Select>

          {/* Risk Level Filter */}
          <Select value={riskFilter} onValueChange={(value: any) => setRiskFilter(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risk</SelectItem>
              <SelectItem value="minimal">✅ Minimal</SelectItem>
              <SelectItem value="low">🟢 Low</SelectItem>
              <SelectItem value="medium">🟡 Medium</SelectItem>
              <SelectItem value="high">🟠 High</SelectItem>
              <SelectItem value="critical">🔴 Critical</SelectItem>
            </SelectContent>
          </Select>

          {/* Device Type Filter */}
          <Select value={deviceFilter} onValueChange={(value: any) => setDeviceFilter(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Device" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Devices</SelectItem>
              <SelectItem value="desktop">🖥️ Desktop</SelectItem>
              <SelectItem value="laptop">💻 Laptop</SelectItem>
              <SelectItem value="both">🖥️💻 Both</SelectItem>
            </SelectContent>
          </Select>

          {/* Windows Version Filter */}
          <Select value={windowsFilter} onValueChange={(value: any) => setWindowsFilter(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Windows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Windows</SelectItem>
              <SelectItem value="win10">Windows 10</SelectItem>
              <SelectItem value="win11">Windows 11</SelectItem>
              <SelectItem value="both">Win 10/11</SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">✅ Active</SelectItem>
              <SelectItem value="disabled">🚫 Disabled</SelectItem>
              <SelectItem value="deprecated">📦 Deprecated</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-10"
            >
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {categoryFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Category: {categoryFilter}
              </Badge>
            )}
            {riskFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Risk: {riskFilter}
              </Badge>
            )}
            {deviceFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Device: {deviceFilter}
              </Badge>
            )}
            {windowsFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Windows: {windowsFilter}
              </Badge>
            )}
            {statusFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Status: {statusFilter}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {tweaks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {searchQuery ? `No tweaks found for "${searchQuery}"` : 'No tweaks match your filters'}
          </p>
          <Button variant="ghost" onClick={clearAllFilters} className="text-sm">
            Clear all filters
          </Button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
