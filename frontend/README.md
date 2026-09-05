# GitWiki RAG — Frontend

A modern, developer-focused React frontend for **GitWiki RAG** — chat with any
GitHub repository using retrieval-augmented generation. Answers are grounded in
the indexed source code and cite the exact files they come from.

## Highlights

- **Clerk authentication (GitHub OAuth)** — dark-themed sign-in modal, per-user
  workspace stored in `localStorage`.
- **Repository ingestion** — paste an `owner/repo` (or full GitHub URL) to chunk,
  embed, and upsert into Pinecone via `POST /api/index`.
- **Grounded chat** — markdown answers with syntax-highlighted code blocks
  (`react-markdown` + `rehype-highlight`) and clickable source citations that open
  the file on GitHub.
- **Dark developer theme** — GitHub-dark inspired palette (`#0d1117` / `#161b22`)
  with violet/indigo accents, built on Tailwind CSS v4.

## Tech stack

| Layer        | Library                                      |
| ------------ | -------------------------------------------- |
| Framework    | React 19 + Vite                              |
| Styling      | Tailwind CSS v4 (`@tailwindcss/vite`)        |
| Auth         | `@clerk/clerk-react` + `@clerk/themes`       |
| Icons        | `lucide-react` (GitHub mark is a custom SVG) |
| Markdown     | `react-markdown`, `rehype-highlight`, `remark-gfm` |
| Backend      | `http://localhost:8001` (Express + Inngest)  |

## Getting started

```bash
pnpm install
pnpm dev
```

## Environment variables

Create `.env` at the project root:

```bash
# Clerk publishable key — Clerk Dashboard → API Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxx

# Backend API base URL (defaults to http://localhost:8001)
VITE_API_BASE_URL=http://localhost:8001
```

> Without a publishable key the app boots into a friendly setup screen instead of
> crashing.

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `pnpm dev`     | Start the Vite dev server      |
| `pnpm build`   | Production build to `dist/`    |
| `pnpm preview` | Preview the production build   |
| `pnpm lint`    | Run ESLint                     |

## Project structure

```text
src/
├── components/
│   ├── auth/           # LoginHero, MissingKeyNotice
│   ├── chat/           # ChatContainer, ChatInput, MessageBubble, SourcesList
│   ├── layout/         # Header, Sidebar
│   ├── repo/           # IndexRepoModal
│   └── ui/             # GitHubIcon (brand mark)
├── services/
│   └── api.js          # Backend client + response normalisation
├── App.jsx             # Clerk gates + per-user workspace state
├── main.jsx            # ClerkProvider (dark appearance) bootstrap
└── index.css           # Tailwind v4 theme tokens + markdown/code styling
```

## API contract

- `POST /api/index` — `{ repo: string, githubToken?: string }`
- `POST /api/chat` — `{ repo: string, question: string }` →
  `{ answer: string, sources: string[] }`

The chat client also tolerates the backend's async (HTTP 202) responses, which can
return a plain string while an Inngest worker prepares the answer.
