import { Suspense } from "react";
import { getCategories, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { CategorySidebar } from "@/components/category-sidebar";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ category?: string; q?: string; sort?: string }>;

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const { category, q, sort } = await searchParams;

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ category, q, sort }),
  ]);

  const activeCategory = categories.find((c) => c.slug === category);
  const heading = q ? `Results for "${q}"` : activeCategory ? activeCategory.name : "All Products";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="flex flex-col gap-6 sm:flex-row">
        <CategorySidebar categories={categories} activeSlug={category} q={q} />

        <div className="flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{heading}</h1>
              <p className="text-sm text-gray-500">{products.length} results</p>
            </div>
            <Suspense fallback={null}>
              <ProductFilters />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
              No products found. Try a different search or category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
