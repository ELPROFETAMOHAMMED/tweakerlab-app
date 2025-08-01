"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePCInfo } from "@/hooks/use-pc-info";
import { Monitor, Cpu, HardDrive, Wifi, AlertTriangle } from "lucide-react";

export function PCInfoCard() {
  const { pcInfo, stats, loading, error, hasScanned } = usePCInfo();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !hasScanned) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Monitor className="h-8 w-8 mx-auto mb-2" />
            <p>{error || "No PC information available"}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Monitor className="h-5 w-5" />
          {pcInfo?.system_name || "Your PC"}
        </CardTitle>
        <Badge variant={pcInfo?.device_type === "laptop" ? "default" : "secondary"}>
          {pcInfo?.device_type}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">OS</p>
              <p className="font-medium">{pcInfo?.os_name || "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Manufacturer</p>
              <p className="font-medium">{pcInfo?.system_manufacturer || "Unknown"}</p>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-primary" />
                <span className="text-sm">CPU & {stats.totalRAM}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-primary" />
                <span className="text-sm">{stats.disks} disk(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-primary" />
                <span className="text-sm">{stats.networkAdapters} adapter(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <span className="text-sm">{stats.problemDevices} issue(s)</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
