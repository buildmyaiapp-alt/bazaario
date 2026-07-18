import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";

type Order = {
  id: string;
  createdAt: string;
  status: string;
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  paymentReference: string | null;
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
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  razorpay: "Paid online via Razorpay",
};

export function OrderDetail({ order, showConfirmation = false }: { order: Order; showConfirmation?: boolean }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {showConfirmation && (
        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <p className="text-lg font-semibold text-green-800">Order placed successfully!</p>
          <p className="text-sm text-green-700">Thank you for shopping with Bazario.</p>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Order #{order.id.slice(-8).toUpperCase()}</h1>
          <p className="text-sm text-gray-500">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
          {order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex gap-4 rounded-lg border border-gray-200 bg-white p-3">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-50">
                <Image src={item.image} alt={item.title} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-gray-800">{item.title}</p>
                <p className="text-gray-500">
                  Qty {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
              <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-2 font-semibold text-gray-900">Shipping Address</h2>
            <p>{order.address.fullName}</p>
            <p>{order.address.line1}</p>
            {order.address.line2 && <p>{order.address.line2}</p>}
            <p>
              {order.address.city}, {order.address.state} {order.address.pincode}
            </p>
            <p>Phone: {order.address.phone}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
            <h2 className="mb-2 font-semibold text-gray-900">Payment</h2>
            <p className="mb-3 text-gray-600">
              {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
              {order.paymentReference && (
                <span className="block font-mono text-xs text-gray-400">Ref: {order.paymentReference}</span>
              )}
            </p>
            <div className="space-y-1 border-t border-gray-100 pt-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <Link href="/orders" className="block text-center text-sm text-orange-600 hover:underline">
            View all orders
          </Link>
        </div>
      </div>
    </div>
  );
}
