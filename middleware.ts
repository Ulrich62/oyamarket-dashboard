import { auth } from "@/auth"

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Allow PWA and static public assets to pass without authentication
  if (
    pathname === "/sw.js" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/manifest.json" ||
    pathname === "/favicon.ico" ||
    pathname === "/icon.svg" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/icons/")
  ) {
    return null;
  }

  const isLoggedIn = !!req.auth;
  const isAuthRoute = pathname.startsWith('/login');
  
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/', req.nextUrl));
    }
    return null;
  }
  
  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', req.nextUrl));
  }
  
  return null;
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|sw\\.js|manifest\\.webmanifest|manifest\\.json|favicon\\.ico|icon\\.svg|robots\\.txt|sitemap\\.xml|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|woff|woff2)).*)',
  ],
}

