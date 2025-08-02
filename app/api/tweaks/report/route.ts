import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TweaksService } from '@/lib/services/tweaks-service';

export async function POST(request: NextRequest) {
  try {
    const {
      tweakId,
      reportType,
      title,
      description,
      userSystemInfo
    } = await request.json();

    // Validation
    if (!tweakId) {
      return NextResponse.json(
        { error: 'Tweak ID is required' },
        { status: 400 }
      );
    }

    if (!reportType || !['bug', 'compatibility', 'performance', 'security', 'other'].includes(reportType)) {
      return NextResponse.json(
        { error: 'Valid report type is required' },
        { status: 400 }
      );
    }

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Report title is required' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Report description is required' },
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

    // Generate a temporary user ID (in production, this would come from auth)
    const userId = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Submit the report
    const report = await tweaksService.submitReport({
      tweakId,
      userId,
      reportType,
      title: title.trim(),
      description: description.trim(),
      userSystemInfo
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      message: 'Report submitted successfully. Our team will review it shortly.'
    }, { status: 201 });

  } catch (error) {
    console.error('Error in report API:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tweakId = searchParams.get('tweakId');

    if (!tweakId) {
      return NextResponse.json(
        { error: 'Tweak ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const tweaksService = new TweaksService(supabase);

    const reports = await tweaksService.getTweakReports(tweakId);

    return NextResponse.json({
      reports,
      count: reports.length
    }, { status: 200 });

  } catch (error) {
    console.error('Error in get reports API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}
