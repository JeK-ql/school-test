import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const path = req.nextUrl.pathname;
  const isAuthPage = path.startsWith('/login') || path.startsWith('/register');
  const isApp = path.startsWith('/dashboard') || path.startsWith('/test');

  if (isApp && !isLoggedIn) {
    const url = new URL('/login', req.nextUrl);
    return NextResponse.redirect(url);
  }
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/test/:path*', '/login', '/register'],
};
