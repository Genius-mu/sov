"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/lenis";

// Phantom figures. Confirm against the current spec sheet for your market.
const STATS = [
  { value: 6.75, decimals: 2, unit: "litres", label: "Twin-turbocharged V12" },
  { value: 563, decimals: 0, unit: "hp", label: "At 5,000 rpm" },
  { value: 900, decimals: 0, unit: "Nm", label: "From 1,700 rpm" },
  { value: 5.3, decimals: 1, unit: "s", label: "0 to 100 km/h" },
];

export function Performance() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!root.current || prefersReducedMotion()) return;
      gsap.utils.toArray<HTMLElement>("[data-count]", root.current).forEach((el) => {
        const target = Number(el.dataset.count);
        const decimals = Number(el.dataset.decimals ?? 0);
        const counter = { value: 0 };
        el.textContent = (0).toFixed(decimals);
        gsap.to(counter, {
          value: target,
          duration: 2.2,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = counter.value.toFixed(decimals);
          },
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="performance" data-scene="performance" className="relative min-h-[120vh] py-32">
      <div className="mx-auto flex min-h-[85vh] max-w-[1400px] flex-col justify-between px-6 md:px-10">
        <header className="max-w-lg">
          <h2 className="font-display text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[1.02] tracking-[-0.015em]">
            Power you rarely hear.
          </h2>
          <p className="mt-5 max-w-[42ch] leading-relaxed text-moon/70">
            The V12 delivers its full torque from just above idle, so the car gathers pace without
            ever raising its voice.
          </p>
        </header>

        {/* Solid panel: the figures sit in front of the car in this shot */}
        <div className="glass-card mt-20 rounded-[28px] p-7 md:p-10">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-3 text-sm text-mist">{stat.label}</dt>
                <dd className="font-display text-[clamp(3rem,6vw,5.5rem)] leading-none tracking-[-0.03em]">
                  <span data-count={stat.value} data-decimals={stat.decimals} className="tabular-nums">
                    {stat.value.toFixed(stat.decimals)}
                  </span>
                  <span className="ml-2 font-sans text-base tracking-normal text-accent">{stat.unit}</span>
                </dd>
                {/* last in the DOM, first on screen (column is reversed) */}
                <div className="rule-accent mb-6" aria-hidden />
              </div>
            ))}
          </dl>
          <p className="mt-8 max-w-[70ch] text-sm leading-relaxed text-mist">
            Figures for Phantom. Spectre is fully electric, with 577 hp and up to 530 km of range
            (WLTP).
          </p>
        </div>
      </div>
    </section>
  );
}
