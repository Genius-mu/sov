const POINTS = [
  {
    title: "The coachline",
    body: "One painter applies the fine line along each car’s side by hand, with a squirrel-hair brush. It takes around three hours, and you choose its colour.",
  },
  {
    title: "Paint",
    body: "Choose from tens of thousands of existing colours, or have a new one mixed to match something you love.",
  },
  {
    title: "The cabin",
    body: "Leather hides and wood veneers are chosen as a set for each car, so grain and tone match from seat to door.",
  },
];

export function Craft() {
  return (
    <section id="craft" data-scene="craft" className="relative flex min-h-[120vh] items-center">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <div className="max-w-md">
          <h2 className="font-display text-[clamp(2.25rem,4.5vw,4.5rem)] leading-[1.02] tracking-[-0.015em]">
            Made by hand, at its own pace.
          </h2>
          <dl className="mt-12 space-y-8">
            {POINTS.map((point, i) => (
              <div key={point.title}>
                <div className="rule-accent" aria-hidden />
                <dt className="mt-6 flex items-baseline gap-3 font-display text-2xl">
                  <span className="text-base tabular-nums text-accent">0{i + 1}</span>
                  {point.title}
                </dt>
                <dd className="mt-2 leading-relaxed text-moon/70">{point.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
