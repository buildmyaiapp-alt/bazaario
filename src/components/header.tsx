"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";

export function Header({ categories }: { categories: { name: string; slug: string }[] }) {
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    router.push(`/products?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-40 bg-slate-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">
          Bazario<span className="text-orange-400">.</span>
        </Link>

        <form onSubmit={handleSearch} className="flex flex-1 overflow-hidden rounded-md bg-white">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Bazario"
            className="w-full min-w-0 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none"
          />
          <button
            type="submit"
            className="flex items-center justify-center bg-orange-400 px-4 text-slate-900 hover:bg-orange-500"
            aria-label="Search"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-4 text-sm">
          {user ? (
            <div className="group relative">
              <button className="flex flex-col leading-tight">
                <span className="text-xs text-gray-300">Hello, {user.name.split(" ")[0]}</span>
                <span className="font-semibold">Account</span>
              </button>
              <div className="invisible absolute right-0 z-50 mt-2 w-44 rounded-md bg-white py-2 text-gray-800 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                <Link href="/account" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Your Account
                </Link>
                <Link href="/orders" className="block px-4 py-2 text-sm hover:bg-gray-100">
                  Your Orders
                </Link>
                <button
                  onClick={() => logout()}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/account" className="flex flex-col leading-tight">
              <span className="text-xs text-gray-300">Hello, Sign in</span>
              <span className="font-semibold">Account & Lists</span>
            </Link>
          )}

          <Link href="/orders" className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs text-gray-300">Returns</span>
            <span className="font-semibold">& Orders</span>
          </Link>

          <Link href="/cart" className="relative flex items-center gap-1">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 left-3 flex h-5 w-5 items-center justify-center rounded-full bg-orange-400 text-xs font-bold text-slate-900">
                {itemCount}
              </span>
            )}
            <span className="hidden font-semibold sm:inline">Cart</span>
          </Link>
        </div>
      </div>

      <nav className="scrollbar-none flex gap-4 overflow-x-auto bg-slate-800 px-4 py-2 text-sm">
        <Link href="/products" className="shrink-0 whitespace-nowrap hover:text-orange-300">
          All Products
        </Link>
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="shrink-0 whitespace-nowrap hover:text-orange-300"
          >
            {c.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
