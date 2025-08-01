"use client";
import { PCInfo } from "@/types/pc-info";
import {
  Cpu,
  Shield,
  Network,
  Monitor,
  HardDrive,
  AlertTriangle,
  Play,
  Bug,
  Laptop,
  Computer,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import Overview from "./overview";

interface InformationDialogProps {
  pcInfo: PCInfo | null;
}

type TabType =
  | "overview"
  | "hardware"
  | "network"
  | "storage"
  | "security"
  | "issues"
  | "startup"
  | "reports";

export default function InformationDialog({
  pcInfo,
}: InformationDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [contentKey, setContentKey] = useState(0);
  const tabs = [
    { id: "overview", label: "Overview", icon: Monitor },
    { id: "hardware", label: "Hardware", icon: Cpu },
    { id: "network", label: "Network", icon: Network },
    { id: "storage", label: "Storage", icon: HardDrive },
    { id: "security", label: "Security", icon: Shield },
    { id: "issues", label: "Issues", icon: AlertTriangle },
    { id: "startup", label: "Startup", icon: Play },
    { id: "reports", label: "Reports", icon: Bug },
  ];

  const handleTabChange = (newTab: TabType) => {
    if (newTab === activeTab) return;

    setIsLoading(true);

    setTimeout(() => {
      setActiveTab(newTab);
      setContentKey((prev) => prev + 1);
      setIsLoading(false);
    }, 300);
  };

  const DeviceTypeIcon = pcInfo?.device_type === "laptop" ? Laptop : Computer;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-24">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "overview":
        return (
          <Overview
            pcInfo={pcInfo}
            contentKey={contentKey}
            deviceTypeIcon={DeviceTypeIcon}
          />
        );
      //   case "hardware":
      //     return renderHardware();
      //   case "network":
      //     return renderNetwork();
      //   case "storage":
      //     return renderStorage();
      //   case "security":
      //     return renderSecurity();
      //   case "issues":
      //     return renderIssues();
      //   case "startup":
      //     return renderStartup();
      //   case "reports":
      //     return renderReports();
      default:
        return (
          <Overview
            pcInfo={pcInfo}
            contentKey={contentKey}
            deviceTypeIcon={DeviceTypeIcon}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id as TabType)}
                disabled={isLoading}
                className={`
                  flex items-center gap-2 px-3 py-2 text-sm transition-all duration-300 ease-out
                  relative overflow-hidden group whitespace-nowrap
                  ${isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                  }
                  ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"
                    }`}
                />
                {tab.label}

                {/* Active indicator */}
                <div
                  className={`
                    absolute bottom-0 left-0 h-0.5 bg-foreground transition-all duration-300 ease-out
                    ${isActive ? "w-full" : "w-0 group-hover:w-full"}
                  `}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4">
        <div className="transition-opacity duration-300">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
