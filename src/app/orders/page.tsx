import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrdersForUser } from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const session = await getSession();
  if (!session) redirect("/account?redirect=/orders");

  const orders = await getOrdersForUser(session.userId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Your Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-12 text-center text-gray-500">
          You haven&apos;t placed any orders yet.{" "}
          <Link href="/products" className="text-orange-600 hover:underline">
            Start shopping
          </Link>
          .
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-lg border border-gray-200 bg-white p-4 hover:shadow-md"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 text-sm text-gray-500">
                <span>Order placed {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
                <span className="font-medium text-gray-800">{formatPrice(order.total)}</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 font-medium text-green-700">
                  {order.status}
                </span>
              </div>
              <div className="flex gap-2">
                {order.items.slice(0, 5).map((item, i) => (
                  <div key={i} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-50">
                    <Image src={item.image} alt={item.title} fill className="object-cover" sizes="64px" />
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
