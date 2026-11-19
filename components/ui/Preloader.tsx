"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { lenisRef, prefersReducedMotion } from "@/lib/lenis";
import { SITE } from "@/lib/site";
import { app, markEntered, rig } from "@/lib/store";
import { Monogram } from "./Monogram";

/**
 * Counts to 100, waits for the 3D scene (and any car model) to be ready,
 * then lifts like a curtain. Lifting starts the camera dolly-in, turns the
 * car's lights on and plays the hero headline.
 */
export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [done, setDone] = useState(false);

  useGSAP(
    () => {
      window.scrollTo(0, 0);
      const reduce = prefersReducedMotion();
      const counter = { value: 0 };
      let waited = 0;

      const lift = () => {
        gsap
          .timeline({ onComplete: () => setDone(true) })
          .to("[data-pre]", { autoAlpha: 0, y: -10, duration: 0.5, ease: "power2.in", stagger: 0.06 })
          .add(() => {
            document.documentElement.classList.remove("is-loading");
            lenisRef.current?.start();
            ScrollTrigger.refresh();
            markEntered();
            gsap.to(rig, { intro: 0, duration: reduce ? 0.01 : 3, ease: "power3.out" });
            gsap.to(rig, { lights: 1, duration: 1.4, delay: reduce ? 0 : 0.8, ease: "power2.out" });
          })
          .to(root.current, { yPercent: -100, duration: reduce ? 0.01 : 1.2, ease: "expo.inOut" }, "<");
      };

      const waitForScene = () => {
        const ready = app.sceneReady && !app.assetsActive;
        if (ready || waited >= 8) {
          lift();
        } else {
          waited += 0.25;
          gsap.delayedCall(0.25, waitForScene);
        }
      };

      gsap
        .timeline()
        .to(counter, {
          value: 100,
          duration: reduce ? 0.2 : 2,
          ease: "power2.inOut",
          onUpdate: () => {
            if (count.current) count.current.textContent = String(Math.round(counter.value));
            if (bar.current) bar.current.style.transform = `scaleX(${counter.value / 100})`;
          },
        })
        .call(waitForScene);
    },
    { scope: root },
  );

  if (done) return null;

  return (
    <div
      ref={root}
      data-preloader
      role="status"
      aria-label="Loading"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-ink"
    >
      <div data-pre className="text-moon">
        <Monogram className="size-16" />
      </div>
      <p data-pre className="mt-6 font-display text-3xl tracking-[0.02em]">
        {SITE.name}
      </p>
      <div data-pre className="mt-10 flex w-52 items-center gap-4">
        <span className="relative h-px flex-1 overflow-hidden bg-white/10">
          <span
            ref={bar}
            className="absolute inset-0 origin-left bg-accent"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
        <span className="w-12 text-right text-sm tabular-nums text-mist">
          <span ref={count}>0</span>%
        </span>
      </div>
    </div>
  );
}
