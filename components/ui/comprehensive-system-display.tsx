"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Monitor,
  Laptop,
  Cpu,
  HardDrive,
  Wifi,
  Shield,
  Calendar,
  Package,
  AlertTriangle,
  Database,
  Network,
} from "lucide-react"

interface ComprehensiveSystemDisplayProps {
  // data: ParsedMSInfo32Data
}

export function ComprehensiveSystemDisplay({ data }: ComprehensiveSystemDisplayProps) {
  const deviceType = data.system_information.system_type?.toLowerCase().includes("laptop") ? "laptop" : "desktop"
  const DeviceIcon = deviceType === "laptop" ? Laptop : Monitor

  return (
    <div className="space-y-6">
      {/* Header with System Identity */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DeviceIcon className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle className="text-xl">
                  {data.system_information.system_manufacturer} {data.system_information.system_model}
                </CardTitle>
                <CardDescription>
                  {data.system_information.system_name} • {data.operating_system.os_name}
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-muted-foreground">Data Quality:</span>
                <Badge variant="outline">{data.parser_metadata.data_completeness_score}%</Badge>
              </div>
              <Progress value={data.parser_metadata.data_completeness_score} className="w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="hardware">Hardware</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="software">Software</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* System Information */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-lg">System</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">Model:</span>
                  <p className="font-medium">{data.system_information.system_model || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Manufacturer:</span>
                  <p className="font-medium">{data.system_information.system_manufacturer || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Owner:</span>
                  <p className="font-medium">{data.system_information.registered_owner || "Unknown"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Operating System */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Operating System</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">OS:</span>
                  <p className="font-medium">{data.operating_system.os_name || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Version:</span>
                  <p className="font-medium">{data.operating_system.os_version || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Architecture:</span>
                  <p className="font-medium">{data.system_information.system_type || "Unknown"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Hardware Summary */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-purple-500" />
                  <CardTitle className="text-lg">Hardware</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-muted-foreground">CPU:</span>
                  <p className="font-medium text-sm">{data.system_information.processor || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">RAM:</span>
                  <p className="font-medium">{data.system_information.total_physical_memory || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">GPU:</span>
                  <p className="font-medium text-sm">{data.display_adapters[0]?.adapter_description || "Unknown"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <Monitor className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{data.display_adapters.length}</p>
                <p className="text-sm text-muted-foreground">Display Adapters</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <HardDrive className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <p className="text-2xl font-bold">{data.storage_drives.length}</p>
                <p className="text-sm text-muted-foreground">Storage Drives</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Wifi className="h-8 w-8 mx-auto mb-2 text-cyan-500" />
                <p className="text-2xl font-bold">{data.network_adapters.length}</p>
                <p className="text-sm text-muted-foreground">Network Adapters</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <Package className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{data.installed_programs.length}</p>
                <p className="text-sm text-muted-foreground">Installed Programs</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Hardware Tab */}
        <TabsContent value="hardware" className="space-y-6">
          {/* Display Adapters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Monitor className="h-5 w-5" />
                <span>Display Adapters ({data.display_adapters.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.display_adapters.length > 0 ? (
                <div className="space-y-4">
                  {data.display_adapters.map((adapter, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{adapter.name || adapter.adapter_description}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {adapter.adapter_description && (
                          <div>
                            <span className="text-muted-foreground">Description:</span>
                            <p>{adapter.adapter_description}</p>
                          </div>
                        )}
                        {adapter.adapter_ram && (
                          <div>
                            <span className="text-muted-foreground">VRAM:</span>
                            <p>{adapter.adapter_ram}</p>
                          </div>
                        )}
                        {adapter.driver_version && (
                          <div>
                            <span className="text-muted-foreground">Driver Version:</span>
                            <p>{adapter.driver_version}</p>
                          </div>
                        )}
                        {adapter.resolution && (
                          <div>
                            <span className="text-muted-foreground">Resolution:</span>
                            <p>{adapter.resolution}</p>
                          </div>
                        )}
                        {adapter.refresh_rate && (
                          <div>
                            <span className="text-muted-foreground">Refresh Rate:</span>
                            <p>{adapter.refresh_rate}</p>
                          </div>
                        )}
                        {adapter.status && (
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={adapter.status.toLowerCase().includes("ok") ? "default" : "secondary"}>
                              {adapter.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No display adapters found</p>
              )}
            </CardContent>
          </Card>

          {/* BIOS Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>BIOS/UEFI</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">BIOS Version:</span>
                  <p className="font-medium">{data.system_information.bios_version || "Unknown"}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">BIOS Date:</span>
                  <p className="font-medium">{data.system_information.bios_date || "Unknown"}</p>
                </div>
                {data.system_information.baseboard_manufacturer && (
                  <div>
                    <span className="text-sm text-muted-foreground">Motherboard:</span>
                    <p className="font-medium">
                      {data.system_information.baseboard_manufacturer} {data.system_information.baseboard_product}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Network className="h-5 w-5" />
                <span>Network Adapters ({data.network_adapters.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.network_adapters.length > 0 ? (
                <div className="space-y-4">
                  {data.network_adapters.map((adapter, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{adapter.name}</h4>
                        <div className="flex space-x-2">
                          {adapter.is_wireless && (
                            <Badge variant="outline" className="text-xs">
                              <Wifi className="h-3 w-3 mr-1" />
                              Wireless
                            </Badge>
                          )}
                          {adapter.status && (
                            <Badge variant={adapter.status.toLowerCase().includes("up") ? "default" : "secondary"}>
                              {adapter.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {adapter.description && (
                          <div>
                            <span className="text-muted-foreground">Description:</span>
                            <p>{adapter.description}</p>
                          </div>
                        )}
                        {adapter.mac_address && (
                          <div>
                            <span className="text-muted-foreground">MAC Address:</span>
                            <p className="font-mono text-xs">{adapter.mac_address}</p>
                          </div>
                        )}
                        {adapter.ip_address && (
                          <div>
                            <span className="text-muted-foreground">IP Address:</span>
                            <p className="font-mono text-xs">{adapter.ip_address}</p>
                          </div>
                        )}
                        {adapter.default_gateway && (
                          <div>
                            <span className="text-muted-foreground">Gateway:</span>
                            <p className="font-mono text-xs">{adapter.default_gateway}</p>
                          </div>
                        )}
                        {adapter.dhcp_enabled !== undefined && (
                          <div>
                            <span className="text-muted-foreground">DHCP:</span>
                            <Badge variant={adapter.dhcp_enabled ? "default" : "secondary"} className="text-xs">
                              {adapter.dhcp_enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        )}
                        {adapter.speed && (
                          <div>
                            <span className="text-muted-foreground">Speed:</span>
                            <p>{adapter.speed}</p>
                          </div>
                        )}
                        {adapter.ssid && (
                          <div>
                            <span className="text-muted-foreground">SSID:</span>
                            <p>{adapter.ssid}</p>
                          </div>
                        )}
                        {adapter.driver_version && (
                          <div>
                            <span className="text-muted-foreground">Driver:</span>
                            <p className="text-xs">{adapter.driver_version}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No network adapters found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Storage Tab */}
        <TabsContent value="storage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <HardDrive className="h-5 w-5" />
                <span>Storage Drives ({data.storage_drives.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.storage_drives.length > 0 ? (
                <div className="space-y-4">
                  {data.storage_drives.map((drive, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-3">{drive.model || drive.description}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                        {drive.manufacturer && (
                          <div>
                            <span className="text-muted-foreground">Manufacturer:</span>
                            <p>{drive.manufacturer}</p>
                          </div>
                        )}
                        {drive.size_formatted && (
                          <div>
                            <span className="text-muted-foreground">Size:</span>
                            <p className="font-medium">{drive.size_formatted}</p>
                          </div>
                        )}
                        {drive.media_type && (
                          <div>
                            <span className="text-muted-foreground">Media Type:</span>
                            <p>{drive.media_type}</p>
                          </div>
                        )}
                        {drive.interface_type && (
                          <div>
                            <span className="text-muted-foreground">Interface:</span>
                            <p>{drive.interface_type}</p>
                          </div>
                        )}
                        {drive.serial_number && (
                          <div>
                            <span className="text-muted-foreground">Serial Number:</span>
                            <p className="font-mono text-xs">{drive.serial_number}</p>
                          </div>
                        )}
                        {drive.firmware_revision && (
                          <div>
                            <span className="text-muted-foreground">Firmware:</span>
                            <p>{drive.firmware_revision}</p>
                          </div>
                        )}
                        {drive.status && (
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <Badge variant={drive.status.toLowerCase().includes("ok") ? "default" : "secondary"}>
                              {drive.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No storage drives found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Software Tab */}
        <TabsContent value="software" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Installed Programs ({data.installed_programs.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.installed_programs.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {data.installed_programs.map((program, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h5 className="font-medium">{program.name}</h5>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                          {program.version && <span>v{program.version}</span>}
                          {program.publisher && <span>by {program.publisher}</span>}
                          {program.install_date && <span>installed {program.install_date}</span>}
                        </div>
                      </div>
                      {program.size && (
                        <Badge variant="outline" className="text-xs">
                          {program.size}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No installed programs found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Security Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.security_features.secure_boot_state && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Secure Boot</span>
                    <Badge
                      variant={
                        data.security_features.secure_boot_state.toLowerCase().includes("on") ? "default" : "secondary"
                      }
                    >
                      {data.security_features.secure_boot_state}
                    </Badge>
                  </div>
                )}
                {data.security_features.virtualization_based_security && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Virtualization-based Security</span>
                    <Badge variant="outline">{data.security_features.virtualization_based_security}</Badge>
                  </div>
                )}
                {data.security_features.kernel_dma_protection && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Kernel DMA Protection</span>
                    <Badge variant="outline">{data.security_features.kernel_dma_protection}</Badge>
                  </div>
                )}
                {data.security_features.windows_defender_app_control && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Windows Defender Application Control</span>
                    <Badge variant="outline">{data.security_features.windows_defender_app_control}</Badge>
                  </div>
                )}
                {data.security_features.hypervisor_detected !== undefined && (
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="font-medium">Hypervisor Detected</span>
                    <Badge variant={data.security_features.hypervisor_detected ? "default" : "secondary"}>
                      {data.security_features.hypervisor_detected ? "Yes" : "No"}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Timeline */}
          {(data.system_information.original_install_date || data.system_information.system_boot_time) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>System Timeline</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.system_information.original_install_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Original Install Date:</span>
                      <span className="font-medium">{data.system_information.original_install_date}</span>
                    </div>
                  )}
                  {data.system_information.system_boot_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last System Boot:</span>
                      <span className="font-medium">{data.system_information.system_boot_time}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Parser Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Parser Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Parser Version:</span>
              <p className="font-medium">{data.parser_metadata.parser_version}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sections Found:</span>
              <p className="font-medium">{data.parser_metadata.sections_found.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Sections Parsed:</span>
              <p className="font-medium">{data.parser_metadata.sections_parsed.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data Quality:</span>
              <p className="font-medium">{data.parser_metadata.data_completeness_score}%</p>
            </div>
          </div>

          {data.parser_metadata.sections_parsed.length > 0 && (
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">Parsed Sections:</span>
              <div className="flex flex-wrap gap-1 mt-2">
                {data.parser_metadata.sections_parsed.map((section, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {section}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.parser_metadata.parsing_errors.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">
                  Parsing Issues ({data.parser_metadata.parsing_errors.length})
                </span>
              </div>
              <div className="space-y-1">
                {data.parser_metadata.parsing_errors.slice(0, 3).map((error, index) => (
                  <p key={index} className="text-xs text-muted-foreground">
                    {error}
                  </p>
                ))}
                {data.parser_metadata.parsing_errors.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{data.parser_metadata.parsing_errors.length - 3} more issues
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
