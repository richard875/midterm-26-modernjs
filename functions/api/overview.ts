import { getOverview } from '../../server/services/elections';
import { overviewSchema } from '../../shared/contracts';

export async function onRequestGet() {
  const data = overviewSchema.parse(await getOverview());
  return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
