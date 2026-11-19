"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STEPS = [
  { title: "Meet your advisor", body: "At the showroom or at your home. We start with how and where you’ll drive." },
  { title: "Choose every detail", body: "Paint, leather, veneer and Starlight pattern, chosen with physical samples in hand." },
  { title: "Built in Goodwood", body: "Your car is hand-built in England. We share progress as it moves through the line." },
  { title: "Handover", body: "We deliver it to you, walk you through every control, and stay on call afterwards." },
];

export function Process() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const steps = root.current?.querySelector("[data-steps]");
      const line = root.current?.querySelector("[data-line]");
      if (!steps || !line) return;
      gsap.fromTo(
        line,
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: steps, start: "top 80%", end: "bottom 60%", scrub: true } },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="process" data-scene="process" className="relative flex min-h-svh flex-col justify-between py-28">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <h2 className="font-display text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[1.02] tracking-[-0.015em]">
          How a commission works
        </h2>
        <p className="mt-4 max-w-[46ch] text-moon/70">
          From first conversation to handover, one advisor looks after you throughout.
        </p>
      </div>

      <div className="mx-auto mt-24 w-full max-w-[1400px] px-6 md:px-10">
        <div data-steps className="relative">
          <div className="absolute inset-x-0 top-[7px] hidden h-px bg-white/10 md:block" aria-hidden>
            <span
              data-line
              className="block h-full w-full origin-left bg-accent"
              style={{ transform: "scaleX(0)" }}
            />
          </div>
          <ol className="grid gap-10 md:grid-cols-4 md:gap-8">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span
                  className="relative block size-[15px] rounded-full border border-accent bg-ink"
                  aria-hidden
                />
                <h3 className="mt-6 font-display text-[1.75rem] leading-tight">
                  <span className="mr-2 text-accent">{i + 1}</span>
                  {step.title}
                </h3>
                <p className="mt-3 max-w-[32ch] leading-relaxed text-moon/70">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
