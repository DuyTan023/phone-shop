import type { series } from "@/app/generated/prisma/client";
import type {
  CreateSerieInput,
  UpdateSerieInput,
} from "@/lib/types/catalogs/series.type";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";
import {
  seriesRepository,
  SerieWithBrand,
} from "./../../repositories/catalogs/series.repository";
import { PaginationResult } from "./../../types/public/types";
type GetSerieParams = {
  page?: number;
  limit?: number;
  keyword?: string;
};

export const serieService = {
  GetSerie: async ({
    page = 1,
    limit = 10,
    keyword,
  }: GetSerieParams): Promise<PaginationResult<SerieWithBrand>> => {
    try {
      const { series, total } = await seriesRepository.findMany({
        page,
        limit,
        keyword,
      });
      return {
        data: series,
        total: total,
        page: page,
        limit: limit,
        totalPage: Math.ceil(total / limit),
      };
    } catch (err) {
      throw new Error("Không thể lấy danh sách serie" + err);
    }
  },
  getSerieById: async (id: number): Promise<SerieWithBrand> => {
    try {
      const serie = await seriesRepository.findById(id);
      if (!serie) throw new Error("NOT_FOUND");
      return serie;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },
  getSerieByBrandSlug: async (slug: string): Promise<SerieWithBrand[]> => {
    try {
      const serie = await seriesRepository.findByBrandSlug(slug);
      if (!serie) throw new Error("NOT_FOUND");
      return serie;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },
  getSerieBySlug: async (slug: string): Promise<SerieWithBrand> => {
    try {
      const serie = await seriesRepository.findBySlug(slug);
      if (!serie) throw new Error("NOT_FOUND");
      return serie;
    } catch (err) {
      if (err instanceof Error && err.message === "NOT_FOUND") throw err;
      throw new Error("SERVER_ERROR");
    }
  },

  createSerie: async (input: CreateSerieInput): Promise<series> => {
    try {
      const [existing, existingSlug] = await Promise.all([
        seriesRepository.findByNameBrandId(input.name, input.brand_id),
        seriesRepository.findBySlug(input.slug),
      ]);
      if (existing) throw new Error("SERIE_EXISTS");
      if (existingSlug) throw new Error("SLUG_EXISTS");
      return await seriesRepository.createSeries(input);
    } catch (err) {
      if (err instanceof Error && err.message === "SERIE_EXISTS") throw err;
      if (err instanceof Error && err.message === "SLUG_EXISTS") throw err;
      if (err instanceof PrismaClientKnownRequestError && err.code === "P2003")
        throw new Error("BRAND_NOT_FOUND");
      throw new Error("SERVER_ERROR");
    }
  },

  updateSerie: async (id: number, input: UpdateSerieInput): Promise<series> => {
    try {
      // Kiểm tra serie có tồn tại không
      const currentSerie = await seriesRepository.findById(id);

      if (!currentSerie) {
        throw new Error("NOT_FOUND");
      }

      // Lấy dữ liệu sau khi cập nhật
      const name = input.name ?? currentSerie.name;
      const brand_id = input.brand_id ?? currentSerie.brand_id;
      const slug = input.slug ?? currentSerie.slug;

      // Kiểm tra trùng
      const [existing, existingSlug] = await Promise.all([
        seriesRepository.findByNameBrandIdExceptId(id, name, brand_id),
        seriesRepository.findBySlugExceptId(id, slug),
      ]);

      if (existing) throw new Error("SERIE_EXISTS");
      if (existingSlug) throw new Error("SLUG_EXISTS");

      return await seriesRepository.updateSerieById(id, input);
    } catch (err) {
      if (
        err instanceof Error &&
        ["NOT_FOUND", "SERIE_EXISTS", "SLUG_EXISTS"].includes(err.message)
      ) {
        throw err;
      }

      if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new Error("BRAND_NOT_FOUND");
      }

      throw new Error("SERVER_ERROR");
    }
  },
  deleteSerie: async (id: number): Promise<series> => {
    try {
      return await seriesRepository.deleteSerieById(id);
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          throw new Error("NOT_FOUND");
        }
        if (err.code === "P2003") {
          throw new Error("SERIES_HAS_PRODUCTS");
        }
      }
      throw new Error("SERVER_ERROR");
    }
  },
};
