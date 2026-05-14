function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Wrap text to at most maxLen chars per line
function wrapText(text, maxLen) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    if ((current ? current + ' ' + word : word).length <= maxLen) {
      current = current ? current + ' ' + word : word;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 2); // max 2 lines
}

export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  const title = url.searchParams.get('title') || 'Music Archive';
  const album = url.searchParams.get('album') || '';

  const titleLines = wrapText(title, 26);
  const titleFontSize = 76;
  const lineHeight = 92;
  const titleY1 = 220;

  const titleSvg = titleLines.map((line, i) =>
    `<text x="80" y="${titleY1 + i * lineHeight}" font-family="Georgia, 'Times New Roman', serif" font-size="${titleFontSize}" font-weight="bold" fill="#1e1b17">${esc(line)}</text>`
  ).join('\n  ');

  const albumY = titleY1 + titleLines.length * lineHeight + 20;
  const dividerY = albumY + 48;
  const brandY = 576;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.3" y2="1">
      <stop offset="0%" stop-color="#faf6ee"/>
      <stop offset="100%" stop-color="#ece6d8"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="8" height="630" fill="#b8902e"/>
  <rect x="0" y="606" width="1200" height="24" fill="#b8902e" opacity="0.18"/>

  <text x="1060" y="340" font-family="Georgia, serif" font-size="260" fill="#b8902e" opacity="0.09">♪</text>

  ${titleSvg}

  ${album ? `<text x="80" y="${albumY}" font-family="Georgia, 'Times New Roman', serif" font-size="34" fill="#5c5449">${esc(album)}</text>` : ''}

  <line x1="80" y1="${dividerY}" x2="440" y2="${dividerY}" stroke="#b8902e" stroke-width="2" opacity="0.45"/>

  <text x="80" y="${brandY}" font-family="Georgia, 'Times New Roman', serif" font-size="26" fill="#9c9187" letter-spacing="0.02em">Jerry Richardson · Music Archive · 1955 – 2002</text>
</svg>`;

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
