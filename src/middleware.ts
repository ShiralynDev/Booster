import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
    "/protected(.*)",
    "/studio(.*)",
])

const isRootRoute = createRouteMatcher(["/"]);
const isWelcomeRoute = createRouteMatcher(["/welcome"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // If user is logged in and on welcome page, redirect to home
    if (userId && isWelcomeRoute(req)) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // If user is NOT logged in and on home page
    if (!userId && isRootRoute(req)) {
        const isGuest = req.cookies.get('booster-guest');
        if (!isGuest) {
            return NextResponse.redirect(new URL('/welcome', req.url));
        }
    }

    if(isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',

  ],
};

