import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, Document } from '@/lib/types';

interface DocumentWithChunks extends Document {
  chunks: {
    chunk_id: string;
    chunk_index: number;
    content: string;
  }[];
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse<ApiResponse<DocumentWithChunks>>> {
  try {
    const id = params.id;

    const docSql = `SELECT * FROM TMSL_AI.PUBLIC.DOCUMENTS WHERE DOCUMENT_ID = ?`;
    const docResults = await executeQuery<any>(docSql, [id]);
    
    if (docResults.length === 0) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const chunksSql = `
      SELECT CHUNK_ID, CHUNK_INDEX, CHUNK_TEXT 
      FROM TMSL_AI.PUBLIC.DOCUMENT_CHUNKS 
      WHERE DOCUMENT_ID = ? 
      ORDER BY CHUNK_INDEX ASC
    `;
    const chunkResults = await executeQuery<any>(chunksSql, [id]);

    const row = docResults[0];
    const document: DocumentWithChunks = {
      document_id: row.DOCUMENT_ID,
      title: row.TITLE,
      filename: `${row.TITLE}.pdf`,
      category: row.CATEGORY,
      department: row.UPLOADED_BY || 'College Administration',
      source: 'TMSL Portal',
      content: row.RAW_CONTENT,
      chunk_count: chunkResults.length || 1,
      created_at: row.CREATED_AT ? String(row.CREATED_AT) : new Date().toISOString(),
      updated_at: row.CREATED_AT ? String(row.CREATED_AT) : new Date().toISOString(),
      chunks: chunkResults.map((c: any) => ({
        chunk_id: c.CHUNK_ID,
        chunk_index: c.CHUNK_INDEX,
        content: c.CHUNK_TEXT
      }))
    };

    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    console.error('Get Document Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Fetch failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const id = params.id;
    
    await executeQuery('DELETE FROM TMSL_AI.PUBLIC.DOCUMENT_CHUNKS WHERE DOCUMENT_ID = ?', [id]);
    await executeQuery('DELETE FROM TMSL_AI.PUBLIC.EVENTS WHERE DOCUMENT_ID = ?', [id]);
    await executeQuery('DELETE FROM TMSL_AI.PUBLIC.DOCUMENTS WHERE DOCUMENT_ID = ?', [id]);

    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    console.error('Delete Document Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Delete failed' }, { status: 500 });
  }
}
