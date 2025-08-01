"use client"

import React, { useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileText,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Database,
  Info,
} from "lucide-react"
import { toast } from "sonner"

interface FileUploadStepProps {
  onParseSuccess: (data: any, fileInfo: { file: File; content: string }) => void
}

// Shake animation CSS (you can move this to your global CSS if you prefer)
const shakeStyle = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
    20%, 40%, 60%, 80% { transform: translateX(2px); }
  }
  .shake {
    animation: shake 0.6s ease-in-out;
  }
`

export function FileUploadStep({ onParseSuccess }: FileUploadStepProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [processingStep, setProcessingStep] = useState("")
  const [parseResult, setParseResult] = useState<any>(null)
  const [fileContent, setFileContent] = useState("")
  const [languageWarning, setLanguageWarning] = useState(false)
  const [shakeUpload, setShakeUpload] = useState(false)

  function detectMsinfoLanguage(content: string): "en" | "es" | "other" {
    if (content.includes("System Information") && content.includes("OS Name")) return "en"
    if (content.includes("Información del sistema") && content.includes("Nombre del SO")) return "es"
    return "other"
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)
    setProgress(0)
    setProcessingStep("Reading file...")

    try {
      // Read file content
      const content = await readFileContent(file)
      setFileContent(content)
      setProgress(25)
      setProcessingStep("Validating file format...")

      // Language validation - NO early return to avoid hook issues
      const lang = detectMsinfoLanguage(content);
      if (lang !== "en") {
        setLanguageWarning(true);
        setShakeUpload(true);
        setTimeout(() => setShakeUpload(false), 600);
        throw new Error("Please use an English msinfo32.txt file for best results");
      } else {
        setLanguageWarning(false);
      }

      // Basic validation
      if (!content.includes("System Information") && !content.includes("[System Summary]")) {
        throw new Error("This doesn't appear to be a valid msinfo32.txt file")
      }

      setProgress(50)
      setProcessingStep("Parsing system information...")

      // Send to API for parsing (using the refactored endpoint)
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/onboarding/upload-pc-scan", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to parse file")
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || "Parsing failed")
      }

      setProgress(75)
      setProcessingStep("Processing results...")

      // Transform data to expected format for UI compatibility
      const transformedData = {
        system_information: result.data?.system_summary || {},
        display_adapters: result.data?.display_info || [],
        storage_drives: result.data?.disks || [],
        network_adapters: result.data?.network_adapters || [],
        irq_entries: result.data?.irq_entries || [],
        dma_entries: result.data?.dma_entries || [],
        problem_devices: result.data?.problem_devices || [],
        parser_metadata: {
          sections_found: result.data?.parser_metadata?.sections_found || [],
          sections_parsed: result.data?.parser_metadata?.sections_parsed || [],
          total_items_parsed:
            (result.data?.display_info?.length || 0) +
            (result.data?.disks?.length || 0) +
            (result.data?.network_adapters?.length || 0) +
            (result.data?.irq_entries?.length || 0) +
            (result.data?.dma_entries?.length || 0) +
            (result.data?.problem_devices?.length || 0),
          data_completeness_score: Math.round(
            (result.data?.parser_metadata?.sections_parsed?.length || 0) * 20
          ),
          parser_version: result.data?.parser_metadata?.version || "5.0-modular",
        },
        device_detection: result.data?.device_detection || {
          device_type: "desktop",
          confidence: 0,
          reasons: []
        }
      }

      setParseResult(transformedData)

      setProgress(100)
      setProcessingStep("Complete!")

      toast.success("File processed successfully!")

      // Call the success callback with transformed data
      onParseSuccess(transformedData, { file, content })
    } catch (error: any) {
      toast.error(error.message || "Failed to process file")
      setIsProcessing(false)
      setProgress(0)
      setProcessingStep("")
      setParseResult(null)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        resolve(content)
      }
      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsText(file, "utf-8")
    })
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setIsProcessing(false)
    setProgress(0)
    setProcessingStep("")
    setParseResult(null)
    setFileContent("")
    setLanguageWarning(false)
    setShakeUpload(false)
  }

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploadedFile(file)
    await processFile(file)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
    },
    maxFiles: 1,
    multiple: false,
  })

  // Render success result
  if (parseResult) {
    return (
      <>
        <style>{shakeStyle}</style>
        <div className="space-y-6">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-2xl font-bold mb-2">File Processed Successfully!</h3>
            <p className="text-muted-foreground">Your system information has been extracted and is ready for review.</p>
          </div>

          {/* Device Detection Info */}
          {parseResult.device_detection && (
            <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <Info className="h-5 w-5" />
                  <span>Device Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-2">
                  <span>Device Type:</span>
                  <Badge variant={parseResult.device_detection.device_type === "laptop" ? "default" : "secondary"}>
                    {parseResult.device_detection.device_type?.charAt(0).toUpperCase() +
                      parseResult.device_detection.device_type?.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span>Confidence:</span>
                  <Badge variant="outline">
                    {Math.round((parseResult.device_detection.confidence || 0) * 100)}%
                  </Badge>
                </div>
                {parseResult.device_detection.reasons?.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium">Detection reasons:</span>
                    <ul className="list-disc list-inside mt-1">
                      {parseResult.device_detection.reasons.slice(0, 2).map((reason: string, idx: number) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Processing Summary */}
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                <Database className="h-5 w-5" />
                <span>Processing Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Object.keys(parseResult.system_information || {}).length}
                  </div>
                  <div className="text-green-700 dark:text-green-300">System Fields</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{parseResult.display_adapters?.length || 0}</div>
                  <div className="text-green-700 dark:text-green-300">Display Adapters</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{parseResult.storage_drives?.length || 0}</div>
                  <div className="text-green-700 dark:text-green-300">Storage Drives</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{parseResult.network_adapters?.length || 0}</div>
                  <div className="text-green-700 dark:text-green-300">Network Adapters</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                <div className="flex justify-between text-sm">
                  <span>Sections Found:</span>
                  <Badge variant="secondary">{parseResult.parser_metadata?.sections_found?.length || 0}</Badge>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Sections Parsed:</span>
                  <Badge variant="secondary">{parseResult.parser_metadata?.sections_parsed?.length || 0}</Badge>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Items Parsed:</span>
                  <Badge variant="secondary">{parseResult.parser_metadata?.total_items_parsed || 0}</Badge>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Parser Version:</span>
                  <Badge variant="outline">{parseResult.parser_metadata?.parser_version || "5.0"}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={resetUpload} variant="outline" className="bg-transparent">
              Upload Different File
            </Button>
          </div>
        </div>
      </>
    )
  }

  // Render processing state
  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Loader2 className="h-16 w-16 mx-auto mb-4 animate-spin text-blue-500" />
          <h3 className="text-2xl font-bold mb-2">Processing Your File</h3>
          <p className="text-muted-foreground">Please wait while we extract your system information...</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{processingStep}</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>

        {uploadedFile && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium">{uploadedFile.name}</p>
                  <p className="text-sm text-muted-foreground">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // Render upload interface
  return (
    <>
      <style>{shakeStyle}</style>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-2">Upload Your System Information</h3>
          <p className="text-muted-foreground">
            Upload your msinfo32.txt file to get started with system analysis and optimization recommendations.
          </p>
        </div>

        {/* Encoding Warning */}
        <Card className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">Important</p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  For best results, generate your msinfo32 file on an English Windows installation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Area */}
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
                ${isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/25"}
                ${shakeUpload ? "shake border-red-500" : ""}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              {isDragActive ? (
                <p className="text-lg font-medium">Drop your file here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium mb-2">Drag & drop your msinfo32.txt file here</p>
                  <p className="text-muted-foreground mb-4">or click to browse</p>
                  <Button variant="outline">Choose File</Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>How to Generate msinfo32.txt</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {languageWarning && (
              <div className="mb-4 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800 mb-1">Warning: Your msinfo32 file is not in English.</h4>
                  <p className="text-sm text-amber-700 mb-2">
                    For the most accurate analysis, please follow these steps before uploading:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800">
                    <li>Open Windows Settings → Time & Language → Language.</li>
                    <li>Change your Windows display language to <b>English (United States)</b>. If you don't have it installed, add it and select "Set as display language."</li>
                    <li>Restart your PC (if Windows asks you to).</li>
                    <li>Open the "System Information" tool (msinfo32) by pressing <b>Win + R</b>, typing <b>msinfo32</b>, and pressing Enter.</li>
                    <li>Export the report: Click <b>File</b> → <b>Export</b>, choose a location, and save the file.</li>
                    <li>Return to this page and upload the exported file.</li>
                  </ol>
                  <p className="text-xs text-amber-700 mt-2">
                    You can upload the file in another language, but some details may not be detected correctly.
                  </p>
                </div>
              </div>
            )}
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>
                Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Win + R</kbd> to open Run dialog
              </li>
              <li>
                Type <code className="px-2 py-1 bg-muted rounded text-xs">msinfo32</code> and press Enter
              </li>
              <li>Wait for System Information to load completely</li>
              <li>
                Go to <strong>File → Export</strong>
              </li>
              <li>
                Choose <strong>Text file (*.txt)</strong> format
              </li>
              <li>Save the file and upload it here</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
