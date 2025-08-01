-- Create function to atomically increment download count
CREATE OR REPLACE FUNCTION increment_download_count(game_config_id BIGINT)
RETURNS TABLE (
  id BIGINT,
  title VARCHAR(255),
  description TEXT,
  image_url TEXT,
  badge VARCHAR(50),
  category VARCHAR(100),
  settings_file_name VARCHAR(255),
  ini_content TEXT,
  downloads_count INTEGER,
  rating DECIMAL(2,1),
  file_size VARCHAR(20),
  is_active BOOLEAN,
  featured_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.game_configs
  SET downloads_count = downloads_count + 1,
      updated_at = timezone('utc'::text, now())
  WHERE game_configs.id = game_config_id
    AND is_active = true;

  RETURN QUERY
  SELECT * FROM public.game_configs
  WHERE game_configs.id = game_config_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_download_count(BIGINT) TO authenticated;
