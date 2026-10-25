import { getRaces } from '../../server/services/elections';

export async function get() {
  return getRaces();
}
