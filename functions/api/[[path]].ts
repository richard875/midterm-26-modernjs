// Prevent Pages SPA fallback from turning an unknown API route into 200 HTML.
export async function onRequest() {
  return Response.json({ error: 'API route not found' }, { status: 404 });
}
