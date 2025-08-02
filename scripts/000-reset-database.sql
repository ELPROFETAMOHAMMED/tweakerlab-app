-- Reset/Clean Database Script
-- Run this FIRST if you had any errors or partial setup

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS tweak_reports;
DROP TABLE IF EXISTS tweaks;

-- Drop custom types if they exist
DROP TYPE IF EXISTS report_status;
DROP TYPE IF EXISTS report_type;
DROP TYPE IF EXISTS tweak_file_type;
DROP TYPE IF EXISTS windows_version;
DROP TYPE IF EXISTS device_type;
DROP TYPE IF EXISTS tweak_status;
DROP TYPE IF EXISTS tweak_risk_level;
DROP TYPE IF EXISTS tweak_category;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS update_tweak_reports_count();
DROP FUNCTION IF EXISTS get_featured_tweaks(INTEGER);
DROP FUNCTION IF EXISTS get_tweaks_by_category(tweak_category, INTEGER);
DROP FUNCTION IF EXISTS search_tweaks(TEXT, INTEGER);
DROP FUNCTION IF EXISTS increment_tweak_downloads(UUID);
DROP FUNCTION IF EXISTS increment_tweak_likes(UUID);
DROP FUNCTION IF EXISTS decrement_tweak_likes(UUID);
DROP FUNCTION IF EXISTS increment_tweak_views(UUID);

-- Clean up any orphaned triggers
DROP TRIGGER IF EXISTS update_tweaks_updated_at ON tweaks;
DROP TRIGGER IF EXISTS update_tweak_reports_updated_at ON tweak_reports;
DROP TRIGGER IF EXISTS trigger_update_tweak_reports_count ON tweak_reports;

SELECT 'Database cleaned successfully! Now run the setup scripts in order.' as message;
