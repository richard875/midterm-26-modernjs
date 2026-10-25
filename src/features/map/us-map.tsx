import states from './states.json';

export default function USMap({
  selected,
  tracked,
  onSelect,
}: {
  selected: string;
  tracked: string[];
  onSelect: (code: string) => void;
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG groups cannot be fieldsets.
    <svg
      className="us-map"
      viewBox="0 0 975 610"
      aria-labelledby="map-title map-description"
      role="group"
    >
      <title id="map-title">Explore the 2026 midterm watchlist by state</title>
      <desc id="map-description">
        Green states have a tracked race. Peach marks your selection. Use the state selector below
        as an alternative to the map.
      </desc>
      {states.map((state) => (
        // biome-ignore lint/a11y/useSemanticElements: SVG paths need button roles and keyboard handlers.
        <path
          key={state.code}
          d={state.path ?? ''}
          className={`map-state ${tracked.includes(state.code) ? 'tracked' : ''} ${selected === state.code ? 'selected' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={`${state.name}${tracked.includes(state.code) ? ', tracked race' : ', outside watchlist'}`}
          aria-pressed={selected === state.code}
          onClick={() => onSelect(state.code)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              onSelect(state.code);
            }
          }}
        >
          <title>
            {state.name}
            {tracked.includes(state.code) ? ' · Tracked race' : ''}
          </title>
        </path>
      ))}
      {states
        .filter((s) => tracked.includes(s.code) || ['AK', 'HI'].includes(s.code))
        .map((state) => (
          <text
            key={state.code}
            x={state.center[0]}
            y={state.center[1]}
            className={`state-label ${selected === state.code ? 'selected-label' : ''}`}
            textAnchor="middle"
            dy=".35em"
            tabIndex={-1}
            aria-hidden="true"
          >
            {state.code}
          </text>
        ))}
      <path
        d="M0 465h205l35 145M255 535h115"
        stroke="#c7ceca"
        strokeWidth="1"
        fill="none"
        tabIndex={-1}
        aria-hidden="true"
      />
    </svg>
  );
}
