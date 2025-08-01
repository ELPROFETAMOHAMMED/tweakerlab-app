"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUploadStep } from "@/components/ui/file-upload-step"
import { SystemPreviewStep } from "@/components/ui/system-preview-step"
import { Check, ChevronLeft, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type OnboardingStepperProps = {}

export function OnboardingStepper({}: OnboardingStepperProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [parsedData, setParsedData] = useState<any>(null)
  const [fileData, setFileData] = useState<{ file: File; content: string } | null>(null)
  const [parseComplete, setParseComplete] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const steps = [
    { id: 1, title: "Upload & Parse", description: "Upload and process your msinfo32.txt file" },
    { id: 2, title: "Review & Save", description: "Review data and save to your profile" },
  ]

  const handleParseSuccess = (data: any, fileInfo: { file: File; content: string }) => {
    setParsedData(data)
    setFileData(fileInfo)
    setParseComplete(true)

    // Auto-advance to step 2 when parsing is complete
    setTimeout(() => {
      setCurrentStep(2)
    }, 500)
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSaveAndFinish = async () => {
    if (!parsedData || !fileData) {
      toast.error("No data to save")
      return
    }

    setIsSaving(true)

    try {
      // Convert transformed data back to ParsedPCInfo format
      const parsedPCInfo = {
        system_summary: parsedData.system_information || {},
        dma_entries: parsedData.dma_entries || [],
        irq_entries: parsedData.irq_entries || [],
        display_info: parsedData.display_adapters || [],
        network_adapters: parsedData.network_adapters || [],
        disks: parsedData.storage_drives || [],
        problem_devices: parsedData.problem_devices || [],
        startup_programs: parsedData.startup_programs || [],
        error_reports: parsedData.error_reports || [],
        device_detection: parsedData.device_detection || {
          device_type: "desktop",
          confidence: 0,
          reasons: []
        },
        parser_metadata: {
          version: parsedData.parser_metadata?.parser_version || "5.0-modular",
          sections_found: parsedData.parser_metadata?.sections_found || [],
          sections_parsed: parsedData.parser_metadata?.sections_parsed || [],
          parsing_errors: parsedData.parser_metadata?.parsing_errors || []
        }
      }

      const requestBody = {
        parsed_info: parsedPCInfo,
        file_size: fileData.file.size,
      }

      console.log("[ONBOARDING] Sending request body:", requestBody)

      const response = await fetch("/api/onboarding/save-pc-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (result.success) {
        toast.success("System information saved successfully!")
        // Navigate to dashboard
        window.location.href = "/dashboard"
      } else {
        console.error("[ONBOARDING] Save failed:", result)
        toast.error(result.error || "Failed to save data")
      }
    } catch (error) {
      console.error("[ONBOARDING] Save error:", error)
      toast.error("An unexpected error occurred while saving")
    } finally {
      setIsSaving(false)
    }
  }

  const canProceed = () => {
    if (currentStep === 1) {
      return parseComplete && parsedData
    }
    return true
  }

  const getActionButtonText = () => {
    if (currentStep === 2) {
      return isSaving ? "Saving..." : "Save & Go to Dashboard"
    }
    return "Next"
  }

  const handleActionClick = () => {
    if (currentStep === 2) {
      handleSaveAndFinish()
    }
  }

  return (
    <div className="space-y-8">
      {/* Stepper Header */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
                  currentStep > step.id
                    ? "bg-green-500 border-green-500 text-white"
                    : currentStep === step.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-muted-foreground/30 text-muted-foreground",
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{step.id}</span>
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-all duration-300",
                  currentStep > step.id ? "bg-green-500" : "bg-muted-foreground/30",
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card className="min-h-[500px]">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && <FileUploadStep onParseSuccess={handleParseSuccess} />}
              {currentStep === 2 && (
                <SystemPreviewStep
                  data={parsedData}
                  onSave={handleSaveAndFinish}
                  onBack={handlePrevious}
                  isSaving={isSaving}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="flex items-center space-x-2 bg-transparent"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </Button>

        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep === 2 && (
          <Button
            onClick={handleActionClick}
            disabled={!canProceed() || isSaving}
            className="flex items-center space-x-2"
          >
            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{getActionButtonText()}</span>
          </Button>
        )}

        {currentStep === 1 && (
          <div className="w-24" /> // Placeholder to maintain layout
        )}
      </div>
    </div>
  )
}
