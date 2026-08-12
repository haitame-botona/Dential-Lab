"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, duration } from "@/lib/motion";

type Differentiator = {
  title: string;
  body: string;
  /**
   * Animated icon. Left undefined for now: the slot renders the neutral
   * placeholder from the design until the real icons exist. Drop a Lottie,
   * inline SVG or <video> in here and nothing else needs to change.
   */
  icon?: ReactNode;
};

const items: Differentiator[] = [
  {
    title: "Co-planifié en clinique",
    body: "Le montage clinique est validé avec vous avant tout usinage : axes, émergences, profil d'émergence.",
  },
  {
    title: "Piliers personnalisés",
    body: "Titane usiné sur mesure plutôt que pilier standard retouché : ajustement passif, joint net.",
  },
  {
    title: "Composants certifiés",
    body: "Aucune pièce générique compatible. Uniquement des bases et vis d'origine, traçables par lot.",
  },
  {
    title: "Garantie clinique écrite",
    body: "Une seule contrepartie contractuelle pour la prothèse et la chirurgie guidée : durées, périmètre, remplacement.",
  },
];

export function Differentiators() {
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
            gsap.set("[data-reveal], [data-item]", { opacity: 1, y: 0 });
            return;
          }

          // The narrative order the section is written in: the claim lands
          // first, then the evidence arrives one item at a time.
          gsap
            .timeline({
              defaults: { ease: ease.outExpo, duration: duration.slow },
              scrollTrigger: {
                trigger: root.current,
                start: "top 70%",
                once: true,
              },
            })
            .from("[data-reveal]", { y: 28, opacity: 0, stagger: 0.1 })
            .from("[data-item]", { y: 32, opacity: 0, stagger: 0.14 }, "-=0.45");
        },
      );
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="flex items-start bg-surface px-gutter py-section"
    >
      <div className="mx-auto grid w-full max-w-canvas grid-cols-1 gap-x-gutter gap-y-16 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6 self-start">
          <p
            data-reveal
            className="text-fine leading-[1.1] uppercase text-ink-faint"
          >
            Ce qui fait la différence
          </p>
          <h2
            data-reveal
            className="max-w-[519px] font-display text-heading leading-display font-medium tracking-tight text-ink"
          >
            Les décisions prothétiques se prennent pendant la planification, pas
            après la chirurgie.
          </h2>
          <p
            data-reveal
            className="max-w-[411px] text-sm leading-relaxed tracking-tight text-ink-muted"
          >
            Nous refusons l&apos;approche fragmentée traditionnelle. En réunissant
            la clinique, la mécanique implantaire et l&apos;esthétique prothétique
            dès la conception numérique, nous sécurisons les marges et vos
            résultats de traitement.
          </p>
        </div>

        <ul className="flex flex-col gap-8 self-start">
          {items.map((item, i) => (
            <li
              key={item.title}
              data-item
              className="flex items-center gap-5 sm:gap-8"
            >
              {/* Icon shrinks on narrow screens — at 100px it starves the
                  title, forcing it to wrap against the index number. */}
              <div className="grid size-[76px] shrink-0 place-items-center overflow-hidden rounded bg-surface-raised sm:size-[100px]">
                {item.icon}
              </div>

              <div className="flex min-w-px flex-1 flex-col items-start gap-2">
                <div className="flex w-full items-center justify-between gap-4 leading-[1.1]">
                  <h3 className="font-display text-title font-medium text-ink">
                    {item.title}
                  </h3>
                  <span
                    aria-hidden
                    className="shrink-0 font-display text-caption tracking-tighter text-ink"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-caption leading-relaxed tracking-tight text-ink-subtle">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
