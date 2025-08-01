"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { usePCInfo } from "@/hooks/use-pc-info";
import { Monitor, Cpu, HardDrive, Wifi, AlertTriangle, Trash2 } from "lucide-react";

export function PCInfoDisplay() {
  const { pcInfo, stats, loading, error, hasScanned, refetch, deletePCInfo } = usePCInfo();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading PC information...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading PC Info</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasScanned) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No PC Information</h3>
            <p className="text-muted-foreground">Upload an MSInfo32 file to see your PC details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete your PC information?")) {
      await deletePCInfo();
    }
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            System Overview
          </CardTitle>
          <Badge variant={pcInfo?.device_type === "laptop" ? "default" : "secondary"}>
            {pcInfo?.device_type?.charAt(0).toUpperCase() + pcInfo?.device_type?.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">System Name</h4>
              <p className="text-muted-foreground">{pcInfo?.system_name || "Unknown"}</p>
            </div>
            <div>
              <h4 className="font-semibold">OS Version</h4>
              <p className="text-muted-foreground">{pcInfo?.os_name || "Unknown"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Manufacturer</h4>
              <p className="text-muted-foreground">{pcInfo?.system_manufacturer || "Unknown"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Model</h4>
              <p className="text-muted-foreground">{pcInfo?.system_model || "Unknown"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hardware Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Hardware Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <Cpu className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Processor</h4>
                <p className="text-sm text-muted-foreground truncate" title={stats.processor}>
                  {stats.processor}
                </p>
              </div>
              <div className="text-center">
                <Monitor className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Memory</h4>
                <p className="text-sm text-muted-foreground">{stats.totalRAM}</p>
              </div>
              <div className="text-center">
                <HardDrive className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Storage</h4>
                <p className="text-sm text-muted-foreground">{stats.disks} disk(s)</p>
              </div>
              <div className="text-center">
                <Wifi className="h-8 w-8 text-primary mx-auto mb-2" />
                <h4 className="font-semibold">Network</h4>
                <p className="text-sm text-muted-foreground">{stats.networkAdapters} adapter(s)</p>
              </div>
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
                <h4 className="font-semibold">Issues</h4>
                <p className="text-sm text-muted-foreground">{stats.problemDevices} problem(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold">BIOS Version</h4>
              <p className="text-muted-foreground">{pcInfo?.bios_version || "Unknown"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Secure Boot</h4>
              <p className="text-muted-foreground">{pcInfo?.secure_boot_state || "Unknown"}</p>
            </div>
            <div>
              <h4 className="font-semibold">System Type</h4>
              <p className="text-muted-foreground">{pcInfo?.system_type || "Unknown"}</p>
            </div>
            <div>
              <h4 className="font-semibold">Last Updated</h4>
              <p className="text-muted-foreground">
                {pcInfo?.updated_at ? new Date(pcInfo.updated_at).toLocaleDateString() : "Unknown"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={refetch} variant="outline">
              Refresh Information
            </Button>
            <Button onClick={handleDelete} variant="destructive" className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              Delete PC Information
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
