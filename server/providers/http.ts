export type Fetcher = typeof fetch;

export async function fetchJson(url: string, fetcher: Fetcher = fetch): Promise<unknown> {
  const response = await fetcher(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) throw new Error(`Upstream HTTP ${response.status}`);
  return response.json();
}
