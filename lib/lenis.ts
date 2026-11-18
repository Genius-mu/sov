import type Lenis from "lenis";

export const lenisRef: { current: Lenis | null } = { current: null };

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Smooth-scroll to a selector like "#visit" (or "#top"). */
export function scrollToTarget(target: string) {
  const lenis = lenisRef.current;
  if (target === "#top") {
    if (lenis) lenis.scrollTo(0, { duration: 1.8 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const el = document.querySelector<HTMLElement>(target);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.8 });
  else el.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
}
