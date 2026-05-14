const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /slurp/i,
  /curl/i, /wget/i, /python/i, /java\/\d/i,
  /Go-http-client/i, /scrapy/i, /HTTPie/i,
];

async function verifySignature(path, timeWindow, sig, secret) {
  try {
    const message = `${path}:${timeWindow}`;
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Restore base64url → standard base64 with proper padding
    const b64 = sig.replace(/-/g, '+').replace(/_/g, '/');
    const rem = b64.length % 4;
    const padded = rem === 0 ? b64 : b64 + '='.repeat(4 - rem);
    const sigBytes = Uint8Array.from(atob(padded), c => c.charCodeAt(0));

    const expected = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
    const expectedBytes = new Uint8Array(expected);

    if (sigBytes.length !== expectedBytes.length) return false;
    let diff = 0;
    for (let i = 0; i < sigBytes.length; i++) diff |= sigBytes[i] ^ expectedBytes[i];
    return diff === 0;
  } catch {
    return false;
  }
}

export async function onRequest(context) {
  const { request, params, env } = context;
  const pathParts = params.path || [];
  const path = pathParts.join('/');

  if (!path.endsWith('.mp3')) {
    return new Response('Not found', { status: 404 });
  }

  // Block known bots by User-Agent
  const ua = request.headers.get('User-Agent') || '';
  if (!ua || BOT_PATTERNS.some(p => p.test(ua))) {
    return new Response('Forbidden', { status: 403 });
  }

  // Validate signed URL token
  const url = new URL(request.url);
  const t = url.searchParams.get('t');
  const s = url.searchParams.get('s');

  if (!t || !s || !env.AUDIO_SECRET) {
    return new Response('Unauthorized', { status: 401 });
  }

  const timeWindow = parseInt(t, 10);
  const currentWindow = Math.floor(Date.now() / 3600000);
  if (Math.abs(currentWindow - timeWindow) > 1) {
    return new Response('Token expired', { status: 401 });
  }

  const valid = await verifySignature(path, timeWindow, s, env.AUDIO_SECRET);
  if (!valid) {
    return new Response('Invalid token', { status: 403 });
  }

  // Serve from R2 bucket binding (private, no public URL needed)
  if (!env.MUSIC) {
    return new Response('Storage not configured', { status: 500 });
  }

  const rangeHeader = request.headers.get('Range');
  let r2Options = {};
  if (rangeHeader) {
    const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
    if (match) {
      const offset = match[1] ? parseInt(match[1], 10) : undefined;
      const end = match[2] ? parseInt(match[2], 10) : undefined;
      if (offset !== undefined && end !== undefined) {
        r2Options.range = { offset, length: end - offset + 1 };
      } else if (offset !== undefined) {
        r2Options.range = { offset };
      } else if (end !== undefined) {
        r2Options.range = { suffix: end };
      }
    }
  }

  const obj = await env.MUSIC.get(path, r2Options);
  if (!obj) {
    return new Response('Audio not found', { status: 404 });
  }

  const headers = new Headers({
    'Content-Type': 'audio/mpeg',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, max-age=3600',
    'Content-Length': String(obj.size ?? obj.range?.length ?? 0),
  });

  if (rangeHeader && obj.range) {
    const { offset = 0, length } = obj.range;
    const end = length != null ? offset + length - 1 : (obj.size ? obj.size - 1 : 0);
    headers.set('Content-Range', `bytes ${offset}-${end}/${obj.size ?? '*'}`);
    return new Response(obj.body, { status: 206, headers });
  }

  return new Response(obj.body, { status: 200, headers });
}
