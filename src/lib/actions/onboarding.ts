"use server";

import { cookies } from "next/headers";
import { slugify } from "@/lib/utils";

export async function completeOnboarding(input: {
  role: "buyer" | "supplier" | "contractor";
  orgName: string;
}) {
  const jar = await cookies();
  jar.set("rq_role", input.role, { path: "/", httpOnly: false });
  jar.set("rq_org", input.orgName, { path: "/", httpOnly: false });
  jar.set("rq_org_slug", slugify(input.orgName), {
    path: "/",
    httpOnly: false,
  });
  jar.set("rq_onboarded", "1", { path: "/", httpOnly: false });

  return {
    message: `Organisation “${input.orgName}” ready in demo mode.`,
    redirectTo: `/dashboard/${input.role === "contractor" ? "contractor" : input.role}`,
  };
}
