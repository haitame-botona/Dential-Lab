"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ease, duration } from "@/lib/motion";
import { Button } from "@/components/ui/Button";

const contacts = [
  { label: "Par téléphone : +212 5 22 XX XX XX", href: "tel:+2125220000000" },
  { label: "WhatsApp direct : +212 6 XX XX XX XX", href: "https://wa.me/212600000000" },
];

/**
 * Figma 24:1757 / 23:1644 / 23:1643 — three 242/282px blue circles under a 350px Gaussian
 * blur. A CSS blur that wide repaints the whole section on every scroll frame,
 * so the same glow is expressed as a radial gradient: identical falloff, no
 * filter in the paint path.
 */
function Glow({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute rounded-full bg-[radial-gradient(circle,--alpha(var(--color-blue-500)/28%)_0%,transparent_62%)] ${className}`}
    />
  );
}

/**
 * Closing section and page footer (Figma node 23:1584). A white card floats
 * 20px inside a blue-25 bed, carries the final ask, and ends in the spectrum
 * rule and the legal line — so the last thing on the page is still a card, not
 * a slab.
 */
export function Footer() {
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
            gsap.set("[data-reveal]", { opacity: 1, y: 0 });
            return;
          }

          gsap.from("[data-reveal]", {
            y: 24,
            opacity: 0,
            stagger: 0.1,
            ease: ease.outExpo,
            duration: duration.slow,
            scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
          });
        },
      );
    },
    { scope: root },
  );

  return (
    <footer
      ref={root}
      id="envoyer-un-cas"
      /* Twice the standard section lead-in (Figma pt-240): the run-up is empty
         on purpose, so the glows have room to bleed before the card arrives. */
      className="relative overflow-hidden bg-surface-sunken pt-[calc(var(--spacing-section)*2)]"
    >
      {/* Each box is centred on its Figma circle, sized to the reach of the
          350px blur — so the offsets read as (centre − half the box). */}
      <Glow className="-top-[339px] -left-[175px] size-[900px]" />
      <Glow className="-top-[89px] -left-[425px] size-[900px]" />
      <Glow className="-top-[103px] -right-[286px] size-[1000px]" />

      {/* The bed inset and the card's own padding stack, so below sm they are
          split (8 + 16) to land on the same 24px content edge as px-gutter. */}
      <div className="relative px-2 pb-5 sm:px-5">
        <div className="mx-auto flex w-full max-w-canvas flex-col items-center overflow-hidden rounded-[20px] bg-surface">
          <div className="flex w-full flex-col items-center gap-12 px-4 pt-12 pb-8 sm:px-8">
            <div className="flex w-full flex-col items-center gap-4">
              <h2
                data-reveal
                className="text-center font-display text-display leading-display font-medium tracking-tight text-ink"
              >
                Envoyez un cas.
                <br />
                Jugez le plan, pas la brochure.
              </h2>
              <p
                data-reveal
                className="max-w-[616px] text-caption leading-relaxed tracking-tight text-ink-muted"
              >
                Éprouvez notre rigueur clinique dès aujourd&apos;hui. Téléchargez
                vos fichiers STL et DICOM sur notre portail sécurisé. Votre
                première planification 3D vous est proposée sans aucun engagement
                de traitement ultérieur.
              </p>
              <div
                data-reveal
                /* Stacked below sm — same pattern as the hero CTAs: full-width
                   pills at 320px, back to a row once there is width for both. */
                className="flex w-full max-w-[347px] flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
              >
                <Button
                  href="#configurateur"
                  shape="pill"
                  /* The page's one blue button — the final ask, stated as a
                     local accent override rather than a new variant. */
                  className="[--accent-ink:var(--color-neutral-0)] [--accent:var(--color-blue-500)]"
                  icon={
                    <span className="flex size-[14px] shrink-0 items-center justify-center">
                      <Image
                        src="/icons/arrow-up-right-on-accent.svg"
                        alt=""
                        width={5}
                        height={8}
                        className="block"
                      />
                    </span>
                  }
                >
                  Envoyer un cas test
                </Button>
                <Button
                  href={contacts[0].href}
                  variant="ghost"
                  shape="pill"
                  className="text-ink-subtle"
                  icon={
                    <span className="flex size-[14px] shrink-0 items-center justify-center">
                      <Image
                        src="/icons/phone-ink.svg"
                        alt=""
                        width={13}
                        height={13}
                        className="block"
                      />
                    </span>
                  }
                >
                  Prendre rendez-vous
                </Button>
              </div>
            </div>

            <div
              data-reveal
              /* Contact line follows the CTAs: stacked and centred below sm,
                 back to one row with the glyph between them from sm up. */
              className="flex flex-col items-center gap-4 text-center sm:flex-row sm:flex-wrap sm:justify-center sm:gap-8"
            >
              <a
                href={contacts[0].href}
                className="text-caption leading-relaxed tracking-tight text-ink-muted underline underline-offset-2 transition-opacity duration-(--duration-fast) hover:opacity-70"
              >
                {contacts[0].label}
              </a>
              <Image
                src="/icons/logo-glyph.svg"
                alt=""
                width={20.51}
                height={20}
                className="block shrink-0"
              />
              <a
                href={contacts[1].href}
                className="text-caption leading-relaxed tracking-tight text-ink-muted underline underline-offset-2 transition-opacity duration-(--duration-fast) hover:opacity-70"
              >
                {contacts[1].label}
              </a>
            </div>
          </div>

          <div className="flex w-full flex-col items-start">
            {/* The brand spectrum, spent in one 8px rule at the very bottom of
                the page — the only place the full range appears. */}
            <div
              className="h-2 w-full shrink-0"
              style={{
                backgroundImage:
                  "linear-gradient(270deg, rgb(254, 105, 5) 1.5%, rgb(188, 34, 131) 34.5%, rgb(105, 85, 223) 53%, rgb(53, 169, 233) 82%, rgb(230, 230, 230) 100%)",
              }}
            />
            {/* Legal line follows the blocks above: stacked and centred below
                sm, split to the two ends of the row from sm up. */}
            <div className="flex w-full flex-col items-center gap-2 border-t border-rule bg-surface px-4 py-5 text-center font-display text-[#a6a39f] sm:flex-row sm:flex-wrap sm:justify-between sm:px-8 sm:text-left">
              <p className="min-w-0 text-[10px] sm:flex-1">
                © 2026 Dential Lab. Filiale laboratoire de{" "}
                <span className="font-semibold text-blue-500">
                  Dential Biotech
                </span>
                , en collaboration avec des laboratoires partenaires de premier
                plan au Maroc. Tous droits réservés.
              </p>
              <p className="shrink-0 text-[10px] whitespace-nowrap">
                PROTOTYPE CLINIQUE V1.04
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
