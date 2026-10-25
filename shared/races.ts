export type Office = 'Senate' | 'Governor';

export interface MarketConfig {
  polymarketSlug: string;
  polymarketIds: { D: string; R: string };
  kalshiEvent: string;
}

export interface RaceConfig extends MarketConfig {
  id: string;
  state: string;
  stateName: string;
  office: Office;
  pollKey: string;
  candidates: { D: string; R: string };
}

// Exact 2026 event + market identities, verified against both public APIs.
// Keep this explicit: a fuzzy search can confuse a primary with the general election.
export const RACES: readonly RaceConfig[] = [
  {
    id: 'tx-senate',
    state: 'TX',
    stateName: 'Texas',
    office: 'Senate',
    pollKey: 'TX',
    candidates: { D: 'James Talarico', R: 'Ken Paxton' },
    polymarketSlug: 'texas-senate-election-winner',
    polymarketIds: { D: '630963', R: '630964' },
    kalshiEvent: 'SENATETX-26',
  },
  {
    id: 'me-senate',
    state: 'ME',
    stateName: 'Maine',
    office: 'Senate',
    pollKey: 'ME',
    candidates: { D: 'Troy Jackson', R: 'Susan Collins' },
    polymarketSlug: 'maine-senate-election-winner',
    polymarketIds: { D: '630772', R: '630773' },
    kalshiEvent: 'SENATEME-26',
  },
  {
    id: 'mi-senate',
    state: 'MI',
    stateName: 'Michigan',
    office: 'Senate',
    pollKey: 'MI',
    candidates: { D: 'Abdul El-Sayed', R: 'Mike Rogers' },
    polymarketSlug: 'michigan-senate-election-winner',
    polymarketIds: { D: '630805', R: '630806' },
    kalshiEvent: 'SENATEMI-26',
  },
  {
    id: 'ga-governor',
    state: 'GA',
    stateName: 'Georgia',
    office: 'Governor',
    pollKey: 'G-GA',
    candidates: { D: 'Keisha Lance Bottoms', R: 'Rick Jackson' },
    polymarketSlug: 'georgia-governor-winner-2026',
    polymarketIds: { D: '629337', R: '629338' },
    kalshiEvent: 'GOVPARTYGA-26',
  },
  {
    id: 'wi-governor',
    state: 'WI',
    stateName: 'Wisconsin',
    office: 'Governor',
    pollKey: 'G-WI',
    candidates: { D: 'David Crowley', R: 'Tom Tiffany' },
    polymarketSlug: 'wisconsin-governor-winner-2026',
    polymarketIds: { D: '629720', R: '629721' },
    kalshiEvent: 'GOVPARTYWI-26',
  },
  {
    id: 'nv-governor',
    state: 'NV',
    stateName: 'Nevada',
    office: 'Governor',
    pollKey: 'G-NV',
    candidates: { D: 'Aaron Ford', R: 'Joe Lombardo' },
    polymarketSlug: 'nevada-governor-winner-2026',
    polymarketIds: { D: '629505', R: '629506' },
    kalshiEvent: 'GOVPARTYNV-26',
  },
];

export const CHAMBERS = {
  house: {
    polymarketSlug: 'which-party-will-win-the-house-in-2026',
    polymarketIds: { D: '562802', R: '562803' },
    kalshiEvent: 'CONTROLH-2026',
  },
  senate: {
    polymarketSlug: 'which-party-will-win-the-senate-in-2026',
    polymarketIds: { D: '562793', R: '562794' },
    kalshiEvent: 'CONTROLS-2026',
  },
} satisfies Record<string, MarketConfig>;
