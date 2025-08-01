-- Drop existing pc_info table and create normalized schema
DROP TABLE IF EXISTS public.pc_info CASCADE;

-- Main PC info table
CREATE TABLE public.pc_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- System Summary fields
  os_name TEXT,
  os_version TEXT,
  os_manufacturer TEXT,
  system_name TEXT,
  system_manufacturer TEXT,
  system_model TEXT,
  system_type TEXT,
  processor TEXT,
  bios_version TEXT,
  bios_mode TEXT,
  baseboard_manufacturer TEXT,
  baseboard_product TEXT,
  platform_role TEXT,
  secure_boot_state TEXT,
  boot_device TEXT,
  username TEXT,
  timezone TEXT,
  installed_ram TEXT,
  total_ram TEXT,
  available_ram TEXT,
  total_virtual TEXT,
  available_virtual TEXT,
  kernel_dma_protection TEXT,
  virtualization_security TEXT,
  hyperv_vm_mode BOOLEAN DEFAULT FALSE,
  hyperv_slats BOOLEAN DEFAULT FALSE,
  hyperv_enabled BOOLEAN DEFAULT FALSE,
  hyperv_dep BOOLEAN DEFAULT FALSE,
  
  -- Device detection
  device_type TEXT CHECK (device_type IN ('laptop', 'desktop')) DEFAULT 'desktop',
  detection_confidence INTEGER DEFAULT 0,
  detection_reasons TEXT[],
  
  -- Parser metadata
  parser_version TEXT DEFAULT '4.0',
  file_size_bytes BIGINT,
  parsed_at TIMESTAMPTZ DEFAULT NOW(),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- DMA entries table
CREATE TABLE public.pc_dma_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  device_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- IRQ entries table
CREATE TABLE public.pc_irq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  irq_number TEXT,
  device_name TEXT NOT NULL,
  device_type TEXT, -- usb, audio, gpu, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Display information table
CREATE TABLE public.pc_display_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  name TEXT,
  pnp_device_id TEXT,
  adapter_type TEXT,
  adapter_description TEXT,
  adapter_ram TEXT,
  driver_version TEXT,
  color_table_entries TEXT,
  resolution TEXT,
  bits_per_pixel TEXT,
  irq_channel TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Network adapters table
CREATE TABLE public.pc_network_adapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  adapter_type TEXT,
  product_type TEXT,
  last_reset TEXT,
  default_ip_gateway TEXT,
  dhcp_enabled BOOLEAN,
  irq_channel TEXT,
  is_wireless BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disks table
CREATE TABLE public.pc_disks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  description TEXT,
  manufacturer TEXT,
  model TEXT,
  bytes_per_sector INTEGER,
  media_type TEXT,
  partitions INTEGER,
  sectors_per_track INTEGER,
  size_bytes BIGINT,
  total_cylinders BIGINT,
  total_sectors BIGINT,
  total_tracks BIGINT,
  tracks_per_cylinder INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Problem devices table
CREATE TABLE public.pc_problem_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  problem_code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Startup programs table
CREATE TABLE public.pc_startup_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  command TEXT,
  user_name TEXT,
  startup_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Windows error reports table
CREATE TABLE public.pc_error_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pc_info_id UUID REFERENCES public.pc_info(id) ON DELETE CASCADE,
  report_id TEXT,
  description TEXT,
  report_type TEXT,
  timestamp_reported TIMESTAMPTZ,
  module_name TEXT,
  error_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_pc_info_user_id ON public.pc_info(user_id);
CREATE INDEX idx_pc_info_device_type ON public.pc_info(device_type);
CREATE INDEX idx_pc_dma_entries_pc_info_id ON public.pc_dma_entries(pc_info_id);
CREATE INDEX idx_pc_irq_entries_pc_info_id ON public.pc_irq_entries(pc_info_id);
CREATE INDEX idx_pc_display_info_pc_info_id ON public.pc_display_info(pc_info_id);
CREATE INDEX idx_pc_network_adapters_pc_info_id ON public.pc_network_adapters(pc_info_id);
CREATE INDEX idx_pc_disks_pc_info_id ON public.pc_disks(pc_info_id);
CREATE INDEX idx_pc_problem_devices_pc_info_id ON public.pc_problem_devices(pc_info_id);
CREATE INDEX idx_pc_startup_programs_pc_info_id ON public.pc_startup_programs(pc_info_id);
CREATE INDEX idx_pc_error_reports_pc_info_id ON public.pc_error_reports(pc_info_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.pc_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_dma_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_irq_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_display_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_network_adapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_disks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_problem_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_startup_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pc_error_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own PC info" ON public.pc_info
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PC info" ON public.pc_info
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own PC info" ON public.pc_info
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PC info" ON public.pc_info
  FOR DELETE USING (auth.uid() = user_id);

-- Create policies for related tables (they inherit access through pc_info relationship)
CREATE POLICY "Users can access their PC DMA entries" ON public.pc_dma_entries
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_dma_entries.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PC IRQ entries" ON public.pc_irq_entries
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_irq_entries.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PC display info" ON public.pc_display_info
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_display_info.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PC network adapters" ON public.pc_network_adapters
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_network_adapters.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PC disks" ON public.pc_disks
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_disks.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PC problem devices" ON public.pc_problem_devices
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_problem_devices.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PC startup programs" ON public.pc_startup_programs
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_startup_programs.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

CREATE POLICY "Users can access their PC error reports" ON public.pc_error_reports
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.pc_info 
    WHERE pc_info.id = pc_error_reports.pc_info_id 
    AND pc_info.user_id = auth.uid()
  ));

-- Add comments for documentation
COMMENT ON TABLE public.pc_info IS 'Main PC system information table';
COMMENT ON TABLE public.pc_dma_entries IS 'DMA channel assignments for PC hardware';
COMMENT ON TABLE public.pc_irq_entries IS 'IRQ assignments for PC hardware';
COMMENT ON TABLE public.pc_display_info IS 'Display adapter and monitor information';
COMMENT ON TABLE public.pc_network_adapters IS 'Network adapter configuration';
COMMENT ON TABLE public.pc_disks IS 'Storage device information';
COMMENT ON TABLE public.pc_problem_devices IS 'Devices with driver issues or errors';
COMMENT ON TABLE public.pc_startup_programs IS 'Programs that start with Windows';
COMMENT ON TABLE public.pc_error_reports IS 'Windows error reports and crash data';
