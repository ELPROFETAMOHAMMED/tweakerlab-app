/**
 * Simple, reliable MSINFO32 content validation based on field presence
 * Avoids strict section-based validation that causes false negatives
 */

const REQUIRED_FIELDS = [
  "OS Name",
  "Version",
  "OS Manufacturer",
  "System Name",
  "System Manufacturer",
  "System Model",
  "System Type",
  "Processor",
  "BIOS Version/Date",
  "BIOS Mode",
  "BaseBoard Manufacturer",
  "BaseBoard Product",
  "Platform Role",
  "Secure Boot State",
  "Boot Device",
  "User Name",
  "Time Zone",
  "Installed Physical Memory",
  "Total Physical Memory",
  "Available Physical Memory",
  "Total Virtual Memory",
  "Available Virtual Memory",
  "Kernel DMA Protection",
  "Virtualization-based security",
  "Hyper-V - VM Monitor Mode Extensions",
  "Hyper-V - Second Level Address Translation Extensions",
  "Hyper-V - Virtualization Enabled in Firmware",
  "Hyper-V - Data Execution Protection",
] as const

export interface ValidationResult {
  isValid: boolean
  foundFields: number
  totalFields: number
  percentageFound: number
  missingFields: string[]
  foundFieldsList: string[]
}

/**
 * Validates MSINFO32 file content by checking for presence of required fields
 * @param content - Raw text content of the msinfo32.txt file
 * @param thresholdPercent - Minimum percentage of fields required (default: 50)
 * @returns boolean indicating if the file is valid
 */
export function validateMsinfo32Content(content: string, thresholdPercent = 50): boolean {
  if (!content || typeof content !== "string") {
    return false
  }

  // Check minimum size requirement
  const minSize = 100
  if (content.length < minSize) {
    return false
  }

  // Convert to lowercase for case-insensitive matching
  const lowerContent = content.toLowerCase()

  // Count present fields
  let presentCount = 0
  for (const field of REQUIRED_FIELDS) {
    if (lowerContent.includes(field.toLowerCase())) {
      presentCount++
    }
  }

  // Calculate percentage
  const requiredCount = REQUIRED_FIELDS.length
  const percentFound = (presentCount / requiredCount) * 100

  return percentFound >= thresholdPercent
}

/**
 * Detailed validation with comprehensive results for debugging and logging
 * @param content - Raw text content of the msinfo32.txt file
 * @param thresholdPercent - Minimum percentage of fields required (default: 50)
 * @returns Detailed validation result object
 */
export function validateMsinfo32ContentDetailed(content: string, thresholdPercent = 50): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    foundFields: 0,
    totalFields: REQUIRED_FIELDS.length,
    percentageFound: 0,
    missingFields: [],
    foundFieldsList: [],
  }

  if (!content || typeof content !== "string") {
    result.missingFields = [...REQUIRED_FIELDS]
    return result
  }

  // Check minimum size requirement
  const minSize = 100
  if (content.length < minSize) {
    result.missingFields = [...REQUIRED_FIELDS]
    return result
  }

  // Convert to lowercase for case-insensitive matching
  const lowerContent = content.toLowerCase()

  // Check each field
  for (const field of REQUIRED_FIELDS) {
    if (lowerContent.includes(field.toLowerCase())) {
      result.foundFields++
      result.foundFieldsList.push(field)
    } else {
      result.missingFields.push(field)
    }
  }

  // Calculate percentage and validity
  result.percentageFound = (result.foundFields / result.totalFields) * 100
  result.isValid = result.percentageFound >= thresholdPercent

  return result
}

/**
 * Enhanced validation with field variations and aliases
 * Provides better matching for different Windows versions and localizations
 */
export function validateMsinfo32ContentEnhanced(content: string, thresholdPercent = 50): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    foundFields: 0,
    totalFields: REQUIRED_FIELDS.length,
    percentageFound: 0,
    missingFields: [],
    foundFieldsList: [],
  }

  if (!content || typeof content !== "string") {
    result.missingFields = [...REQUIRED_FIELDS]
    return result
  }

  // Check minimum size requirement
  const minSize = 100
  if (content.length < minSize) {
    result.missingFields = [...REQUIRED_FIELDS]
    return result
  }

  // Convert to lowercase for case-insensitive matching
  const lowerContent = content.toLowerCase()

  // Field variations and aliases for better matching
  const fieldVariations: Record<string, string[]> = {
    "OS Name": ["os name", "operating system"],
    Version: ["version", "os version"],
    "System Name": ["system name", "computer name", "pc name"],
    "System Manufacturer": ["system manufacturer", "manufacturer"],
    "System Model": ["system model", "model"],
    Processor: ["processor", "cpu", "central processing unit"],
    "BIOS Version/Date": ["bios version", "bios date"],
    "Installed Physical Memory": ["installed physical memory", "installed ram", "physical memory"],
    "Total Physical Memory": ["total physical memory", "total ram"],
    "Available Physical Memory": ["available physical memory", "available ram"],
    "Total Virtual Memory": ["total virtual memory", "virtual memory"],
    "Available Virtual Memory": ["available virtual memory"],
    "User Name": ["user name", "username"],
    "Time Zone": ["time zone", "timezone"],
  }

  // Check each field with variations
  for (const field of REQUIRED_FIELDS) {
    let fieldFound = false

    // Check primary field name
    if (lowerContent.includes(field.toLowerCase())) {
      fieldFound = true
    } else {
      // Check variations if available
      const variations = fieldVariations[field]
      if (variations) {
        for (const variation of variations) {
          if (lowerContent.includes(variation)) {
            fieldFound = true
            break
          }
        }
      }
    }

    if (fieldFound) {
      result.foundFields++
      result.foundFieldsList.push(field)
    } else {
      result.missingFields.push(field)
    }
  }

  // Calculate percentage and validity
  result.percentageFound = (result.foundFields / result.totalFields) * 100
  result.isValid = result.percentageFound >= thresholdPercent

  return result
}

/**
 * Sanitizes content to prevent injection attacks while preserving validation data
 * @param content - Raw file content
 * @returns Sanitized content safe for processing
 */
export function sanitizeContent(content: string): string {
  if (!content || typeof content !== "string") {
    return ""
  }

  // Remove potential script tags and dangerous content
  let sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "")
    .replace(/vbscript:/gi, "")
    .replace(/on\w+\s*=/gi, "")

  // Limit content length to prevent memory issues
  const maxLength = 10 * 1024 * 1024 // 10MB text limit
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength)
  }

  return sanitized
}

/**
 * Creates a user-friendly error message based on validation results
 * @param validationResult - Result from detailed validation
 * @returns Human-readable error message
 */
export function createValidationErrorMessage(validationResult: ValidationResult): string {
  if (validationResult.isValid) {
    return ""
  }

  if (validationResult.foundFields === 0) {
    return "Invalid MSINFO32 file: No system information fields detected. Please ensure you exported the file correctly from Windows System Information."
  }

  if (validationResult.percentageFound < 25) {
    return "Invalid MSINFO32 file: File appears to be incomplete or corrupted. Please try exporting a fresh file from msinfo32."
  }

  return `Invalid MSINFO32 file: Missing essential system data. Found ${validationResult.foundFields}/${validationResult.totalFields} required fields (${Math.round(validationResult.percentageFound)}%). Please ensure you exported the complete system information.`
}

// Export the field list for testing and debugging
export { REQUIRED_FIELDS }
