import { getOverview } from '../../server/services/elections';

// Modern.js turns this named export into GET /api/overview.
export async function get() {
  return getOverview();
}
