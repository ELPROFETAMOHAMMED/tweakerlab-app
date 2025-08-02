import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TweaksService } from '@/lib/services/tweaks-service';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching tweaks count...');

    const supabase = await createClient();
    const tweaksService = new TweaksService(supabase);

    const count = await tweaksService.getTweaksCount();

    console.log(`Found ${count} total tweaks`);

    return NextResponse.json({
      count: count
    }, { status: 200 });

  } catch (error) {
    console.error('Error in tweaks count API:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    // Check if it's a database configuration issue
    if (errorMessage.includes('relation') || errorMessage.includes('does not exist') || errorMessage.includes('not properly configured')) {
      return NextResponse.json(
        {
          error: 'Database not configured yet. Please run the SQL scripts first.',
          details: errorMessage,
          count: 0
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Return 0 as fallback count
    return NextResponse.json(
      {
        error: 'Failed to fetch tweaks count',
        details: errorMessage,
        count: 0
      },
      { status: 500 }
    );
  }
}
