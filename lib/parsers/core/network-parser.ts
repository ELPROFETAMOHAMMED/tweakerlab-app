import type { ParseContext } from "./main-parser";

export interface NetworkAdapter {
  name: string;
  adapter_type?: string;
  product_type?: string;
  default_ip_gateway?: string;
  dhcp_enabled?: boolean;
  is_wireless: boolean;
}

export class NetworkParser {
  /**
   * Parse network adapters section
   */
  parse(sectionLines: string[], context: ParseContext): NetworkAdapter[] {
    const adapters: NetworkAdapter[] = [];
    let currentAdapter: any = null;

    console.log(`[NETWORK PARSER] Processing ${sectionLines.length} lines`);

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

        // Parse table data - MSInfo32 uses tab separation
        const parts = trimmedLine.split('\t').map(s => s.trim());

        if (parts.length >= 2) {
          const [key, value] = [parts[0], parts.slice(1).join('\t')];

          if (key === "Name") {
            // Save previous adapter if exists
            if (currentAdapter && currentAdapter.name) {
              adapters.push(currentAdapter);
            }

            // Start new adapter
            currentAdapter = {
              name: value,
              is_wireless: this.isWireless(value)
            };
          } else if (currentAdapter) {
            this.assignAdapterField(currentAdapter, key, value);
          }
        } else {
          // Handle single column data (might be continuation)
          if (currentAdapter && trimmedLine.length > 0) {
            // This might be additional data, skip for now
            continue;
          }
        }
      }

      // Don't forget the last adapter
      if (currentAdapter && currentAdapter.name) {
        adapters.push(currentAdapter);
      }

      console.log(`[NETWORK PARSER] Successfully parsed ${adapters.length} network adapters`);

      // Log first few adapters for debugging
      adapters.slice(0, 3).forEach((adapter, index) => {
        console.log(`[NETWORK PARSER] Adapter ${index + 1}: ${adapter.name}`);
      });

    } catch (error) {
      console.error("[NETWORK PARSER] Error:", error);
      context.errors.push(`Network Parser: ${error instanceof Error ? error.message : "Unknown error"}`);
    }

    return adapters;
  }

  /**
   * Assign field to adapter
   */
  private assignAdapterField(adapter: any, key: string, value: string): void {
    if (!value || value === "Not Available") {
      return;
    }

    switch (key) {
      case "Adapter Type":
        adapter.adapter_type = value;
        break;
      case "Product Type":
        adapter.product_type = value;
        break;
      case "Default IP Gateway":
        adapter.default_ip_gateway = value;
        break;
      case "DHCP Enabled":
        adapter.dhcp_enabled = value.toLowerCase() === "yes";
        break;
      case "Last Reset":
        adapter.last_reset = value;
        break;
      case "IP Address":
        adapter.ip_address = value;
        break;
      case "MAC Address":
        adapter.mac_address = value;
        break;
      case "IRQ Channel":
        adapter.irq_channel = value;
        break;
    }
  }

  /**
   * Detect if adapter is wireless
   */
  private isWireless(name: string): boolean {
    const lower = name.toLowerCase();
    return lower.includes("wi-fi") ||
           lower.includes("wireless") ||
           lower.includes("wifi") ||
           lower.includes("802.11") ||
           lower.includes("bluetooth");
  }
}
