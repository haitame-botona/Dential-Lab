"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import type { RefObject } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const LenisContext = createContext<RefObject<Lenis | null>>({ current: null });

/**
 * A ref to the page's Lenis instance rather than the instance itself: handing
 * out the object would mean publishing it from an effect, and a setState there
 * costs every consumer a second render on load for something none of them draw.
 *
 * `.current` is null until the provider's effect has run, and stays null when
 * the visitor asked for reduced motion and scrolling was left native — so read
 * it at the moment you need it (an event, an interaction), never during render,
 * and handle null.
 */
export function useLenis() {
  return useContext(LenisContext);
}

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
  const lenisRef = useRef<Lenis | null>(null);

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

    lenisRef.current = lenis;

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33); // restore GSAP's default
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext value={lenisRef}>{children}</LenisContext>;
}
