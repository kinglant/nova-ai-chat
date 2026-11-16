"use client";

import {
  ArrowDown,
  ArrowUp,
  Menu,
  MessageSquare,
  Plus,
  Square,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStickToBottom } from "@/hooks/useStickToBottom";
import { chatStore, useConversations } from "@/lib/chatStore";
import { makeMessage, type ChatMessage } from "@/lib/types";
import { Markdown } from "./Markdown";

const SUGGESTIONS = [
  { title: "Write a React hook", prompt: "Write a React debounce hook in TypeScript" },
  { title: "Flutter vs React Native", prompt: "Flutter vs React Native: which should I choose?" },
  { title: "Plan an AI SaaS MVP", prompt: "Plan an AI SaaS MVP with a lean tech stack" },
  { title: "Explain something", prompt: "Explain how streaming responses work in a chat app" },
];

export function ChatApp() {
  const conversations = useConversations();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<"demo" | "live" | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { ref: scrollRef, onScroll, atBottom, scrollToBottom } = useStickToBottom<HTMLDivElement>();

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const messages = active?.messages ?? [];
  const busy = streamingId !== null;

  useEffect(() => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((d: { mode: "demo" | "live" }) => setMode(d.mode))
      .catch(() => {});
  }, []);

  // Auto-grow the textarea up to a max height.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  }, [input]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;

    const userMsg = makeMessage("user", content);
    const history = [...messages, userMsg];

    let convId = activeId;
    if (!convId || !active) {
      convId = chatStore.create(userMsg);
      setActiveId(convId);
    } else {
      chatStore.append(convId, userMsg);
    }

    const assistantMsg = makeMessage("assistant", "");
    chatStore.append(convId, assistantMsg);
    setInput("");
    setStreamingId(assistantMsg.id);
    scrollToBottom("instant");

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chatStore.appendText(convId, assistantMsg.id, decoder.decode(value, { stream: true }));
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        chatStore.appendText(convId, assistantMsg.id, "⚠️ Could not reach the server. Please try again.");
        console.error(err);
      }
    } finally {
      abortRef.current = null;
      setStreamingId(null);
      textareaRef.current?.focus();
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function newChat() {
    stop();
    setActiveId(null);
    setSidebarOpen(false);
    textareaRef.current?.focus();
  }

  function openChat(id: string) {
    if (busy) stop();
    setActiveId(id);
    setSidebarOpen(false);
    requestAnimationFrame(() => scrollToBottom("instant"));
  }

  function deleteChat(id: string) {
    if (id === activeId) newChat();
    chatStore.remove(id);
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-bg text-fg">
      {/* ── Sidebar ───────────────────────────────────────── */}
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-bg-soft transition-transform md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/">
            <Logo size="sm" />
          </Link>
          <button
            className="rounded-lg p-1.5 text-muted hover:bg-panel md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3">
          <button
            onClick={newChat}
            className="flex w-full items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2.5 text-sm font-medium shadow-sm transition hover:border-accent/50"
          >
            <Plus size={16} /> New chat
          </button>
        </div>

        <nav className="scrollbar-thin mt-4 flex-1 overflow-y-auto px-3 pb-4">
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-muted">History</p>
          {conversations.length === 0 && (
            <p className="px-2 text-sm text-muted">No conversations yet.</p>
          )}
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id} className="group relative">
                <button
                  onClick={() => openChat(c.id)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 pr-8 text-left text-sm transition ${
                    c.id === activeId ? "bg-panel font-medium shadow-sm" : "text-muted hover:bg-panel hover:text-fg"
                  }`}
                >
                  <MessageSquare size={15} className="shrink-0" />
                  <span className="truncate">{c.title}</span>
                </button>
                <button
                  onClick={() => deleteChat(c.id)}
                  aria-label={`Delete ${c.title}`}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted opacity-0 transition hover:text-red-500 group-hover:opacity-100 focus:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border px-4 py-3 text-xs text-muted">
          {mode === "demo" && "Demo mode · pre-written answers"}
          {mode === "live" && "Live · powered by Claude"}
        </div>
      </aside>

      {/* ── Main ──────────────────────────────────────────── */}
      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              className="rounded-lg p-1.5 text-muted hover:bg-bg-soft md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={20} />
            </button>
            <h1 className="truncate text-sm font-medium">{active?.title ?? "New chat"}</h1>
            {mode === "demo" && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                Demo
              </span>
            )}
          </div>
          <ThemeToggle />
        </header>

        <div ref={scrollRef} onScroll={onScroll} className="scrollbar-thin flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6">
            {messages.length === 0 ? (
              <EmptyState onPick={send} />
            ) : (
              <div className="space-y-6">
                {messages.map((m) => (
                  <MessageRow key={m.id} message={m} streaming={m.id === streamingId} />
                ))}
              </div>
            )}
          </div>
        </div>

        {!atBottom && messages.length > 0 && (
          <button
            onClick={() => scrollToBottom()}
            aria-label="Scroll to latest message"
            className="absolute bottom-32 left-1/2 z-10 -translate-x-1/2 rounded-full border border-border bg-panel p-2 text-muted shadow-lg transition hover:text-fg"
          >
            <ArrowDown size={16} />
          </button>
        )}

        {/* Composer */}
        <div className="px-4 pb-4 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mx-auto flex w-full max-w-3xl items-end gap-2 rounded-2xl border border-border bg-panel p-2 shadow-sm focus-within:border-accent/60"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Message Nova…"
              className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-2 text-[15px] outline-none placeholder:text-muted"
            />
            {busy ? (
              <button
                type="button"
                onClick={stop}
                aria-label="Stop generating"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fg text-bg transition hover:opacity-80"
              >
                <Square size={14} fill="currentColor" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                aria-label="Send message"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white transition hover:opacity-90 disabled:opacity-40"
              >
                <ArrowUp size={18} />
              </button>
            )}
          </form>
          <p className="mt-2 text-center text-[11px] text-muted">
            Nova can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
}

function MessageRow({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-accent px-4 py-2.5 text-[15px] text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
        N
      </div>
      <div className={`prose-chat min-w-0 flex-1 text-[15px] ${streaming ? "caret" : ""}`}>
        {message.content ? (
          <Markdown text={message.content} />
        ) : (
          <span className="inline-flex gap-1 pt-2" aria-label="Thinking">
            <Dot delay="0ms" />
            <Dot delay="150ms" />
            <Dot delay="300ms" />
          </span>
        )}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-2 w-2 animate-bounce rounded-full bg-muted"
      style={{ animationDelay: delay }}
    />
  );
}

function EmptyState({ onPick }: { onPick: (prompt: string) => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-2xl text-white shadow-lg shadow-violet-500/20">
        ✦
      </div>
      <h2 className="text-2xl font-semibold tracking-tight">How can I help you today?</h2>
      <p className="mt-2 text-sm text-muted">Ask anything, or start with one of these:</p>
      <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.title}
            onClick={() => onPick(s.prompt)}
            className="rounded-xl border border-border bg-panel p-4 text-left transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md"
          >
            <p className="text-sm font-medium">{s.title}</p>
            <p className="mt-1 line-clamp-1 text-xs text-muted">{s.prompt}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
