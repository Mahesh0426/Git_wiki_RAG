# GitWiki RAG — Backend

Backend API and event-driven ingestion pipeline for **GitWiki RAG**, enabling developer Q&A against any GitHub repository using Retrieval-Augmented Generation.

---

## Architecture Diagram

```mermaid
graph TD
    subgraph Frontend [Frontend UI]
        A[1. Repo Ingestion Screen]
        B[2. Chat / Q&A Interface]
    end

    subgraph Backend [Express API]
        C[POST /api/index]
        D[POST /api/chat]
    end

    subgraph Background [Inngest & AI Engine]
        E[indexRepo Function -> GitHub Tree -> Chunking -> Pinecone]
        F[askQuestion / Vector Search -> LLM + Sources]
    end

    A -->|Repo URL + Token| C --> E
    B -->|Repo + Question| D --> F
```

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Server** | Express 5 (`^5.2.1`) | HTTP server, REST endpoints, CORS & middleware |
| **Async Orchestrator** | Inngest (`^4.19.0`) | Step-based background execution for repo ingestion |
| **GitHub Traversal** | `@octokit/rest` (`^22.0.1`) | Recursive Git Tree and Blob fetching |
| **Text Splitter** | `@langchain/textsplitters` (`^1.0.1`) | `RecursiveCharacterTextSplitter` (1000 chunk size, 150 overlap) |
| **AI / Embeddings** | `@langchain/openai` (`^1.5.11`) | `text-embedding-3-small` (512 dims) & `gpt-4o-mini` |
| **Vector Database** | `@pinecone-database/pinecone` (`^8.2.0`) | Namespaced vector storage and similarity query |
| **Logging** | `morgan` (`^1.12.0`) | HTTP request logging in dev format |

---

## Environment Variables

Create `.env` inside the `backend/` directory:

```bash
# Server Port (default: 8001)
PORT=8001

# Inngest Development Flag
INNGEST_DEV=1

# OpenAI API Key (Embeddings & Chat completion)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Pinecone Vector Database
PINECONE_API_KEY=pcsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# Ensure the Pinecone index has Metric: Cosine and Dimensions: 512
PINECONE_INDEX=git-wiki-rag

# Optional default GitHub token for higher rate limits or private repos
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## API Endpoints

### 1. `GET /`
- **Purpose**: Health check.
- **Response**: `200 OK` — `<h2>App is up</h2>`

### 2. `POST /api/index`
- **Purpose**: Kick off repository ingestion.
- **Request Body**:
  ```json
  {
    "repo": "owner/repo",
    "githubToken": "ghp_xxxx"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Repo Indexing.."
  }
  ```
- **Behavior**: Sends the `repo/index.requested` event to Inngest for asynchronous processing.

### 3. `POST /api/chat`
- **Purpose**: Query an indexed repository.
- **Request Body**:
  ```json
  {
    "repo": "owner/repo",
    "question": "How does authentication work?"
  }
  ```
- **Response**:
  ```json
  {
    "answer": "...",
    "sources": ["src/auth.js", "src/server.js"]
  }
  ```

### 4. `ALL /api/inngest`
- **Purpose**: Inngest execution endpoint (`serve({ client: inngest, functions })`).

---

## Inngest Background Jobs

Defined in `src/inngest/functions/`:

- **`indexRepo`** (`repo/index.requested`):
  1. `fetch-github-files`: Fetches recursive git tree, filters out binaries/lockfiles/assets/folders (`node_modules`, `dist`, etc.), decodes UTF-8 blobs (up to 200 files, max 200KB each).
  2. `chunk-files`: Splits files using `RecursiveCharacterTextSplitter` (size: 1000, overlap: 150) attaching `{ path, repo }` metadata.
  3. `save-to-pinecone`: Generates 512-dimension embeddings and batch-upserts chunks (100 per batch) into Pinecone namespace `owner-repo`.
- **`askQuestionFn`** (`chat/question.requested`):
  - Inngest function for recording and asynchronously answering questions.

---

## How to Run

```bash
# Install dependencies
pnpm install

# Start Express dev server (watches src/)
pnpm dev

# In another terminal, start the Inngest Dev Server
npx inngest-cli@latest dev -u http://localhost:8001/api/inngest
```
