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
  "/reviews/new(.*)",
  "/companies/claim(.*)",
  "/companies/add(.*)",
  "/requests/new(.*)",
  "/requests/(.*)/edit(.*)",
  "/v12(.*)",
  "/collaborate(.*)",
  "/referrals(.*)",
]);

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const session = await auth();
  if (session.userId) return;

  // Custom unauthenticatedUrl alone drops the return path; append redirect_url
  // so SignIn can send users back to /v12/activation?… after auth.
  // (Bare auth.protect() uses protect-rewrite and can 404 guests.)
  const returnPath = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  const signInUrl = new URL("/sign-in", req.url);
  if (returnPath && returnPath !== "/sign-in" && !returnPath.startsWith("/sign-in?")) {
    signInUrl.searchParams.set("redirect_url", returnPath);
  }

  return NextResponse.redirect(signInUrl);
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
