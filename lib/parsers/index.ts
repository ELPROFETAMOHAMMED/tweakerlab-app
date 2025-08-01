// Core parsers
export { MainParser, mainParser } from "./core/main-parser";
export { SystemSummaryParser } from "./core/system-summary-parser";
export { HardwareParser } from "./core/hardware-parser";
export { NetworkParser } from "./core/network-parser";
export { StorageParser } from "./core/storage-parser";

// Services
export { ParsingService, parsingService } from "./services/parsing-service";
export { DeviceDetectionService } from "./services/device-detection-service";

// Types
export type { ParseContext } from "./core/main-parser";
export type { SystemSummary } from "./core/system-summary-parser";
export type { HardwareData } from "./core/hardware-parser";
export type { NetworkAdapter } from "./core/network-parser";
export type { DiskInfo } from "./core/storage-parser";
export type { DeviceDetection } from "./services/device-detection-service";
export type { ParseResult } from "./services/parsing-service";

// Main parsing function
export async function parseMSInfoFile(content: string, fileName: string = "msinfo32.txt") {
  const { parsingService } = await import("./services/parsing-service");
  return await parsingService.parseFile(content, fileName);
}

// Parser info
export function getParserInfo() {
  const { mainParser } = require("./core/main-parser");
  return mainParser.getParserInfo();
}
