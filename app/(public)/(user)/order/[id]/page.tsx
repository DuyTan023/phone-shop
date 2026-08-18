import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/clerk-auth/authorization";
import { OrderDetailPage } from "@/lib/components/ui/order/order-detail-page";

type OrderPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function OrderPage({ params }: OrderPageProps) {
  // Kiểm tra đăng nhập
  const user = await requireAuth(`/order/${(await params).id}`);

  const { id } = await params;
  const orderId = Number(id);

  // Kiểm tra ID
  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  return <OrderDetailPage orderId={orderId} userId={user.id} />;
}
