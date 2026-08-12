"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Bridges Lenis to GSAP.
 *
 * Two rules make scroll-linked animation stay glued to the scrollbar:
 *   1. ONE animation loop. Lenis runs with autoRaf disabled and is stepped from
 *      gsap.ticker instead, so Lenis and every tween share a single frame.
 *   2. ScrollTrigger.update() fires on Lenis's scroll event. Lenis moves the
 *      real document scroll position, so no scrollerProxy is needed — but
 *      ScrollTrigger still needs to be told the moment it changed.
 *
 * lagSmoothing(0) stops GSAP from "catching up" after a slow frame, which would
 * otherwise desync the two.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Honour the OS setting: native scrolling, no smoothing, no interpolation.
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      autoRaf: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000); // gsap: s, lenis: ms
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
