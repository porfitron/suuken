// Deploy: npx wrangler email sending enable kinkeda.com && npm run deploy:android-signup

interface Env {
  EMAIL: SendEmail;
}

const ALLOWED_ORIGINS = new Set([
  'https://kinkeda.com',
  'https://www.kinkeda.com',
]);

function isAllowedOrigin(origin: string | null): origin is string {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (isAllowedOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    headers['Access-Control-Allow-Headers'] = 'Content-Type';
    headers['Vary'] = 'Origin';
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const origin = request.headers.get('Origin');

    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin(origin)) {
        return new Response(null, { status: 403 });
      }
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Max-Age': '86400',
          'Vary': 'Origin',
        },
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, origin);
    }

    if (!isAllowedOrigin(origin)) {
      return jsonResponse({ error: 'Forbidden' }, 403, origin);
    }

    let body: { email?: string; website?: string };
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: 'Invalid request' }, 400, origin);
    }

    if (body.website) {
      return jsonResponse({ ok: true }, 200, origin);
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonResponse({ error: 'Please enter a valid email address.' }, 400, origin);
    }

    const submittedAt = new Date().toISOString();
    const referrer = request.headers.get('Referer') || 'unknown';

    try {
      await env.EMAIL.send({
        to: 'support@kinkeda.com',
        from: { email: 'noreply@kinkeda.com', name: 'Kinkeda Android Beta' },
        replyTo: { email, name: 'Android Beta Tester' },
        subject: `Android beta signup: ${email}`,
        text: [
          'New Android beta tester signup',
          '',
          `Email: ${email}`,
          `Submitted: ${submittedAt}`,
          `Page: ${referrer}`,
        ].join('\n'),
        html: [
          '<p>New Android beta tester signup</p>',
          `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>`,
          `<p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>`,
          `<p><strong>Page:</strong> ${escapeHtml(referrer)}</p>`,
        ].join(''),
      });
    } catch (error) {
      console.error('Android beta signup email failed', error);
      return jsonResponse(
        { error: 'Could not submit your signup. Please try again or email support@kinkeda.com.' },
        500,
        origin,
      );
    }

    return jsonResponse({ ok: true }, 200, origin);
  },
};
