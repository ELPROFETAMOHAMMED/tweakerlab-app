import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TweaksService } from '@/lib/services/tweaks-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');
    const deviceType = searchParams.get('deviceType');
    const windowsVersion = searchParams.get('windowsVersion');
    const requiresAdmin = searchParams.get('requiresAdmin');
    const limit = parseInt(searchParams.get('limit') || '50');

    const supabase = await createClient();
    const tweaksService = new TweaksService(supabase);

    let tweaks;

    // Handle different query types
    if (search) {
      tweaks = await tweaksService.searchTweaks(search, limit);
    } else if (category && category !== 'all') {
      tweaks = await tweaksService.getTweaksByCategory(category, limit);
    } else if (status || riskLevel || deviceType || windowsVersion || requiresAdmin) {
      // Advanced filtering
      tweaks = await tweaksService.filterTweaks({
        category,
        riskLevel,
        deviceType,
        windowsVersion,
        status,
        requiresAdmin: requiresAdmin === 'true' ? true : requiresAdmin === 'false' ? false : undefined,
        limit
      });
    } else {
      // Get all tweaks
      tweaks = await tweaksService.getAllTweaks(limit);
    }

    return NextResponse.json({
      tweaks,
      count: tweaks.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error in tweaks API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tweaks' },
      { status: 500 }
    );
  }
}
