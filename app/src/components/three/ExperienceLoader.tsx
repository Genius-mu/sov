"use client";

import dynamic from "next/dynamic";

// three.js only runs in the browser, and loading it separately keeps the first paint light.
const Experience = dynamic(() => import("./Experience"), { ssr: false, loading: () => null });

export function ExperienceLoader() {
  return <Experience />;
}
