import { executeQuery } from './snowflake';
import { SearchResult, DocumentSummary, EventData } from './types';

const DEMO_KNOWLEDGE_CHUNKS: {
  chunk_id: string;
  document_id: string;
  document_title: string;
  content: string;
  category: string;
  keywords: string[];
}[] = [
  {
    chunk_id: 'chk-001',
    document_id: 'doc-001',
    document_title: 'Hack Days TMSL Kolkata 2026',
    content: 'Notice: MLH Hack Days Landed TMSL Kolkata is scheduled for September 10-11, 2026. Teams of 1-4 members can participate. Open to all engineering branches. Registration deadline is September 1st, 2026. Cash prizes, Snowflake cloud credits, and certificate of participation included.',
    category: 'hackathon',
    keywords: ['hackathon', 'mlh', 'hack', 'competition', 'september', 'teams', 'prize', 'registration', 'deadline', 'kolkata']
  },
  {
    chunk_id: 'chk-002',
    document_id: 'doc-001',
    document_title: 'Hack Days TMSL Kolkata 2026',
    content: 'Eligibility and requirements for MLH Hack Days TMSL: All currently enrolled college students with valid student ID are eligible. Bring laptops, chargers, and government/college ID for verification. Mentorship provided by Major League Hacking and Snowflake community.',
    category: 'hackathon',
    keywords: ['eligibility', 'requirements', 'rules', 'team', 'mentor', 'snowflake', 'laptop']
  },
  {
    chunk_id: 'chk-003',
    document_id: 'doc-002',
    document_title: 'AI/ML Workshop Series — Snowflake Cortex & RAG',
    content: 'The CSE department is organizing a comprehensive 5-day hands-on workshop on AI/ML fundamentals and Snowflake Cortex LLM & Vector Search from September 15-19, 2026. Conducted by Prof. Sharma and industry experts in Lab 402. Open to 2nd, 3rd, and 4th year students.',
    category: 'workshop',
    keywords: ['workshop', 'ai', 'ml', 'machine learning', 'cortex', 'cse', 'lab', 'sharma', 'september']
  },
  {
    chunk_id: 'chk-004',
    document_id: 'doc-003',
    document_title: 'Mid-Semester Examination Schedule — Autumn 2026',
    content: 'The mid-semester examinations for all undergraduate and postgraduate departments will commence from October 5, 2026 and conclude on October 15, 2026. Exam slots are Slot A: 10:00 AM - 12:00 PM and Slot B: 2:00 PM - 4:00 PM. Digital admit cards available from Oct 1 on student ERP.',
    category: 'exam',
    keywords: ['exam', 'mid-semester', 'schedule', 'examination', 'timing', 'dates', 'october', 'admit card', 'slot']
  },
  {
    chunk_id: 'chk-005',
    document_id: 'doc-004',
    document_title: 'TechnoVit 2026 — Annual Tech Fest',
    content: 'Join us for TechnoVit 2026, the annual college technological fest from October 20-22, 2026. Highlights include RoboWars, Speed Debugging, Web3 & AI Hackathon, Paper Presentations, and Guest Lectures from Silicon Valley tech leads.',
    category: 'event',
    keywords: ['fest', 'technovit', 'annual', 'event', 'competition', 'october', 'robowars', 'tech']
  },
  {
    chunk_id: 'chk-006',
    document_id: 'doc-005',
    document_title: 'Campus Internship & Placement Drive — TCS & Infosys',
    content: 'Campus placement and summer internship drive by Tata Consultancy Services (TCS) and Infosys on November 5, 2026. Eligibility: Minimum 60% aggregate across all semesters with zero active backlogs. Roles include System Engineer and AI Research Intern.',
    category: 'career',
    keywords: ['internship', 'placement', 'job', 'career', 'tcs', 'infosys', 'drive', 'eligibility', 'november', 'salary', 'hiring']
  },
  {
    chunk_id: 'chk-007',
    document_id: 'doc-006',
    document_title: 'College Code of Conduct & Academic Guidelines',
    content: 'All registered students must visibly display college ID cards inside campus at all times. Minimum 75% attendance in theory and laboratory subjects is strictly mandatory to appear for semester examinations. Anti-ragging policy has zero tolerance. Library working hours: 8:00 AM to 8:00 PM.',
    category: 'notice',
    keywords: ['code of conduct', 'guidelines', 'attendance', 'rules', 'id card', 'ragging', 'library', 'timing', 'notice', 'policy']
  }
];

export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
    return Array(1024).fill(0).map(() => Math.random());
  }

  const sql = `SELECT SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', ?) AS EMBEDDING`;
  const result = await executeQuery<{ EMBEDDING: string | number[] }>(sql, [text]);
  
  if (result.length > 0 && result[0].EMBEDDING) {
    if (typeof result[0].EMBEDDING === 'string') {
      return JSON.parse(result[0].EMBEDDING);
    }
    return result[0].EMBEDDING as number[];
  }
  throw new Error('Failed to generate embedding');
}

export async function vectorSearch(queryText: string, limit: number = 5): Promise<SearchResult[]> {
  if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
    const qLower = queryText.toLowerCase();
    const queryTokens = qLower.split(/\s+/).filter(t => t.length > 2);

    const scored = DEMO_KNOWLEDGE_CHUNKS.map(chunk => {
      let matchCount = 0;
      for (const token of queryTokens) {
        if (chunk.content.toLowerCase().includes(token)) matchCount += 2;
        if (chunk.keywords.some(k => k.includes(token) || token.includes(k))) matchCount += 3;
        if (chunk.document_title.toLowerCase().includes(token)) matchCount += 3;
      }
      const score = Math.min(0.98, 0.45 + (matchCount / (queryTokens.length * 5 || 1)) * 0.5);
      return {
        chunk_id: chunk.chunk_id,
        document_id: chunk.document_id,
        document_title: chunk.document_title,
        content: chunk.content,
        category: chunk.category,
        relevance_score: matchCount > 0 ? Number(score.toFixed(2)) : 0.40,
        created_at: new Date().toISOString()
      };
    });

    return scored
      .sort((a, b) => b.relevance_score - a.relevance_score)
      .slice(0, limit);
  }

  const sql = `
    SELECT c.CHUNK_ID, c.DOCUMENT_ID, c.CONTENT, c.CHUNK_INDEX,
           d.TITLE AS DOCUMENT_TITLE, d.CATEGORY, d.CREATED_AT,
           VECTOR_COSINE_SIMILARITY(c.EMBEDDING,
             SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', ?)) AS RELEVANCE_SCORE
    FROM DOCUMENT_CHUNKS c
    JOIN DOCUMENTS d ON c.DOCUMENT_ID = d.DOCUMENT_ID
    ORDER BY RELEVANCE_SCORE DESC
    LIMIT ?
  `;
  
  const results = await executeQuery<any>(sql, [queryText, limit]);
  return results.map(row => ({
    chunk_id: row.CHUNK_ID,
    document_id: row.DOCUMENT_ID,
    document_title: row.DOCUMENT_TITLE,
    content: row.CONTENT,
    category: row.CATEGORY,
    relevance_score: Number(row.RELEVANCE_SCORE || 0),
    created_at: row.CREATED_AT
  }));
}

export async function generateAnswer(question: string, context: string, sources: { title: string; content: string }[]): Promise<string> {
  if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
    const q = question.toLowerCase();

    if (q.includes('hackathon') || q.includes('competition')) {
      return `Yes! **Hack Days Landed TMSL Kolkata 2026** is scheduled for **September 10-11, 2026**.\n\nKey Details:\n* **Team Size:** 1 to 4 members per team\n* **Eligibility:** Open to all engineering branches with valid student ID\n* **Registration Deadline:** September 1st, 2026\n* **Prizes:** Cash awards, Snowflake cloud credits, and recruitment opportunities\n\n*Source: Hack Days TMSL Kolkata 2026*`;
    }

    if (q.includes('exam') || q.includes('schedule') || q.includes('admit')) {
      return `The **Mid-Semester Examinations for Autumn 2026** will be held from **October 5 to October 15, 2026**.\n\n* **Slot A:** 10:00 AM – 12:00 PM\n* **Slot B:** 2:00 PM – 4:00 PM\n* **Admit Cards:** Downloadable via student ERP portal starting October 1, 2026.\n* **Attendance Requirement:** Mandatory 75% attendance.\n\n*Source: Mid-Semester Examination Schedule — Autumn 2026*`;
    }

    if (q.includes('workshop') || q.includes('ai') || q.includes('cortex')) {
      return `The CSE Department is organizing an **AI/ML Workshop Series focusing on Snowflake Cortex & RAG** from **September 15-19, 2026**.\n\n* **Venue:** Lab 402, CSE Department\n* **Instructors:** Prof. Sharma and industry experts\n* **Eligibility:** 2nd, 3rd, and 4th year students\n* **Certificates:** Provided upon project completion\n\n*Source: AI/ML Workshop Series — Snowflake Cortex & RAG*`;
    }

    if (q.includes('internship') || q.includes('placement') || q.includes('tcs') || q.includes('infosys') || q.includes('job') || q.includes('career')) {
      return `A **Campus Internship & Placement Drive** by **TCS & Infosys** is scheduled for **November 5, 2026**.\n\n* **Eligibility:** Minimum 60% aggregate across all semesters with no active backlogs\n* **Roles:** System Engineer, Digital Associate, and AI Research Intern\n* **Pre-Placement Talk:** November 3, 2026 in the Seminar Hall\n\n*Source: Campus Internship & Placement Drive — TCS & Infosys*`;
    }

    if (q.includes('attendance') || q.includes('rule') || q.includes('conduct') || q.includes('id') || q.includes('library')) {
      return `According to the **College Code of Conduct & Academic Guidelines**:\n\n* **ID Card:** Must be visibly displayed inside campus at all times.\n* **Attendance:** Minimum **75% attendance** is mandatory in theory and labs to appear for semester exams.\n* **Anti-Ragging:** Strict zero tolerance policy.\n* **Library Hours:** 8:00 AM to 8:00 PM on all weekdays.\n\n*Source: College Code of Conduct & Academic Guidelines*`;
    }

    if (sources.length > 0) {
      return `Based on the college knowledge base retrieved from Snowflake:\n\n${sources[0].content}\n\n*Source: ${sources[0].title}*`;
    }

    return "I couldn't find specific college records matching your query in the documents. Please verify your query or upload the relevant notice to the knowledge base.";
  }

  const prompt = `
You are TMSL AI, a knowledgeable and precise college assistant.
Answer the following question based ONLY on the provided context retrieved from Snowflake.
If the context does not contain the answer, state clearly that the information could not be found in the college documents.
Cite the relevant source documents by title.
Format your response with clean Markdown bullet points and bold headers.

Context:
${context}

Question:
${question}
`;

  const sql = `SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-large2', ?) AS RESPONSE`;
  const results = await executeQuery<{ RESPONSE: string }>(sql, [prompt]);
  
  if (results.length > 0 && results[0].RESPONSE) {
    return results[0].RESPONSE;
  }
  return "I couldn't generate an answer from Snowflake Cortex.";
}

export async function summarizeDocument(text: string): Promise<DocumentSummary> {
  if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
    return {
      short_summary: text.slice(0, 180) + '...',
      key_points: [
        'Document processed into Snowflake 1024-dimensional vector chunks',
        'Official notice issued by college administration',
        'Students must adhere to specified deadlines and guidelines'
      ],
      important_dates: ['Refer to official circular for chronological milestones'],
      eligibility: 'All registered students with valid student identification',
      required_actions: ['Read circular carefully and complete actions before deadline'],
      contact_info: 'Department office / College administration'
    };
  }

  const prompt = `
Summarize the following document and output strictly as a JSON object with the following fields:
- short_summary (string)
- key_points (array of strings)
- important_dates (array of strings)
- eligibility (string)
- required_actions (array of strings)
- contact_info (string)

Document Text:
${text}

Return ONLY valid JSON.
`;

  const sql = `SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-large2', ?) AS RESPONSE`;
  const results = await executeQuery<{ RESPONSE: string }>(sql, [prompt]);
  
  if (results.length > 0 && results[0].RESPONSE) {
    try {
      let jsonStr = results[0].RESPONSE;
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr) as DocumentSummary;
    } catch (e) {
      console.error('Failed to parse summary JSON', e);
    }
  }
  throw new Error('Failed to generate summary');
}

export async function extractEvents(text: string, documentId: string): Promise<EventData[]> {
  if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
    return [];
  }

  const prompt = `
Extract any events from the following document and output strictly as a JSON array of objects.
Each object must have these string fields: title, description, event_date, registration_deadline (can be null), location, organizer, eligibility, category.
If no events are found, return an empty array [].

Document Text:
${text}

Return ONLY valid JSON array.
`;

  const sql = `SELECT SNOWFLAKE.CORTEX.COMPLETE('mistral-large2', ?) AS RESPONSE`;
  const results = await executeQuery<{ RESPONSE: string }>(sql, [prompt]);
  
  if (results.length > 0 && results[0].RESPONSE) {
    try {
      let jsonStr = results[0].RESPONSE;
      jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed)) {
        return parsed.map((e: any, index: number) => ({
          event_id: `evt-${Date.now()}-${index}`,
          document_id: documentId,
          title: e.title || '',
          description: e.description || '',
          event_date: e.event_date || '',
          registration_deadline: e.registration_deadline || undefined,
          location: e.location || '',
          organizer: e.organizer || '',
          eligibility: e.eligibility || '',
          category: e.category || 'general'
        }));
      }
    } catch (e) {
      console.error('Failed to parse events JSON', e);
    }
  }
  return [];
}
