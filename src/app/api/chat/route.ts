import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";
import type { ProductSummary } from "@/lib/types";

// Shopping-assistant endpoint. The OpenAI key is read server-side only and is
// never sent to the browser — the client only ever sees the generated reply
// and the product slugs it picked.

const MODEL = "gpt-4o-mini";
const MAX_MESSAGE_CHARS = 500;
const MAX_HISTORY = 10;
const MAX_RECOMMENDATIONS = 4;

type ChatMessage = { role: "user" | "assistant"; content: string };

// The catalog is small enough to hand the model in full, which guarantees it
// can only recommend products that actually exist. If the catalog grows past a
// few hundred items, switch to tool-calling with a search function instead.
let catalogCache: { products: ProductSummary[]; expires: number } | null = null;

async function getCatalog() {
  if (catalogCache && catalogCache.expires > Date.now()) return catalogCache.products;
  const products = await getProducts({ limit: 500 });
  catalogCache = { products, expires: Date.now() + 5 * 60 * 1000 };
  return products;
}

// Best-effort throttle so a public endpoint can't quietly burn through the API
// budget. Serverless instances don't share memory, so this caps per-instance
// abuse rather than providing a global guarantee.
const hits = new Map<string, number[]>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function buildSystemPrompt(products: ProductSummary[]) {
  const lines = products.map(
    (p) =>
      `${p.slug} | ${p.title} | ${p.brand} | ${p.categoryName} | ₹${p.price} (MRP ₹${p.mrp}) | rated ${p.rating}/5 from ${p.reviewCount} reviews`
  );

  return `You are the shopping assistant for Bazario, an Indian online store. You help shoppers find products from the catalog below.

CATALOG (slug | title | brand | category | price | rating):
${lines.join("\n")}

Rules:
- Only ever recommend products from this catalog. Never invent a product, price, brand or slug.
- If nothing in the catalog fits what they asked for, say so plainly and suggest the closest category instead. Do not force a bad match.
- Prices are in Indian rupees. Always write them as ₹1,299 style.
- Keep replies short and conversational — 2 to 3 sentences. Do not list product details in the text; the products you pick are shown to the shopper as cards automatically.
- Recommend at most ${MAX_RECOMMENDATIONS} products, fewest that genuinely answer the question.
- If the shopper asks about something unrelated to shopping at Bazario, briefly steer back to helping them shop.

Reply with JSON only: {"reply": "<your message>", "products": ["<slug>", ...]}
Use an empty products array when you are not recommending anything (greetings, clarifying questions, no match).`;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "The shopping assistant isn't configured yet. Add OPENAI_API_KEY to .env.local." },
      { status: 503 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "You're sending messages a bit fast. Give it a moment and try again." },
      { status: 429 }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-MAX_HISTORY)
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_MESSAGE_CHARS) }));

  if (history.length === 0) {
    return NextResponse.json({ error: "Send a message to get started." }, { status: 400 });
  }

  const catalog = await getCatalog();

  let completion: Response;
  try {
    completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: buildSystemPrompt(catalog) }, ...history],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 400,
      }),
    });
  } catch {
    return NextResponse.json(
      { error: "Couldn't reach the assistant. Check your connection and try again." },
      { status: 502 }
    );
  }

  if (!completion.ok) {
    // Surface a useful hint for the two mistakes that actually happen in setup,
    // without leaking OpenAI's raw error (it can echo key fragments).
    const hint =
      completion.status === 401
        ? "The OpenAI API key was rejected. Check OPENAI_API_KEY in .env.local."
        : completion.status === 429
          ? "OpenAI rate limit or quota reached. Check your billing at platform.openai.com."
          : "The assistant is having trouble right now. Try again in a moment.";
    console.error(`OpenAI request failed: ${completion.status}`);
    return NextResponse.json({ error: hint }, { status: 502 });
  }

  const data = await completion.json();
  const raw = data.choices?.[0]?.message?.content;

  let parsed: { reply?: string; products?: string[] };
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error("Assistant returned unparseable JSON");
    return NextResponse.json(
      { error: "The assistant gave an unexpected response. Try rephrasing." },
      { status: 502 }
    );
  }

  // Resolve slugs against the real catalog so a hallucinated slug is dropped
  // rather than rendered as a broken product card.
  const bySlug = new Map(catalog.map((p) => [p.slug, p]));
  const products = (parsed.products ?? [])
    .map((slug) => bySlug.get(slug))
    .filter((p): p is ProductSummary => Boolean(p))
    .slice(0, MAX_RECOMMENDATIONS);

  return NextResponse.json({
    reply: parsed.reply?.trim() || "Sorry, I didn't catch that — could you rephrase?",
    products,
  });
}
