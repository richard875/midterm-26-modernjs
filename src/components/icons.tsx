export function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d={diagonal ? 'M6 18 18 6M6 6h12v12' : 'M4 12h16m-6-6 6 6-6 6'} />
    </svg>
  );
}
export function RefreshIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <path d="M20 7v5h-5M4 17v-5h5M6.5 6a8 8 0 0 1 13 4M4.5 14a8 8 0 0 0 13 4" />
    </svg>
  );
}
export function CapitolIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M3 28h26M5 24h22M7 24V14h18v10M5 14h22M9 14a7 7 0 0 1 14 0M16 7V3m0 0h5v3h-5M11 17v7m5-7v7m5-7v7" />
    </svg>
  );
}
