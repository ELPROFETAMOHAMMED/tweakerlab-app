import type { ParseContext } from "./main-parser";

export { Disk as DiskInfo };

export interface Disk {
  description?: string;
  manufacturer?: string;
  model?: string;
  bytes_per_sector?: number;
  media_type?: string;
  partitions?: number;
  sectors_per_track?: number;
  size_bytes?: number;
  total_cylinders?: number;
  total_sectors?: number;
  total_tracks?: number;
  tracks_per_cylinder?: number;
  drive_letter?: string;
  file_system?: string;
  free_space?: string;
  volume_name?: string;
  volume_serial?: string;
}

export class StorageParser {
  /**
   * Parse storage sections (Drives and Disks)
   */
  parse(sectionLines: string[], context: ParseContext): Disk[] {
    const disks: Disk[] = [];
    let currentDisk: any = null;
    let isProcessingDrives = false;
    let isProcessingDisks = false;

    console.log(`[STORAGE PARSER] Processing ${sectionLines.length} lines`);

    try {
      for (const line of sectionLines) {
        const trimmedLine = line.trim();

        // Skip empty lines and header lines
        if (!trimmedLine ||
            trimmedLine === "Item\tValue" ||
            trimmedLine === "Item Value" ||
            trimmedLine.toLowerCase().includes("no items found")) {
          continue;
        }

        // Check for section separators
        if (trimmedLine.includes('Drive\t') || trimmedLine.includes('Description\tDisk drive')) {
          // Save previous disk if exists
          if (currentDisk && (currentDisk.description || currentDisk.drive_letter)) {
            disks.push(currentDisk);
          }
          currentDisk = {};
        }

        // Parse table data - MSInfo32 uses tab separation
        const parts = trimmedLine.split('\t').map(s => s.trim());

        if (parts.length >= 2) {
          const [key, value] = [parts[0], parts.slice(1).join('\t')];

          if (currentDisk) {
            this.assignDiskField(currentDisk, key, value);
          } else {
            // Start new disk entry
            currentDisk = {};
            this.assignDiskField(currentDisk, key, value);
          }
        }
      }

      // Don't forget the last disk
      if (currentDisk && (currentDisk.description || currentDisk.drive_letter)) {
        disks.push(currentDisk);
      }

      console.log(`[STORAGE PARSER] Successfully parsed ${disks.length} storage devices`);

      // Log first few disks for debugging
      disks.slice(0, 3).forEach((disk, index) => {
        console.log(`[STORAGE PARSER] Disk ${index + 1}: ${disk.description || disk.drive_letter || 'Unknown'}`);
      });

    } catch (error) {
      console.error("[STORAGE PARSER] Error:", error);
      context.errors.push(`Storage Parser: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return disks;
  }

  /**
   * Assign field to disk
   */
  private assignDiskField(disk: any, key: string, value: string): void {
    if (!value || value === "Not Available") {
      return;
    }

    switch (key) {
      case "Drive":
        disk.drive_letter = value;
        break;
      case "Description":
        disk.description = value;
        break;
      case "Manufacturer":
        disk.manufacturer = value;
        break;
      case "Model":
        disk.model = value;
        break;
      case "Bytes/Sector":
        disk.bytes_per_sector = parseInt(value) || null;
        break;
      case "Media Type":
        disk.media_type = value;
        break;
      case "Partitions":
        disk.partitions = parseInt(value) || null;
        break;
      case "Sectors/Track":
        disk.sectors_per_track = parseInt(value) || null;
        break;
      case "Size":
        // Extract size in bytes from text like "111.79 GB (120,031,511,040 bytes)"
        const sizeMatch = value.match(/\(([0-9,]+)\s*bytes\)/);
        if (sizeMatch) {
          disk.size_bytes = parseInt(sizeMatch[1].replace(/,/g, '')) || null;
        }
        break;
      case "Total Cylinders":
        disk.total_cylinders = parseInt(value.replace(/,/g, '')) || null;
        break;
      case "Total Sectors":
        disk.total_sectors = parseInt(value.replace(/,/g, '')) || null;
        break;
      case "Total Tracks":
        disk.total_tracks = parseInt(value.replace(/,/g, '')) || null;
        break;
      case "Tracks/Cylinder":
        disk.tracks_per_cylinder = parseInt(value) || null;
        break;
      case "File System":
        disk.file_system = value;
        break;
      case "Free Space":
        disk.free_space = value;
        break;
      case "Volume Name":
        disk.volume_name = value;
        break;
      case "Volume Serial Number":
        disk.volume_serial = value;
        break;
    }
  }
}
