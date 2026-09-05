<div align="center">

# 🎓 TMSL AI — College Knowledge Engine ❄️
### Intelligent Campus Assistant & Event Management Powered by Snowflake Data Cloud & Groq LPU Inference

[![Live Demo](https://img.shields.io/badge/Live_Demo-ai--hackathon--blush.vercel.app-29B5E8?style=for-the-badge&logo=vercel&logoColor=white)](https://ai-hackathon-blush.vercel.app/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/omjeesingh882-bit/AI_HACKATHON.git)
[![MLH Hack Days](https://img.shields.io/badge/MLH-Hack_Days_2026-FF4B4B?style=for-the-badge&logo=majorleaguehacking&logoColor=white)](https://mlh.io/)
[![Snowflake](https://img.shields.io/badge/Snowflake-Data_Cloud-29B5E8?style=for-the-badge&logo=snowflake&logoColor=white)](https://www.snowflake.com/)
[![Groq](https://img.shields.io/badge/Groq-LPU_Inference-F05A28?style=for-the-badge&logo=fastapi&logoColor=white)](https://groq.com/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14_App_Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<br/>

> **Built for the MLH Hack Days — "Best Use of Snowflake" Challenge**  
> An enterprise-grade institutional intelligence platform centralizing academic notices, placement routines, hackathon announcements, syllabi, and administrative circulars into an instant, citation-grounded student engine with event registrations and group participation tracking.

[🌐 Explore Live Application](https://ai-hackathon-blush.vercel.app/) • [📖 Documentation](#-table-of-contents) • [⚡ Snowflake Engine](#-why-snowflake-core-architectural-pillar) • [👥 Student & Admin Workflows](#-core-modules--workflows) • [🚀 Quick Start](#-quick-start)

</div>

---

## 📑 Table of Contents

- [Overview & Problem Statement](#-overview--problem-statement)
- [Why Snowflake? (Core Architectural Pillar)](#-why-snowflake-core-architectural-pillar)
- [System Architecture](#-system-architecture)
- [Core Modules & Workflows](#-core-modules--workflows)
  - [1. Role-Based Access Control (RBAC) & Authentication](#1-role-based-access-control-rbac--authentication)
  - [2. Student Event Registration & Team Management](#2-student-event-registration--team-management)
  - [3. Admin Control Center & Group-Wise Inspector](#3-admin-control-center--group-wise-inspector)
  - [4. Grounded AI Chatbot & Semantic Search](#4-grounded-ai-chatbot--semantic-search)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Snowflake Schema Design](#-snowflake-schema-design)
- [API Reference](#-api-reference)
- [Quick Start & Local Setup](#-quick-start--local-setup)
- [Deployment](#-deployment)
- [Team & Acknowledgements](#-team--acknowledgements)
- [License](#-license)

---

## 💡 Overview & Problem Statement

### ⚠️ The Problem
In modern collegiate institutions like Techno Main Salt Lake (TMSL), critical information and campus engagement are heavily fragmented:
* **Scattered Circulars**: Examination schedules, placement drives, fee deadlines, and hackathon notices are buried across messaging groups, Telegram channels, physical bulletin boards, and unstructured PDF portals.
* **Complex Event Registrations**: Hackathons and workshops require teams, roll numbers, and contact details, which are often collected manually via chaotic spreadsheets with missing data.
* **Information Fatigue & Hallucination**: Students struggle to find exact syllabus regulations or eligibility cutoffs in lengthy multi-page circulars.

### 🎯 The Solution
**TMSL AI** is a unified, production-ready campus intelligence engine:
1. **Grounded AI Q&A**: Answers student queries in seconds with direct citations and similarity confidence scores.
2. **Native Snowflake Similarity Search**: Computes string and pattern relevance inside Snowflake SQL using `JAROWINKLER_SIMILARITY` and `ILIKE`.
3. **Structured Event Registration & Team Management**: Complete registration workflow for solo and team participants with mandatory roll, phone, email, and department validation.
4. **Admin Group-wise Inspector**: Live control panel for administrators to inspect participant rosters organized team-by-team.
5. **Role-Gated Security**: Clean, private access control separating student dashboards from administrator administrative tools.

---

## ❄️ Why Snowflake? (Core Architectural Pillar)

In standard AI applications, developers add an external vector database alongside a standard relational database, causing synchronization overhead and data egress costs.

**TMSL AI treats Snowflake as the central database and computational engine:**

1. **Unified Storage & Governance**:
   Document metadata, text chunks, extracted events, student registrations, and audit logs are co-located in Snowflake (`DOCUMENTS`, `DOCUMENT_CHUNKS`, `EVENTS`, `QUERIES`).
2. **In-Database Similarity Computation**:
   Relevance scoring is calculated directly inside Snowflake SQL via native `JAROWINKLER_SIMILARITY`:
   ```sql
   SELECT 
       DOCUMENT_TITLE,
       CATEGORY,
       CHUNK_TEXT,
       ROUND(JAROWINKLER_SIMILARITY(CHUNK_TEXT, :query) / 100, 2) AS SIMILARITY_SCORE
   FROM TMSL_AI.PUBLIC.DOCUMENT_CHUNKS
   WHERE ILIKE(CHUNK_TEXT, :pattern) OR ILIKE(DOCUMENT_TITLE, :pattern)
   ORDER BY SIMILARITY_SCORE DESC
   LIMIT 5;
   ```
3. **Universal Snowflake Compatibility**:
   Engineered to run seamlessly across all Snowflake tiers (Standard, Trial, Enterprise), with upgrade hooks for Snowflake Cortex Vector (`VECTOR(FLOAT, 1024)` + `SNOWFLAKE.CORTEX.EMBED_TEXT_1024`).
4. **Audit & Telemetry Logging**:
   Every student interaction, retrieved chunk ID, citation list, and response latency metric is audited into the `QUERIES` table for institutional analytics.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    subgraph Client["🖥️ User Interface (Next.js 14 App Router + Tailwind CSS)"]
        UI_Home["🏠 Home & Auth"]
        UI_Student["🎓 Student Portal (/student)"]
        UI_Admin["🛡️ Admin Control Center (/admin)"]
        UI_Chat["💬 AI Chat (/chat)"]
        UI_Search["🔍 Semantic Search (/search)"]
        UI_Events["📅 Events & Registration (/events)"]
        UI_Docs["📄 Document Hub (/documents)"]
    end

    subgraph Auth["🔐 Security & Access Control"]
        RBAC["🛡️ RBAC Middleware / Auth Context\n(Admin vs Student Role Gating)"]
    end

    subgraph API["⚡ Serverless Backend API Routes"]
        R_Auth["/api/auth/*"]
        R_Reg["/api/events/[id]/registrations"]
        R_MyReg["/api/events/registrations/my"]
        R_Chat["/api/chat"]
        R_Search["/api/search"]
        R_Events["/api/events"]
        R_Docs["/api/documents"]
    end

    subgraph Snowflake["❄️ Snowflake Data Cloud (TMSL_AI.PUBLIC)"]
        T_Docs[("📑 DOCUMENTS\n(Metadata & Raw Content)")]
        T_Chunks[("🧩 DOCUMENT_CHUNKS\n(Text Chunks & Index)")]
        T_Events[("📅 EVENTS\n(Deadlines, Venue, Details)")]
        T_Queries[("📊 QUERIES\n(Audit Logs & Citations)")]
        SQL_Sim["⚡ Snowflake SQL Engine\nJAROWINKLER_SIMILARITY()"]
    end

    subgraph Groq["⚡ Groq LPU Inference Engine"]
        LPU["🤖 openai/gpt-oss-120b\n(Sub-Second RAG Synthesis)"]
    end

    %% Flow connections
    Client --> Auth
    Auth --> API
    
    R_Search --> SQL_Sim
    SQL_Sim --> T_Chunks
    
    R_Chat --> SQL_Sim
    SQL_Sim --> T_Chunks
    T_Chunks -->|Retrieved Chunks| R_Chat
    R_Chat -->|Grounded Context| LPU
    LPU -->|Synthesized Answer| R_Chat
    R_Chat -->|Audit Logging| T_Queries

    R_Docs --> T_Docs
    R_Docs --> T_Chunks
    R_Events --> T_Events
    R_Reg --> T_Events

    style Snowflake fill:#29B5E8,stroke:#0A2540,stroke-width:2px,color:#fff
    style Groq fill:#F05A28,stroke:#0A2540,stroke-width:2px,color:#fff
    style Client fill:#1E293B,stroke:#38BDF8,stroke-width:2px,color:#fff
```

---

## 👥 Core Modules & Workflows

### 1. Role-Based Access Control (RBAC) & Authentication
* **Single Master Administrator**: Dedicated institutional administrator account for managing institutional documents, events, and registrations.
* **Student Onboarding**: Instant self-registration requiring mandatory Student Name, Roll Number, Department, Year, Email, and Password.
* **Protected Navigation**: Internal portal sections (`Events`, `Documents`, `AI Chat`, `Search`, `Student Portal`, `Admin Control Center`) are strictly protected from unauthenticated access. Students cannot access Admin tools.

### 2. Student Event Registration & Team Management
* **Instant Event Registration**: Direct **"Register for Event"** button on event cards on both `/student` and `/events`.
* **Mandatory Field Validation**:
  * Full Name
  * College Roll Number
  * Department
  * Phone Number
  * Gender Selection (Male / Female / Other)
  * Institutional Email Address
  * Participation Mode (Individual vs. Group / Team)
* **Dynamic Group Participation**:
  * Selecting **Group** requires a mandatory **Group / Team Name**.
  * Allows dynamically adding multiple **Team Members** with individual Roll Numbers, Departments, Phone Numbers, and Email Addresses.
* **Instant Confirmation**: Once registered, event cards dynamically update to display a **✓ Registered** badge.

### 3. Admin Control Center & Group-Wise Inspector
* **Broadcast Campus Events**: Publish new hackathons, placement drives, workshops, and exam dates.
* **Document Ingestion**: Upload multi-page PDFs, DOCX, and TXT notices that are immediately processed and indexed into Snowflake.
* **Group-Wise Participant Inspector**:
  * Interactive expandable drawer under each event in `/admin`.
  * Renders participants grouped cleanly by **Team Name (`👥 Group: <Team Name>`)** and **Solo Registrants (`👤 Individual Participants`)**.
  * Shows full contact details, roll numbers, genders, departments, and team leader vs. member breakdown.
* **Student Directory**: Searchable list of registered students with roll and department tracking.

### 4. Grounded AI Chatbot & Semantic Search
* **Zero Hallucination RAG**: Answers student queries strictly grounded in official documents stored in Snowflake.
* **Source Citations**: Displays clickable source document references with chunk similarity confidence percentages.
* **Fast Inference**: Powered by Groq LPU (`openai/gpt-oss-120b`) for sub-second responses.

---

## ✨ Key Features

| Feature | Route | Description |
|---|---|---|
| **🎓 Student Dashboard** | [`/student`](https://ai-hackathon-blush.vercel.app/student) | Personalized student hub with notice feeds, event bookmarking, 1-click registration, and embedded AI helper. |
| **🛡️ Admin Control Center** | [`/admin`](https://ai-hackathon-blush.vercel.app/admin) | Comprehensive portal to manage events, inspect group-wise registrations, upload circulars, and monitor students. |
| **💬 Grounded AI Chat** | [`/chat`](https://ai-hackathon-blush.vercel.app/chat) | Natural language Q&A citing source documents, chunk IDs, and confidence percentages. |
| **🔍 Semantic Smart Search** | [`/search`](https://ai-hackathon-blush.vercel.app/search) | Meaning & keyword matching powered by Snowflake's native `JAROWINKLER_SIMILARITY`. |
| **📅 Events & Registrations** | [`/events`](https://ai-hackathon-blush.vercel.app/events) | Timeline of college events with solo/group registration modal and real-time status. |
| **📄 Document Hub & Upload** | [`/documents`](https://ai-hackathon-blush.vercel.app/documents) | Ingest multi-page PDFs, DOCX, and TXT files with automated chunking into Snowflake. |
| **✨ Instant Summarization** | `/documents/[id]` | One-click synthesis of long notices into key takeaways, deadlines, and eligibility rules. |
| **📊 Analytics Dashboard** | [`/dashboard`](https://ai-hackathon-blush.vercel.app/dashboard) | Institutional telemetry displaying query trends, category distributions, and top documents. |
| **🏛️ Architecture Visualizer** | [`/architecture`](https://ai-hackathon-blush.vercel.app/architecture) | Interactive visual comparison of Native Snowflake RAG versus fragmented multi-vendor stacks. |

---

## 🛠️ Tech Stack

```
Frontend:          Next.js 14 (App Router) • React 18 • TypeScript • Tailwind CSS • shadcn/ui
Animations:        Framer Motion • Lucide React Icons
Data Visualization:Recharts
Data Cloud:        Snowflake (Standard / Trial / Enterprise)
Database Driver:   snowflake-sdk (Node.js Connection Pool)
AI Inference:      Groq LPU Cloud (openai/gpt-oss-120b)
Document Parsing:  pdf-parse • mammoth (DOCX)
Hosting & CI/CD:   Vercel Edge Network
```

---

## 🗄️ Snowflake Schema Design

The database schema is configured in database `TMSL_AI`, schema `PUBLIC`:

```sql
-- 1. Document Registry
CREATE TABLE IF NOT EXISTS DOCUMENTS (
    DOCUMENT_ID VARCHAR(36) PRIMARY KEY,
    TITLE VARCHAR(255) NOT NULL,
    CATEGORY VARCHAR(64) NOT NULL,
    RAW_CONTENT TEXT NOT NULL,
    CHUNK_COUNT INT DEFAULT 0,
    UPLOADED_BY VARCHAR(64) DEFAULT 'Admin',
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 2. Document Chunks for Similarity Search
CREATE TABLE IF NOT EXISTS DOCUMENT_CHUNKS (
    CHUNK_ID VARCHAR(36) PRIMARY KEY,
    DOCUMENT_ID VARCHAR(36) REFERENCES DOCUMENTS(DOCUMENT_ID) ON DELETE CASCADE,
    DOCUMENT_TITLE VARCHAR(255) NOT NULL,
    CATEGORY VARCHAR(64) NOT NULL,
    CHUNK_INDEX INT NOT NULL,
    CHUNK_TEXT TEXT NOT NULL,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 3. Campus Events & Deadlines
CREATE TABLE IF NOT EXISTS EVENTS (
    EVENT_ID VARCHAR(36) PRIMARY KEY,
    DOCUMENT_ID VARCHAR(36) REFERENCES DOCUMENTS(DOCUMENT_ID) ON DELETE CASCADE,
    EVENT_NAME VARCHAR(255) NOT NULL,
    EVENT_TYPE VARCHAR(64) NOT NULL,
    START_DATE TIMESTAMP_NTZ,
    LOCATION VARCHAR(255),
    ORGANIZER VARCHAR(255),
    REGISTRATION_DEADLINE TIMESTAMP_NTZ,
    ELIGIBILITY TEXT,
    DETAILS TEXT,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);

-- 4. Audit Queries & Citation Telemetry
CREATE TABLE IF NOT EXISTS QUERIES (
    QUERY_ID VARCHAR(36) PRIMARY KEY,
    USER_QUERY TEXT NOT NULL,
    AI_RESPONSE TEXT NOT NULL,
    CITATIONS VARIANT,
    LATENCY_MS INT,
    CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
);
```

---

## 🔌 API Reference

| Endpoint | Method | Payload / Params | Description |
|---|---|---|---|
| `/api/auth/login` | `POST` | `{"email", "password"}` | Authenticates student or admin. |
| `/api/auth/register` | `POST` | `{"name", "email", "password", "rollNumber", "department", "year"}` | Registers a new student account. |
| `/api/auth/students` | `GET` | — | Lists registered students for the admin directory. |
| `/api/events` | `GET` | `?category=...&upcoming=true` | List campus events with ISO dates and categories. |
| `/api/events` | `POST` | Event metadata payload | Create a new campus event (Admin only). |
| `/api/events/[id]` | `DELETE`| — | Delete an event (Admin only). |
| `/api/events/[id]/registrations` | `GET` | — | Get all registrations and group-wise breakdown for an event. |
| `/api/events/[id]/registrations` | `POST` | Registration payload (solo / team) | Submit a verified event registration. |
| `/api/events/registrations/my` | `GET` | `?email=...` | Get event IDs registered by the authenticated student. |
| `/api/documents` | `GET` | `?category=...&search=...` | List all documents with chunk counts from Snowflake. |
| `/api/documents/upload` | `POST` | `multipart/form-data` | Ingest PDF/DOCX/TXT, auto-chunk, and insert into Snowflake. |
| `/api/documents/[id]` | `GET` | — | Retrieve document metadata and its associated chunks. |
| `/api/documents/[id]` | `DELETE`| — | Cascade delete a document and its chunks from Snowflake. |
| `/api/documents/[id]/summarize` | `POST` | — | Generate structured AI summary using Groq + Snowflake content. |
| `/api/chat` | `POST` | `{"question": "..."}` | Run Snowflake RAG retrieval + Groq synthesis + query audit log. |
| `/api/search` | `POST` | `{"query": "..."}` | Rank chunks via Snowflake `JAROWINKLER_SIMILARITY`. |
| `/api/analytics` | `GET` | — | Fetch real-time metrics, query volume, and category stats. |

---

## 🚀 Quick Start & Local Setup

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **Snowflake Account**: Any standard, trial, or enterprise account
* **Groq API Key**: Free tier available at [console.groq.com](https://console.groq.com/)

### 1. Clone Repository
```bash
git clone https://github.com/omjeesingh882-bit/AI_HACKATHON.git
cd AI_HACKATHON
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the project root:
```env
# Snowflake Configuration
SNOWFLAKE_ACCOUNT=your_account_identifier (e.g. ORG-ACCOUNT)
SNOWFLAKE_USER=your_snowflake_username
SNOWFLAKE_PASSWORD=your_snowflake_password
SNOWFLAKE_DATABASE=TMSL_AI
SNOWFLAKE_SCHEMA=PUBLIC
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
SNOWFLAKE_ROLE=ACCOUNTADMIN

# Groq AI Inference
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
DEMO_MODE=true
```

### 4. Setup Snowflake Worksheet
1. Log into your **Snowflake Web UI**.
2. Open a new SQL Worksheet.
3. Run [`snowflake/schema.sql`](snowflake/schema.sql) to create required tables.
4. *(Optional)* Run [`snowflake/seed.sql`](snowflake/seed.sql) to seed sample circulars and hackathons.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deployment

The project is optimized for deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com).
3. Configure Environment Variables (`SNOWFLAKE_*`, `GROQ_*`) in the Vercel project settings.
4. Deploy!

Live production deployment: **[https://ai-hackathon-blush.vercel.app/](https://ai-hackathon-blush.vercel.app/)**

---

## 👥 Team & Contributors

* **Contributors**:
  * [Omjee Singh](https://github.com/omjeesingh882-bit)
  * [Mehar12373](https://github.com/Mehar12373) - `meharaliya24@gmail.com`
* **Team**: TMSL AI Engineering Team
* **Submitted to**: **MLH Hack Days 2026**
* **Challenge Track**: **Best Use of Snowflake**
* **Institution**: Techno Main Salt Lake (TMSL), Kolkata

Special thanks to **Snowflake** for powering native in-database computational analytics, and **Major League Hacking (MLH)** for organizing Hack Days!

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
