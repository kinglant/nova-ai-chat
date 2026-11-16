// Demo mode: realistic canned answers streamed token-by-token, so the live
// demo works without an API key (and costs nothing when clients try it).

const REACT_HOOK = `Here's a reusable **\`useDebounce\`** hook in TypeScript:

\`\`\`tsx
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
\`\`\`

**How to use it** in a search input:

\`\`\`tsx
const [query, setQuery] = useState("");
const debouncedQuery = useDebounce(query, 400);

useEffect(() => {
  if (debouncedQuery) fetchResults(debouncedQuery);
}, [debouncedQuery]);
\`\`\`

Why it helps:
- Cuts API calls while the user is still typing
- Keeps the UI responsive
- Works with any value type thanks to generics`;

const COMPARE = `Great question! Here's a quick comparison:

| | **Flutter** | **React Native** |
|---|---|---|
| Language | Dart | JavaScript / TypeScript |
| UI rendering | Own engine (Impeller) | Native components |
| Performance | Excellent, consistent 60–120 fps | Very good with the New Architecture |
| Hot reload | ✅ | ✅ |
| Web support | Good | Via React Native Web |
| Best for | Pixel-perfect custom UI | Teams already using React |

### My recommendation
- Choose **Flutter** if you want identical UI on every platform and top animation performance.
- Choose **React Native** if your team knows React and you want to share logic with a web app.

Both are production-ready. The better choice depends on your team, not the framework.`;

const SAAS_PLAN = `Here's a lean, cost-effective plan for an **AI SaaS MVP**:

### 1. Tech stack
- **Frontend:** Next.js + TypeScript + Tailwind CSS
- **Backend:** Next.js Route Handlers (no separate server needed)
- **Database & auth:** Supabase (Postgres + Auth + Storage)
- **Payments:** Stripe Checkout + webhooks
- **Hosting:** Vercel (free tier for the start)

### 2. Milestones
1. **Week 1:** auth, landing page, base layout
2. **Week 2:** core AI feature with streaming responses
3. **Week 3:** usage limits, billing, dashboard
4. **Week 4:** polish, analytics, launch 🚀

### 3. Cost at launch
Most of this stack is free until you have real traction, so monthly costs stay close to **$0–25** apart from AI usage.

Want me to break any milestone down into tasks?`;

const DEFAULT = (prompt: string) => `Thanks for your message! You asked:

> ${prompt.slice(0, 200)}${prompt.length > 200 ? "…" : ""}

This is **Nova AI running in demo mode**: answers are pre-written so the live demo works without an API key. Connect an Anthropic API key (\`ANTHROPIC_API_KEY\`) and Nova will answer with Claude in real time.

Things you can try in the demo:
- *"Write a React debounce hook"*
- *"Flutter vs React Native?"*
- *"Plan an AI SaaS MVP"*

Meanwhile, notice how the chat **auto-scrolls** while the answer streams, and **stops following** as soon as you scroll up to read something.`;

export function pickMockAnswer(prompt: string): string {
  const p = prompt.toLowerCase();
  if (/(flutter|react native|mobile|compare|\bvs\b)/.test(p)) return COMPARE;
  if (/(hook|debounce|react|code|typescript)/.test(p)) return REACT_HOOK;
  if (/(saas|mvp|plan|startup|stack)/.test(p)) return SAAS_PLAN;
  return DEFAULT(prompt);
}

export function mockStream(text: string, signal: AbortSignal): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  // Split into small chunks (word + trailing whitespace) to imitate tokens.
  const chunks = text.match(/\S+\s*|\s+/g) ?? [text];

  return new ReadableStream({
    async start(controller) {
      await sleep(350); // "thinking" pause
      for (const chunk of chunks) {
        if (signal.aborted) break;
        controller.enqueue(encoder.encode(chunk));
        await sleep(18 + Math.random() * 30);
      }
      controller.close();
    },
  });
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
