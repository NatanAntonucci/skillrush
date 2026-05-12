import { NextResponse } from 'next/server';

import { syncValorantMetadata } from '@/services/supabase/sync';

export async function GET() {
  try {
    const result = await syncValorantMetadata();

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}