"use client"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCog, Download, Star, Users } from "lucide-react";
import { useState } from "react";
import { useDownloadGameConfig } from "@/hooks/use-game-configs-cache";

interface CardDashboardInfoProps {
  description: string;
  settingsFile?: string;
  fileSize?: string;
  downloads?: string;
  rating?: number;
  category?: string;
  gameConfigId?: number;
}

export default function CardDashboardInfo({
  description,
  settingsFile,
  fileSize,
  downloads,
  rating,
  category,
  gameConfigId
}: CardDashboardInfoProps) {
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Use cache mutation - handles loading state automatically
  const downloadMutation = useDownloadGameConfig();

  const handleDownload = async () => {
    if (!gameConfigId) {
      setDownloadError("Configuration not available");
      return;
    }

    setDownloadError(null);

    try {
      await downloadMutation.mutateAsync(gameConfigId);
    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error instanceof Error ? error.message : 'Download failed');
    }
  };

  return (
    <div className="space-y-3">
      {/* Description with line clamping */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
        {description}
      </p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {downloads && (
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-blue-500" />
            <span className="font-medium">{downloads}</span>
            <span className="text-muted-foreground">downloads</span>
          </div>
        )}

        {rating && (
          <div className="flex items-center gap-1.5">
            <Star className="w-3 h-3 text-yellow-500" />
            <span className="font-medium">{rating}</span>
            <span className="text-muted-foreground">/5</span>
          </div>
        )}

        {fileSize && (
          <div className="flex items-center gap-1.5">
            <FileCog className="w-3 h-3 text-green-500" />
            <span className="font-medium">{fileSize}</span>
          </div>
        )}

        {category && (
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
              {category}
            </Badge>
          </div>
        )}
      </div>

      {/* Error Message */}
      {downloadError && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
          {downloadError}
        </div>
      )}

      {/* Download Button */}
      <div className="pt-2 border-t">
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleDownload}
          disabled={downloadMutation.isPending || !gameConfigId}
        >
          {downloadMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-2" />
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-3 h-3 mr-2" />
              Download .ini
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
