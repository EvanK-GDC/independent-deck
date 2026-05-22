export const config = { runtime: 'edge' };

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false }), { status: 405 });
  }
  let body;
  try { body = await request.json(); } catch { return new Response('{"ok":false}', { status: 400 }); }

  const submittedUser = (body?.user || '').toString().trim().toLowerCase();
  const submittedPass = (body?.pass || '').toString();
  const expectedUser = (process.env.COMMERCIAL_USER || '').toLowerCase();
  const expectedPass = process.env.COMMERCIAL_PASS || '';

  if (!expectedUser || !expectedPass) {
    return new Response(JSON.stringify({ ok: false, error: 'auth not configured' }), { status: 503 });
  }

  if (!constantTimeEqual(submittedUser, expectedUser) || !constantTimeEqual(submittedPass, expectedPass)) {
    return new Response(JSON.stringify({ ok: false }), { status: 401 });
  }

  const cookie = ['site_auth=1', 'Path=/', 'HttpOnly', 'Secure', 'SameSite=Lax', 'Max-Age=86400'].join('; ');
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Set-Cookie': cookie },
  });
}
