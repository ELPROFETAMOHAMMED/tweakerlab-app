CREATE TABLE IF NOT EXISTS public.pc_info (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profile(id) ON DELETE CASCADE NOT NULL,
  
  -- CPU Information
  cpu_model TEXT,
  cpu_cores INTEGER,
  cpu_threads INTEGER,
  cpu_cache_l1 TEXT,
  cpu_cache_l2 TEXT,
  cpu_cache_l3 TEXT,
  cpu_speed TEXT,
  
  -- RAM Information
  ram_total_gb DECIMAL,
  ram_available_gb DECIMAL,
  ram_details JSONB,
  
  -- Storage Information
  disk_drives JSONB,
  
  -- GPU Information
  gpu_model TEXT,
  gpu_driver_version TEXT,
  gpu_details JSONB,
  
  -- Network Information
  network_adapters JSONB,
  wifi_adapters JSONB,
  
  -- System Information
  windows_version TEXT,
  system_name TEXT,
  pc_username TEXT,
  timezone TEXT,
  boot_device TEXT,
  secure_boot_enabled BOOLEAN,
  hyper_v_enabled BOOLEAN,
  hyper_v_model TEXT,
  legacy_boot_mode BOOLEAN,
  
  -- BIOS Information
  bios_version TEXT,
  bios_mode TEXT,
  
  -- Motherboard Information
  motherboard_manufacturer TEXT,
  motherboard_product TEXT,
  motherboard_version TEXT,
  
  -- Services and IRQs
  active_services JSONB,
  irqs JSONB,
  
  -- Raw data and metadata
  raw_file_content TEXT,
  file_size_bytes INTEGER,
  parsed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pc_info ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own PC info" ON public.pc_info
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own PC info" ON public.pc_info
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own PC info" ON public.pc_info
  FOR UPDATE USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_pc_info_user_id ON public.pc_info(user_id);
CREATE INDEX idx_pc_info_created_at ON public.pc_info(created_at);

-- Update trigger
CREATE OR REPLACE TRIGGER update_pc_info_updated_at
  BEFORE UPDATE ON public.pc_info
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
