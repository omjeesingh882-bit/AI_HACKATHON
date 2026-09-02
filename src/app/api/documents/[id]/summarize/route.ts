import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { summarizeDocument } from '@/lib/snowflake-ai';
import { ApiResponse, DocumentSummary } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse<ApiResponse<DocumentSummary>>> {
  try {
    const id = params.id;

    // Check if document exists in Snowflake
    const docRows = await executeQuery<{ RAW_CONTENT: string }>(
      'SELECT RAW_CONTENT FROM TMSL_AI.PUBLIC.DOCUMENTS WHERE DOCUMENT_ID = ?', 
      [id]
    );

    if (docRows.length === 0) {
      return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });
    }

    const fullText = docRows[0].RAW_CONTENT || '';
    const summary = await summarizeDocument(fullText);

    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    console.error('Summarize Document Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Summarization failed' }, { status: 500 });
  }
}
