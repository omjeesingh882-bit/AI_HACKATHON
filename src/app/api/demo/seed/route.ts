import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse<{ count: number }>>> {
  try {
    const docs = [
      {
        id: uuidv4(),
        title: "Hack Days TMSL Kolkata 2026",
        category: "hackathon",
        text: "Notice: MLH Hack Days at TMSL is coming up! Dates: Sept 10-11, 2026. Teams of 1-4 members can participate. Open to all branches. Registration deadline is Sept 1st. Prizes include cash awards, Snowflake cloud credits, and recruitment opportunities with top sponsor organizations. Food, beverages, and hacking spaces provided for 36 hours.",
        events: [{
          title: "MLH Hack Days Landed TMSL Kolkata", date: "2026-09-10", deadline: "2026-09-01", location: "TMSL Campus Auditorium", organizer: "TMSL ACM Chapter & MLH"
        }]
      },
      {
        id: uuidv4(),
        title: "AI/ML Workshop Series — Snowflake Cortex & RAG",
        category: "workshop",
        text: "The CSE department is organizing a comprehensive 5-day hands-on workshop on AI/ML fundamentals and Snowflake Cortex LLM & Vector Search from Sept 15-19, 2026. Conducted by Prof. Sharma and industry experts. Open to 2nd, 3rd, and 4th year students across all engineering streams. Certificates will be awarded upon project completion.",
        events: [{
          title: "AI/ML Workshop Series", date: "2026-09-15", deadline: "2026-09-12", location: "Lab 402, CSE Department", organizer: "CSE Department"
        }]
      },
      {
        id: uuidv4(),
        title: "Mid-Semester Examination Schedule — Autumn 2026",
        category: "exam",
        text: "The mid-semester examinations for all undergraduate and postgraduate departments will commence from Oct 5, 2026 and conclude on Oct 15, 2026. Exam slots are Slot A: 10:00 AM - 12:00 PM and Slot B: 2:00 PM - 4:00 PM. Digital admit cards will be downloadable via the student ERP portal starting Oct 1. Mandatory 75% attendance rule applies.",
        events: [{
          title: "Mid-Semester Examinations", date: "2026-10-05", deadline: null, location: "Main Examination Block", organizer: "Examination Committee"
        }]
      },
      {
        id: uuidv4(),
        title: "TechnoVit 2026 — Annual Tech Fest",
        category: "event",
        text: "Join us for TechnoVit 2026, the annual college technological extravaganza! Dates: Oct 20-22, 2026. Highlights include RoboWars, Speed Debugging, Web3 & AI Hackathon, Paper Presentations, and Guest Lectures from Silicon Valley tech leads. Registration is open to college and university students nationwide.",
        events: [{
          title: "TechnoVit 2026 Annual Tech Fest", date: "2026-10-20", deadline: "2026-10-15", location: "Main College Grounds & Labs", organizer: "Techno Student Union"
        }]
      },
      {
        id: uuidv4(),
        title: "Campus Internship & Placement Drive — TCS & Infosys",
        category: "career",
        text: "Campus placement and summer internship drive by Tata Consultancy Services (TCS) and Infosys. Drive Date: Nov 5, 2026. Eligibility criteria: Minimum 60% aggregate across all semesters with no active backlogs. Roles offered: System Engineer, Digital Associate, and AI Research Intern. Pre-placement talks will be held on Nov 3 in the Seminar Hall.",
        events: [{
          title: "TCS & Infosys Campus Placement Drive", date: "2026-11-05", deadline: "2026-10-25", location: "Training & Placement Cell", organizer: "T&P Cell"
        }]
      },
      {
        id: uuidv4(),
        title: "College Code of Conduct & Academic Guidelines",
        category: "notice",
        text: "All registered students must visibly display their college identity cards inside campus premises at all times. Minimum 75% attendance in theory and laboratory subjects is strictly mandatory to appear for semester examinations. Anti-ragging policy is strictly enforced with zero tolerance. Library working hours are 8:00 AM to 8:00 PM on all weekdays.",
        events: []
      }
    ];

    let count = 0;
    
    if (process.env.DEMO_MODE !== 'true' || process.env.SNOWFLAKE_ACCOUNT) {
      for (const doc of docs) {
        const insertDocSql = `
          INSERT INTO DOCUMENTS (DOCUMENT_ID, TITLE, FILENAME, CATEGORY, DEPARTMENT, SOURCE, FULL_TEXT)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await executeQuery(insertDocSql, [doc.id, doc.title, `${doc.title}.txt`, doc.category, 'General', 'College Administration', doc.text]);
        
        const chunkId = uuidv4();
        const insertChunkSql = `
          INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
          SELECT ?, ?, ?, ?, SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', ?)
        `;
        await executeQuery(insertChunkSql, [chunkId, doc.id, 0, doc.text, doc.text]);
        
        for (const evt of doc.events) {
          const insertEventSql = `
            INSERT INTO EVENTS (EVENT_ID, DOCUMENT_ID, TITLE, DESCRIPTION, EVENT_DATE, REGISTRATION_DEADLINE, LOCATION, ORGANIZER, ELIGIBILITY, CATEGORY)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
          await executeQuery(insertEventSql, [
            uuidv4(), doc.id, evt.title, doc.text, evt.date, evt.deadline, evt.location, evt.organizer || 'TMSL', 'Open to eligible students', doc.category
          ]);
        }
        count++;
      }
    } else {
      count = docs.length;
    }

    return NextResponse.json({ success: true, data: { count } });
  } catch (error: any) {
    console.error('Seed Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Seed failed' }, { status: 500 });
  }
}
