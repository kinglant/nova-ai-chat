"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const THRESHOLD = 80; // px from the bottom that still counts as "at bottom"

/**
 * Keeps a scroll container pinned to the bottom while content grows
 * (e.g. a streamed AI answer), but stops following as soon as the user
 * scrolls up, and resumes once they return to the bottom.
 */
export function useStickToBottom<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const stuck = useRef(true);
  const [atBottom, setAtBottom] = useState(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = ref.current;
    if (!el) return;
    stuck.current = true;
    setAtBottom(true);
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const onScroll = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < THRESHOLD;
    stuck.current = near;
    setAtBottom(near);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const follow = () => {
      if (stuck.current) el.scrollTop = el.scrollHeight;
    };

    // Content inside the container grows while tokens stream in, so watch
    // its size instead of only reacting to new messages.
    const resize = new ResizeObserver(follow);
    const observeChildren = () => {
      resize.disconnect();
      Array.from(el.children).forEach((child) => resize.observe(child));
    };
    observeChildren();

    // New message nodes are added/removed over time.
    const mutation = new MutationObserver(() => {
      observeChildren();
      follow();
    });
    mutation.observe(el, { childList: true });

    follow();
    return () => {
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  return { ref, onScroll, atBottom, scrollToBottom };
}
