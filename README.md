# SkinFit AI — Precision Skin, Body & Wellness Intelligence

[![CI Pipeline](https://github.com/skinfit-ai/skinfit/actions/workflows/ci.yml/badge.svg)](https://github.com/skinfit-ai/skinfit/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)](https://opensource.org/licenses/MIT)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688.svg)](https://fastapi.tiangolo.com/)

**SkinFit AI** is a production-minded, locally runnable full-stack application integrating Computer Vision, Biomechanical Kinematics, Grounded RAG Generative AI, and Hybrid Personalized Recommendation Systems for facial skin health, posture correction, and evidence-based nutrition.

---

## Table of Contents
1. [Core Capabilities & Architecture](#1-core-capabilities--architecture)
2. [Scientific Principles & Disclaimers](#2-scientific-principles--disclaimers)
3. [Repository Directory Structure](#3-repository-directory-structure)
4. [Prerequisites & Environment Configuration](#4-prerequisites--environment-configuration)
5. [Local Startup via Docker Compose (Recommended)](#5-local-startup-via-docker-compose-recommended)
6. [Standalone Native Execution (Without Docker)](#6-standalone-native-execution-without-docker)
7. [Database Migrations & Seeding](#7-database-migrations--seeding)
8. [RAG Knowledge Ingestion & Vector Stores](#8-rag-knowledge-ingestion--vector-stores)
9. [REST API Documentation & Endpoints](#9-rest-api-documentation--endpoints)
10. [Automated Test Suite](#10-automated-test-suite)
11. [GDPR & CCPA Privacy Compliance](#11-gdpr--ccpa-privacy-compliance)
12. [Extensibility Guide](#12-extensibility-guide)

---

## 1. Core Capabilities & Architecture

* **Facial Skin Feature Mapping:** Live webcam and high-resolution photo capture. Computes image sharpness (Laplacian variance) and lighting balance, detects localized blemishes and erythema, maps pigmentation macules, and calculates objective **CIE L\*a\*b\* Individual Typology Angle (ITA)** skin tone.
* **Biomechanics & Posture Kinematics:** Estimates skeletal joint landmarks, computing craniovertebral neck inclination (forward head posture), shoulder level asymmetry, and spinal plumb-line alignment. Includes WHO BMI calculations with strict clinical guardrails.
* **Hybrid Recommendation Engine:** Recommends AM/PM skincare routines, corrective mobility drills, and gut-skin axis meals by combining deterministic allergen/contraindication filters with content-based attribute matching. Every recommendation features an explicit clinical rationale.
* **RAG Health Advisor:** LangChain/RAG assistant that retrieves passages from verified clinical literature (`data/knowledge/`), cites source documents, and falls back to a deterministic offline engine when external API keys are unavailable.
* **Verified Product Marketplace:** Filterable catalogue of clean formulations, nutritional foods, and ergonomic tools with transparent ingredients and external shopping links.
* **Personalized Dashboard & Progress:** Daily streak tracker, weight/skin clarity Recharts trend analytics, and GDPR-compliant image erasure.

---

## 2. Scientific Principles & Disclaimers

> **IMPORTANT STATUTORY MEDICAL NOTICE:**
> SkinFit AI is an educational digital coaching platform. Standard 2D RGB digital photographs obtained via mobile phones or webcams are subject to ambient color temperature, uneven lux levels, and optical compression.
> - The software **does NOT diagnose clinical dermatological diseases**, measure subcutaneous histology, compute exact melanin micromoles, or evaluate bone density.
> - Minors under 18 and individuals with underweight BMIs (<18.5) are strictly restricted from selecting automated caloric deficit diets.
> - Users presenting with persistent, irregular, or bleeding lesions must consult a board-certified dermatologist immediately.

---

## 3. Repository Directory Structure

```text
skinfit-ai/
├── frontend/                # Next.js 14 App Router, TypeScript, Tailwind CSS
│   ├── app/                 # Routes: /dashboard, /skin-analysis, /body-analysis, /wellness, etc.
│   ├── components/          # Reusable UI: WebcamCapture, ImageUploader, Navbar, Sidebar
│   ├── services/api.ts      # Typed API client
│   ├── types/index.ts       # Full TypeScript schemas
│   └── Dockerfile
│
├── backend/                 # Python 3.12, FastAPI, SQLAlchemy 2.0, Alembic
│   ├── app/
│   │   ├── main.py          # Application entrypoint & CORS
│   │   ├── core/            # Configuration & JWT authentication
│   │   ├── api/v1/          # REST endpoints (auth, skin, body, wellness, products, etc.)
│   │   ├── ai/              # Computer Vision (OpenCV/MediaPipe) & Recommendation engine
│   │   ├── rag/             # Vector store abstraction (ChromaDB, FAISS, InMemory) & embeddings
│   │   └── llm/             # LLM provider abstraction (Local, Gemini, OpenAI)
│   ├── tests/               # Pytest automated test suite
│   ├── scripts/seed_data.py # Database seeder
│   ├── alembic/             # Database migration scripts
│   ├── requirements.txt
│   └── Dockerfile
│
├── data/
│   ├── sample_products.json # Verified skincare, nutrition & equipment catalogue
│   ├── sample_exercises.json# Posture and mobility exercises
│   ├── sample_foods.json    # Anti-inflammatory macro meals
│   └── knowledge/           # Curated markdown literature for RAG
│
├── storage/                 # Private local storage for image files
├── models/                  # Local ML model weights (.pt / .onnx)
├── docker-compose.yml       # Orchestrates frontend, backend, postgres, redis, chromadb
├── .env.example             # Documented environment variables
└── README.md
```

---

## 4. Prerequisites & Environment Configuration

### Prerequisites
* **Docker & Docker Compose** (for containerized execution) OR:
* **Python 3.12+** and **Node.js 20+ / npm 10+** (for native execution)

### Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Key environment settings:
| Variable | Default (Local / Docker) | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql+psycopg://skinfit:skinfit_dev@db:5432/skinfit` | Relational database (or `sqlite+aiosqlite:///./skinfit.db` for native standalone) |
| `JWT_SECRET_KEY` | `secure_random_string` | Secret key for HS256 JWT tokens |
| `LLM_PROVIDER` | `local` | Options: `local`, `gemini`, `openai` |
| `EMBEDDING_PROVIDER`| `local` | Options: `local`, `openai`, `sentence_transformers` |
| `VECTOR_STORE` | `chroma` | Options: `chroma`, `faiss`, `memory` |
| `OPENAI_API_KEY` | *(Optional)* | OpenAI key for GPT-4o mini and embeddings |
| `GEMINI_API_KEY` | *(Optional)* | Google Gemini key for Gemini 1.5 Flash |
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | FastAPI server URL exposed to client |

---

## 5. Local Startup via Docker Compose (Recommended)

To launch the complete infrastructure (PostgreSQL, Redis, ChromaDB, FastAPI backend, and Next.js frontend):

```bash
docker compose up --build
```

Access services:
* **Frontend Application:** [http://localhost:3000](http://localhost:3000)
* **Backend REST API:** [http://localhost:8000](http://localhost:8000)
* **Interactive Swagger Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **ChromaDB Vector Store:** [http://localhost:8001](http://localhost:8001)

---

## 6. Standalone Native Execution (Without Docker)

When running without Docker, SkinFit AI automatically falls back to asynchronous SQLite and in-memory cosine vector search with zero external dependencies.

### Step 1: Initialize Backend
```bash
cd backend

# Create virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed initial catalogue data
python scripts/seed_data.py

# Launch FastAPI development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 2: Initialize Frontend
In a separate terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Launch Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Database Migrations & Seeding

### Execute Migrations via Alembic
```bash
cd backend
alembic upgrade head
```

### Seed Catalogs
To populate sample products, exercises, and foods:
```bash
python backend/scripts/seed_data.py
```

---

## 8. RAG Knowledge Ingestion & Vector Stores

Knowledge documents in `data/knowledge/*.md` cover:
1. `skincare_science.md` — Ceramides, TEWL, Niacinamide, BHA, and SPF photoprotection.
2. `acne_and_pigmentation_guide.md` — Follicular hyperkeratinization, post-inflammatory hyperpigmentation, CIE L\*a\*b\* metrics.
3. `posture_and_ergonomics.md` — Upper crossed syndrome, forward head translation, plumb lines.
4. `nutrition_and_macronutrients.md` — Mifflin-St Jeor BMR, protein synthesis, gut-skin axis.
5. `wellness_safety_and_disclaimers.md` — Statutory disclaimers and calorie floors.

To manually trigger knowledge re-indexing via API:
```bash
curl -X POST http://localhost:8000/api/v1/rag/ingest
```

---

## 9. REST API Documentation & Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register new user with explicit biometric consent |
| `POST` | `/api/v1/auth/login` | Authenticate user & return JWT token |
| `GET` | `/api/v1/users/me` | Fetch active user profile and preferences |
| `PUT` | `/api/v1/users/profile` | Update height, weight, skin concerns, budget |
| `POST` | `/api/v1/skin/quality-check` | Real-time illumination, blur & face detection check |
| `POST` | `/api/v1/skin/analyze` | Full visible feature analysis (acne, ITA tone, texture) |
| `GET` | `/api/v1/skin/assessments` | Historical skin assessment log |
| `POST` | `/api/v1/body/bmi` | WHO BMI calculation with clinical calorie safeguards |
| `POST` | `/api/v1/body/pose` | MediaPipe / OpenCV pose landmark extraction |
| `POST` | `/api/v1/body/assessment` | Store complete body posture assessment |
| `POST` | `/api/v1/wellness/plan` | Generate personalized gut-skin meal & exercise plan |
| `GET` | `/api/v1/wellness/exercises` | List corrective mobility exercises |
| `GET` | `/api/v1/wellness/foods` | List anti-inflammatory food items |
| `GET` | `/api/v1/products` | Filterable product catalogue |
| `POST` | `/api/v1/recommendations` | Generate explainable AM/PM routine recommendations |
| `POST` | `/api/v1/recommendations/feedback`| Submit user feedback on recommendation match |
| `POST` | `/api/v1/assistant/chat` | RAG-grounded conversational coach with citations |
| `POST` | `/api/v1/rag/ingest` | Re-index knowledge repository |
| `GET` | `/api/v1/progress` | User streak, historical delta & analytics summary |
| `POST` | `/api/v1/progress` | Daily metric check-in (weight, water intake, notes) |
| `DELETE`| `/api/v1/account/images` | GDPR & CCPA permanent image purge |

---

## 10. Automated Test Suite

Run the comprehensive automated test suite covering authentication, BMI safeguards, computer vision feature extraction, recommendation engine, products filtering, and RAG retrieval:

```bash
cd backend
pytest -v
```

---

## 11. GDPR & CCPA Privacy Compliance

SkinFit AI complies with global privacy mandates (GDPR Art. 17 & CCPA):
1. **Explicit Biometric Consent:** Registered users explicitly consent to optical computer vision processing.
2. **Right to Erasure:** Calling `DELETE /api/v1/account/images` immediately unlinks and permanently deletes all uploaded photographs from physical storage.
3. **No Secondary Data Sharing:** Biometric data is never sold or used for model training without consent.

---

## 12. Extensibility Guide

* **Adding Custom CV Models:** Place fine-tuned PyTorch weights in `models/` (e.g. `models/efficientnet_skin.pt`). Implement the model loading logic in `backend/app/ai/skin/analyzer.py`.
* **Adding New Knowledge Documents:** Add any `.md` clinical documentation to `data/knowledge/` and trigger `/api/v1/rag/ingest`.
* **Integrating External Retailers:** Implement the retailer provider interface in `backend/app/integrations/` to pull live product feeds into `backend/app/api/v1/products.py`.
