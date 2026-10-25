import { getRaces } from '../../server/services/elections';
import { racesResponseSchema } from '../../shared/contracts';

export async function onRequestGet() {
  const data = racesResponseSchema.parse(await getRaces());
  return Response.json(data, { headers: { 'Cache-Control': 'no-store' } });
}
