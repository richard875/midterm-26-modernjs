import { useState } from 'react';
import { overviewSchema, racesResponseSchema } from '../../shared/contracts';
import { RACES } from '../../shared/races';
import { ArrowIcon, RefreshIcon } from '../components/icons';
import Methodology from '../components/methodology';
import ChamberCard from '../features/chambers/chamber-card';
import MapSection from '../features/map/map-section';
import RaceCard from '../features/races/race-card';
import { useResource } from '../hooks/use-resource';

export default function Page() {
  const overview = useResource('/api/overview', overviewSchema);
  const raceResource = useResource('/api/races', racesResponseSchema);
  const [selected, setSelected] = useState('TX');
  const [mapOffice, setMapOffice] = useState<'All races' | 'Senate' | 'Governor'>('All races');
  const [filter, setFilter] = useState<'All races' | 'Senate' | 'Governor'>('All races');
  const races = raceResource.data?.races ?? [];
  const loading = overview.loading || raceResource.loading;
  const fetchedAt = [overview.data?.fetchedAt, raceResource.data?.fetchedAt]
    .filter((v): v is string => Boolean(v))
    .sort()[0];
  const days = Math.max(
    0,
    Math.ceil((Date.parse('2026-11-03T00:00:00-05:00') - Date.now()) / 86_400_000),
  );
  const partial = [
    overview.data?.genericBallot,
    overview.data?.house.polymarket,
    overview.data?.house.kalshi,
    overview.data?.senate.polymarket,
    overview.data?.senate.kalshi,
    ...races.flatMap((r) => [r.polls, r.markets.polymarket, r.markets.kalshi]),
  ].some((feed) => feed && feed.status !== 'ok');
  function selectFromCard(state: string) {
    setSelected(state);
    setMapOffice('All races');
    const mapElement = document.getElementById('explore');
    mapElement?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  }
  function exploreRace(id: string) {
    setFilter('All races');
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'start',
      });
    });
  }
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <a href="#main" className="wordmark" aria-label="Midterm 26 home">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          MIDTERM <span className="wordmark-year">/ 26</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#explore">The map</a>
          <a href="#congress">Congress</a>
          <a href="#watchlist">State races</a>
          <a href="#methodology">
            The data
            <ArrowIcon diagonal />
          </a>
        </nav>
        <div className="header-date">
          <span className="status-dot" />
          Election desk · 2026
        </div>
      </header>
      <main id="main">
        <section className="hero" aria-labelledby="hero-heading">
          <div>
            <div className="hero-kicker">
              <span className="eyebrow">United States · Midterm elections</span>
              <span className="edition">A closer look</span>
            </div>
            <h1 id="hero-heading">
              The balance of <em>power.</em>
            </h1>
            <p>
              One election. Fifty states. Follow the polls and prediction markets
              <br className="desktop-break" /> shaping the next chapter of American politics.
            </p>
          </div>
          <div className="election-date">
            <span className="eyebrow">Election day</span>
            <div>
              03{' '}
              <span>
                NOV
                <br />
                2026
              </span>
            </div>
            <p>
              Tuesday
              {days > 0 ? (
                <>
                  <span> / </span>
                  {days} days to go
                </>
              ) : (
                <>
                  <span> / </span>Election day has arrived
                </>
              )}
            </p>
          </div>
        </section>
        <div className="desk-status">
          <span>
            <i
              className={`status-dot ${partial || overview.error || raceResource.error ? 'warning-dot' : ''}`}
            />
            {loading
              ? 'Fetching the latest available data'
              : partial
                ? 'Some sources unavailable · see individual cards'
                : overview.error || raceResource.error
                  ? 'Refresh incomplete'
                  : 'Public data · directly from the sources'}
          </span>
          <div>
            <span className="last-updated">
              {fetchedAt
                ? `Retrieved ${new Date(fetchedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })} · your local time`
                : 'Live sources, no simulated data'}
            </span>
            <button
              type="button"
              className="refresh-button"
              disabled={loading}
              onClick={() => {
                overview.refresh();
                raceResource.refresh();
              }}
            >
              <RefreshIcon />
              {loading ? 'Refreshing' : 'Refresh data'}
            </button>
          </div>
        </div>
        {(overview.error || raceResource.error) && (
          <div className="error-banner" role="alert">
            {overview.error ? `Congress: ${overview.error} ` : ''}
            {raceResource.error ? `State races: ${raceResource.error}` : ''}
          </div>
        )}
        <MapSection
          selected={selected}
          onSelect={setSelected}
          races={races}
          loading={raceResource.loading}
          office={mapOffice}
          setOffice={setMapOffice}
          onExploreRace={exploreRace}
        />
        <section className="congress-section" id="congress" aria-labelledby="congress-heading">
          <div className="section-heading">
            <div>
              <span className="eyebrow">02 / The national picture</span>
              <h2 id="congress-heading">The race for Congress</h2>
            </div>
            <p>Two chambers. Two paths to a majority.</p>
          </div>
          <div className="chamber-grid">
            <ChamberCard
              chamber="house"
              overview={overview.data}
              races={races}
              loading={overview.loading}
              onExploreRace={exploreRace}
            />
            <ChamberCard
              chamber="senate"
              overview={overview.data}
              races={races}
              loading={overview.loading}
              onExploreRace={exploreRace}
            />
          </div>
        </section>
        <section className="watchlist-section" id="watchlist" aria-labelledby="watchlist-heading">
          <div className="section-heading">
            <div>
              <span className="eyebrow">03 / Beyond Washington</span>
              <h2 id="watchlist-heading">
                States to watch
                <span className="count-badge">{String(RACES.length).padStart(2, '0')}</span>
              </h2>
            </div>
            <fieldset className="segmented" aria-label="Filter state races">
              {(['All races', 'Senate', 'Governor'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={filter === tab}
                  onClick={() => setFilter(tab)}
                >
                  {tab}
                </button>
              ))}
            </fieldset>
          </div>
          <p className="watchlist-intro">
            A small watchlist of Senate and governor races. Polls show vote share; markets price the
            winner.
          </p>
          <div className="race-grid">
            {RACES.filter((race) => filter === 'All races' || race.office === filter).map(
              (race) => (
                <RaceCard
                  key={race.id}
                  race={race}
                  data={races.find((entry) => entry.id === race.id)}
                  loading={raceResource.loading}
                  onSelect={() => selectFromCard(race.state)}
                />
              ),
            )}
          </div>
        </section>
        <Methodology />
      </main>
      <footer className="site-footer">
        <a href="#main" className="wordmark">
          MIDTERM <span className="wordmark-year">/ 26</span>
        </a>
        <p>
          An independent learning project built with{' '}
          <a href="https://modernjs.dev/" target="_blank" rel="noreferrer">
            Modern.js
            <ArrowIcon diagonal />
          </a>
        </p>
        <a href="#main" className="back-top">
          Back to top ↑
        </a>
      </footer>
    </>
  );
}
