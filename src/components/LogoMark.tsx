// Placeholder logo mark — ganti isi <svg> ini dengan logo asli kalau sudah tersedia.
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 30" fill="none" className={className}>
      <rect width="30" height="30" rx="8" fill="currentColor" fillOpacity="0.12" />
      <path d="M9 15h12M15 9v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
