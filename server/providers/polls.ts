import { z } from 'zod';
import {
  httpUrlSchema,
  isoDateSchema,
  type Poll,
  percentSchema,
  pollSchema,
} from '../../shared/contracts';
import type { RaceConfig } from '../../shared/races';
import { type Fetcher, fetchJson } from './http';

const voteHubRowSchema = z.object({
  id: z.string(),
  poll_type: z.literal('generic-ballot'),
  subject: z.literal('2026'),
  start_date: isoDateSchema,
  end_date: isoDateSchema,
  pollster: z.string(),
  sample_size: z.union([z.number(), z.string()]).nullable(),
  population: z.string(),
  url: httpUrlSchema,
  answers: z.array(z.object({ choice: z.string(), pct: percentSchema })),
  internal: z.boolean().optional(),
  partisan: z.string().nullable().optional(),
});

function isPlausible(poll: Poll, now: Date) {
  const dem = poll.answers.find((a) => a.party === 'D');
  const rep = poll.answers.find((a) => a.party === 'R');
  return (
    dem &&
    rep &&
    dem.value + rep.value <= 101 &&
    poll.startDate <= poll.endDate &&
    poll.endDate <= now.toISOString().slice(0, 10)
  );
}
function finishPolls(polls: Poll[]) {
  const seen = new Set<string>();
  return polls
    .sort((a, b) => b.endDate.localeCompare(a.endDate) || a.id.localeCompare(b.id))
    .filter((poll) => {
      // Same release is often represented more than once (sample/population variants).
      const key = `${poll.pollster}|${poll.endDate}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
}

export function parseVoteHub(raw: unknown, now = new Date()): Poll[] {
  const rows = z
    .union([z.array(z.unknown()), z.object({ polls: z.array(z.unknown()) })])
    .parse(raw);
  const result: Poll[] = [];
  for (const row of Array.isArray(rows) ? rows : rows.polls) {
    const parsed = voteHubRowSchema.safeParse(row);
    if (!parsed.success) continue;
    const data = parsed.data;
    const dem = data.answers.find((a) => /^(Dem|Democrat(s|ic)?( Party)?)$/i.test(a.choice));
    const rep = data.answers.find((a) => /^(Rep|Republican(s| Party)?)$/i.test(a.choice));
    if (!dem || !rep) continue;
    const poll = pollSchema.safeParse({
      id: data.id,
      pollster: data.pollster,
      startDate: data.start_date,
      endDate: data.end_date,
      sampleSize: Number(data.sample_size) > 0 ? Number(data.sample_size) : null,
      population: data.population,
      sourceUrl: data.url,
      provider: 'VoteHub',
      license: 'CC BY 4.0',
      internal: data.internal ?? false,
      partisan: data.partisan ?? null,
      answers: [
        { party: 'D', name: 'Democrats', value: dem.pct },
        { party: 'R', name: 'Republicans', value: rep.pct },
      ],
    });
    if (poll.success && isPlausible(poll.data, now)) result.push(poll.data);
  }
  return finishPolls(result);
}

const forecastRowSchema = z.object({
  poll_id: z.union([z.number(), z.string()]),
  race: z.string(),
  kind: z.string(),
  stage: z.string(),
  question: z.string(),
  pollster: z.string(),
  fieldwork_start: z.string(),
  fieldwork_end: z.string(),
  population: z.string(),
  sample: z.number().nullable(),
  figures: z.string(),
  source_url: httpUrlSchema,
  licence: z.string(),
  partisan: z.string().nullable().optional(),
});
export const forecastPayloadSchema = z.object({
  dataset: z.literal('polls'),
  asOf: isoDateSchema,
  rows: z.array(z.unknown()),
});
export type ForecastPayload = z.infer<typeof forecastPayloadSchema>;

export function parseForecastPolls(raw: unknown, race: RaceConfig, now = new Date()): Poll[] {
  const payload = forecastPayloadSchema.parse(raw);
  const result: Poll[] = [];
  for (const row of payload.rows) {
    const parsed = forecastRowSchema.safeParse(row);
    if (!parsed.success) continue;
    const data = parsed.data;
    if (
      data.race !== race.pollKey ||
      data.kind !== race.office ||
      data.stage !== 'vote' ||
      data.question !== 'Main'
    )
      continue;
    const answers: Poll['answers'] = [];
    for (const figure of data.figures.split(';')) {
      const match = figure.trim().match(/^(.+?)\s+\(([DR])\)\s+(\d+(?:\.\d+)?)%?$/);
      if (!match) continue;
      const [, name, party, value] = match;
      if (!name || (party !== 'D' && party !== 'R')) continue;
      // Explicit matchup check excludes hypothetical general-election pairings.
      if (name.trim().toLocaleLowerCase() !== race.candidates[party].toLocaleLowerCase()) continue;
      answers.push({ party, name: name.trim(), value: Number(value) });
    }
    if (new Set(answers.map((a) => a.party)).size !== 2) continue;
    const poll = pollSchema.safeParse({
      id: String(data.poll_id),
      pollster: data.pollster,
      startDate: data.fieldwork_start.slice(0, 10),
      endDate: data.fieldwork_end.slice(0, 10),
      sampleSize: data.sample,
      population: data.population,
      answers,
      sourceUrl: data.source_url,
      provider: 'Polling Forecast',
      license: data.licence,
      partisan: data.partisan ?? null,
      internal: false,
    });
    if (poll.success && isPlausible(poll.data, now)) result.push(poll.data);
  }
  return finishPolls(result);
}

export async function getGenericBallot(fetcher?: Fetcher) {
  return parseVoteHub(
    await fetchJson('https://api.votehub.com/polls?poll_type=generic-ballot&subject=2026', fetcher),
  );
}
export async function getForecastPolls(office: 'Senate' | 'Governor', fetcher?: Fetcher) {
  return forecastPayloadSchema.parse(
    await fetchJson(`https://www.pollingforecast.com/api/us/polls?kind=${office}`, fetcher),
  );
}
