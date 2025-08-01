"use client"
import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2, Camera } from "lucide-react"
import Image from "next/image"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"

interface AvatarUploadProps {
  onImageSelect: (file: File) => void
  selectedImage?: File | null
  isLoading?: boolean
  error?: string
}

interface CropperState {
  crop: { x: number; y: number }
  zoom: number
  croppedAreaPixels: Area | null
}

export function AvatarUpload({ onImageSelect, selectedImage, isLoading, error }: AvatarUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showCropper, setShowCropper] = useState(false)
  const [cropperState, setCropperState] = useState<CropperState>({
    crop: { x: 0, y: 0 },
    zoom: 1,
    croppedAreaPixels: null,
  })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setPreviewUrl(URL.createObjectURL(file))
      setShowCropper(true)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  async function getCroppedImage(src: string, crop: Area): Promise<File> {
    const image = document.createElement("img")
    image.src = src
    await new Promise((resolve, reject) => {
      image.onload = resolve
      image.onerror = reject
    })

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)

    return new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas is empty"))
            return
          }
          resolve(
            new File([blob], `avatar-${crypto.randomUUID()}.jpg`, {
              type: "image/jpeg",
            }),
          )
        },
        "image/jpeg",
        0.9,
      )
    })
  }

  const handleCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCropperState((prev) => ({ ...prev, croppedAreaPixels }))
  }, [])

  const handleConfirmCrop = useCallback(async () => {
    if (!previewUrl || !cropperState.croppedAreaPixels) return

    const croppedFile = await getCroppedImage(previewUrl, cropperState.croppedAreaPixels)

    onImageSelect(croppedFile)
    setShowCropper(false)
  }, [previewUrl, cropperState.croppedAreaPixels, onImageSelect])

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setPreviewUrl(null)
    setShowCropper(false)
    setCropperState({
      crop: { x: 0, y: 0 },
      zoom: 1,
      croppedAreaPixels: null,
    })
  }, [previewUrl])

  return (
    <>
      <div className="space-y-2">
        <Label>Profile Picture *</Label>

        {selectedImage ? (
          <div className="flex items-center space-x-4 p-4 border rounded-lg">
            <div className="relative">
              <Image
                src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                alt="Selected avatar"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Profile picture ready</p>
              <p className="text-xs text-muted-foreground">{selectedImage.name}</p>
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={handleRemoveImage} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            } ${isLoading ? "pointer-events-none opacity-50" : ""}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center space-y-3">
              <div className="p-3 rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop your image here" : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP up to 5MB</p>
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Dialog open={showCropper} onOpenChange={setShowCropper}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Camera className="h-5 w-5" />
              <span>Crop Your Profile Picture</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative h-64 w-full bg-black rounded-lg overflow-hidden">
              {previewUrl && (
                <Cropper
                  image={previewUrl}
                  crop={cropperState.crop}
                  zoom={cropperState.zoom}
                  aspect={1}
                  onCropChange={(crop) => setCropperState((prev) => ({ ...prev, crop }))}
                  onZoomChange={(zoom) => setCropperState((prev) => ({ ...prev, zoom }))}
                  onCropComplete={handleCropComplete}
                  cropShape="round"
                  showGrid={false}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zoom" className="text-sm">
                Zoom
              </Label>
              <input
                id="zoom"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={cropperState.zoom}
                onChange={(ev) => setCropperState((prev) => ({ ...prev, zoom: Number(ev.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowCropper(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleConfirmCrop}
                className="flex-1"
                disabled={!cropperState.croppedAreaPixels}
              >
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
