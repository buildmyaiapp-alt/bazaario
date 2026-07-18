import { NextResponse } from "next/server";
import { z } from "zod";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { getSession } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data";

const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_FEE = 49;

const schema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Your cart is empty"),
  address: z.object({
    fullName: z.string().min(2),
    line1: z.string().min(3),
    line2: z.string().optional(),
    city: z.string().min(2),
    state: z.string().min(2),
    pincode: z.string().min(4).max(10),
    phone: z.string().min(7).max(15),
  }),
  paymentMethod: z.enum(["cod", "razorpay"]),
  paymentReference: z.string().optional(),
}).refine((data) => data.paymentMethod !== "razorpay" || !!data.paymentReference, {
  message: "Missing payment confirmation",
  path: ["paymentReference"],
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const orders = await getOrdersForUser(session.userId);
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { items, address, paymentMethod, paymentReference } = parsed.data;

  try {
    const orderId = await adminDb.runTransaction(async (tx) => {
      const productRefs = items.map((item) => adminDb.collection("products").doc(item.productId));
      const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)));

      const products = productSnaps.map((snap, i) => {
        if (!snap.exists) {
          throw new Error("Some items in your cart are no longer available");
        }
        const data = snap.data() as { title: string; price: number; images: string[]; stock: number };
        if (data.stock < items[i].quantity) {
          throw new Error(`${data.title} has only ${data.stock} left in stock`);
        }
        return { slug: snap.id, ...data };
      });

      const subtotal = items.reduce((sum, item, i) => sum + products[i].price * item.quantity, 0);
      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
      const total = subtotal + shipping;

      const orderRef = adminDb.collection("orders").doc();
      tx.set(orderRef, {
        userId: session.userId,
        address: { ...address, line2: address.line2 ?? null },
        items: items.map((item, i) => ({
          productId: products[i].slug,
          title: products[i].title,
          image: products[i].images[0],
          price: products[i].price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        total,
        paymentMethod,
        paymentReference: paymentReference ?? null,
        status: "Confirmed",
        createdAt: FieldValue.serverTimestamp(),
      });

      items.forEach((item, i) => {
        tx.update(productRefs[i], { stock: products[i].stock - item.quantity });
      });

      return orderRef.id;
    });

    return NextResponse.json({ id: orderId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
