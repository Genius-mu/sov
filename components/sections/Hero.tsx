"use client";

import { useRef, type MouseEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion, scrollToTarget } from "@/lib/lenis";
import { onEnter } from "@/lib/store";
import { Magnetic } from "@/components/ui/Magnetic";
import { SplitWords } from "@/components/ui/SplitWords";

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const q = gsap.utils.selector(root);
      const words = q("[data-word]");
      const fades = q("[data-fade]");

      if (!prefersReducedMotion()) {
        gsap.set(words, { yPercent: 115 });
        gsap.set(fades, { autoAlpha: 0, y: 18 });
      }

      // The one orchestrated moment: headline rises as the curtain lifts
      const off = onEnter(() => {
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .to(words, { yPercent: 0, duration: 1.7, stagger: 0.09 }, 0.3)
          .to(fades, { autoAlpha: 1, y: 0, duration: 1.2, stagger: 0.08 }, 0.95);
      });

      // Copy drifts up and fades as the camera starts to move
      gsap.to(q("[data-hero-content]"), {
        yPercent: -14,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom 20%", scrub: true },
      });

      return off;
    },
    { scope: root },
  );

  const go = (target: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToTarget(target);
  };

  return (
    <section ref={root} id="top" data-scene="hero" className="relative flex h-svh min-h-[600px] items-end">
      <div data-hero-content className="mx-auto w-full max-w-[1400px] px-6 pb-16 md:px-10 md:pb-24">
        <h1 className="font-display text-[clamp(3.6rem,10.5vw,10.5rem)] leading-[0.88] tracking-[-0.03em]">
          <span className="block">
            <SplitWords text="Arrive" />
          </span>
          <span className="block italic">
            <SplitWords text="in silence." wordClassName="text-gradient" />
          </span>
        </h1>

        <div className="mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p data-fade className="max-w-[40ch] text-lg leading-relaxed text-moon/75">
            Sovereign is a private Rolls-Royce showroom. Commission a new car, choose one from our
            collection, or simply come and sit in one.
          </p>
          <div data-fade className="flex flex-wrap items-center gap-3">
            <Magnetic>
              <a href="#visit" onClick={go("#visit")} className="btn-primary">
                Request a viewing
              </a>
            </Magnetic>
            <a href="#collection" onClick={go("#collection")} className="btn-ghost">
              See the collection
            </a>
          </div>
        </div>
      </div>

      <div
        data-fade
        aria-hidden
        className="pointer-events-none absolute bottom-8 right-10 hidden items-center gap-4 text-sm text-mist lg:flex"
      >
        Scroll to walk around the car
        <span className="scroll-cue" />
      </div>
    </section>
  );
}
