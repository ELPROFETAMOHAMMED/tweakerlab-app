import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { TweaksService } from '@/lib/services/tweaks-service';

export async function POST(request: NextRequest) {
  try {
    const { tweakId } = await request.json();

    if (!tweakId) {
      return NextResponse.json(
        { error: 'Tweak ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const tweaksService = new TweaksService(supabase);

    // Get the tweak data
    const tweak = await tweaksService.getTweakById(tweakId);

    if (!tweak) {
      return NextResponse.json(
        { error: 'Tweak not found' },
        { status: 404 }
      );
    }

    // Check if tweak is active
    if (!tweak.is_active || tweak.status === 'disabled' || tweak.status === 'deprecated') {
      return NextResponse.json(
        { error: 'Tweak is not available for download' },
        { status: 403 }
      );
    }

    // Increment download count
    await tweaksService.incrementDownloads(tweakId);

    // Return file data for download
    const fileName = `${tweak.title.replace(/[^a-zA-Z0-9]/g, '_')}${tweak.file_extension}`;

    return NextResponse.json({
      fileName,
      content: tweak.tweak_content,
      mimeType: getMimeType(tweak.file_extension),
      title: tweak.title,
      size: tweak.file_size_bytes
    }, { status: 200 });

  } catch (error) {
    console.error('Error in download API:', error);
    return NextResponse.json(
      { error: 'Failed to download tweak' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tweakId = searchParams.get('id');

    if (!tweakId) {
      return NextResponse.json(
        { error: 'Tweak ID is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const tweaksService = new TweaksService(supabase);

    // Get the tweak data
    const tweak = await tweaksService.getTweakById(tweakId);

    if (!tweak) {
      return NextResponse.json(
        { error: 'Tweak not found' },
        { status: 404 }
      );
    }

    // Check if tweak is active
    if (!tweak.is_active || tweak.status === 'disabled' || tweak.status === 'deprecated') {
      return NextResponse.json(
        { error: 'Tweak is not available for download' },
        { status: 403 }
      );
    }

    // Increment download count
    await tweaksService.incrementDownloads(tweakId);

    // Return file directly
    const fileName = `${tweak.title.replace(/[^a-zA-Z0-9]/g, '_')}${tweak.file_extension}`;
    const headers = new Headers();
    headers.set('Content-Type', getMimeType(tweak.file_extension));
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new NextResponse(tweak.tweak_content, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error in download API:', error);
    return NextResponse.json(
      { error: 'Failed to download tweak' },
      { status: 500 }
    );
  }
}

function getMimeType(fileExtension: string): string {
  switch (fileExtension) {
    case '.reg':
      return 'text/plain';
    case '.bat':
      return 'application/bat';
    case '.ps1':
      return 'application/powershell';
    case '.exe':
      return 'application/octet-stream';
    case '.msi':
      return 'application/x-msi';
    case '.zip':
      return 'application/zip';
    default:
      return 'text/plain';
  }
}
