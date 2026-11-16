import {
  ArrowRight,
  Check,
  Code2,
  History,
  Moon,
  MousePointerClick,
  Smartphone,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

const FEATURES = [
  {
    icon: Zap,
    title: "Real-time streaming",
    text: "Answers appear word by word as they are generated, with a stop button when you've read enough.",
  },
  {
    icon: MousePointerClick,
    title: "Smart auto-scroll",
    text: "Follows new text while it streams, and pauses the moment you scroll up to re-read something.",
  },
  {
    icon: Code2,
    title: "Markdown & code",
    text: "Rich formatting, tables and syntax-friendly code blocks with one-click copy.",
  },
  {
    icon: History,
    title: "Chat history",
    text: "Conversations are saved locally, so you can come back to any chat at any time.",
  },
  {
    icon: Moon,
    title: "Light & dark mode",
    text: "Follows your system theme by default, with a toggle that remembers your choice.",
  },
  {
    icon: Smartphone,
    title: "Fully responsive",
    text: "Designed mobile-first: a slide-out sidebar and a comfortable composer on any screen.",
  },
];

const PLANS = [
  {
    name: "Free",
    price: "$0",
    desc: "For trying Nova out",
    features: ["50 messages / day", "Chat history", "Standard speed"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$12",
    desc: "For daily professional use",
    features: ["Unlimited messages", "Priority speed", "Longer answers", "Email support"],
    cta: "Get Pro",
    highlight: true,
  },
  {
    name: "Team",
    price: "$29",
    desc: "Per seat, for growing teams",
    features: ["Everything in Pro", "Shared workspaces", "Admin dashboard", "SSO"],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-20 border-b border-border/60 bg-bg/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
            <a href="#features" className="hover:text-fg">Features</a>
            <a href="#pricing" className="hover:text-fg">Pricing</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/chat"
              className="rounded-lg bg-fg px-4 py-2 text-sm font-medium text-bg transition hover:opacity-85"
            >
              Open app
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-12rem] h-[32rem] w-[56rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-transparent blur-3xl"
          />
          <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:pt-28">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1 text-xs text-muted shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Powered by Claude · Live demo available
            </span>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Your smart AI assistant,{" "}
              <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                beautifully simple
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
              Nova helps you write code, plan projects and get answers fast, in a clean chat
              interface that stays out of your way.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-medium text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90"
              >
                Try it free <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="rounded-xl border border-border bg-panel px-6 py-3 font-medium transition hover:border-accent/50"
              >
                See features
              </a>
            </div>

            {/* Product preview */}
            <div className="mx-auto mt-16 max-w-3xl rounded-2xl border border-border bg-panel p-2 text-left shadow-2xl shadow-violet-500/10">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="space-y-4 rounded-xl bg-bg p-5 text-sm">
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-br-md bg-accent px-4 py-2 text-white">
                    Flutter vs React Native: which should I choose?
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
                    N
                  </div>
                  <div className="space-y-2 text-fg">
                    <p>Both are production-ready. Here&apos;s the short version:</p>
                    <ul className="list-disc space-y-1 pl-5 text-muted">
                      <li><b className="text-fg">Flutter</b>: pixel-perfect custom UI, top animation performance</li>
                      <li><b className="text-fg">React Native</b>: best if your team already knows React</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-border bg-bg-soft py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Everything a modern AI chat needs</h2>
              <p className="mt-4 text-muted">Built with Next.js, TypeScript and Tailwind CSS. Fast, accessible and easy to extend.</p>
            </div>
            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-border bg-panel p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                    <Icon size={20} />
                  </div>
                  <h3 className="mt-4 font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-24">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Simple, transparent pricing</h2>
              <p className="mt-4 text-muted">Start free. Upgrade when Nova becomes part of your day.</p>
            </div>
            <div className="mt-14 grid gap-5 lg:grid-cols-3">
              {PLANS.map((p) => (
                <div
                  key={p.name}
                  className={`relative flex flex-col rounded-2xl border p-7 ${
                    p.highlight
                      ? "border-accent bg-panel shadow-xl shadow-violet-500/15"
                      : "border-border bg-panel"
                  }`}
                >
                  {p.highlight && (
                    <span className="absolute -top-3 left-7 rounded-full bg-accent px-3 py-0.5 text-xs font-medium text-white">
                      Most popular
                    </span>
                  )}
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-1 text-sm text-muted">{p.desc}</p>
                  <p className="mt-6">
                    <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                    <span className="text-muted"> / month</span>
                  </p>
                  <ul className="mt-6 flex-1 space-y-3 text-sm">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2">
                        <Check size={16} className="text-accent" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/chat"
                    className={`mt-8 rounded-xl px-4 py-2.5 text-center text-sm font-medium transition ${
                      p.highlight
                        ? "bg-accent text-white hover:opacity-90"
                        : "border border-border hover:border-accent/50"
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 px-6 py-14 text-center text-white shadow-2xl shadow-violet-500/20">
            <h2 className="text-3xl font-semibold tracking-tight">Ready to work smarter?</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/80">Open Nova and ask your first question. No sign-up needed for the demo.</p>
            <Link
              href="/chat"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-violet-700 transition hover:bg-white/90"
            >
              Start chatting <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 text-sm text-muted sm:flex-row">
          <Logo size="sm" />
          <p>Portfolio project · Next.js, TypeScript, Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
}
