import { useEffect, useRef, useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";

export default function ChatInput({ onSubmit, loading, hasRepo, activeRepo }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const canSend = Boolean(value.trim()) && hasRepo && !loading;

  // Auto-resize the textarea up to 6 rows
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (canSend) submit();
    }
  };

  const submit = () => {
    if (!canSend) return;
    onSubmit(value.trim());
    setValue("");
    textareaRef.current?.focus();
  };

  return (
    <div className="border-line shrink-0 border-t bg-panel/60 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto w-full max-w-3xl">
        <div
          className={`border-line flex items-end gap-2 rounded-2xl border bg-canvas p-2 shadow-lg shadow-black/20 transition-colors focus-within:border-accent/50 focus-within:ring-2 focus-within:ring-accent/15 ${
            hasRepo ? "" : "opacity-70"
          }`}
        >
          <textarea
            ref={textareaRef}
            value={value}
            rows={1}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              hasRepo
                ? `Ask anything about ${activeRepo}…`
                : "Select or index a repository to start chatting…"
            }
            aria-label="Ask a question about the active repository"
            disabled={!hasRepo}
            className="max-h-40 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-[14px] leading-relaxed text-text-primary placeholder:text-text-faint focus:outline-none disabled:cursor-not-allowed"
          />

          {loading ? (
            <div className="flex h-10 shrink-0 items-center gap-2 px-3 text-[13px] text-text-muted">
              <Loader2 size={16} className="animate-spin text-accent" aria-hidden="true" />
              <span className="hidden sm:inline">Thinking…</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!canSend}
              aria-label="Send message"
              className="bg-accent hover:bg-accent-hover focus-visible:ring-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md shadow-violet-500/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:bg-[#3b2d66] disabled:shadow-none"
            >
              <SendHorizonal size={17} aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="text-text-faint mt-2 hidden text-center text-[11px] sm:block">
          Enter to send · Shift + Enter for a new line · answers are grounded in the
          indexed repository
        </p>
      </div>
    </div>
  );
}