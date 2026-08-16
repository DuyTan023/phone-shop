import { cartRepository } from "@/lib/repositories/cart/cart.repository";

export const cartService = {
  // Lấy giỏ hàng theo user ID
  getCartByUserId(userId: number) {
    return cartRepository.findByUserId(userId);
  },

  // Tạo giỏ hàng cho user
  async createCart(userId: number) {
    const cart = await cartRepository.findByUserId(userId);

    if (cart) {
      throw new Error("CART_ALREADY_EXISTS");
    }

    return cartRepository.create(userId);
  },

  // Lấy giỏ hàng, nếu chưa có thì tạo mới
  async getOrCreateCart(userId: number) {
    const cart = await cartRepository.findByUserId(userId);

    if (cart) {
      return cart;
    }

    return cartRepository.create(userId);
  },
};
