-- TMSL AI Demo Seed Data
-- Ensure schema.sql has been executed before running this.
USE DATABASE TMSL_AI;
USE SCHEMA PUBLIC;
USE WAREHOUSE COMPUTE_WH;

-- Clean existing demo data to avoid conflicts
DELETE FROM QUERY_SOURCES;
DELETE FROM QUERIES;
DELETE FROM EVENTS;
DELETE FROM DOCUMENT_CHUNKS;
DELETE FROM DOCUMENTS;

-- 1. Insert Documents
INSERT INTO DOCUMENTS (DOCUMENT_ID, TITLE, FILENAME, CATEGORY, DEPARTMENT, SOURCE, FULL_TEXT) VALUES
('doc-001', 'Hack Days TMSL Kolkata 2026', 'hack-days-2026.pdf', 'hackathon', 'Computer Science', 'MLH', 'Join the biggest hackathon in Kolkata. MLH Hack Days TMSL will be held on Oct 15-16, 2026 at the Main Auditorium.'),
('doc-002', 'AI/ML Workshop Series', 'aiml-workshop.pdf', 'workshop', 'IT Dept', 'Tech Club', 'A 5-day hands-on workshop on AI, Machine Learning, and Snowflake Cortex integrations. Starting Nov 1, 2026.'),
('doc-003', 'Mid-Semester Examination Schedule', 'mid-sem-schedule.pdf', 'exam', 'Administration', 'Controller of Exams', 'Mid semester examinations for all B.Tech branches will commence from Nov 20, 2026. Admit cards are required.'),
('doc-004', 'TechnoVit 2026 — Annual Tech Fest', 'technovit-2026.pdf', 'event', 'Student Council', 'Website', 'TechnoVit 2026 returns with robotics, coding, and gaming competitions. Registration deadline is Dec 1, 2026.'),
('doc-005', 'Internship Drive — TCS & Infosys', 'placement-drive.pdf', 'career', 'Placement Cell', 'TnP', 'Campus recruitment drive for 2027 batch. TCS Ninja and Infosys HackWithInfy registrations open until Oct 30.'),
('doc-006', 'College Code of Conduct & Guidelines', 'code-of-conduct.pdf', 'notice', 'Administration', 'Dean of Students', 'Students must maintain 75% attendance. ID cards are mandatory on campus premises.');

-- 2. Insert Chunks with Cortex Embeddings
-- Using Snowflake's built-in Cortex AI functions to generate embeddings dynamically
INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
SELECT 
  'chk-' || UUID_STRING(), 'doc-001', 1, 
  'Join the biggest hackathon in Kolkata. MLH Hack Days TMSL will be held on Oct 15-16, 2026 at the Main Auditorium.',
  SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', 'Join the biggest hackathon in Kolkata. MLH Hack Days TMSL will be held on Oct 15-16, 2026 at the Main Auditorium.');

INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
SELECT 
  'chk-' || UUID_STRING(), 'doc-001', 2, 
  'Participants must register by Oct 10, 2026. The Best Use of Snowflake prize is $500.',
  SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', 'Participants must register by Oct 10, 2026. The Best Use of Snowflake prize is $500.');

INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
SELECT 
  'chk-' || UUID_STRING(), 'doc-002', 1, 
  'A 5-day hands-on workshop on AI, Machine Learning, and Snowflake Cortex integrations. Starting Nov 1, 2026. Room 402.',
  SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', 'A 5-day hands-on workshop on AI, Machine Learning, and Snowflake Cortex integrations. Starting Nov 1, 2026. Room 402.');

INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
SELECT 
  'chk-' || UUID_STRING(), 'doc-003', 1, 
  'Mid semester examinations for all B.Tech branches will commence from Nov 20, 2026. Admit cards are required. No electronic devices allowed.',
  SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', 'Mid semester examinations for all B.Tech branches will commence from Nov 20, 2026. Admit cards are required. No electronic devices allowed.');

INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
SELECT 
  'chk-' || UUID_STRING(), 'doc-004', 1, 
  'TechnoVit 2026 returns with robotics, coding, and gaming competitions. Registration deadline is Dec 1, 2026. Event dates: Dec 15-17.',
  SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', 'TechnoVit 2026 returns with robotics, coding, and gaming competitions. Registration deadline is Dec 1, 2026. Event dates: Dec 15-17.');

INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
SELECT 
  'chk-' || UUID_STRING(), 'doc-005', 1, 
  'Campus recruitment drive for 2027 batch. TCS Ninja and Infosys HackWithInfy registrations open until Oct 30. Eligibility: >7.0 CGPA.',
  SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', 'Campus recruitment drive for 2027 batch. TCS Ninja and Infosys HackWithInfy registrations open until Oct 30. Eligibility: >7.0 CGPA.');

INSERT INTO DOCUMENT_CHUNKS (CHUNK_ID, DOCUMENT_ID, CHUNK_INDEX, CONTENT, EMBEDDING)
SELECT 
  'chk-' || UUID_STRING(), 'doc-006', 1, 
  'Students must maintain 75% attendance. ID cards are mandatory on campus premises. Library books must be returned in 14 days.',
  SNOWFLAKE.CORTEX.EMBED_TEXT_1024('snowflake-arctic-embed-l-v2.0', 'Students must maintain 75% attendance. ID cards are mandatory on campus premises. Library books must be returned in 14 days.');


-- 3. Insert Events
INSERT INTO EVENTS (EVENT_ID, DOCUMENT_ID, TITLE, DESCRIPTION, EVENT_DATE, REGISTRATION_DEADLINE, LOCATION, ORGANIZER, ELIGIBILITY, CATEGORY) VALUES
('evt-001', 'doc-001', 'MLH Hack Days TMSL', 'Biggest 24-hour hackathon', '2026-10-15', '2026-10-10', 'Main Auditorium', 'MLH & Tech Club', 'All Students', 'hackathons'),
('evt-002', 'doc-002', 'AI/ML Workshop', '5-day hands-on workshop on Snowflake Cortex', '2026-11-01', '2026-10-25', 'Room 402', 'IT Dept', 'CSE/IT Students', 'workshops'),
('evt-003', 'doc-004', 'TechnoVit 2026', 'Annual tech fest with robotics and coding events', '2026-12-15', '2026-12-01', 'College Campus', 'Student Council', 'All Students', 'academic'),
('evt-004', 'doc-005', 'TCS & Infosys Drive', 'Placement recruitment drive for 2027 batch', '2026-11-05', '2026-10-30', 'Placement Cell', 'TnP', '>7.0 CGPA', 'career');

-- 4. Insert Sample Analytics Data (Queries)
INSERT INTO QUERIES (QUERY_ID, QUESTION, ANSWER, CREATED_AT) VALUES
('qry-001', 'When is the MLH hackathon?', 'The MLH Hack Days TMSL will be held on Oct 15-16, 2026 at the Main Auditorium. Registration ends Oct 10.', DATEADD(day, -2, CURRENT_TIMESTAMP())),
('qry-002', 'What is the attendance rule?', 'According to the College Code of Conduct, students must maintain a minimum of 75% attendance.', DATEADD(day, -1, CURRENT_TIMESTAMP())),
('qry-003', 'Tell me about placements', 'The campus recruitment drive for TCS Ninja and Infosys HackWithInfy is open for the 2027 batch. You need a CGPA of >7.0 to be eligible.', CURRENT_TIMESTAMP());
