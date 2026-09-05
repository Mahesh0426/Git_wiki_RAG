import { SignInButton } from "@clerk/clerk-react";
import {
  ArrowRight,
  BookOpen,
  Database,
  GitBranch,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import GitHubIcon from "../ui/GitHubIcon.jsx";

const FEATURES = [
  {
    icon: GitBranch,
    title: "Index any repository",
    description:
      "Paste an owner/repo or GitHub URL and the full codebase is chunked, embedded, and stored in Pinecone.",
  },
  {
    icon: MessageSquareText,
    title: "Chat grounded in code",
    description:
      "Ask architecture, debugging, and integration questions answered strictly from the indexed source.",
  },
  {
    icon: ShieldCheck,
    title: "Secure GitHub auth",
    description:
      "Sign in with GitHub through Clerk — nothing is stored on a server you don't control.",
  },
];

const PREVIEW_QUESTION = "How does the RAG vector store get configured?";
const PREVIEW_ANSWER =
  "The app seeds a Pinecone index at startup using `../services/vectorStore.js`. Docs are chunked by `chunking.js`, embedded with OpenAI, then upserted with a namespace per repo (`owner/repo`).";
const PREVIEW_SOURCES = ["src/services/vectorStore.js", "src/services/chunking.js"];

const STACK_BADGES = ["React + Vite", "Clerk", "Pinecone", "LangChain", "OpenAI"];

function BrandMark({ size = 40 }) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
      style={{ width: size, height: size }}
    >
      <BookOpen style={{ width: size * 0.55, height: size * 0.55 }} aria-hidden="true" />
    </div>
  );
}

export default function LoginHero() {
  return (
    <div className="bg-canvas relative flex min-h-screen flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-56 -right-40 h-[420px] w-[520px] rounded-full bg-indigo-600/15 blur-[120px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
        aria-hidden="true"
      />

      {/* Top nav */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <BrandMark size={34} />
          <span className="text-text-primary text-base font-semibold tracking-tight">
            GitWiki
            <span className="text-accent"> RAG</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-text-faint hidden items-center gap-1.5 rounded-full border border-line bg-panel px-3 py-1.5 text-xs font-medium sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
            Indexer online
          </span>
          <SignInButton mode="modal" signInFallbackRedirectUrl="/">
            <button
              type="button"
              className="bg-accent hover:bg-accent-hover focus-visible:ring-accent inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
            >
              <GitHubIcon size={16} />
              Sign in
            </button>
          </SignInButton>
        </div>
      </header>

      {/* Hero grid */}
      <main className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 items-center gap-14 px-6 py-12 sm:px-10 lg:grid-cols-2 lg:py-20">
        {/* Left — value prop */}
        <div className="animate-fade-up">
          <span className="text-accent bg-accent-soft inline-flex items-center gap-2 rounded-full border border-violet-500/25 px-3.5 py-1.5 text-xs font-semibold tracking-wide">
            <Sparkles size={13} aria-hidden="true" />
            RAG-powered repository intelligence
          </span>

          <h1 className="text-text-primary mt-6 text-4xl font-extrabold leading-[1.12] tracking-tight sm:text-5xl">
            Chat with any
            <br />
            <span className="text-gradient">GitHub repository</span>
          </h1>

          <p className="text-text-secondary mt-5 max-w-lg text-base leading-relaxed sm:text-lg">
            GitWiki RAG indexes a repository into Pinecone and answers your questions
            with the code itself as context — every answer cites the source files it
            came from.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <SignInButton mode="modal" signInFallbackRedirectUrl="/">
              <button
                type="button"
                className="bg-accent hover:bg-accent-hover focus-visible:ring-accent group inline-flex h-12 items-center gap-2.5 rounded-xl px-6 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-violet-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
              >
                <GitHubIcon size={18} />
                Sign in with GitHub
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            </SignInButton>
            <span className="text-text-faint text-sm">
              Free · no credit card · uses your GitHub identity
            </span>
          </div>

          <ul className="mt-10 grid gap-5 border-t border-line pt-8 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <li key={title} className="flex flex-col gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/25 bg-accent-soft text-accent">
                  <Icon size={17} aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-text-primary text-sm font-semibold">{title}</h2>
                  <p className="text-text-muted mt-1 text-[13px] leading-relaxed">
                    {description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — mock chat preview */}
        <div className="animate-fade-up lg:justify-self-end" style={{ animationDelay: "120ms" }}>
          <div className="relative">
            <div
              className="absolute -inset-3 rounded-2xl bg-gradient-to-r from-violet-500/15 to-indigo-500/15 blur-2xl"
              aria-hidden="true"
            />
            <div className="bg-panel relative rounded-2xl border border-line shadow-2xl shadow-black/40">
              {/* window chrome */}
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <div className="flex items-center gap-1.5" aria-hidden="true">
                  <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                  <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                  <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                </div>
                <div className="text-text-muted flex items-center gap-1.5 font-mono text-[11px]">
                  <Terminal size={12} aria-hidden="true" />
                  GitWiki · RAG session
                </div>
              </div>

              {/* mock transcript */}
              <div className="flex flex-col gap-4 p-5">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl rounded-br-md bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-[13px] leading-relaxed text-white shadow-lg shadow-violet-900/30">
                    {PREVIEW_QUESTION}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <BrandMark size={30} />
                  <div className="max-w-[85%] rounded-xl rounded-bl-md border border-line bg-canvas px-4 py-3">
                    <p className="text-text-secondary text-[13px] leading-relaxed">
                      {PREVIEW_ANSWER}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {PREVIEW_SOURCES.map((file) => (
                        <span
                          key={file}
                          className="bg-elevated border-line text-text-muted inline-flex items-center gap-1 rounded-md border px-2 py-1 font-mono text-[10.5px]"
                        >
                          <Database size={10} aria-hidden="true" />
                          {file}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-elevated border-line flex items-center gap-2 rounded-xl border px-3.5 py-2.5">
                  <span className="text-text-faint text-[13px]">
                    Ask a follow-up about{" "}
                    <code className="text-accent font-mono text-[12px]">
                      Mahesh0426/Git_wiki_RAG
                    </code>
                    …
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* stack badges */}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {STACK_BADGES.map((badge) => (
              <span
                key={badge}
                className="text-text-muted bg-elevated border-line rounded-full border px-3 py-1 text-[11px] font-medium"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-line px-6 py-5">
        <p className="text-text-faint text-center text-xs">
          Built for developers · answers reference real files from the current branch
        </p>
      </footer>
    </div>
  );
}