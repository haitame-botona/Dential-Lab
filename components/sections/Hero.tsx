"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, duration } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

/**
 * Figma: linear-gradient(184.62deg, transparent 30.56%, #000 94.47%).
 *
 * On a phone the copy block is both taller (four headline lines) and closer to
 * the frame, so the Figma ramp only reaches full black below where the text
 * actually starts. The mobile scrim therefore begins earlier and carries a
 * mid-stop, putting the headline on ~85% black instead of ~45%. The desktop
 * value is untouched.
 */
const SCRIM_MOBILE =
  "linear-gradient(184.62deg, rgba(0,0,0,0) 10%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.85) 70%, rgb(0,0,0) 92%)";
const SCRIM =
  "linear-gradient(184.62deg, rgba(0,0,0,0) 30.557%, rgb(0,0,0) 94.471%)";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  /**
   * The <video> ships with NO src. The poster (46 KB webp, frame 1 of the clip)
   * is therefore the LCP element and paints immediately, and we only attach a
   * source after mount — once we know the viewport, the motion preference and
   * whether the user is on a metered connection. This keeps the video entirely
   * off the critical path and avoids shipping a 1080p file to a phone.
   */
  useEffect(() => {
    const el = video.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Respect Data Saver / slow links: stay on the poster.
    const conn = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    if (conn?.saveData) return;

    const rendition = window.matchMedia("(min-width: 768px)").matches
      ? "1080"
      : "720";
    const canWebm = el.canPlayType("video/webm; codecs=vp9") !== "";

    el.src = `/videos/hero-${rendition}.${canWebm ? "webm" : "mp4"}`;
    el.load();
    void el.play().catch(() => {
      /* Autoplay blocked (e.g. iOS Low Power Mode) — the poster stands in. */
    });
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { reduced } = ctx.conditions as { reduced: boolean };

          if (reduced) {
            gsap.set("[data-animate]", { opacity: 1, y: 0 });
            return;
          }

          gsap
            .timeline({ defaults: { ease: ease.outExpo, duration: duration.slow } })
            .from("[data-animate='headline']", { y: 48, opacity: 0 })
            .from("[data-animate='body']", { y: 24, opacity: 0 }, "-=0.65")
            .from("[data-animate='actions']", { y: 24, opacity: 0 }, "-=0.7")
            .from("[data-animate='note']", { y: 16, opacity: 0 }, "-=0.75");

          // Slow parallax drift on the photograph as the section leaves.
          // The wrapper is scaled to 108%, giving 4% of overscan at each edge.
          // Travel must stay INSIDE that budget: -3% → +3% is 6% total, so no
          // edge is ever exposed and the crop stays as tight as the design.
          gsap.fromTo(
            "[data-parallax]",
            { yPercent: -3 },
            {
              yPercent: 3,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      data-theme="dark"
      /* No items-center here: the default `stretch` is what makes the scrim
         below fill the full section height. With items-center it would collapse
         to its content and leave the photo untreated above and below it. */
      className="relative isolate flex min-h-[100svh] overflow-hidden bg-surface"
    >
      <div data-parallax className="absolute inset-0 -z-10 scale-[1.08]">
        {/* src is attached on mount — see the effect above. */}
        <video
          ref={video}
          className="size-full object-cover"
          poster="/images/hero-poster.webp"
          muted
          loop
          playsInline
          preload="none"
          aria-label="Praticienne réalisant une intervention implantaire au fauteuil"
        />
      </div>

      <div
        /* items-end anchors the content block to the bottom of the padded box,
           matching Figma (node 16:247 is items-end with a 140px bottom inset).
           This is alignment of the CHILD — the scrim itself still fills the
           section via flex-1. */
        /* The two ramps ride on custom properties so the breakpoint stays a
           Tailwind variant — an inline backgroundImage could not carry one. */
        className="flex flex-1 items-end justify-center bg-[image:var(--scrim-mobile)] px-gutter pt-gutter pb-[88px] backdrop-blur-[4px] md:bg-[image:var(--scrim)] md:pb-[140px]"
        style={
          {
            "--scrim-mobile": SCRIM_MOBILE,
            "--scrim": SCRIM,
          } as CSSProperties
        }
      >
        <div className="flex w-full max-w-[808px] flex-col items-center gap-3 text-center">
          <h1
            data-animate="headline"
            /* Breaks out of the section gutter below md and re-applies a flat
               24px inset of its own, so the headline keeps a constant margin
               from the screen edge while the gutter itself grows with the
               viewport. The body copy and the CTAs stay on the gutter. */
            className="-mx-gutter self-stretch px-6 font-display text-display leading-display font-medium tracking-tight text-ink md:mx-0 md:w-full md:px-0"
          >
            Le cas implantaire complet, planifié et produit en un seul endroit.
          </h1>

          <div className="flex w-full max-w-[466px] flex-col items-center gap-4">
            <p
              data-animate="body"
              className="text-sm leading-relaxed tracking-tight text-ink-muted"
            >
              Un flux numérique sans couture pour les praticiens exigeants au
              Maroc : planification implanto-prothétique, guide chirurgical
              imprimé, trousse de chirurgie guidée prêtée, composants d&apos;origine
              et couronne finale en zircone.
            </p>

            <div
              data-animate="actions"
              /* Stacked below sm: side by side, each pill has to take a
                 two-line label at 320px. They go back to a row once there is
                 width for both. */
              className="flex w-full max-w-[347px] flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              <Button
                href="#envoyer-un-cas"
                variant="solid"
                shape="pill"
                className="flex-1"
                icon={
                  <span className="flex size-[14px] shrink-0 items-center justify-center">
                    <Image
                      src="/icons/arrow-up-right.svg"
                      alt=""
                      width={5}
                      height={8}
                      className="block"
                    />
                  </span>
                }
              >
                Envoyer un cas
              </Button>

              <Button
                href="#demander-un-appel"
                variant="outline"
                shape="pill"
                className="flex-1"
                icon={
                  <span className="flex size-[14px] shrink-0 items-center justify-center">
                    <Image
                      src="/icons/phone.svg"
                      alt=""
                      width={13}
                      height={13}
                      className="block"
                    />
                  </span>
                }
              >
                Demander un appel
              </Button>
            </div>

            <p
              data-animate="note"
              className="text-caption leading-relaxed tracking-tight text-ink-subtle"
            >
              Sans engagement de volume.{" "}
              <br className="sm:hidden" />
              Livraison assurée partout au Maroc.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
