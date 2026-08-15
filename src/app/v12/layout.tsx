import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { V12_UI_ENABLED } from "@/lib/v12/flags";

function dashboardForRole(role: string | undefined) {
  if (role === "buyer" || role === "supplier" || role === "contractor") {
    return `/dashboard/${role}`;
  }
  return "/dashboard";
}

/**
 * Entire V12 tool hub is gated off for product users so dashboards stay
 * focused on RFQs, quotes, companies, and billing.
 */
export default async function V12Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!V12_UI_ENABLED) {
    const jar = await cookies();
    redirect(dashboardForRole(jar.get("rq_role")?.value));
  }

  return children;
}
