// Tweak Risk Levels
export type TweakRiskLevel =
  | 'minimal'      // Safe tweaks, no system impact
  | 'low'         // Minor changes, easily reversible
  | 'medium'      // Moderate changes, some risk
  | 'high'        // Major changes, high BSOD risk
  | 'critical';   // Dangerous, expert only

// Device Types
export type DeviceType = 'desktop' | 'laptop' | 'both';

// Windows Versions
export type WindowsVersion =
  | 'win10'
  | 'win11'
  | 'both';

// Tweak Categories
export type TweakCategory =
  | 'performance'
  | 'privacy'
  | 'gaming'
  | 'battery'
  | 'appearance'
  | 'network'
  | 'system'
  | 'security';

// Tweak File Types
export type TweakFileType =
  | '.reg'        // Registry files
  | '.bat'        // Batch scripts
  | '.ps1'        // PowerShell scripts
  | '.cmd'        // Command scripts
  | '.msi';       // Installer packages

// System Requirements/Specs
export interface TweakSpecs {
  windows_version: WindowsVersion;
  device_type: DeviceType;
  min_ram_gb?: number;
  min_storage_mb?: number;
  requires_admin: boolean;
  requires_restart: boolean;
  affects_battery: boolean; // Important for laptops
  affects_performance: boolean;
  affects_security: boolean;
}

// Tweak Statistics
export interface TweakStats {
  downloads_count: number;
  likes_count: number;
  views_count: number;
  rating: number; // 1-5 stars
  reviews_count: number;
  success_rate: number; // Percentage of successful applications
}

// Tweak Status
export type TweakStatus = 'active' | 'disabled' | 'deprecated';

// Report Types
export type ReportType = 'bug' | 'compatibility' | 'performance' | 'security' | 'other';

// Report Interface
export interface TweakReport {
  id: string;
  tweak_id: string;
  user_id: string;
  report_type: ReportType;
  title: string;
  description: string;
  user_system_info?: {
    windows_version: string;
    device_type: string;
    cpu: string;
    ram: string;
  };
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

// Main Tweak Interface
export interface Tweak {
  id: string;

  // Basic Info
  title: string;
  description: string;
  detailed_description: string; // More comprehensive explanation
  category: TweakCategory;

  // Visual
  icon_file_name: string; // Local .png file name
  preview_images?: string[]; // Before/after screenshots

  // Content & File Info
  tweak_content: string; // The actual tweak code/registry content
  file_extension: TweakFileType;
  file_size_bytes: number;

  // Compatibility & Requirements
  specs: TweakSpecs;

  // Risk Assessment
  risk_level: TweakRiskLevel;
  risk_description: string; // What could go wrong
  reversal_method: string; // How to undo this tweak

  // Statistics
  stats: TweakStats;

  // Status & Admin Controls
  status: TweakStatus; // active, disabled, deprecated
  admin_notes?: string; // Special admin notes/warnings
  disable_reason?: string; // Why it was disabled

  // Metadata
  is_active: boolean; // For backwards compatibility
  is_featured: boolean;
  featured_order?: number;
  created_at: string;
  updated_at: string;

  // Author info
  author?: {
    name: string;
    verified: boolean;
  };

  // Dependencies/Conflicts
  conflicts_with?: string[]; // IDs of conflicting tweaks
  requires_tweaks?: string[]; // IDs of prerequisite tweaks

  // Reports tracking
  reports_count?: number; // Number of user reports
  last_report_date?: string; // Last report received
}

// For API responses and forms
export interface TweakInsert extends Omit<Tweak, 'id' | 'created_at' | 'updated_at' | 'stats'> {
  stats?: Partial<TweakStats>;
}

export interface TweakUpdate extends Partial<TweakInsert> {
  id: string;
}

// For UI components
export interface TweakCardData {
  id: string;
  title: string;
  description: string;
  category: TweakCategory;
  risk_level: TweakRiskLevel;
  icon_file_name: string;
  stats: TweakStats;
  specs: {
    device_type: DeviceType;
    windows_version: WindowsVersion;
    affects_battery: boolean;
  };
  is_featured: boolean;
}

// Filter options for UI
export interface TweakFilters {
  category?: TweakCategory;
  risk_level?: TweakRiskLevel;
  device_type?: DeviceType;
  windows_version?: WindowsVersion;
  affects_battery?: boolean;
  min_rating?: number;
}
