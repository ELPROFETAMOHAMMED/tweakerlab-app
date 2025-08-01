"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Monitor, HardDrive, Wifi, Cpu, ChevronDown, Info, Package, Settings } from "lucide-react"
import { useState } from "react"

interface SystemPreviewStepProps {
  data: any
  onSave: () => void
  onBack: () => void
  isSaving: boolean
}

export function SystemPreviewStep({ data, onSave, onBack, isSaving }: SystemPreviewStepProps) {
  const [openSection, setOpenSection] = useState<string>("system")

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section)
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
          <p className="text-muted-foreground">Please upload and process a file first.</p>
        </div>
      </div>
    )
  }

  const systemInfo = data.system_information || {}
  const displayAdapters = data.display_adapters || []
  const storageDrives = data.storage_drives || []
  const networkAdapters = data.network_adapters || []
  const installedPrograms = data.installed_programs || []
  const operatingSystem = data.operating_system || {}
  const metadata = data.parser_metadata || {}

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Review Your System Information</h2>
        <p className="text-muted-foreground">
          Review the extracted system information below. When ready, save it to your profile to get personalized
          optimization recommendations.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Settings className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{Object.keys(systemInfo).length}</div>
            <div className="text-sm text-muted-foreground">System Fields</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Monitor className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{displayAdapters.length}</div>
            <div className="text-sm text-muted-foreground">Display Adapters</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <HardDrive className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{storageDrives.length}</div>
            <div className="text-sm text-muted-foreground">Storage Drives</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Package className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{installedPrograms.length}</div>
            <div className="text-sm text-muted-foreground">Programs</div>
          </CardContent>
        </Card>
      </div>

      {/* Processing Summary */}
      <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
            <Info className="h-5 w-5" />
            <span>Processing Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metadata.sections_found?.length || 0}</div>
              <div className="text-blue-700 dark:text-blue-300">Sections Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metadata.total_items_parsed || 0}</div>
              <div className="text-blue-700 dark:text-blue-300">Items Parsed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metadata.data_completeness_score || 0}%</div>
              <div className="text-blue-700 dark:text-blue-300">Data Quality</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{metadata.processing_time_ms || 0}ms</div>
              <div className="text-blue-700 dark:text-blue-300">Processing Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card>
        <Collapsible open={openSection === "system"} onOpenChange={() => toggleSection("system")}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  <CardTitle>System Information</CardTitle>
                  <Badge variant="secondary">{Object.keys(systemInfo).length} fields</Badge>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${openSection === "system" ? "rotate-180" : ""}`}
                />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid gap-3">
                {Object.entries(systemInfo).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between items-start py-2 border-b border-muted/50 last:border-0"
                  >
                    <span className="font-medium text-sm capitalize">{key.replace(/_/g, " ")}</span>
                    <span className="text-sm text-muted-foreground text-right max-w-[60%]">{String(value)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Display Adapters */}
      {displayAdapters.length > 0 && (
        <Card>
          <Collapsible open={openSection === "display"} onOpenChange={() => toggleSection("display")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Monitor className="h-5 w-5 text-green-500" />
                    <CardTitle>Display Adapters</CardTitle>
                    <Badge variant="secondary">{displayAdapters.length}</Badge>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openSection === "display" ? "rotate-180" : ""}`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {displayAdapters.map((adapter: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/25">
                      <h4 className="font-semibold mb-2">{adapter.name || `Display Adapter ${index + 1}`}</h4>
                      <div className="grid gap-2 text-sm">
                        {Object.entries(adapter).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                            <span className="text-right max-w-[60%]">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Storage Drives */}
      {storageDrives.length > 0 && (
        <Card>
          <Collapsible open={openSection === "storage"} onOpenChange={() => toggleSection("storage")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-5 w-5 text-purple-500" />
                    <CardTitle>Storage Drives</CardTitle>
                    <Badge variant="secondary">{storageDrives.length}</Badge>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openSection === "storage" ? "rotate-180" : ""}`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {storageDrives.map((drive: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/25">
                      <h4 className="font-semibold mb-2">{drive.name || drive.model || `Drive ${index + 1}`}</h4>
                      <div className="grid gap-2 text-sm">
                        {Object.entries(drive).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                            <span className="text-right max-w-[60%]">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Network Adapters */}
      {networkAdapters.length > 0 && (
        <Card>
          <Collapsible open={openSection === "network"} onOpenChange={() => toggleSection("network")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="h-5 w-5 text-blue-500" />
                    <CardTitle>Network Adapters</CardTitle>
                    <Badge variant="secondary">{networkAdapters.length}</Badge>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openSection === "network" ? "rotate-180" : ""}`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {networkAdapters.map((adapter: any, index: number) => (
                    <div key={index} className="p-4 border rounded-lg bg-muted/25">
                      <h4 className="font-semibold mb-2">{adapter.name || `Network Adapter ${index + 1}`}</h4>
                      <div className="grid gap-2 text-sm">
                        {Object.entries(adapter).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                            <span className="text-right max-w-[60%]">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Installed Programs */}
      {installedPrograms.length > 0 && (
        <Card>
          <Collapsible open={openSection === "software"} onOpenChange={() => toggleSection("software")}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-5 w-5 text-orange-500" />
                    <CardTitle>Installed Programs</CardTitle>
                    <Badge variant="secondary">{installedPrograms.length}</Badge>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${openSection === "software" ? "rotate-180" : ""}`}
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {installedPrograms.map((program: any, index: number) => (
                    <div key={index} className="p-3 border rounded bg-muted/25">
                      <div className="font-medium">{program.name || `Program ${index + 1}`}</div>
                      {program.version && (
                        <div className="text-sm text-muted-foreground">Version: {program.version}</div>
                      )}
                      {program.publisher && (
                        <div className="text-sm text-muted-foreground">Publisher: {program.publisher}</div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </div>
  )
}
