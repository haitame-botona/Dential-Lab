"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
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
   * Path under /public for the image filling the media slot. Left undefined
   * until the render exists — the slot then shows the neutral placeholder from
   * the design.
   */
  image?: string;
};

const items: Differentiator[] = [
  {
    title: "Co-planifié en clinique",
    body: "Le montage clinique est validé avec vous avant tout usinage : axes, émergences, profil d'émergence.",
    icon: { src: "/icons/diff-coplanning.svg", width: 17.44, height: 21.44 },
    image: "/media/diff-coplanning.webp",
  },
  {
    title: "Piliers personnalisés",
    body: "Titane usiné sur mesure plutôt que pilier standard retouché : ajustement passif, joint net.",
    icon: { src: "/icons/diff-abutments.svg", width: 19.44, height: 21.44 },
    image: "/media/diff-abutments.webp",
  },
  {
    title: "Composants certifiés",
    body: "Aucune pièce générique compatible. Uniquement des bases et vis d'origine, traçables par lot.",
    icon: { src: "/icons/diff-certified.svg", width: 17.44, height: 21.44 },
    image: "/media/diff-certified.webp",
  },
  {
    title: "Garantie clinique écrite",
    body: "Une seule contrepartie contractuelle pour la prothèse et la chirurgie guidée : durées, périmètre, remplacement.",
    icon: { src: "/icons/diff-coplanning.svg", width: 17.44, height: 21.44 },
    image: "/media/diff-warranty.webp",
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

          // Header: the claim lands first, the supporting copy follows a beat
          // later. One timeline, fired once when the section comes into view.
          gsap
            .timeline({
              defaults: { ease: ease.outExpo, duration: duration.slow },
              scrollTrigger: {
                trigger: root.current,
                start: "top 70%",
                once: true,
              },
            })
            .from("[data-reveal]", { y: 28, opacity: 0, stagger: 0.12 });

          // Cards are NOT part of that timeline — each one waits for its own
          // scroll position and rises as it enters. batch() groups the ones
          // that cross the line together (e.g. on a tall viewport where two
          // are visible at once) so they stagger instead of firing in unison.
          const cards = gsap.utils.toArray<HTMLElement>("[data-item]");
          gsap.set(cards, { y: 40, opacity: 0 });

          ScrollTrigger.batch(cards, {
            start: "top 88%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, {
                y: 0,
                opacity: 1,
                duration: duration.slow,
                ease: ease.outExpo,
                stagger: 0.12,
                overwrite: true,
              }),
          });
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

        <ul className="flex flex-col gap-5 self-start">
          {items.map((item) => (
            <li
              key={item.title}
              data-item
              className="flex flex-col gap-4 overflow-hidden rounded-xl bg-surface-tint p-3 sm:flex-row sm:items-center"
            >
              {/* Mobile stacks the asset above the copy at full card width; from
                  sm the slot sits beside it at its Figma size, 184×132. The
                  taller 200px gives the render room to breathe at full card
                  width on a phone.

                  132px is what drives the whole right column: 132 + 24 of card
                  padding = the 156px card height in the design, and four of
                  those with the 20px gap add up to its 684px column. Setting it
                  here rather than fixing the column height means a card that
                  needs a third line of body copy grows instead of clipping. */}
              <div className="relative h-[200px] w-full shrink-0 overflow-hidden rounded-xl bg-surface-raised sm:h-[132px] sm:w-[184px] sm:self-center">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 184px, 100vw"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <div className="flex min-w-px flex-1 flex-col items-start gap-2">
                {/* Stacked: the icon sits above the title rather than beside
                    it, so long titles get the full card width to wrap into. */}
                <div className="flex w-full flex-col items-start gap-2">
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
