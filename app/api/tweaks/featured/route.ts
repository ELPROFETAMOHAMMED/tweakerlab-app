import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TweaksService } from '@/lib/services/tweaks-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log(`Fetching ${limit} featured tweaks...`);

    const supabase = await createClient();
    const tweaksService = new TweaksService(supabase);

    const featuredTweaks = await tweaksService.getFeaturedTweaks(limit);

    console.log(`Found ${featuredTweaks.length} featured tweaks`);

    if (featuredTweaks.length === 0) {
      return NextResponse.json({
        tweaks: [],
        count: 0,
        message: 'No tweaks available. Please add some tweaks to the database first.'
      }, { status: 200 });
    }

    return NextResponse.json({
      tweaks: featuredTweaks,
      count: featuredTweaks.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error in featured tweaks API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's a database configuration issue
    if (errorMessage.includes('relation') || errorMessage.includes('does not exist') || errorMessage.includes('not properly configured')) {
      return NextResponse.json(
        {
          error: 'Database not configured yet. Please run the SQL scripts in Supabase first, then add some sample tweaks.',
          details: errorMessage
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch featured tweaks',
        details: errorMessage
      },
      { status: 500 }
    );
  }
}
