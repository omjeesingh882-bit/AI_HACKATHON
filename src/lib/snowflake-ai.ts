import { executeQuery } from './snowflake';
import { SearchResult, DocumentSummary, EventData } from './types';
import { callGroqAi } from './groq';

export async function vectorSearch(queryText: string, limit: number = 5): Promise<SearchResult[]> {
  try {
    const cleanQuery = queryText.trim().replace(/'/g, "''");
    const words = cleanQuery.split(/\s+/).filter(w => w.length > 2);
    const searchPattern = words.length > 0 ? `%${words[0]}%` : `%${cleanQuery}%`;

    // 1. Primary search: exact pattern + native Snowflake JAROWINKLER_SIMILARITY
    const sqlWithFilter = `
      SELECT 
          CHUNK_ID,
          DOCUMENT_ID,
          DOCUMENT_TITLE,
          CATEGORY,
          CHUNK_INDEX,
          CHUNK_TEXT,
          ROUND(JAROWINKLER_SIMILARITY(CHUNK_TEXT, ?) / 100, 2) AS SIMILARITY_SCORE,
          CREATED_AT
      FROM TMSL_AI.PUBLIC.DOCUMENT_CHUNKS
      WHERE ILIKE(CHUNK_TEXT, ?) 
         OR ILIKE(DOCUMENT_TITLE, ?)
      ORDER BY SIMILARITY_SCORE DESC
      LIMIT ?
    `;

    let rows: any[] = [];
    try {
      rows = await executeQuery<any>(sqlWithFilter, [cleanQuery, searchPattern, searchPattern, limit]);
    } catch (e) {
      console.warn('Filter query error, trying fallback:', e);
    }

    // 2. Fallback: Rank all stored chunks by Snowflake JAROWINKLER_SIMILARITY
    if (!rows || rows.length === 0) {
      const sqlFallback = `
        SELECT 
            CHUNK_ID,
            DOCUMENT_ID,
            DOCUMENT_TITLE,
            CATEGORY,
            CHUNK_INDEX,
            CHUNK_TEXT,
            ROUND(JAROWINKLER_SIMILARITY(CHUNK_TEXT, ?) / 100, 2) AS SIMILARITY_SCORE,
            CREATED_AT
        FROM TMSL_AI.PUBLIC.DOCUMENT_CHUNKS
        ORDER BY SIMILARITY_SCORE DESC
        LIMIT ?
      `;
      try {
        rows = await executeQuery<any>(sqlFallback, [cleanQuery, limit]);
      } catch (err) {
        console.error('Fallback query error:', err);
      }
    }

    return (rows || []).map(row => ({
      chunk_id: row.CHUNK_ID || row.chunk_id || 'chk-1',
      document_id: row.DOCUMENT_ID || row.document_id || 'doc-1',
      document_title: row.DOCUMENT_TITLE || row.document_title || 'College Document',
      content: row.CHUNK_TEXT || row.content || '',
      category: row.CATEGORY || row.category || 'general',
      relevance_score: Number(row.SIMILARITY_SCORE || 0.70),
      created_at: row.CREATED_AT ? String(row.CREATED_AT) : new Date().toISOString()
    }));
  } catch (error) {
    console.error('Vector / Similarity search error in Snowflake:', error);
    return [];
  }
}

export async function generateAnswer(
  question: string, 
  context: string, 
  sources: { title: string; content: string }[]
): Promise<string> {
  if (sources.length === 0) {
    return "I couldn't find specific college records matching your query in the Snowflake knowledge base. Please check the keywords or upload the circular to the platform.";
  }

  const uniqueTitles = Array.from(new Set(sources.map(s => s.title)));

  // Try generating with Groq AI using the context retrieved from Snowflake
  const groqAnswer = await callGroqAi([
    {
      role: 'system',
      content: `You are TMSL AI, the intelligent college knowledge assistant for Techno Main Salt Lake (TMSL).
Your job is to answer student questions accurately, politely, and clearly based strictly on the provided context retrieved from the Snowflake Data Cloud.
Highlight important dates, eligibility, and rules in bold. Use clean Markdown formatting.`,
    },
    {
      role: 'user',
      content: `Retrieved Snowflake Context:\n${context}\n\nStudent Question: ${question}\n\nAnswer:`,
    }
  ], { temperature: 0.2, max_tokens: 800 });

  if (groqAnswer && groqAnswer.trim().length > 10) {
    return `${groqAnswer}\n\n*Sources: ${uniqueTitles.join(', ')}*`;
  }

  // Fallback if Groq is unavailable
  const primarySource = sources[0];
  let answer = `Based on official records retrieved from **Snowflake Data Cloud**:\n\n`;
  answer += `${primarySource.content}\n\n`;

  if (sources.length > 1) {
    answer += `### Related Information\n`;
    sources.slice(1).forEach((s) => {
      answer += `* **${s.title}**: ${s.content}\n`;
    });
    answer += `\n`;
  }

  answer += `*Sources: ${uniqueTitles.join(', ')}*`;
  return answer;
}

export async function summarizeDocument(text: string): Promise<DocumentSummary> {
  // Try Groq AI for intelligent structured summary
  const groqSummaryJson = await callGroqAi([
    {
      role: 'system',
      content: `You are an expert document summarizer for college academic documents. Return ONLY a valid JSON object with the following schema, no markdown fences or other text:
{
  "short_summary": "2-3 sentence overview",
  "key_points": ["point 1", "point 2", "point 3"],
  "important_dates": ["date 1", "date 2"],
  "eligibility": "eligibility criteria",
  "required_actions": ["action 1", "action 2"],
  "contact_info": "contact info or department"
}`,
    },
    {
      role: 'user',
      content: `Summarize this college document:\n\n${text.slice(0, 3500)}`,
    }
  ], { temperature: 0.1, max_tokens: 600 });

  if (groqSummaryJson) {
    try {
      const parsed = JSON.parse(groqSummaryJson);
      if (parsed.short_summary && parsed.key_points) {
        return {
          short_summary: parsed.short_summary,
          key_points: Array.isArray(parsed.key_points) ? parsed.key_points : [parsed.key_points],
          important_dates: Array.isArray(parsed.important_dates) ? parsed.important_dates : [parsed.important_dates],
          eligibility: parsed.eligibility || 'Open to all students',
          required_actions: Array.isArray(parsed.required_actions) ? parsed.required_actions : [parsed.required_actions],
          contact_info: parsed.contact_info || 'Department Office / Administration'
        };
      }
    } catch {
      // If JSON parsing fails, continue to fallback
    }
  }

  // Robust fallback
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const short_summary = sentences.slice(0, 2).join(' ') || text.slice(0, 200);
  const key_points = sentences.slice(0, 5);

  const dateRegex = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}\/\d{1,2}\/\d{4}\b/gi;
  const datesFound = Array.from(new Set(text.match(dateRegex) || []));

  return {
    short_summary,
    key_points: key_points.length > 0 ? key_points : [text],
    important_dates: datesFound.length > 0 ? datesFound : ['Refer to circular for specific milestones'],
    eligibility: text.toLowerCase().includes('eligib') || text.toLowerCase().includes('cgpa') || text.toLowerCase().includes('attendance')
      ? 'Minimum academic & attendance criteria as stated in document.'
      : 'Open to all registered college students.',
    required_actions: [
      'Read official circular carefully',
      'Adhere to registration and compliance deadlines'
    ],
    contact_info: 'Department Office / College Administration'
  };
}

export async function extractEvents(text: string, documentId: string): Promise<EventData[]> {
  try {
    const rows = await executeQuery<any>(
      'SELECT * FROM TMSL_AI.PUBLIC.EVENTS WHERE DOCUMENT_ID = ?', 
      [documentId]
    );

    if (rows && rows.length > 0) {
      return rows.map(r => ({
        event_id: r.EVENT_ID,
        document_id: r.DOCUMENT_ID,
        title: r.EVENT_NAME,
        description: r.DETAILS || '',
        event_date: r.START_DATE ? String(r.START_DATE) : '',
        registration_deadline: r.REGISTRATION_DEADLINE ? String(r.REGISTRATION_DEADLINE) : undefined,
        location: r.LOCATION || '',
        organizer: r.ORGANIZER || '',
        eligibility: r.ELIGIBILITY || '',
        category: r.EVENT_TYPE || 'Event'
      }));
    }
  } catch (err) {
    console.warn('Fetch events by documentId error:', err);
  }

  return [];
}
