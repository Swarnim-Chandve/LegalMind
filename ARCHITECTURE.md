# LegalMind AI — Architecture (v2)

---

# System Overview

```text
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                               │
│                     React + Vite + Tailwind                         │
│                       localhost:5173                                │
│                                                                     │
│  ┌──────────────┐   ┌──────────────────────────────────────────┐   │
│  │   Sidebar    │   │           Main Content Area              │   │
│  │              │   │                                          │   │
│  │ Recent Chats │   │  ┌────────────┐  ┌──────────────────┐   │   │
│  │ Knowledge    │   │  │ Upload Card│  │  Question Box    │   │   │
│  │ Base         │   │  │ (PDF Drag) │  │ (+ Templates)    │   │   │
│  │              │   │  └────────────┘  └──────────────────┘   │   │
│  │ Search       │   │                                          │   │
│  │ Dark Mode    │   │  ┌────────────────────────────────────┐ │   │
│  │ New Chat     │   │  │     Live Agent Pipeline            │ │   │
│  └──────────────┘   │  │ 🔍 → 📚 → 📄/✅ → ⚠️ → 💡         │ │   │
│                     │  └────────────────────────────────────┘ │   │
│                     │                                          │   │
│                     │ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│                     │ │ Answer   │ │ Risk     │ │ Sources  │  │   │
│                     │ │ Card     │ │ Card     │ │ Card     │  │   │
│                     │ └──────────┘ └──────────┘ └──────────┘  │   │
│                     │                                          │   │
│                     │ ┌──────────────────────────────────────┐ │   │
│                     │ │ Workflow | Conversation Tabs         │ │   │
│                     │ └──────────────────────────────────────┘ │   │
│                     └──────────────────────────────────────────┘   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
                                │ HTTP / REST
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        FASTAPI BACKEND                              │
│                         localhost:8000                              │
│                                                                     │
│ POST /upload          POST /analyze         POST /ask               │
│ GET  /chats           GET  /chat/{id}       DELETE /chat/{id}      │
│ GET  /documents       DELETE /document/{id}                         │
└──────────────┬──────────────────────────────┬──────────────────────┘
               │                              │
               ▼                              ▼
┌────────────────────────┐      ┌────────────────────────────┐
│     LANGGRAPH FLOW     │      │         RAG LAYER          │
└────────────────────────┘      └────────────────────────────┘
               │                              │
               ▼                              ▼

      QueryAgent                     PDF Loader (pypdf)
            │                                │
            ▼                                ▼
     ResearchAgent                    Text Extraction
            │                                │
            ▼                                ▼
      ChromaDB Query                    Chunking
            │                         (800 chars / overlap)
            ▼                                │
  Contract / Compliance                      ▼
          Agent                        ChromaDB Storage
            │
            ▼
       RiskAgent
            │
            ▼
     SummaryAgent
            │
            ▼
      GPT-4o Response

               │
               ▼

        PostgreSQL
(chats, messages, documents)
```

---

# Application Architecture

```text
Frontend (React)
       │
       ▼
FastAPI Backend
       │
       ▼
LangGraph Workflow
       │
 ┌─────┼─────┐
 ▼     ▼     ▼
Query Research Analysis
Agent  Agent   Agents
       │
       ▼
   ChromaDB
       │
       ▼
 Uploaded PDFs

Summary Agent
       │
       ▼
GPT-4o (Capgemini Gateway)

       │
       ▼
 PostgreSQL
```

---

# Backend Components

## API Layer

### api.py

Responsibilities:

- FastAPI application entry point
- Request validation
- Error handling
- Chat creation
- Document management
- Route definitions
- Response formatting

Available APIs:

```http
POST   /upload
POST   /analyze
POST   /ask

GET    /chats
GET    /chat/{id}
GET    /documents

DELETE /chat/{id}
DELETE /document/{id}
```

---

## LangGraph Layer

### core/langgraph_workflow.py

Responsibilities:

- Graph definition
- Node orchestration
- Agent execution order
- Workflow compilation

### core/graph_nodes.py

Responsibilities:

- Wrap agent execution
- Connect nodes into graph

### core/legal_state.py

Shared state between agents:

```python
{
    "question": str,
    "intent": str,
    "context": str,
    "sources": list,
    "analysis": str,
    "risk_report": dict,
    "answer": str,
    "events": list,
    "source_filter": str | list[str] | None
}
```

The workflow also tracks document scope selection so the app can answer only from the selected PDFs, or fall back to the full knowledge base when no documents are manually selected.

---

# AI Agents

## Query Agent

File:

```text
agents/query_agent.py
```

Responsibilities:

- Classifies user intent
- Routes request
- Recognizes document-review and summary requests as legal-document tasks
- Routes clearly non-legal requests to the General Agent

Outputs:

```text
contract
or
compliance
or
general
```

---

## General Agent

File:

```text
agents/general_agent.py
```

Responsibilities:

- Handles off-topic or non-legal questions gracefully
- Returns a legal-scope response instead of mixing unrelated content into the document workflow
- Protects the app from false legal answers on generic questions

---

## Research Agent

File:

```text
agents/research_agent.py
```

Responsibilities:

- Query vector database
- Retrieve relevant chunks
- Build context
- Collect source files

Input:

```text
Question
```

Output:

```text
Context
Sources
```

---

## Contract Agent

File:

```text
agents/contract_agent.py
```

Responsibilities:

- Legal contract review
- Rights analysis
- Obligations analysis
- Clause interpretation
- Missing clause detection

Uses:

```text
GPT-4o
```

---

## Compliance Agent

File:

```text
agents/compliance_agent.py
```

Responsibilities:

- Privacy review
- Regulatory assessment
- Compliance checks
- Regulatory gap detection

Uses:

```text
GPT-4o
```

---

## Risk Agent

File:

```text
agents/risk_agent.py
```

Responsibilities:

- Risk scoring
- Risk classification
- Structured JSON generation

Output:

```json
{
  "risk_level": "High",
  "issues": [],
  "plain_english_summary": ""
}
```

---

## Summary Agent

File:

```text
agents/summary_agent.py
```

Responsibilities:

- Final answer generation
- Actionable recommendations
- Source-aware response synthesis

Uses:

```text
GPT-4o
```

---

# Retrieval-Augmented Generation (RAG)

## PDF Loader

File:

```text
rag/pdf_loader.py
```

Technology:

```text
pypdf
```

Responsibilities:

- Read uploaded PDFs
- Extract raw text

---

## Chunker

File:

```text
rag/chunker.py
```

Configuration:

```text
Chunk Size: 800 chars
Overlap: 150 chars
```

Responsibilities:

- Split text
- Preserve context
- Maintain sentence boundaries

---

## Vector Database

File:

```text
rag/vectordb.py
```

Technology:

```text
ChromaDB Persistent Client
```

Responsibilities:

- Store document chunks
- Semantic retrieval
- Similarity search

Collection:

```text
legal_docs
```

Storage:

```text
chroma_db/
```

---

## PDF Ingestion

File:

```text
rag/pdf_ingest.py
```

Responsibilities:

```text
PDF
  ↓
Text Extraction
  ↓
Chunking
  ↓
Vector Storage
  ↓
Document Registration
```

---

# LLM Layer

## Primary LLM

File:

```text
rag/llm_openai.py
```

Provider:

```text
Capgemini OpenAI Gateway
```

Model:

```text
openai.gpt-4o
```

Base URL:

```text
https://openai.generative.engine.capgemini.com/v1
```

Responsibilities:

- General Legal Q&A
- Contract Analysis
- Compliance Review
- Risk Evaluation
- Final Response Generation

---

# Database Layer

## PostgreSQL

Database:

```text
legalmind
```

Tables:

### chats

Stores:

```text
Chat sessions
```

### messages

Stores:

```text
Conversation history
```

### documents

Stores:

```text
Uploaded document metadata
```

---

# Document Upload Flow

```text
User uploads PDF
        │
        ▼
POST /upload
        │
        ▼
Validate File
        │
        ▼
Check Duplicate
        │
        ▼
Delete Old Chunks
        │
        ▼
Extract Text (pypdf)
        │
        ▼
Chunk Text
        │
        ▼
Store in ChromaDB
        │
        ▼
Save Metadata
        │
        ▼
Update Knowledge Base
```

---

# Analysis Flow

```text
User Question
      │
      ▼
POST /analyze
      │
      ▼
Save Chat
      │
      ▼
QueryAgent
      │
      ▼
ResearchAgent
      │
      ▼
Retrieve Context
      │
      ▼
Contract Agent
or
Compliance Agent
      │
      ▼
RiskAgent
      │
      ▼
SummaryAgent
      │
      ▼
Store Response
      │
      ▼
Return Results
```

---

# General Legal Assistant Flow

```text
User Question
      │
      ▼
POST /ask
      │
      ▼
GPT-4o
      │
      ▼
Legal Response
```

No document upload required.

No vector search required.

No LangGraph workflow required.

---

# Frontend Components

## pages

```text
pages/ChatPage.jsx
```

Main application screen.

---

## components

```text
Sidebar.jsx
QuestionBox.jsx
UploadCard.jsx
LiveAgentStatus.jsx
AnswerCard.jsx
RiskCard.jsx
SourcesCard.jsx
AgentTrace.jsx
ResultTabs.jsx
ChatHistory.jsx
LegalAssistant.jsx
EmptyState.jsx
Toast.jsx
```

---

## Context

```text
context/AppContext.jsx
```

Stores:

```text
Chats
Documents
Theme
Notifications
Current Conversation
```

---

## API Integration

```text
api/apiClient.js
```

Responsibilities:

- Axios configuration
- API communication
- Error interception

---

# Current Features

## Knowledge Base

✅ PDF Upload

✅ Automatic Chunking

✅ ChromaDB Storage

✅ Retrieval-Based Search

✅ Duplicate Upload Handling

✅ Document Deletion

---

## Legal Analysis

✅ Contract Review

✅ Compliance Review

✅ Risk Assessment

✅ Plain-English Explanations

✅ Source References

---

## Chat Features

✅ Persistent Chat History

✅ Chat Retrieval

✅ Chat Deletion

✅ Conversation View

---

## User Experience

✅ Dark Mode

✅ Toast Notifications

✅ Workflow Visualization

✅ Source Tracking

✅ Agent Runtime Metrics

---

# Tech Stack

```text
Frontend
--------
React 19
Vite
Tailwind CSS v4
Axios
React Markdown
remark-gfm
jsPDF

Backend
-------
FastAPI
LangGraph
OpenAI SDK
SQLAlchemy
pypdf
Python 3.14

AI
--
GPT-4o (Capgemini Gateway)

RAG
---
ChromaDB

Database
--------
PostgreSQL 17
```

---

# Project Status

```text
Version: 2.0

Architecture:
✅ Multi-Agent AI
✅ RAG Enabled
✅ Persistent Knowledge Base
✅ Chat Persistence
✅ GPT-4o Integration
✅ PostgreSQL Storage
✅ ChromaDB Retrieval
✅ Source Attribution
✅ Risk Intelligence
✅ Document Management
```
