import { Tweak, TweakRiskLevel, TweakCategory, WindowsVersion, DeviceType, TweakFileType, TweakStatus, ReportType } from '@/types/tweak';

export const MOCK_TWEAKS: Tweak[] = [
  {
    id: "tweak-001",
    title: "Disable Windows Telemetry",
    description: "Completely disable Windows data collection and telemetry services for better privacy.",
    detailed_description: "This tweak disables various Windows telemetry services including DiagTrack, Connected User Experiences, and other data collection components. Improves privacy but may affect some Windows features like Cortana and personalized ads.",
    category: "privacy" as TweakCategory,
    icon_file_name: "privacy-shield.png",
    preview_images: ["privacy-before.png", "privacy-after.png"],
    tweak_content: `Windows Registry Editor Version 5.00

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection]
"AllowTelemetry"=dword:00000000

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection]
"AllowTelemetry"=dword:00000000

[HKEY_LOCAL_MACHINE\\SOFTWARE\\Wow6432Node\\Microsoft\\Windows\\CurrentVersion\\Policies\\DataCollection]
"AllowTelemetry"=dword:00000000`,
    file_extension: ".reg" as TweakFileType,
    file_size_bytes: 452,
    specs: {
      windows_version: "both" as WindowsVersion,
      device_type: "both" as DeviceType,
      requires_admin: true,
      requires_restart: true,
      affects_battery: false,
      affects_performance: true,
      affects_security: false,
    },
    risk_level: "low" as TweakRiskLevel,
    risk_description: "May disable some Windows features like Cortana, personalized recommendations, and automatic troubleshooting.",
    reversal_method: "Set AllowTelemetry registry values back to 1 or delete the registry keys to restore default behavior.",
    stats: {
      downloads_count: 15420,
      likes_count: 1832,
      views_count: 45230,
      rating: 4.7,
      reviews_count: 324,
      success_rate: 98.5
    },
    status: "active" as TweakStatus,
    admin_notes: "📋 Admin Note: This tweak is safe and recommended for users concerned about privacy. No known issues.",
    is_active: true,
    is_featured: true,
    featured_order: 1,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-02-01T14:22:00Z",
    author: {
      name: "PrivacyMaster",
      verified: true
    },
    reports_count: 2,
    last_report_date: "2024-01-28T10:15:00Z"
  },

  {
    id: "tweak-002",
    title: "Ultimate Gaming Performance Boost",
    description: "Maximize gaming performance by disabling unnecessary services and optimizing system resources.",
    detailed_description: "Disables Windows Game Bar, Game Mode interference, background apps, and optimizes CPU scheduling for games. Increases FPS in most games by 5-15%.",
    category: "gaming" as TweakCategory,
    icon_file_name: "gaming-boost.png",
    tweak_content: `@echo off
echo Applying Gaming Performance Tweaks...

:: Disable Game Bar
reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v AppCaptureEnabled /t REG_DWORD /d 0 /f
reg add "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\GameDVR" /v GameDVR_Enabled /t REG_DWORD /d 0 /f

:: High Performance Power Plan
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c

:: Disable Fullscreen Optimizations
reg add "HKCU\\System\\GameConfigStore" /v GameDVR_FSEBehaviorMode /t REG_DWORD /d 2 /f

echo Gaming tweaks applied successfully!
pause`,
    file_extension: ".bat" as TweakFileType,
    file_size_bytes: 687,
    specs: {
      windows_version: "both" as WindowsVersion,
      device_type: "both" as DeviceType,
      min_ram_gb: 8,
      requires_admin: true,
      requires_restart: false,
      affects_battery: true,
      affects_performance: true,
      affects_security: false,
    },
    risk_level: "medium" as TweakRiskLevel,
    risk_description: "May cause higher power consumption and disable some Windows gaming features like screen recording.",
    reversal_method: "Run the provided undo batch file or manually re-enable Game Bar and restore balanced power plan.",
    stats: {
      downloads_count: 28934,
      likes_count: 3421,
      views_count: 72100,
      rating: 4.8,
      reviews_count: 891,
      success_rate: 94.2
    },
    status: "active" as TweakStatus,
    is_active: true,
    is_featured: true,
    featured_order: 2,
    created_at: "2024-01-20T16:45:00Z",
    updated_at: "2024-02-05T11:18:00Z",
    author: {
      name: "GameOptimizer",
      verified: true
    },
    reports_count: 5,
    last_report_date: "2024-02-03T14:22:00Z"
  },

  {
    id: "tweak-003",
    title: "Laptop Battery Life Maximizer",
    description: "Extend laptop battery life by up to 40% through intelligent power management tweaks.",
    detailed_description: "Optimizes CPU throttling, disables wake timers, reduces background activity, and configures advanced power settings specifically for laptops. Includes display brightness optimization and USB selective suspend.",
    category: "battery" as TweakCategory,
    icon_file_name: "battery-saver.png",
    tweak_content: `# PowerShell Battery Optimization Script
# Requires Administrator privileges

Write-Host "Configuring battery optimization settings..." -ForegroundColor Green

# Enable USB Selective Suspend
powercfg -setacvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 1
powercfg -setdcvalueindex SCHEME_CURRENT 2a737441-1930-4402-8d77-b2bebba308a3 48e6b7a6-50f5-4782-a5d4-53bb8f07e226 1

# Set CPU to 99% max when on battery
powercfg -setdcvalueindex SCHEME_CURRENT 54533251-82be-4824-96c1-47b60b740d00 bc5038f7-23e0-4960-96da-33abaf5935ec 99

# Disable wake timers
powercfg -setacvalueindex SCHEME_CURRENT 238c9fa8-0aad-41ed-83f4-97be242c8f20 bd3b718a-0680-4d9d-8ab2-e1d2b4ac806d 0
powercfg -setdcvalueindex SCHEME_CURRENT 238c9fa8-0aad-41ed-83f4-97be242c8f20 bd3b718a-0680-4d9d-8ab2-e1d2b4ac806d 0

Write-Host "Battery optimization complete!" -ForegroundColor Green`,
    file_extension: ".ps1" as TweakFileType,
    file_size_bytes: 1024,
    specs: {
      windows_version: "both" as WindowsVersion,
      device_type: "laptop" as DeviceType,
      requires_admin: true,
      requires_restart: false,
      affects_battery: true,
      affects_performance: true,
      affects_security: false,
    },
    risk_level: "low" as TweakRiskLevel,
    risk_description: "May slightly reduce performance when on battery power. Some devices may not wake from sleep as expected.",
    reversal_method: "Reset power plan to balanced or run the provided restoration PowerShell script.",
    stats: {
      downloads_count: 12850,
      likes_count: 1654,
      views_count: 31420,
      rating: 4.6,
      reviews_count: 287,
      success_rate: 96.8
    },
    status: "disabled" as TweakStatus,
    admin_notes: "⚠️ Temporarily disabled due to compatibility issues with recent Windows updates. Working on a fix.",
    disable_reason: "Compatibility issues with Windows 11 22H2 update causing unexpected shutdowns on some laptops.",
    is_active: false,
    is_featured: false,
    created_at: "2024-01-25T09:15:00Z",
    updated_at: "2024-02-03T08:45:00Z",
    author: {
      name: "BatteryExpert",
      verified: true
    },
    reports_count: 12,
    last_report_date: "2024-02-03T08:30:00Z"
  },

  {
    id: "tweak-004",
    title: "DANGEROUS: Kernel-Level Performance Hack",
    description: "⚠️ EXPERT ONLY: Direct kernel modifications for extreme performance gains. High BSOD risk!",
    detailed_description: "This tweak modifies critical system kernel parameters, DPC latency settings, and interrupt handling for maximum performance. Only for experienced users who understand the risks. Can cause system instability.",
    category: "performance" as TweakCategory,
    icon_file_name: "danger-kernel.png",
    tweak_content: `Windows Registry Editor Version 5.00
; WARNING: DANGEROUS MODIFICATIONS - BACKUP YOUR SYSTEM FIRST!

[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\kernel]
"DpcQueueDepth"=dword:00000001
"MinimumDpcRate"=dword:00000003
"AdjustDpcThreshold"=dword:00000001

[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Memory Management]
"LargeSystemCache"=dword:00000000
"SystemPages"=dword:ffffffff

; Modify interrupt handling (EXTREME RISK)
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\PriorityControl]
"IRQ8Priority"=dword:00000001
"IRQ16Priority"=dword:00000002`,
    file_extension: ".reg" as TweakFileType,
    file_size_bytes: 823,
    specs: {
      windows_version: "both" as WindowsVersion,
      device_type: "desktop" as DeviceType,
      min_ram_gb: 16,
      min_storage_mb: 500,
      requires_admin: true,
      requires_restart: true,
      affects_battery: false,
      affects_performance: true,
      affects_security: true,
    },
    risk_level: "critical" as TweakRiskLevel,
    risk_description: "EXTREMELY HIGH RISK: Can cause Blue Screen of Death (BSOD), system crashes, data corruption, or complete system failure. May make Windows unbootable.",
    reversal_method: "Boot from Windows recovery media and restore system registry from backup. Complete system reinstall may be required if system becomes unbootable.",
    stats: {
      downloads_count: 3421,
      likes_count: 234,
      views_count: 18920,
      rating: 3.9,
      reviews_count: 89,
      success_rate: 67.3
    },
    status: "active" as TweakStatus,
    admin_notes: "🔥 DANGER: This tweak modifies critical system components. Only download if you're an experienced user and have full system backup!",
    is_active: true,
    is_featured: false,
    created_at: "2024-02-01T20:30:00Z",
    updated_at: "2024-02-01T20:30:00Z",
    author: {
      name: "KernelHacker",
      verified: false
    },
    conflicts_with: ["tweak-003"], // Conflicts with battery saver
    reports_count: 18,
    last_report_date: "2024-02-04T16:45:00Z"
  },

  {
    id: "tweak-005",
    title: "Windows 11 Classic Start Menu Restore",
    description: "Bring back the Windows 10 style Start Menu and taskbar in Windows 11.",
    detailed_description: "Restores the classic Windows 10 Start Menu, removes centered taskbar alignment, and disables Windows 11 specific UI elements. Makes Windows 11 feel like Windows 10.",
    category: "appearance" as TweakCategory,
    icon_file_name: "classic-startmenu.png",
    tweak_content: `Windows Registry Editor Version 5.00

; Restore Windows 10 Start Menu
[HKEY_CURRENT_USER\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32]
@=""

; Left align taskbar
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced]
"TaskbarAl"=dword:00000000

; Disable Widgets
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced]
"TaskbarDa"=dword:00000000

; Show all taskbar icons
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced]
"EnableAutoTray"=dword:00000000`,
    file_extension: ".reg" as TweakFileType,
    file_size_bytes: 634,
    specs: {
      windows_version: "win11" as WindowsVersion,
      device_type: "both" as DeviceType,
      requires_admin: false,
      requires_restart: true,
      affects_battery: false,
      affects_performance: false,
      affects_security: false,
    },
    risk: {
      risk_level: "minimal" as TweakRiskLevel,
      risk_description: "Very safe tweak. Only affects visual appearance. May require Explorer restart.",
    },
    stats: {
      downloads_count: 45720,
      likes_count: 5234,
      views_count: 98450,
      rating: 4.9,
      reviews_count: 1203,
      success_rate: 99.1
    },
    status: "active" as TweakStatus,
    is_active: true,
    is_featured: true,
    featured_order: 3,
    created_at: "2024-01-10T14:20:00Z",
    updated_at: "2024-01-28T16:35:00Z",
    author: {
      name: "UIClassic",
      verified: true
    },
    reports: {
      reports_count: 1,
      last_report_date: "2024-01-20T12:30:00Z",
      reports: [
        {
          id: "report-001",
          title: "Windows 11 Classic Start Menu Restore",
          description: "Bring back the Windows 10 style Start Menu and taskbar in Windows 11.",
          report_id: "user_1234567890",
          report_date: "2024-01-20T12:30:00Z",
          report_status: "pending" as ReportStatus,
          report_type: "bug" as ReportType,
          report_severity: "low" as ReportSeverity,
          report_category: "ui" as ReportCategory,
          report_description: "The start menu is not working as expected. It is not showing the correct icons and the taskbar is not aligned to the left.",
        }
      ]
    }
  },

  {
    id: "tweak-006",
    title: "Network Speed Optimization",
    description: "Optimize TCP/IP settings and network stack for faster internet speeds and lower latency.",
    detailed_description: "Modifies TCP window scaling, disables Nagle's algorithm, optimizes receive window size, and configures advanced network adapter settings for maximum throughput and minimum latency.",
    category: "network" as TweakCategory,
    icon_file_name: "network-speed.png",
    tweak_content: `@echo off
echo Optimizing network settings for maximum speed...

:: Enable TCP Window Scaling
netsh int tcp set global autotuninglevel=normal

:: Disable TCP Nagle Algorithm
netsh int tcp set global chimney=enabled

:: Optimize TCP/IP settings
netsh int tcp set global rss=enabled
netsh int tcp set global netdma=enabled

:: Set large TCP window size
netsh int tcp set global autotuninglevel=experimental

:: Optimize DNS
netsh interface ip set dns "Local Area Connection" static 1.1.1.1
netsh interface ip set dns "Local Area Connection" static 8.8.8.8 index=2

echo Network optimization complete!
echo Please restart your computer for changes to take full effect.
pause`,
    file_extension: ".bat" as TweakFileType,
    file_size_bytes: 756,
    specs: {
      windows_version: "both" as WindowsVersion,
      device_type: "both" as DeviceType,
      requires_admin: true,
      requires_restart: true,
      affects_battery: false,
      affects_performance: true,
      affects_security: false,
    },
    risk_level: "medium" as TweakRiskLevel,
    risk_description: "May cause network connectivity issues with some routers or ISPs. Experimental TCP settings may not work with all network configurations.",
    reversal_method: "Run 'netsh int tcp reset' and 'netsh winsock reset' commands, then restart computer.",
    stats: {
      downloads_count: 22340,
      likes_count: 2891,
      views_count: 56780,
      rating: 4.5,
      reviews_count: 634,
      success_rate: 89.7
    },
    status: "active" as TweakStatus,
    is_active: true,
    is_featured: false,
    created_at: "2024-01-18T11:40:00Z",
    updated_at: "2024-02-02T09:25:00Z",
    author: {
      name: "NetOptimizer",
      verified: true
    },
    reports_count: 7,
    last_report_date: "2024-02-01T11:15:00Z"
  }
];

// Helper function to get tweaks by category
export function getTweaksByCategory(category: TweakCategory): Tweak[] {
  return MOCK_TWEAKS.filter(tweak => tweak.category === category && tweak.is_active);
}

// Helper function to get tweaks by risk level
export function getTweaksByRiskLevel(riskLevel: TweakRiskLevel): Tweak[] {
  return MOCK_TWEAKS.filter(tweak => tweak.risk_level === riskLevel && tweak.is_active);
}

// Helper function to get featured tweaks
export function getFeaturedTweaks(): Tweak[] {
  return MOCK_TWEAKS
    .filter(tweak => tweak.is_featured && tweak.is_active)
    .sort((a, b) => (a.featured_order || 999) - (b.featured_order || 999));
}

// Helper function to get tweaks suitable for device type
export function getTweaksForDevice(deviceType: DeviceType): Tweak[] {
  return MOCK_TWEAKS.filter(tweak =>
    tweak.is_active &&
    (tweak.specs.device_type === deviceType || tweak.specs.device_type === 'both')
  );
}
