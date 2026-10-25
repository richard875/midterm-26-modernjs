import { describe, expect, it } from 'vitest';
import { parseKalshi, parsePolymarket } from '../server/providers/markets';
import { parseForecastPolls, parseVoteHub } from '../server/providers/polls';
import { getOverview, getRaces } from '../server/services/elections';
import { overviewSchema, racesResponseSchema } from '../shared/contracts';
import { CHAMBERS, RACES } from '../shared/races';

const now = '2026-10-25T12:00:00Z';
const race = RACES[0];
if (!race) throw new Error('Missing test race');
const poly = [
  {
    slug: CHAMBERS.house.polymarketSlug,
    markets: [
      {
        id: '562802',
        active: true,
        closed: false,
        outcomes: '["No","Yes"]',
        outcomePrices: '["0.1","0.9"]',
        updatedAt: now,
      },
      {
        id: '562803',
        active: true,
        closed: false,
        outcomes: '["Yes","No"]',
        outcomePrices: '["0.11","0.89"]',
        updatedAt: now,
      },
    ],
  },
];
function kalshi(bid = '0.6', ask = '0.64') {
  return {
    markets: [
      {
        ticker: 'CONTROLH-2026-D',
        event_ticker: 'CONTROLH-2026',
        status: 'active',
        yes_bid_dollars: bid,
        yes_ask_dollars: ask,
        last_price_dollars: '0.99',
      },
      {
        ticker: 'CONTROLH-2026-R',
        event_ticker: 'CONTROLH-2026',
        status: 'active',
        yes_bid_dollars: '0.37',
        yes_ask_dollars: '0.41',
      },
    ],
  };
}
const forecastPoll = {
  poll_id: 123,
  race: 'TX',
  kind: 'Senate',
  stage: 'vote',
  question: 'Main',
  pollster: 'Test Pollster',
  fieldwork_start: '2026-10-18T00:00:00',
  fieldwork_end: '2026-10-20T00:00:00',
  population: 'LV',
  sample: 800,
  figures: 'Ken Paxton (R) 46; James Talarico (D) 48; Undecided (UND) 6',
  source_url: 'https://example.com/poll',
  licence: 'CC BY-SA 4.0',
  partisan: null,
};
const forecast = (rows: unknown[]) => ({ dataset: 'polls', asOf: '2026-10-23', rows });
const generic = {
  id: 'g1',
  poll_type: 'generic-ballot',
  subject: '2026',
  start_date: '2026-10-01',
  end_date: '2026-10-04',
  pollster: 'Test Pollster',
  sample_size: '1200',
  population: 'rv',
  url: 'https://example.com/poll',
  answers: [
    { choice: 'Dem', pct: 48 },
    { choice: 'Rep', pct: 45 },
  ],
};

describe('prediction market semantics', () => {
  it('finds Yes by label, uses exact market identity, and never normalizes the prices', () => {
    const quote = parsePolymarket(poly, CHAMBERS.house, now);
    expect(quote?.democratic).toBe(90);
    expect(quote?.republican).toBe(11);
    expect(parsePolymarket(poly, CHAMBERS.senate, now)).toBeNull();
  });
  it('uses an executable two-sided midpoint rather than stale last trade', () => {
    expect(parseKalshi(kalshi(), CHAMBERS.house, now)?.democratic).toBe(62);
    expect(parseKalshi(kalshi(), CHAMBERS.house, now)?.republican).toBe(39);
    expect(parseKalshi(kalshi('0', '0.64'), CHAMBERS.house, now)).toBeNull();
    expect(parseKalshi(kalshi('0.8', '0.6'), CHAMBERS.house, now)).toBeNull();
  });
  it('rejects malformed prices, null coercion, closed markets, and malformed JSON', () => {
    expect(() => parseKalshi(kalshi('', '0.64'), CHAMBERS.house, now)).toThrow();
    const invalid = structuredClone(poly);
    const first = invalid[0]?.markets[0];
    if (!first) throw new Error('Missing fixture');
    first.outcomePrices = '[null,"0.9"]';
    expect(() => parsePolymarket(invalid, CHAMBERS.house, now)).toThrow();
    first.outcomePrices = 'not-json';
    expect(() => parsePolymarket(invalid, CHAMBERS.house, now)).toThrow();
    first.outcomePrices = '["0.1","0.9"]';
    first.closed = true;
    expect(parsePolymarket(invalid, CHAMBERS.house, now)).toBeNull();
  });
});

describe('poll integrity', () => {
  it('excludes primaries, hypothetical matchups, future polls, duplicate releases, and unsafe sources', () => {
    const polls = parseForecastPolls(
      forecast([
        forecastPoll,
        { ...forecastPoll, poll_id: 124 },
        { ...forecastPoll, stage: 'primary' },
        { ...forecastPoll, figures: 'Different Democrat (D) 50; Ken Paxton (R) 45' },
        { ...forecastPoll, fieldwork_end: '2027-01-01' },
        { ...forecastPoll, source_url: 'javascript:alert(1)' },
        { ...forecastPoll, figures: 'James Talarico (D) 101; Ken Paxton (R) 45' },
      ]),
      race,
      new Date(now),
    );
    expect(polls).toHaveLength(1);
    expect(polls[0]?.answers.find((a) => a.party === 'D')?.value).toBe(48);
    expect(polls[0]?.license).toBe('CC BY-SA 4.0');
  });
  it('supports the documented and observed VoteHub envelopes and preserves fieldwork dates', () => {
    const result = parseVoteHub([generic], new Date(now));
    expect(parseVoteHub({ polls: [generic] }, new Date(now))).toEqual(result);
    expect(result[0]?.sampleSize).toBe(1200);
    expect(result[0]?.endDate).toBe('2026-10-04');
    expect(parseVoteHub([{ ...generic, subject: '2028' }], new Date(now))).toEqual([]);
  });
  it('does not interpret an invalid envelope as a successful empty source', () => {
    expect(() => parseForecastPolls({ error: 'denied' }, race)).toThrow();
    expect(() => parseVoteHub('<html>blocked</html>')).toThrow();
  });
});

describe('partial data and contracts', () => {
  it('isolates Polymarket failures while keeping Kalshi and polls', async () => {
    const fetcher: typeof fetch = async (input) => {
      const url = String(input);
      if (url.includes('polymarket')) return new Response('', { status: 503 });
      if (url.includes('votehub')) return Response.json([generic]);
      return Response.json(kalshi());
    };
    const result = overviewSchema.parse(await getOverview(fetcher));
    expect(result.house.polymarket.status).toBe('error');
    expect(result.house.kalshi.status).toBe('ok');
    expect(result.genericBallot.status).toBe('ok');
    expect(result.senate.kalshi.status).toBe('empty');
  });
  it('keeps two bulk polling requests as the watchlist grows and surfaces complete outages', async () => {
    const calls: string[] = [];
    const fetcher: typeof fetch = async (input) => {
      calls.push(String(input));
      throw new Error('offline');
    };
    const result = racesResponseSchema.parse(await getRaces(fetcher));
    expect(calls.filter((url) => url.includes('pollingforecast'))).toHaveLength(2);
    expect(calls).toHaveLength(2 + RACES.length * 2);
    expect(result.races).toHaveLength(RACES.length);
    expect(
      result.races.every(
        (r) => r.polls.status === 'error' && r.markets.polymarket.status === 'error',
      ),
    ).toBe(true);
  });
});
