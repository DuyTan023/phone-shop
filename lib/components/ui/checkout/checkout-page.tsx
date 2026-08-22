// components/checkout/checkout-page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";

import type {
  communes,
  provinces,
  user_addresses,
  users,
} from "@/app/generated/prisma/client";

import { AddressSection } from "@/lib/components/ui/checkout/address-section";
import { OrderSummary } from "@/lib/components/ui/checkout/order-summary";
import { CustomerInfo } from "./customer-infor";
import { OrderItems } from "./order-items";
import { PaymentMethod } from "./payment-method";

import type { ApiResponse } from "@/lib/types/public/types";
import type { AddressForm } from "./add-address-dialog";

export interface CheckoutItemPayload {
  id?: number;
  variant_id: number;
  product_name: string;
  sku: string;
  variant_info: string;
  price: number;
  quantity: number;
  total_price: number;
  image_url: string;
}

type CheckoutPageProps = {
  initialUser: users;
};

const SHIPPING_FEE = 0;

export function CheckoutPage({ initialUser }: CheckoutPageProps) {
  const [addresses, setAddresses] = useState<user_addresses[]>([]);
  const [provincesList, setProvincesList] = useState<provinces[]>([]);
  const [communesList, setCommunesList] = useState<communes[]>([]);

  // Lấy sản phẩm từ sessionStorage
  const [checkoutItems] = useState<CheckoutItemPayload[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    try {
      const data = sessionStorage.getItem("checkout_items");

      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Lỗi parse checkout_items từ sessionStorage:", error);

      return [];
    }
  });

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
    null,
  );

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "PAYOS">("COD");

  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);

  // Loading khi đang tạo đơn hàng / thanh toán
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // LOAD CHECKOUT DATA
  useEffect(() => {
    let isMounted = true;

    async function loadCheckoutData() {
      try {
        setLoading(true);

        const [addressResponse, provinceResponse] = await Promise.all([
          fetch("/api/users/addresses/user-addresses"),
          fetch("/api/users/addresses/province"),
        ]);

        const addressResult = (await addressResponse.json()) as ApiResponse<
          user_addresses[]
        >;

        const provinceResult = (await provinceResponse.json()) as ApiResponse<
          provinces[]
        >;

        if (!isMounted) {
          return;
        }

        // Addresses
        if (addressResult.success && addressResult.data) {
          setAddresses(addressResult.data);

          const defaultAddress = addressResult.data.find(
            (address) => address.is_default,
          );

          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
          } else if (addressResult.data.length > 0) {
            setSelectedAddressId(addressResult.data[0].id);
          }
        }

        // Provinces
        if (provinceResult.success && provinceResult.data) {
          setProvincesList(provinceResult.data);
        }
      } catch (error) {
        console.error("Lỗi tải dữ liệu thanh toán:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadCheckoutData();

    return () => {
      isMounted = false;
    };
  }, []);

  // LOAD COMMUNES

  useEffect(() => {
    if (!selectedAddressId || addresses.length === 0) {
      return;
    }

    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId,
    );

    if (!selectedAddress) {
      return;
    }

    async function loadCommunes() {
      try {
        const response = await fetch(
          `/api/users/addresses/commune/province/${selectedAddress?.province_id}`,
        );

        const result = (await response.json()) as ApiResponse<communes[]>;

        if (result.success && result.data) {
          setCommunesList(result.data);
        }
      } catch (error) {
        console.error("Lỗi tải danh sách xã/phường:", error);
      }
    }

    loadCommunes();
  }, [selectedAddressId, addresses]);

  // ADD ADDRESS

  const handleAddAddress = async (newAddressData: AddressForm) => {
    try {
      const response = await fetch("/api/users/addresses/user-addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddressData),
      });

      const result = (await response.json()) as ApiResponse<user_addresses>;

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể thêm địa chỉ");
      }

      // Load lại danh sách địa chỉ
      const updatedResponse = await fetch(
        "/api/users/addresses/user-addresses",
      );

      const updatedResult = (await updatedResponse.json()) as ApiResponse<
        user_addresses[]
      >;

      if (updatedResult.success && updatedResult.data) {
        setAddresses(updatedResult.data);

        // Chọn luôn địa chỉ vừa thêm
        if (result.data) {
          setSelectedAddressId(result.data.id);
        }
      }
    } catch (error) {
      console.error("Lỗi thêm địa chỉ:", error);

      alert(error instanceof Error ? error.message : "Không thể thêm địa chỉ");
    }
  };

  // CALCULATE PRICE

  const subtotal = useMemo(() => {
    return checkoutItems.reduce((sum, item) => sum + item.total_price, 0);
  }, [checkoutItems]);

  const shippingFee = checkoutItems.length > 0 ? SHIPPING_FEE : 0;

  const totalAmount = subtotal + shippingFee;

  // CREATE ORDER

  const handlePlaceOrder = async () => {
    // Chống click nhiều lần
    if (isPlacingOrder) {
      return;
    }

    // Kiểm tra địa chỉ
    if (!selectedAddressId) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }

    // Kiểm tra sản phẩm
    if (checkoutItems.length === 0) {
      alert("Không có sản phẩm nào để thanh toán!");
      return;
    }

    // Tìm địa chỉ được chọn
    const selectedAddress = addresses.find(
      (address) => address.id === selectedAddressId,
    );

    if (!selectedAddress) {
      alert("Không tìm thấy địa chỉ giao hàng!");
      return;
    }

    // Tìm tỉnh
    const province = provincesList.find(
      (province) => province.id === selectedAddress.province_id,
    );

    // Tìm xã/phường
    const commune = communesList.find(
      (commune) => commune.id === selectedAddress.commune_id,
    );

    // Tạo địa chỉ snapshot cho Order
    const shippingAddress = [
      selectedAddress.address_line,
      commune?.name,
      province?.name,
    ]
      .filter(Boolean)
      .join(", ");

    try {
      setIsPlacingOrder(true);

      // CREATE ORDER

      const orderPayload = {
        recipient_name: selectedAddress.recipient_name,
        recipient_phone: selectedAddress.phone,
        shipping_address: shippingAddress,
        note: note || null,

        subtotal,
        shipping_fee: shippingFee,
        total_amount: totalAmount,

        payment_method: paymentMethod,

        items: checkoutItems,
      };

      console.log("Payload tạo đơn hàng:", orderPayload);

      const response = await fetch("/api/users/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Không thể tạo đơn hàng");
      }

      const order = result.data;

      console.log("Tạo Order thành công:", order);

      // COD

      if (paymentMethod === "COD") {
        sessionStorage.removeItem("checkout_items");

        window.location.href = `/order/${order.id}`;

        return;
      }

      // PAYOS

      const paymentResponse = await fetch(
        `/api/users/order/${order.id}/payment`,
        {
          method: "POST",
        },
      );

      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok || !paymentResult.success) {
        throw new Error(
          paymentResult.message || "Không thể tạo thanh toán PayOS",
        );
      }

      // Chỉ xóa checkout items sau khi
      // tạo payment link thành công
      sessionStorage.removeItem("checkout_items");

      // Redirect sang PayOS
      window.location.href = paymentResult.data.checkoutUrl;
    } catch (error) {
      console.error("Lỗi đặt hàng:", error);

      alert(error instanceof Error ? error.message : "Không thể đặt hàng");

      setIsPlacingOrder(false);
    }
  };

  // LOADING PAGE

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Đang tải trang thanh toán...
      </div>
    );
  }

  // RENDER

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Đặt hàng</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kiểm tra thông tin và hoàn tất đơn hàng của bạn (
            {checkoutItems.length} sản phẩm)
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* LEFT */}
          <div className="space-y-6">
            {/* Customer */}
            <CustomerInfo user={initialUser} />

            {/* Address */}
            <AddressSection
              addresses={addresses}
              provincesList={provincesList}
              communesList={communesList}
              selectedAddressId={selectedAddressId}
              onSelectAddress={setSelectedAddressId}
              onAddAddress={handleAddAddress}
            />

            {/* Products */}
            <OrderItems
              items={checkoutItems.map((item, index) => ({
                ...item,
                id: item.id ?? index + 1,
              }))}
            />

            {/* Payment method */}
            <PaymentMethod value={paymentMethod} onChange={setPaymentMethod} />

            {/* Note */}
            <section className="rounded-xl border bg-background p-5">
              <div className="mb-4">
                <h2 className="font-semibold">Ghi chú đơn hàng</h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Không bắt buộc
                </p>
              </div>

              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Ví dụ: Giao hàng giờ hành chính..."
                className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              />
            </section>
          </div>

          {/* RIGHT */}
          <div>
            <OrderSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              totalAmount={totalAmount}
              onPlaceOrder={handlePlaceOrder}
              isLoading={isPlacingOrder}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
