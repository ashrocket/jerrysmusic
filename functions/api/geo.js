export async function onRequest(ctx) {
  const country = ctx.request.cf?.country || 'XX';
  return Response.json({ country }, {
    headers: { 'Cache-Control': 'private, no-store' }
  });
}
