import { NextRequest, NextResponse } from 'next/server';
import { vectorSearch, generateAnswer } from '@/lib/snowflake-ai';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, QuerySource } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ answer: string; sources: QuerySource[] }>>> {
  try {
    const body = await req.json();
    const { question } = body;

    if (!question) {
      return NextResponse.json({ success: false, error: 'Question is required' }, { status: 400 });
    }

    const searchResults = await vectorSearch(question, 5);
    
    const context = searchResults.map((res, i) => `[Source ${i + 1}: ${res.document_title}]\n${res.content}`).join('\n\n');
    const sourcesInfo = searchResults.map(res => ({ title: res.document_title, content: res.content }));
    
    const answer = await generateAnswer(question, context, sourcesInfo);
    
    const queryId = uuidv4();
    const sources: QuerySource[] = searchResults.map(res => ({
      chunk_id: res.chunk_id,
      document_id: res.document_id,
      document_title: res.document_title,
      content: res.content,
      relevance_score: res.relevance_score,
      chunk_index: 0,
    }));

    if (process.env.DEMO_MODE !== 'true' || process.env.SNOWFLAKE_ACCOUNT) {
      const insertQuerySql = `INSERT INTO QUERIES (QUERY_ID, QUESTION, ANSWER) VALUES (?, ?, ?)`;
      await executeQuery(insertQuerySql, [queryId, question, answer]);
      
      for (const src of sources) {
        const insertSourceSql = `INSERT INTO QUERY_SOURCES (QUERY_ID, CHUNK_ID, RELEVANCE_SCORE) VALUES (?, ?, ?)`;
        await executeQuery(insertSourceSql, [queryId, src.chunk_id, src.relevance_score]);
      }
    }

    return NextResponse.json({ success: true, data: { answer, sources } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Chat query failed';
    console.error('Chat Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
