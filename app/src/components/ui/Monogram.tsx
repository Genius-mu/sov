/** Original monogram for the showroom. Replace with the client's own mark. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none">
      <circle cx="24" cy="24" r="22.5" stroke="currentColor" strokeWidth="1" opacity="0.65" />
      <circle cx="24" cy="24" r="19" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
      <text
        x="24"
        y="31.5"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: "var(--font-bodoni), Georgia, serif", fontSize: 22 }}
      >
        S
      </text>
    </svg>
  );
}
