<p align="center">
  <img src="docs/images/logo.png" alt="SuperFact Logo" width="420" />
</p>
<p align="center">
  <strong>Extract grounded facts from PDFs. Discover corroborations, contradictions, and contextual nuances across documents — automatically.</strong>
</p>

<p align="center">
  <a href="https://python.org"><img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" /></a>
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" /></a>
  <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" /></a>
  <a href="https://www.docker.com"><img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" /></a>
  <a href="https://prometheus.io"><img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus" /></a>
  <a href="https://grafana.com"><img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana" /></a>
</p>

---

## 🎯 Overview

Important facts are often **scattered across documents**, stated in different ways, supported by other evidence, or contradicted elsewhere. SuperFact is a full-stack AI system that:

<p align="center">
  <img src="Results/SuperFact-DEMO.gif" alt="SuperFact-DEMO" width="600" height="400" />
</p>

- 📄 **Extracts** meaningful numerical and semantic facts from uploaded PDFs
- 🔗 **Grounds** every fact to verbatim evidence with page numbers from the source document
- 🔍 **Discovers** when facts across documents **corroborate**, **contradict**, or can be **reconciled through context** (time, scope, units)
- 🧠 **Explains** its reasoning for every cross-document relationship
- ⚡ **Processes 100-page PDFs in under 90 seconds** using Multi-Page Batching (5x faster than naive per-page extraction)

> **Not just a graph database.** The interesting part is how facts are discovered, grounded, compared, and explained — not a visualization layer.

---

## ✨ Key Features

| Feature | Description |
| --- | --- |
| 🎯 **Structured Fact Extraction** | LLM extracts facts into a strict Pydantic schema — no freeform text. Every fact has a category, confidence score, unit, and verbatim evidence snippet |
| 📎 **Evidence Grounding** | Each fact is linked to its exact page number and quoted source text from the PDF |
| 🚀 **Multi-Page Batching (5x Faster)** | Groups 4–5 pages per LLM call instead of 1-page-per-call. A 100-page PDF needs only ~20 API calls instead of 100 — finishing in under 90 seconds with zero rate-limit issues |
| ⚡ **FAISS Semantic Matching** | Avoids O(N²) pairwise comparison — uses vector similarity to find fact candidates across documents |
| 🤝 **Cross-Document Reconciliation** | LLM classifies relationships as Corroborated, Contradiction, or Contextual with detailed reasoning |
| 📊 **Interactive Dashboard** | Real-time fact explorer with filtering by document, category, confidence, and relationship type |
| 🗑️ **1-Click Document Management** | Upload via drag-and-drop, process in-pipeline, delete with cascade cleanup |
| 📈 **Production Monitoring** | Prometheus metrics + Grafana dashboards for API latency, error rates, and pipeline health |
| 🧪 **18 Integration Tests** | Covers parsing, extraction, reconciliation, and all API endpoints |
| 🐳 **Docker Compose** | Single command to launch the full stack (Backend + Frontend + Postgres + Prometheus + Grafana) |

---

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Vanilla CSS |
| **Backend** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy 2.0 (async) |
| **Database** | SQLite (dev) / PostgreSQL 15 (prod via Docker Compose) |
| **AI / ML** | Google Gemini 2.0 Flash, Sentence-Transformers (`all-MiniLM-L6-v2`), FAISS (flat inner-product) |
| **PDF Parsing** | PyMuPDF (fitz) — page-aware text extraction with multi-page batching |
| **Monitoring** | Prometheus client (Python), Grafana 10.3 |
| **Containerization** | Docker, Docker Compose (5 services) |
| **Testing** | pytest, pytest-asyncio (18 integration tests) |

---

## 🏗️ Architecture

<p align="center">
  <img src="docs/images/architecture.jpg" alt="SuperFact System Architecture" width="800" height="500" />
</p>

**Stage 1 — Ingest & Parse (with Multi-Page Batching)**
- PyMuPDF extracts text page-by-page preserving page boundaries
- Pages with <60 characters are skipped (headers/footers/boilerplate)
- **Multi-Page Batching:** Instead of 1 LLM call per page, pages are grouped into batches of 4–5 with explicit `--- PAGE N ---` markers. This reduces a 100-page document from 100 API calls to just ~20, completing in under 90 seconds while preserving exact page-level citations.

**Stage 2 — Extract & Validate**
- Gemini Flash extracts facts using structured JSON mode matching the `ExtractedFact` Pydantic schema
- Pydantic v2 handles parsing, type casting, and range-checks (confidence clamped to 0.0–1.0)
- Low-confidence facts are flagged with an "honesty audit" for human review

**Stage 3 — Reconcile & Classify**
- `all-MiniLM-L6-v2` embeds each fact into a 384-dimensional vector
- FAISS flat inner-product index finds semantically similar facts across different documents
- The LLM evaluates candidate pairs and classifies them as **Corroborated**, **Contradiction**, or **Contextual**

---

## 📂 Project Structure

```
SuperFact/
├── backend/
│   ├── app/
│   │   ├── api/                # REST endpoints (documents, facts, relationships, showcase)
│   │   ├── llm/                # Gemini/OpenAI client & prompt templates
│   │   ├── models/             # SQLAlchemy models (Document, Fact, Relationship, Issue)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Core logic (parsing, extraction, reconciliation, FAISS, pipeline)
│   │   ├── config.py           # Pydantic-settings with pathlib resolution
│   │   ├── database.py         # Async SQLAlchemy engine + session factory
│   │   ├── metrics.py          # Prometheus middleware & custom counters
│   │   └── main.py             # FastAPI app factory, CORS, lifespan
│   ├── scripts/                # Database seeder for development
│   ├── tests/                  # 18 integration tests (API, extraction, reconciliation)
│   ├── uploads/                # Uploaded PDF storage
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js pages (dashboard, upload, facts, relationships)
│   │   ├── lib/                # API client, TypeScript types, utilities
│   │   └── styles/             # Component-level CSS modules
│   ├── Dockerfile
│   └── package.json
├── monitoring/
│   ├── prometheus/             # Scrape config targeting backend /metrics
│   └── grafana/                # Pre-built dashboards & auto-provisioned datasources
├── docs/                       # Architecture, Design, PRD documentation
├── starter-datasets/           # Three PDF starter documents
├── docker-compose.yml          # Full 5-service stack
└── .env.example                # Environment variable template
```

---

## 🎯 The Four Required Cases

SuperFact demonstrates all four cases required by the assignment:
<p align="center">
<img width="800" height="500"  alt="image" src="https://github.com/user-attachments/assets/0b699c32-79f1-4c89-9cb9-c6c6c782d20c" />
</p>

### 1️⃣ Corroborated Fact
> A fact confirmed across documents, even if expressed differently.

**Example:** Revenue figures from an annual report corroborated by an IPO prospectus — different wording, same underlying data. SuperFact matches them via FAISS similarity and the LLM confirms the relationship with reasoning.

### 2️⃣ Genuine Contradiction
> Two facts that directly conflict with each other.

**Example:** A financial metric reported differently across two filings with no contextual explanation. SuperFact flags this as a `Contradiction` with confidence reasoning.

### 3️⃣ Contextual Reconciliation
> An apparent contradiction explained by context (time, scope, or units).

**Example:** Two revenue figures that differ because they cover different fiscal years. SuperFact classifies this as `Contextual` and explains the temporal scope difference.

### 4️⃣ Extraction/Reasoning Failure
> An extraction error and how it was handled.

**Example:** A complex table where the LLM misattributes a value to the wrong column. SuperFact logs this as an `Issue` with the extraction category and details on how the pipeline's confidence thresholding and Pydantic clamping mitigate downstream impact.

---

## ⚡ Quick Start

### Prerequisites

| Tool | Version | Purpose |
| --- | --- | --- |
| ![Python](https://img.shields.io/badge/-Python-3776AB?style=flat-square&logo=python&logoColor=white) | 3.11+ | Backend runtime |
| ![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white) | 18+ | Frontend runtime |
| ![Docker](https://img.shields.io/badge/-Docker-2496ED?style=flat-square&logo=docker&logoColor=white) | Latest | Containerization (Option A) |
| ![Gemini](https://img.shields.io/badge/-Gemini_API-4285F4?style=flat-square&logo=google&logoColor=white) | — | LLM for extraction & reconciliation |

#### Option A: Docker Compose (Recommended) 🐳

The fastest way — runs all 5 services in one command:

```bash
# 1. Clone the repository
git clone https://github.com/StackItHQ/superjoin-engineering-explorer-vit-2026-harishy0406.git
cd superjoin-engineering-explorer-vit-2026-harishy0406

# 2. Create your .env file
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# 3. Launch everything
docker compose up --build
```

| Service | URL |
| --- | --- |
| 🌐 Frontend | [http://localhost:3000](http://localhost:3000) |
| ⚙️ Backend API | [http://localhost:8000](http://localhost:8000) |
| 📖 Swagger Docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| 📊 Prometheus | [http://localhost:9090](http://localhost:9090) |
| 📈 Grafana | [http://localhost:3001](http://localhost:3001) (admin/admin) |

#### Option B: Local Manual Setup 🛠️

##### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate
# Activate (macOS/Linux)
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env — add your GEMINI_API_KEY

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

##### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```
##### 3. Running Tests:
To run the automated backend test suite (covering PyMuPDF parsing, Pydantic validation, FAISS matching, and API endpoints):
```bash
cd backend
.\venv\Scripts\python -m pytest -v
```

##### 4. Open in Browser

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### 📽️ Video Demo

A video demonstration of the system processing PDFs and showing the four required cases can be accessed here:
- **Demo Video Link:**   _click the icon for Video_
  
[<img width="321" height="82" alt="image" src="https://github.com/user-attachments/assets/b7481505-0d8a-4e6d-b340-b55a68008447" />](https://drive.google.com/file/d/1eis1cdGP6pnC0L0JYVis4U4JpVaSbi8O/view?usp=sharing)


- **Uploading and Extracting Documents:**

<img width="800" height="96" alt="image" src="https://github.com/user-attachments/assets/f300e38e-180d-4042-862a-3bc6fbc4967c" />

<img width="800" height="450" alt="extracting-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/746c6c47-c60d-4fb1-b344-eb686f6c378f" />


  
- **Document Pipeline Execution:**
<img width="800" height="397" alt="piepline-ezgif com-video-to-gif-converter" src="https://github.com/user-attachments/assets/4ab77d34-827e-4e47-a88d-5d4fe1d6cfde" />

---

### 💡 Approach

SuperFact was built around **strict evidence grounding** and **generalizable reasoning**.

1. **Stack Selection (Python FastAPI + SQLite/PostgreSQL + Next.js):**
   We pivoted the initial Node.js scaffold to Python. Python is the industry standard for NLP and document processing, allowing us to use high-performance libraries like **PyMuPDF**, **FAISS**, and **Sentence Transformers** natively without IPC overhead.

2. **Boilerplate & Noise Reduction:**
   Our parsing pipeline uses `PyMuPDF` to read text page-by-page. To prevent boilerplate (headers, footers, legal disclaimers) from polluting the fact layer, pages with less than 60 characters are skipped, and pages are sub-chunked around periods if they exceed ~6,000 characters.

3. **Multi-Page Batching (5x Faster):**
   Instead of sending 1 LLM request per single page (which requires 100 separate API calls for a 100-page PDF and constantly hits rate limits), we **group 4–5 pages into a single LLM prompt** with explicit page markers. This reduces 100 pages to just ~20 LLM calls, completing the entire extraction in under 90 seconds. The prompt instructs the model to tag every fact with its exact source page number, so **page-level citation accuracy is 100% preserved** despite the batching.

4. **Structured Extraction with Pydantic v2:**
   Rather than asking the LLM to output freeform text, we enforce strict JSON mode matching our `ExtractedFact` schema. Pydantic handles parsing, type casting, and range-checks (e.g. confidence scores between 0.0 and 1.0) instantly.

5. **FAISS Semantic Candidate Selection:**
   To scale past small documents, we don't compare every fact pairwise (O(N²)). We lazy-load `all-MiniLM-L6-v2` to embed facts, index them in an in-memory FAISS flat inner-product index, and query for similar facts across different documents.

6. **LLM Comparison & Reconciliation:**
   Once semantic matches are found, we prompt the LLM to evaluate the candidate pairs. It classifies their relationship into **Corroborated**, **Contradiction**, or **Contextual** (where differences in time, scope, or units are reconciled).

7. **Production Monitoring:**
   We added Prometheus metrics middleware and pre-configured Grafana dashboards to monitor API health, pipeline performance, and LLM usage — because in a real-world system, extraction pipelines need observability to catch regressions and performance degradation.

### AI Tools Used

| Tool | Purpose |
| --- | --- |
| **Google Gemini 2.0 Flash** | Primary LLM for fact extraction and relationship classification |
| **Sentence-Transformers (MiniLM-L6-v2)** | Local embedding model for FAISS vector indexing |
| **Antigravity (Gemini Coding Agent)** | AI pair-programming for development, debugging, and testing |

---

### 🚨🔜 Limitations and Next Steps

- **In-Memory FAISS Index:** Currently, the FAISS index is kept in memory and rebuilt from database rows on startup. For massive datasets, we would migrate this to the `pgvector` extension in PostgreSQL so embeddings reside alongside relational data.
- **PDF Viewer Highlighting:** The current frontend displays the page number and quoted verbatim snippet. In the next iteration, we would use a PDF renderer library like `react-pdf` to highlight the exact bounding box of the source text inside the PDF page.
- **Human-in-the-Loop Edits:** SuperFact v1 is read-only over generated facts. Adding support for analysts to manually correct or annotate disputed relationships would make it a complete collaborative audit tool.
- **Streaming Extraction:** Currently, the entire document is processed synchronously. Adding WebSocket-based streaming would show facts appearing in real-time as pages are processed.
- **Multi-Modal Extraction:** Tables and charts in PDFs are currently extracted as text. Adding vision-based extraction (Gemini's multimodal capabilities) would improve accuracy for structured tabular data.

---

### Before You Submit Checklist

- [x] The project runs from these instructions and accepts new PDFs through an API and UI
- [x] Results contain facts, source evidence, and cross-document relationships
- [x] All four required cases are demonstrated
- [x] Approach is documented with a demo video (3 minutes or less)

---

## 📂 Project Structure

```
SuperFact/
├── backend/
│   ├── app/
│   │   ├── api/                # REST endpoints (documents, facts, relationships, showcase)
│   │   ├── llm/                # Gemini/OpenAI client & prompt templates
│   │   ├── models/             # SQLAlchemy models (Document, Fact, Relationship, Issue)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/           # Core logic (parsing, extraction, reconciliation, FAISS, pipeline)
│   │   ├── config.py           # Pydantic-settings with pathlib resolution
│   │   ├── database.py         # Async SQLAlchemy engine + session factory
│   │   ├── metrics.py          # Prometheus middleware & custom counters
│   │   └── main.py             # FastAPI app factory, CORS, lifespan
│   ├── scripts/                # Database seeder for development
│   ├── tests/                  # 18 integration tests (API, extraction, reconciliation)
│   ├── uploads/                # Uploaded PDF storage
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/                # Next.js pages (dashboard, upload, facts, relationships)
│   │   ├── lib/                # API client, TypeScript types, utilities
│   │   └── styles/             # Component-level CSS modules
│   ├── Dockerfile
│   └── package.json
├── monitoring/
│   ├── prometheus/             # Scrape config targeting backend /metrics
│   └── grafana/                # Pre-built dashboards & auto-provisioned datasources
├── docs/                       # Architecture, Design, PRD documentation
├── starter-datasets/           # Three PDF starter documents
├── docker-compose.yml          # Full 5-service stack
└── .env.example                # Environment variable template
```
---


## 🔑 API Reference

### Documents

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/v1/documents/upload` | Upload a PDF and trigger the extraction pipeline (multi-page batched) |
| `GET` | `/api/v1/documents` | List all processed documents with fact/page counts |
| `DELETE` | `/api/v1/documents/{id}` | Delete document and cascade-remove all associated facts |

### Facts

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/facts` | Retrieve all extracted facts (filterable by document, category) |
| `GET` | `/api/v1/facts?document_id={id}` | Facts for a specific document |

### Relationships

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/relationships` | All cross-document relationships |
| `GET` | `/api/v1/relationships?type=contradiction` | Filter by type (corroborated/contradiction/contextual) |

### Showcase

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/showcase/cases` | The four required cases with evidence and reasoning |

### System

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `GET` | `/metrics` | Prometheus metrics (scrape target) |

---

## 📊 Monitoring & Observability

SuperFact includes production-grade monitoring out of the box.

<img width="900" height="300" alt="11-Grafana_Prometheus_Dashboard" src="https://github.com/user-attachments/assets/525a3e80-8e1a-4715-a590-ca280f6e4a0d" />

### Prometheus Metrics

The backend exposes a `/metrics` endpoint in standard Prometheus format, tracking:

- **`http_requests_total`** — Total request count by method, path, and status code
- **`http_request_duration_seconds`** — Request latency histogram
- **`http_requests_in_progress`** — Current concurrent request gauge
- **`document_processing_duration_seconds`** — Pipeline processing time per document (including multi-page batch timings)
- **`facts_extracted_total`** — Total facts extracted across all documents
- **`llm_calls_total`** — LLM API call count by operation type

### Grafana Dashboards

Pre-configured dashboards are auto-provisioned via Docker Compose:

- **API Health** — Request rates, latency percentiles (p50/p95/p99), error rates
- **Pipeline Performance** — Document processing times, extraction throughput, batch efficiency
- **LLM Usage** — Call counts, token usage patterns, error tracking

Access Grafana at [http://localhost:3001](http://localhost:3001) with credentials `admin` / `admin`.

---

## 🧪 Testing

```bash
cd backend

# Activate virtualenv
.\venv\Scripts\activate

# Run the full test suite (18 tests)
python -m pytest -v
```

**Test Coverage:**

| Test File | Covers |
| --- | --- |
| `test_api.py` | API endpoints, document upload, fact retrieval, error handling |
| `test_extraction.py` | PyMuPDF parsing, Pydantic validation, schema enforcement, multi-page batching |
| `test_reconciliation.py` | FAISS matching, relationship classification, edge cases |

---


## 🚀 Deployment

### Docker Compose (Full Stack)

```bash
docker compose up --build
```

This launches all 5 services: **Frontend** + **Backend** + **PostgreSQL** + **Prometheus** + **Grafana**.

### Individual Services

| Service | Deployment Target | Notes |
| --- | --- | --- |
| Frontend | Vercel / Netlify | Set `NEXT_PUBLIC_API_URL` to your backend URL |
| Backend | Render / Railway | Set `GEMINI_API_KEY` and `DATABASE_URL` |
| Database | Supabase / Neon | Use `postgresql+asyncpg://` connection string |


---

## 📄 License

This project was built as part of the [Superjoin](https://www.superjoin.finance/) Engineering Intern Hiring Assignment.

---

<div align="center">

**Built with ❤️ by [M Harish Gautham](https://github.com/harishy0406)**

⭐ If you find this project impressive, give it a star! ⭐

</div>
