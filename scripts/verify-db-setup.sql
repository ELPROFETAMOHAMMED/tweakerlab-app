-- Verification script to check if tweaks database is set up correctly
-- Run this in Supabase SQL Editor to check your setup

-- Check if tables exist
SELECT
  schemaname as schema,
  tablename as table_name,
  tableowner as owner
FROM pg_tables
WHERE tablename IN ('tweaks', 'tweak_reports')
ORDER BY tablename;

-- Check if ENUM types exist
SELECT
  t.typname as enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
  'tweak_category',
  'tweak_risk_level',
  'tweak_status',
  'device_type',
  'windows_version',
  'tweak_file_type',
  'report_type',
  'report_status'
)
GROUP BY t.typname
ORDER BY t.typname;

-- Check if functions exist
SELECT
  routinename as function_name,
  routinetype as type
FROM information_schema.routines
WHERE routinename IN (
  'increment_tweak_downloads',
  'increment_tweak_likes',
  'decrement_tweak_likes',
  'get_featured_tweaks',
  'search_tweaks'
)
ORDER BY routinename;

-- Count current data
SELECT
  'tweaks' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_count,
  COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_count
FROM tweaks
UNION ALL
SELECT
  'tweak_reports' as table_name,
  COUNT(*) as row_count,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_count
FROM tweak_reports;

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename IN ('tweaks', 'tweak_reports')
ORDER BY tablename, policyname;
