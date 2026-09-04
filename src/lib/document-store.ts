import { Document } from './types';

// Seed initial documents so knowledge base always has rich data
const initialDocs: Document[] = [
  {
    document_id: 'doc-001',
    title: 'Hack Days TMSL Kolkata 2026 Guidelines',
    filename: 'Hack_Days_TMSL_Kolkata_2026.pdf',
    category: 'hackathon',
    department: 'CSE Department',
    source: 'TMSL Admin Portal',
    content: 'Official Notice: MLH Hack Days at TMSL Kolkata is scheduled for Sept 10-11, 2026. Teams of 1-4 members can participate. Open to all engineering branches. Registration deadline is Sept 1st. Prizes include cash awards, Snowflake cloud credits, and recruitment opportunities. Food, beverages, and 36-hour workspace provided.',
    chunk_count: 2,
    created_at: new Date('2026-08-20T10:00:00.000Z').toISOString(),
    updated_at: new Date('2026-08-20T10:00:00.000Z').toISOString(),
  },
  {
    document_id: 'doc-002',
    title: 'AI/ML Workshop Series — Snowflake Cortex & RAG',
    filename: 'AIML_Workshop_Curriculum.pdf',
    category: 'workshop',
    department: 'CSE Department',
    source: 'TMSL Admin Portal',
    content: 'The CSE department is organizing a comprehensive 5-day hands-on workshop on AI/ML fundamentals and Snowflake Cortex LLM & Vector Search from Sept 15-19, 2026. Conducted by Prof. Sharma and industry experts. Open to 2nd, 3rd, and 4th year students across all engineering streams. Certificates will be awarded upon project completion.',
    chunk_count: 2,
    created_at: new Date('2026-08-22T14:30:00.000Z').toISOString(),
    updated_at: new Date('2026-08-22T14:30:00.000Z').toISOString(),
  },
  {
    document_id: 'doc-003',
    title: 'Mid-Semester Examination Schedule — Autumn 2026',
    filename: 'MidSem_Exam_Schedule_Autumn2026.pdf',
    category: 'exam',
    department: 'Examination Committee',
    source: 'TMSL Admin Portal',
    content: 'The mid-semester examinations for all undergraduate and postgraduate departments will commence from Oct 5, 2026 and conclude on Oct 15, 2026. Exam slots are Slot A: 10:00 AM - 12:00 PM and Slot B: 2:00 PM - 4:00 PM. Digital admit cards will be downloadable via the student portal starting Oct 1. Mandatory 75% attendance rule applies.',
    chunk_count: 3,
    created_at: new Date('2026-08-25T09:00:00.000Z').toISOString(),
    updated_at: new Date('2026-08-25T09:00:00.000Z').toISOString(),
  },
  {
    document_id: 'doc-004',
    title: 'TechnoVit 2026 — Annual Tech Fest Brochure',
    filename: 'TechnoVit_2026_Brochure.pdf',
    category: 'event',
    department: 'Student Affairs',
    source: 'TMSL Admin Portal',
    content: 'Join us for TechnoVit 2026, the annual college technological extravaganza! Dates: Oct 20-22, 2026. Highlights include RoboWars, Speed Debugging, Web3 & AI Hackathon, Paper Presentations, and Guest Lectures from Silicon Valley tech leads. Registration is open to college and university students nationwide.',
    chunk_count: 2,
    created_at: new Date('2026-08-26T11:00:00.000Z').toISOString(),
    updated_at: new Date('2026-08-26T11:00:00.000Z').toISOString(),
  },
  {
    document_id: 'doc-005',
    title: 'Campus Internship & Placement Drive — TCS & Infosys',
    filename: 'TCS_Infosys_Placement_Drive_2026.pdf',
    category: 'career',
    department: 'Training & Placement Cell',
    source: 'TMSL Admin Portal',
    content: 'Campus placement and summer internship drive by Tata Consultancy Services (TCS) and Infosys. Drive Date: Nov 5, 2026. Eligibility criteria: Minimum 60% aggregate across all semesters with no active backlogs. Roles offered: System Engineer, Digital Associate, and AI Research Intern. Pre-placement talks will be held on Nov 3 in the Seminar Hall.',
    chunk_count: 2,
    created_at: new Date('2026-08-28T16:00:00.000Z').toISOString(),
    updated_at: new Date('2026-08-28T16:00:00.000Z').toISOString(),
  },
  {
    document_id: 'doc-006',
    title: 'College Code of Conduct & Academic Regulations',
    filename: 'TMSL_Academic_Regulations_Handbook.pdf',
    category: 'notice',
    department: 'College Administration',
    source: 'TMSL Admin Portal',
    content: 'All registered students must visibly display their college identity cards inside campus premises at all times. Minimum 75% attendance in theory and laboratory subjects is strictly mandatory to appear for semester examinations. Anti-ragging policy is strictly enforced with zero tolerance. Library working hours are 8:00 AM to 8:00 PM on all weekdays.',
    chunk_count: 2,
    created_at: new Date('2026-08-29T10:00:00.000Z').toISOString(),
    updated_at: new Date('2026-08-29T10:00:00.000Z').toISOString(),
  }
];

let inMemoryDocuments: Document[] = [...initialDocs];

export function getInMemoryDocuments(): Document[] {
  return inMemoryDocuments;
}

export function addInMemoryDocument(doc: Document) {
  inMemoryDocuments.unshift(doc);
}

export function deleteInMemoryDocument(id: string) {
  inMemoryDocuments = inMemoryDocuments.filter(d => d.document_id !== id);
}
