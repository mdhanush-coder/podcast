"use client";

import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
const subscribe = (cb: () => void) => {
  const m = matchMedia(query);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};

// Lenis smooth scrolling for the whole page; anchors (#how, #faq) glide too. Off for reduced motion.
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduced = useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => true);
  if (reduced) return children;
  return (
    <ReactLenis root options={{ lerp: 0.1, anchors: { offset: -64 } }}>
      {children}
    </ReactLenis>
  );
}
