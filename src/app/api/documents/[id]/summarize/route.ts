import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { summarizeDocument } from '@/lib/snowflake-ai';
import { ApiResponse, DocumentSummary } from '@/lib/types';

export async function POST(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse<ApiResponse<DocumentSummary>>> {
  try {
    const id = params.id;

    if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
      return NextResponse.json({
        success: true,
        data: {
          short_summary: 'MLH Hack Days Landed TMSL Kolkata is scheduled for September 10-11, 2026. Teams of 1-4 students across all branches can compete in AI, Web3, and Open Innovation tracks.',
          key_points: [
            'Event dates: September 10-11, 2026 (36-hour in-person hackathon)',
            'Teams of 1 to 4 members eligible across all years and branches',
            'Tracks include Snowflake Cortex AI challenge with dedicated prizes',
            'Full catering, hardware, and mentoring support provided'
          ],
          important_dates: [
            'Registration Deadline: September 1, 2026',
            'Hackathon Kickoff: September 10, 2026 at 10:00 AM'
          ],
          eligibility: 'All currently enrolled undergraduate and postgraduate students with valid college ID.',
          required_actions: [
            'Register team on student portal before Sept 1',
            'Join the TMSL Discord server for track announcements'
          ],
          contact_info: 'organizers@tmsl-hackdays.edu / Lab 402, CSE Dept'
        }
      });
    }
    
    const sql = `
      SELECT CONTENT 
      FROM DOCUMENT_CHUNKS 
      WHERE DOCUMENT_ID = ? 
      ORDER BY CHUNK_INDEX ASC
    `;
    
    const chunks = await executeQuery<{ CONTENT: string }>(sql, [id]);
    
    if (chunks.length === 0) {
      return NextResponse.json({ success: false, error: 'Document chunks not found' }, { status: 404 });
    }

    const fullText = chunks.map(c => c.CONTENT).join('\n\n');
    const summary = await summarizeDocument(fullText);

    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    console.error('Summarize Document Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Summarization failed' }, { status: 500 });
  }
}
