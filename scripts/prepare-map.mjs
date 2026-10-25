import { readFile, writeFile } from 'node:fs/promises';
import { geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

// us-atlas 3.0.1: Census cartographic boundaries, already projected with Albers USA.
// This runs at authoring time; D3/TopoJSON are never shipped to the browser.
const atlas = JSON.parse(
  await readFile(
    new URL('../node_modules/us-atlas/states-albers-10m.json', import.meta.url),
    'utf8',
  ),
);
const abbreviations = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  'District of Columbia': 'DC',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
};
// Anchor Michigan's label inside the Lower Peninsula, rather than between peninsulas.
const labelCenters = { Michigan: [686, 184] };
const path = geoPath().digits(1);
const states = feature(atlas, atlas.objects.states)
  .features.filter((s) => abbreviations[s.properties.name])
  .map((s) => ({
    name: s.properties.name,
    code: abbreviations[s.properties.name],
    path: path(s),
    center: (labelCenters[s.properties.name] ?? path.centroid(s)).map(
      (n) => Math.round(n * 10) / 10,
    ),
  }));
await writeFile(
  new URL('../src/features/map/states.json', import.meta.url),
  `${JSON.stringify(states)}\n`,
);
await writeFile(
  new URL('../src/features/map/state-options.json', import.meta.url),
  `${JSON.stringify(states.map(({ name, code }) => ({ name, code })))}\n`,
);
console.log(`Prepared ${states.length} state/DC paths.`);
