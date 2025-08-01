"use client"
import { Download, FileCog, Settings } from "lucide-react";
import { Button } from "../ui/button";

interface CardDashboardInfoProps {
  description: string;
  settingsFile: string;
  fileSize: string;
  downloads: number;
  rating: number;
  category: string;
}

export default function CardDashboardInfo({ description, settingsFile, fileSize, downloads, rating, category }: CardDashboardInfoProps) {
  return (
    <div className="grid grid-rows-[auto_1fr_auto] h-full gap-3">
      {/* Title row */}
      <div className="text-lg font-semibold">
        {category}
      </div>

      {/* Description and info row */}
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm line-clamp-2 overflow-hidden text-ellipsis" title={description}>
          {description}
        </p>

        <div className="flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-blue-600">
            <Settings className="w-3 h-3" />
            {settingsFile}
          </span>
          <span className="text-muted-foreground">{fileSize}</span>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Download className="w-3 h-3" />
            {downloads >= 1000000
              ? `${(downloads / 1000000).toFixed(1)}M`
              : downloads >= 1000
                ? `${(downloads / 1000).toFixed(0)}K`
                : downloads.toString()}
          </span>
          <span className="flex items-center gap-1">
            ⭐ {rating.toFixed(1)}/5
          </span>
        </div>
      </div>

      {/* Button row */}
      <div className="pt-2 border-t">
        <Button variant="secondary" className="w-full" onClick={() => {
          // Download .ini file
          console.log("Downloading .ini file");
        }}>
          <FileCog className="w-3 h-3" />
          Descargar .ini
        </Button>
      </div>
    </div>
  )
}
