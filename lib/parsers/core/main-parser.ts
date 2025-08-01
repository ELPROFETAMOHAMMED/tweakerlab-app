import type { ParsedPCInfo } from "@/types/pc-info";
import { SystemSummaryParser } from "./system-summary-parser";
import { HardwareParser } from "./hardware-parser";
import { NetworkParser } from "./network-parser";
import { StorageParser } from "./storage-parser";
import { DeviceDetectionService } from "../services/device-detection-service";

export interface ParseContext {
  content: string;
  lines: string[];
  sections: Map<string, string[]>;
  errors: string[];
  warnings: string[];
}

export class MainParser {
  private systemSummaryParser: SystemSummaryParser;
  private hardwareParser: HardwareParser;
  private networkParser: NetworkParser;
  private storageParser: StorageParser;
  private deviceDetectionService: DeviceDetectionService;

  constructor() {
    this.systemSummaryParser = new SystemSummaryParser();
    this.hardwareParser = new HardwareParser();
    this.networkParser = new NetworkParser();
    this.storageParser = new StorageParser();
    this.deviceDetectionService = new DeviceDetectionService();
  }

  /**
   * Parse MSInfo32 content into structured data
   */
  async parseMSInfo(content: string): Promise<ParsedPCInfo> {
    const context: ParseContext = {
      sections: new Map(),
      warnings: []
    };

    try {
      // Starting parse process
      const firstChars = content.substring(0, 100);

      const lines = content
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line.length > 0);

      this.extractSections(lines, context);

      // Create result object
      const result: ParsedPCInfo = {
        system_summary: {},
        hardware: {
          sound_devices: [],
          input_devices: [],
          usb_devices: [],
          system_drivers: [],
          audio_codecs: [],
          video_codecs: []
        },
        network: {
          adapters: []
        },
        storage: {
          disks: []
        },
        device_detection: {
          device_type: "desktop",
          confidence: 0.5,
          detected_features: []
        },
        parser_metadata: {
          file_name: "unknown",
          file_size: content.length,
          parsed_at: new Date().toISOString(),
          sections_found: Array.from(context.sections.keys()),
          sections_parsed: [],
          warnings: context.warnings
        }
      };

      // Parse system summary
      const systemSummarySection = this.findSectionByNames(
        ["System Summary", "Resumen del sistema", "System", "Sistema"],
        context
      );

      if (systemSummarySection && systemSummarySection.length > 0) {
        result.system_summary = this.systemSummaryParser.parse(systemSummarySection);
        result.parser_metadata.sections_parsed.push("System Summary");
      }

      // Parse hardware components
      const hardwareData = this.hardwareParser.parse(context);
      result.hardware = hardwareData.hardware;
      result.parser_metadata.sections_parsed.push(...hardwareData.sections_parsed);

      // Parse network adapters
      const networkSection = this.findSectionByNames(
        ["Network Adapters", "Adaptadores de red", "Network", "Red"],
        context
      );

      if (networkSection && networkSection.length > 0) {
        result.network = this.networkParser.parse(networkSection);
        result.parser_metadata.sections_parsed.push("Network Adapters");
      }

      // Parse storage
      const storageSection = this.findSectionByNames(
        ["Drives", "Unidades", "Storage", "Almacenamiento", "Disk Drives", "Unidades de disco"],
        context
      );

      if (storageSection && storageSection.length > 0) {
        result.storage = this.storageParser.parse(storageSection);
        result.parser_metadata.sections_parsed.push("Storage");
      }

      // Detect device type
      result.device_detection = this.deviceDetectionService.detectDevice(result);

      return result;
    } catch (error) {
      console.error("[MAIN PARSER] Parse error:", error);
      throw error;
    }
  }

  /**
   * Test method to verify parser works with sample file
   */
  static async testWithSampleFile(): Promise<void> {
    try {
      const fs = require('fs');
      const path = require('path');

      // Read the sample file
      const samplePath = path.join(process.cwd(), 'test', 'US_lenguahe.txt');
      const content = fs.readFileSync(samplePath, 'utf-16le');

      console.log("[MAIN PARSER TEST] File loaded, content length:", content.length);

      // Create parser and test
      const parser = new MainParser();
      const result = await parser.parseMSInfo(content);

      console.log("[MAIN PARSER TEST] Parse completed");
      console.log("[MAIN PARSER TEST] Sections found:", result.parser_metadata.sections_found.length);
      console.log("[MAIN PARSER TEST] Sections parsed:", result.parser_metadata.sections_parsed.length);
      console.log("[MAIN PARSER TEST] System summary fields:", Object.keys(result.system_summary).length);

    } catch (error) {
      console.error("[MAIN PARSER TEST] Error:", error);
    }
  }

  /**
   * Create parsing context with initial setup
   */
  private createParseContext(content: string): ParseContext {
    // Handle UTF16LE BOM and other potential encoding issues
    let cleanContent = content;

    // Remove BOM if present
    if (cleanContent.charCodeAt(0) === 0xFEFF) {
      cleanContent = cleanContent.slice(1);
    }

    // Handle null characters that might be present in UTF16LE
    cleanContent = cleanContent.replace(/\0/g, '');

    // Split lines and clean them
    const lines = cleanContent.split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    console.log(`[MAIN PARSER] Processing ${lines.length} lines`);

    return {
      content: cleanContent,
      lines,
      sections: new Map(),
      errors: [],
      warnings: [],
    };
  }

  /**
   * Extract sections from content
   */
  private extractSections(lines: string[], context: ParseContext): void {
    let currentSection = "";
    let currentSectionLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if line is a section header
      if (this.isSectionHeader(line, context, i)) {
        // Save previous section if it exists (including empty sections)
        if (currentSection) {
          context.sections.set(currentSection, [...currentSectionLines]);
          console.log(`[MAIN PARSER] Section "${currentSection}" has ${currentSectionLines.length} lines`);
        }

        // Start new section
        currentSection = this.normalizeSectionName(line);
        currentSectionLines = [];
        console.log(`[MAIN PARSER] New section started: "${currentSection}"`);
      } else if (currentSection) {
        // Add line to current section
        currentSectionLines.push(line);
      }
    }

    // Don't forget the last section (including empty sections)
    if (currentSection) {
      context.sections.set(currentSection, currentSectionLines);
      console.log(`[MAIN PARSER] Final section "${currentSection}" has ${currentSectionLines.length} lines`);
    }

    console.log(`[MAIN PARSER] Extracted ${context.sections.size} sections total`);
  }

  /**
   * Check if a line is a section header
   */
  private isSectionHeader(line: string, context: ParseContext, lineIndex: number): boolean {
    // Remove any leading/trailing whitespace
    const trimmed = line.trim();

    // MSInfo32 sections are specifically in the format [Section Name]
    if (/^\[.+\]$/.test(trimmed)) {
      console.log(`[MAIN PARSER] Detected MSInfo32 section header: "${trimmed}"`);
      return true;
    }

    return false;
  }

  /**
   * Normalize section names for consistent matching
   */
  private normalizeSectionName(line: string): string {
    let sectionName = line.trim();

    // Remove trailing colons
    if (sectionName.endsWith(":")) {
      sectionName = sectionName.slice(0, -1);
    }

    // Remove brackets
    if (sectionName.startsWith("[") && sectionName.endsWith("]")) {
      sectionName = sectionName.slice(1, -1);
    }

    // Remove decorative characters
    sectionName = sectionName.replace(/^[=\-]+\s*/, "").replace(/\s*[=\-]+$/, "");

    // Clean up extra whitespace
    sectionName = sectionName.replace(/\s+/g, " ").trim();

    return sectionName;
  }

  /**
   * Find section with multiple possible names or partial matches
   */
  private findSection(context: ParseContext, possibleNames: string[]): string[] {
    console.log(`[MAIN PARSER] Looking for sections matching: ${possibleNames.join(', ')}`);

    // Try exact matches first
    for (const name of possibleNames) {
      const section = context.sections.get(name);
      if (section && section.length > 0) {
        console.log(`[MAIN PARSER] Found exact match for "${name}"`);
        return section;
      }
    }

    // Try case-insensitive exact matches
    const allSections = Array.from(context.sections.keys());
    for (const name of possibleNames) {
      const exactMatch = allSections.find(section =>
        section.toLowerCase() === name.toLowerCase()
      );
      if (exactMatch) {
        const section = context.sections.get(exactMatch);
        if (section && section.length > 0) {
          console.log(`[MAIN PARSER] Found case-insensitive exact match "${exactMatch}" for "${name}"`);
          return section;
        }
      }
    }

    // Try partial matches - section contains search term
    for (const name of possibleNames) {
      const partialMatch = allSections.find(section =>
        section.toLowerCase().includes(name.toLowerCase())
      );
      if (partialMatch) {
        const section = context.sections.get(partialMatch);
        if (section && section.length > 0) {
          console.log(`[MAIN PARSER] Found partial match (contains) "${partialMatch}" for "${name}"`);
          return section;
        }
      }
    }

    // Try reverse partial matches - search term contains section
    for (const name of possibleNames) {
      const reverseMatch = allSections.find(section =>
        name.toLowerCase().includes(section.toLowerCase()) && section.length > 3
      );
      if (reverseMatch) {
        const section = context.sections.get(reverseMatch);
        if (section && section.length > 0) {
          console.log(`[MAIN PARSER] Found reverse partial match "${reverseMatch}" for "${name}"`);
          return section;
        }
      }
    }

    // Try word-based matching
    for (const name of possibleNames) {
      const nameWords = name.toLowerCase().split(/\s+/);
      const wordMatch = allSections.find(section => {
        const sectionWords = section.toLowerCase().split(/\s+/);
        return nameWords.some(word => sectionWords.some(sectionWord =>
          word === sectionWord || word.includes(sectionWord) || sectionWord.includes(word)
        ));
      });
      if (wordMatch) {
        const section = context.sections.get(wordMatch);
        if (section && section.length > 0) {
          console.log(`[MAIN PARSER] Found word-based match "${wordMatch}" for "${name}"`);
          return section;
        }
      }
    }

    console.log(`[MAIN PARSER] No match found for any of: ${possibleNames.join(", ")}`);
    console.log(`[MAIN PARSER] Available sections:`, allSections.slice(0, 10));
    return [];
  }

  /**
   * Find section by multiple possible names
   */
  private findSectionByNames(possibleNames: string[], context: ParseContext): string[] | undefined {
    for (const name of possibleNames) {
      const section = this.findSection(context, [name]);
      if (section && section.length > 0) {
        return section;
      }
    }
    return undefined;
  }

  /**
   * Get parser version and metadata
   */
  getParserInfo(): { version: string; capabilities: string[] } {
    return {
      version: "5.0-modular",
      capabilities: [
        "System Summary",
        "Hardware Components",
        "Network Adapters",
        "Storage Devices",
        "Device Type Detection",
        "Error Handling",
        "Modular Architecture"
      ]
    };
  }
}

// Export singleton instance
export const mainParser = new MainParser();
