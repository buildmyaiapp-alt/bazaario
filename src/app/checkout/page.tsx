"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Script from "next/script";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD = 499;
const SHIPPING_FEE = 49;
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { lines, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "razorpay">("razorpay");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/account?redirect=/checkout");
    }
  }, [loading, user, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- prefill from session once it loads, user can still edit
    if (user) setFullName(user.name);
  }, [user]);

  if (loading || !user) return null;

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="mb-2 text-xl font-semibold">Your cart is empty</h1>
        <p className="text-gray-500">Add some products before checking out.</p>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  async function createOrder(paymentReference?: string) {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        address: { fullName, line1, line2: line2 || undefined, city, state, pincode, phone },
        paymentMethod,
        paymentReference,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    clearCart();
    router.push(`/order-confirmed/${data.id}`);
  }

  function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    if (paymentMethod === "cod") {
      createOrder();
      return;
    }

    if (!razorpayReady || !RAZORPAY_KEY_ID) {
      setError("Payment gateway is still loading. Please try again in a moment.");
      setSubmitting(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: RAZORPAY_KEY_ID,
      amount: Math.round(total * 100),
      currency: "INR",
      name: "Bazario",
      description: `Order for ${lines.length} item${lines.length > 1 ? "s" : ""}`,
      prefill: { name: fullName, email: user?.email, contact: phone },
      theme: { color: "#f97316" },
      handler: (response) => {
        setSubmitting(true);
        createOrder(response.razorpay_payment_id);
      },
      modal: {
        ondismiss: () => setSubmitting(false),
      },
    });

    razorpay.open();
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setRazorpayReady(true)} />
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Checkout</h1>
      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Shipping Address</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                required
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                required
                placeholder="Address line 1"
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                placeholder="Address line 2 (optional)"
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm sm:col-span-2"
              />
              <input
                required
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                required
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 font-semibold text-gray-900">Payment Method</h2>
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                />
                Card / UPI / Netbanking (via Razorpay — test mode, no real charge)
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                Cash on Delivery
              </label>
            </div>
            {paymentMethod === "razorpay" && (
              <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Test mode: use card 4111 1111 1111 1111, any future expiry, any CVV — or any UPI ID with success@razorpay.
              </p>
            )}
          </div>
        </div>

        <div className="h-fit space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-900">Order Summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {lines.map((l) => (
              <div key={l.productId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-50">
                  <Image src={l.image} alt={l.title} fill className="object-cover" sizes="56px" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-2">{l.title}</p>
                  <p className="text-gray-500">
                    Qty {l.quantity} × {formatPrice(l.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-1 border-t border-gray-200 pt-3 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
          >
            {submitting
              ? "Please wait…"
              : paymentMethod === "razorpay"
                ? `Pay ${formatPrice(total)} with Razorpay`
                : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
