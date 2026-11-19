"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { MODELS, type ModelId } from "@/lib/site";

function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

/** Each card's own accent pair. Everything accent-coloured inside the card picks these up. */
const HUES: Record<ModelId | "preowned", [string, string]> = {
  phantom: ["255 111 174", "255 179 107"],
  ghost: ["56 189 248", "167 139 250"],
  cullinan: ["255 165 61", "255 111 145"],
  spectre: ["124 131 255", "94 234 212"],
  preowned: ["34 211 166", "125 211 252"],
};

const hue = (id: keyof typeof HUES) =>
  ({ "--accent": HUES[id][0], "--accent-2": HUES[id][1] }) as CSSProperties;

// Height follows the content (cards in the row stretch to match the tallest), so nothing spills out
const cardClass =
  "glass-card spotlight flex min-h-[min(50vh,430px)] w-[min(82vw,380px)] shrink-0 snap-start flex-col rounded-[28px] p-6 md:p-7 short:min-h-0 short:p-6";

/**
 * Pinned on desktop: cards slide sideways while the camera tracks along the
 * car's flank (the collection → collectionEnd shot). Native swipe on mobile.
 */
export function Collection() {
  const root = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const section = root.current;
      const track = rail.current;
      if (!section || !track) return;

      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        gsap.fromTo(
          track,
          { x: 0 },
          {
            x: () => -distance(),
            ease: "none",
            scrollTrigger: {
              id: "collection-pin",
              trigger: section,
              start: "top top",
              end: () => `+=${distance()}`,
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          },
        );
      });
    },
    { scope: root },
  );

  const configure = (id: ModelId) => {
    window.dispatchEvent(new CustomEvent("sovereign:model", { detail: id }));
    scrollToTarget("#bespoke");
  };

  const askForStock = () => {
    window.dispatchEvent(
      new CustomEvent("sovereign:spec", {
        detail: {
          model: "Approved pre-owned",
          message: "Please send me the current list of approved pre-owned cars.",
        },
      }),
    );
    scrollToTarget("#visit");
  };

  return (
    <section
      ref={root}
      id="collection"
      data-scene="collection"
      data-scene-pin="collection-pin"
      data-scene-exit="collectionEnd"
      className="relative flex min-h-[640px] flex-col justify-between gap-8 overflow-hidden pb-10 pt-28 md:h-svh md:pb-12 short:gap-6 short:pt-24"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <h2 className="font-display text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[1.02] tracking-[-0.015em] short:text-[clamp(2rem,3.6vw,3.25rem)]">
          The <em className="text-gradient">collection</em>
        </h2>
        <p className="mt-4 max-w-[44ch] text-moon/70 short:mt-2">
          Four cars, each available to order new or from our approved stock.
        </p>
      </div>

      <div
        ref={rail}
        className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:w-max md:snap-none md:overflow-visible md:px-10 md:pb-0"
      >
        {MODELS.map((model, i) => (
          <article key={model.id} onPointerMove={trackSpotlight} style={hue(model.id)} className={cardClass}>
            <div className="flex items-center justify-between gap-4">
              <span className="chip">{model.body}</span>
              <span className="font-display text-sm text-moon/40 tabular-nums">0{i + 1}</span>
            </div>
            <h3 className="mt-4 font-display text-[clamp(2.5rem,3.4vw,3.25rem)] leading-none tracking-[-0.02em] short:mt-3 short:text-[2.5rem]">
              {model.name}
            </h3>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-moon/80 short:mt-3">{model.blurb}</p>

            <div className="rule-accent mt-auto" aria-hidden />
            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3.5 short:mt-4 short:gap-y-2.5">
              {model.specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs text-mist">{spec.label}</dt>
                  <dd className="mt-0.5 text-[15px]">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex items-center justify-between gap-4 short:mt-4">
              <span className="text-sm text-mist">Price on request</span>
              <button type="button" onClick={() => configure(model.id)} className="btn-ghost btn-sm">
                Configure
              </button>
            </div>
          </article>
        ))}

        <article onPointerMove={trackSpotlight} style={hue("preowned")} className={cardClass}>
          <div className="flex items-center justify-between gap-4">
            <span className="chip">Inspected and warrantied</span>
          </div>
          <h3 className="mt-4 font-display text-[clamp(2.25rem,3vw,2.9rem)] leading-[1.02] tracking-[-0.02em] short:mt-3 short:text-[2.25rem]">
            Approved pre-owned
          </h3>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-moon/80 short:mt-3">
            Cars we have inspected, serviced and warrantied ourselves. Stock changes weekly, so ask
            for the current list.
          </p>
          <div className="rule-accent mt-auto" aria-hidden />
          <div className="mt-5 flex items-center justify-between gap-4 short:mt-4">
            <span className="text-sm text-mist">Updated every week</span>
            <button type="button" onClick={askForStock} className="btn-ghost btn-sm">
              Ask about stock
            </button>
          </div>
        </article>
      </div>
    </section>
  );
}
