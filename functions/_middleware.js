export async function onRequest(ctx) {
  const url = new URL(ctx.request.url);
  if (url.hostname === 'jerrys-music.pages.dev') {
    url.hostname = 'jerrysmusic.raiteri.net';
    return Response.redirect(url.toString(), 301);
  }
  return ctx.next();
}
