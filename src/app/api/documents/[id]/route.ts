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

    if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
      return NextResponse.json({
        success: true,
        data: {
          document_id: id,
          title: 'Hack Days TMSL Kolkata 2026',
          filename: 'Hack_Days_TMSL_2026.pdf',
          category: 'hackathon',
          department: 'CSE / All Departments',
          source: 'College Notice Board',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          chunk_count: 2,
          chunks: [
            {
              chunk_id: 'chunk-1',
              chunk_index: 0,
              content: 'Notice: MLH Hack Days at TMSL is scheduled for September 10-11, 2026. Teams of 1-4 members can participate. Open to all engineering branches. Registration deadline is September 1st, 2026. Cash prizes, cloud credits, and certificate of participation included.'
            },
            {
              chunk_id: 'chunk-2',
              chunk_index: 1,
              content: 'Hackathon tracks include AI & Machine Learning with Snowflake Cortex, Web3 Decentralized Apps, HealthTech, and Open Innovation. Mentors from Major League Hacking and Snowflake community will be on site.'
            }
          ]
        }
      });
    }

    const docSql = `
      SELECT * FROM DOCUMENTS WHERE DOCUMENT_ID = ?
    `;
    const docResults = await executeQuery<any>(docSql, [id]);
    
    if (docResults.length === 0) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const chunksSql = `
      SELECT CHUNK_ID, CHUNK_INDEX, CONTENT 
      FROM DOCUMENT_CHUNKS 
      WHERE DOCUMENT_ID = ? 
      ORDER BY CHUNK_INDEX ASC
    `;
    const chunkResults = await executeQuery<any>(chunksSql, [id]);

    const row = docResults[0];
    const document: DocumentWithChunks = {
      document_id: row.DOCUMENT_ID,
      title: row.TITLE,
      filename: row.FILENAME,
      category: row.CATEGORY,
      department: row.DEPARTMENT,
      source: row.SOURCE,
      chunk_count: chunkResults.length,
      created_at: row.CREATED_AT,
      updated_at: row.UPDATED_AT,
      chunks: chunkResults.map(c => ({
        chunk_id: c.CHUNK_ID,
        chunk_index: c.CHUNK_INDEX,
        content: c.CONTENT
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
    
    if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
      return NextResponse.json({ success: true, data: null });
    }

    // Delete query sources associated with chunks of this doc
    await executeQuery(`
      DELETE FROM QUERY_SOURCES 
      WHERE CHUNK_ID IN (SELECT CHUNK_ID FROM DOCUMENT_CHUNKS WHERE DOCUMENT_ID = ?)
    `, [id]);

    await executeQuery('DELETE FROM EVENTS WHERE DOCUMENT_ID = ?', [id]);
    await executeQuery('DELETE FROM DOCUMENT_CHUNKS WHERE DOCUMENT_ID = ?', [id]);
    await executeQuery('DELETE FROM DOCUMENTS WHERE DOCUMENT_ID = ?', [id]);

    return NextResponse.json({ success: true, data: null });
  } catch (error: any) {
    console.error('Delete Document Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Delete failed' }, { status: 500 });
  }
}
