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
export function HouseIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 28h26M5 25h22M7 25V13h18v12M4 13 16 5l12 8H4Z" />
      <path d="M11 17v8m5-8v8m5-8v8" />
    </svg>
  );
}

export function SenateIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 4-4 11 11-4 4L9 6Zm-2 2 4-4m9 11 4-4M14 12 4 22a2 2 0 0 0 3 3l10-10" />
      <path d="M16 25h10l2 4H14l2-4Z" />
    </svg>
  );
}
