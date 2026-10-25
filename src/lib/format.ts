import type { Poll } from '../../shared/contracts';

export const percent = (value: number) => `${value.toFixed(1).replace(/\.0$/, '')}%`;
export function dateLabel(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date.slice(0, 10)}T12:00:00Z`));
}
export function ageDays(date: string) {
  const today = Date.parse(`${new Date().toISOString().slice(0, 10)}T00:00:00Z`);
  return Math.max(
    0,
    Math.floor((today - Date.parse(`${date.slice(0, 10)}T00:00:00Z`)) / 86_400_000),
  );
}
export function pollMargin(poll: Poll) {
  const dem = poll.answers.find((a) => a.party === 'D')?.value ?? 0;
  const rep = poll.answers.find((a) => a.party === 'R')?.value ?? 0;
  const margin = dem - rep;
  return {
    party: margin >= 0 ? 'D' : 'R',
    value: Math.abs(margin),
    label:
      margin === 0 ? 'Tied' : `${margin > 0 ? 'D' : 'R'} +${Number(Math.abs(margin).toFixed(1))}`,
  };
}
