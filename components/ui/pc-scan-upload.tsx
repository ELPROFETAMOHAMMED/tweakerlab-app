"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Monitor,
  Laptop,
  ChevronDown,
  Shield,
  Lock,
  Eye,
} from "lucide-react"
import { toast } from "sonner"

interface PCScanUploadProps {
  onUploadSuccess: (data: any) => void
  isLoading?: boolean
}

export function PCScanUpload({ onUploadSuccess, isLoading }: PCScanUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [uploadResult, setUploadResult] = useState<any>(null)
  const [instructionsOpen, setInstructionsOpen] = useState(true)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      setUploadStatus("idle")
      setUploadResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploadStatus("uploading")

    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/onboarding/upload-pc-scan", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setUploadStatus("success")
        setUploadResult(result.data)
        toast.success("System information uploaded successfully!")
        onUploadSuccess(result.data)
      } else {
        setUploadStatus("error")
        toast.error(result.error || "Upload failed")
      }
    } catch (error) {
      setUploadStatus("error")
      toast.error("An unexpected error occurred")
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    setUploadStatus("idle")
    setUploadResult(null)
  }

  if (uploadStatus === "success" && uploadResult) {
    const summary = uploadResult.summary
    const deviceType = summary?.device_type || "desktop"
    const DeviceIcon = deviceType === "laptop" ? Laptop : Monitor

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl text-green-600 dark:text-green-400">Analysis Complete!</CardTitle>
            <CardDescription>Your system has been analyzed and optimization recommendations are ready.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="flex items-center space-x-2 px-3 py-1">
                <DeviceIcon className="h-4 w-4" />
                <span className="capitalize">{deviceType} Detected</span>
              </Badge>
            </div>

            <Button onClick={() => (window.location.href = "/dashboard")} className="w-full" size="lg">
              Continue to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Upload Card */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl">Upload System Information</CardTitle>
          <CardDescription>
            Upload your msinfo32.txt file to analyze your PC and get personalized tweaks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedFile ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 border rounded-lg bg-muted/50">
                <FileText className="h-8 w-8 text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                {uploadStatus !== "uploading" && (
                  <Button variant="ghost" size="icon" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {uploadStatus === "uploading" && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">Analyzing your system...</span>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <p className="text-sm text-destructive">Upload failed. Please try again.</p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploadStatus === "uploading" || isLoading}
                className="w-full"
                size="lg"
              >
                {uploadStatus === "uploading" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {uploadStatus === "uploading" ? "Analyzing System..." : "Upload & Analyze"}
              </Button>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragActive
                  ? "border-primary bg-primary/5 scale-[1.02]"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25"
              } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 rounded-full bg-muted">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-lg font-medium">
                    {isDragActive ? "Drop your msinfo32.txt file here" : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">Only .txt files up to 10MB are supported</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📜</span>
                  <CardTitle className="text-lg">How to Export Your System Info File</CardTitle>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${instructionsOpen ? "rotate-180" : ""}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <ol className="space-y-3 text-sm">
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    1
                  </span>
                  <span>Press Windows + R to open the Run dialog</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    2
                  </span>
                  <span>Type "msinfo32" and press Enter</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    3
                  </span>
                  <span>Wait for System Information to load completely</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    4
                  </span>
                  <span>Go to File → Export</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    5
                  </span>
                  <span>Choose a name (e.g. "msinfo32.txt") and save as .txt file</span>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-medium">
                    6
                  </span>
                  <span>Return here and upload the file</span>
                </li>
              </ol>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Privacy Card */}
      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg text-green-600 dark:text-green-400">🔐 Your Data, Protected</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">We only extract hardware details (CPU, GPU, RAM, etc.)</p>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <X className="h-4 w-4 text-red-500" />
              <span>We never access your IP address, MAC address, or personal data</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4 text-green-500" />
              <span>Files are stored encrypted in our secure database</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-blue-500" />
              <span>Your scan is used only to recommend compatible tweaks</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
