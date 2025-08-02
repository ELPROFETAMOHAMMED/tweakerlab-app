-- Debug script to check the current status of the tweaks database
-- Run this in Supabase SQL Editor to diagnose issues

-- 1. Check if tweaks table exists
SELECT
  'tweaks table' as check_name,
  CASE
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweaks')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run scripts/010-create-tweaks-table.sql'
  END as status;

-- 2. Check if tweak_reports table exists
SELECT
  'tweak_reports table' as check_name,
  CASE
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweak_reports')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run scripts/010-create-tweaks-table.sql'
  END as status;

-- 3. Check if RPC functions exist
SELECT
  'get_featured_tweaks function' as check_name,
  CASE
    WHEN EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'get_featured_tweaks')
    THEN '✅ EXISTS'
    ELSE '❌ MISSING - Run scripts/011-create-tweaks-functions.sql'
  END as status;

-- 4. Count tweaks in database (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweaks') THEN
    RAISE NOTICE '📊 TWEAKS COUNT:';
    PERFORM 1; -- Placeholder, the actual counts will be shown below
  ELSE
    RAISE NOTICE '❌ Cannot count tweaks - table does not exist';
  END IF;
END $$;

-- Show tweaks count if table exists
SELECT
  'Total tweaks' as metric,
  COUNT(*) as count
FROM tweaks
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweaks');

SELECT
  'Active tweaks' as metric,
  COUNT(*) as count
FROM tweaks
WHERE is_active = true
AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweaks');

SELECT
  'Featured tweaks' as metric,
  COUNT(*) as count
FROM tweaks
WHERE is_featured = true AND is_active = true
AND EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweaks');

-- 5. Show sample of tweaks data if any exists
SELECT
  '📋 SAMPLE TWEAKS:' as info,
  '' as title,
  '' as category,
  '' as status
WHERE FALSE -- This is just a header

UNION ALL

SELECT
  '→' as info,
  title,
  category::text,
  status::text
FROM tweaks
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweaks')
ORDER BY created_at DESC
LIMIT 5;

-- 6. Final recommendations
SELECT
  CASE
    WHEN NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tweaks')
    THEN '🔧 NEXT STEP: Run scripts/010-create-tweaks-table.sql first'

    WHEN NOT EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'get_featured_tweaks')
    THEN '🔧 NEXT STEP: Run scripts/011-create-tweaks-functions.sql'

    WHEN (SELECT COUNT(*) FROM tweaks WHERE is_active = true) = 0
    THEN '🔧 NEXT STEP: Run scripts/012-insert-sample-tweaks.sql to add sample data'

    ELSE '✅ NEXT STEP: Database looks good! Your app should work now.'
  END as recommendation;
