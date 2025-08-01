/**
 * Minimal file validation for MSINFO32 uploads
 * Only checks basic file requirements without content validation
 */

export interface MinimalValidationResult {
  isValid: boolean
  error?: string
  fileInfo: {
    fileName: string
    fileSize: number
    contentLength: number
  }
}

/**
 * Minimal validation that only checks basic file requirements
 * @param content - Raw file content
 * @param fileName - Name of the uploaded file
 * @param fileSize - Size of the file in bytes
 * @returns Validation result with minimal checks
 */
export function validateFileMinimal(content: string, fileName: string, fileSize: number): MinimalValidationResult {
  const result: MinimalValidationResult = {
    isValid: false,
    fileInfo: {
      fileName,
      fileSize,
      contentLength: content?.length || 0,
    },
  }

  // Check if file has .txt extension
  if (!fileName.toLowerCase().endsWith(".txt")) {
    result.error = "Please upload a .txt file"
    return result
  }

  // Check if file is empty
  if (fileSize === 0) {
    result.error = "File is empty, please upload a valid msinfo32 export"
    return result
  }

  // Check minimum size (very permissive)
  if (fileSize < 100) {
    result.error = "File appears too small, please upload a complete msinfo32 export"
    return result
  }

  // Check if content is readable
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    result.error = "Unable to read file content, please try uploading again"
    return result
  }

  // All basic checks passed
  result.isValid = true
  return result
}

/**
 * Sanitizes content to prevent injection attacks while preserving all data
 * @param content - Raw file content
 * @returns Sanitized content safe for processing
 */
export function sanitizeContentMinimal(content: string): string {
  if (!content || typeof content !== "string") {
    return ""
  }

  // Only remove the most dangerous content, preserve everything else
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
    .replace(/javascript:/gi, "") // Remove javascript: protocols
    .replace(/vbscript:/gi, "") // Remove vbscript: protocols

  // Limit content length to prevent memory issues (very generous limit)
  const maxLength = 100 * 1024 * 1024 // 100MB text limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}
