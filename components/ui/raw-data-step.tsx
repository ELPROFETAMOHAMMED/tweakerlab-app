"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Code, Eye } from "lucide-react"
import { toast } from "sonner"

interface RawDataStepProps {
  data: any
}

export function RawDataStep({ data }: RawDataStepProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setCopied(true)
      toast.success("Data copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Failed to copy data")
    }
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <Code className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
        <p className="text-muted-foreground">Please upload your system file first.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2">Complete System Data</h3>
        <p className="text-muted-foreground">Here's the complete parsed data from your system information file.</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{data.summary?.sections_parsed?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Sections Parsed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{data.summary?.startup_programs_count || 0}</div>
            <div className="text-sm text-muted-foreground">Startup Programs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{data.summary?.problem_devices_count || 0}</div>
            <div className="text-sm text-muted-foreground">Problem Devices</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{data.summary?.error_reports_count || 0}</div>
            <div className="text-sm text-muted-foreground">Error Reports</div>
          </CardContent>
        </Card>
      </div>

      {/* Device Detection Details */}
      {data.summary?.device_detection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Device Detection Details</span>
            </CardTitle>
            <CardDescription>How we determined your device type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Device Type:</span>
              <Badge variant="secondary" className="capitalize">
                {data.summary.device_detection.device_type}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Confidence:</span>
              <Badge variant="outline">{data.summary.device_detection.confidence}%</Badge>
            </div>
            <div className="space-y-2">
              <span className="text-sm font-medium">Detection Reasons:</span>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                {data.summary.device_detection.reasons?.map((reason: string, index: number) => (
                  <li key={index}>• {reason}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw JSON Data */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5" />
                <span>Raw JSON Data</span>
              </CardTitle>
              <CardDescription>Complete parsed system information in JSON format</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center space-x-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96 border">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Parsing Errors */}
      {data.summary?.parsing_errors && data.summary.parsing_errors.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="text-yellow-600 dark:text-yellow-400">Parsing Warnings</CardTitle>
            <CardDescription>
              {data.summary.parsing_errors.length} minor issues encountered during analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1">
              {data.summary.parsing_errors.map((error: string, index: number) => (
                <li key={index} className="text-yellow-600 dark:text-yellow-400">
                  • {error}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
