import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, Document } from '@/lib/types';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Document[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let sql = 'SELECT DOCUMENT_ID, TITLE, CATEGORY, CHUNK_COUNT, UPLOADED_BY, CREATED_AT, RAW_CONTENT FROM TMSL_AI.PUBLIC.DOCUMENTS WHERE 1=1';
    const binds: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND LOWER(CATEGORY) = LOWER(?)';
      binds.push(category);
    }

    if (search) {
      sql += ' AND (ILIKE(TITLE, ?) OR ILIKE(RAW_CONTENT, ?))';
      binds.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY CREATED_AT DESC';

    const results = await executeQuery<any>(sql, binds);
    
    const documents: Document[] = results.map(row => ({
      document_id: row.DOCUMENT_ID,
      title: row.TITLE,
      filename: `${row.TITLE}.pdf`,
      category: row.CATEGORY,
      department: row.UPLOADED_BY || 'College Administration',
      source: 'TMSL Portal',
      content: row.RAW_CONTENT,
      chunk_count: Number(row.CHUNK_COUNT || 1),
      created_at: row.CREATED_AT ? String(row.CREATED_AT) : new Date().toISOString(),
      updated_at: row.CREATED_AT ? String(row.CREATED_AT) : new Date().toISOString()
    }));

    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    console.error('Fetch Documents Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Fetch failed' }, { status: 500 });
  }
}
