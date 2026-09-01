import { NextRequest, NextResponse } from 'next/server';
import { vectorSearch } from '@/lib/snowflake-ai';
import { ApiResponse, SearchResult } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<SearchResult[]>>> {
  try {
    const body = await req.json();
    const { query, limit = 10 } = body;

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query is required' }, { status: 400 });
    }

    const results = await vectorSearch(query, limit);

    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    console.error('Search Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Search failed' }, { status: 500 });
  }
}
