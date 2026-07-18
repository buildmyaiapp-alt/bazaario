import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/data";
import { StarRating } from "@/components/star-rating";
import { ImageGallery } from "@/components/image-gallery";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { formatPrice, discountPercent } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(product.categorySlug, product.slug);
  const discount = discountPercent(product.price, product.mrp);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-4 text-sm text-gray-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/products?category=${product.categorySlug}`} className="hover:underline">
          {product.categoryName}
        </Link>
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1.5fr_1fr]">
        <ImageGallery images={product.images} title={product.title} />

        <div>
          <p className="text-sm text-gray-500">{product.brand}</p>
          <h1 className="mb-2 text-2xl font-semibold text-gray-900">{product.title}</h1>
          <div className="mb-3 flex items-center gap-2">
            <StarRating rating={product.rating} size={16} />
            <span className="text-sm text-orange-600">
              {product.rating} · {product.reviewCount} ratings
            </span>
          </div>
          <hr className="mb-3" />
          <div className="mb-3">
            {discount > 0 && <span className="mr-2 text-red-600">-{discount}%</span>}
            <span className="text-2xl font-semibold">{formatPrice(product.price)}</span>
            {discount > 0 && (
              <span className="ml-2 text-sm text-gray-400 line-through">{formatPrice(product.mrp)}</span>
            )}
          </div>
          <p className="mb-1 text-sm font-semibold text-gray-800">About this item</p>
          <p className="whitespace-pre-line text-sm leading-6 text-gray-700">{product.description}</p>
        </div>

        <div>
          <AddToCart product={product} />
        </div>
      </div>

      <section className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Customer Reviews</h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {product.reviews.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-1 flex items-center gap-2">
                  <StarRating rating={r.rating} />
                  <p className="text-sm font-semibold text-gray-900">{r.title}</p>
                </div>
                <p className="mb-2 text-xs text-gray-500">{r.author}</p>
                <p className="text-sm text-gray-700">{r.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Related products</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
