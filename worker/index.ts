import { getOverview, getRaces } from '../server/services/elections';
import { overviewSchema, racesResponseSchema } from '../shared/contracts';

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> };
}

const routes: Record<string, () => Promise<unknown>> = {
  '/api/overview': async () => overviewSchema.parse(await getOverview()),
  '/api/races': async () => racesResponseSchema.parse(await getRaces()),
};

// Static assets are served before this Worker runs; only /api/* reaches it.
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (!pathname.startsWith('/api/')) return env.ASSETS.fetch(request);

    const handler = routes[pathname];
    // Unknown API paths must not fall back to the SPA shell.
    if (!handler) return Response.json({ error: 'API route not found' }, { status: 404 });
    if (request.method !== 'GET') {
      return Response.json(
        { error: 'Method not allowed' },
        { status: 405, headers: { Allow: 'GET' } },
      );
    }
    return Response.json(await handler(), { headers: { 'Cache-Control': 'no-store' } });
  },
};
