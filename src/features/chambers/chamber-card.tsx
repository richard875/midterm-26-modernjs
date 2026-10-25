import type { Overview, RaceData } from '../../../shared/contracts';
import { RACES } from '../../../shared/races';
import { CapitolIcon } from '../../components/icons';
import { MarketPrices } from '../../components/market-prices';
import { PollDisplay } from '../../components/poll-display';
import { dateLabel, pollMargin } from '../../lib/format';

export default function ChamberCard({
  chamber,
  overview,
  races,
  loading,
  onExploreRace,
}: {
  chamber: 'house' | 'senate';
  overview: Overview | null;
  races: RaceData[];
  loading: boolean;
  onExploreRace: (id: string) => void;
}) {
  const house = chamber === 'house';
  return (
    <article className="chamber-card">
      <div className="chamber-heading">
        <div>
          <span className="eyebrow">Control of Congress</span>
          <h3>US {house ? 'House' : 'Senate'}</h3>
        </div>
        <span className="capitol">
          <CapitolIcon />
        </span>
      </div>
      <p className="chamber-context">
        {house ? '435 seats · 218 for a majority' : '100 seats · 35 on the ballot in 2026'}
      </p>
      {overview ? (
        <MarketPrices markets={overview[chamber]} />
      ) : (
        <div className="card-placeholder">
          {loading
            ? 'Loading chamber markets…'
            : 'Chamber data is unavailable. Use Refresh data to retry.'}
        </div>
      )}
      {house ? (
        <div className="chamber-poll">
          <div className="mini-heading">The national picture</div>
          {overview ? (
            <PollDisplay feed={overview.genericBallot} compact />
          ) : (
            <p className="muted">
              {loading ? 'Loading the generic ballot…' : 'Generic ballot unavailable.'}
            </p>
          )}
          <p className="source-note">
            Generic ballot via VoteHub. Vote share is not a forecast of seats or control.
          </p>
        </div>
      ) : (
        <div className="chamber-poll">
          <div className="mini-heading">A look at the Senate races</div>
          <p className="source-note senate-note">
            There is no national Senate ballot. Latest individual state polls:
          </p>
          <div className="senate-polls">
            {RACES.filter((r) => r.office === 'Senate').map((race) => {
              const data = races.find((entry) => entry.id === race.id);
              const poll = data?.polls.status === 'ok' ? data.polls.data[0] : undefined;
              const margin = poll ? pollMargin(poll) : null;
              return (
                <a
                  key={race.id}
                  href={`#${race.id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onExploreRace(race.id);
                  }}
                >
                  <span>{race.stateName}</span>
                  <span className="muted">
                    {poll ? dateLabel(poll.endDate) : 'No poll available'}
                  </span>
                  <strong className={margin?.party === 'D' ? 'dem' : 'rep'}>
                    {margin?.label ?? '—'}
                  </strong>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
}
