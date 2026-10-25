import { z } from 'zod';
import type { Quote } from '../../shared/contracts';
import type { MarketConfig } from '../../shared/races';
import { type Fetcher, fetchJson } from './http';

const price = z
  .union([z.number(), z.string().regex(/^\d+(?:\.\d+)?$/)])
  .transform(Number)
  .pipe(z.number().finite().min(0).max(1));
const jsonArray = <T extends z.ZodType>(item: T) =>
  z
    .string()
    .transform((value, ctx): unknown[] => {
      try {
        const parsed: unknown = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        /* Invalid JSON becomes a schema error, never a zero price. */
      }
      ctx.addIssue({ code: 'custom', message: 'Expected a JSON array' });
      return z.NEVER;
    })
    .pipe(z.array(item));
const polyMarketSchema = z.object({
  id: z.string(),
  active: z.boolean(),
  closed: z.boolean(),
  outcomes: jsonArray(z.string()),
  outcomePrices: jsonArray(price).nullable(),
  updatedAt: z.iso.datetime({ offset: true }).optional(),
});
const polyEventsSchema = z.array(
  z.object({
    slug: z.string(),
    markets: z.array(z.unknown()),
  }),
);

export function parsePolymarket(
  raw: unknown,
  config: MarketConfig,
  observedAt: string,
): Quote | null {
  const event = polyEventsSchema.parse(raw).find((entry) => entry.slug === config.polymarketSlug);
  if (!event) return null;
  const quotes = (['D', 'R'] as const).map((party) => {
    const rawMarket = event.markets.find(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        item.id === config.polymarketIds[party],
    );
    if (!rawMarket) return null;
    const market = polyMarketSchema.parse(rawMarket);
    if (!market.active || market.closed || !market.outcomePrices) return null;
    const yesIndex = market.outcomes.indexOf('Yes');
    const value = market.outcomePrices[yesIndex];
    if (
      yesIndex < 0 ||
      value === undefined ||
      market.outcomes.length !== market.outcomePrices.length
    )
      return null;
    return { value: Number(value) * 100, updatedAt: market.updatedAt ?? null };
  });
  const [dem, rep] = quotes;
  if (!dem || !rep) return null;
  // The older of the two outcome updates is the conservative pair timestamp.
  const updatedAt =
    dem.updatedAt && rep.updatedAt ? ([dem.updatedAt, rep.updatedAt].sort()[0] ?? null) : null;
  return {
    provider: 'Polymarket',
    sourceUrl: `https://polymarket.com/event/${config.polymarketSlug}`,
    democratic: dem.value,
    republican: rep.value,
    observedAt,
    updatedAt,
    basis: 'outcome-price',
  };
}

const kalshiMarketSchema = z.object({
  ticker: z.string(),
  event_ticker: z.string(),
  status: z.string(),
  yes_bid_dollars: price,
  yes_ask_dollars: price,
});
const kalshiResponseSchema = z.object({ markets: z.array(z.unknown()) });

export function parseKalshi(raw: unknown, config: MarketConfig, observedAt: string): Quote | null {
  const payload = kalshiResponseSchema.parse(raw);
  const values = (['D', 'R'] as const).map((party) => {
    const ticker = `${config.kalshiEvent}-${party}`;
    const entry = payload.markets.find(
      (item) =>
        typeof item === 'object' && item !== null && 'ticker' in item && item.ticker === ticker,
    );
    if (!entry) return null;
    const market = kalshiMarketSchema.parse(entry);
    if (market.event_ticker !== config.kalshiEvent || market.status !== 'active') return null;
    // Empty or crossed books are unavailable. Last trade can be arbitrarily old.
    if (
      market.yes_bid_dollars <= 0 ||
      market.yes_ask_dollars >= 1 ||
      market.yes_bid_dollars > market.yes_ask_dollars
    )
      return null;
    return (market.yes_bid_dollars + market.yes_ask_dollars) * 50;
  });
  const [democratic, republican] = values;
  if (democratic == null || republican == null) return null;
  return {
    provider: 'Kalshi',
    sourceUrl: `https://kalshi.com/markets/${config.kalshiEvent.toLowerCase()}`,
    democratic,
    republican,
    observedAt,
    updatedAt: null,
    basis: 'bid-ask-midpoint',
  };
}

export async function getPolymarket(config: MarketConfig, fetcher?: Fetcher) {
  const raw = await fetchJson(
    `https://gamma-api.polymarket.com/events?slug=${config.polymarketSlug}`,
    fetcher,
  );
  return parsePolymarket(raw, config, new Date().toISOString());
}
export async function getKalshi(config: MarketConfig, fetcher?: Fetcher) {
  const raw = await fetchJson(
    `https://api.elections.kalshi.com/trade-api/v2/markets?event_ticker=${config.kalshiEvent}&limit=100`,
    fetcher,
  );
  return parseKalshi(raw, config, new Date().toISOString());
}
