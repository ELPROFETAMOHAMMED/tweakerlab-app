import type { ParsedPCInfo } from "@/types/pc-info";

export interface DeviceDetection {
  device_type: "laptop" | "desktop";
  confidence: number;
  reasons: string[];
}

export class DeviceDetectionService {
  private laptopKeywords = [
    "laptop", "notebook", "thinkpad", "elitebook", "probook",
    "latitude", "zenbook", "vivobook", "macbook", "surface",
    "ideapad", "pavilion", "inspiron", "aspire", "travelmate"
  ];

  private desktopKeywords = [
    "desktop", "tower", "optiplex", "elitedesk", "prodesk",
    "thinkcentre", "ideacentre", "imac", "mac pro", "workstation"
  ];

  /**
   * Detect device type from parsed PC info
   */
  detectDeviceType(parsedInfo: ParsedPCInfo): DeviceDetection {
    const model = parsedInfo.system_summary.system_model?.toLowerCase() || "";
    const name = parsedInfo.system_summary.system_name?.toLowerCase() || "";
    const manufacturer = parsedInfo.system_summary.system_manufacturer?.toLowerCase() || "";

    let laptopScore = 0;
    let desktopScore = 0;
    const reasons: string[] = [];

    // Check model for laptop/desktop indicators
    for (const keyword of this.laptopKeywords) {
      if (model.includes(keyword) || name.includes(keyword)) {
        laptopScore += 60;
        reasons.push(`Model/Name suggests laptop: ${keyword}`);
        break;
      }
    }

    for (const keyword of this.desktopKeywords) {
      if (model.includes(keyword) || name.includes(keyword)) {
        desktopScore += 60;
        reasons.push(`Model/Name suggests desktop: ${keyword}`);
        break;
      }
    }

    // Check for battery-related indicators (laptops typically have them)
    if (parsedInfo.dma_entries.some(entry =>
      entry.device_name.toLowerCase().includes("battery") ||
      entry.device_name.toLowerCase().includes("power")
    )) {
      laptopScore += 30;
      reasons.push("Battery-related devices detected");
    }

    // Check for typical desktop indicators
    if (parsedInfo.irq_entries.some(entry =>
      entry.device_name.toLowerCase().includes("pci") ||
      entry.device_name.toLowerCase().includes("expansion")
    )) {
      desktopScore += 20;
      reasons.push("PCI/Expansion hardware detected");
    }

    // Determine result
    const confidence = Math.abs(laptopScore - desktopScore) / 100;
    const device_type = laptopScore > desktopScore ? "laptop" : "desktop";

    if (reasons.length === 0) {
      reasons.push("No specific indicators found, defaulting to desktop");
    }

    return {
      device_type,
      confidence: Math.min(confidence, 1),
      reasons
    };
  }
}
