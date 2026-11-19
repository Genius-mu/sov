import { RevealText } from "@/components/ui/RevealText";

export function Intro() {
  return (
    <section id="intro" data-scene="intro" className="relative flex min-h-[130vh] items-center">
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">
        <RevealText
          className="max-w-[24ch] font-display text-[clamp(1.9rem,3.6vw,3.4rem)] leading-[1.18] tracking-[-0.01em]"
          text="No two cars leave our showroom alike. We begin with how you’ll use yours, then take as long as it needs on the paint, the leather and the line painted by hand along its side."
          highlight={["alike", "paint", "leather", "line"]}
        />
      </div>
    </section>
  );
}
