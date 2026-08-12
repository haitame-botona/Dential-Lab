"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, duration } from "@/lib/motion";

const stats = [
  {
    value: "48 h",
    label: "Planification",
    body: "Proposition de plan de traitement sous 48h, révisions illimitées par nos spécialistes.",
  },
  {
    value: "48 h",
    label: "Production",
    body: "Fabrication et expédition rapide de l'unité simple après validation finale.",
  },
  {
    value: "Prêtée",
    label: "Chirurgie guidée",
    body: "Trousse chirurgicale spécifique configurée et prêtée à chaque cas.",
  },
  {
    value: "1",
    label: "Seule garantie",
    body: "Contrat de garantie unique couvrant tous les composants de l'implant à la zircone.",
  },
];

export function Stats() {
  const root = useRef<HTMLElement>(null);

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
            gsap.set("[data-stat]", { opacity: 1, y: 0 });
            return;
          }

          gsap.from("[data-stat]", {
            y: 32,
            opacity: 0,
            duration: duration.slow,
            ease: ease.outExpo,
            stagger: 0.08,
            scrollTrigger: {
              trigger: root.current,
              // Fire once the section is meaningfully in view, not at first pixel.
              start: "top 75%",
              once: true,
            },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="stats"
      data-theme="dark"
      className="flex flex-col items-center justify-center bg-surface p-gutter"
    >
      {/* items-start (not stretch) so every column tops out at the same line —
          matches Figma node 3:105. With stretch, the per-column justify-end
          would push each block down by its own body length and break the
          shared baseline across the four values. */}
      <div className="flex w-full max-w-canvas flex-col gap-3 lg:flex-row lg:items-start">
        {stats.map((stat, i) => (
          <Fragment key={stat.label}>
            {/* Vertical rule between columns; becomes horizontal once stacked. */}
            {i > 0 && (
              <div
                aria-hidden
                className="h-px w-full shrink-0 bg-rule lg:h-auto lg:w-px lg:self-stretch"
              />
            )}
            <div
              data-stat
              className="flex flex-1 flex-col justify-end gap-2.5 p-8"
            >
              <p className="font-display text-stat leading-[1.1] font-medium tracking-tighter text-ink">
                {stat.value}
              </p>
              <p className="font-display text-label leading-[1.1] font-medium uppercase text-ink">
                {stat.label}
              </p>
              {/* Reserves three lines (Figma min-h 60px) so a shorter body
                  doesn't shorten its column and unsettle the rule heights.
                  Only while side-by-side — stacked, it is just dead space. */}
              <p className="text-caption leading-relaxed tracking-tight text-ink-subtle lg:min-h-[3lh]">
                {stat.body}
              </p>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
