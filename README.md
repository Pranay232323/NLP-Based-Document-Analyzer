# NLP Intelligence Platform

NLP-Based Intelligent Academic Document Analyzer and Research Assistant.

## Current Stack
- Frontend + Backend (single app runtime): Next.js + TypeScript
- NLP Engine: local Node NLP libraries (no external LLM APIs)
- Database: **MongoDB** (via `mongodb` driver)

## MongoDB Environment
Create `.env` in project root:

```env
MONGODB_URI=mongodb://127.0.0.1:27017
MONGODB_DATABASE=nlp_academic_analyzer
```

You can copy from `.env.example`.

## Run in VS Code Terminal (Windows)

### 1) Open project
Open folder in VS Code and open terminal.

### 2) Install dependencies
```powershell
npm install
```

### 3) Start MongoDB locally
Use MongoDB Compass/service or terminal-managed MongoDB.
Ensure `mongodb://127.0.0.1:27017` is reachable.

### 4) Run development server
```powershell
npm run dev
```

Open:
- App: `http://localhost:3000`
- Health: `http://localhost:3000/api/health`

### 5) Production run (optional)
```powershell
npm run build
npm run start
```

## API Notes
- `POST /api/analyze` stores metadata/results into Mongo collections:
  - `documents`
  - `analyses`
- `POST /api/similarity` stores results in:
  - `comparisons`
- `POST /api/reports/generate` stores report metadata in:
  - `reports`
- `GET /api/health` reports MongoDB configuration/connection status.

## Important
- No OpenAI/Gemini/external paid APIs are used for core NLP.
- All NLP outputs are computed from actual input text.
