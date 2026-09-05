const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8001"
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseJsonSafe(res, fallback) {
  const text = await res.text();
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch {
    return fallback !== undefined ? fallback : text;
  }
}

/**
 * Normalize a repo reference ("owner/repo" or full GitHub URL)
 * into the canonical "owner/repo" key used across the app.
 * Returns null when the input isn't recognizable.
 */
export function parseRepoInput(input) {
  let clean = String(input || "").trim();
  if (!clean) return null;

  // Remove git@github.com: prefix if present
  clean = clean.replace(/^git@github\.com:/i, "");

  // Remove URL protocol and domain if present
  clean = clean.replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "");

  // Strip query parameters or hash fragments
  clean = clean.split(/[?#]/)[0];

  // Remove trailing slashes and .git suffix
  clean = clean.replace(/\/+$/, "").replace(/\.git$/i, "");

  const parts = clean.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const owner = parts[0].trim();
    const repo = parts[1].trim();
    if (owner && repo) {
      return `${owner}/${repo}`;
    }
  }

  return null;
}

/**
 * Kick off repository ingestion.
 * POST /api/index  { repo, githubToken? }
 */
export async function indexRepository({ repo, githubToken }) {
  const res = await fetch(`${API_BASE_URL}/api/index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      repo,
      ...(githubToken ? { githubToken } : {}),
    }),
  });

  const data = await parseJsonSafe(res, {});
  if (!res.ok) {
    throw new ApiError(data?.error || `Indexing failed (HTTP ${res.status})`, res.status);
  }
  return data;
}

/**
 * Ask a question against an indexed repo.
 * POST /api/chat  { repo, question }
 *
 * The backend may answer synchronously with `{ answer, sources }`
 * or accept the request asynchronously (HTTP 202) and return a
 * plain string — both shapes are normalized here.
 */
export async function askQuestion({ repo, question, signal }) {
  const res = await fetch(`${API_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo, question }),
    signal,
  });

  const data = await parseJsonSafe(res, null);

  if (!res.ok) {
    throw new ApiError(
      data?.error || `Chat request failed (HTTP ${res.status})`,
      res.status,
    );
  }

  if (data && typeof data === "object" && typeof data.answer === "string") {
    return {
      answer: data.answer,
      sources: Array.isArray(data.sources) ? data.sources : [],
    };
  }

  if (typeof data === "string") {
    return {
      answer: data,
      sources: [],
      queued: true,
    };
  }

  return {
    answer: "Received an unexpected response from the server. Please try again.",
    sources: [],
  };
}

/**
 * Build a GitHub URL to open a source file from the RAG answer.
 */
export function sourceUrl(repo, filePath) {
  const encoded = filePath.split("/").map((part) => encodeURIComponent(part)).join("/");
  return `https://github.com/${repo}/blob/HEAD/${encoded}`;
}