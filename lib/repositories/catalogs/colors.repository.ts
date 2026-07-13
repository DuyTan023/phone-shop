import type { colors } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { FindManyParams } from "./../../types/public/types";

type FindManyResultColors = {
  colors: colors[];
  total: number;
};

// Tạo một type riêng cho việc update để code sạch hơn
type UpdateColorInput = {
  name: string;
  hex_code: string;
  description?: string | null; // Cho phép nhận undefined hoặc null đúng chuẩn schema
};

export const colorRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
  }: FindManyParams): Promise<FindManyResultColors> => {
    // Ép kiểu về Number để an toàn tuyệt đối đề phòng dữ liệu từ URL query đổ vào là String
    const safePage = Number(page) || 1;
    const safeLimit = Number(limit) || 10;
    const skip = (safePage - 1) * safeLimit;

    const [colors, total] = await prisma.$transaction([
      prisma.colors.findMany({
        skip,
        take: safeLimit,
        orderBy: { id: "asc" },
      }),
      prisma.colors.count(),
    ]);

    return { colors, total };
  },

  findByHexCode: async (hexCode: string): Promise<colors | null> => {
    // Vì hex_code là @unique, dùng findUnique sẽ nhanh và tối ưu hơn findFirst
    return prisma.colors.findUnique({
      where: { hex_code: hexCode },
    });
  },

  createColor: async (
    name: string,
    hex_code: string,
    description?: string,
  ): Promise<colors> => {
    // Thêm description vào đây luôn để lúc tạo màu mới nếu có mô tả thì lưu được ngay
    return prisma.colors.create({
      data: { name, hex_code, description },
    });
  },

  updateColorByHexCode: async ({
    name,
    hex_code,
    description,
  }: UpdateColorInput): Promise<colors> => {
    // Gom tham số thành object giúp bạn dễ gọi hàm hơn, không bị nhầm thứ tự argument
    return prisma.colors.update({
      where: { hex_code: hex_code },
      data: {
        name,
        description: description ?? undefined, // Nếu không truyền description thì giữ nguyên không ghi đè
      },
    });
  },

  deleteColor: async (hex_code: string): Promise<colors> => {
    return prisma.colors.delete({
      where: { hex_code: hex_code },
    });
  },
};
