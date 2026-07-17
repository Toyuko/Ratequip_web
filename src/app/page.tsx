import { HomePageClient } from "@/components/home/home-page-client";
import { listCompanies, listTopCategories } from "@/lib/db/queries";

export default async function HomePage() {
  const [companies, categories] = await Promise.all([
    listCompanies(),
    listTopCategories(),
  ]);

  return (
    <HomePageClient
      featured={companies.slice(0, 3)}
      categories={categories}
    />
  );
}
