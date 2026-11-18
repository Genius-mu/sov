"use client";

import { Component, Suspense, useEffect, useState, type ReactNode } from "react";
import { SITE } from "@/lib/site";
import { ConceptCar } from "./ConceptCar";
import { ModelCar } from "./ModelCar";

class CarErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn("[Sovereign] The car model could not be loaded, showing the concept car instead.", error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Uses /public/models/car.glb if it exists, otherwise the built-in concept car. */
export function CarSwitch() {
  const [hasModel, setHasModel] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const url = SITE.carModel.url;
    if (!url) {
      setHasModel(false);
      return;
    }
    fetch(url, { method: "HEAD" })
      .then((res) => {
        const type = res.headers.get("content-type") ?? "";
        if (alive) setHasModel(res.ok && !type.includes("text/html"));
      })
      .catch(() => {
        if (alive) setHasModel(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (hasModel === null) return null;

  return (
    <CarErrorBoundary fallback={<ConceptCar />}>
      <Suspense fallback={null}>{hasModel ? <ModelCar url={SITE.carModel.url} /> : <ConceptCar />}</Suspense>
    </CarErrorBoundary>
  );
}
