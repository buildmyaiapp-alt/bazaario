import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const categories = await getCategories();
  const shelves = await Promise.all(
    categories.map(async (c) => ({
      category: c,
      products: await getProducts({ category: c.slug, limit: 6 }),
    }))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-8 overflow-hidden rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-14 text-white">
        <p className="text-sm font-medium uppercase tracking-widest text-orange-300">Big Deal Days</p>
        <h1 className="mt-2 max-w-xl text-3xl font-bold sm:text-4xl">
          Everything you need, delivered to your door.
        </h1>
        <p className="mt-3 max-w-lg text-slate-300">
          Electronics, fashion, home essentials, and more — all in one place.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-md bg-orange-400 px-6 py-2.5 font-semibold text-slate-900 hover:bg-orange-500"
        >
          Shop all products
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {categories.map((c) => (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-white px-2 py-4 text-center text-sm font-medium text-gray-700 hover:border-orange-300 hover:text-orange-600"
          >
            {c.name}
            <span className="mt-1 text-xs font-normal text-gray-400">{c.productCount} items</span>
          </Link>
        ))}
      </div>

      {shelves.map(
        ({ category, products }) =>
          products.length > 0 && (
            <section key={category.slug} className="mb-10">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">{category.name}</h2>
                <Link
                  href={`/products?category=${category.slug}`}
                  className="text-sm font-medium text-orange-600 hover:underline"
                >
                  See all
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          )
      )}
    </div>
  );
}
