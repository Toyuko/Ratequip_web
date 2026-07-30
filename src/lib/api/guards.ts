import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  requireAdmin,
  requireApiUser,
  type ApiUser,
} from "@/lib/api/auth";
import { err } from "@/lib/api/envelope";
import { apiResponse } from "@/lib/api/respond";

type GateOk = { user: ApiUser; errorResponse: null };
type GateFail = { user: null; errorResponse: NextResponse };

async function hasExplicitDemoSession(req: NextRequest) {
  const jar = await cookies();
  return (
    Boolean(req.headers.get("x-demo-role")) ||
    jar.get("rq_onboarded")?.value === "1" ||
    Boolean(jar.get("rq_email")?.value)
  );
}

export async function gateApiUser(req: NextRequest): Promise<GateOk | GateFail> {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return {
      user: null,
      errorResponse: apiResponse(
        req,
        err(authResult.error!, authResult.status),
      ),
    };
  }
  // Demo mode invents a buyer for anonymous requests — do not treat that as auth
  // for mutating / sensitive APIs unless the client opted into a demo session.
  if (authResult.user.isDemo && !(await hasExplicitDemoSession(req))) {
    return {
      user: null,
      errorResponse: apiResponse(req, err("Authentication required", 401)),
    };
  }
  return { user: authResult.user, errorResponse: null };
}

export async function gateAdmin(req: NextRequest): Promise<GateOk | GateFail> {
  const authResult = await requireAdmin(req);
  if (!authResult.user) {
    return {
      user: null,
      errorResponse: apiResponse(
        req,
        err(authResult.error!, authResult.status),
      ),
    };
  }
  if (authResult.user.isDemo && !(await hasExplicitDemoSession(req))) {
    return {
      user: null,
      errorResponse: apiResponse(req, err("Authentication required", 401)),
    };
  }
  return { user: authResult.user, errorResponse: null };
}
