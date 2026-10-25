import type { Feed, MarketPair, Quote } from '../../shared/contracts';
import { percent } from '../lib/format';
import { ArrowIcon } from './icons';

function MarketRow({ feed }: { feed: Feed<Quote> }) {
  return (
    <div className="market-row">
      <span className="market-provider">
        <span className={`provider-icon ${feed.source === 'Kalshi' ? 'kalshi' : 'poly'}`}>
          {feed.source === 'Kalshi' ? 'K' : 'P'}
        </span>
        {feed.source}
      </span>
      {feed.status === 'ok' ? (
        <>
          <span className="dem number">{percent(feed.data.democratic)}</span>
          <span className="rep number">{percent(feed.data.republican)}</span>
          <a
            className="source-arrow"
            href={feed.data.sourceUrl}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${feed.source} market`}
          >
            <ArrowIcon diagonal />
          </a>
        </>
      ) : (
        <span className="market-unavailable" title={feed.message}>
          {feed.status === 'error' ? 'Temporarily unavailable' : 'No open quote'}
        </span>
      )}
    </div>
  );
}
export function MarketPrices({ markets }: { markets: MarketPair }) {
  return (
    <div className="market-table">
      <div className="market-heading">
        <span>Market / win probability</span>
        <span className="dem">DEM</span>
        <span className="rep">GOP</span>
        <span />
      </div>
      <MarketRow feed={markets.polymarket} />
      <MarketRow feed={markets.kalshi} />
    </div>
  );
}
