import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/snowflake';
import { ApiResponse, Document } from '@/lib/types';

const DEMO_DOCS: Document[] = [
  {
    document_id: 'doc-001',
    title: 'Hack Days TMSL Kolkata 2026',
    filename: 'Hack_Days_TMSL_2026.pdf',
    category: 'hackathon',
    department: 'CSE / All Departments',
    source: 'MLH & College Notice Board',
    chunk_count: 2,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    document_id: 'doc-002',
    title: 'AI/ML Workshop Series — Snowflake Cortex & RAG',
    filename: 'AIML_Workshop_Cortex.pdf',
    category: 'workshop',
    department: 'Computer Science & Engineering',
    source: 'Department Circular #402',
    chunk_count: 3,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    document_id: 'doc-003',
    title: 'Mid-Semester Examination Schedule — Autumn 2026',
    filename: 'Mid_Sem_Exam_Schedule_2026.pdf',
    category: 'exam',
    department: 'Controller of Examinations',
    source: 'Exam Cell Circular',
    chunk_count: 2,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    document_id: 'doc-004',
    title: 'TechnoVit 2026 — Annual Tech Fest',
    filename: 'TechnoVit_Fest_Brochure.docx',
    category: 'event',
    department: 'Student Affairs',
    source: 'College Student Council',
    chunk_count: 4,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    document_id: 'doc-005',
    title: 'Campus Internship & Placement Drive — TCS & Infosys',
    filename: 'Placement_Drive_TCS_Infosys.pdf',
    category: 'career',
    department: 'Training & Placement Cell',
    source: 'T&P Bulletin',
    chunk_count: 3,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString()
  },
  {
    document_id: 'doc-006',
    title: 'College Code of Conduct & Academic Guidelines',
    filename: 'Student_Handbook_Guidelines.pdf',
    category: 'notice',
    department: 'Office of the Dean (Academic)',
    source: 'Official Student Handbook',
    chunk_count: 4,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 7).toISOString()
  }
];

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse<Document[]>>> {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    if (process.env.DEMO_MODE === 'true' && !process.env.SNOWFLAKE_ACCOUNT) {
      let docs = [...DEMO_DOCS];
      if (category && category !== 'all') {
        docs = docs.filter(d => d.category === category);
      }
      if (search) {
        const query = search.toLowerCase();
        docs = docs.filter(d => d.title.toLowerCase().includes(query) || d.department.toLowerCase().includes(query));
      }
      return NextResponse.json({ success: true, data: docs });
    }

    let sql = `
      SELECT d.*, COUNT(c.CHUNK_ID) AS ACTUAL_CHUNKS
      FROM DOCUMENTS d
      LEFT JOIN DOCUMENT_CHUNKS c ON d.DOCUMENT_ID = c.DOCUMENT_ID
      WHERE 1=1
    `;
    const binds: any[] = [];

    if (category && category !== 'all') {
      sql += ' AND d.CATEGORY = ?';
      binds.push(category);
    }

    if (search) {
      sql += ' AND (d.TITLE ILIKE ? OR d.DEPARTMENT ILIKE ?)';
      binds.push(`%${search}%`, `%${search}%`);
    }

    sql += ' GROUP BY d.DOCUMENT_ID, d.TITLE, d.FILENAME, d.CATEGORY, d.DEPARTMENT, d.SOURCE, d.FULL_TEXT, d.CREATED_AT, d.UPDATED_AT ORDER BY d.CREATED_AT DESC';

    const results = await executeQuery<any>(sql, binds);
    
    const documents = results.map(row => ({
      document_id: row.DOCUMENT_ID,
      title: row.TITLE,
      filename: row.FILENAME,
      category: row.CATEGORY,
      department: row.DEPARTMENT,
      source: row.SOURCE,
      chunk_count: Number(row.ACTUAL_CHUNKS || 0),
      created_at: row.CREATED_AT,
      updated_at: row.UPDATED_AT
    }));

    return NextResponse.json({ success: true, data: documents });
  } catch (error: any) {
    console.error('Fetch Documents Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Fetch failed' }, { status: 500 });
  }
}
