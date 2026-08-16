import { prisma } from "@/lib/prisma";

export const cartItemRepository = {
  // Lấy item theo cart ID và variant ID
  findByCartIdAndVariantId(cartId: number, variantId: number) {
    return prisma.cart_items.findUnique({
      where: {
        cart_id_variant_id: {
          cart_id: cartId,
          variant_id: variantId,
        },
      },
    });
  },

  // Lấy danh sách item theo cart ID
  findManyByCartId(cartId: number) {
    return prisma.cart_items.findMany({
      where: {
        cart_id: cartId,
      },
      include: {
        product_variants: {
          include: {
            products: true,
            colors: true,
            rams: true,
            storages: true,
          },
        },
      },
    });
  },

  // Thêm item vào giỏ hàng
  create(cartId: number, variantId: number, quantity: number) {
    return prisma.cart_items.create({
      data: {
        cart_id: cartId,
        variant_id: variantId,
        quantity,
      },
    });
  },

  // Cập nhật số lượng item
  updateQuantity(itemId: number, quantity: number) {
    return prisma.cart_items.update({
      where: {
        id: itemId,
      },
      data: {
        quantity,
      },
    });
  },

  // Xóa item khỏi giỏ hàng
  delete(itemId: number) {
    return prisma.cart_items.delete({
      where: {
        id: itemId,
      },
    });
  },
};
