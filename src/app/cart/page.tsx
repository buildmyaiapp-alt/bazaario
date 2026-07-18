"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { lines, subtotal, updateQuantity, removeItem } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Your Bazario Cart is empty</h1>
        <p className="mb-6 text-gray-500">Looks like you haven&apos;t added anything yet.</p>
        <Link href="/products" className="rounded-full bg-orange-500 px-6 py-2.5 font-semibold text-white hover:bg-orange-600">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <h1 className="mb-4 border-b border-gray-200 pb-3 text-xl font-semibold text-gray-900">
            Shopping Cart
          </h1>
          <div className="space-y-4">
            {lines.map((line) => (
              <div key={line.productId} className="flex gap-4 border-b border-gray-200 pb-4">
                <Link href={`/product/${line.slug}`} className="relative h-28 w-28 shrink-0 overflow-hidden rounded-md bg-gray-50">
                  <Image src={line.image} alt={line.title} fill className="object-cover" sizes="112px" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link href={`/product/${line.slug}`} className="mb-1 font-medium text-gray-800 hover:text-orange-600">
                    {line.title}
                  </Link>
                  <p className="mb-2 text-lg font-semibold text-gray-900">{formatPrice(line.price)}</p>
                  <div className="mt-auto flex items-center gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      Qty
                      <select
                        value={line.quantity}
                        onChange={(e) => updateQuantity(line.productId, Number(e.target.value))}
                        className="rounded-md border border-gray-300 px-2 py-1"
                      >
                        {Array.from({ length: Math.min(line.stock, 10) }).map((_, i) => (
                          <option key={i} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      onClick={() => removeItem(line.productId)}
                      className="text-orange-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-fit rounded-lg border border-gray-200 bg-white p-4">
          <p className="mb-2 text-lg">
            Subtotal ({lines.reduce((n, l) => n + l.quantity, 0)} items):{" "}
            <span className="font-semibold">{formatPrice(subtotal)}</span>
          </p>
          <p className="mb-4 text-xs text-gray-500">
            {subtotal >= 499 ? "Your order qualifies for FREE delivery." : "Free delivery on orders over ₹499."}
          </p>
          <Link
            href="/checkout"
            className="block w-full rounded-full bg-orange-500 py-2.5 text-center font-semibold text-white hover:bg-orange-600"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
