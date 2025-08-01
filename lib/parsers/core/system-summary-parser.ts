import type { ParseContext } from "./main-parser";

export interface SystemSummary {
  os_name?: string;
  os_version?: string;
  os_manufacturer?: string;
  system_name?: string;
  system_manufacturer?: string;
  system_model?: string;
  system_type?: string;
  processor?: string;
  bios_version?: string;
  bios_mode?: string;
  baseboard_manufacturer?: string;
  baseboard_product?: string;
  platform_role?: string;
  secure_boot_state?: string;
  boot_device?: string;
  username?: string;
  timezone?: string;
  installed_ram?: string;
  total_ram?: string;
  available_ram?: string;
  total_virtual?: string;
  available_virtual?: string;
  kernel_dma_protection?: string;
  virtualization_security?: string;
  hyperv_vm_mode?: boolean;
  hyperv_slats?: boolean;
  hyperv_enabled?: boolean;
  hyperv_dep?: boolean;
}

export class SystemSummaryParser {
  private fieldMappings: Record<string, keyof SystemSummary> = {
    "OS Name": "os_name",
    "OS Version": "os_version",
    "OS Manufacturer": "os_manufacturer",
    "System Name": "system_name",
    "System Manufacturer": "system_manufacturer",
    "System Model": "system_model",
    "System Type": "system_type",
    "Processor": "processor",
    "BIOS Version/Date": "bios_version",
    "BIOS Mode": "bios_mode",
    "BaseBoard Manufacturer": "baseboard_manufacturer",
    "BaseBoard Product": "baseboard_product",
    "Platform Role": "platform_role",
    "Secure Boot State": "secure_boot_state",
    "Boot Device": "boot_device",
    "User Name": "username",
    "Time Zone": "timezone",
    "Installed Physical Memory (RAM)": "installed_ram",
    "Total Physical Memory": "total_ram",
    "Available Physical Memory": "available_ram",
    "Total Virtual Memory": "total_virtual",
    "Available Virtual Memory": "available_virtual",
    "Kernel DMA Protection": "kernel_dma_protection",
    "Virtualization-based security": "virtualization_security",
    "Virtualization-based Security": "virtualization_security",
    "Hyper-V - VM Monitor Mode Extensions": "hyperv_enabled",
    "Hyper-V - Second Level Address Translation Extensions": "hyperv_slats",
    "Hyper-V - Virtualization Enabled in Firmware": "hyperv_enabled",
    "Hyper-V - Data Execution Prevention": "hyperv_dep",
    "Second Level Address Translation": "hyperv_slats",
    "DEP": "hyperv_dep",
  };

  private booleanFields = new Set([
    "hyperv_vm_mode",
    "hyperv_slats",
    "hyperv_enabled",
    "hyperv_dep"
  ]);

  /**
   * Parse system summary section
   */
  parse(sectionLines: string[], context: ParseContext): SystemSummary {
    const result: SystemSummary = {};

    try {
      for (const line of sectionLines) {
        this.parseLine(line, result, context);
      }

      // Post-process and validate
      this.postProcess(result, context);

      console.log(`[SYSTEM PARSER] Parsed ${Object.keys(result).length} system fields`);

    } catch (error) {
      context.errors.push(
        `System Summary Parser: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }

    return result;
  }

  /**
   * Parse individual line
   */
  private parseLine(line: string, result: SystemSummary, context: ParseContext): void {
    // Split by multiple spaces or tabs
    const parts = line.split(/\s{2,}|\t+/).map(s => s.trim());

    if (parts.length < 2) return;

    const [key, ...valueParts] = parts;
    const value = valueParts.join(" ").trim();

    if (!value || value === "Not Available" || value === "N/A") return;

    // Try to find mapping for this key
    const mappedKey = this.findMappedKey(key);
    if (mappedKey) {
      this.assignValue(result, mappedKey, value, context);
    } else {
      // Try alternative parsing patterns
      this.tryAlternativePatterns(line, result, context);
    }
  }

  /**
   * Find mapped key with fuzzy matching
   */
  private findMappedKey(key: string): keyof SystemSummary | null {
    // Exact match first
    if (this.fieldMappings[key]) {
      return this.fieldMappings[key];
    }

    // Fuzzy matching for common variations
    const lowerKey = key.toLowerCase();

    for (const [mappingKey, mappedValue] of Object.entries(this.fieldMappings)) {
      if (mappingKey.toLowerCase() === lowerKey) {
        return mappedValue;
      }
    }

    // Check for partial matches on important fields
    if (lowerKey.includes("processor") || lowerKey.includes("cpu")) {
      return "processor";
    }
    if (lowerKey.includes("system name") || lowerKey.includes("computer name")) {
      return "system_name";
    }
    if (lowerKey.includes("system model") || lowerKey.includes("model")) {
      return "system_model";
    }
    if (lowerKey.includes("manufacturer")) {
      return "system_manufacturer";
    }

    return null;
  }

  /**
   * Assign value with appropriate type conversion
   */
  private assignValue(
    result: SystemSummary,
    key: keyof SystemSummary,
    value: string,
    context: ParseContext
  ): void {
    try {
      if (this.booleanFields.has(key as string)) {
        result[key] = this.toBoolean(value) as any;
      } else {
        result[key] = value as any;
      }
    } catch (error) {
      context.warnings.push(`Failed to assign value for ${key}: ${value}`);
    }
  }

  /**
   * Convert string to boolean
   */
  private toBoolean(value: string): boolean {
    const lowerValue = value.toLowerCase();
    return ["yes", "true", "on", "enabled", "available", "supported"].includes(lowerValue);
  }

  /**
   * Try alternative parsing patterns
   */
  private tryAlternativePatterns(line: string, result: SystemSummary, context: ParseContext): void {
    // Handle colon-separated format: "Key: Value"
    if (line.includes(":")) {
      const colonIndex = line.indexOf(":");
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      if (value && value !== "Not Available" && value !== "N/A") {
        const mappedKey = this.findMappedKey(key);
        if (mappedKey) {
          this.assignValue(result, mappedKey, value, context);
        }
      }
    }

    // Handle equals format: "Key = Value"
    if (line.includes("=")) {
      const equalsIndex = line.indexOf("=");
      const key = line.substring(0, equalsIndex).trim();
      const value = line.substring(equalsIndex + 1).trim();

      if (value && value !== "Not Available" && value !== "N/A") {
        const mappedKey = this.findMappedKey(key);
        if (mappedKey) {
          this.assignValue(result, mappedKey, value, context);
        }
      }
    }
  }

  /**
   * Post-process and validate parsed data
   */
  private postProcess(result: SystemSummary, context: ParseContext): void {
    // Clean up memory values
    if (result.total_ram) {
      result.total_ram = this.cleanMemoryValue(result.total_ram);
    }
    if (result.installed_ram) {
      result.installed_ram = this.cleanMemoryValue(result.installed_ram);
    }
    if (result.available_ram) {
      result.available_ram = this.cleanMemoryValue(result.available_ram);
    }

    // Validate required fields
    const requiredFields = ["os_name", "system_name", "processor"];
    const missingFields = requiredFields.filter(field => !result[field as keyof SystemSummary]);

    if (missingFields.length > 0) {
      context.warnings.push(`Missing critical system fields: ${missingFields.join(", ")}`);
    }

    // Detect system type if not explicitly provided
    if (!result.system_type && result.processor) {
      result.system_type = this.detectSystemType(result);
    }
  }

  /**
   * Clean up memory value formatting
   */
  private cleanMemoryValue(value: string): string {
    // Remove extra whitespace and normalize formatting
    return value
      .replace(/\s+/g, " ")
      .replace(/,(\d{3})/g, ",$1") // Ensure proper comma formatting
      .trim();
  }

  /**
   * Detect system type from available information
   */
  private detectSystemType(result: SystemSummary): string {
    const processor = result.processor?.toLowerCase() || "";
    const model = result.system_model?.toLowerCase() || "";

    if (processor.includes("x64") || processor.includes("amd64")) {
      return "x64-based PC";
    }
    if (processor.includes("x86") || processor.includes("i386")) {
      return "x86-based PC";
    }
    if (processor.includes("arm") || model.includes("surface")) {
      return "ARM-based PC";
    }

    return "Unknown";
  }

  /**
   * Get parser statistics
   */
  getStats(): { supportedFields: number; booleanFields: number } {
    return {
      supportedFields: Object.keys(this.fieldMappings).length,
      booleanFields: this.booleanFields.size
    };
  }
}
