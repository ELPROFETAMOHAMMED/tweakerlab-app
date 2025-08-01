"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Monitor, Laptop, Cpu, MemoryStick, AlertTriangle, Zap, Activity, FileText, Database } from "lucide-react"

interface ConfirmationStepProps {
  data: any
  fileData: { file: File; content: string } | null
}

export function ConfirmationStep({ data, fileData }: ConfirmationStepProps) {
  if (!data || !fileData) {
    return (
      <div className="text-center py-12">
        <Database className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Data to Save</h3>
        <p className="text-muted-foreground">Please go back and upload a valid system information file.</p>
      </div>
    )
  }

  const summary = data.summary
  const deviceType = summary?.device_type || "desktop"
  const DeviceIcon = deviceType === "laptop" ? Laptop : Monitor

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Ready to Save Your System Information</h3>
        <p className="text-muted-foreground">
          Review the information below and click "Save & Continue" to store your system data and proceed to the
          dashboard.
        </p>
      </div>

      {/* File Information */}
      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">File Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">File Name:</span>
            <span className="font-medium">{fileData.file.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">File Size:</span>
            <span className="font-medium">{(fileData.file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sections Parsed:</span>
            <span className="font-medium">{summary?.sections_parsed?.length || 0}</span>
          </div>
        </CardContent>
      </Card>

      {/* Device Type */}
      <div className="flex items-center justify-center">
        <Badge variant="secondary" className="flex items-center space-x-2 px-4 py-2 text-base">
          <DeviceIcon className="h-5 w-5" />
          <span className="capitalize">{deviceType} Detected</span>
        </Badge>
      </div>

      {/* Hardware Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CPU */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Cpu className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Processor</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{summary?.cpu || "Not detected"}</p>
          </CardContent>
        </Card>

        {/* RAM */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <MemoryStick className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Memory</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{summary?.ram || "Not detected"}</p>
          </CardContent>
        </Card>

        {/* GPU */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">Graphics</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{summary?.gpu || "Not detected"}</p>
          </CardContent>
        </Card>

        {/* Windows */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Monitor className="h-5 w-5 text-indigo-500" />
              <CardTitle className="text-lg">Operating System</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium">{summary?.windows || "Not detected"}</p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Analysis Summary */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Analysis Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium">Startup Programs</span>
                </div>
                <Badge variant="secondary">{summary?.startup_programs_count || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Problem Devices</span>
                </div>
                <Badge variant="secondary">{summary?.problem_devices_count || 0}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium">Error Reports</span>
                </div>
                <Badge variant="secondary">{summary?.error_reports_count || 0}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Privacy Notice */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Database className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">Data Storage</h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your system information will be securely stored and used only to provide personalized optimization
                recommendations. You can delete this data at any time from your dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
