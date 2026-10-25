import { expect, it } from 'vitest';
import { getRaces } from '../server/services/elections';
import { racesResponseSchema } from '../shared/contracts';

// Reduced public API responses observed on 25 October 2026. Test fixtures only;
// wire identities and figures are independent of the application's race config.
const sourcePolls = [
  {
    poll_id: 1000561,
    race: 'KS',
    kind: 'Senate',
    stage: 'vote',
    question: 'Main',
    pollster: 'InsiderAdvantage',
    fieldwork_start: '2026-10-13T00:00:00',
    fieldwork_end: '2026-10-14T00:00:00',
    population: 'LV',
    sample: 1200,
    figures: 'Roger Marshall (R) 48; Adam Hamilton (D) 47; David Graham (OTH) 3; Undecided (UND) 2',
    source_url:
      'https://insideradvantage.com/insideradvantage-senate-surveys-texas-paxton-49-talarico-48-kansas-marshall-48-hamilton-47-maine-jackson-49-collins-47/',
    licence: 'CC BY-SA 4.0 (figures from Wikipedia)',
    partisan: 'R',
  },
  {
    poll_id: 1000932,
    race: 'IA',
    kind: 'Senate',
    stage: 'vote',
    question: 'Main',
    pollster: 'InsiderAdvantage',
    fieldwork_start: '2026-10-21T00:00:00',
    fieldwork_end: '2026-10-22T00:00:00',
    population: 'LV',
    sample: 1200,
    figures: 'Ashley Hinson (R) 47; Josh Turek (D) 45; Undecided (UND) 8',
    source_url:
      'https://insideradvantage.com/insideradvantage-senate-surveys-mi-el-sayed-47-rogers-46-ia-hinson-47-turek-45-oh-brown-47-husted-44/',
    licence: 'CC BY-SA 4.0 (figures from Wikipedia)',
    partisan: null,
  },
  {
    poll_id: 1000863,
    race: 'G-OH',
    kind: 'Governor',
    stage: 'vote',
    question: 'Main',
    pollster: 'VoteHub/Verasight',
    fieldwork_start: '2026-10-01T00:00:00',
    fieldwork_end: '2026-10-20T00:00:00',
    population: 'LV',
    sample: 531,
    figures: 'Amy Acton (D) 46.2; Vivek Ramaswamy (R) 45.4; Other (OTH) 2; Undecided (UND) 6.4',
    source_url: 'https://cdn.votehub.com/pdfs/VoteHub_Verasight_Oct_2026_Ohio_Report_D1CB7735.pdf',
    licence: 'CC BY-SA 4.0 (figures from Wikipedia)',
    partisan: null,
  },
];
const marketCases = [
  {
    id: 'ks-senate',
    slug: 'kansas-senate-election-winner',
    event: 'SENATEKS-26',
    ids: ['630746', '630747'],
    prices: ['0.375', '0.625'],
    outcomePrices: ['["0.375","0.625"]', '["0.625","0.375"]'],
    bids: ['0.3900', '0.6000'],
    asks: ['0.4000', '0.6100'],
    pollId: '1000561',
    dem: { name: 'Adam Hamilton', value: 47 },
    rep: { name: 'Roger Marshall', value: 48 },
  },
  {
    id: 'ia-senate',
    slug: 'iowa-senate-election-winner',
    event: 'SENATEIA-26',
    ids: ['630733', '630734'],
    prices: ['0.415', '0.58'],
    outcomePrices: ['["0.415","0.585"]', '["0.58","0.42"]'],
    bids: ['0.4200', '0.5800'],
    asks: ['0.4300', '0.5900'],
    pollId: '1000932',
    dem: { name: 'Josh Turek', value: 45 },
    rep: { name: 'Ashley Hinson', value: 47 },
  },
  {
    id: 'oh-governor',
    slug: 'ohio-governor-winner-2026',
    event: 'GOVPARTYOH-26',
    ids: ['629557', '629558'],
    prices: ['0.815', '0.185'],
    outcomePrices: ['["0.815","0.185"]', '["0.185","0.815"]'],
    bids: ['0.8000', '0.1900'],
    asks: ['0.8100', '0.2000'],
    pollId: '1000863',
    dem: { name: 'Amy Acton', value: 46.2 },
    rep: { name: 'Vivek Ramaswamy', value: 45.4 },
  },
];

it('loads Kansas Senate, Iowa Senate and Ohio Governor from the verified provider identities', async () => {
  const calls: URL[] = [];
  const fetcher: typeof fetch = async (input) => {
    const url = new URL(String(input));
    calls.push(url);
    if (url.hostname === 'www.pollingforecast.com') {
      // Include a more recent primary and an Ohio Senate row as distractors.
      const ohioPoll = sourcePolls[2];
      if (!ohioPoll) throw new Error('Missing Ohio polling fixture');
      const rows = [
        ...sourcePolls,
        { ...ohioPoll, poll_id: 2000001, stage: 'primary', fieldwork_end: '2026-10-24T00:00:00' },
        {
          ...ohioPoll,
          poll_id: 2000002,
          race: 'OH-S',
          kind: 'Senate',
          fieldwork_end: '2026-10-24T00:00:00',
        },
      ].filter((poll) => poll.kind === url.searchParams.get('kind'));
      return Response.json({ dataset: 'polls', asOf: '2026-10-23', rows });
    }
    if (url.hostname === 'gamma-api.polymarket.com') {
      const entry = marketCases.find((item) => item.slug === url.searchParams.get('slug'));
      return Response.json(
        entry
          ? [
              {
                slug: entry.slug,
                markets: entry.ids.map((id, index) => ({
                  id,
                  active: true,
                  closed: false,
                  outcomes: '["Yes","No"]',
                  outcomePrices: entry.outcomePrices[index],
                })),
              },
            ]
          : [],
      );
    }
    if (url.hostname === 'api.elections.kalshi.com') {
      const entry = marketCases.find((item) => item.event === url.searchParams.get('event_ticker'));
      return Response.json({
        markets: entry
          ? ['D', 'R'].map((party, index) => ({
              ticker: `${entry.event}-${party}`,
              event_ticker: entry.event,
              status: 'active',
              yes_bid_dollars: entry.bids[index],
              yes_ask_dollars: entry.asks[index],
            }))
          : [],
      });
    }
    throw new Error(`Unexpected source: ${url.hostname}`);
  };

  const result = racesResponseSchema.parse(await getRaces(fetcher));
  expect(result.races).toHaveLength(9);
  expect(calls).toHaveLength(20);
  expect(calls.filter((url) => url.hostname === 'www.pollingforecast.com')).toHaveLength(2);
  for (const entry of marketCases) {
    const data = result.races.find((item) => item.id === entry.id);
    expect(data?.polls.status).toBe('ok');
    if (data?.polls.status !== 'ok') throw new Error(`Missing poll for ${entry.id}`);
    expect(data.polls.data).toHaveLength(1);
    expect(data.polls.data[0]).toMatchObject({
      id: entry.pollId,
      answers: expect.arrayContaining([
        { party: 'D', ...entry.dem },
        { party: 'R', ...entry.rep },
      ]),
    });
    expect(data.markets.polymarket.status).toBe('ok');
    expect(data.markets.kalshi.status).toBe('ok');
    if (data.markets.polymarket.status !== 'ok' || data.markets.kalshi.status !== 'ok') {
      throw new Error(`Missing market for ${entry.id}`);
    }
    expect(data.markets.polymarket.data.democratic).toBeCloseTo(Number(entry.prices[0]) * 100);
    expect(data.markets.kalshi.data.democratic).toBeCloseTo(
      (Number(entry.bids[0]) + Number(entry.asks[0])) * 50,
    );
    expect(data.markets.polymarket.data.sourceUrl).toContain(entry.slug);
    expect(data.markets.kalshi.data.sourceUrl).toContain(entry.event.toLowerCase());
  }
});
