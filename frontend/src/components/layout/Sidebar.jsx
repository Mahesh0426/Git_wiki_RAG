import { useMemo, useState } from "react";
import {
  GitBranch,
  HardDrive,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

export default function Sidebar({ repos, activeRepo, onSelect, onDelete, onOpenIndex }) {
  const [query, setQuery] = useState("");
  const [confirmingDelete, setConfirmingDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return repos;
    return repos.filter((repo) => repo.toLowerCase().includes(q));
  }, [repos, query]);

  const handleDelete = (repo) => {
    if (confirmingDelete === repo) {
      onDelete(repo);
      setConfirmingDelete(null);
    } else {
      setConfirmingDelete(repo);
      window.setTimeout(() => setConfirmingDelete(null), 2600);
    }
  };

  return (
    <aside className="border-line flex w-full shrink-0 flex-col border-r bg-panel md:w-72 md:min-h-0">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <div className="flex items-center gap-2">
          <h2 className="text-text-primary text-sm font-semibold tracking-tight">
            Repositories
          </h2>
          <span className="bg-elevated text-text-muted rounded-full px-2 py-0.5 text-[11px] font-medium">
            {repos.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onOpenIndex}
          title="Index a new repository"
          aria-label="Index a new repository"
          className="text-text-muted hover:text-text-primary hover:bg-hovered focus-visible:ring-accent flex h-7 w-7 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2"
        >
          <Plus size={15} aria-hidden="true" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search
            size={14}
            className="text-text-faint pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter repositories…"
            aria-label="Filter repositories"
            className="bg-canvas border-line focus:border-accent/60 focus:ring-accent/30 w-full rounded-lg border py-2 pl-9 pr-8 text-[13px] text-text-primary placeholder:text-text-faint transition-colors focus:outline-none focus:ring-2"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear filter"
              className="text-text-faint hover:text-text-secondary absolute right-2.5 top-1/2 -translate-y-1/2"
            >
              <X size={13} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Repo list */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 pb-3" aria-label="Repository list">
        {filtered.length > 0 ? (
          <ul className="flex flex-col gap-0.5">
            {filtered.map((repo) => {
              const isActive = repo === activeRepo;
              const isConfirming = confirmingDelete === repo;
              const [owner, name] = repo.split("/");
              return (
                <li key={repo}>
                  <div
                    className={`group relative flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                      isActive
                        ? "border-accent/30 bg-accent-soft"
                        : "border-transparent hover:bg-hovered"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(repo)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                      aria-current={isActive ? "true" : undefined}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold ${
                          isActive
                            ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
                            : "bg-elevated text-text-secondary"
                        }`}
                        aria-hidden="true"
                      >
                        {owner?.[0]?.toUpperCase() ?? "?"}
                        {name?.[0]?.toUpperCase() ?? ""}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block truncate font-mono text-[12.5px] font-medium ${
                            isActive ? "text-text-primary" : "text-text-secondary"
                          }`}
                        >
                          {owner}/{name}
                        </span>
                        {isActive && (
                          <span className="text-accent block text-[10px] font-medium tracking-wide uppercase">
                            ● Active
                          </span>
                        )}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(repo)}
                      title={isConfirming ? "Click again to confirm" : "Remove repository"}
                      aria-label={
                        isConfirming
                          ? `Confirm removing ${repo}`
                          : `Remove ${repo} from your workspace`
                      }
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger ${
                        isConfirming
                          ? "bg-danger-soft text-danger"
                          : "text-text-faint opacity-0 hover:bg-danger-soft hover:text-danger group-hover:opacity-100 focus-visible:opacity-100"
                      }`}
                    >
                      {isConfirming ? (
                        <span className="text-[10px] font-bold">Sure?</span>
                      ) : (
                        <Trash2 size={14} aria-hidden="true" />
                      )}
                    </button>

                    <span
                      className={`pointer-events-none absolute left-0 h-5 w-0.5 rounded-full bg-accent transition-opacity ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
            <div className="border-line text-text-faint flex h-12 w-12 items-center justify-center rounded-xl border border-dashed">
              <GitBranch size={20} aria-hidden="true" />
            </div>
            <p className="text-text-muted max-w-[180px] text-[13px] leading-relaxed">
              {query
                ? `No repositories match "${query}".`
                : "No repositories indexed yet."}
            </p>
            {!query && (
              <button
                type="button"
                onClick={onOpenIndex}
                className="bg-accent hover:bg-accent-hover focus-visible:ring-accent inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
              >
                <Plus size={13} aria-hidden="true" />
                Index your first repo
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-line flex items-center gap-2 border-t px-4 py-3">
        <HardDrive size={13} className="text-text-faint shrink-0" aria-hidden="true" />
        <p className="text-text-faint truncate text-[11px]">
          Per-user workspace · stored locally
        </p>
      </div>
    </aside>
  );
}