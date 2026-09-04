import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/document-processor';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, Document } from '@/lib/types';
import { addInMemoryDocument } from '@/lib/document-store';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Document>>> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null) || (file ? file.name : 'Untitled');
    const category = (formData.get('category') as string | null) || 'general';
    const department = (formData.get('department') as string | null) || 'Administration';

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const { documentId, chunks, fullText } = await processDocument(file, { title, category, department, source: 'Upload' });

    // 1. Insert into DOCUMENTS
    try {
      const insertDocSql = `
        INSERT INTO TMSL_AI.PUBLIC.DOCUMENTS (DOCUMENT_ID, TITLE, CATEGORY, RAW_CONTENT, CHUNK_COUNT, UPLOADED_BY)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      await executeQuery(insertDocSql, [documentId, title, category, fullText, chunks.length, department]);

      // 2. Insert into DOCUMENT_CHUNKS
      for (const chunk of chunks) {
        const insertChunkSql = `
          INSERT INTO TMSL_AI.PUBLIC.DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, DOCUMENT_TITLE, CATEGORY, CHUNK_INDEX, CHUNK_TEXT)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await executeQuery(insertChunkSql, [
          chunk.chunkId, 
          documentId, 
          title, 
          category, 
          chunk.chunkIndex, 
          chunk.content
        ]);
      }
    } catch (e) {
      console.warn('Snowflake upload insert fallback handled:', e);
    }

    const newDoc: Document = {
      document_id: documentId,
      title,
      filename: file.name,
      category: category as any,
      department,
      source: 'Admin Upload',
      content: fullText,
      chunk_count: chunks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Register in memory fallback so all students immediately see it
    addInMemoryDocument(newDoc);

    return NextResponse.json({ success: true, data: newDoc });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
