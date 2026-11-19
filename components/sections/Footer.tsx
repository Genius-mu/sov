"use client";

import type { MouseEvent } from "react";
import { scrollToTarget } from "@/lib/lenis";
import { NAV, SITE } from "@/lib/site";
import { Monogram } from "@/components/ui/Monogram";

export function Footer() {
  const go = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    scrollToTarget(href);
  };

  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-night/80 backdrop-blur-xl">
      <div className="mx-auto grid max-w-[1400px] gap-12 px-6 pb-12 pt-20 md:grid-cols-[2fr_1fr_1fr] md:px-10">
        <div>
          <div className="flex items-center gap-3">
            <Monogram className="size-10" />
            <span className="font-display text-2xl">{SITE.name}</span>
          </div>
          <p className="mt-5 max-w-[36ch] leading-relaxed text-moon/65">{SITE.description}</p>
        </div>

        <div>
          <p className="text-sm text-mist">Showroom</p>
          <address className="mt-3 not-italic leading-relaxed">
            {SITE.address.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
            <a href={`tel:${SITE.phone.replace(/\s/g, "")}`} className="mt-3 block transition-colors hover:text-accent">
              {SITE.phone}
            </a>
            <a href={`mailto:${SITE.email}`} className="block transition-colors hover:text-accent">
              {SITE.email}
            </a>
          </address>
        </div>

        <nav aria-label="Footer">
          <p className="text-sm text-mist">Explore</p>
          <ul className="mt-3 space-y-1.5">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={go(item.href)} className="transition-colors hover:text-accent">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <p
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-display text-[21vw] leading-[0.78] tracking-[-0.05em] text-white/[0.05]"
      >
        {SITE.name}
      </p>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 border-t border-white/10 px-6 py-8 text-xs leading-relaxed text-mist md:flex-row md:justify-between md:px-10">
        <p>
          © {new Date().getFullYear()} {SITE.name}
        </p>
        <p className="max-w-[90ch] md:text-right">{SITE.legal}</p>
      </div>
    </footer>
  );
}
