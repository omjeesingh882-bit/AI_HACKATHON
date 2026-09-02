import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, EventData } from '@/lib/types';

function parseDateValue(val: any): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  if (typeof val.toJSON === 'function') return val.toJSON();
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toISOString();
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<EventData[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';

    let sql = 'SELECT * FROM TMSL_AI.PUBLIC.EVENTS WHERE 1=1';
    const binds: any[] = [];

    if (category && category.toLowerCase() !== 'all') {
      // Handle plural e.g. "hackathons" -> match "hackathon" or "hackathons"
      const catClean = category.toLowerCase().replace(/s$/, '');
      sql += ' AND (LOWER(EVENT_TYPE) LIKE ? OR LOWER(EVENT_TYPE) = ?)';
      binds.push(`%${catClean}%`, category.toLowerCase());
    }

    if (upcoming) {
      sql += ' AND (START_DATE >= CURRENT_TIMESTAMP() OR REGISTRATION_DEADLINE >= CURRENT_TIMESTAMP() OR START_DATE IS NULL)';
    }

    sql += ' ORDER BY START_DATE ASC';

    const results = await executeQuery<any>(sql, binds);
    
    const events: EventData[] = results.map(row => ({
      event_id: row.EVENT_ID,
      document_id: row.DOCUMENT_ID,
      title: row.EVENT_NAME,
      description: row.DETAILS || '',
      event_date: parseDateValue(row.START_DATE),
      registration_deadline: row.REGISTRATION_DEADLINE ? parseDateValue(row.REGISTRATION_DEADLINE) : undefined,
      location: row.LOCATION || 'TMSL Campus',
      organizer: row.ORGANIZER || 'College Administration',
      eligibility: row.ELIGIBILITY || 'All Students',
      category: row.EVENT_TYPE || 'Event'
    }));

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Fetch Events Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Fetch events failed' }, { status: 500 });
  }
}
