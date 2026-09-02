-- TMSL AI Demo Seed Data
USE DATABASE TMSL_AI;
USE SCHEMA PUBLIC;
USE WAREHOUSE COMPUTE_WH;

-- 1. Insert College Documents
INSERT INTO DOCUMENTS (DOCUMENT_ID, TITLE, CATEGORY, RAW_CONTENT, CHUNK_COUNT)
VALUES 
(
    'doc-001',
    'Hack Days Landed TMSL Kolkata 2026',
    'hackathon',
    'Hack Days Landed TMSL Kolkata 2026 is a 36-hour in-person hackathon happening on September 10-11, 2026, at Techno Main Salt Lake, Kolkata. Organized by the Google Cloud & AI Student Developer Club. Tracks include AI & Data with Snowflake, Web3, and HealthTech. Prize pool is INR 1,50,000. Registration closes September 5, 2026. All B.Tech and MCA students are eligible.',
    1
),
(
    'doc-002',
    'TMSL Attendance & Internal Exam Policy 2026',
    'rules',
    'Techno Main Salt Lake mandatory academic regulations: Students must maintain a minimum of 75% attendance to be eligible for end-semester examinations. Students with attendance between 60% and 74% require medical certificate justification and departmental Dean approval. Mid-term assessments carry 30% weightage while end-sem exams carry 70%.',
    1
),
(
    'doc-003',
    'NVIDIA & Qualcomm Campus Placement Guidelines 2026-2027',
    'placement',
    'Campus Recruitment Drive: NVIDIA and Qualcomm target B.Tech ECE, EE, and CSE for Hardware & VLSI roles. Minimum eligibility criteria: 7.50 CGPA or 75% aggregate with zero active backlogs. Round 1: Digital System Design, Computer Architecture, and Verilog/C programming. Selected candidates receive a CTC ranging between 18 LPA to 28 LPA.',
    1
);

-- 2. Seed Chunks
INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, DOCUMENT_TITLE, CATEGORY, CHUNK_INDEX, CHUNK_TEXT)
SELECT 
    DOCUMENT_ID || '-chk-0',
    DOCUMENT_ID,
    TITLE,
    CATEGORY,
    0,
    RAW_CONTENT
FROM DOCUMENTS;

-- 3. Insert College Events
INSERT INTO EVENTS (EVENT_ID, DOCUMENT_ID, EVENT_NAME, EVENT_TYPE, START_DATE, LOCATION, ORGANIZER, REGISTRATION_DEADLINE, ELIGIBILITY, DETAILS)
VALUES 
(
    'evt-001',
    'doc-001',
    'Hack Days Landed TMSL Kolkata',
    'Hackathon',
    '2026-09-10 09:00:00',
    'TMSL Campus Auditorium & Lab 4',
    'GDG & AI Student Chapter',
    '2026-09-05 23:59:59',
    'B.Tech / MCA Students',
    '36-hour offline hackathon featuring Snowflake AI track with INR 1.5L prize pool.'
),
(
    'evt-002',
    'doc-003',
    'NVIDIA On-Campus VLSI Placement Assessment',
    'Placement',
    '2026-10-15 10:00:00',
    'Techno Main Central Computing Lab',
    'Training & Placement Cell (T&P)',
    '2026-10-01 17:00:00',
    'ECE/EE/CSE (>= 7.50 CGPA)',
    'Online technical screening on Digital Logic, Verilog, and System Architecture.'
);
