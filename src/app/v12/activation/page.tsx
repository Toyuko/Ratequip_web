import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COMPANY_SETUP_INTERVIEW_ENABLED } from "@/lib/v12/operating-profile/flags";
import CompanySetupWizardPage from "./wizard";

export const metadata = {
  title: "Company setup",
  description: "RateQuip company operating profile setup",
};

function dashboardForRole(role: string | undefined) {
  if (role === "buyer" || role === "supplier" || role === "contractor") {
    return `/dashboard/${role}`;
  }
  return "/dashboard";
}

/** Legacy Part 5 AI interview — gated off pending redesign. */
export default async function ActivationPage() {
  if (!COMPANY_SETUP_INTERVIEW_ENABLED) {
    const jar = await cookies();
    redirect(dashboardForRole(jar.get("rq_role")?.value));
  }

  return <CompanySetupWizardPage />;
}
