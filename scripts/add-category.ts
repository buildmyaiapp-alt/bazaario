import "dotenv/config";
import { adminDb } from "../src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { categories, slugify, img } from "./catalog-data";

// Additive counterpart to seed-firestore.ts: writes ONE category and its products
// without clearing anything. Safe to run on a live store with real orders.
//
//   npm run add-category "Pet Supplies"

async function main() {
  const name = process.argv[2];
  if (!name) {
    console.error('Usage: npm run add-category "<Category Name>"');
    console.error(`Available: ${categories.map((c) => c.name).join(", ")}`);
    process.exit(1);
  }

  const cat = categories.find((c) => c.name.toLowerCase() === name.toLowerCase());
  if (!cat) {
    console.error(`No category named "${name}" in scripts/catalog-data.ts.`);
    console.error(`Available: ${categories.map((c) => c.name).join(", ")}`);
    process.exit(1);
  }

  const categorySlug = slugify(cat.name);
  await adminDb.collection("categories").doc(categorySlug).set({
    name: cat.name,
    icon: cat.icon,
  });
  console.log(`Category "${cat.name}" written (${categorySlug}).`);

  for (const p of cat.products) {
    const productSlug = slugify(p.title);
    const productRef = adminDb.collection("products").doc(productSlug);
    const images = [img(p.title, 1), img(p.title, 2), img(p.title, 3)];
    const rating =
      p.reviews.length > 0
        ? Math.round((p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 10) / 10
        : 4.3;

    await productRef.set({
      title: p.title,
      brand: p.brand,
      description: p.description,
      price: p.price,
      mrp: p.mrp,
      stock: 50 + Math.floor(Math.random() * 100),
      rating,
      reviewCount: p.reviews.length,
      images,
      categorySlug,
      categoryName: cat.name,
      createdAt: FieldValue.serverTimestamp(),
    });

    // Reviews are a subcollection, so re-running would duplicate them. Clear first.
    const existingReviews = await productRef.collection("reviews").get();
    await Promise.all(existingReviews.docs.map((doc) => doc.ref.delete()));

    for (const r of p.reviews) {
      await productRef.collection("reviews").add({
        author: r.author,
        rating: r.rating,
        title: r.title,
        body: r.body,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    console.log(`  + ${p.title}`);
  }

  console.log(`Done. ${cat.products.length} products in "${cat.name}".`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
