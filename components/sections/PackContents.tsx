"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease } from "@/lib/motion";

type PackItem = {
  title: string;
  body: string;
  /**
   * The asset shown while this item is the one being revealed. Left undefined
   * until the real asset exists — the slot then renders the neutral
   * placeholder from the design.
   *
   * It is mounted twice, once in the pinned cross-fade panel and once inline
   * in the mobile list, so both slots stay in the DOM at every breakpoint.
   */
  image?: string;
};

const items: PackItem[] = [
  {
    title: "Planification implanto-prothétique 3D",
    body: "Fichier de simulation chirurgicale issu du maillage de vos fichiers DICOM (CBCT) et empreinte optique (STL). Réglages d'axes optimaux validés en ligne.",
    image: "/media/pack-planning.webp",
  },
  {
    title: "Guide chirurgical imprimé biocompatible",
    body: "Imprimé en résine chirurgicale certifiée de Classe IIa, intégrant des canons métalliques étalonnés pour votre trousse de guidée.",
    image: "/media/pack-guide.webp",
  },
  {
    title: "Composants mécaniques d'origine",
    body: "Inclus dans chaque boîte : vis prothétique de clinique définitive, pilier personnalisé en titane d'origine ou embase titane anti-rotationnelle ajustée.",
    image: "/media/pack-components.webp",
  },
  {
    title: "Restauration d'usage en Zircone",
    body: "Zircone monolithique multicouche à haut gradient de translucidité (1200 MPa), frittée, maquillée et glacée par nos maîtres céramistes marocains.",
    image: "/media/pack-crown.webp",
  },
];

/** Viewport-heights of scroll spent on each item while the section is pinned. */
const DWELL = 0.7;

export function PackContents() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          // Pinning only works where the media panel sits beside the list and
          // the whole composition fits one screen. Below lg the section is a
          // plain stacked list with each asset inlined above its own copy.
          pinned:
            "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
        },
        () => {
          const layers = gsap.utils.toArray<HTMLElement>("[data-layer]");
          const entries = gsap.utils.toArray<HTMLElement>("[data-entry]");
          const badges = gsap.utils.toArray<HTMLElement>("[data-badge]");

          // Slots are held open by the list's own layout, so an item fades in
          // exactly where it already belongs — nothing below it ever shifts.
          // Opacity rather than autoAlpha: the copy stays in the a11y tree
          // whatever the scroll position.
          gsap.set(entries.slice(1), { opacity: 0, y: 16 });
          gsap.set(layers.slice(1), { autoAlpha: 0 });

          // Item 0 is already on screen when the section pins, so the reader
          // never lands on an empty column. Each further scroll band ticks off
          // exactly one more item and swaps the panel to its asset.
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${window.innerHeight * DWELL * items.length}`,
              pin: true,
              scrub: 0.5,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          for (let i = 1; i < items.length; i++) {
            const at = i - 1;

            tl.to(layers[i - 1], { autoAlpha: 0, duration: 0.35 }, at)
              .to(layers[i], { autoAlpha: 1, duration: 0.35 }, at)
              .to(
                entries[i],
                { opacity: 1, y: 0, duration: 0.45, ease: ease.outQuart },
                at,
              )
              .fromTo(
                badges[i],
                { scale: 0.4 },
                { scale: 1, duration: 0.45, ease: "back.out(2)" },
                at + 0.05,
              );
          }

          // Trailing band so the last item is read before the pin releases.
          tl.to({}, { duration: 1 }, items.length - 1);
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
      <div className="mx-auto grid w-full max-w-canvas grid-cols-1 items-center gap-x-gutter gap-y-12 lg:grid-cols-2">
        <div className="flex flex-col gap-12 lg:gap-16">
          <div className="flex flex-col items-start gap-6">
            <p className="text-fine leading-[1.1] uppercase text-ink-faint">
              Ce que le pack contient
            </p>
            <h2 className="max-w-[519px] font-display text-heading leading-display font-medium tracking-tight text-ink">
              Un seul pack.
              <br />
              Tout ce que le cas exige.
            </h2>
          </div>

          <ul className="flex flex-col gap-12 lg:gap-6">
            {items.map((item) => (
              <li
                key={item.title}
                data-entry
                className="flex max-w-[541px] flex-col items-start gap-4 lg:gap-2"
              >
                {/* Mobile carries its own asset: there is no room beside the
                    copy for a shared panel to cross-fade in. */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-surface-raised lg:hidden">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>

                {/* Stacked: the check badge sits above the title rather than
                    beside it, matching the Differentiators cards. */}
                <div className="flex flex-col items-start gap-2">
                  <span
                    data-badge
                    aria-hidden
                    className="grid size-[30px] shrink-0 place-items-center rounded-full bg-confirm-surface"
                  >
                    <Image
                      src="/icons/check.svg"
                      alt=""
                      width={11}
                      height={8}
                      className="h-[7.25px] w-[10.17px]"
                    />
                  </span>
                  <h3 className="font-display text-title leading-display font-medium text-ink">
                    {item.title}
                  </h3>
                </div>

                <p className="text-caption leading-relaxed tracking-tight text-ink-subtle">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div
          aria-hidden
          className="relative hidden h-[min(70vh,620px)] w-full overflow-hidden rounded-xl bg-surface-raised lg:block"
        >
          {items.map((item) => (
            <div
              key={item.title}
              data-layer
              className="absolute inset-0"
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
