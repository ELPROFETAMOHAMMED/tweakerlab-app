import { Tweak, TweakRiskLevel, TweakCategory, DeviceType, WindowsVersion } from '@/types/tweak';
import { DatabaseTweak } from '@/lib/services/tweaks-service';
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
  gaming: {
    icon: '🎮',
    text: 'Gaming',
    color: 'purple'
  },
  performance: {
    icon: '⚡',
    text: 'Performance',
    color: 'blue'
  },
  privacy: {
    icon: '🛡️',
    text: 'Privacy',
    color: 'green'
  },
  battery: {
    icon: '🔋',
    text: 'Battery',
    color: 'green'
  },
  appearance: {
    icon: '🎨',
    text: 'Appearance',
    color: 'pink'
  },
  network: {
    icon: '🌐',
    text: 'Network',
    color: 'blue'
  },
  system: {
    icon: '⚙️',
    text: 'System',
    color: 'gray'
  },
  security: {
    icon: '🔒',
    text: 'Security',
    color: 'red'
  }
} as const;

/**
 * Transform tweaks to ContentItem format for UI components
 */
export function transformTweaksToContentItems(tweaks: Tweak[]): ContentItem[] {
  return tweaks.map(tweak => {
    const riskConfig = RISK_LEVEL_CONFIG[tweak.risk_level] || RISK_LEVEL_CONFIG.low;
    const deviceConfig = DEVICE_TYPE_CONFIG[tweak.specs.device_type] || DEVICE_TYPE_CONFIG.both;

    return {
      id: tweak.id,
      title: tweak.title,
      description: tweak.description,
      metadata: {
        tweakId: tweak.id,
        category: tweak.category,
        riskLevel: tweak.risk_level,
        riskColor: riskConfig.color,
        riskDescription: tweak.risk_description,
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
 * Transform database tweaks to ContentItem format for UI components
 */
export function transformDatabaseTweaksToContentItems(tweaks: DatabaseTweak[]): ContentItem[] {
  return tweaks.map(tweak => {
    const riskConfig = RISK_LEVEL_CONFIG[tweak.risk_level as TweakRiskLevel] || RISK_LEVEL_CONFIG.low;
    const deviceConfig = DEVICE_TYPE_CONFIG[tweak.device_type as DeviceType] || DEVICE_TYPE_CONFIG.both;

    return {
      id: tweak.id,
      title: tweak.title,
      description: tweak.description,
      metadata: {
        tweakId: tweak.id,
        category: tweak.category,
        riskLevel: tweak.risk_level as TweakRiskLevel,
        riskColor: riskConfig.color,
        riskDescription: riskConfig.description,
        deviceType: tweak.device_type as DeviceType,
        deviceIcon: deviceConfig.icon,
        deviceText: deviceConfig.text,
        windowsVersion: tweak.windows_version as WindowsVersion,
        requiresAdmin: tweak.requires_admin,
        requiresRestart: tweak.requires_restart,
        affectsBattery: tweak.affects_battery,
        affectsPerformance: tweak.affects_performance,
        affectsSecurity: tweak.affects_security,
        fileExtension: tweak.file_extension,
        fileSizeBytes: tweak.file_size_bytes,
        downloads: tweak.downloads_count,
        likes: tweak.likes_count,
        rating: tweak.rating,
        successRate: tweak.success_rate,
        isVerifiedAuthor: tweak.author_verified,
        authorName: tweak.author_name,
        reversalMethod: tweak.reversal_method,
        conflictsWith: tweak.conflicts_with || [],
        requiresTweaks: tweak.requires_tweaks || [],
        // New fields
        status: tweak.status as 'active' | 'disabled' | 'deprecated',
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
