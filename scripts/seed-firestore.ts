import "dotenv/config";
import { adminDb } from "../src/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { categories, slugify, img } from "./catalog-data";

async function clearCollection(path: string) {
  const snap = await adminDb.collection(path).get();
  await Promise.all(snap.docs.map((doc) => doc.ref.delete()));
}

async function main() {
  console.log("Clearing existing catalog data...");
  const productsSnap = await adminDb.collection("products").get();
  for (const doc of productsSnap.docs) {
    await clearCollection(`products/${doc.id}/reviews`);
    await doc.ref.delete();
  }
  await clearCollection("categories");
  await clearCollection("orders");

  console.log("Seeding categories and products...");
  let productCount = 0;

  for (const cat of categories) {
    const categorySlug = slugify(cat.name);
    await adminDb.collection("categories").doc(categorySlug).set({
      name: cat.name,
      icon: cat.icon,
    });

    for (const p of cat.products) {
      const productSlug = slugify(p.title);
      const images = [img(p.title, 1), img(p.title, 2), img(p.title, 3)];
      const rating =
        p.reviews.length > 0
          ? Math.round((p.reviews.reduce((sum, r) => sum + r.rating, 0) / p.reviews.length) * 10) / 10
          : 4.3;

      const productRef = adminDb.collection("products").doc(productSlug);
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

      for (const r of p.reviews) {
        await productRef.collection("reviews").add({
          author: r.author,
          rating: r.rating,
          title: r.title,
          body: r.body,
          createdAt: FieldValue.serverTimestamp(),
        });
      }

      productCount += 1;
    }
  }

  console.log(`Seeded ${categories.length} categories and ${productCount} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
