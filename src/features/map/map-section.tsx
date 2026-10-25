import { lazy, Suspense } from 'react';
import type { RaceData } from '../../../shared/contracts';
import { RACES } from '../../../shared/races';
import { ArrowIcon } from '../../components/icons';
import { MarketPrices } from '../../components/market-prices';
import { PollDisplay } from '../../components/poll-display';
import states from './state-options.json';

// The geographic paths and interaction code live in a separate production chunk.
const USMap = lazy(() => import('./us-map'));

export default function MapSection({
  selected,
  onSelect,
  races,
  loading,
  office,
  setOffice,
  onExploreRace,
}: {
  selected: string;
  onSelect: (code: string) => void;
  races: RaceData[];
  loading: boolean;
  office: 'All races' | 'Senate' | 'Governor';
  setOffice: (office: 'All races' | 'Senate' | 'Governor') => void;
  onExploreRace: (id: string) => void;
}) {
  const tracked = RACES.filter((race) => office === 'All races' || race.office === office);
  const chosen = tracked.find((race) => race.state === selected);
  const data = races.find((race) => race.id === chosen?.id);
  const name = states.find((state) => state.code === selected)?.name ?? selected;
  return (
    <section className="map-section" aria-labelledby="map-heading" id="explore">
      <div className="map-main">
        <div className="map-toolbar">
          <div>
            <span className="eyebrow">01 / Explore the states</span>
            <h2 id="map-heading">Every race starts here.</h2>
          </div>
          <fieldset className="segmented" aria-label="Map race type">
            {(['All races', 'Senate', 'Governor'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                aria-pressed={office === tab}
                onClick={() => setOffice(tab)}
              >
                {tab}
              </button>
            ))}
          </fieldset>
        </div>
        <div className="map-wrap">
          <Suspense
            fallback={
              <div className="map-placeholder" role="status">
                Drawing the United States…
              </div>
            }
          >
            <USMap
              selected={selected}
              tracked={tracked.map((race) => race.state)}
              onSelect={onSelect}
            />
          </Suspense>
        </div>
        <div className="map-bottom">
          <div className="map-legend">
            <span>
              <i className="legend-swatch tracked-swatch" />
              Tracked race
            </span>
            <span>
              <i className="legend-swatch selected-swatch" />
              Selected state
            </span>
            <span className="map-footnote">Watchlist coverage, not a forecast.</span>
          </div>
          <label className="state-select">
            <span className="sr-only">Select a state</span>
            <select value={selected} onChange={(event) => onSelect(event.target.value)}>
              {[...states]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((state) => (
                  <option key={state.code} value={state.code}>
                    {state.name}
                  </option>
                ))}
            </select>
          </label>
        </div>
      </div>
      <aside className="state-panel" aria-live="polite" aria-atomic="true">
        <div className="state-panel-top">
          <span className="eyebrow">On the watchlist</span>
          <span className="outline-token">{selected}</span>
        </div>
        <h3>{name}</h3>
        {chosen ? (
          <>
            <p className="state-office">
              {chosen.office} race <span>↗</span>
            </p>
            {data ? (
              <>
                <PollDisplay feed={data.polls} compact />
                <MarketPrices markets={data.markets} />
              </>
            ) : (
              <div className="card-placeholder">
                {loading
                  ? 'Fetching polls & markets…'
                  : 'Race data could not be loaded. Use Refresh data to retry.'}
              </div>
            )}
            <a
              className="text-link"
              href={`#${chosen.id}`}
              onClick={(event) => {
                event.preventDefault();
                onExploreRace(chosen.id);
              }}
            >
              Explore this race
              <ArrowIcon />
            </a>
          </>
        ) : (
          <>
            <p className="state-office">
              Outside this {office === 'All races' ? '' : `${office.toLowerCase()} `}watchlist
            </p>
            <p className="empty-state-copy">
              This learning project follows {RACES.length} selected races. Choose a highlighted
              state
              {office !== 'All races' ? ' or switch to All races' : ''} to explore its polls and
              markets.
            </p>
            <button
              className="text-link"
              type="button"
              onClick={() => {
                setOffice('All races');
                onSelect('TX');
              }}
            >
              Go to Texas
              <ArrowIcon />
            </button>
          </>
        )}
      </aside>
    </section>
  );
}
