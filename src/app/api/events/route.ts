import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, EventData } from '@/lib/types';

const DEMO_EVENTS: EventData[] = [
  {
    event_id: 'evt-001',
    document_id: 'doc-001',
    title: 'MLH Hack Days Landed TMSL Kolkata',
    description: '36-hour in-person hackathon with Snowflake Cortex AI challenges, tracks in Web3 & HealthTech, and prizes for top college innovators.',
    event_date: '2026-09-10',
    registration_deadline: '2026-09-01',
    location: 'TMSL Campus Auditorium',
    organizer: 'TMSL ACM Chapter & MLH',
    eligibility: 'Teams of 1-4 members across all branches',
    category: 'hackathon'
  },
  {
    event_id: 'evt-002',
    document_id: 'doc-002',
    title: 'AI/ML Workshop Series — Snowflake Cortex & RAG',
    description: 'Hands-on 5-day workshop exploring vector embeddings, similarity search, and generative LLMs directly within Snowflake.',
    event_date: '2026-09-15',
    registration_deadline: '2026-09-12',
    location: 'Lab 402, CSE Department',
    organizer: 'Department of Computer Science',
    eligibility: '2nd, 3rd, and 4th year students',
    category: 'workshop'
  },
  {
    event_id: 'evt-003',
    document_id: 'doc-003',
    title: 'Mid-Semester Examinations — Autumn 2026',
    description: 'Official mid-semester examinations across all departments. Slot A: 10:00 AM - 12:00 PM, Slot B: 2:00 PM - 4:00 PM.',
    event_date: '2026-10-05',
    location: 'Main Examination Block',
    organizer: 'Examination Cell',
    eligibility: 'Students with minimum 75% attendance',
    category: 'academic'
  },
  {
    event_id: 'evt-004',
    document_id: 'doc-004',
    title: 'TechnoVit 2026 — Annual Tech Fest',
    description: 'Annual college tech fest featuring RoboWars, Coding Battles, Project Exhibitions, and tech talks from industry leaders.',
    event_date: '2026-10-20',
    registration_deadline: '2026-10-15',
    location: 'Main Campus Grounds & Labs',
    organizer: 'Techno Student Union',
    eligibility: 'Open to college and university students',
    category: 'event'
  },
  {
    event_id: 'evt-005',
    document_id: 'doc-005',
    title: 'Campus Placement & Internship Drive — TCS & Infosys',
    description: 'Pre-placement talks, technical assessments, and interviews for final and pre-final year engineering students.',
    event_date: '2026-11-05',
    registration_deadline: '2026-10-25',
    location: 'Training & Placement Cell',
    organizer: 'T&P Cell',
    eligibility: 'Min 60% aggregate across semesters with 0 active backlogs',
    category: 'career'
  }
];

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<EventData[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const upcoming = searchParams.get('upcoming') === 'true';

    if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
      let events = [...DEMO_EVENTS];
      if (category && category.toLowerCase() !== 'all') {
        events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
      }
      if (upcoming) {
        const today = new Date().toISOString().split('T')[0];
        events = events.filter(e => e.event_date >= today);
      }
      return NextResponse.json({ success: true, data: events });
    }

    let sql = 'SELECT * FROM EVENTS WHERE 1=1';
    const binds: any[] = [];

    if (category && category.toLowerCase() !== 'all') {
      sql += ' AND LOWER(CATEGORY) = LOWER(?)';
      binds.push(category);
    }

    if (upcoming) {
      sql += ' AND EVENT_DATE >= CURRENT_DATE()';
    }

    sql += ' ORDER BY EVENT_DATE ASC';

    const results = await executeQuery<any>(sql, binds);
    
    const events = results.map(row => ({
      event_id: row.EVENT_ID,
      document_id: row.DOCUMENT_ID,
      title: row.TITLE,
      description: row.DESCRIPTION,
      event_date: row.EVENT_DATE,
      registration_deadline: row.REGISTRATION_DEADLINE,
      location: row.LOCATION,
      organizer: row.ORGANIZER,
      eligibility: row.ELIGIBILITY,
      category: row.CATEGORY
    }));

    return NextResponse.json({ success: true, data: events });
  } catch (error: any) {
    console.error('Fetch Events Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Fetch events failed' }, { status: 500 });
  }
}
