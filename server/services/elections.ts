import type {
  Feed,
  MarketPair,
  Overview,
  Poll,
  RaceData,
  RacesResponse,
} from '../../shared/contracts';
import { CHAMBERS, type MarketConfig, RACES } from '../../shared/races';
import type { Fetcher } from '../providers/http';
import { getKalshi, getPolymarket } from '../providers/markets';
import { getForecastPolls, getGenericBallot, parseForecastPolls } from '../providers/polls';

export async function loadFeed<T>(source: string, load: () => Promise<T | null>): Promise<Feed<T>> {
  try {
    const data = await load();
    const retrievedAt = new Date().toISOString();
    if (data === null || (Array.isArray(data) && data.length === 0)) {
      return {
        source,
        retrievedAt,
        status: 'empty',
        data: null,
        message: 'No matching data is available from this source.',
      };
    }
    return { source, retrievedAt, status: 'ok', data, message: null };
  } catch (error) {
    const detail =
      error instanceof Error && /^Upstream HTTP \d{3}$/.test(error.message)
        ? ` (${error.message.replace('Upstream ', '')})`
        : '';
    return {
      source,
      retrievedAt: new Date().toISOString(),
      status: 'error',
      data: null,
      message: `${source} could not be loaded${detail}. Try refreshing shortly.`,
    };
  }
}

async function getMarkets(config: MarketConfig, fetcher?: Fetcher): Promise<MarketPair> {
  const [polymarket, kalshi] = await Promise.all([
    loadFeed('Polymarket', () => getPolymarket(config, fetcher)),
    loadFeed('Kalshi', () => getKalshi(config, fetcher)),
  ]);
  return { polymarket, kalshi };
}

export async function getOverview(fetcher?: Fetcher): Promise<Overview> {
  const [house, senate, genericBallot] = await Promise.all([
    getMarkets(CHAMBERS.house, fetcher),
    getMarkets(CHAMBERS.senate, fetcher),
    loadFeed('VoteHub', () => getGenericBallot(fetcher)),
  ]);
  return { fetchedAt: new Date().toISOString(), house, senate, genericBallot };
}

export async function getRaces(fetcher?: Fetcher): Promise<RacesResponse> {
  // Two bulk poll requests per dashboard, never one large request per card.
  const [senate, governor, markets] = await Promise.all([
    loadFeed('Polling Forecast', () => getForecastPolls('Senate', fetcher)),
    loadFeed('Polling Forecast', () => getForecastPolls('Governor', fetcher)),
    Promise.all(RACES.map((race) => getMarkets(race, fetcher))),
  ]);
  const races: RaceData[] = await Promise.all(
    RACES.map(async (race, index) => {
      const feed = race.office === 'Senate' ? senate : governor;
      const polls: Feed<Poll[]> =
        feed.status === 'ok'
          ? await loadFeed('Polling Forecast', async () => parseForecastPolls(feed.data, race))
          : feed;
      const pair = markets[index];
      if (!pair) throw new Error('Missing curated race market result');
      return { id: race.id, polls, markets: pair };
    }),
  );
  return { fetchedAt: new Date().toISOString(), races };
}
