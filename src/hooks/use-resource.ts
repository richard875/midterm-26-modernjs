import { useCallback, useEffect, useRef, useState } from 'react';
import type { z } from 'zod';

export function useResource<T>(url: string, schema: z.ZodType<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const requestId = useRef(0);
  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: revision is an explicit refresh trigger.
  useEffect(() => {
    const controller = new AbortController();
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    async function load() {
      try {
        const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Request failed');
        const result = schema.parse(await response.json());
        if (id === requestId.current && !controller.signal.aborted) setData(result);
      } catch {
        if (!controller.signal.aborted && id === requestId.current) {
          setError(
            'This section could not refresh. Any previous data remains visible with its original timestamp.',
          );
        }
      } finally {
        if (!controller.signal.aborted && id === requestId.current) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [url, schema, revision]);

  return { data, loading, error, refresh };
}
