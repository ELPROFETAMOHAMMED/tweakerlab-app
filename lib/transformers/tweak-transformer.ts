import { Tweak, TweakRiskLevel } from '@/types/tweak';
import { ContentItem } from '@/components/dashboard/categories-carrousel';

// Risk level styling configuration
const RISK_LEVEL_CONFIG = {
  minimal: {
    color: 'green',
    text: 'SAFE',
    description: 'No system impact'
  },
  low: {
    color: 'blue',
    text: 'LOW RISK',
    description: 'Minor changes, easily reversible'
  },
  medium: {
    color: 'yellow',
    text: 'MEDIUM RISK',
    description: 'Moderate changes, some risk'
  },
  high: {
    color: 'orange',
    text: 'HIGH RISK',
    description: 'Major changes, BSOD risk'
  },
  critical: {
    color: 'red',
    text: '⚠️ CRITICAL',
    description: 'Dangerous, expert only'
  }
} as const;

// Device type display configuration
const DEVICE_TYPE_CONFIG = {
  desktop: {
    icon: '🖥️',
    text: 'Desktop Only'
  },
  laptop: {
    icon: '💻',
    text: 'Laptop Only'
  },
  both: {
    icon: '🖥️💻',
    text: 'All Devices'
  }
} as const;

// Category display configuration
const CATEGORY_CONFIG = {
  performance: { icon: '⚡', color: 'blue' },
  privacy: { icon: '🛡️', color: 'green' },
  gaming: { icon: '🎮', color: 'purple' },
  battery: { icon: '🔋', color: 'green' },
  appearance: { icon: '🎨', color: 'pink' },
  network: { icon: '🌐', color: 'blue' },
  system: { icon: '⚙️', color: 'gray' },
  security: { icon: '🔒', color: 'red' }
} as const;

/**
 * Transform Tweak data to ContentItem format for carousel components
 */
export function transformTweaksToContentItems(tweaks: Tweak[]): ContentItem[] {
  return tweaks.map((tweak) => {
    const riskConfig = RISK_LEVEL_CONFIG[tweak.risk_level];
    const deviceConfig = DEVICE_TYPE_CONFIG[tweak.specs.device_type];
    const categoryConfig = CATEGORY_CONFIG[tweak.category];

    return {
      id: tweak.id,
      title: tweak.title,
      description: tweak.description,
      image: `/icons/tweaks/${tweak.icon_file_name}`, // Placeholder path
      icon: categoryConfig.icon,
      badge: riskConfig.text,
      // Additional metadata for tweak-specific rendering
      metadata: {
        tweakId: tweak.id,
        category: tweak.category,
        riskLevel: tweak.risk_level,
        riskColor: riskConfig.color,
        riskDescription: riskConfig.description,
        deviceType: tweak.specs.device_type,
        deviceIcon: deviceConfig.icon,
        deviceText: deviceConfig.text,
        windowsVersion: tweak.specs.windows_version,
        requiresAdmin: tweak.specs.requires_admin,
        requiresRestart: tweak.specs.requires_restart,
        affectsBattery: tweak.specs.affects_battery,
        affectsPerformance: tweak.specs.affects_performance,
        affectsSecurity: tweak.specs.affects_security,
        fileExtension: tweak.file_extension,
        fileSizeBytes: tweak.file_size_bytes,
        downloads: tweak.stats.downloads_count,
        likes: tweak.stats.likes_count,
        rating: tweak.stats.rating,
        successRate: tweak.stats.success_rate,
        isVerifiedAuthor: tweak.author?.verified || false,
        authorName: tweak.author?.name || 'Unknown',
        reversalMethod: tweak.reversal_method,
        conflictsWith: tweak.conflicts_with || [],
        requiresTweaks: tweak.requires_tweaks || [],
        // New fields
        status: tweak.status,
        adminNotes: tweak.admin_notes,
        disableReason: tweak.disable_reason,
        reportsCount: tweak.reports_count
      }
    };
  });
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format success rate for display
 */
export function formatSuccessRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

/**
 * Get risk level color class for Tailwind
 */
export function getRiskLevelColorClass(riskLevel: TweakRiskLevel): string {
  const colorMap = {
    minimal: 'text-green-600 bg-green-50 border-green-200',
    low: 'text-blue-600 bg-blue-50 border-blue-200',
    medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    high: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200'
  };

  return colorMap[riskLevel];
}

/**
 * Get category color class for Tailwind
 */
export function getCategoryColorClass(category: string): string {
  const colorMap: Record<string, string> = {
    performance: 'text-blue-600 bg-blue-50',
    privacy: 'text-green-600 bg-green-50',
    gaming: 'text-purple-600 bg-purple-50',
    battery: 'text-green-600 bg-green-50',
    appearance: 'text-pink-600 bg-pink-50',
    network: 'text-blue-600 bg-blue-50',
    system: 'text-gray-600 bg-gray-50',
    security: 'text-red-600 bg-red-50'
  };

  return colorMap[category] || 'text-gray-600 bg-gray-50';
}
