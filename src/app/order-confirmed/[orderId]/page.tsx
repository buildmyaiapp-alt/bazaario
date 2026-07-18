import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrderById } from "@/lib/data";
import { OrderDetail } from "@/components/order-detail";

export const dynamic = "force-dynamic";

export default async function OrderConfirmedPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await getSession();
  if (!session) redirect("/account");

  const { orderId } = await params;
  const order = await getOrderById(orderId, session.userId);
  if (!order) notFound();

  return <OrderDetail order={order} showConfirmation />;
}
