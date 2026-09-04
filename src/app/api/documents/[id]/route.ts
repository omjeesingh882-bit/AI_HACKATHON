import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, Document } from '@/lib/types';
import { getInMemoryDocuments, deleteInMemoryDocument } from '@/lib/document-store';

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

    let docResult: any = null;
    let chunkResults: any[] = [];

    try {
      const docSql = `SELECT * FROM TMSL_AI.PUBLIC.DOCUMENTS WHERE DOCUMENT_ID = ?`;
      const docResults = await executeQuery<any>(docSql, [id]);
      if (docResults && docResults.length > 0) {
        docResult = docResults[0];
      }

      const chunksSql = `
        SELECT CHUNK_ID, CHUNK_INDEX, CHUNK_TEXT 
        FROM TMSL_AI.PUBLIC.DOCUMENT_CHUNKS 
        WHERE DOCUMENT_ID = ? 
        ORDER BY CHUNK_INDEX ASC
      `;
      chunkResults = await executeQuery<any>(chunksSql, [id]);
    } catch (e) {
      console.warn('Snowflake get doc fallback:', e);
    }

    if (docResult) {
      const document: DocumentWithChunks = {
        document_id: docResult.DOCUMENT_ID,
        title: docResult.TITLE,
        filename: `${docResult.TITLE}.pdf`,
        category: docResult.CATEGORY,
        department: docResult.UPLOADED_BY || 'College Administration',
        source: 'TMSL Portal',
        content: docResult.RAW_CONTENT,
        chunk_count: chunkResults.length || 1,
        created_at: docResult.CREATED_AT ? String(docResult.CREATED_AT) : new Date().toISOString(),
        updated_at: docResult.CREATED_AT ? String(docResult.CREATED_AT) : new Date().toISOString(),
        chunks: chunkResults.map((c: any) => ({
          chunk_id: c.CHUNK_ID,
          chunk_index: c.CHUNK_INDEX,
          content: c.CHUNK_TEXT
        }))
      };
      return NextResponse.json({ success: true, data: document });
    }

    // Fallback in-memory check
    const memDoc = getInMemoryDocuments().find(d => d.document_id === id);
    if (memDoc) {
      const docWithChunks: DocumentWithChunks = {
        ...memDoc,
        chunks: [
          {
            chunk_id: `${memDoc.document_id}-c0`,
            chunk_index: 0,
            content: memDoc.content || memDoc.title
          }
        ]
      };
      return NextResponse.json({ success: true, data: docWithChunks });
    }

    return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
  } catch (error: any) {
    console.error('Get Document Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Fetch failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse<ApiResponse<null>>> {
  try {
    const id = params.id;
    
    deleteInMemoryDocument(id);

    try {
      await executeQuery('DELETE FROM TMSL_AI.PUBLIC.DOCUMENT_CHUNKS WHERE DOCUMENT_ID = ?', [id]);
      await executeQuery('DELETE FROM TMSL_AI.PUBLIC.EVENTS WHERE DOCUMENT_ID = ?', [id]);
      await executeQuery('DELETE FROM TMSL_AI.PUBLIC.DOCUMENTS WHERE DOCUMENT_ID = ?', [id]);
    } catch (e) {
      console.warn('Snowflake delete doc fallback:', e);
    }

    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    console.error('Delete Document Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Delete failed' }, { status: 500 });
  }
}
