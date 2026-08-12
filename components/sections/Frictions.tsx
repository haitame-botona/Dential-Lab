"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, duration } from "@/lib/motion";

type Friction = {
  title: string;
  body: string;
  /**
   * Animated icon. Left undefined for now: the slot renders the neutral
   * placeholder from the design until the real icons exist. Drop a Lottie,
   * inline SVG or <video> in here and nothing else needs to change.
   */
  icon?: ReactNode;
};

const items: Friction[] = [
  {
    title: "La prothèse en aval",
    body: "Le projet prothétique arrive après la pose : l'axe subit la chirurgie au lieu de la servir, et la compensation se fait au fauteuil.",
  },
  {
    title: "Multiplication des acteurs",
    body: "Centre d'imagerie, fournisseur de guide, laboratoire, revendeur de composants : quatre responsabilités indépendantes.",
  },
  {
    title: "Surtaxation des composants",
    body: "Chaque pièce est facturée à la marge d'un intermédiaire, hors du prix annoncé du cas — le budget réel se découvre à la fin.",
  },
  {
    title: "Points de rupture cumulés",
    body: "Chaque transfert de fichier ou de responsabilité ajoute un délai — et un litige possible dont le praticien porte seul la charge.",
  },
];

export function Frictions() {
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
            .from("[data-item]", { y: 32, opacity: 0, stagger: 0.12 }, "-=0.45");
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
      <div className="mx-auto flex w-full max-w-canvas flex-col gap-8">
        <div className="flex flex-col items-start gap-6">
          <p
            data-reveal
            className="text-fine leading-[1.1] uppercase text-ink-faint"
          >
            Pourquoi le flux fragmenté coûte plus cher
          </p>
          <h2
            data-reveal
            className="font-display text-heading leading-display font-medium tracking-tight text-ink"
          >
            Les frictions invisibles du flux traditionnel
          </h2>
        </div>

        <ul className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li
              key={item.title}
              data-item
              className="flex flex-col items-start gap-6"
            >
              <span
                aria-hidden
                className="font-display text-caption leading-[1.1] text-marker"
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="grid size-[100px] shrink-0 place-items-center overflow-hidden rounded bg-surface-raised">
                {item.icon}
              </div>

              <div className="flex flex-col items-start gap-2">
                <h3 className="font-display text-title leading-display font-medium text-ink">
                  {item.title}
                </h3>
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
