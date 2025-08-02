"use client";

import { useState, Suspense } from 'react';
import DashboardPagination from './dashboard-pagination';
import { GameConfigsSection } from './game-configs-section';
import { GameConfigsLoading } from '@/components/ui/loading-states';
import TweaksPreview from './tweaks-preview';
import TweaksFullPage from './tweaks-full-page';

export default function DashboardPaginatedContent() {
  const [currentPage, setCurrentPage] = useState(1);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 1:
        return (
          <div className="space-y-10">
            {/* Game Configurations Section - Server-side rendered */}
            <div className="w-full">
              <Suspense fallback={<GameConfigsLoading />}>
                <GameConfigsSection />
              </Suspense>
            </div>

            {/* System Tweaks Preview - Client-side rendered */}
            <div className="w-full">
              <TweaksPreview />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="w-full">
            <TweaksFullPage />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Content */}
      <div className="min-h-[400px]">
        {renderContent()}
      </div>

      {/* Pagination Controls - Centered at Bottom */}
      <div className="flex justify-center pt-8">
        <DashboardPagination
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
