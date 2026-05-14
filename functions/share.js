const ALBUMS = [
  {
    title: "Very First Recordings", subtitle: "1955",
    tracks: [
      { title: "If You Were the Only Girl", path: "album-01/01-if-you-were-the-only-girl.mp3" },
      { title: "Because", path: "album-01/02-because.mp3" },
    ]
  },
  {
    title: "Studio Tracks", subtitle: "2002",
    tracks: [
      { title: "Day by Day", path: "album-02/01-day-by-day.mp3" },
      { title: "Fly Me to the Moon", path: "album-02/02-fly-me-to-the-moon.mp3" },
      { title: "Let's Fall in Love", path: "album-02/05-lets-fall-in-love.mp3" },
      { title: "Nice Work if You Can Get It", path: "album-02/06-nice-work-if-you-can-get-it.mp3" },
      { title: "All of Me", path: "album-02/07-all-of-me.mp3" },
      { title: "Stompin' at the Savoy", path: "album-02/08-stompin-at-the-savoy.mp3" },
      { title: "All The Things You Are", path: "album-02/09-all-the-things-you-are.mp3" },
    ]
  },
  {
    title: "Acoustic Session", subtitle: "1996",
    sections: [
      { label: "Acoustic Jazz", tracks: [
        { title: "Takin' A Chance On Love", path: "album-03/jazz/01-takin-a-chance-on-love.mp3" },
        { title: "One Mint Julep", path: "album-03/jazz/02-one-mint-julep.mp3" },
        { title: "One Note Samba", path: "album-03/jazz/03-one-note-samba.mp3" },
        { title: "The Entertainer", path: "album-03/jazz/04-the-entertainer.mp3" },
        { title: "All The Things You Are", path: "album-03/jazz/05-all-the-things-you-are.mp3" },
        { title: "Don't Get Around Much Anymore", path: "album-03/jazz/06-dont-get-around-much-anymore.mp3" },
        { title: "Stompin' At The Savoy", path: "album-03/jazz/07-stompin-at-the-savoy.mp3" },
        { title: "Chord Progression with Dad", path: "album-03/jazz/08-chord-progression-with-dad.mp3" },
      ]},
      { label: "Acoustic Blues", tracks: [
        { title: "Stormy Monday Blues", path: "album-03/blues/01-stormy-monday-blues.mp3" },
        { title: "12 Bar Blues", path: "album-03/blues/02-12-bar-blues.mp3" },
      ]},
      { label: "Classical", tracks: [
        { title: "Asturias (Isaac Albéniz)", path: "album-03/classical/01-asturias-isaac-albeniz.mp3" },
        { title: "Villa-Lobos Prelude No. 2", path: "album-03/classical/02-villa-lobos-prelude-2.mp3" },
        { title: "Villa-Lobos Etude No. 2", path: "album-03/classical/03-villa-lobos-etude-2.mp3" },
        { title: "Fernando Sor", path: "album-03/classical/04-fernando-sor.mp3" },
      ]},
    ]
  },
  {
    title: "Lake Elsinore Band", subtitle: "2002",
    tracks: [
      { title: "A-Train", path: "album-04/a-train.mp3" },
      { title: "Autumn Leaves", path: "album-04/autumn-leaves.mp3" },
      { title: "Chattanooga Choo Choo", path: "album-04/chattanooga-choo-choo.mp3" },
      { title: "Cry Me a River", path: "album-04/cry-me-a-river.mp3" },
      { title: "Don't Get Around Much Anymore", path: "album-04/dont-get-around-much-anymore.mp3" },
      { title: "Fly Me to the Moon", path: "album-04/fly-me-to-the-moon.mp3" },
      { title: "Girl From Ipanema", path: "album-04/girl-from-ipanema.mp3" },
      { title: "High Heel Sneakers", path: "album-04/high-heel-sneakers.mp3" },
      { title: "Tennessee Waltz", path: "album-04/tennessee-waltz.mp3" },
      { title: "Over the Rainbow", path: "album-04/over-the-rainbow.mp3" },
      { title: "You're Sixteen", path: "album-04/youre-sixteen.mp3" },
    ]
  }
];

function buildIndex() {
  const index = {};
  for (const album of ALBUMS) {
    const tracks = album.tracks || album.sections?.flatMap(s =>
      s.tracks.map(t => ({ ...t, sectionLabel: s.label }))
    ) || [];
    for (const track of tracks) {
      const albumLabel = track.sectionLabel
        ? `${album.title} · ${track.sectionLabel}`
        : album.title;
      index[track.path] = { title: track.title, albumLabel, albumSubtitle: album.subtitle };
    }
  }
  return index;
}

const TRACK_INDEX = buildIndex();

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const trackPath = url.searchParams.get('t') || '';
  const track = TRACK_INDEX[trackPath];

  const pageTitle = track
    ? `${track.title} — Jerry Richardson`
    : 'Jerry Richardson · Music Archive';
  const description = track
    ? `${track.albumLabel} · Jerry Richardson Music Archive`
    : 'Personal music archive spanning 1955–2002. Jazz, blues, and classical guitar.';

  const base = `${url.protocol}//${url.host}`;
  const playerUrl = `${base}/?play=${encodeURIComponent(trackPath)}`;
  const ogImageUrl = track
    ? `${base}/og-image?title=${encodeURIComponent(track.title)}&album=${encodeURIComponent(track.albumLabel)}`
    : `${base}/og-image`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${esc(pageTitle)}</title>
  <meta name="robots" content="noindex, nofollow">

  <meta property="og:type" content="music.song">
  <meta property="og:title" content="${esc(pageTitle)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:image" content="${esc(ogImageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/svg+xml">
  <meta property="og:url" content="${esc(url.href)}">
  <meta property="og:site_name" content="Jerry Richardson · Music Archive">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(pageTitle)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${esc(ogImageUrl)}">

  <meta http-equiv="refresh" content="0;url=${esc(playerUrl)}">
</head>
<body>
  <script>window.location.replace(${JSON.stringify(playerUrl)});</script>
  <p>Redirecting to player… <a href="${esc(playerUrl)}">click here</a> if not redirected.</p>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=UTF-8' }
  });
}
