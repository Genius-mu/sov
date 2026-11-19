"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/lenis";

const bare = (word: string) => word.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/**
 * Paragraph whose words brighten one by one as you scroll through it.
 * Words listed in `highlight` (matched without punctuation) are set in the accent colour, in italics.
 */
export function RevealText({
  text,
  className,
  highlight = [],
}: {
  text: string;
  className?: string;
  highlight?: string[];
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return;
      const words = ref.current.querySelectorAll("[data-rw]");
      gsap.fromTo(
        words,
        { opacity: 0.15 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 78%", end: "bottom 42%", scrub: true },
        },
      );
    },
    { scope: ref },
  );

  const marked = new Set(highlight.map(bare));
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} data-rw>
          {marked.has(bare(word)) ? <em className="text-accent">{word}</em> : word}
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </p>
  );
}
