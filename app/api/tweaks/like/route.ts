import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TweaksService } from '@/lib/services/tweaks-service';

export async function POST(request: NextRequest) {
  try {
    const { tweakId, action } = await request.json();

    if (!tweakId) {
      return NextResponse.json(
        { error: 'Tweak ID is required' },
        { status: 400 }
      );
    }

    if (!action || !['like', 'unlike'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (like/unlike) is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const tweaksService = new TweaksService(supabase);

    // Check if tweak exists
    const tweak = await tweaksService.getTweakById(tweakId);
    if (!tweak) {
      return NextResponse.json(
        { error: 'Tweak not found' },
        { status: 404 }
      );
    }

    let newLikesCount;

    if (action === 'like') {
      newLikesCount = await tweaksService.incrementLikes(tweakId);
    } else {
      newLikesCount = await tweaksService.decrementLikes(tweakId);
    }

    return NextResponse.json({
      success: true,
      likesCount: newLikesCount,
      action
    }, { status: 200 });

  } catch (error) {
    console.error('Error in like API:', error);
    return NextResponse.json(
      { error: 'Failed to update like status' },
      { status: 500 }
    );
  }
}
