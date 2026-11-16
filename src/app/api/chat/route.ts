import Anthropic from "@anthropic-ai/sdk";
import { mockStream, pickMockAnswer } from "@/lib/mock";

const SYSTEM_PROMPT =
  "You are Nova, a friendly and concise AI assistant inside a SaaS web app. " +
  "Format answers in Markdown. Use code blocks with a language tag for code.";

const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5-5";
const MAX_HISTORY = 40;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

function isValid(body: unknown): body is { messages: IncomingMessage[] } {
  if (!body || typeof body !== "object") return false;
  const msgs = (body as { messages?: unknown }).messages;
  return (
    Array.isArray(msgs) &&
    msgs.length > 0 &&
    msgs.every(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.length <= 20_000,
    )
  );
}

export async function GET() {
  return Response.json({ mode: process.env.ANTHROPIC_API_KEY ? "live" : "demo" });
}

export async function POST(req: Request) {
  const body: unknown = await req.json().catch(() => null);
  if (!isValid(body)) {
    return new Response("Invalid request body", { status: 400 });
  }

  const messages = body.messages.slice(-MAX_HISTORY).filter((m) => m.content.trim());
  const headers = {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-cache",
  };

  // ── Demo mode ────────────────────────────────────────────────
  if (!process.env.ANTHROPIC_API_KEY) {
    const last = messages.at(-1)?.content ?? "";
    return new Response(mockStream(pickMockAnswer(last), req.signal), {
      headers: { ...headers, "X-Nova-Mode": "demo" },
    });
  }

  // ── Live mode (Claude) ───────────────────────────────────────
  const client = new Anthropic();
  const encoder = new TextEncoder();

  const stream = client.beta.messages.stream(
    {
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      output_config: { effort: "low" },
      // If the model declines, the API retries on a fallback model automatically.
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      messages,
    },
    { signal: req.signal },
  );

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(encoder.encode("\n\n_Sorry, I can't help with that request._"));
        } else if (final.stop_reason === "max_tokens") {
          controller.enqueue(encoder.encode("\n\n_…response truncated._"));
        }
      } catch (err) {
        if (!req.signal.aborted) {
          const msg =
            err instanceof Anthropic.RateLimitError
              ? "Too many requests, please try again in a moment."
              : err instanceof Anthropic.AuthenticationError
                ? "The server's API key is invalid."
                : "Something went wrong while generating the answer.";
          controller.enqueue(encoder.encode(`\n\n⚠️ ${msg}`));
          console.error("[api/chat]", err);
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, { headers: { ...headers, "X-Nova-Mode": "live" } });
}
