import type { Prisma, series } from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  CreateSerieInput,
  UpdateSerieInput,
} from "@/lib/types/catalogs/series.type";
import { FindManyParams } from "./../../types/public/types";

export type FindManyResultSerie = {
  series: SerieWithBrand[];
  total: number;
};

export type SerieWithBrand = Prisma.seriesGetPayload<{
  include: {
    brands: true;
  };
}>;

export const seriesRepository = {
  findMany: async ({
    page = 1,
    limit = 10,
    keyword,
  }: FindManyParams): Promise<FindManyResultSerie> => {
    const skip = (page - 1) * limit;
    const [series, total] = await prisma.$transaction([
      prisma.series.findMany({
        where: keyword
          ? {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            }
          : undefined,
        skip,
        take: limit,
        orderBy: { id: "asc" },
        include: { brands: true },
      }),
      prisma.series.count({
        where: keyword
          ? {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            }
          : undefined,
      }),
    ]);
    return { series, total };
  },
  findById: async (id: number): Promise<SerieWithBrand | null> => {
    return prisma.series.findUnique({
      where: { id },
      include: { brands: true },
    });
  },
  findBySlug: async (slug: string): Promise<SerieWithBrand | null> => {
    return prisma.series.findUnique({
      where: { slug },
      include: { brands: true },
    });
  },

  findByNameBrandId: async (
    name: string,
    brand_id: number,
  ): Promise<SerieWithBrand | null> => {
    return prisma.series.findFirst({
      where: {
        name: name,
        brand_id: brand_id,
      },
      include: {
        brands: true,
      },
    });
  },
  createSeries: async (createSerieInput: CreateSerieInput): Promise<series> => {
    return prisma.series.create({ data: createSerieInput });
  },

  updateSerieById: async (
    id: number,
    updateSerieInput: UpdateSerieInput,
  ): Promise<series> => {
    return prisma.series.update({
      where: { id },
      data: updateSerieInput,
    });
  },

  deleteSerieById: async (id: number): Promise<series> => {
    return prisma.series.delete({
      where: { id: id },
    });
  },

  // Kiểm tra tên bỏ qua ID hiện tại
  findByNameBrandIdExceptId: async (
    id: number,
    name: string,
    brand_id: number,
  ): Promise<SerieWithBrand | null> => {
    return prisma.series.findFirst({
      where: {
        name,
        brand_id,
        NOT: {
          id,
        },
      },
      include: {
        brands: true,
      },
    });
  },

  // Kiểm slug tên bỏ qua ID hiện tại
  findBySlugExceptId: async (
    id: number,
    slug: string,
  ): Promise<SerieWithBrand | null> => {
    return prisma.series.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
      include: {
        brands: true,
      },
    });
  },
};
