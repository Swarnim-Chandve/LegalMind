# LegalMind AI — Start Guide

Complete step-by-step instructions to get LegalMind running from scratch on any Windows machine.

---

# Part 1 — Prerequisites

## 1.1 Install Python

1. Download Python 3.11+ from:
   https://www.python.org/downloads/

2. Run the installer.

3. Check:

```text
✅ Add Python to PATH
```

4. Click Install.

5. Verify:

```powershell
python --version
```

Expected:

```text
Python 3.11+
```

---

## 1.2 Install Node.js

1. Download Node.js LTS from:

```text
https://nodejs.org
```

2. Install using default settings.

3. Verify:

```powershell
node --version
npm --version
```

---

## 1.3 Install PostgreSQL

1. Download PostgreSQL 17 from:

```text
https://www.postgresql.org/download/windows/
```

2. Install PostgreSQL.

3. Remember the password used for:

```text
postgres
```

4. Keep default port:

```text
5432
```

5. Verify:

```powershell
psql --version
```

---

## 1.4 Obtain OpenAI Gateway Access

LegalMind uses GPT-4o through the Capgemini OpenAI Gateway.

You will need:

```text
OPENAI_API_KEY
OPENAI_BASE_URL
```

Example:

```env
OPENAI_API_KEY=your_key_here

OPENAI_BASE_URL=https://openai.generative.engine.capgemini.com/v1

CHAT_MODEL=openai.gpt-4o
```

---

# Part 2 — Backend Setup

## 2.1 Create Virtual Environment

Open PowerShell:

```powershell
py -m venv C:\Users\<your-username>\legalmind_venv
```

Example:

```powershell
py -m venv C:\Users\Swarnim\legalmind_venv
```

---

## 2.2 Activate Virtual Environment

```powershell
C:\Users\<your-username>\legalmind_venv\Scripts\activate
```

Expected:

```powershell
(venv)
```

appears in the terminal.

---

## 2.3 Install Backend Dependencies

Navigate to the project:

```powershell
cd C:\path\to\legalmind\backend
```

Install requirements:

```powershell
pip install -r requirements.txt
```

---

## 2.4 Create Environment Variables

Create:

```text
backend/.env
```

Contents:

```env
OPENAI_API_KEY=your_api_key

OPENAI_BASE_URL=https://openai.generative.engine.capgemini.com/v1

CHAT_MODEL=openai.gpt-4o

DATABASE_URL=postgresql://postgres:your_postgres_password@localhost:5432/legalmind
```

Replace:

```text
your_api_key
your_postgres_password
```

with actual values.

---

## 2.5 Create PostgreSQL Database

Open PowerShell:

```powershell
$env:PGPASSWORD="your_postgres_password"

psql -U postgres -c "CREATE DATABASE legalmind;"
```

Expected:

```text
CREATE DATABASE
```

---

## 2.6 Create Database Tables

From:

```text
backend/
```

Run:

```powershell
python scripts\init_db.py
```

Expected:

```text
Database initialized successfully
```

---

## 2.7 Start Backend

From:

```text
backend/
```

Run:

```powershell
uvicorn api:app --reload
```

Expected:

```text
INFO: Uvicorn running on http://127.0.0.1:8000
INFO: Application startup complete
```

Swagger UI:

```text
http://localhost:8000/docs
```

Keep this terminal running.

---

## 2.8 Using Document Scope in the App

Once the frontend is running, the app lets you choose the document scope before asking a question:

- Leave all documents unchecked to search the full knowledge base
- Select one or more specific documents to answer only from that subset
- If the selected document does not match the legal question topic, the app will warn you instead of answering from the wrong contract type

This is especially important for cases like vendor agreement vs NDA confusion.

---

---

# Part 3 — Frontend Setup

Open a new PowerShell window.

---

## 3.1 Navigate to Frontend

```powershell
cd C:\path\to\legalmind\frontend
```

---

## 3.2 Install Dependencies

```powershell
npm install
```

---

## 3.3 Start Frontend

```powershell
npm run dev
```

Expected:

```text
Local: http://localhost:5173
```

---

## 3.4 Open Application

Open:

```text
http://localhost:5173
```

in your browser.

---

# Part 4 — First-Time Usage

## Upload a Document

1. Open Document Analysis mode.
2. Upload a legal PDF.
3. Wait for upload completion.

Expected:

```text
filename.pdf uploaded successfully
```

4. Document appears in:

```text
Knowledge Base
```

sidebar section.

---

## Ask Questions About the Document

Examples:

```text
Summarize this contract

What are the risks?

What obligations do I have?

Can I terminate early?

Are there compliance issues?
```

The system performs:

```text
Query Agent
↓
Research Agent
↓
Contract/Compliance Agent
↓
Risk Agent
↓
Summary Agent
```

---

## Use Legal Assistant Mode

Open:

```text
Legal Assistant
```

No document required.

Example questions:

```text
What is GDPR?

What is force majeure?

What is Article 420 of IPC?

What is a non-compete clause?
```

---

## Review Chat History

Open:

```text
Recent Chats
```

to revisit previous conversations.

---

## Manage Knowledge Base

Available features:

```text
View uploaded documents
Delete documents
Replace duplicate uploads
```

---

## Export PDF Reports

After an analysis completes:

```text
Export PDF
```

to download the report.

---

# Part 5 — API Testing

Swagger Documentation:

```text
http://localhost:8000/docs
```

---

## Upload Document

```http
POST /upload
```

Upload a PDF.

---

## Analyze Documents

```http
POST /analyze
```

Example:

```json
{
  "question": "Summarize this contract"
}
```

---

## General Legal Assistant

```http
POST /ask
```

Example:

```json
{
  "question": "What is force majeure?"
}
```

---

## List Documents

```http
GET /documents
```

---

## Delete Document

```http
DELETE /document/{id}
```

---

## List Chats

```http
GET /chats
```

---

## Get Chat Messages

```http
GET /chat/{id}
```

---

## Delete Chat

```http
DELETE /chat/{id}
```

---

# Part 6 — Stopping the Application

Backend:

```powershell
Ctrl + C
```

Frontend:

```powershell
Ctrl + C
```

---

# Part 7 — Restarting After a Reboot

Only these two commands are required.

## Backend

```powershell
cd C:\path\to\legalmind\backend

uvicorn api:app --reload
```

---

## Frontend

```powershell
cd C:\path\to\legalmind\frontend

npm run dev
```

---

Open:

```text
http://localhost:5173
```

---

# Part 8 — Current Architecture

```text
Frontend
  React + Vite + Tailwind
           │
           ▼

FastAPI Backend
           │
           ▼

LangGraph Workflow
           │
 ┌─────────┼─────────┐
 ▼         ▼         ▼

Query  Research  Analysis
Agent    Agent    Agents

           │
           ▼

       ChromaDB
           │
           ▼

      Knowledge Base
       (Uploaded PDFs)

           │
           ▼

        GPT-4o
(Capgemini OpenAI Gateway)

           │
           ▼

      PostgreSQL
```

---

# Part 9 — Troubleshooting

## Uvicorn Not Found

Run:

```powershell
pip install uvicorn
```

or

```powershell
python -m uvicorn api:app --reload
```

---

## PostgreSQL Database Not Found

Create it manually:

```powershell
psql -U postgres -c "CREATE DATABASE legalmind;"
```

---

## Backend Fails to Start

Verify:

```env
OPENAI_API_KEY
OPENAI_BASE_URL
DATABASE_URL
```

exist in:

```text
backend/.env
```

---

## Frontend Cannot Reach Backend

Check backend:

```text
http://localhost:8000/docs
```

If unavailable:

```powershell
uvicorn api:app --reload
```

---

## Upload Works But Answers Fail

Verify:

```env
OPENAI_API_KEY
OPENAI_BASE_URL
CHAT_MODEL=openai.gpt-4o
```

---

## ChromaDB Issues

Delete local vector database:

```powershell
Remove-Item -Recurse -Force chroma_db
```

Restart backend and re-upload documents.

---

## Database Reset

Delete all chats:

```http
DELETE /chat/{id}
```

Delete all documents:

```http
DELETE /document/{id}
```

or recreate the PostgreSQL database.

---

# ✅ Verification Checklist

After setup you should have:

```text
✅ Frontend running on localhost:5173

✅ Backend running on localhost:8000

✅ Swagger available

✅ PostgreSQL connected

✅ ChromaDB initialized

✅ PDF upload working

✅ Document analysis working

✅ Legal Assistant working

✅ Chat history working

✅ Knowledge Base working

✅ GPT-4o responses working
```

LegalMind is now fully configured and ready for use.
