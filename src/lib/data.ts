import { adminDb } from "@/lib/firebase-admin";
import type { ProductDetail, ProductSummary } from "@/lib/types";

export type ProductFilters = {
  category?: string;
  q?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
};

type ProductDoc = {
  title: string;
  brand: string;
  description: string;
  price: number;
  mrp: number;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string[];
  categorySlug: string;
  categoryName: string;
};

function toProductSummary(slug: string, p: ProductDoc): ProductSummary {
  return {
    id: slug,
    slug,
    title: p.title,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp,
    rating: p.rating,
    reviewCount: p.reviewCount,
    images: p.images,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
  };
}

export async function getCategories() {
  const [categoriesSnap, productsSnap] = await Promise.all([
    adminDb.collection("categories").get(),
    adminDb.collection("products").select("categorySlug").get(),
  ]);

  const counts = new Map<string, number>();
  for (const doc of productsSnap.docs) {
    const slug = doc.get("categorySlug") as string;
    counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }

  return categoriesSnap.docs
    .map((doc) => ({
      id: doc.id,
      name: doc.get("name") as string,
      slug: doc.id,
      icon: doc.get("icon") as string,
      productCount: counts.get(doc.id) ?? 0,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const SEARCH_STOPWORDS = new Set([
  "a", "an", "the", "with", "for", "of", "in", "on", "at", "and", "or", "to", "by",
]);

function searchWords(q: string) {
  const words = q
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !SEARCH_STOPWORDS.has(w));
  return words.length > 0 ? words : [q.trim().toLowerCase()];
}

function relevanceScore(p: ProductDoc, words: string[]) {
  return words.reduce((sum, word) => {
    let s = 0;
    if (p.title.toLowerCase().includes(word)) s += 3;
    if (p.brand.toLowerCase().includes(word)) s += 2;
    if (p.description.toLowerCase().includes(word)) s += 1;
    return sum + s;
  }, 0);
}

export async function getProducts(filters: ProductFilters = {}): Promise<ProductSummary[]> {
  const query = filters.category
    ? adminDb.collection("products").where("categorySlug", "==", filters.category)
    : adminDb.collection("products");

  const snap = await query.get();
  let docs = snap.docs.map((doc) => ({ slug: doc.id, data: doc.data() as ProductDoc }));

  const words = filters.q?.trim() ? searchWords(filters.q) : [];
  if (words.length > 0) {
    docs = docs.filter(({ data }) => relevanceScore(data, words) > 0);
  }

  if (filters.minPrice) docs = docs.filter(({ data }) => data.price >= filters.minPrice!);
  if (filters.maxPrice) docs = docs.filter(({ data }) => data.price <= filters.maxPrice!);

  const useRelevanceSort = words.length > 0 && (!filters.sort || filters.sort === "featured");
  if (useRelevanceSort) {
    docs.sort((a, b) => relevanceScore(b.data, words) - relevanceScore(a.data, words));
  } else if (filters.sort === "price-asc") {
    docs.sort((a, b) => a.data.price - b.data.price);
  } else if (filters.sort === "price-desc") {
    docs.sort((a, b) => b.data.price - a.data.price);
  } else if (filters.sort === "rating") {
    docs.sort((a, b) => b.data.rating - a.data.rating);
  }

  return docs.slice(0, filters.limit ?? 60).map(({ slug, data }) => toProductSummary(slug, data));
}

export async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const [doc, reviewsSnap] = await Promise.all([
    adminDb.collection("products").doc(slug).get(),
    adminDb.collection("products").doc(slug).collection("reviews").get(),
  ]);

  if (!doc.exists) return null;
  const p = doc.data() as ProductDoc & { description: string; stock: number };

  const reviews = reviewsSnap.docs
    .map((r) => ({
      id: r.id,
      author: r.get("author") as string,
      rating: r.get("rating") as number,
      title: r.get("title") as string,
      body: r.get("body") as string,
      createdAt: (r.get("createdAt")?.toDate?.() ?? new Date()).toISOString(),
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  return {
    ...toProductSummary(slug, p),
    description: p.description,
    stock: p.stock,
    reviews,
  };
}

export async function getRelatedProducts(categorySlug: string, excludeSlug: string, limit = 6) {
  const products = await getProducts({ category: categorySlug, limit: limit + 1 });
  return products.filter((p) => p.slug !== excludeSlug).slice(0, limit);
}

type OrderDoc = {
  userId: string;
  address: {
    fullName: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  items: { title: string; image: string; price: number; quantity: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentReference: string | null;
  status: string;
  createdAt: FirebaseFirestore.Timestamp;
};

export async function getOrdersForUser(userId: string) {
  const snap = await adminDb.collection("orders").where("userId", "==", userId).get();

  return snap.docs
    .map((doc) => {
      const o = doc.data() as OrderDoc;
      return {
        id: doc.id,
        createdAt: o.createdAt.toDate().toISOString(),
        status: o.status,
        total: o.total,
        paymentMethod: o.paymentMethod,
        items: o.items,
      };
    })
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getOrderById(id: string, userId: string) {
  const doc = await adminDb.collection("orders").doc(id).get();
  if (!doc.exists) return null;

  const o = doc.data() as OrderDoc;
  if (o.userId !== userId) return null;

  return {
    id: doc.id,
    createdAt: o.createdAt.toDate().toISOString(),
    status: o.status,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentReference: o.paymentReference,
    address: o.address,
    items: o.items,
  };
}
