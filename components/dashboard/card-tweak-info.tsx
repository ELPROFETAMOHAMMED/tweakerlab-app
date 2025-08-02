"use client";

import { useState } from 'react';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TweakReportModal from './tweak-report-modal';
import AdminNotesDialog from './admin-notes-dialog';
import {
  Download,
  Heart,
  Star,
  Monitor,
  Laptop,
  Clock,
  Flag,
  Ban
} from 'lucide-react';
import { formatFileSize, formatSuccessRate } from '@/lib/transformers/tweak-transformer';
import { formatDownloads } from '@/lib/utils/format-helpers';
import { useDownloadTweak, useLikeTweak } from '@/tweaks';

interface TweakCardProps {
  id: string;
  title: string;
  description: string;
  metadata: {
    tweakId: string;
    category: string;
    riskLevel: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
    riskColor: string;
    riskDescription: string;
    deviceType: 'desktop' | 'laptop' | 'both';
    deviceIcon: string;
    deviceText: string;
    windowsVersion: 'win10' | 'win11' | 'both';
    requiresAdmin: boolean;
    requiresRestart: boolean;
    affectsBattery: boolean;
    affectsPerformance: boolean;
    affectsSecurity: boolean;
    fileExtension: string;
    fileSizeBytes: number;
    downloads: number;
    likes: number;
    rating: number;
    successRate: number;
    isVerifiedAuthor: boolean;
    authorName: string;
    reversalMethod: string;
    conflictsWith: string[];
    requiresTweaks: string[];
    // New fields
    status: 'active' | 'disabled' | 'deprecated';
    adminNotes?: string;
    disableReason?: string;
    reportsCount?: number;
  };
}

export default function CardTweakInfo({
  id,
  title,
  description,
  metadata
}: TweakCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [showAdminDialog, setShowAdminDialog] = useState(false);

  // Use cache mutations - they handle loading states
  const downloadMutation = useDownloadTweak();
  const likeMutation = useLikeTweak();

  const handleDownloadClick = () => {
    // If disabled, show dialog with disable reason
    if (isDisabled || metadata.adminNotes) {
      setShowAdminDialog(true);
      return;
    }

    // If no admin notes, proceed directly
    handleActualDownload();
  };

  const handleActualDownload = async () => {
    try {
      // Use cache mutation - handles loading state automatically
      await downloadMutation.mutateAsync(metadata.tweakId);
    } catch (error) {
      console.error('Error downloading tweak:', error);
      alert('Failed to download tweak. Please try again.');
    }
  };

  const handleLike = async () => {
    try {
      const action = isLiked ? 'unlike' : 'like';
      // Use cache mutation with optimistic updates
      await likeMutation.mutateAsync({ tweakId: metadata.tweakId, action });
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error (mutation handles cache revert)
      setIsLiked(isLiked);
    }
  };

  const isDisabled = metadata.status === 'disabled';
  const isDeprecated = metadata.status === 'deprecated';

  return (
    <div className="relative h-full">
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200 relative overflow-hidden">
        {/* Report Button - Top Right */}
        <div className="absolute top-2 right-2 z-10">
          <TweakReportModal tweakId={metadata.tweakId} tweakTitle={title}>
            <Button
              variant="outline"
              size="sm"
              className="p-1 h-7 w-7 rounded-md"
              title="Report an issue with this tweak"
            >
              <Flag className="h-3 w-3" />
            </Button>
          </TweakReportModal>
        </div>

        {/* Top - Icon and Title */}
        <div className="p-4 pb-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
              <img
                src={`/icons/tweaks/${metadata.tweakId}.png`}
                alt={title}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = 'flex';
                  }
                }}
              />
              <div className="text-xl hidden items-center justify-center w-full h-full">
                {metadata.category === 'privacy' ? '🛡️' :
                  metadata.category === 'gaming' ? '🎮' :
                    metadata.category === 'performance' ? '⚡' :
                      metadata.category === 'battery' ? '🔋' :
                        metadata.category === 'appearance' ? '🎨' :
                          metadata.category === 'network' ? '🌐' :
                            metadata.category === 'system' ? '⚙️' :
                              metadata.category === 'security' ? '🔒' : '🔧'}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold line-clamp-2">
                {title}
              </CardTitle>
            </div>
          </div>

          <CardDescription className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {description}
          </CardDescription>

          {/* Compatibility - Compact */}
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              {metadata.deviceType === 'desktop' && <Monitor className="h-2.5 w-2.5" />}
              {metadata.deviceType === 'laptop' && <Laptop className="h-2.5 w-2.5" />}
              {metadata.deviceType === 'both' && (
                <>
                  <Monitor className="h-2.5 w-2.5" />
                  <Laptop className="h-2.5 w-2.5" />
                </>
              )}
              <span>
                {metadata.deviceType === 'both' ? 'All' :
                  metadata.deviceType === 'desktop' ? 'Desktop' : 'Laptop'}
              </span>
            </div>

            <span>Win {metadata.windowsVersion === 'both' ? '10/11' : metadata.windowsVersion.replace('win', '')}</span>

            {metadata.requiresAdmin && (
              <Badge variant="secondary" className="text-[8px] py-0 px-1 h-3">
                Admin
              </Badge>
            )}
            {metadata.requiresRestart && (
              <Badge variant="secondary" className="text-[8px] py-0 px-1 h-3">
                <Clock className="h-2 w-2 mr-0.5" />
                Restart
              </Badge>
            )}
          </div>
        </div>

        {/* Middle - Stats */}
        <div className="px-4 pb-2 flex-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Download className="h-2.5 w-2.5" />
                <span>{formatDownloads(metadata.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-2.5 w-2.5" />
                <span>{formatDownloads(metadata.likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                <span>{metadata.rating.toFixed(1)}</span>
              </div>
            </div>

            <div className="font-medium text-muted-foreground text-right">
              {formatFileSize(metadata.fileSizeBytes)}
            </div>
          </div>

          <div className="text-[10px] text-muted-foreground text-center">
            File type: {metadata.fileExtension}
          </div>
        </div>

        {/* Bottom - Actions */}
        <div className="p-4 pt-2">
          <div className="flex gap-2 mb-2">
            <Button
              onClick={handleDownloadClick}
              disabled={downloadMutation.isPending || isDeprecated}
              size="sm"
              className="flex-1 h-8"
            >
              {downloadMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-background mr-1" />
                  ...
                </>
              ) : (
                <>
                  <Download className="h-3 w-3 mr-1" />
                  {isDeprecated ? 'Deprecated' : 'Download'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLike}
              disabled={isDeprecated}
              className={`px-2 h-8 ${isLiked ? 'text-destructive border-destructive bg-destructive/10' : ''}`}
            >
              <Heart className={`h-3 w-3 ${isLiked ? 'fill-destructive' : ''}`} />
            </Button>
          </div>

          <div className="text-[9px] text-muted-foreground text-center">
            by {metadata.authorName}
          </div>
        </div>
      </Card>

      {/* Disabled Overlay */}
      {isDisabled && (
        <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-lg p-4">
          <div className="bg-destructive/70 border border-destructive text-destructive-foreground text-xs px-3 py-2 rounded-lg flex items-start gap-2 shadow-lg max-w-full text-center">
            <Ban className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold mb-1">Tweak Temporarily Disabled</div>
              <div className="text-xs opacity-90 leading-tight">
                {metadata.disableReason || "This tweak has been temporarily disabled"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Notes Dialog */}
      <AdminNotesDialog
        isOpen={showAdminDialog}
        onOpenChange={setShowAdminDialog}
        adminNotes={metadata.adminNotes}
        tweakTitle={title}
        isDisabled={isDisabled}
        disableReason={metadata.disableReason}
        onConfirmDownload={handleActualDownload}
      />
    </div>
  );
}
