import type { ParseContext } from "./main-parser";

export interface HardwareData {
  dma_entries: Array<{ channel: string; device_name: string }>;
  irq_entries: Array<{ irq_number?: string; device_name: string; device_type?: string }>;
  display_info: Array<{
    name?: string;
    adapter_type?: string;
    adapter_description?: string;
    adapter_ram?: string;
    driver_version?: string;
    resolution?: string;
  }>;
  problem_devices: Array<{ device_name: string; problem_code?: string; description?: string }>;
  sound_devices: Array<{ name?: string; driver?: string; manufacturer?: string }>;
  input_devices: Array<{ name?: string; device_type?: string; driver?: string }>;
  usb_devices: Array<{ name?: string; device_id?: string; driver?: string }>;
  system_drivers: Array<{ name?: string; version?: string; file?: string; type?: string }>;
  startup_programs: Array<{ name?: string; command?: string; location?: string }>;
  audio_codecs: Array<{ name?: string; version?: string; manufacturer?: string }>;
  video_codecs: Array<{ name?: string; version?: string; manufacturer?: string }>;
  sections_parsed: string[];
}

export class HardwareParser {
  /**
   * Parse hardware-related sections
   */
  parse(context: ParseContext): HardwareData {
    const result: HardwareData = {
      dma_entries: [],
      irq_entries: [],
      display_info: [],
      problem_devices: [],
      sound_devices: [],
      input_devices: [],
      usb_devices: [],
      system_drivers: [],
      startup_programs: [],
      audio_codecs: [],
      video_codecs: [],
      sections_parsed: [],
    };

    try {
      // Parse DMA entries - try multiple possible names
      const dmaSectionNames = ["DMA", "Hardware Resources\\DMA", "Hardware Resources/DMA"];
      const dmaSection = this.findSection(context, dmaSectionNames);
      if (dmaSection.length > 0) {
        result.dma_entries = this.parseDMA(dmaSection);
        result.sections_parsed.push("DMA");
      }

      // Parse IRQ entries
      const irqSectionNames = ["IRQs", "Hardware Resources\\IRQs", "Hardware Resources/IRQs", "IRQ"];
      const irqSection = this.findSection(context, irqSectionNames);
      if (irqSection.length > 0) {
        result.irq_entries = this.parseIRQs(irqSection);
        result.sections_parsed.push("IRQs");
      }

      // Parse Display info
      const displaySectionNames = ["Display", "Components\\Display", "Components/Display"];
      const displaySection = this.findSection(context, displaySectionNames);
      if (displaySection.length > 0) {
        result.display_info = this.parseDisplay(displaySection);
        result.sections_parsed.push("Display");
      }

      // Parse Problem Devices
      const problemSectionNames = ["Problem Devices", "Components\\Problem Devices", "Components/Problem Devices"];
      const problemSection = this.findSection(context, problemSectionNames);
      if (problemSection.length > 0) {
        result.problem_devices = this.parseProblemDevices(problemSection);
        result.sections_parsed.push("Problem Devices");
      }

      // Parse Sound Devices
      const soundSectionNames = ["Sound Device", "Audio", "Multimedia\\Audio"];
      const soundSection = this.findSection(context, soundSectionNames);
      if (soundSection.length > 0) {
        result.sound_devices = this.parseSoundDevices(soundSection);
        result.sections_parsed.push("Sound Devices");
      }

      // Parse Input Devices (Keyboard, Pointing Device)
      const keyboardSection = this.findSection(context, ["Keyboard"]);
      const pointingSection = this.findSection(context, ["Pointing Device"]);
      const inputDevices = [];
      if (keyboardSection.length > 0) {
        inputDevices.push(...this.parseInputDevices(keyboardSection, "keyboard"));
      }
      if (pointingSection.length > 0) {
        inputDevices.push(...this.parseInputDevices(pointingSection, "pointing"));
      }
      result.input_devices = inputDevices;
      if (inputDevices.length > 0) {
        result.sections_parsed.push("Input Devices");
      }

      // Parse USB Devices
      const usbSection = this.findSection(context, ["USB"]);
      if (usbSection.length > 0) {
        result.usb_devices = this.parseUSBDevices(usbSection);
        result.sections_parsed.push("USB Devices");
      }

      // Parse System Drivers
      const driversSection = this.findSection(context, ["System Drivers"]);
      if (driversSection.length > 0) {
        result.system_drivers = this.parseSystemDrivers(driversSection);
        result.sections_parsed.push("System Drivers");
      }

      // Parse Startup Programs
      const startupSection = this.findSection(context, ["Startup Programs"]);
      if (startupSection.length > 0) {
        result.startup_programs = this.parseStartupPrograms(startupSection);
        result.sections_parsed.push("Startup Programs");
      }

      // Parse Audio Codecs
      const audioCodecsSection = this.findSection(context, ["Audio Codecs"]);
      if (audioCodecsSection.length > 0) {
        result.audio_codecs = this.parseAudioCodecs(audioCodecsSection);
        result.sections_parsed.push("Audio Codecs");
      }

      // Parse Video Codecs
      const videoCodecsSection = this.findSection(context, ["Video Codecs"]);
      if (videoCodecsSection.length > 0) {
        result.video_codecs = this.parseVideoCodecs(videoCodecsSection);
        result.sections_parsed.push("Video Codecs");
      }

      console.log(`[HARDWARE PARSER] Parsed ${result.sections_parsed.length} hardware sections`);

    } catch (error) {
      context.errors.push(`Hardware Parser: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return result;
  }

  /**
   * Find section with multiple possible names
   */
  private findSection(context: ParseContext, possibleNames: string[]): string[] {
    // Try exact matches first
    for (const name of possibleNames) {
      const section = context.sections.get(name);
      if (section && section.length > 0) {
        console.log(`[HARDWARE PARSER] Found exact match for "${name}"`);
        return section;
      }
    }

    // Try partial matches
    const allSections = Array.from(context.sections.keys());
    for (const name of possibleNames) {
      const partial = allSections.find(section =>
        section.toLowerCase().includes(name.toLowerCase()) ||
        name.toLowerCase().includes(section.toLowerCase())
      );
      if (partial) {
        const section = context.sections.get(partial);
        if (section && section.length > 0) {
          console.log(`[HARDWARE PARSER] Found partial match "${partial}" for "${name}"`);
          return section;
        }
      }
    }

    console.log(`[HARDWARE PARSER] No match found for any of: ${possibleNames.join(", ")}`);
    return [];
  }

  /**
   * Parse DMA entries
   */
  private parseDMA(lines: string[]): Array<{ channel: string; device_name: string }> {
    const entries = [];

    for (const line of lines) {
      if (line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        entries.push({
          channel: parts[0],
          device_name: parts.slice(1).join(" "),
        });
      }
    }

    return entries;
  }

  /**
   * Parse IRQ entries
   */
  private parseIRQs(lines: string[]): Array<{ irq_number?: string; device_name: string; device_type?: string }> {
    const entries = [];

    for (const line of lines) {
      if (line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const deviceName = parts[1];
        const deviceType = this.detectDeviceType(deviceName);

        entries.push({
          irq_number: parts[0],
          device_name: deviceName,
          device_type: deviceType,
        });
      }
    }

    return entries;
  }

  /**
   * Parse Display information
   */
  private parseDisplay(lines: string[]): Array<{
    name?: string;
    adapter_type?: string;
    adapter_description?: string;
    adapter_ram?: string;
    driver_version?: string;
    resolution?: string;
  }> {
    const displays = [];
    let currentDisplay: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) {
        if (Object.keys(currentDisplay).length > 0) {
          displays.push(currentDisplay);
          currentDisplay = {};
        }
        continue;
      }

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Name":
            if (Object.keys(currentDisplay).length > 0) displays.push(currentDisplay);
            currentDisplay = { name: value };
            break;
          case "Adapter Type":
            currentDisplay.adapter_type = value;
            break;
          case "Adapter Description":
            currentDisplay.adapter_description = value;
            break;
          case "Adapter RAM":
            currentDisplay.adapter_ram = value;
            break;
          case "Driver Version":
            currentDisplay.driver_version = value;
            break;
          case "Resolution":
            currentDisplay.resolution = value;
            break;
        }
      }
    }

    if (Object.keys(currentDisplay).length > 0) {
      displays.push(currentDisplay);
    }

    return displays;
  }

  /**
   * Parse Problem Devices
   */
  private parseProblemDevices(lines: string[]): Array<{ device_name: string; problem_code?: string; description?: string }> {
    const devices = [];
    let currentDevice: any = null;

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        if (key === "Device Name" || (!currentDevice && value)) {
          if (currentDevice) devices.push(currentDevice);
          currentDevice = { device_name: key === "Device Name" ? value : line.trim() };
        } else if (currentDevice) {
          if (key === "Problem Code") currentDevice.problem_code = value;
          if (key === "Description") currentDevice.description = value;
        }
      }
    }

    if (currentDevice) devices.push(currentDevice);
    return devices;
  }

  /**
   * Parse Sound Devices
   */
  private parseSoundDevices(lines: string[]): Array<{ name?: string; driver?: string; manufacturer?: string }> {
    const devices = [];
    let currentDevice: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Name":
            if (Object.keys(currentDevice).length > 0) devices.push(currentDevice);
            currentDevice = { name: value };
            break;
          case "Driver":
            currentDevice.driver = value;
            break;
          case "Manufacturer":
            currentDevice.manufacturer = value;
            break;
        }
      }
    }

    if (Object.keys(currentDevice).length > 0) devices.push(currentDevice);
    return devices;
  }

  /**
   * Parse Input Devices
   */
  private parseInputDevices(lines: string[], deviceType: string): Array<{ name?: string; device_type?: string; driver?: string }> {
    const devices = [];
    let currentDevice: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Name":
            if (Object.keys(currentDevice).length > 0) devices.push(currentDevice);
            currentDevice = { name: value, device_type: deviceType };
            break;
          case "Driver":
            currentDevice.driver = value;
            break;
          case "Description":
            currentDevice.description = value;
            break;
        }
      }
    }

    if (Object.keys(currentDevice).length > 0) devices.push(currentDevice);
    return devices;
  }

  /**
   * Parse USB Devices
   */
  private parseUSBDevices(lines: string[]): Array<{ name?: string; device_id?: string; driver?: string }> {
    const devices = [];
    let currentDevice: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Name":
            if (Object.keys(currentDevice).length > 0) devices.push(currentDevice);
            currentDevice = { name: value };
            break;
          case "Device ID":
            currentDevice.device_id = value;
            break;
          case "Driver":
            currentDevice.driver = value;
            break;
        }
      }
    }

    if (Object.keys(currentDevice).length > 0) devices.push(currentDevice);
    return devices;
  }

  /**
   * Parse System Drivers
   */
  private parseSystemDrivers(lines: string[]): Array<{ name?: string; version?: string; file?: string; type?: string }> {
    const drivers = [];
    let currentDriver: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Name":
            if (Object.keys(currentDriver).length > 0) drivers.push(currentDriver);
            currentDriver = { name: value };
            break;
          case "Version":
            currentDriver.version = value;
            break;
          case "File":
            currentDriver.file = value;
            break;
          case "Type":
            currentDriver.type = value;
            break;
        }
      }
    }

    if (Object.keys(currentDriver).length > 0) drivers.push(currentDriver);
    return drivers;
  }

  /**
   * Parse Startup Programs
   */
  private parseStartupPrograms(lines: string[]): Array<{ name?: string; command?: string; location?: string }> {
    const programs = [];
    let currentProgram: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Startup Item":
          case "Name":
            if (Object.keys(currentProgram).length > 0) programs.push(currentProgram);
            currentProgram = { name: value };
            break;
          case "Command":
            currentProgram.command = value;
            break;
          case "Location":
            currentProgram.location = value;
            break;
        }
      }
    }

    if (Object.keys(currentProgram).length > 0) programs.push(currentProgram);
    return programs;
  }

  /**
   * Parse Audio Codecs
   */
  private parseAudioCodecs(lines: string[]): Array<{ name?: string; version?: string; manufacturer?: string }> {
    const codecs = [];
    let currentCodec: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Name":
            if (Object.keys(currentCodec).length > 0) codecs.push(currentCodec);
            currentCodec = { name: value };
            break;
          case "Version":
            currentCodec.version = value;
            break;
          case "Manufacturer":
            currentCodec.manufacturer = value;
            break;
        }
      }
    }

    if (Object.keys(currentCodec).length > 0) codecs.push(currentCodec);
    return codecs;
  }

  /**
   * Parse Video Codecs
   */
  private parseVideoCodecs(lines: string[]): Array<{ name?: string; version?: string; manufacturer?: string }> {
    const codecs = [];
    let currentCodec: any = {};

    for (const line of lines) {
      if (!line.trim() || line.toLowerCase().includes("no items found")) continue;

      const parts = line.split(/\s{2,}/).map(s => s.trim());
      if (parts.length >= 2) {
        const [key, value] = [parts[0], parts.slice(1).join(" ")];

        switch (key) {
          case "Name":
            if (Object.keys(currentCodec).length > 0) codecs.push(currentCodec);
            currentCodec = { name: value };
            break;
          case "Version":
            currentCodec.version = value;
            break;
          case "Manufacturer":
            currentCodec.manufacturer = value;
            break;
        }
      }
    }

    if (Object.keys(currentCodec).length > 0) codecs.push(currentCodec);
    return codecs;
  }

  /**
   * Detect device type from device name
   */
  private detectDeviceType(deviceName: string): string | undefined {
    const lower = deviceName.toLowerCase();

    if (lower.includes("usb") || lower.includes("universal serial bus")) return "usb";
    if (lower.includes("audio") || lower.includes("sound") || lower.includes("realtek")) return "audio";
    if (lower.includes("nvidia") || lower.includes("geforce") || lower.includes("radeon") || lower.includes("graphics")) return "gpu";
    if (lower.includes("ethernet") || lower.includes("network") || lower.includes("wi-fi") || lower.includes("wireless")) return "network";
    if (lower.includes("motherboard") || lower.includes("chipset")) return "motherboard";
    if (lower.includes("storage") || lower.includes("sata") || lower.includes("nvme")) return "storage";

    return undefined;
  }
}
