"use client";

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X } from 'lucide-react';
import { MOCK_TWEAKS } from '@/constants/tweaks-mock';
import { transformTweaksToContentItems } from '@/lib/transformers/tweak-transformer';
import CardTweakInfo from './card-tweak-info';
import { LoadingSpinner } from '@/components/ui/loading-states';
import { ContentItem } from './categories-carrousel';
import { TweakCategory, TweakRiskLevel, DeviceType, WindowsVersion, TweakStatus } from '@/types/tweak';

export default function TweaksFullPage() {
  const [tweaks, setTweaks] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<TweakCategory | 'all'>('all');
  const [riskFilter, setRiskFilter] = useState<TweakRiskLevel | 'all'>('all');
  const [deviceFilter, setDeviceFilter] = useState<DeviceType | 'all'>('all');
  const [windowsFilter, setWindowsFilter] = useState<WindowsVersion | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<TweakStatus | 'all'>('all');

  useEffect(() => {
    const loadTweaks = async () => {
      try {
        setIsLoading(true);

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 600));

        // Get all tweaks from mock data (including disabled for admin view)
        const allTweaks = MOCK_TWEAKS;

        // Transform to ContentItem format
        const transformedTweaks = transformTweaksToContentItems(allTweaks);

        setTweaks(transformedTweaks);
      } catch (err) {
        console.error('Error loading tweaks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadTweaks();
  }, []);

  // Filter tweaks based on search and filters
  const filteredTweaks = useMemo(() => {
    return tweaks.filter(tweak => {
      const metadata = tweak.metadata as any;

      // Search filter
      const matchesSearch = searchQuery === '' ||
        tweak.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tweak.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        metadata.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = categoryFilter === 'all' || metadata.category === categoryFilter;

      // Risk filter
      const matchesRisk = riskFilter === 'all' || metadata.riskLevel === riskFilter;

      // Device filter
      const matchesDevice = deviceFilter === 'all' ||
        metadata.deviceType === deviceFilter ||
        metadata.deviceType === 'both';

      // Windows filter
      const matchesWindows = windowsFilter === 'all' ||
        metadata.windowsVersion === windowsFilter ||
        metadata.windowsVersion === 'both';

      // Status filter
      const matchesStatus = statusFilter === 'all' || metadata.status === statusFilter;

      return matchesSearch && matchesCategory && matchesRisk && matchesDevice && matchesWindows && matchesStatus;
    });
  }, [tweaks, searchQuery, categoryFilter, riskFilter, deviceFilter, windowsFilter, statusFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setRiskFilter('all');
    setDeviceFilter('all');
    setWindowsFilter('all');
    setStatusFilter('all');
  };

  // Count active filters
  const activeFiltersCount = [
    searchQuery !== '',
    categoryFilter !== 'all',
    riskFilter !== 'all',
    deviceFilter !== 'all',
    windowsFilter !== 'all',
    statusFilter !== 'all'
  ].filter(Boolean).length;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner message="Loading tweaks..." />
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tweaks by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Filters:</span>
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={(value: any) => setCategoryFilter(value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="performance">⚡ Performance</SelectItem>
              <SelectItem value="privacy">🛡️ Privacy</SelectItem>
              <SelectItem value="gaming">🎮 Gaming</SelectItem>
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
              <SelectValue placeholder="Risk Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Risks</SelectItem>
              <SelectItem value="minimal">🟢 Safe</SelectItem>
              <SelectItem value="low">🔵 Low</SelectItem>
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
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-3 w-3" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Active filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Search: "{searchQuery}"
              </Badge>
            )}
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
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {filteredTweaks.length} of {tweaks.length} tweaks
          </p>
        </div>

        {/* Tweaks Grid */}
        {filteredTweaks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTweaks.map((tweak) => (
              <CardTweakInfo
                key={tweak.id}
                id={String(tweak.id)}
                title={tweak.title}
                description={tweak.description}
                metadata={tweak.metadata as any}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No tweaks found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
