"use client";

import { useRef, type PointerEvent } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/lenis";
import { MODELS, type ModelId } from "@/lib/site";

function trackSpotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
}

const cardClass =
  "glass spotlight relative flex h-[min(54vh,500px)] w-[min(82vw,400px)] shrink-0 snap-start flex-col rounded-[28px] p-7 md:p-8";

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
      className="relative flex h-svh min-h-[660px] flex-col justify-between overflow-hidden pb-10 pt-28 md:pb-14"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <h2 className="font-display text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[1.02] tracking-[-0.015em]">
          The collection
        </h2>
        <p className="mt-4 max-w-[44ch] text-moon/70">
          Four cars, each available to order new or from our approved stock.
        </p>
      </div>

      <div
        ref={rail}
        className="flex w-full snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scrollbar-width:none] md:w-max md:snap-none md:overflow-visible md:px-10 md:pb-0"
      >
        {MODELS.map((model) => (
          <article key={model.id} onPointerMove={trackSpotlight} className={cardClass}>
            <h3 className="font-display text-[clamp(3rem,5vw,4.25rem)] leading-none tracking-[-0.02em]">
              {model.name}
            </h3>
            <p className="mt-2 text-sm text-mist">{model.body}</p>
            <p className="mt-6 leading-relaxed text-moon/80">{model.blurb}</p>

            <dl className="mt-auto grid grid-cols-2 gap-x-4 gap-y-4 border-t border-white/10 pt-5">
              {model.specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-xs text-mist">{spec.label}</dt>
                  <dd className="mt-1 text-[15px]">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 flex items-center justify-between gap-4">
              <span className="text-sm text-mist">Price on request</span>
              <button type="button" onClick={() => configure(model.id)} className="btn-ghost btn-sm">
                Configure
              </button>
            </div>
          </article>
        ))}

        <article onPointerMove={trackSpotlight} className={cardClass}>
          <h3 className="font-display text-[clamp(2.5rem,4vw,3.5rem)] leading-[1.02] tracking-[-0.02em]">
            Approved pre-owned
          </h3>
          <p className="mt-6 leading-relaxed text-moon/80">
            Cars we have inspected, serviced and warrantied ourselves. Stock changes weekly, so ask
            for the current list.
          </p>
          <div className="mt-auto flex items-center justify-between gap-4 border-t border-white/10 pt-5">
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
