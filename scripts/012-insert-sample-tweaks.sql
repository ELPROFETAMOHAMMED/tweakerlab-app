-- Sample Tweaks Data based on Windows Registry Optimizations
-- Insert realistic tweaks for each major category

-- Clear existing data first (optional)
-- DELETE FROM tweaks WHERE author_name = 'TweakerLab';

-- 1. ACCESSIBILITY - Disable accessibility features
INSERT INTO tweaks (
  title,
  description,
  detailed_description,
  category,
  icon_file_name,
  tweak_content,
  file_extension,
  file_size_bytes,
  windows_version,
  device_type,
  requires_admin,
  requires_restart,
  affects_battery,
  affects_performance,
  affects_security,
  risk_level,
  risk_description,
  reversal_method,
  downloads_count,
  likes_count,
  views_count,
  rating,
  reviews_count,
  success_rate,
  status,
  admin_notes,
  is_active,
  is_featured,
  featured_order,
  author_name,
  author_verified,
  reports_count
) VALUES (
  'Disable Accessibility Features (Narrator, Ease of Access)',
  'Disables Windows narrator, sticky keys, and other accessibility features that can impact gaming performance',
  'This tweak disables various Windows accessibility features including Narrator, Sticky Keys, Filter Keys, Toggle Keys, High Contrast, and Sound Sentry. These features can sometimes interfere with gaming or cause unwanted interruptions. Only disable if you don''t need accessibility features.',
  'system',
  'accessibility-features.png',
  '; EASE OF ACCESS OPTIMIZATION
; Disable narrator and accessibility features
[HKEY_CURRENT_USER\Software\Microsoft\Narrator\NoRoam]
"DuckAudio"=dword:00000000
"WinEnterLaunchEnabled"=dword:00000000
"ScriptingEnabled"=dword:00000000
"OnlineServicesEnabled"=dword:00000000

[HKEY_CURRENT_USER\Software\Microsoft\Narrator]
"NarratorCursorHighlight"=dword:00000000
"CoupleNarratorCursorKeyboard"=dword:00000000

[HKEY_CURRENT_USER\Software\Microsoft\Ease of Access]
"selfvoice"=dword:00000000
"selfscan"=dword:00000000

[HKEY_CURRENT_USER\Control Panel\Accessibility]
"Sound on Activation"=dword:00000000
"Warning Sounds"=dword:00000000

[HKEY_CURRENT_USER\Control Panel\Accessibility\StickyKeys]
"Flags"="2"

[HKEY_CURRENT_USER\Control Panel\Accessibility\ToggleKeys]
"Flags"="34"

[HKEY_CURRENT_USER\Control Panel\Accessibility\SoundSentry]
"Flags"="0"',
  '.reg',
  2845,
  'both',
  'both',
  false,
  false,
  false,
  true,
  false,
  'low',
  'May disable accessibility features that some users depend on. Test before applying.',
  'Re-enable accessibility features in Windows Settings > Ease of Access, or restore registry backup.',
  1247,
  89,
  3421,
  4.5,
  78,
  96.2,
  'active',
  'Safe for most users. Recommended for gaming systems.',
  true,
  true,
  1,
  'TweakerLab',
  true,
  2
);

-- 2. APPEARANCE - File Explorer optimizations
INSERT INTO tweaks (
  title,
  description,
  detailed_description,
  category,
  icon_file_name,
  tweak_content,
  file_extension,
  file_size_bytes,
  windows_version,
  device_type,
  requires_admin,
  requires_restart,
  affects_battery,
  affects_performance,
  affects_security,
  risk_level,
  risk_description,
  reversal_method,
  downloads_count,
  likes_count,
  views_count,
  rating,
  reviews_count,
  success_rate,
  status,
  admin_notes,
  is_active,
  is_featured,
  featured_order,
  author_name,
  author_verified,
  reports_count
) VALUES (
  'File Explorer Performance Optimization',
  'Optimizes Windows File Explorer for better performance by disabling unnecessary visual elements and features',
  'This comprehensive tweak optimizes File Explorer by: opening to This PC instead of Quick Access, hiding frequent folders, showing file extensions, disabling search history, removing cloud files from Quick Access, and disabling various preview features that can slow down file browsing.',
  'appearance',
  'file-explorer.png',
  '; FILE EXPLORER OPTIMIZATION
; Open file explorer to This PC instead of Quick Access
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced]
"LaunchTo"=dword:00000001

; Hide frequent folders in quick access
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer]
"ShowFrequent"=dword:00000000

; Show file name extensions
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced]
"HideFileExt"=dword:00000000

; Disable search history
[HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\SearchSettings]
"IsDeviceSearchHistoryEnabled"=dword:00000000

; Disable show files from office.com
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer]
"ShowCloudFilesInQuickAccess"=dword:00000000

; Enable display full path in title bar
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\CabinetState]
"FullPath"=dword:00000001

; Disable preview handlers and tooltips
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced]
"ShowInfoTip"=dword:00000000
"ShowPreviewHandlers"=dword:00000000
"ShowStatusBar"=dword:00000000',
  '.reg',
  1680,
  'both',
  'both',
  false,
  false,
  false,
  true,
  false,
  'low',
  'Changes File Explorer behavior. Some users may prefer the original settings.',
  'Reset File Explorer settings in Windows Settings > Personalization > Start, or restore registry backup.',
  2156,
  142,
  5678,
  4.3,
  95,
  94.8,
  'active',
  'Well tested optimization for File Explorer performance.',
  true,
  true,
  2,
  'TweakerLab',
  true,
  1
);

-- 3. GAMING - Audio and mouse optimizations
INSERT INTO tweaks (
  title,
  description,
  detailed_description,
  category,
  icon_file_name,
  tweak_content,
  file_extension,
  file_size_bytes,
  windows_version,
  device_type,
  requires_admin,
  requires_restart,
  affects_battery,
  affects_performance,
  affects_security,
  risk_level,
  risk_description,
  reversal_method,
  downloads_count,
  likes_count,
  views_count,
  rating,
  reviews_count,
  success_rate,
  status,
  admin_notes,
  is_active,
  is_featured,
  featured_order,
  author_name,
  author_verified,
  reports_count
) VALUES (
  'Gaming Audio & Mouse Optimization',
  'Optimizes audio settings and mouse precision for gaming. Disables Windows sounds and mouse acceleration',
  'This tweak is specifically designed for gamers. It disables Windows startup sounds, sets sound scheme to none, disables audio ducking, removes mouse acceleration (enhance pointer precision), and disables autoplay. These changes can significantly improve gaming experience by reducing audio latency and improving mouse precision.',
  'gaming',
  'gaming-optimization.png',
  '; GAMING AUDIO & MOUSE OPTIMIZATION
; Disable startup sound
[HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Authentication\LogonUI\BootAnimation]
"DisableStartupSound"=dword:00000001

; Sound communications do nothing (disable audio ducking)
[HKEY_CURRENT_USER\Software\Microsoft\Multimedia\Audio]
"UserDuckingPreference"=dword:00000003

; Sound scheme none - disable all Windows sounds
[HKEY_CURRENT_USER\AppEvents\Schemes]
@=".None"

[HKEY_CURRENT_USER\AppEvents\Schemes\Apps\.Default\.Default\.Current]
@=""

[HKEY_CURRENT_USER\AppEvents\Schemes\Apps\.Default\SystemNotification\.Current]
@=""

; Disable enhance pointer precision (mouse acceleration)
[HKEY_CURRENT_USER\Control Panel\Mouse]
"MouseSpeed"="0"
"MouseThreshold1"="0"
"MouseThreshold2"="0"

; Disable autoplay
[HKEY_CURRENT_USER\SOFTWARE\Microsoft\Windows\CurrentVersion\Explorer\AutoplayHandlers]
"DisableAutoplay"=dword:00000001',
  '.reg',
  1245,
  'both',
  'both',
  false,
  true,
  false,
  true,
  false,
  'low',
  'Disables Windows sounds and changes mouse behavior. Some users may want to keep system sounds.',
  'Re-enable system sounds in Windows Settings > Personalization > Themes > Sounds. Enable mouse acceleration in Mouse Properties.',
  3892,
  267,
  8934,
  4.8,
  156,
  97.3,
  'active',
  'Highly recommended for competitive gaming. Well tested by gaming community.',
  true,
  true,
  3,
  'TweakerLab',
  true,
  0
);

-- 4. PERFORMANCE - Visual effects optimization
INSERT INTO tweaks (
  title,
  description,
  detailed_description,
  category,
  icon_file_name,
  tweak_content,
  file_extension,
  file_size_bytes,
  windows_version,
  device_type,
  requires_admin,
  requires_restart,
  affects_battery,
  affects_performance,
  affects_security,
  risk_level,
  risk_description,
  reversal_method,
  downloads_count,
  likes_count,
  views_count,
  rating,
  reviews_count,
  success_rate,
  status,
  admin_notes,
  is_active,
  is_featured,
  featured_order,
  author_name,
  author_verified,
  reports_count
) VALUES (
  'Maximum Performance Visual Effects',
  'Disables Windows visual effects and animations for maximum performance. Best for gaming and older hardware',
  'This aggressive performance tweak disables most Windows visual effects including window animations, taskbar animations, Aero Peek, thumbnail previews, translucent selection rectangles, and window dragging effects. It also adjusts the system for best performance of applications rather than background services. Recommended for gaming systems or computers with limited resources.',
  'performance',
  'performance-boost.png',
  '; MAXIMUM PERFORMANCE VISUAL EFFECTS
; Set appearance options to custom
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\VisualEffects]
"VisualFXSetting"=dword:3

; Disable multiple visual effects for performance
[HKEY_CURRENT_USER\Control Panel\Desktop]
"UserPreferencesMask"=hex(2):90,12,03,80,10,00,00,00

; Disable animate windows when minimizing and maximizing
[HKEY_CURRENT_USER\Control Panel\Desktop\WindowMetrics]
"MinAnimate"="0"

; Disable animations in the taskbar
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced]
"TaskbarAnimations"=dword:0

; Disable Aero Peek
[HKEY_CURRENT_USER\Software\Microsoft\Windows\DWM]
"EnableAeroPeek"=dword:0
"AlwaysHibernateThumbnails"=dword:0

; Disable translucent selection and shadows
[HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Explorer\Advanced]
"ListviewAlphaSelect"=dword:0
"ListviewShadow"=dword:0

; Disable show window contents while dragging
[HKEY_CURRENT_USER\Control Panel\Desktop]
"DragFullWindows"="0"

; Adjust for best performance of programs
[HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\PriorityControl]
"Win32PrioritySeparation"=dword:00000026',
  '.reg',
  1890,
  'both',
  'both',
  true,
  true,
  false,
  true,
  false,
  'medium',
  'Significantly changes Windows appearance. Some users may find the interface less appealing without visual effects.',
  'Windows Settings > System > About > Advanced system settings > Performance Settings > Visual Effects > Let Windows choose.',
  5432,
  378,
  12456,
  4.6,
  203,
  95.1,
  'active',
  'Excellent for older hardware and gaming systems. Test on non-critical systems first.',
  true,
  true,
  4,
  'TweakerLab',
  true,
  3
);

