import { useCallback, useEffect, useState } from "react";
import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";

import LoginHero from "./components/auth/LoginHero.jsx";
import Header from "./components/layout/Header.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import ChatContainer from "./components/chat/ChatContainer.jsx";
import ChatInput from "./components/chat/ChatInput.jsx";
import IndexRepoModal from "./components/repo/IndexRepoModal.jsx";

import { askQuestion } from "./services/api.js";

const STORAGE_PREFIX = "gitwiki:workspace";

function storageKey(userId) {
  return `${STORAGE_PREFIX}:${userId}`;
}

function readWorkspace(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return { repos: [], activeRepo: null };
    const parsed = JSON.parse(raw);
    return {
      repos: Array.isArray(parsed.repos) ? parsed.repos : [],
      activeRepo: parsed.activeRepo ?? null,
    };
  } catch {
    return { repos: [], activeRepo: null };
  }
}

function Workspace() {
  const { user } = useUser();
  const userId = user?.id ?? "anonymous";

  const [repos, setRepos] = useState(() => readWorkspace(userId).repos);
  const [activeRepo, setActiveRepo] = useState(() => {
    const data = readWorkspace(userId);
    return data.activeRepo ?? data.repos[0] ?? null;
  });
  const [messagesByRepo, setMessagesByRepo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showIndexModal, setShowIndexModal] = useState(false);

  const messages = activeRepo ? (messagesByRepo[activeRepo] ?? []) : [];

  // Persist the per-user workspace in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey(userId),
        JSON.stringify({ repos, activeRepo }),
      );
    } catch {
      /* storage unavailable — state still works in memory */
    }
  }, [userId, repos, activeRepo]);

  const handleIndexSuccess = useCallback((repo) => {
    setRepos((prev) => (prev.includes(repo) ? prev : [...prev, repo]));
    setActiveRepo(repo);
    setShowIndexModal(false);
  }, []);

  const handleDeleteRepo = useCallback(
    (repo) => {
      const next = repos.filter((r) => r !== repo);
      setRepos(next);
      if (activeRepo === repo) setActiveRepo(next[0] ?? null);
      setMessagesByRepo((prev) => {
        const rest = { ...prev };
        delete rest[repo];
        return rest;
      });
    },
    [repos, activeRepo],
  );

  const handleAsk = useCallback(
    async (question) => {
      const text = question.trim();
      if (!text || !activeRepo || isLoading) return;

      const userMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      const assistantPlaceholder = {
        id: crypto.randomUUID(),
        role: "assistant",
        streaming: true,
      };

      setMessagesByRepo((prev) => ({
        ...prev,
        [activeRepo]: [
          ...(prev[activeRepo] ?? []),
          userMessage,
          assistantPlaceholder,
        ],
      }));
      setIsLoading(true);

      try {
        const result = await askQuestion({ repo: activeRepo, question: text });
        setMessagesByRepo((prev) => ({
          ...prev,
          [activeRepo]: (prev[activeRepo] ?? []).map((m) =>
            m.id === assistantPlaceholder.id
              ? {
                  ...m,
                  streaming: false,
                  content: result.answer,
                  sources: result.sources,
                  queued: result.queued
                    ? {
                        message:
                          "Question accepted — the async worker is preparing an answer. Keep chatting or check the Inngest dashboard for progress.",
                      }
                    : null,
                }
              : m,
          ),
        }));
      } catch (err) {
        setMessagesByRepo((prev) => ({
          ...prev,
          [activeRepo]: (prev[activeRepo] ?? []).map((m) =>
            m.id === assistantPlaceholder.id
              ? {
                  ...m,
                  streaming: false,
                  error:
                    err?.message ||
                    "Something went wrong while contacting the backend.",
                }
              : m,
          ),
        }));
      } finally {
        setIsLoading(false);
      }
    },
    [activeRepo, isLoading],
  );

  return (
    <div className="bg-canvas flex h-full overflow-hidden">
      {/* Sidebar — desktop */}
      <div className="hidden md:flex">
        <Sidebar
          repos={repos}
          activeRepo={activeRepo}
          onSelect={setActiveRepo}
          onDelete={handleDeleteRepo}
          onOpenIndex={() => setShowIndexModal(true)}
        />
      </div>

      {/* Main workspace */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          activeRepo={activeRepo}
          onOpenIndex={() => setShowIndexModal(true)}
        />
        <ChatContainer
          messages={messages}
          isLoading={isLoading}
          activeRepo={activeRepo}
          onAsk={handleAsk}
          onOpenIndex={() => setShowIndexModal(true)}
        />
        <ChatInput
          onSubmit={handleAsk}
          loading={isLoading}
          hasRepo={Boolean(activeRepo)}
          activeRepo={activeRepo}
        />
      </div>

      <IndexRepoModal
        key={showIndexModal ? "open" : "closed"}
        open={showIndexModal}
        onClose={() => setShowIndexModal(false)}
        onSuccess={handleIndexSuccess}
      />
    </div>
  );
}

export default function App() {
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="bg-canvas flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-2 border-line border-t-accent" />
          <p className="text-text-faint text-sm">Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SignedOut>
        <LoginHero />
      </SignedOut>
      <SignedIn>
        <Workspace />
      </SignedIn>
    </>
  );
}
