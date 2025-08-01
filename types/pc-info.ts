// Main PC Info types
export interface PCInfo {
  id: string
  user_id: string

  // System Summary
  os_name?: string
  os_version?: string
  os_manufacturer?: string
  system_name?: string
  system_manufacturer?: string
  system_model?: string
  system_type?: string
  processor?: string
  bios_version?: string
  bios_mode?: string
  baseboard_manufacturer?: string
  baseboard_product?: string
  platform_role?: string
  secure_boot_state?: string
  boot_device?: string
  username?: string
  timezone?: string
  installed_ram?: string
  total_ram?: string
  available_ram?: string
  total_virtual?: string
  available_virtual?: string
  kernel_dma_protection?: string
  virtualization_security?: string
  hyperv_vm_mode?: boolean
  hyperv_slats?: boolean
  hyperv_enabled?: boolean
  hyperv_dep?: boolean

  // Device detection
  device_type: "laptop" | "desktop"
  detection_confidence: number
  detection_reasons: string[]

  // Parser metadata
  parser_version: string
  file_size_bytes: number
  parsed_at: string
  created_at: string
  updated_at: string
}

export interface DMAEntry {
  id: string
  pc_info_id: string
  channel: string
  device_name: string
  created_at: string
}

export interface IRQEntry {
  id: string
  pc_info_id: string
  irq_number?: string
  device_name: string
  device_type?: string
  created_at: string
}

export interface DisplayInfo {
  id: string
  pc_info_id: string
  name?: string
  pnp_device_id?: string
  adapter_type?: string
  adapter_description?: string
  adapter_ram?: string
  driver_version?: string
  color_table_entries?: string
  resolution?: string
  bits_per_pixel?: string
  irq_channel?: string
  created_at: string
}

export interface NetworkAdapter {
  id: string
  pc_info_id: string
  name: string
  adapter_type?: string
  product_type?: string
  last_reset?: string
  default_ip_gateway?: string
  dhcp_enabled?: boolean
  irq_channel?: string
  is_wireless: boolean
  created_at: string
}

export interface DiskInfo {
  id: string
  pc_info_id: string
  description?: string
  manufacturer?: string
  model?: string
  bytes_per_sector?: number
  media_type?: string
  partitions?: number
  sectors_per_track?: number
  size_bytes?: number
  total_cylinders?: number
  total_sectors?: number
  total_tracks?: number
  tracks_per_cylinder?: number
  created_at: string
}

export interface ProblemDevice {
  id: string
  pc_info_id: string
  device_name: string
  problem_code?: string
  description?: string
  created_at: string
}

export interface StartupProgram {
  id: string
  pc_info_id: string
  name: string
  location?: string
  command?: string
  user_name?: string
  startup_type?: string
  created_at: string
}

export interface ErrorReport {
  id: string
  pc_info_id: string
  report_id?: string
  description?: string
  report_type?: string
  timestamp_reported?: string
  module_name?: string
  error_code?: string
  created_at: string
}

// Complete PC Info with all related data
export interface CompletePCInfo extends PCInfo {
  dma_entries: DMAEntry[]
  irq_entries: IRQEntry[]
  display_info: DisplayInfo[]
  network_adapters: NetworkAdapter[]
  disks: DiskInfo[]
  problem_devices: ProblemDevice[]
  startup_programs: StartupProgram[]
  error_reports: ErrorReport[]
}

// Parser result interface
export interface ParsedPCInfo {
  system_summary: {
    os_name?: string
    os_version?: string
    os_manufacturer?: string
    system_name?: string
    system_manufacturer?: string
    system_model?: string
    system_type?: string
    processor?: string
    bios_version?: string
    bios_mode?: string
    baseboard_manufacturer?: string
    baseboard_product?: string
    platform_role?: string
    secure_boot_state?: string
    boot_device?: string
    username?: string
    timezone?: string
    installed_ram?: string
    total_ram?: string
    available_ram?: string
    total_virtual?: string
    available_virtual?: string
    kernel_dma_protection?: string
    virtualization_security?: string
    hyperv_vm_mode?: boolean
    hyperv_slats?: boolean
    hyperv_enabled?: boolean
    hyperv_dep?: boolean
  }
  dma_entries: Array<{
    channel: string
    device_name: string
  }>
  irq_entries: Array<{
    irq_number?: string
    device_name: string
    device_type?: string
  }>
  display_info: Array<{
    name?: string
    pnp_device_id?: string
    adapter_type?: string
    adapter_description?: string
    adapter_ram?: string
    driver_version?: string
    color_table_entries?: string
    resolution?: string
    bits_per_pixel?: string
    irq_channel?: string
  }>
  network_adapters: Array<{
    name: string
    adapter_type?: string
    product_type?: string
    last_reset?: string
    default_ip_gateway?: string
    dhcp_enabled?: boolean
    irq_channel?: string
    is_wireless: boolean
  }>
  disks: Array<{
    description?: string
    manufacturer?: string
    model?: string
    bytes_per_sector?: number
    media_type?: string
    partitions?: number
    sectors_per_track?: number
    size_bytes?: number
    total_cylinders?: number
    total_sectors?: number
    total_tracks?: number
    tracks_per_cylinder?: number
  }>
  problem_devices: Array<{
    device_name: string
    problem_code?: string
    description?: string
  }>
  startup_programs: Array<{
    name: string
    location?: string
    command?: string
    user_name?: string
    startup_type?: string
  }>
  error_reports: Array<{
    report_id?: string
    description?: string
    report_type?: string
    timestamp_reported?: string
    module_name?: string
    error_code?: string
  }>
  device_detection: {
    device_type: "laptop" | "desktop"
    confidence: number
    reasons: string[]
  }
  parser_metadata: {
    version: string
    sections_found: string[]
    sections_parsed: string[]
    parsing_errors: string[]
  }
}
