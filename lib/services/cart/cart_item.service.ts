// cart_item.service.ts

import { cartItemRepository } from "@/lib/repositories/cart/cart_item.repository";
import { cartService } from "./cart.service";

export const cartItemService = {
  // Lấy danh sách item trong giỏ hàng
  async getCartItems(userId: number) {
    const cart = await cartService.getCartByUserId(userId);

    if (!cart) {
      return [];
    }

    return cartItemRepository.findManyByCartId(cart.id);
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(userId: number, variantId: number, quantity: number) {
    const cart = await cartService.getOrCreateCart(userId);

    const existingItem = await cartItemRepository.findByCartIdAndVariantId(
      cart.id,
      variantId,
    );

    if (existingItem) {
      return cartItemRepository.updateQuantity(
        existingItem.id,
        existingItem.quantity + quantity,
      );
    }

    return cartItemRepository.create(cart.id, variantId, quantity);
  },

  // Cập nhật số lượng item
  async updateQuantity(userId: number, itemId: number, quantity: number) {
    const cart = await cartService.getCartByUserId(userId);

    if (!cart) {
      throw new Error("CART_NOT_FOUND");
    }

    const item = await cartItemRepository.findByCartIdAndVariantId(
      cart.id,
      itemId,
    );

    if (!item) {
      throw new Error("CART_ITEM_NOT_FOUND");
    }

    return cartItemRepository.updateQuantity(item.id, quantity);
  },

  // Xóa item khỏi giỏ hàng
  async removeFromCart(userId: number, itemId: number) {
    const cart = await cartService.getCartByUserId(userId);

    if (!cart) {
      throw new Error("CART_NOT_FOUND");
    }

    const item = await cartItemRepository.findByCartIdAndVariantId(
      cart.id,
      itemId,
    );

    if (!item) {
      throw new Error("CART_ITEM_NOT_FOUND");
    }

    return cartItemRepository.delete(item.id);
  },
};
