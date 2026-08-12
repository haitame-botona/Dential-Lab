"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Stage = {
  /** Ordinal shown above the asset — "ETAPE 01". */
  step: string;
  title: string;
  image: string;
  /** Alt text: these carry meaning, they are not decoration. */
  alt: string;
  items: string[];
};

const stages: Stage[] = [
  {
    step: "ETAPE 01",
    title: "Avant la chirurgie",
    image: "/images/deliverable-01.png",
    alt: "Planification implantaire 3D affichée dans le logiciel de simulation",
    items: [
      "Rapport de planification PDF",
      "Modèle résine témoin",
      "Guide chirurgical testé",
      "Protocole de forage papier",
    ],
  },
  {
    step: "ETAPE 02",
    title: "Jour de la chirurgie",
    image: "/images/deliverable-02.png",
    alt: "Guide chirurgical stérile et instrumentation de forage",
    items: [
      "Guide chirurgical stérile",
      "Forets pilotes étalonnés",
      "Cuillères d'insertion",
      "Implant choisi stérile",
    ],
  },
  {
    step: "ETAPE 03",
    title: "Après ostéointégration",
    image: "/images/deliverable-03.png",
    alt: "Piliers de cicatrisation et scanbodies alignés sur leur support",
    items: [
      "Pilier de cicatrisation",
      "Scanbody dédié au système",
      "Transfert d'empreinte physique",
      "Vis provisoire labo",
    ],
  },
  {
    step: "ETAPE 04",
    title: "En permanence",
    image: "/images/deliverable-04.png",
    alt: "Couronne finale en zircone maquillée et glacée",
    items: [
      "Couronne finale Zircone",
      "Vis clinique définitive",
      "Certificat de conformité",
      "Fiche de traçabilité",
    ],
  },
];

/**
 * The bar's own gradient, lifted from the design. It lives on the fill element
 * rather than the track so the whole spectrum stays visible at every width —
 * scaleX stretches the gradient with the box, which is also why the fill is
 * animated with a transform instead of `width` (no layout on every frame).
 */
const FILL_GRADIENT =
  "linear-gradient(270deg, rgb(254,105,5) 1.5%, rgb(188,34,131) 34.5%, rgb(105,85,223) 53%, rgb(53,169,233) 82%, rgb(230,230,230) 100%)";

/** Opacity of a stage that has not been reached yet. */
const DIM = 0.32;

/** Viewport-heights of scroll spent filling each stage while pinned. */
const DWELL = 0.6;

export function Deliverables() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const columns = gsap.utils.toArray<HTMLElement>("[data-stage]");
      const fills = gsap.utils.toArray<HTMLElement>("[data-fill]");

      const mm = gsap.matchMedia();

      mm.add(
        {
          // Pinning only earns its keep where all four stages sit side by side
          // and the whole composition fits one screen. Below lg the stages
          // stack and each fills itself as it scrolls into view.
          pinned:
            "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          stacked: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          const { pinned, reduced } = ctx.conditions as Record<string, boolean>;

          if (reduced) {
            gsap.set(columns, { opacity: 1 });
            gsap.set(fills, { scaleX: 1 });
            return;
          }

          gsap.set(columns.slice(1), { opacity: DIM });
          gsap.set(fills, { scaleX: 0, transformOrigin: "left center" });

          if (!pinned) {
            columns.forEach((column, i) => {
              gsap
                .timeline({
                  scrollTrigger: {
                    trigger: column,
                    start: "top 75%",
                    end: "bottom 60%",
                    scrub: 0.5,
                  },
                })
                .to(column, { opacity: 1, duration: 0.2 })
                .to(fills[i], { scaleX: 1, ease: "none", duration: 0.8 }, 0.1);
            });
            return;
          }

          // One scroll band per stage. A stage lights to full opacity as its
          // band opens, then its bar fills across the rest of it; stages
          // already crossed stay lit, so the row reads as accumulated
          // progress rather than a spotlight.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${window.innerHeight * DWELL * stages.length}`,
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          stages.forEach((_, i) => {
            tl.to(columns[i], { opacity: 1, duration: 0.2 }, i).to(
              fills[i],
              { scaleX: 1, ease: "none", duration: 0.8 },
              i + 0.1,
            );
          });

          // Trailing band so the fourth bar is seen full before the pin releases.
          tl.to({}, { duration: 0.5 }, stages.length);
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="flex items-start bg-surface px-gutter py-section lg:h-svh lg:items-center lg:overflow-hidden lg:py-0"
    >
      <div className="mx-auto flex w-full max-w-canvas flex-col gap-12">
        <div className="flex flex-col items-start gap-6">
          <p className="text-fine leading-[1.1] uppercase text-ink-faint">
            Ce que nous livrons
          </p>
          <h2 className="max-w-[519px] font-display text-heading leading-display font-medium tracking-tight text-ink">
            Ce qui est inclus dans votre trousse clinique
          </h2>
        </div>

        <ol className="grid grid-cols-1 gap-x-3 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {stages.map((stage) => (
            <li
              key={stage.step}
              data-stage
              className="flex flex-col items-start gap-4"
            >
              <p className="w-full font-display text-caption leading-[1.1] text-marker">
                {stage.step}
              </p>

              <div className="relative aspect-video w-full overflow-hidden rounded-[4px] bg-surface-raised">
                <Image
                  src={stage.image}
                  alt={stage.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>

              {/* Progress rail. Decorative: the stage's own copy already says
                  where the reader is, so screen readers skip the bar. */}
              <div
                aria-hidden
                className="h-[6px] w-full overflow-hidden bg-surface-raised"
              >
                <div
                  data-fill
                  className="h-full w-full"
                  style={{ backgroundImage: FILL_GRADIENT }}
                />
              </div>

              <div className="flex w-full flex-col gap-2">
                <h3 className="font-display text-title leading-display font-medium text-ink">
                  {stage.title}
                </h3>

                <ul className="flex flex-col gap-2">
                  {stage.items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Image
                        src="/icons/check.svg"
                        alt=""
                        width={11}
                        height={8}
                        className="h-[7.25px] w-[10.17px] shrink-0"
                      />
                      <span className="flex-1 text-caption leading-relaxed tracking-tight text-ink-subtle">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
