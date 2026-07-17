import { SuppliersDirectory } from "@/components/suppliers/suppliers-directory";
import { listCategories, listCompanies } from "@/lib/db/queries";

export const metadata = { title: "Supplier directory" };

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; country?: string }>;
}) {
  const params = await searchParams;
  const companies = await listCompanies({
    q: params.q,
    category: params.category,
    country: params.country,
  });
  const categories = await listCategories();

  return (
    <SuppliersDirectory
      companies={companies}
      categories={categories}
      params={params}
    />
  );
}
