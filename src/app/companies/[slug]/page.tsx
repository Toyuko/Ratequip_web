import { CompanyProfile } from "@/components/companies/company-profile";
import { getCompanyBySlug } from "@/lib/db/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);
  return { title: company?.name ?? "Company" };
}

export default async function CompanyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ draft?: string }>;
}) {
  const { slug } = await params;
  const { draft } = await searchParams;
  return <CompanyProfile slug={slug} draftMode={draft === "1"} />;
}
