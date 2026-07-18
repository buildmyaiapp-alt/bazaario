import Link from "next/link";

type Category = { name: string; slug: string; productCount: number };

export function CategorySidebar({
  categories,
  activeSlug,
  q,
}: {
  categories: Category[];
  activeSlug?: string;
  q?: string;
}) {
  const qParam = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <aside className="w-full shrink-0 sm:w-52">
      <h3 className="mb-2 text-sm font-semibold text-gray-900">Category</h3>
      <ul className="space-y-1 text-sm">
        <li>
          <Link
            href={`/products?${q ? `q=${encodeURIComponent(q)}` : ""}`}
            className={!activeSlug ? "font-semibold text-orange-600" : "text-gray-600 hover:text-orange-600"}
          >
            All Categories
          </Link>
        </li>
        {categories.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/products?category=${c.slug}${qParam}`}
              className={
                activeSlug === c.slug ? "font-semibold text-orange-600" : "text-gray-600 hover:text-orange-600"
              }
            >
              {c.name} <span className="text-gray-400">({c.productCount})</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
