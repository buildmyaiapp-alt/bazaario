"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import type { ProductDetail } from "@/lib/types";

export function AddToCart({ product }: { product: ProductDetail }) {
  const { addItem, lines } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const existingQty = lines.find((l) => l.productId === product.id)?.quantity ?? 0;
  const outOfStock = product.stock <= 0;

  function handleAdd() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images[0],
        price: product.price,
        mrp: product.mrp,
        stock: product.stock,
      },
      quantity
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images[0],
        price: product.price,
        mrp: product.mrp,
        stock: product.stock,
      },
      quantity
    );
    router.push("/checkout");
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      {outOfStock ? (
        <p className="mb-3 font-semibold text-red-600">Currently out of stock</p>
      ) : (
        <>
          <p className="mb-3 text-sm font-medium text-green-700">In Stock</p>
          <label className="mb-3 flex items-center gap-2 text-sm">
            Qty
            <select
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="rounded-md border border-gray-300 px-2 py-1"
            >
              {Array.from({ length: Math.min(product.stock, 10) }).map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="mb-2 w-full rounded-full bg-amber-400 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {added ? "Added to Cart ✓" : "Add to Cart"}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={outOfStock}
        className="w-full rounded-full bg-orange-500 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Buy Now
      </button>

      {existingQty > 0 && (
        <p className="mt-2 text-xs text-gray-500">{existingQty} already in your cart</p>
      )}
    </div>
  );
}
