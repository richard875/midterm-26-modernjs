import type { RaceData } from '../../../shared/contracts';
import type { RaceConfig } from '../../../shared/races';
import { MarketPrices } from '../../components/market-prices';
import { PollDisplay } from '../../components/poll-display';
import { dateLabel, percent } from '../../lib/format';

export default function RaceCard({
  race,
  data,
  onSelect,
  loading,
}: {
  race: RaceConfig;
  data?: RaceData;
  onSelect: () => void;
  loading: boolean;
}) {
  return (
    <article className="race-card" id={race.id}>
      <div className="race-card-header">
        <div>
          <span className="eyebrow">{race.office} · 2026</span>
          <h3>{race.stateName}</h3>
        </div>
        <button
          type="button"
          className="state-token"
          onClick={onSelect}
          aria-label={`View ${race.stateName} on map`}
        >
          {race.state}
        </button>
      </div>
      {data ? (
        <>
          <PollDisplay feed={data.polls} />
          <MarketPrices markets={data.markets} />
          <details className="recent-polls">
            <summary>
              Recent polls & sources<span>+</span>
            </summary>
            <div>
              {data.polls.status === 'ok' &&
                data.polls.data.map((poll) => (
                  <div className="recent-poll" key={poll.id}>
                    <a href={poll.sourceUrl} target="_blank" rel="noreferrer">
                      {poll.pollster} · {dateLabel(poll.endDate)}
                    </a>
                    <p>
                      {poll.answers.map((a) => `${a.name} ${percent(a.value)}`).join(' / ')}
                      {poll.sampleSize ? ` · n=${poll.sampleSize}` : ''} ·{' '}
                      {poll.population.toUpperCase()}
                      {poll.partisan ? ` · ${poll.partisan} partisan` : ''}
                    </p>
                    <small>
                      {poll.provider} · {poll.license}
                    </small>
                  </div>
                ))}
              {data.polls.status !== 'ok' && <p>{data.polls.message}</p>}
              <p className="source-note">
                Market quotes observed{' '}
                {new Date(data.markets.polymarket.retrievedAt).toLocaleString('en-US')} (your local
                time). Check each market for its rules. These are individual surveys.
              </p>
            </div>
          </details>
        </>
      ) : (
        <div className="card-placeholder" role="status">
          {loading
            ? 'Waiting for race data…'
            : 'Race data is unavailable. Use Refresh data to retry.'}
        </div>
      )}
    </article>
  );
}
