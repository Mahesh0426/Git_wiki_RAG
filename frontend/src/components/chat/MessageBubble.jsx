import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Copy,
  User,
} from "lucide-react";
import SourcesList from "./SourcesList.jsx";

function CodeBlock({ className, children, ...props }) {
  const match = /language-(\w+)/.exec(className || "");
  const code = String(children).replace(/\n$/, "");
  const isInline = !match && !String(children).includes("\n");
  const [copied, setCopied] = useState(false);

  if (isInline) {
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  }

  const lang = match?.[1] ?? "text";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard unavailable — ignore */
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="group/code relative my-4 overflow-hidden rounded-xl border border-line bg-[#0a0e14]">
      <div className="border-line/70 bg-elevated/80 flex items-center justify-between border-b px-4 py-2">
        <span className="text-text-muted font-mono text-[11px] font-medium uppercase tracking-wider">
          {lang}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${lang} code`}
          className="text-text-faint hover:text-text-primary hover:bg-hovered flex h-6 w-6 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {copied ? (
            <Check size={13} className="text-success" aria-hidden="true" />
          ) : (
            <Copy size={13} aria-hidden="true" />
          )}
        </button>
      </div>
      <pre className="overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

const markdownComponents = {
  code: CodeBlock,
  a: ({ href, children, ...props }) => (
    <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
      {children}
    </a>
  ),
};

function UserBubble({ content }) {
  return (
    <div className="animate-fade-up flex items-start justify-end gap-2.5">
      <div className="max-w-[85%] rounded-2xl rounded-br-md bg-gradient-to-br from-violet-500 to-indigo-600 px-4 py-2.5 text-[14px] leading-relaxed text-white shadow-lg shadow-violet-900/25 sm:max-w-[75%]">
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
      <div className="border-line bg-hovered flex h-8 w-8 shrink-0 items-center justify-center rounded-full border">
        <User size={15} className="text-text-secondary" aria-hidden="true" />
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/25">
      <BookOpen size={15} aria-hidden="true" />
    </div>
  );
}

function StreamingBubble({ repo }) {
  return (
    <div className="flex items-start gap-2.5">
      <AssistantAvatar />
      <div className="border-line bg-panel flex items-center gap-3 rounded-2xl rounded-bl-md border px-4 py-3.5" role="status">
        <div className="flex items-center gap-1" aria-hidden="true">
          <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="animate-typing-dot h-1.5 w-1.5 rounded-full bg-accent" />
        </div>
        <span className="text-text-muted text-[13px]">
          Reading <span className="text-accent font-mono">{repo}</span>…
        </span>
      </div>
    </div>
  );
}

function QueuedNotice({ message }) {
  return (
    <div className="border-info/30 bg-info/10 mb-4 flex items-start gap-2 rounded-lg border px-3 py-2.5">
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mt-0.5 shrink-0 text-info"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      <p className="text-text-secondary text-[12.5px] leading-relaxed">
        {message}
      </p>
    </div>
  );
}

function AssistantBubble({ content, sources, repo, queued }) {
  return (
    <div className="animate-fade-up flex items-start gap-2.5">
      <AssistantAvatar />
      <div className="min-w-0 flex-1">
        <div className="border-line bg-panel max-w-[92%] rounded-2xl rounded-bl-md border px-4 py-3.5 sm:max-w-[85%] sm:px-5 sm:py-4">
          {queued && queued.message && (
            <QueuedNotice message={queued.message} />
          )}
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
        {sources?.length > 0 && <SourcesList sources={sources} repo={repo} />}
      </div>
    </div>
  );
}

function EventBubble({ message }) {
  return (
    <div className="flex items-start gap-2.5">
      <AssistantAvatar />
      <div className="border-danger/30 bg-danger-soft flex max-w-[85%] items-start gap-2.5 rounded-2xl rounded-bl-md border px-4 py-3 sm:max-w-[75%]">
        <AlertTriangle size={16} className="text-danger mt-0.5 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-text-primary text-[13px] font-semibold">Request failed</p>
          <p className="text-text-secondary mt-1 text-[13px] leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function MessageBubble({ message, repo }) {
  if (message.role === "user") {
    return <UserBubble content={message.content} />;
  }

  if (message.streaming) {
    return <StreamingBubble repo={repo} />;
  }

  if (message.error) {
    return <EventBubble message={message.error} />;
  }

  return (
    <AssistantBubble
      content={message.content}
      sources={message.sources}
      repo={repo}
      queued={message.queued}
    />
  );
}