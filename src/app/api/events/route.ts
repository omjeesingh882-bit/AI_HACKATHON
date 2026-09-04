import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, EventData, CreateEventRequest } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { getInMemoryEvents, addInMemoryEvent } from '@/lib/event-store';

function parseDateValue(val: any): string {
  if (!val) return '';
  if (val instanceof Date) return val.toISOString();
  if (typeof val.toJSON === 'function') return val.toJSON();
  const d = new Date(val);
  return isNaN(d.getTime()) ? String(val) : d.toISOString();
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<EventData[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';

    let dbEvents: EventData[] = [];

    try {
      let sql = 'SELECT * FROM TMSL_AI.PUBLIC.EVENTS WHERE 1=1';
      const binds: any[] = [];

      if (category && category.toLowerCase() !== 'all') {
        const catClean = category.toLowerCase().replace(/s$/, '');
        sql += ' AND (LOWER(EVENT_TYPE) LIKE ? OR LOWER(EVENT_TYPE) = ?)';
        binds.push(`%${catClean}%`, category.toLowerCase());
      }

      if (upcoming) {
        sql += ' AND (START_DATE >= CURRENT_TIMESTAMP() OR REGISTRATION_DEADLINE >= CURRENT_TIMESTAMP() OR START_DATE IS NULL)';
      }

      sql += ' ORDER BY START_DATE ASC';

      const results = await executeQuery<any>(sql, binds);
      if (results && results.length > 0) {
        dbEvents = results.map(row => ({
          event_id: row.EVENT_ID,
          document_id: row.DOCUMENT_ID || '',
          title: row.EVENT_NAME,
          description: row.DETAILS || '',
          event_date: parseDateValue(row.START_DATE),
          registration_deadline: row.REGISTRATION_DEADLINE ? parseDateValue(row.REGISTRATION_DEADLINE) : undefined,
          location: row.LOCATION || 'TMSL Campus',
          organizer: row.ORGANIZER || 'College Administration',
          eligibility: row.ELIGIBILITY || 'All Students',
          category: row.EVENT_TYPE || 'Event'
        }));
      }
    } catch (e) {
      console.warn('Snowflake events query fallback:', e);
    }

    // Merge Snowflake events and inMemory events (avoiding duplicate IDs)
    const combinedMap = new Map<string, EventData>();
    
    // Add in-memory events first
    for (const evt of getInMemoryEvents()) {
      combinedMap.set(evt.event_id, evt);
    }
    // Add DB events
    for (const evt of dbEvents) {
      combinedMap.set(evt.event_id, evt);
    }

    let events = Array.from(combinedMap.values());

    if (category && category.toLowerCase() !== 'all') {
      const catClean = category.toLowerCase().replace(/s$/, '');
      events = events.filter(e => 
        e.category.toLowerCase().includes(catClean) || 
        e.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (upcoming) {
      const now = new Date().getTime();
      events = events.filter(e => {
        if (!e.event_date && !e.registration_deadline) return true;
        const eventTime = e.event_date ? new Date(e.event_date).getTime() : 0;
        const deadlineTime = e.registration_deadline ? new Date(e.registration_deadline).getTime() : 0;
        return eventTime >= now || deadlineTime >= now;
      });
    }

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Fetch Events Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Fetch events failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<EventData>>> {
  try {
    const body: CreateEventRequest = await req.json();
    const {
      title,
      description,
      category = 'event',
      event_date,
      registration_deadline,
      location = 'TMSL Campus',
      organizer = 'College Administration',
      eligibility = 'All Students'
    } = body;

    if (!title || !event_date) {
      return NextResponse.json(
        { success: false, error: 'Event title and event date are required' },
        { status: 400 }
      );
    }

    const eventId = `evt-${uuidv4().slice(0, 8)}`;
    const documentId = `doc-evt-${uuidv4().slice(0, 8)}`;

    const newEvent: EventData = {
      event_id: eventId,
      document_id: documentId,
      title: title.trim(),
      description: description?.trim() || '',
      category: category.trim().toLowerCase(),
      event_date: new Date(event_date).toISOString(),
      registration_deadline: registration_deadline ? new Date(registration_deadline).toISOString() : undefined,
      location: location.trim(),
      organizer: organizer.trim(),
      eligibility: eligibility.trim()
    };

    // Save to in-memory fallback
    addInMemoryEvent(newEvent);

    // Try inserting into Snowflake EVENTS table
    try {
      const insertEventSql = `
        INSERT INTO TMSL_AI.PUBLIC.EVENTS 
        (EVENT_ID, DOCUMENT_ID, EVENT_NAME, EVENT_TYPE, START_DATE, REGISTRATION_DEADLINE, LOCATION, ORGANIZER, ELIGIBILITY, DETAILS)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await executeQuery(insertEventSql, [
        eventId,
        documentId,
        newEvent.title,
        newEvent.category,
        newEvent.event_date,
        newEvent.registration_deadline || null,
        newEvent.location,
        newEvent.organizer,
        newEvent.eligibility,
        newEvent.description
      ]);
    } catch (e) {
      console.warn('Snowflake insert event fallback handled:', e);
    }

    return NextResponse.json({
      success: true,
      data: newEvent
    });
  } catch (error: any) {
    console.error('Create Event Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create event' },
      { status: 500 }
    );
  }
}
