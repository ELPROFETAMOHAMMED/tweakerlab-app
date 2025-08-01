"use client"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileCog, Download, Star, Users } from "lucide-react";
import { useState } from "react";

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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async () => {
    if (!gameConfigId) {
      setDownloadError("Configuration not available");
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const response = await fetch('/api/game-configs/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameConfigId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }

      const { fileName, content, title } = await response.json();

      // Create and download the file
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      // Optional: Show success message or toast
      console.log(`Downloaded: ${fileName} for ${title}`);

    } catch (error) {
      console.error('Download error:', error);
      setDownloadError(error instanceof Error ? error.message : 'Download failed');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed">
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
          disabled={isDownloading || !gameConfigId}
        >
          {isDownloading ? (
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
