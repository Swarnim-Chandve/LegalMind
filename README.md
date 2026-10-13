# ⚖️ LegalMind AI

A multi-agent legal intelligence platform powered by LangGraph, LLMs (Groq, OpenAI, Gemini, Ollama), ChromaDB, and SQLite / PostgreSQL.

Upload legal documents, build a private knowledge base, ask questions in plain English, and receive structured AI-powered legal analysis including obligations, risks, recommendations, source citations, and conversation history.

---

## 🚀 What It Does

### 📄 Legal Document Analysis

Upload:

- NDA
- Employment Agreement
- Service Agreement
- Privacy Policy
- Vendor Contract
- Any Legal PDF

Then ask questions such as:

- "What are my risks?"
- "Can I terminate this agreement early?"
- "What obligations do I have?"
- "Summarize this contract."
- "Are there any compliance concerns?"

LegalMind returns:

- Structured summaries
- Risk assessment
- Plain-English explanations
- Recommendations
- Source citations
- Document-scoped answers from selected PDFs
- Clear mismatch warnings when the chosen document does not match the question

---

### 🤖 General Legal Assistant

No document required.

Ask questions such as:

- "What is force majeure?"
- "What is GDPR?"
- "What is Article 420 of the IPC?"
- "Is unlimited liability enforceable?"
- "What is a non-compete clause?"

Powered by flexible OpenAI-compatible LLMs (Groq, OpenAI, Google Gemini, Ollama).

---

### 🧠 Multi-Agent AI Pipeline

LegalMind uses specialized AI agents working together:

```text
Query Agent
    ↓
Research Agent
    ↓
Contract / Compliance Agent
    ↓
Risk Agent
    ↓
Summary Agent
```

Each agent performs a specific task and contributes to the final response.

Current workflow behavior also includes:

- document-summary questions like “summarise these documents” are routed to the legal document flow
- off-topic questions are sent to the General Agent with a defined legal-scope response
- selected-document validation prevents mismatched contract types from being analyzed together

---

### 📚 Knowledge Base

Build your own legal knowledge repository.

Features:

- Upload PDFs
- Semantic document search
- Persistent knowledge storage
- Source-aware retrieval
- Duplicate document detection
- Multi-document scope selection using checkbox-style document filtering
- “All documents” mode as default search scope
- Scoped-response validation against the selected legal document set

---

### 💬 Conversation Management

- Persistent chat history
- Previous analysis retrieval
- Chat deletion
- Conversation timeline

---

### ⚠️ Risk Intelligence & Negotiation Redlining

Automatically identifies and remedies contract risks:

- High, Medium, and Low risk clause categorization
- Compliance gaps and missing protections
- Ambiguous or one-sided liability language
- **Contract Redlining & Counter-Clauses**: Proposes safe, balanced replacement clauses and negotiation rationale for identified risks
- Document-topic mismatch warnings before analysis begins

---

### 📊 Automated Evaluation Benchmark (`evals/`)

Production-grade evaluation suite measuring:

- **Risk Classification Accuracy**: Validates model risk predictions against golden datasets
- **Key Fact Recall**: Verifies that mandatory terms (notice periods, penalty sums, carveouts) are retained
- **Faithfulness / Hallucination Detection**: Ensures claims are grounded in document facts
- **Automated Markdown Reporting**: Generates [`eval_report.md`](backend/evals/eval_report.md) with test breakdowns

---

### 📑 Report Export

Export analysis results into downloadable PDF reports.

---

## 🛠 Tech Stack

| Layer              | Technology               |
| ------------------ | ------------------------ |
| Frontend           | React 19, Vite, Tailwind CSS v4 |
| Backend            | FastAPI, Uvicorn, Python 3.11+ |
| Agent Orchestration| LangGraph (DAG StateGraph) |
| LLM Providers      | Groq (Llama-3 / GPT-OSS), OpenAI, Google Gemini, Ollama |
| Vector Database    | ChromaDB (Local ONNX embeddings) |
| Relational Storage | SQLite (Zero-config) / PostgreSQL 15+ |
| ORM                | SQLAlchemy 2             |
| Evaluation         | Custom Golden Benchmark Framework (`evals/`) |
| Observability      | LangSmith / Tracing Support |
| Containerization   | Docker, Docker Compose   |
| PDF Processing     | pypdf                    |
| PDF Export         | jsPDF                    |

---

## ✅ Features

### Legal Analysis

- Contract Review & Clause Extraction
- Compliance Review (GDPR, Standard Contractual Clauses)
- Multi-Perspective Risk Assessment (High/Medium/Low)
- **Contract Redline & Counter-Clause Generation**
- Source Attribution with Page Citations
- Plain-English Recommendations
- Document Scope & Topic Validation


### Knowledge Base

- PDF Upload
- Semantic Search
- Persistent Vector Storage
- Duplicate Detection
- Source Tracking

### Conversation Management

- Chat History
- Chat Retrieval
- Chat Deletion
- Conversation Replay

### User Experience

- Dark Mode
- Workflow Visualization
- Agent Execution Timeline
- Toast Notifications
- PDF Report Export

---

---

## 📋 Prerequisites

### Backend
- Python 3.11+
- SQLite (built-in, zero setup) or PostgreSQL 15+

### Frontend
- Node.js 18+

### AI Access (Any OpenAI-Compatible Provider)
- Groq Cloud API key (Free tier supported)
- *OR* Google Gemini API key (Free tier supported)
- *OR* OpenAI API key
- *OR* Local Ollama instance (Offline)

---

## ⚡ Quick Start

### 1. Clone Repository
```bash
git clone <repository-url>
cd legalmind
```

### 2. Configure Backend Environment
Copy the example environment file and configure your API key:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your preferred provider (e.g. Groq free tier):
```env
PROVIDER=openai
OPENAI_API_KEY=gsk_your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
CHAT_MODEL=openai/gpt-oss-120b
DATABASE_URL=sqlite:///./legalmind.db
```

### 3. Setup and Start Backend

#### On Linux / macOS (Bash / Zsh):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

#### On Linux / macOS (Fish Shell):
```fish
cd backend
python3 -m venv venv
source venv/bin/activate.fish
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

#### On Windows (PowerShell):
```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn api:app --reload --port 8000
```

Backend URLs:
- **API Server:** `http://localhost:8000`
- **Interactive Swagger Docs:** `http://localhost:8000/docs`

### 4. Setup and Start Frontend
In a separate terminal window:
```bash
cd frontend
npm install
npm run dev
```

Frontend URL:
- **Application:** `http://localhost:5173`

---

## 🔐 Environment Variables

Reference template is available in [`backend/.env.example`](backend/.env.example). Supported options:

### Option 1: Groq Cloud (Free & Ultra-Fast)
```env
PROVIDER=openai
OPENAI_API_KEY=gsk_...
OPENAI_BASE_URL=https://api.groq.com/openai/v1
CHAT_MODEL=openai/gpt-oss-120b
DATABASE_URL=sqlite:///./legalmind.db
```

### Option 2: Google Gemini (Free Tier, 1M+ Token Context)
```env
PROVIDER=openai
OPENAI_API_KEY=AIzaSy_...
OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
CHAT_MODEL=gemini-2.0-flash
DATABASE_URL=sqlite:///./legalmind.db
```

### Option 3: Official OpenAI
```env
PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
OPENAI_BASE_URL=https://api.openai.com/v1
CHAT_MODEL=gpt-4o-mini
DATABASE_URL=sqlite:///./legalmind.db
```

### Option 4: Local Ollama (100% Offline)
```env
PROVIDER=openai
OPENAI_API_KEY=ollama
OPENAI_BASE_URL=http://localhost:11434/v1
CHAT_MODEL=llama3.1
DATABASE_URL=sqlite:///./legalmind.db
```

---

## 📊 Running Evaluation Benchmarks

LegalMind includes an automated evaluation suite to benchmark model accuracy, risk categorization, and key fact recall across complex legal scenarios.

To run the automated benchmark:

```bash
cd backend
python evals/run_evals.py
```

This runs against [`backend/evals/golden_dataset.json`](backend/evals/golden_dataset.json) and outputs an updated performance report in [`backend/evals/eval_report.md`](backend/evals/eval_report.md).

---


## 🌐 API Endpoints

### Legal Analysis

#### Analyze Uploaded Documents

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

### General Legal Assistant

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

### Knowledge Base

#### Upload PDF

```http
POST /upload
```

#### List Documents

```http
GET /documents
```

#### Delete Document

```http
DELETE /document/{id}
```

---

### Conversation Management

#### List Chats

```http
GET /chats
```

#### Get Chat

```http
GET /chat/{id}
```

#### Delete Chat

```http
DELETE /chat/{id}
```

---

## 🏛 Architecture

See:

```text
ARCHITECTURE.md
```

for the complete system diagram and component breakdown.

---

## 📂 Project Structure

```text
legalmind/
├── backend/
│
├── api.py
│
├── agents/
│   ├── query_agent.py
│   ├── research_agent.py
│   ├── contract_agent.py
│   ├── compliance_agent.py
│   ├── risk_agent.py
│   └── summary_agent.py
│
├── core/
│   ├── langgraph_workflow.py
│   ├── graph_nodes.py
│   └── legal_state.py
│
├── rag/
│   ├── llm_openai.py
│   ├── vectordb.py
│   ├── chunker.py
│   ├── pdf_loader.py
│   └── pdf_ingest.py
│
├── database/
│   ├── connection.py
│   ├── models.py
│   └── crud.py
│
├── data/contracts/
├── chroma_db/
│
├── scripts/
│   └── init_db.py
│
├── frontend/
│   ├── pages/
│   ├── components/
│   ├── api/
│   ├── context/
│   └── utils/
│
├── README.md
├── ARCHITECTURE.md
├── START_GUIDE.md
├── DEMO_SCRIPT.md
└── .gitignore
```

---

## 🔄 Analysis Workflow

```text
User Question
      │
      ▼
Query Agent
      │
      ▼
Research Agent
      │
      ▼
ChromaDB Retrieval
      │
      ▼
Contract Agent
or
Compliance Agent
      │
      ▼
Risk Agent
      │
      ▼
Summary Agent
      │
      ▼
GPT-4o Response
```

---

## 📤 Document Upload Workflow

```text
PDF Upload
     │
     ▼
Text Extraction (pypdf)
     │
     ▼
Chunking
     │
     ▼
ChromaDB Storage
     │
     ▼
Knowledge Base Update
```

---

## 🎬 Demo

See:

```text
DEMO_SCRIPT.md
```

for a complete demo walkthrough with:

- Demo flow
- Presentation script
- User questions
- Expected outputs

---

## 📌 Current Version

```text
LegalMind AI v2

✅ GPT-4o Integration
✅ LangGraph Multi-Agent Workflow
✅ ChromaDB Knowledge Base
✅ PostgreSQL Persistence
✅ Risk Assessment
✅ Source Attribution
✅ Document Management
✅ Conversation History
✅ PDF Export
✅ Dark Mode
```
