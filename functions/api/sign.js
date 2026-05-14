const BOT_PATTERNS = [
  /bot/i, /crawler/i, /spider/i, /slurp/i,
  /curl/i, /wget/i, /python/i, /java\/\d/i,
  /Go-http-client/i, /scrapy/i, /HTTPie/i,
];

const VALID_PATHS = new Set([
  'album-01/01-if-you-were-the-only-girl.mp3',
  'album-01/02-because.mp3',
  'album-02/01-day-by-day.mp3',
  'album-02/02-fly-me-to-the-moon.mp3',
  'album-02/05-lets-fall-in-love.mp3',
  'album-02/06-nice-work-if-you-can-get-it.mp3',
  'album-02/07-all-of-me.mp3',
  'album-02/08-stompin-at-the-savoy.mp3',
  'album-02/09-all-the-things-you-are.mp3',
  'album-03/jazz/01-takin-a-chance-on-love.mp3',
  'album-03/jazz/02-one-mint-julep.mp3',
  'album-03/jazz/03-one-note-samba.mp3',
  'album-03/jazz/04-the-entertainer.mp3',
  'album-03/jazz/05-all-the-things-you-are.mp3',
  'album-03/jazz/06-dont-get-around-much-anymore.mp3',
  'album-03/jazz/07-stompin-at-the-savoy.mp3',
  'album-03/jazz/08-chord-progression-with-dad.mp3',
  'album-03/blues/01-stormy-monday-blues.mp3',
  'album-03/blues/02-12-bar-blues.mp3',
  'album-03/classical/01-asturias-isaac-albeniz.mp3',
  'album-03/classical/02-villa-lobos-prelude-2.mp3',
  'album-03/classical/03-villa-lobos-etude-2.mp3',
  'album-03/classical/04-fernando-sor.mp3',
  'album-04/a-train.mp3',
  'album-04/autumn-leaves.mp3',
  'album-04/chattanooga-choo-choo.mp3',
  'album-04/cry-me-a-river.mp3',
  'album-04/dont-get-around-much-anymore.mp3',
  'album-04/fly-me-to-the-moon.mp3',
  'album-04/girl-from-ipanema.mp3',
  'album-04/high-heel-sneakers.mp3',
  'album-04/tennessee-waltz.mp3',
  'album-04/over-the-rainbow.mp3',
  'album-04/youre-sixteen.mp3',
]);

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || '';

  if (!VALID_PATHS.has(path)) {
    return new Response('Invalid path', { status: 400 });
  }

  const ua = request.headers.get('User-Agent') || '';
  if (!ua || BOT_PATTERNS.some(p => p.test(ua))) {
    return new Response('Forbidden', { status: 403 });
  }

  const secret = env.AUDIO_SECRET;
  if (!secret) {
    return new Response('Server error', { status: 500 });
  }

  // Sign: path + 1-hour time window (allow current and next window for overlap)
  const timeWindow = Math.floor(Date.now() / 3600000);
  const message = `${path}:${timeWindow}`;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  const signedUrl = `/audio/${path}?t=${timeWindow}&s=${sig}`;

  return new Response(JSON.stringify({ url: signedUrl }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    }
  });
}
