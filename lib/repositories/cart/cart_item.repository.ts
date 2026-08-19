import type { Prisma } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type Cart_Item = Prisma.cart_itemsGetPayload<{
  include: {
    product_variants: {
      include: {
        products: true;
        colors: true;
        rams: true;
        storages: true;
        product_images: {
          where: {
            is_featured: true;
          };
          take: 1;
        };
      };
    };
  };
}>;

const cartItemInclude = {
  product_variants: {
    include: {
      products: true,
      colors: true,
      rams: true,
      storages: true,
      product_images: {
        where: {
          is_featured: true,
        },
        take: 1,
      },
    },
  },
} satisfies Prisma.cart_itemsInclude;

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
  findManyByCartId: async (cartId: number): Promise<Cart_Item[]> => {
    const items = await prisma.cart_items.findMany({
      where: {
        cart_id: cartId,
      },
      include: cartItemInclude,
    });

    return attachColorImages(items);
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

  findByCartIdAndId(cartId: number, itemId: number) {
    return prisma.cart_items.findFirst({
      where: {
        id: itemId,
        cart_id: cartId,
      },
    });
  },
};

const attachColorImages = async (items: Cart_Item[]): Promise<Cart_Item[]> => {
  if (items.length === 0) return items;

  const productIds = [
    ...new Set(items.map((item) => item.product_variants.product_id)),
  ];

  const images = await prisma.product_images.findMany({
    where: {
      product_id: {
        in: productIds,
      },
      variant_id: {
        not: null,
      },
    },
    include: {
      product_variants: {
        select: {
          product_id: true,
          color_id: true,
        },
      },
    },
    orderBy: [
      {
        is_featured: "desc",
      },
      {
        id: "asc",
      },
    ],
  });

  const imageMap = new Map<string, (typeof images)[number]>();

  for (const image of images) {
    if (!image.product_variants) continue;

    const key = `${image.product_variants.product_id}-${image.product_variants.color_id}`;

    if (!imageMap.has(key)) {
      imageMap.set(key, image);
    }
  }

  return items.map((item) => {
    const variant = item.product_variants;
    const key = `${variant.product_id}-${variant.color_id}`;
    const image = imageMap.get(key);

    return {
      ...item,
      product_variants: {
        ...variant,
        product_images: image
          ? [
              {
                id: image.id,
                product_id: image.product_id,
                variant_id: image.variant_id,
                image_url: image.image_url,
                is_featured: image.is_featured,
              },
            ]
          : [],
      },
    };
  });
};
