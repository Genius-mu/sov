"use client";

import { useEffect, useRef, useState } from "react";
import { sky } from "@/lib/store";

export function Starlight() {
  const [cooling, setCooling] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const send = () => {
    sky.shootingStars += 1;
    setCooling(true);
    timer.current = setTimeout(() => setCooling(false), 1200);
  };

  return (
    <section id="starlight" data-scene="starlight" className="relative min-h-[170vh]">
      <div className="sticky top-0 flex h-svh items-center justify-center px-6 text-center">
        <div className="max-w-2xl">
          <h2 className="font-display text-[clamp(3.2rem,8vw,7.5rem)] leading-[0.95] tracking-[-0.02em]">
            Look up.
          </h2>
          <p className="mx-auto mt-6 max-w-[48ch] text-lg leading-relaxed text-moon/75">
            The Starlight Headliner weaves more than a thousand fibre-optic points into the roof
            lining by hand. Map them to the sky above a place and date that matters to you, and add
            shooting stars that cross it now and then.
          </p>
          <button type="button" onClick={send} disabled={cooling} className="btn-primary mt-10">
            Send a shooting star
          </button>
        </div>
      </div>
    </section>
  );
}
