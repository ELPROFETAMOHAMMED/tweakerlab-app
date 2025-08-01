"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Home, Settings } from 'lucide-react';

interface DashboardPaginationProps {
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function DashboardPagination({
  currentPage,
  onPageChange
}: DashboardPaginationProps) {
  const pages = [
    {
      id: 1,
      title: "Overview",
      description: "Game configs and tweaks preview",
      icon: Home
    },
    {
      id: 2,
      title: "System Tweaks",
      description: "Complete tweaks with search and filters",
      icon: Settings
    }
  ];

  return (
    <div className="flex items-center justify-center">
      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        {/* Page Indicators */}
        <div className="flex items-center gap-2  mx-4">
          {pages.map((page) => (
            <Button
              key={page.id}
              variant={currentPage === page.id ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page.id)}
              className="w-8 h-8 p-0"
            >
              {page.id}
            </Button>
          ))}
        </div>

        {/* Next Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= pages.length}
          className="flex items-center gap-2"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
