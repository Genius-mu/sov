"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { lenisRef, prefersReducedMotion } from "@/lib/lenis";
import { rig } from "@/lib/store";

/** Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";

    const reduce = prefersReducedMotion();
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.085, smoothWheel: !reduce });
    lenisRef.current = lenis;

    // Stay still until the preloader lifts
    if (document.documentElement.classList.contains("is-loading")) lenis.stop();

    lenis.on("scroll", (instance: Lenis) => {
      rig.velocity = instance.velocity;
      ScrollTrigger.update();
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
