export type TweakRiskLevel = 'minimal' | 'low' | 'medium' | 'high' | 'critical'

export type DeviceType = 'desktop' | 'laptop' | 'both'

export type WindowsVersion = 'win10' | 'win11' | 'both'

export type TweakCategory =
  | 'performance'
  | 'privacy'
  | 'gaming'
  | 'battery'
  | 'appearance'
  | 'network'
  | 'system'
  | 'security'

export type TweakFileType = '.reg' | '.bat' | '.ps1' | '.cmd' | '.msi'

export type TweakStatus = 'active' | 'disabled' | 'deprecated'

export type ReportType = 'bug' | 'compatibility' | 'performance' | 'security' | 'other'

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed'

export interface TweakSpecs {
  windows_version: WindowsVersion
  device_type: DeviceType
  min_ram_gb?: number
  min_storage_mb?: number
  requires_admin: boolean
  requires_restart: boolean
  affects_battery: boolean
  affects_performance: boolean
  affects_security: boolean
}

export interface TweakStats {
  downloads_count: number
  likes_count: number
  views_count: number
  rating: number
  reviews_count: number
  success_rate: number
}

export interface TweakAuthor {
  name: string
  verified: boolean
}

export interface SystemInfo {
  windows_version: string
  device_type: string
  cpu: string
  ram: string
}

export interface DatabaseTweak {
  id: string
  title: string
  description: string
  detailed_description: string
  category: TweakCategory
  icon_file_name: string
  tweak_content: string
  file_extension: TweakFileType
  file_size_bytes: number
  windows_version: WindowsVersion
  device_type: DeviceType
  requires_admin: boolean
  requires_restart: boolean
  affects_battery: boolean
  affects_performance: boolean
  affects_security: boolean
  risk_level: TweakRiskLevel
  risk_description: string
  reversal_method: string
  downloads_count: number
  likes_count: number
  views_count: number
  rating: number
  reviews_count: number
  success_rate: number
  status: TweakStatus
  admin_notes?: string
  disable_reason?: string
  is_active: boolean
  is_featured: boolean
  featured_order?: number
  created_at: string
  updated_at: string
  author_name: string
  author_verified: boolean
  conflicts_with: string[]
  requires_tweaks: string[]
  reports_count: number
  last_report_date?: string
}

export interface Tweak {
  id: string
  title: string
  description: string
  detailed_description: string
  category: TweakCategory
  icon_file_name: string
  preview_images?: string[]
  tweak_content: string
  file_extension: TweakFileType
  file_size_bytes: number
  specs: TweakSpecs
  risk_level: TweakRiskLevel
  risk_description: string
  reversal_method: string
  stats: TweakStats
  status: TweakStatus
  admin_notes?: string
  disable_reason?: string
  is_active: boolean
  is_featured: boolean
  featured_order?: number
  created_at: string
  updated_at: string
  author?: TweakAuthor
  conflicts_with?: string[]
  requires_tweaks?: string[]
  reports_count?: number
  last_report_date?: string
}

export interface TweakReport {
  id: string
  tweak_id: string
  user_id: string
  report_type: ReportType
  title: string
  description: string
  user_system_info?: SystemInfo
  status: ReportStatus
  admin_response?: string
  created_at: string
  updated_at: string
  resolved_at?: string
}

export interface TweakInsert extends Omit<Tweak, 'id' | 'created_at' | 'updated_at' | 'stats'> {
  stats?: Partial<TweakStats>
}

export interface TweakUpdate extends Partial<TweakInsert> {
  id: string
}

export interface TweakCardData {
  id: string
  title: string
  description: string
  category: TweakCategory
  risk_level: TweakRiskLevel
  icon_file_name: string
  stats: TweakStats
  specs: Pick<TweakSpecs, 'device_type' | 'windows_version' | 'affects_battery'>
  is_featured: boolean
}

export interface TweaksFilters {
  category?: string
  search?: string
  status?: string
  riskLevel?: string
  deviceType?: string
  windowsVersion?: string
  requiresAdmin?: boolean
  limit?: number
}

export interface ReportData {
  tweakId: string
  reportType: string
  title: string
  description: string
  userSystemInfo?: SystemInfo
}

export interface TweaksResponse {
  tweaks: DatabaseTweak[]
  count: number
}

export interface DownloadResponse {
  fileName: string
  content: string
  mimeType: string
  title: string
  size: number
}

export interface LikeResponse {
  success: boolean
  likesCount: number
  action: 'like' | 'unlike'
}

export interface ReportResponse {
  success: boolean
  reportId: string
  message: string
}
