"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { lenisRef, scrollToTarget } from "@/lib/lenis";
import { NAV, SITE } from "@/lib/site";
import { onEnter } from "@/lib/store";
import { Monogram } from "./Monogram";

export function Navbar() {
  const bar = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState("");
  const [open, setOpen] = useState(false);

  useGSAP(() => {
    const el = bar.current;
    if (!el) return;

    gsap.set(el, { yPercent: -160, autoAlpha: 0 });
    const off = onEnter(() =>
      gsap.to(el, { yPercent: 0, autoAlpha: 1, duration: 1.2, delay: 0.9, ease: "expo.out" }),
    );

    // Hairline along the bottom of the bar fills with page progress
    gsap.fromTo(
      progress.current,
      { scaleX: 0 },
      { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.4 } },
    );

    // Tuck away while scrolling down, return when scrolling up
    let hidden = false;
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const hide = self.direction === 1 && self.scroll() > 240;
        if (hide === hidden) return;
        hidden = hide;
        gsap.to(el, { yPercent: hide ? -160 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      },
    });

    // Highlight the section in view
    NAV.forEach(({ href }) => {
      const section = document.querySelector(href);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        end: "bottom 55%",
        refreshPriority: -1,
        onToggle: (self) =>
          setActive((current) => (self.isActive ? href : current === href ? "" : current)),
      });
    });

    return off;
  });

  const toggle = (next: boolean) => {
    setOpen(next);
    if (next) lenisRef.current?.stop();
    else lenisRef.current?.start();
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        lenisRef.current?.start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    if (open) toggle(false);
    scrollToTarget(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6 md:pt-5">
      <div
        ref={bar}
        className="glass relative mx-auto flex max-w-[1180px] items-center justify-between gap-6 rounded-full py-2 pl-3 pr-2"
      >
        <a
          href="#top"
          onClick={go("#top")}
          className="flex items-center gap-3 rounded-full pr-2"
          aria-label={`${SITE.name}, back to top`}
        >
          <Monogram className="size-9 text-moon" />
          <span className="font-display text-xl tracking-[0.01em]">{SITE.name}</span>
        </a>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-9 text-[0.95rem]">
            {NAV.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={go(item.href)}
                  aria-current={active === item.href ? "true" : undefined}
                  className={`relative transition-colors duration-300 after:absolute after:-bottom-1.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-accent after:transition-opacity after:duration-300 ${
                    active === item.href ? "text-moon after:opacity-100" : "text-moon/60 after:opacity-0 hover:text-moon"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href="#visit" onClick={go("#visit")} className="btn-primary btn-sm hidden md:inline-flex">
            Request a viewing
          </a>
          <button
            type="button"
            onClick={() => toggle(!open)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="btn-ghost btn-sm md:hidden"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>

        <span className="pointer-events-none absolute inset-x-8 bottom-0 h-px overflow-hidden" aria-hidden>
          <span
            ref={progress}
            className="block h-full w-full origin-left bg-accent"
            style={{ transform: "scaleX(0)" }}
          />
        </span>
      </div>

      <div id="mobile-menu" hidden={!open} className="fixed inset-0 -z-10 bg-ink md:hidden">
        <nav aria-label="Mobile" className="flex h-full flex-col justify-center px-8">
          <ul className="space-y-4">
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href} onClick={go(item.href)} className="font-display text-5xl leading-tight">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#visit" onClick={go("#visit")} className="btn-primary mt-12 self-start">
            Request a viewing
          </a>
        </nav>
      </div>
    </header>
  );
}
