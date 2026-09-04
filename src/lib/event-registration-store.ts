import { EventRegistration } from './types';
import { v4 as uuidv4 } from 'uuid';

// In-memory global store for event registrations
let inMemoryRegistrations: EventRegistration[] = [
  {
    registration_id: 'reg-001',
    event_id: 'evt-001',
    event_title: 'MLH Hack Days Landed TMSL Kolkata',
    student_id: 'student-seed-01',
    full_name: 'Rahul Sharma',
    roll_number: 'TMSL-2023-CSE-042',
    department: 'Computer Science & Engineering',
    phone_number: '+91 9876543210',
    gender: 'Male',
    email: 'rahul.sharma@tmsl.edu',
    participation_type: 'group',
    group_name: 'Alpha Coders',
    team_members: [
      {
        name: 'Priya Mukherjee',
        rollNumber: 'TMSL-2023-CSE-088',
        email: 'priya.m@tmsl.edu',
        phone: '+91 9876543211',
        department: 'Computer Science & Engineering'
      },
      {
        name: 'Sayan Das',
        rollNumber: 'TMSL-2023-IT-019',
        email: 'sayan.das@tmsl.edu',
        phone: '+91 9876543212',
        department: 'Information Technology'
      }
    ],
    registered_at: '2026-09-01T14:30:00.000Z'
  },
  {
    registration_id: 'reg-002',
    event_id: 'evt-001',
    event_title: 'MLH Hack Days Landed TMSL Kolkata',
    student_id: 'student-seed-02',
    full_name: 'Sneha Roy',
    roll_number: 'TMSL-2024-AIML-015',
    department: 'AI & Machine Learning',
    phone_number: '+91 9831234567',
    gender: 'Female',
    email: 'sneha.roy@tmsl.edu',
    participation_type: 'group',
    group_name: 'ByteBuilders',
    team_members: [
      {
        name: 'Aniket Gupta',
        rollNumber: 'TMSL-2024-AIML-022',
        email: 'aniket.g@tmsl.edu',
        phone: '+91 9831234568',
        department: 'AI & Machine Learning'
      }
    ],
    registered_at: '2026-09-02T11:15:00.000Z'
  },
  {
    registration_id: 'reg-003',
    event_id: 'evt-002',
    event_title: 'AI/ML Workshop Series — Snowflake Cortex & RAG',
    student_id: 'student-seed-03',
    full_name: 'Aarav Patel',
    roll_number: 'TMSL-2023-ECE-031',
    department: 'Electronics & Communication',
    phone_number: '+91 9712345678',
    gender: 'Male',
    email: 'aarav.patel@tmsl.edu',
    participation_type: 'individual',
    group_name: undefined,
    registered_at: '2026-09-03T09:45:00.000Z'
  }
];

export function getAllRegistrations(): EventRegistration[] {
  return inMemoryRegistrations;
}

export function getRegistrationsByEventId(eventId: string): EventRegistration[] {
  return inMemoryRegistrations.filter((r) => r.event_id === eventId);
}

export function getRegistrationsByStudentEmail(email: string): EventRegistration[] {
  const emailLower = email.trim().toLowerCase();
  return inMemoryRegistrations.filter(
    (r) =>
      r.email.toLowerCase() === emailLower ||
      (r.team_members && r.team_members.some((m) => m.email.toLowerCase() === emailLower))
  );
}

export function isStudentRegisteredForEvent(eventId: string, email: string): boolean {
  const emailLower = email.trim().toLowerCase();
  return inMemoryRegistrations.some(
    (r) =>
      r.event_id === eventId &&
      (r.email.toLowerCase() === emailLower ||
        (r.team_members && r.team_members.some((m) => m.email.toLowerCase() === emailLower)))
  );
}

export function addRegistration(data: Omit<EventRegistration, 'registration_id' | 'registered_at'>): EventRegistration {
  const newReg: EventRegistration = {
    ...data,
    registration_id: `reg-${uuidv4().slice(0, 8)}`,
    registered_at: new Date().toISOString()
  };

  // Remove existing registration if any for this student and event
  inMemoryRegistrations = inMemoryRegistrations.filter(
    (r) => !(r.event_id === newReg.event_id && r.email.toLowerCase() === newReg.email.toLowerCase())
  );

  inMemoryRegistrations.unshift(newReg);
  return newReg;
}

export function getGroupedRegistrationsByEventId(eventId: string): {
  groupName: string;
  isGroup: boolean;
  registrations: EventRegistration[];
}[] {
  const eventRegs = getRegistrationsByEventId(eventId);
  const groupsMap = new Map<string, EventRegistration[]>();

  for (const reg of eventRegs) {
    const key = reg.participation_type === 'group' && reg.group_name?.trim()
      ? `Group: ${reg.group_name.trim()}`
      : 'Individual Participants';

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    groupsMap.get(key)!.push(reg);
  }

  const result: { groupName: string; isGroup: boolean; registrations: EventRegistration[] }[] = [];
  groupsMap.forEach((registrations, groupName) => {
    result.push({
      groupName,
      isGroup: !groupName.startsWith('Individual'),
      registrations
    });
  });

  return result;
}
