export const config = {
  matcher: '/((?!api/).*)',
};

export default function middleware(request) {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === '/login' || pathname === '/login.html') {
    return; // pass through
  }

  const cookies = request.headers.get('cookie') || '';
  const authed = /(?:^|;\s*)site_auth=1(?:;|$)/.test(cookies);

  if (authed) return;

  const loginUrl = new URL('/login', url.origin);
  loginUrl.searchParams.set('next', pathname);
  return Response.redirect(loginUrl.toString(), 302);
}
