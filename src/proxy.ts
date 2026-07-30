import { NextResponse } from "next/server";
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/onboarding(.*)",
  "/projects(.*)",
  "/workspaces(.*)",
  "/quotes(.*)",
  "/reviews/new(.*)",
  "/companies/claim(.*)",
  "/companies/add(.*)",
  "/requests/new(.*)",
  "/requests/(.*)/edit(.*)",
  "/v12(.*)",
  "/referrals(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    // Prefer sign-in redirect over blank protect-rewrite 404 for guests.
    await auth.protect({
      unauthenticatedUrl: new URL("/sign-in", req.url).toString(),
    });
  }
});

export default function proxy(...args: Parameters<typeof clerkHandler>) {
  if (!process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }
  return clerkHandler(...args);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
