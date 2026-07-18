# Bazario

A self-contained Amazon-style customer storefront built with Next.js and Firebase. Everything — browsing, search, cart, checkout, and orders — runs from a single app.

## Features

- Home page with category shelves, category browsing, search, sort, and price-aware filtering
- Product detail pages with image gallery, ratings, and customer reviews
- Cart (persisted in the browser)
- Email/password accounts via Firebase Authentication (cookie-based session)
- Checkout with a shipping address form and payment via Razorpay (test mode) or Cash on Delivery
- Order history and order confirmation pages

## Running locally

```bash
npm install
npm run dev              # http://localhost:3000
```

Requires a `.env` file with Firebase web app config (`NEXT_PUBLIC_FIREBASE_*`), a Firebase Admin service account (`FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`), and a Razorpay key (`NEXT_PUBLIC_RAZORPAY_KEY_ID`) — see `.env` for the exact variable names. None of these are committed to git.

To reseed the product catalog into Firestore:

```bash
npx tsx scripts/seed-firestore.ts   # seeds 8 categories and ~33 demo products
```

## Stack

- Next.js 16 (App Router, Turbopack)
- Firebase Authentication (email/password) + session cookies via Firebase Admin SDK
- Firestore (products, categories, reviews, orders)
- Tailwind CSS 4
- Razorpay Checkout (test mode)

## Notes

- Product images are placeholders from `picsum.photos`, seeded deterministically per product.
- Prices are stored and displayed as whole rupees (no paise/decimal handling).
- Firestore security rules deny all direct client access — the app only talks to Firestore server-side via the Admin SDK.
- This is a learning/demo project — payments run in Razorpay test mode and it is not affiliated with any real e-commerce brand.
