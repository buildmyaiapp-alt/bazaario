"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";

type Message = {
  role: "user" | "assistant";
  content: string;
  products?: ProductSummary[];
};

const GREETING: Message = {
  role: "assistant",
  content: "Hi! I can help you find something in the store. What are you shopping for?",
};

const SUGGESTIONS = [
  "Something for my dog under ₹700",
  "Gift ideas under ₹1,000",
  "A good phone for my parents",
];

export function ShopAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pending) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The greeting is local-only flavour, so it isn't worth sending as history.
        body: JSON.stringify({
          messages: next.filter((m) => m !== GREETING).map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, products: data.products },
      ]);
    } catch {
      setError("Couldn't reach the assistant. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="Open shopping assistant"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
      >
        <SparkleIcon />
        Ask Bazario
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 flex h-[560px] max-h-[calc(100vh-2.5rem)] w-[min(24rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <SparkleIcon />
          <div>
            <p className="text-sm font-semibold leading-tight">Bazario Assistant</p>
            <p className="text-xs leading-tight text-slate-300">Ask me to find anything</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close shopping assistant"
          className="rounded-full p-1 text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-gray-50 p-3">
        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={
                m.role === "user"
                  ? "ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-slate-900 px-3 py-2 text-sm text-white"
                  : "w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-sm text-gray-800 shadow-sm"
              }
            >
              {m.content}
            </div>

            {m.products && m.products.length > 0 && (
              <div className="mt-2 space-y-2">
                {m.products.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/product/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-2 transition hover:border-orange-400 hover:shadow-sm"
                  >
                    {/* Catalog images are remote placeholders, so a plain img keeps
                        this independent of next/image remote host config. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images[0]}
                      alt=""
                      className="h-14 w-14 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-gray-900">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.brand}</p>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        {pending && (
          <div className="w-fit rounded-2xl rounded-bl-sm bg-white px-3 py-2 shadow-sm">
            <span className="flex gap-1">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </span>
          </div>
        )}

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>
        )}

        {messages.length === 1 && !pending && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-700 transition hover:border-orange-400 hover:text-orange-600"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-gray-200 bg-white p-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={500}
          placeholder="Ask about any product…"
          className="min-w-0 flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-orange-400"
        />
        <button
          type="submit"
          disabled={pending || !input.trim()}
          aria-label="Send message"
          className="shrink-0 rounded-full bg-orange-500 p-2.5 text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-amber-400">
      <path d="M12 2l1.9 5.8L20 9.7l-5.1 3.2L16 19l-4-3.4L8 19l1.1-6.1L4 9.7l6.1-1.9L12 2z" />
    </svg>
  );
}
