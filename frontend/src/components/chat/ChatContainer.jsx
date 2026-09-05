import { useEffect, useRef } from "react";
import {
  BookOpen,
  Braces,
  Database,
  GitBranch,
  Layers,
  Plus,
  Sparkles,
} from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";

const QUICK_PROMPTS = [
  {
    icon: Layers,
    prompt: "Explain the high-level project architecture",
  },
  {
    icon: Database,
    prompt: "How is the database / Pinecone vector store configured?",
  },
  {
    icon: Braces,
    prompt: "List the main API endpoints and their purpose",
  },
];

function EmptyState({ activeRepo, onAsk, onOpenIndex }) {
  if (!activeRepo) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="animate-fade-up max-w-md text-center">
          <div className="bg-accent-soft border-accent/25 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border">
            <GitBranch size={26} className="text-accent" aria-hidden="true" />
          </div>
          <h2 className="text-text-primary mt-6 text-xl font-bold tracking-tight">
            No active repository
          </h2>
          <p className="text-text-secondary mt-3 text-sm leading-relaxed">
            Index a GitHub repository to start chatting with its code. Pick one from
            your sidebar or add a new one in seconds.
          </p>
          <button
            type="button"
            onClick={onOpenIndex}
            className="bg-accent hover:bg-accent-hover focus-visible:ring-accent mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          >
            <Plus size={16} aria-hidden="true" />
            Index New Repo
          </button>
        </div>
      </div>
    );
  }

  const [owner, name] = activeRepo.split("/");
  return (
    <div className="flex h-full items-center justify-center overflow-y-auto px-4 py-8">
      <div className="animate-fade-up w-full max-w-2xl text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
          <BookOpen size={24} aria-hidden="true" />
        </div>

        <p className="text-text-muted mt-5 text-xs font-semibold tracking-widest uppercase">
          Repository indexed
        </p>
        <h2 className="text-text-primary mt-1.5 text-2xl font-bold tracking-tight">
          <span className="text-accent font-mono">{owner}</span>
          <span className="text-text-faint">/</span>
          <span className="font-mono">{name}</span>
        </h2>
        <p className="text-text-secondary mt-3 text-sm leading-relaxed">
          Ask anything about this codebase — architecture, APIs, configs, or a bug
          hunt. Answers cite the exact source files that support them.
        </p>

        <div className="mt-8 grid gap-2.5 text-left sm:grid-cols-1">
          {QUICK_PROMPTS.map(({ icon: Icon, prompt }, i) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onAsk(prompt)}
              style={{ animationDelay: `${i * 70}ms` }}
              className="animate-fade-up group border-line bg-panel hover:border-accent/40 hover:bg-elevated focus-visible:ring-accent flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-colors focus-visible:outline-none focus-visible:ring-2"
            >
              <span className="bg-accent-soft border-accent/25 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-accent">
                <Icon size={15} aria-hidden="true" />
              </span>
              <span className="text-text-secondary group-hover:text-text-primary flex-1 text-[13.5px] font-medium transition-colors">
                {prompt}
              </span>
              <Sparkles
                size={14}
                className="text-text-faint shrink-0 transition-colors group-hover:text-accent"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ChatContainer({
  messages,
  isLoading,
  activeRepo,
  onAsk,
  onOpenIndex,
}) {
  const scrollRef = useRef(null);

  const hasMessages = messages.length > 0;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  }, [messages.length, isLoading]);

  return (
    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
      {hasMessages ? (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              repo={activeRepo}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          activeRepo={activeRepo}
          onAsk={onAsk}
          onOpenIndex={onOpenIndex}
        />
      )}
    </div>
  );
}