import { useState } from "react";
import { ChevronDown, ExternalLink, FileCode2 } from "lucide-react";
import { sourceUrl } from "../../services/api.js";

export default function SourcesList({ sources, repo }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 max-w-[92%] sm:max-w-[85%]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="text-text-muted hover:text-text-primary hover:bg-hovered focus-visible:ring-accent inline-flex items-center gap-2 rounded-lg border border-line bg-panel/60 px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2"
      >
        <FileCode2 size={13} className="text-info" aria-hidden="true" />
        Sources
        <span className="bg-elevated rounded-full px-1.5 py-px font-mono text-[10px]">
          {sources.length}
        </span>
        <ChevronDown
          size={13}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul className="animate-fade-up mt-2 overflow-hidden rounded-xl border border-line bg-panel/60">
          {sources.map((path, idx) => (
            <li
              key={path}
              className={`flex items-center gap-2.5 px-3 py-2 ${
                idx !== sources.length - 1 ? "border-b border-line/70" : ""
              }`}
            >
              <span className="text-text-faint w-5 shrink-0 text-right font-mono text-[10px]">
                {idx + 1}
              </span>
              <span className="text-text-secondary min-w-0 flex-1 truncate font-mono text-[12px]">
                {path}
              </span>
              <a
                href={sourceUrl(repo, path)}
                target="_blank"
                rel="noreferrer noopener"
                title={`Open ${path} on GitHub`}
                aria-label={`Open ${path} on GitHub`}
                className="text-text-faint hover:text-text-primary hover:bg-hovered flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <ExternalLink size={12} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}