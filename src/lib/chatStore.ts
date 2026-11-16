"use client";

import { useSyncExternalStore } from "react";
import type { ChatMessage, Conversation } from "./types";
import { uid } from "./types";

// Tiny external store for conversations, persisted to localStorage.
// Using useSyncExternalStore keeps server render (empty) and client in sync
// without hydration mismatches.

const KEY = "nova-conversations-v1";
const EMPTY: Conversation[] = [];

let state: Conversation[] | null = null;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;

function load(): Conversation[] {
  if (state) return state;
  try {
    const raw = localStorage.getItem(KEY);
    state = raw ? (JSON.parse(raw) as Conversation[]) : [];
  } catch {
    state = [];
  }
  return state;
}

function flush() {
  clearTimeout(saveTimer);
  saveTimer = undefined;
  if (!state) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function persist() {
  // Throttled (not debounced): streaming updates many times per second, and
  // a debounce would keep postponing the save until the stream ends.
  if (saveTimer === undefined) saveTimer = setTimeout(flush, 400);
}

if (typeof window !== "undefined") {
  // Don't lose the last few tokens if the tab is closed mid-stream.
  window.addEventListener("pagehide", flush);
}

function set(next: Conversation[]) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function sorted(list: Conversation[]) {
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt);
}

export const chatStore = {
  create(firstMessage: ChatMessage): string {
    const id = uid();
    const title = firstMessage.content.trim().replace(/\s+/g, " ").slice(0, 48) || "New chat";
    set(sorted([{ id, title, messages: [firstMessage], updatedAt: Date.now() }, ...load()]));
    return id;
  },

  append(convId: string, message: ChatMessage) {
    set(
      sorted(
        load().map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, message], updatedAt: Date.now() } : c,
        ),
      ),
    );
  },

  // Appends streamed text to a message; keeps order (no re-sort per token).
  appendText(convId: string, messageId: string, text: string) {
    set(
      load().map((c) =>
        c.id !== convId
          ? c
          : {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, content: m.content + text } : m,
              ),
            },
      ),
    );
  },

  rename(convId: string, title: string) {
    set(load().map((c) => (c.id === convId ? { ...c, title } : c)));
  },

  remove(convId: string) {
    set(load().filter((c) => c.id !== convId));
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      state = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useConversations(): Conversation[] {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}
