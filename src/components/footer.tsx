"use client";

export function Footer() {
  return (
    <footer className="mt-12 bg-slate-900 text-gray-300">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="w-full bg-slate-700 py-3 text-center text-sm hover:bg-slate-600"
      >
        Back to top
      </button>
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm">
        <p className="text-lg font-bold text-white">
          Bazario<span className="text-orange-400">.</span>
        </p>
        <p className="mt-2 max-w-md text-gray-400">
          A demo storefront built for learning purposes. Not affiliated with any real e-commerce brand.
          Payments are simulated — no real transactions occur.
        </p>
      </div>
    </footer>
  );
}
