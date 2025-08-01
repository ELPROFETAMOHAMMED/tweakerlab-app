"use client";
import { PCInfo } from "@/types/pc-info";
import BentoCard from "@/components/ui/bento-cards";
import { Separator } from "@/components/ui/separator";
import SectionHeader from "@/components/ui/section-header";
import InfoRow from "@/components/ui/info-row";
import { formatShortDate } from "@/lib/helper/format-date";

import {
  Monitor,
  MemoryStick,
  Settings,
  User,
  Info,
  LucideProps,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { ComponentType } from "react";

interface OverviewProps {
  pcInfo: PCInfo | null;
  contentKey: number;
  deviceTypeIcon: ComponentType<LucideProps>;
}

export default function Overview({
  pcInfo,
  contentKey,
  deviceTypeIcon: DeviceTypeIcon,
}: OverviewProps) {
  // If no PC info is available, show a message to scan PC
  if (!pcInfo) {
    return (
      <TooltipProvider delayDuration={200}>
        <div
          key={contentKey}
          className="animate-fade-in-up opacity-0"
          style={{ animationFillMode: "forwards" }}
        >
          <SectionHeader
            icon={Monitor}
            title="System Overview"
            tooltip="General information about your system"
          />
          <Separator className="my-4" />

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Monitor className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No System Data Available
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mb-4">
              Your system hasn't been scanned yet. Please scan your PC to view detailed system information, hardware specs, and performance insights.
            </p>
            <div className="text-xs text-muted-foreground">
              Go to <span className="font-semibold">Onboarding</span> to scan your system
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Safe property accessors with defaults
  const deviceType = pcInfo?.device_type || "unknown";
  const detectionConfidence = pcInfo?.detection_confidence || 0;
  const detectionReasons = pcInfo?.detection_reasons || [];
  const systemName = pcInfo?.system_name || "Unknown System";
  const installedRam = pcInfo?.installed_ram || "Unknown";
  const osName = pcInfo?.os_name || "Unknown";
  const systemType = pcInfo?.system_type || "Unknown";
  const osVersion = pcInfo?.os_version || "Unknown";
  const systemManufacturer = pcInfo?.system_manufacturer || "Unknown";
  const biosVersion = pcInfo?.bios_version || "Unknown";
  const biosMode = pcInfo?.bios_mode || "Unknown";
  const systemModel = pcInfo?.system_model || "Unknown";
  const processor = pcInfo?.processor || "Unknown";
  const username = pcInfo?.username || "Unknown";
  const timezone = pcInfo?.timezone || "Unknown";
  const updatedAt = pcInfo?.updated_at || new Date().toISOString();
  const totalRam = pcInfo?.total_ram || "Unknown";
  const availableRam = pcInfo?.available_ram || "Unknown";
  const totalVirtual = pcInfo?.total_virtual || "Unknown";

  return (
    <TooltipProvider >
      <div
        key={contentKey}
        className="animate-fade-in-up opacity-0"
        style={{ animationFillMode: "forwards" }}
      >
        <SectionHeader
          icon={Monitor}
          title="System Overview"
          tooltip="General information about your system"
        />
        <Separator className="my-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Device Type */}
          <BentoCard
            className="flex flex-col items-center justify-center p-4"
            delay={0}
          >
            <DeviceTypeIcon className="w-8 h-8 text-muted-foreground mb-1" />
            <h3 className="text-base font-medium text-foreground capitalize mb-0.5">
              {deviceType}
            </h3>
            <p className="text-xs text-muted-foreground mb-1">
              {Math.round(detectionConfidence * 100)}% detection
              confidence
            </p>
            <div className="w-full mt-1">
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                Detection reasons:
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent
                    collisionPadding={8}
                    sideOffset={4}
                    align="center"
                    className="max-w-xs break-words"
                  >
                    These are the technical indicators used by our system to
                    automatically detect whether this is a laptop or desktop
                    computer. Higher confidence means more reliable detection.
                  </TooltipContent>
                </Tooltip>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5">
                {detectionReasons.map((reason, index) => (
                  <li key={index} className="flex items-center gap-1">
                    <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                    {reason}
                  </li>
                ))}
              </ul>
            </div>
          </BentoCard>

          {/* System Name */}
          <BentoCard
            className="flex flex-col items-center justify-center p-4 col-span-1 md:col-span-2"
            delay={150}
          >
            <Settings className="w-8 h-8 text-muted-foreground mb-1" />
            <div className="text-center">
              <h3 className="text-base font-medium text-foreground mb-0.5">
                System Name
              </h3>
              <p className="text-xs text-muted-foreground break-all">
                {systemName}
              </p>
            </div>
          </BentoCard>

          {/* Memory Overview */}
          <BentoCard
            className="flex flex-col items-center justify-center p-4 md:col-span-3"
            delay={300}
          >
            <MemoryStick className="w-8 h-8 text-muted-foreground mb-1" />
            <div className="text-center">
              <h3 className="text-base font-medium text-foreground mb-0.5">
                Memory Overview
              </h3>
              <p className="text-xs text-muted-foreground">
                {installedRam} RAM installed
              </p>
            </div>
          </BentoCard>
        </div>

        {/* Detailed Information */}
        <SectionHeader
          icon={Settings}
          title="System Information"
          tooltip="Detailed technical specifications"
          className="mt-8"
        />
        <Separator className="my-4" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BentoCard className="p-4" delay={450}>
            <h3 className="text-sm font-medium text-foreground mb-3">
              Operating System
            </h3>
            <div className="space-y-2">
              <InfoRow label="OS" value={osName} />
              <InfoRow label="System Architecture" value={systemType} />
              <InfoRow label="Parser Version" value={osVersion} />
              <InfoRow
                label="System Manufacturer"
                value={systemManufacturer}
              />
              <InfoRow label="Motherboard Bios" value={biosVersion} />
              <InfoRow label="Motherboard Bios Mode" value={biosMode} />
              <InfoRow label="Motherboard Model" value={systemModel} />
              <Separator className="my-2" />
              <InfoRow label="Processor" value={processor} />
            </div>
          </BentoCard>

          <BentoCard className="p-4" delay={600}>
            <h3 className="text-sm font-medium text-foreground mb-3">
              User Information
            </h3>
            <div className="space-y-2">
              <InfoRow label="User" value={username} highlight />
              <InfoRow label="Timezone" value={timezone} />
              <InfoRow
                label="Last Updated"
                value={formatShortDate(updatedAt)}
                highlight
              />
            </div>

            <Separator className="my-3" />
            <h4 className="text-xs font-medium text-muted-foreground mb-2">
              Memory Details
            </h4>
            <div className="space-y-1">
              <InfoRow label="Total" value={totalRam} />
              <InfoRow label="Available" value={availableRam} />
              <InfoRow label="Virtual" value={totalVirtual} />
            </div>
          </BentoCard>
        </div>
      </div>
    </TooltipProvider>
  );
}
