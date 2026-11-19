"use client";

import { useEffect, useState, type ReactNode } from "react";
import { scrollToTarget } from "@/lib/lenis";
import { COACHLINES, MODELS, PAINTS, WHEELS, type ModelId, type WheelFinish } from "@/lib/site";
import { carConfig } from "@/lib/store";

type Option = { id: string; name: string; hex?: string };

function Group({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div className="border-t border-white/10 pt-5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="text-mist">{label}</span>
        <span>{value}</span>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Swatches({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-3">
      {options.map((option) => {
        const checked = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.name}
            title={option.name}
            onClick={() => onChange(option.id)}
            className={`size-9 rounded-full transition-shadow duration-300 ${
              checked
                ? "shadow-[0_0_0_2px_rgb(var(--surface)),0_0_0_3px_rgb(var(--accent))]"
                : "shadow-[0_0_0_1px_rgb(255_255_255/0.18)] hover:shadow-[0_0_0_1px_rgb(255_255_255/0.5)]"
            }`}
            style={{ backgroundColor: option.hex }}
          />
        );
      })}
    </div>
  );
}

function Segmented({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly Option[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col rounded-full border border-white/10 bg-white/[0.03] p-1"
    >
      {options.map((option) => {
        const checked = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(option.id)}
            className={`rounded-full px-3 py-2 text-sm transition-colors duration-300 ${
              checked
                ? "bg-accent font-medium text-ink"
                : "text-moon/65 hover:text-moon"
            }`}
          >
            {option.name}
          </button>
        );
      })}
    </div>
  );
}

/** Live configurator: every choice updates the 3D car behind the panel. */
export function Bespoke() {
  const [model, setModel] = useState<ModelId>(MODELS[0].id);
  const [paint, setPaint] = useState<string>(PAINTS[0].id);
  const [coachline, setCoachline] = useState<string>(COACHLINES[0].id);
  const [wheels, setWheels] = useState<WheelFinish>(WHEELS[0].id);

  // "Configure" buttons in the collection preselect a model
  useEffect(() => {
    const onModel = (e: Event) => setModel((e as CustomEvent<ModelId>).detail);
    window.addEventListener("sovereign:model", onModel);
    return () => window.removeEventListener("sovereign:model", onModel);
  }, []);

  const m = MODELS.find((x) => x.id === model) ?? MODELS[0];
  const p = PAINTS.find((x) => x.id === paint) ?? PAINTS[0];
  const c = COACHLINES.find((x) => x.id === coachline) ?? COACHLINES[0];
  const w = WHEELS.find((x) => x.id === wheels) ?? WHEELS[0];

  useEffect(() => {
    carConfig.paint = p.hex;
    carConfig.coachline = c.hex;
    carConfig.wheels = w.id;
  }, [p, c, w]);

  const summary = `${m.name} in ${p.name}, with a ${c.name.toLowerCase()} coachline and ${w.name.toLowerCase()} wheels`;

  const request = () => {
    window.dispatchEvent(
      new CustomEvent("sovereign:spec", {
        detail: { model: m.name, message: `I’d like to discuss this specification: ${summary}.` },
      }),
    );
    scrollToTarget("#visit");
  };

  return (
    <section id="bespoke" data-scene="bespoke" className="relative flex min-h-[125vh] items-center py-28">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="glass-card w-full max-w-[470px] rounded-[32px] p-7 md:p-9">
          <h2 className="font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-[1.02] tracking-[-0.015em]">
            Specify your car
          </h2>
          <p className="mt-4 leading-relaxed text-moon/70">
            Choose a model and finish. The car changes as you choose, and your advisor receives the
            full specification with your request.
          </p>

          <div className="mt-8 space-y-5">
            <Group label="Model" value={m.name}>
              <Segmented label="Model" options={MODELS} value={model} onChange={(id) => setModel(id as ModelId)} />
            </Group>
            <Group label="Paint" value={p.name}>
              <Swatches label="Paint" options={PAINTS} value={paint} onChange={setPaint} />
            </Group>
            <Group label="Coachline" value={c.name}>
              <Swatches label="Coachline" options={COACHLINES} value={coachline} onChange={setCoachline} />
            </Group>
            <Group label="Wheels" value={w.name}>
              <Segmented
                label="Wheels"
                options={WHEELS}
                value={wheels}
                onChange={(id) => setWheels(id as WheelFinish)}
              />
            </Group>
          </div>

          <p aria-live="polite" className="mt-8 border-t border-white/10 pt-6 text-[0.95rem] leading-relaxed text-moon/80">
            {summary}.
          </p>
          <button type="button" onClick={request} className="btn-primary mt-6 w-full">
            Request this specification
          </button>
        </div>
      </div>
    </section>
  );
}
