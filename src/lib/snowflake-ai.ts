import { executeQuery } from './snowflake';
import { SearchResult, DocumentSummary, EventData } from './types';

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
  const primarySource = sources[0];

  let answer = `Based on official records retrieved from **Snowflake Data Cloud**:\n\n`;
  answer += `${primarySource.content}\n\n`;

  if (sources.length > 1) {
    answer += `### Related Information\n`;
    sources.slice(1).forEach((s, idx) => {
      answer += `* **${s.title}**: ${s.content}\n`;
    });
    answer += `\n`;
  }

  answer += `*Sources: ${uniqueTitles.join(', ')}*`;
  return answer;
}

export async function summarizeDocument(text: string): Promise<DocumentSummary> {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 15);

  const short_summary = sentences.slice(0, 2).join(' ') || text.slice(0, 200);
  const key_points = sentences.slice(0, 5);

  // Extract dates
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
