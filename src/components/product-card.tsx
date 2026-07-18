import Link from "next/link";
import Image from "next/image";
import { StarRating } from "@/components/star-rating";
import { formatPrice, discountPercent } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";

export function ProductCard({ product }: { product: ProductSummary }) {
  const discount = discountPercent(product.price, product.mrp);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col rounded-lg border border-gray-200 bg-white p-3 transition hover:shadow-md"
    >
      <div className="relative mb-3 aspect-square w-full overflow-hidden rounded-md bg-gray-50">
        <Image
          src={product.images[0]}
          alt={product.title}
          fill
          sizes="(max-width: 768px) 50vw, 20vw"
          className="object-cover transition group-hover:scale-105"
        />
      </div>
      <p className="text-xs uppercase tracking-wide text-gray-400">{product.brand}</p>
      <h3 className="mb-1 line-clamp-2 text-sm text-gray-800 group-hover:text-orange-600">
        {product.title}
      </h3>
      <div className="mb-1 flex items-center gap-1">
        <StarRating rating={product.rating} />
        <span className="text-xs text-gray-500">({product.reviewCount})</span>
      </div>
      <div className="mt-auto flex items-baseline gap-2">
        <span className="text-lg font-semibold text-gray-900">{formatPrice(product.price)}</span>
        {discount > 0 && (
          <>
            <span className="text-xs text-gray-400 line-through">{formatPrice(product.mrp)}</span>
            <span className="text-xs font-medium text-green-700">{discount}% off</span>
          </>
        )}
      </div>
    </Link>
  );
}
