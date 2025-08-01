import { mainParser } from "../core/main-parser";
import type { ParsedPCInfo } from "@/types/pc-info";

export interface ParseResult {
  success: boolean;
  data?: ParsedPCInfo;
  error?: string;
  warnings?: string[];
}

export class ParsingService {
  /**
   * Parse MSInfo file content
   */
  async parseFile(content: string, fileName: string): Promise<ParseResult> {
    try {
      console.log(`[PARSING SERVICE] Starting parse for file: ${fileName}`);

      // Basic validation
      if (!content || content.trim().length === 0) {
        return {
          success: false,
          error: "File content is empty"
        };
      }

      // Check for basic MSInfo32 indicators
      if (!this.isValidMSInfoContent(content)) {
        return {
          success: false,
          error: "File does not appear to be a valid MSInfo32 export"
        };
      }

      // Parse with main parser
      const parsedData = await mainParser.parseMSInfo(content);

      // Basic validation of parsed data
      const validationResult = this.validateParsedData(parsedData);
      if (!validationResult.isValid) {
        return {
          success: false,
          error: validationResult.error,
          warnings: validationResult.warnings
        };
      }

      console.log(`[PARSING SERVICE] Parse completed successfully`);
      console.log(`[PARSING SERVICE] Sections parsed: ${parsedData.parser_metadata.sections_parsed.length}`);

      return {
        success: true,
        data: parsedData,
        warnings: parsedData.parser_metadata.parsing_errors.length > 0
          ? parsedData.parser_metadata.parsing_errors
          : undefined
      };

    } catch (error) {
      console.error(`[PARSING SERVICE] Parse error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown parsing error"
      };
    }
  }

  /**
   * Validate MSInfo content
   */
  private isValidMSInfoContent(content: string): boolean {
    const requiredIndicators = [
      "System Information",
      "System Summary",
      "OS Name",
      "System Name"
    ];

    const lowerContent = content.toLowerCase();
    return requiredIndicators.some(indicator =>
      lowerContent.includes(indicator.toLowerCase())
    );
  }

  /**
   * Validate parsed data
   */
  private validateParsedData(parsedData: ParsedPCInfo): {
    isValid: boolean;
    error?: string;
    warnings?: string[];
  } {
    const warnings: string[] = [];

    // Check for critical system information
    if (!parsedData.system_summary.os_name) {
      warnings.push("OS Name not detected");
    }

    if (!parsedData.system_summary.system_name) {
      warnings.push("System Name not detected");
    }

    if (!parsedData.system_summary.processor) {
      warnings.push("Processor information not detected");
    }

    // Check if any sections were parsed
    if (parsedData.parser_metadata.sections_parsed.length === 0) {
      return {
        isValid: false,
        error: "No sections were successfully parsed"
      };
    }

    // Check for excessive errors
    if (parsedData.parser_metadata.parsing_errors.length > 10) {
      return {
        isValid: false,
        error: "Too many parsing errors, file may be corrupted"
      };
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Get parser info and capabilities
   */
  getParserInfo() {
    return mainParser.getParserInfo();
  }
}

// Export singleton instance
export const parsingService = new ParsingService();
