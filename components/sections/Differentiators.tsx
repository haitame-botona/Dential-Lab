"use client";

import Image from "next/image";
import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, duration } from "@/lib/motion";

type Differentiator = {
  title: string;
  body: string;
  /**
   * The 24px glyph beside the title. Exported from Figma with the marker blue
   * baked in, so its intrinsic size is the vector's own — not a square.
   */
  icon: { src: string; width: number; height: number };
  /**
   * Animated asset for the 184×100 slot. Left undefined for now: the slot
   * renders the neutral placeholder from the design until the real media
   * exists. Drop a Lottie, inline SVG or <video> in here and nothing else
   * needs to change.
   */
  media?: ReactNode;
};

const items: Differentiator[] = [
  {
    title: "Co-planifié en clinique",
    body: "Le montage clinique est validé avec vous avant tout usinage : axes, émergences, profil d'émergence.",
    icon: { src: "/icons/diff-coplanning.svg", width: 17.44, height: 21.44 },
  },
  {
    title: "Piliers personnalisés",
    body: "Titane usiné sur mesure plutôt que pilier standard retouché : ajustement passif, joint net.",
    icon: { src: "/icons/diff-abutments.svg", width: 19.44, height: 21.44 },
  },
  {
    title: "Composants certifiés",
    body: "Aucune pièce générique compatible. Uniquement des bases et vis d'origine, traçables par lot.",
    icon: { src: "/icons/diff-certified.svg", width: 17.44, height: 21.44 },
  },
  {
    title: "Garantie clinique écrite",
    body: "Une seule contrepartie contractuelle pour la prothèse et la chirurgie guidée : durées, périmètre, remplacement.",
    icon: { src: "/icons/diff-coplanning.svg", width: 17.44, height: 21.44 },
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
          // first, then the evidence arrives one card at a time.
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
      <div className="mx-auto grid w-full max-w-canvas grid-cols-1 gap-x-8 gap-y-16 lg:grid-cols-2">
        <div className="flex flex-col items-start gap-6 self-start">
          <p
            data-reveal
            className="text-fine leading-[1.1] uppercase text-marker"
          >
            Ce qui fait la différence
          </p>
          <h2
            data-reveal
            className="font-display text-heading leading-display font-medium tracking-tight text-ink"
          >
            Les décisions prothétiques se prennent pendant la planification, pas
            après la chirurgie.
          </h2>
          <p
            data-reveal
            /* Fills the column, but stops at a readable measure — past ~60
               characters the eye loses the line return. */
            className="max-w-[58ch] text-sm leading-relaxed tracking-tight text-ink-muted"
          >
            Nous refusons l&apos;approche fragmentée traditionnelle. En réunissant
            la clinique, la mécanique implantaire et l&apos;esthétique prothétique
            dès la conception numérique, nous sécurisons les marges et vos
            résultats de traitement.
          </p>
        </div>

        <ul className="flex flex-col gap-6 self-start">
          {items.map((item) => (
            <li
              key={item.title}
              data-item
              className="flex items-center gap-4 overflow-hidden rounded-xl bg-surface-tint p-3"
            >
              {/* The slot narrows on small screens — at 184px it starves the
                  copy — and stretches to the card so it never floats beside a
                  title that has wrapped to three lines. */}
              <div className="grid w-[104px] shrink-0 place-items-center self-stretch overflow-hidden rounded-xl bg-surface-raised sm:h-[100px] sm:w-[184px] sm:self-center">
                {item.media}
              </div>

              <div className="flex min-w-px flex-1 flex-col items-start gap-2">
                {/* Start-aligned, not centred: the icon stays with the title's
                    first line when the title wraps. */}
                <div className="flex w-full items-start gap-3">
                  <span className="grid size-6 shrink-0 place-items-center">
                    <Image
                      src={item.icon.src}
                      alt=""
                      width={item.icon.width}
                      height={item.icon.height}
                      className="block"
                    />
                  </span>
                  <h3 className="min-w-px flex-1 font-display text-title leading-[1.1] font-medium text-ink">
                    {item.title}
                  </h3>
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
