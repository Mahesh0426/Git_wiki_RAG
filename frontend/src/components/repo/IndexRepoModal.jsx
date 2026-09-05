import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  GitBranch,
  KeyRound,
  Loader2,
  Lock,
  X,
} from "lucide-react";
import GitHubIcon from "../ui/GitHubIcon.jsx";
import { indexRepository, parseRepoInput } from "../../services/api.js";

export default function IndexRepoModal({ open, onClose, onSuccess }) {
  const [repoInput, setRepoInput] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Focus the repo input whenever the dialog becomes visible
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape to close (unless submitting)
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape" && !isSubmitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, isSubmitting]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const repo = parseRepoInput(repoInput);
    if (!repo) {
      setError(
        "That doesn't look like a repo. Use owner/repo or a full github.com URL.",
      );
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await indexRepository({ repo, githubToken: githubToken.trim() || undefined });
      onSuccess(repo);
    } catch (err) {
      setError(err.message || "Indexing failed. Is the backend running on :8001?");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="animate-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="index-repo-title"
    >
      <div className="animate-modal-in bg-panel border-line w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl shadow-black/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
              <GitBranch size={17} aria-hidden="true" />
            </div>
            <div>
              <h2
                id="index-repo-title"
                className="text-text-primary text-sm font-semibold"
              >
                Index a new repository
              </h2>
              <p className="text-text-muted text-xs">
                Cloned, chunked, and embedded into Pinecone
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close dialog"
            className="text-text-faint hover:text-text-primary hover:bg-hovered flex h-8 w-8 items-center justify-center rounded-md transition-colors disabled:opacity-40"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-5">
          <label
            htmlFor="repo-input"
            className="text-text-secondary mb-1.5 block text-[13px] font-medium"
          >
            Repository
          </label>
          <div className="relative">
            <GitHubIcon
              size={15}
              className="text-text-faint pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
            />
            <input
              id="repo-input"
              ref={inputRef}
              type="text"
              value={repoInput}
              onChange={(e) => {
                setRepoInput(e.target.value);
                if (error) setError(null);
              }}
              placeholder="owner/repo  or  https://github.com/owner/repo"
              autoComplete="off"
              spellCheck="false"
              className="bg-canvas border-line focus:border-accent/60 focus:ring-accent/30 w-full rounded-xl border py-2.5 pl-10 pr-3 font-mono text-[13px] text-text-primary placeholder:text-text-faint transition-colors focus:outline-none focus:ring-2"
            />
          </div>
          <p className="text-text-faint mt-1.5 text-xs">
            The repository must be public unless you supply a GitHub token.
          </p>

          {/* Advanced: token */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            aria-expanded={showAdvanced}
            className="text-text-muted hover:text-text-secondary mt-4 inline-flex items-center gap-1.5 text-xs font-medium transition-colors"
          >
            <KeyRound size={13} aria-hidden="true" />
            Private repository? Add a token
            <ChevronDown
              size={13}
              className={`transition-transform ${showAdvanced ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </button>

          {showAdvanced && (
            <div className="animate-fade-up mt-3 rounded-xl border border-line bg-canvas p-4">
              <label
                htmlFor="token-input"
                className="text-text-secondary mb-1.5 block text-xs font-medium"
              >
                GitHub personal access token{" "}
                <span className="text-text-faint">(optional)</span>
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="text-text-faint pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  id="token-input"
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_… or github_pat_…"
                  autoComplete="off"
                  className="bg-elevated border-line focus:border-accent/60 focus:ring-accent/30 w-full rounded-lg border py-2.5 pl-10 pr-3 font-mono text-[12.5px] text-text-primary placeholder:text-text-faint transition-colors focus:outline-none focus:ring-2"
                />
              </div>
              <p className="text-text-faint mt-1.5 text-xs leading-relaxed">
                Sent only to your backend at <code className="text-text-muted">:8001</code> in
                the request body for this indexing run — never stored on the client.
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="border-danger/30 bg-danger-soft mt-4 flex items-start gap-2.5 rounded-xl border px-3.5 py-3"
            >
              <AlertTriangle size={15} className="text-danger mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-text-primary text-[13px] leading-relaxed">{error}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-text-secondary hover:bg-hovered focus-visible:ring-accent rounded-lg px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!repoInput.trim() || isSubmitting}
              className="bg-accent hover:bg-accent-hover focus-visible:ring-accent inline-flex min-w-[132px] items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-panel disabled:bg-[#3b2d66] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Indexing…
                </>
              ) : (
                <>
                  <GitBranch size={16} aria-hidden="true" />
                  Index repo
                </>
              )}
            </button>
          </div>

          {isSubmitting && (
            <p className="text-text-muted mt-3 flex items-center justify-end gap-1.5 text-[11px]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden="true" />
              Cloning → chunking → embedding → upserting to Pinecone…
            </p>
          )}
        </form>
      </div>
    </div>
  );
}