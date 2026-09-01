import { NextRequest, NextResponse } from 'next/server';
import { processDocument } from '@/lib/document-processor';
import { extractEventsFromDocument } from '@/lib/event-extractor';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, Document } from '@/lib/types';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<Document>>> {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string | null) || (file ? file.name : 'Untitled');
    const category = (formData.get('category') as string | null) || 'general';
    const department = (formData.get('department') as string | null) || 'General';
    const source = (formData.get('source') as string | null) || 'Manual Upload';

    if (!file) {
      return NextResponse.json({ success: false, error: 'File is required' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }

    const { documentId, chunks, fullText } = await processDocument(file, { title, category, department, source });

    if (process.env.DEMO_MODE !== 'true' || process.env.SNOWFLAKE_ACCOUNT) {
      const insertDocSql = `
        INSERT INTO DOCUMENTS (DOCUMENT_ID, TITLE, FILENAME, CATEGORY, DEPARTMENT, SOURCE, FULL_TEXT)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await executeQuery(insertDocSql, [documentId, title, file.name, category, department, source, fullText]);

      for (const chunk of chunks) {
        const insertChunkSql = `
          INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
          SELECT ?, ?, ?, ?, SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', ?)
        `;
        await executeQuery(insertChunkSql, [chunk.chunkId, documentId, chunk.chunkIndex, chunk.content, chunk.content]);
      }

      try {
        const events = await extractEventsFromDocument(documentId, fullText);
        for (const event of events) {
          const insertEventSql = `
            INSERT INTO EVENTS (EVENT_ID, DOCUMENT_ID, TITLE, DESCRIPTION, EVENT_DATE, REGISTRATION_DEADLINE, LOCATION, ORGANIZER, ELIGIBILITY, CATEGORY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          await executeQuery(insertEventSql, [
            event.event_id, event.document_id, event.title, event.description, 
            event.event_date || null, event.registration_deadline || null, event.location, 
            event.organizer, event.eligibility, event.category
          ]);
        }
      } catch (evtErr) {
        console.warn('Event extraction skipped or failed:', evtErr);
      }
    }

    const newDoc: Document = {
      document_id: documentId,
      title,
      filename: file.name,
      category: category as any,
      department,
      source,
      chunk_count: chunks.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({ success: true, data: newDoc });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Upload failed' }, { status: 500 });
  }
}
