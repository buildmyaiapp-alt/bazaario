import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getOrderById } from "@/lib/data";
import { OrderDetail } from "@/components/order-detail";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/account");

  const { id } = await params;
  const order = await getOrderById(id, session.userId);
  if (!order) notFound();

  return <OrderDetail order={order} />;
}
