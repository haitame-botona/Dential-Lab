"use client";

/**
 * Single registration point for GSAP.
 *
 * Every component imports gsap / ScrollTrigger / useGSAP from HERE, never from
 * the packages directly — that keeps registration to exactly one place and
 * avoids the double-register and SSR-window errors that come from scattering
 * gsap.registerPlugin() across files.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// Lenis owns the scroll loop; ScrollTrigger must not also listen for resize
// scroll-end events on its own schedule.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, useGSAP };
