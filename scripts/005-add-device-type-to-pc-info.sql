-- Add device_type column to pc_info table
ALTER TABLE public.pc_info 
ADD COLUMN IF NOT EXISTS device_type TEXT DEFAULT 'desktop' CHECK (device_type IN ('laptop', 'desktop'));

-- Update existing records to have default value
UPDATE public.pc_info 
SET device_type = 'desktop' 
WHERE device_type IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE public.pc_info 
ALTER COLUMN device_type SET NOT NULL;

-- Add index for device_type queries
CREATE INDEX IF NOT EXISTS idx_pc_info_device_type ON public.pc_info(device_type);

-- Add comment for documentation
COMMENT ON COLUMN public.pc_info.device_type IS 'Device type detected from system information: laptop or desktop';
