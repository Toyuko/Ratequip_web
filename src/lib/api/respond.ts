import { NextRequest, NextResponse } from "next/server";
import { withCors, handleOptions } from "@/lib/api/cors";

export { handleOptions };

export function apiResponse(req: NextRequest, res: NextResponse) {
  return withCors(req, res);
}
