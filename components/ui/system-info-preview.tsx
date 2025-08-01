"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Monitor,
  Laptop,
  Cpu,
  Zap,
  AlertTriangle,
  Activity,
  Eye,
  Shield,
  HardDrive,
  Wifi,
  Calendar,
} from "lucide-react"

interface SystemInfoPreviewProps {
  data: any
}

export function SystemInfoPreview({ data }: SystemInfoPreviewProps) {
  if (!data) {
    return (
      <Card className="h-fit">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">📜 System Info Preview</CardTitle>
          </div>
          <CardDescription>Upload your msinfo32.txt file to see extracted system information here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Monitor className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No system data available yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const deviceType = data.device_detection?.device_type || "desktop"
  const DeviceIcon = deviceType === "laptop" ? Laptop : Monitor

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-green-600" />
          <CardTitle className="text-lg">📜 System Info Extracted</CardTitle>
        </div>
        <CardDescription>Here's what we found in your system information file.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Device Type with Confidence */}
        <div className="flex items-center justify-center space-x-4">
          <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
            <DeviceIcon className="h-4 w-4" />
            <span className="capitalize">{deviceType} Detected</span>
          </Badge>
          {data.device_detection?.confidence && (
            <Badge variant="outline" className="text-xs">
              {data.device_detection.confidence}% confidence
            </Badge>
          )}
        </div>

        <Separator />

        {/* System Overview */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>System Overview</span>
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">System:</span>
              <span className="text-right font-medium">
                {data.system_summary?.system_manufacturer} {data.system_summary?.system_model || "Unknown"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">OS:</span>
              <span className="text-right">{data.system_summary?.os_name || "⚠️ Not Found"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span className="text-right">{data.system_summary?.os_version || "⚠️ Not Found"}</span>
            </div>
            {data.system_summary?.registered_owner && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner:</span>
                <span className="text-right">{data.system_summary.registered_owner}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Hardware Info */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Cpu className="h-4 w-4" />
            <span>Hardware</span>
          </h4>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">CPU:</span>
              <span className="text-right">{data.system_summary?.processor || "⚠️ Not Found"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">RAM:</span>
              <span className="text-right">{data.system_summary?.total_ram || "⚠️ Not Found"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GPU:</span>
              <span className="text-right">{data.display_info?.[0]?.adapter_description || "⚠️ Not Found"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BIOS:</span>
              <span className="text-right">{data.system_summary?.bios_version || "⚠️ Not Found"}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Security Features */}
        {(data.system_summary?.secure_boot_state ||
          data.system_summary?.virtualization_security ||
          data.system_summary?.kernel_dma_protection) && (
          <>
            <div className="space-y-4">
              <h4 className="font-medium flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Security Features</span>
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm">
                {data.system_summary?.secure_boot_state && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Secure Boot:</span>
                    <Badge
                      variant={
                        data.system_summary.secure_boot_state.toLowerCase().includes("on") ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {data.system_summary.secure_boot_state}
                    </Badge>
                  </div>
                )}
                {data.system_summary?.virtualization_security && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VBS:</span>
                    <Badge variant="outline" className="text-xs">
                      {data.system_summary.virtualization_security}
                    </Badge>
                  </div>
                )}
                {data.system_summary?.kernel_dma_protection && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DMA Protection:</span>
                    <Badge variant="outline" className="text-xs">
                      {data.system_summary.kernel_dma_protection}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Storage & Network Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h5 className="font-medium flex items-center space-x-2 text-sm">
              <HardDrive className="h-3 w-3" />
              <span>Storage</span>
            </h5>
            <p className="text-xs text-muted-foreground">{data.disks?.length || 0} drives detected</p>
          </div>
          <div className="space-y-2">
            <h5 className="font-medium flex items-center space-x-2 text-sm">
              <Wifi className="h-3 w-3" />
              <span>Network</span>
            </h5>
            <p className="text-xs text-muted-foreground">{data.network_adapters?.length || 0} adapters found</p>
          </div>
        </div>

        <Separator />

        {/* Analysis Summary */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>System Analysis</span>
          </h4>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Startup Programs</span>
              </div>
              <Badge variant="secondary">{data.startup_programs?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Problem Devices</span>
              </div>
              <Badge variant="secondary">{data.problem_devices?.length || 0}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-red-500" />
                <span className="text-sm">Error Reports</span>
              </div>
              <Badge variant="secondary">{data.error_reports?.length || 0}</Badge>
            </div>
          </div>
        </div>

        {/* System Dates */}
        {(data.system_summary?.original_install_date || data.system_summary?.system_boot_time) && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>System Timeline</span>
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                {data.system_summary?.original_install_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Installed:</span>
                    <span>{data.system_summary.original_install_date}</span>
                  </div>
                )}
                {data.system_summary?.system_boot_time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Boot:</span>
                    <span>{data.system_summary.system_boot_time}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Sections Parsed */}
        {data.parser_metadata?.sections_parsed && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Sections Analyzed ({data.parser_metadata.sections_parsed.length})</h4>
              <div className="flex flex-wrap gap-1">
                {data.parser_metadata.sections_parsed.map((section: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Parsing Errors */}
        {data.parser_metadata?.parsing_errors && data.parser_metadata.parsing_errors.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-yellow-600">Parsing Notes</h4>
              <p className="text-xs text-muted-foreground">
                {data.parser_metadata.parsing_errors.length} items noted during analysis
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
