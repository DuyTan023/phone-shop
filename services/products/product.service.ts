import type { brands } from "@/app/generated/prisma/browser";
import { prisma } from "@/lib/prisma";

export default async function GetBrand(): Promise<brands[]> {
  try {
    const data = await prisma.brands.findMany();
    return data;
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function GetBrandBySlug(slug: string): Promise<brands> {
  return await prisma.brands.findUniqueOrThrow({
    where: {
      slug: slug,
    },
  });
}
