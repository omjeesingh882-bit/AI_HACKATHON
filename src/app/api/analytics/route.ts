import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, AnalyticsData } from '@/lib/types';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<AnalyticsData>>> {
  try {
    if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
      return NextResponse.json({
        success: true,
        data: {
          total_documents: 6,
          total_chunks: 18,
          total_queries: 42,
          recent_queries: [
            { question: 'When is Hack Days TMSL Kolkata 2026?', created_at: new Date().toISOString() },
            { question: 'What is the schedule for mid-semester exams?', created_at: new Date(Date.now() - 3600000).toISOString() },
            { question: 'Who can attend the AI/ML workshop?', created_at: new Date(Date.now() - 7200000).toISOString() }
          ],
          popular_categories: [
            { category: 'hackathon', count: 1 },
            { category: 'workshop', count: 1 },
            { category: 'exam', count: 1 },
            { category: 'event', count: 1 },
            { category: 'career', count: 1 },
            { category: 'notice', count: 1 }
          ],
          queries_by_day: [
            { date: '2026-08-28', count: 8 },
            { date: '2026-08-29', count: 12 },
            { date: '2026-08-30', count: 15 },
            { date: '2026-08-31', count: 22 },
            { date: '2026-09-01', count: 35 },
            { date: '2026-09-02', count: 42 }
          ],
          top_documents: [
            { title: 'Hack Days TMSL Kolkata 2026', query_count: 18 },
            { title: 'Mid-Semester Examination Schedule', query_count: 14 },
            { title: 'AI/ML Workshop Series', query_count: 10 }
          ]
        }
      });
    }

    const [docsRes] = await executeQuery<{ COUNT: number }>('SELECT COUNT(*) AS COUNT FROM DOCUMENTS');
    const [chunksRes] = await executeQuery<{ COUNT: number }>('SELECT COUNT(*) AS COUNT FROM DOCUMENT_CHUNKS');
    const [queriesRes] = await executeQuery<{ COUNT: number }>('SELECT COUNT(*) AS COUNT FROM QUERIES');
    
    const recentQueries = await executeQuery<{ QUESTION: string, CREATED_AT: string }>(
      'SELECT QUESTION, CREATED_AT FROM QUERIES ORDER BY CREATED_AT DESC LIMIT 10'
    );
    
    const popularCategories = await executeQuery<{ CATEGORY: string, COUNT: number }>(
      'SELECT CATEGORY, COUNT(*) as COUNT FROM DOCUMENTS GROUP BY CATEGORY ORDER BY COUNT DESC LIMIT 5'
    );
    
    const queriesByDay = await executeQuery<{ DATE: string, COUNT: number }>(
      `SELECT TO_DATE(CREATED_AT) as DATE, COUNT(*) as COUNT 
       FROM QUERIES 
       WHERE CREATED_AT >= DATEADD(day, -30, CURRENT_DATE()) 
       GROUP BY TO_DATE(CREATED_AT) 
       ORDER BY DATE ASC`
    );
    
    const topDocuments = await executeQuery<{ TITLE: string, QUERY_COUNT: number }>(
      `SELECT d.TITLE, COUNT(qs.QUERY_ID) as QUERY_COUNT 
       FROM DOCUMENTS d 
       JOIN DOCUMENT_CHUNKS c ON d.DOCUMENT_ID = c.DOCUMENT_ID
       JOIN QUERY_SOURCES qs ON c.CHUNK_ID = qs.CHUNK_ID 
       GROUP BY d.TITLE 
       ORDER BY QUERY_COUNT DESC LIMIT 5`
    );

    const data: AnalyticsData = {
      total_documents: docsRes?.COUNT || 0,
      total_chunks: chunksRes?.COUNT || 0,
      total_queries: queriesRes?.COUNT || 0,
      recent_queries: recentQueries.map(q => ({ question: q.QUESTION, created_at: q.CREATED_AT })),
      popular_categories: popularCategories.map(c => ({ category: c.CATEGORY, count: c.COUNT })),
      queries_by_day: queriesByDay.map(q => ({ date: String(q.DATE), count: q.COUNT })),
      top_documents: topDocuments.map(d => ({ title: d.TITLE, query_count: d.QUERY_COUNT }))
    };

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Analytics fetch failed' }, { status: 500 });
  }
}
