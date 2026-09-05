import { useUser, UserButton } from "@clerk/clerk-react";
import { BookOpen, GitBranch, Plus } from "lucide-react";

export default function Header({ activeRepo, onOpenIndex }) {
  const { user } = useUser();
  const displayName =
    user?.username || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "developer";

  return (
    <header className="border-line relative z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-panel/90 px-4 backdrop-blur sm:px-5">
      {/* Brand */}
      <div className="flex min-w-0 items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25">
          <BookOpen size={16} aria-hidden="true" />
        </div>
        <div className="hidden min-w-0 flex-col leading-tight sm:flex">
          <span className="text-text-primary truncate text-sm font-semibold tracking-tight">
            GitWiki <span className="text-accent">RAG</span>
          </span>
          <span className="text-text-faint truncate text-[11px]">
            Chat with any GitHub repo
          </span>
        </div>
        <span className="text-text-faint hidden md:inline">/</span>

        {/* Active repo badge */}
        {activeRepo ? (
          <a
            href={`https://github.com/${activeRepo}`}
            target="_blank"
            rel="noreferrer noopener"
            title={`Open ${activeRepo} on GitHub`}
            className="bg-accent-soft border-accent/30 hover:bg-accent/20 focus-visible:ring-accent group inline-flex min-w-0 max-w-[180px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
          >
            <GitBranch size={13} className="shrink-0" aria-hidden="true" />
            <span className="truncate font-mono">{activeRepo}</span>
          </a>
        ) : (
          <span className="text-text-faint hidden rounded-full border border-dashed border-line px-3 py-1.5 text-xs md:inline-flex">
            No active repository
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenIndex}
          className="bg-accent hover:bg-accent-hover focus-visible:ring-accent inline-flex h-9 items-center gap-1.5 rounded-lg px-3.5 text-sm font-semibold text-white shadow-md shadow-violet-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-panel"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Index New Repo</span>
          <span className="sm:hidden">Index</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border border-line bg-canvas py-1 pl-3 pr-1">
          <div className="hidden flex-col items-end leading-tight lg:flex">
            <span className="text-text-primary max-w-[120px] truncate text-xs font-semibold">
              {displayName}
            </span>
            <span className="text-text-faint max-w-[120px] truncate text-[10px]">
              {user?.primaryEmailAddress?.emailAddress ?? "github"}
            </span>
          </div>
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: {
                  width: 28,
                  height: 28,
                  borderRadius: "9999px",
                  border: "1px solid #30363d",
                },
              },
            }}
          />
        </div>
      </div>
    </header>
  );
}