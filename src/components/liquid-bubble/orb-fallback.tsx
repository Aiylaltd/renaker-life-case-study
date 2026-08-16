export function OrbFallback({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 flex items-center justify-center ${className}`}
      aria-hidden
    >
      <div className="finale-orb-fallback" />
    </div>
  );
}
