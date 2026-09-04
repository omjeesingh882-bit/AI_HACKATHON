export type DocumentCategory = 'notice' | 'event' | 'hackathon' | 'workshop' | 'academic' | 'club' | 'career' | 'exam' | 'syllabus' | 'department' | 'general';

export const DOCUMENT_CATEGORIES: { value: DocumentCategory; label: string }[] = [
  { value: 'notice', label: 'Notice' },
  { value: 'event', label: 'Event' },
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'academic', label: 'Academic' },
  { value: 'club', label: 'Club' },
  { value: 'career', label: 'Career' },
  { value: 'exam', label: 'Exam' },
  { value: 'syllabus', label: 'Syllabus' },
  { value: 'department', label: 'Department' },
  { value: 'general', label: 'General' },
];

export interface Document {
  document_id: string;
  title: string;
  filename: string;
  category: DocumentCategory;
  department: string;
  source: string;
  content?: string;
  chunk_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  chunk_id: string;
  document_id: string;
  chunk_index: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: QuerySource[];
  timestamp: string;
}

export interface QuerySource {
  chunk_id: string;
  document_id: string;
  document_title: string;
  content: string;
  relevance_score: number;
  chunk_index: number;
}

export interface QueryRecord {
  query_id: string;
  question: string;
  answer: string;
  sources: QuerySource[];
  created_at: string;
}

export interface EventData {
  event_id: string;
  document_id: string;
  title: string;
  description: string;
  event_date: string;
  registration_deadline?: string;
  location: string;
  organizer: string;
  eligibility: string;
  category: string;
}

export interface SearchResult {
  chunk_id: string;
  document_id: string;
  document_title: string;
  content: string;
  category: string;
  relevance_score: number;
  created_at: string;
}

export interface AnalyticsData {
  total_documents: number;
  total_chunks: number;
  total_queries: number;
  recent_queries: { question: string; created_at: string }[];
  popular_categories: { category: string; count: number }[];
  queries_by_day: { date: string; count: number }[];
  top_documents: { title: string; query_count: number }[];
}

export interface DocumentSummary {
  short_summary: string;
  key_points: string[];
  important_dates: string[];
  eligibility: string;
  required_actions: string[];
  contact_info: string;
}

export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  rollNumber?: string;
  year?: string;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  event_date: string;
  registration_deadline?: string;
  location: string;
  organizer: string;
  eligibility: string;
}

export interface TeamMember {
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  department?: string;
}

export interface EventRegistration {
  registration_id: string;
  event_id: string;
  event_title: string;
  student_id: string;
  full_name: string;
  roll_number: string;
  department: string;
  phone_number: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  participation_type: 'individual' | 'group';
  group_name?: string;
  team_members?: TeamMember[];
  registered_at: string;
}

export interface CreateEventRegistrationRequest {
  event_id: string;
  full_name: string;
  roll_number: string;
  department: string;
  phone_number: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  participation_type: 'individual' | 'group';
  group_name?: string;
  team_members?: TeamMember[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}