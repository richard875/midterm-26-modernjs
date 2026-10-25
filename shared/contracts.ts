import { z } from 'zod';

export const percentSchema = z.number().finite().min(0).max(100);
export const httpUrlSchema = z.url().refine((value) => /^https?:\/\//.test(value));
export const isoDateSchema = z.iso.date();
export const timestampSchema = z.iso.datetime({ offset: true });
export const partySchema = z.enum(['D', 'R']);

export const pollSchema = z.object({
  id: z.string(),
  pollster: z.string().min(1),
  startDate: isoDateSchema,
  endDate: isoDateSchema,
  sampleSize: z.number().int().positive().nullable(),
  population: z.string(),
  answers: z
    .array(z.object({ party: partySchema, name: z.string(), value: percentSchema }))
    .length(2),
  sourceUrl: httpUrlSchema,
  provider: z.enum(['VoteHub', 'Polling Forecast']),
  license: z.string(),
  partisan: z.string().nullable(),
  internal: z.boolean(),
});
export type Poll = z.infer<typeof pollSchema>;

export const quoteSchema = z.object({
  provider: z.enum(['Polymarket', 'Kalshi']),
  sourceUrl: httpUrlSchema,
  democratic: percentSchema,
  republican: percentSchema,
  observedAt: timestampSchema,
  updatedAt: timestampSchema.nullable(),
  basis: z.enum(['outcome-price', 'bid-ask-midpoint']),
});
export type Quote = z.infer<typeof quoteSchema>;

export function feedSchema<T extends z.ZodType>(data: T) {
  const base = { source: z.string(), retrievedAt: timestampSchema };
  return z.discriminatedUnion('status', [
    z.object({ ...base, status: z.literal('ok'), data, message: z.null() }),
    z.object({ ...base, status: z.literal('empty'), data: z.null(), message: z.string() }),
    z.object({ ...base, status: z.literal('error'), data: z.null(), message: z.string() }),
  ]);
}
export type Feed<T> =
  | { source: string; retrievedAt: string; status: 'ok'; data: T; message: null }
  | { source: string; retrievedAt: string; status: 'empty' | 'error'; data: null; message: string };

export const marketPairSchema = z.object({
  polymarket: feedSchema(quoteSchema),
  kalshi: feedSchema(quoteSchema),
});
export type MarketPair = z.infer<typeof marketPairSchema>;
export const overviewSchema = z.object({
  fetchedAt: timestampSchema,
  house: marketPairSchema,
  senate: marketPairSchema,
  genericBallot: feedSchema(z.array(pollSchema)),
});
export type Overview = z.infer<typeof overviewSchema>;

export const raceDataSchema = z.object({
  id: z.string(),
  markets: marketPairSchema,
  polls: feedSchema(z.array(pollSchema)),
});
export type RaceData = z.infer<typeof raceDataSchema>;
export const racesResponseSchema = z.object({
  fetchedAt: timestampSchema,
  races: z.array(raceDataSchema),
});
export type RacesResponse = z.infer<typeof racesResponseSchema>;
