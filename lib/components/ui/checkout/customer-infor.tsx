// components/checkout/customer-info.tsx

import type { users } from "@/app/generated/prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, User } from "lucide-react";
type CustomerInfoProps = {
  user: users;
};
export function CustomerInfo({ user }: CustomerInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">1. Thông tin người đặt</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Họ và tên</p>

              <p className="truncate text-sm font-medium">{user.full_name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Mail className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>

              <p className="truncate text-sm font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">
              <Phone className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Số điện thoại</p>

              <p className="truncate text-sm font-medium">
                {user.phone ?? "Chưa cập nhật"}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
