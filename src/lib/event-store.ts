import { EventData } from './types';

// Fallback in-memory event registry to guarantee data persistence in demo/dev mode
let inMemoryEvents: EventData[] = [
  {
    event_id: 'evt-001',
    document_id: 'doc-001',
    title: 'MLH Hack Days Landed TMSL Kolkata',
    description: 'Teams of 1-4 members can participate. Open to all branches. Prizes include cash awards, Snowflake cloud credits, and recruitment opportunities.',
    event_date: '2026-09-10T09:00:00.000Z',
    registration_deadline: '2026-09-01T23:59:59.000Z',
    location: 'TMSL Campus Auditorium',
    organizer: 'TMSL ACM Chapter & MLH',
    eligibility: 'All Students & Departments',
    category: 'hackathon',
  },
  {
    event_id: 'evt-002',
    document_id: 'doc-002',
    title: 'AI/ML Workshop Series — Snowflake Cortex & RAG',
    description: '5-day hands-on workshop on AI/ML fundamentals and Snowflake Cortex LLM & Vector Search. Conducted by Prof. Sharma and industry experts.',
    event_date: '2026-09-15T10:00:00.000Z',
    registration_deadline: '2026-09-12T18:00:00.000Z',
    location: 'Lab 402, CSE Department',
    organizer: 'CSE Department',
    eligibility: '2nd, 3rd, and 4th year students',
    category: 'workshop',
  },
  {
    event_id: 'evt-003',
    document_id: 'doc-003',
    title: 'Mid-Semester Examinations — Autumn 2026',
    description: 'Mid-semester examinations for all UG and PG departments. Exam slots A (10AM-12PM) and B (2PM-4PM). Digital admit cards required.',
    event_date: '2026-10-05T10:00:00.000Z',
    registration_deadline: undefined,
    location: 'Main Examination Block',
    organizer: 'Examination Committee',
    eligibility: 'Enrolled TMSL Students',
    category: 'exam',
  },
  {
    event_id: 'evt-004',
    document_id: 'doc-004',
    title: 'TechnoVit 2026 — Annual Tech Fest',
    description: 'Annual college technological extravaganza featuring RoboWars, Speed Debugging, Web3 & AI Hackathon, and keynote tech talks.',
    event_date: '2026-10-20T09:30:00.000Z',
    registration_deadline: '2026-10-15T23:59:59.000Z',
    location: 'Main College Grounds & Labs',
    organizer: 'Techno Student Union',
    eligibility: 'Open to all college students',
    category: 'event',
  },
  {
    event_id: 'evt-005',
    document_id: 'doc-005',
    title: 'TCS & Infosys Campus Placement Drive',
    description: 'Campus recruitment and summer internship drive. Min 60% aggregate with no active backlogs. Roles: System Engineer & AI Research Intern.',
    event_date: '2026-11-05T09:00:00.000Z',
    registration_deadline: '2026-10-25T17:00:00.000Z',
    location: 'Training & Placement Cell',
    organizer: 'T&P Cell',
    eligibility: 'Final Year Students (Min 60%)',
    category: 'career',
  }
];

export function getInMemoryEvents(): EventData[] {
  return inMemoryEvents;
}

export function addInMemoryEvent(evt: EventData): void {
  inMemoryEvents.unshift(evt);
}

export function deleteInMemoryEvent(id: string): void {
  inMemoryEvents = inMemoryEvents.filter(e => e.event_id !== id);
}
