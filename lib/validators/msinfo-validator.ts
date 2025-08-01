/**
 * Field-based validation for msinfo32.txt files
 * Focuses on presence of key system information fields rather than strict section structure
 */

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  fieldInfo: {
    totalFields: number
    foundFields: number
    foundFieldNames: string[]
    missingCriticalFields: string[]
    validationScore: number
  }
  fileInfo: {
    fileSize: number
    encoding: string
    lineEndings: string
    contentLength: number
  }
}

// Core system information fields that should be present in a valid msinfo32.txt file
const EXPECTED_FIELDS = [
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
]

// Minimum percentage of fields that must be present for validation to pass
const MIN_FIELD_PERCENTAGE = 0.5 // 50%
const MIN_REQUIRED_FIELDS = Math.ceil(EXPECTED_FIELDS.length * MIN_FIELD_PERCENTAGE)

export function validateMsInfoFile(content: string, fileName: string, fileSize: number): ValidationResult {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: [],
    fieldInfo: {
      totalFields: EXPECTED_FIELDS.length,
      foundFields: 0,
      foundFieldNames: [],
      missingCriticalFields: [],
      validationScore: 0,
    },
    fileInfo: {
      fileSize,
      encoding: "unknown",
      contentLength: 0,
      lineEndings: "unknown",
    },
  }

  try {
    // 1. Basic file validation
    if (!fileName.toLowerCase().endsWith(".txt")) {
      result.errors.push("File must have a .txt extension")
      return result
    }

    if (fileSize === 0) {
      result.errors.push("File is empty")
      return result
    }

    if (fileSize > 50 * 1024 * 1024) {
      // 50MB limit
      result.errors.push("File size exceeds 50MB limit")
      return result
    }

    if (fileSize < 500) {
      // Very small files are suspicious
      result.errors.push("File appears too small to contain system information")
      return result
    }

    // 2. Content preprocessing and basic checks
    const processedContent = preprocessContent(content)

    if (!processedContent || processedContent.trim().length === 0) {
      result.errors.push("File contains no readable content")
      return result
    }

    result.fileInfo.contentLength = processedContent.length
    result.fileInfo.encoding = detectEncoding(content)
    result.fileInfo.lineEndings = detectLineEndings(content)

    // 3. Check for obvious non-msinfo32 content
    if (isInvalidFileType(processedContent)) {
      result.errors.push("File does not appear to be a text export from Windows System Information")
      return result
    }

    // 4. Field-based validation - core logic
    const fieldValidation = validateSystemFields(processedContent)

    result.fieldInfo = {
      ...result.fieldInfo,
      ...fieldValidation,
    }

    // 5. Determine if validation passes
    const hasMinimumFields = fieldValidation.foundFields >= MIN_REQUIRED_FIELDS
    const hasBasicSystemInfo = fieldValidation.foundFieldNames.some(
      (field) =>
        field.toLowerCase().includes("os name") ||
        field.toLowerCase().includes("system name") ||
        field.toLowerCase().includes("processor"),
    )

    if (!hasMinimumFields) {
      result.errors.push(
        `Insufficient system information detected. Found ${fieldValidation.foundFields}/${EXPECTED_FIELDS.length} expected fields (minimum: ${MIN_REQUIRED_FIELDS})`,
      )
    }

    if (!hasBasicSystemInfo) {
      result.errors.push(
        "File does not contain basic system identification information (OS Name, System Name, or Processor)",
      )
    }

    // 6. Generate warnings for missing important fields
    const criticalFields = ["OS Name", "System Name", "Processor", "Total Physical Memory"]
    const missingCritical = criticalFields.filter(
      (field) => !fieldValidation.foundFieldNames.some((found) => found.toLowerCase().includes(field.toLowerCase())),
    )

    if (missingCritical.length > 0) {
      result.warnings.push(`Missing some important fields: ${missingCritical.join(", ")}`)
      result.fieldInfo.missingCriticalFields = missingCritical
    }

    if (fieldValidation.foundFields < EXPECTED_FIELDS.length * 0.75) {
      result.warnings.push("File may be incomplete or from an older Windows version")
    }

    // 7. Final validation result
    result.isValid = result.errors.length === 0

    return result
  } catch (error) {
    result.errors.push("Unexpected error during file validation")
    console.error("Validation error:", error)
    return result
  }
}

function preprocessContent(content: string): string {
  // Remove BOM if present
  let processed = content.replace(/^\uFEFF/, "")

  // Normalize line endings
  processed = processed.replace(/\r\n/g, "\n").replace(/\r/g, "\n")

  // Remove excessive whitespace but preserve structure
  processed = processed.replace(/[ \t]+$/gm, "")

  return processed
}

function detectEncoding(content: string): string {
  if (content.charCodeAt(0) === 0xfeff) return "UTF-16 BOM"
  if (content.includes("\uFFFD")) return "UTF-8 with errors"
  if (/[\u0080-\u00FF]/.test(content)) return "Extended ASCII/UTF-8"
  return "ASCII/UTF-8"
}

function detectLineEndings(content: string): string {
  const crlfCount = (content.match(/\r\n/g) || []).length
  const lfCount = (content.match(/(?<!\r)\n/g) || []).length
  const crCount = (content.match(/\r(?!\n)/g) || []).length

  if (crlfCount > lfCount && crlfCount > crCount) return "CRLF (Windows)"
  if (lfCount > crlfCount && lfCount > crCount) return "LF (Unix)"
  if (crCount > 0) return "CR (Mac Classic)"
  return "Mixed/Unknown"
}

function isInvalidFileType(content: string): boolean {
  const lowerContent = content.toLowerCase()

  // Check for obvious non-text formats
  const invalidPatterns = [
    /<html/,
    /<xml/,
    /^\s*{.*}\s*$/s, // JSON
    /^\s*\[.*\]\s*$/s, // Pure JSON array
    /%PDF-/,
    /PK\x03\x04/, // ZIP signature
  ]

  return invalidPatterns.some((pattern) => pattern.test(content))
}

function validateSystemFields(content: string): {
  foundFields: number
  foundFieldNames: string[]
  validationScore: number
} {
  const foundFieldNames: string[] = []
  const lowerContent = content.toLowerCase()

  // Check for each expected field with flexible matching
  for (const field of EXPECTED_FIELDS) {
    const fieldFound = checkFieldPresence(content, lowerContent, field)
    if (fieldFound) {
      foundFieldNames.push(field)
    }
  }

  const foundFields = foundFieldNames.length
  const validationScore = Math.round((foundFields / EXPECTED_FIELDS.length) * 100)

  return {
    foundFields,
    foundFieldNames,
    validationScore,
  }
}

function checkFieldPresence(content: string, lowerContent: string, field: string): boolean {
  const lowerField = field.toLowerCase()

  // Primary check: exact field name followed by tab or colon
  const exactPatterns = [
    new RegExp(`${escapeRegex(lowerField)}\\s*\\t`, "i"),
    new RegExp(`${escapeRegex(lowerField)}\\s*:`, "i"),
    new RegExp(`${escapeRegex(lowerField)}\\s*=`, "i"),
  ]

  for (const pattern of exactPatterns) {
    if (pattern.test(content)) {
      return true
    }
  }

  // Secondary check: field name appears in content with some context
  // This catches variations in formatting or localization
  const contextPatterns = [
    new RegExp(`\\b${escapeRegex(lowerField)}\\b.*\\t`, "i"),
    new RegExp(`\\t.*${escapeRegex(lowerField)}`, "i"),
  ]

  for (const pattern of contextPatterns) {
    if (pattern.test(content)) {
      return true
    }
  }

  // Special handling for common field variations
  const fieldVariations = getFieldVariations(lowerField)
  for (const variation of fieldVariations) {
    if (lowerContent.includes(variation)) {
      return true
    }
  }

  return false
}

function getFieldVariations(field: string): string[] {
  const variations: string[] = []

  // Common field name variations and abbreviations
  const fieldMap: Record<string, string[]> = {
    "os name": ["operating system", "os version"],
    "system name": ["computer name", "pc name"],
    "system manufacturer": ["manufacturer", "system maker"],
    "system model": ["model", "system product"],
    processor: ["cpu", "central processing unit"],
    "bios version/date": ["bios version", "bios date"],
    "installed physical memory": ["installed ram", "physical memory", "installed memory"],
    "total physical memory": ["total ram", "total memory"],
    "available physical memory": ["available ram", "available memory"],
    "total virtual memory": ["virtual memory", "page file"],
    "available virtual memory": ["available virtual", "free virtual"],
  }

  const lowerField = field.toLowerCase()
  if (fieldMap[lowerField]) {
    variations.push(...fieldMap[lowerField])
  }

  return variations
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Helper function for API route
export function createValidationErrorResponse(validation: ValidationResult): {
  success: false
  error: string
  details?: any
} {
  const primaryError = validation.errors[0] || "File validation failed"

  // Provide helpful context in development
  const details =
    process.env.NODE_ENV === "development"
      ? {
          allErrors: validation.errors,
          warnings: validation.warnings,
          fieldInfo: validation.fieldInfo,
          fileInfo: validation.fileInfo,
        }
      : undefined

  return {
    success: false,
    error: primaryError,
    details,
  }
}
