"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/lenis";

/** A dot and a trailing ring. Only on mouse/trackpad devices. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine)").matches && !prefersReducedMotion());
  }, []);

  useGSAP(
    () => {
      const d = dot.current;
      const r = ring.current;
      if (!enabled || !d || !r) return;

      const html = document.documentElement;
      html.classList.add("has-cursor");
      gsap.set([d, r], { xPercent: -50, yPercent: -50, autoAlpha: 0 });

      const dx = gsap.quickTo(d, "x", { duration: 0.12, ease: "power3" });
      const dy = gsap.quickTo(d, "y", { duration: 0.12, ease: "power3" });
      const rx = gsap.quickTo(r, "x", { duration: 0.55, ease: "power3" });
      const ry = gsap.quickTo(r, "y", { duration: 0.55, ease: "power3" });

      let visible = false;
      const move = (e: PointerEvent) => {
        if (!visible) {
          visible = true;
          gsap.to([d, r], { autoAlpha: 1, duration: 0.3 });
        }
        dx(e.clientX);
        dy(e.clientY);
        rx(e.clientX);
        ry(e.clientY);
      };

      const over = (e: PointerEvent) => {
        const target = e.target instanceof Element ? e.target : null;
        const field = target?.closest("input, textarea, select");
        const interactive = target?.closest("a, button, [role='radio'], label");
        gsap.to(r, {
          scale: field ? 0 : interactive ? 1.9 : 1,
          borderColor: interactive ? "rgba(226,204,156,0.9)" : "rgba(232,236,244,0.45)",
          duration: 0.35,
          ease: "power3.out",
        });
        gsap.to(d, { scale: field || interactive ? 0 : 1, duration: 0.25 });
      };

      const leave = () => {
        visible = false;
        gsap.to([d, r], { autoAlpha: 0, duration: 0.3 });
      };

      window.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerover", over);
      html.addEventListener("pointerleave", leave);

      return () => {
        window.removeEventListener("pointermove", move);
        document.removeEventListener("pointerover", over);
        html.removeEventListener("pointerleave", leave);
        html.classList.remove("has-cursor");
      };
    },
    { dependencies: [enabled] },
  );

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] size-10 rounded-full border border-moon/45"
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[120] size-1.5 rounded-full bg-moon"
      />
    </>
  );
}
