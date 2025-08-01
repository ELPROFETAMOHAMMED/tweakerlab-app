-- Add new columns to pc_info table
ALTER TABLE public.pc_info 
ADD COLUMN IF NOT EXISTS windows_error_reports JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS startup_programs JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS problem_devices JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS display_info JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS parser_version TEXT DEFAULT '1.0',
ADD COLUMN IF NOT EXISTS last_scan_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_pc_info_device_type ON public.pc_info(device_type);
CREATE INDEX IF NOT EXISTS idx_pc_info_parser_version ON public.pc_info(parser_version);
CREATE INDEX IF NOT EXISTS idx_pc_info_last_scan_at ON public.pc_info(last_scan_at);

-- Add GIN indexes for JSONB columns for efficient querying
CREATE INDEX IF NOT EXISTS idx_pc_info_error_reports_gin ON public.pc_info USING GIN (windows_error_reports);
CREATE INDEX IF NOT EXISTS idx_pc_info_startup_programs_gin ON public.pc_info USING GIN (startup_programs);
CREATE INDEX IF NOT EXISTS idx_pc_info_problem_devices_gin ON public.pc_info USING GIN (problem_devices);
CREATE INDEX IF NOT EXISTS idx_pc_info_display_info_gin ON public.pc_info USING GIN (display_info);

-- Add comments for documentation
COMMENT ON COLUMN public.pc_info.windows_error_reports IS 'Array of Windows error reports and crash data';
COMMENT ON COLUMN public.pc_info.startup_programs IS 'Array of programs that start with Windows';
COMMENT ON COLUMN public.pc_info.problem_devices IS 'Array of devices with driver issues or errors';
COMMENT ON COLUMN public.pc_info.display_info IS 'Detailed display adapter and monitor information';
COMMENT ON COLUMN public.pc_info.parser_version IS 'Version of the parser used to extract this data';
COMMENT ON COLUMN public.pc_info.last_scan_at IS 'Timestamp when the system was last scanned';
