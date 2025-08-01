"use client";

import { PCInfoCard } from "@/components/pc-info/pc-info-card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { usePCInfo } from "@/hooks/use-pc-info";
import Link from "next/link";

export function PCInfoSection() {
  const { hasScanned } = usePCInfo();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">PC Information</h2>
        {hasScanned && (
          <Link href="/onboarding">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Update Scan
            </Button>
          </Link>
        )}
      </div>

      <PCInfoCard />

      {!hasScanned && (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Upload your MSInfo32 file to see your PC information here.
          </p>
          <Link href="/onboarding">
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload PC Scan
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
