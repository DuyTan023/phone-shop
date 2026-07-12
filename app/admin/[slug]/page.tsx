import { GetBrandBySlug } from "@/services/products/product.service";

export default async function BrandDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await GetBrandBySlug(slug);

  return (
    <div>
      <p>{data.id}</p>
      <p>{data.name}</p>
      <p>{data.description}</p>
    </div>
  );
}
