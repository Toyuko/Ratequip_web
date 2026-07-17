import { CompanyProfile } from "@/components/companies/company-profile";
import { getCompanyBySlug } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  return { title: company?.name ?? "Supplier" };
}

export default async function SupplierProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CompanyProfile slug={slug} />;
}
