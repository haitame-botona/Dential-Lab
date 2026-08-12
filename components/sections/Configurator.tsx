"use client";

import Image from "next/image";
import { useRef, useState, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { duration, ease } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import {
  CASE_TYPES,
  DEFAULT_CONFIGURATION,
  IMPLANT_BRANDS,
  MATERIALS,
  OPTIONS,
  computeTotal,
  formatDelta,
  formatMAD,
  summarise,
  toSearchParams,
  type Choice,
  type Configuration,
} from "@/lib/configurator";

/**
 * The value React paints on first render and then never touches again — GSAP
 * owns that text node from mount onwards so the counter can tween without
 * React overwriting it mid-flight. See the total below.
 */
const INITIAL_TOTAL = formatMAD(computeTotal(DEFAULT_CONFIGURATION));

/** The 16px square that fronts every row. Green once the row is on. */
function Mark({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`grid size-4 shrink-0 place-items-center rounded-sm transition-colors duration-(--duration-fast) ${
        on ? "bg-confirm" : "border border-border-subtle bg-ink/5"
      }`}
    >
      {on ? (
        <Image
          src="/icons/check-on-accent.svg"
          alt=""
          width={10}
          height={8}
          className="block"
        />
      ) : null}
    </span>
  );
}

/** "ÉTAPE n : …" — a legend, because each step is a real fieldset. */
function StepLegend({ children }: { children: ReactNode }) {
  return (
    <legend className="mb-4 font-display text-title leading-display font-medium text-ink">
      {children}
    </legend>
  );
}

/** The bordered, rounded slab the rows of steps 2–4 sit inside. */
function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-md border border-border-subtle bg-surface-raised">
      {children}
    </div>
  );
}

/** Shared row chrome: hit area, hairline, and the selected row's darker bed. */
const rowClass = (on: boolean) =>
  `relative flex cursor-pointer flex-col gap-2 border-b border-border-subtle p-4 transition-colors duration-(--duration-fast) last:border-b-0 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-ink ${
    on ? "bg-surface" : "hover:bg-ink/[0.03]"
  }`;

/** The price slot. Clay when the pack already covers it, plain ink otherwise. */
function Price({ choice }: { choice: Choice }) {
  return (
    <span
      className={`shrink-0 font-display text-caption whitespace-nowrap ${
        choice.locked ? "text-included" : "text-ink"
      }`}
    >
      {formatDelta(choice)}
    </span>
  );
}

export function Configurator() {
  const [config, setConfig] = useState<Configuration>(DEFAULT_CONFIGURATION);
  const { caseType, brand, material, optionCount, total } = summarise(config);

  const totalRef = useRef<HTMLParagraphElement>(null);
  /** What the counter currently reads, so a re-tween starts where it stopped. */
  const shown = useRef(computeTotal(DEFAULT_CONFIGURATION));

  useGSAP(
    () => {
      const node = totalRef.current;
      if (!node) return;

      const write = (value: number) => {
        node.textContent = formatMAD(value);
        shown.current = value;
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        write(total);
        return;
      }

      // Tween a plain object rather than the DOM: the price should read as a
      // figure settling, not a slot machine, so it snaps to whole MAD.
      const counter = { value: shown.current };
      gsap.to(counter, {
        value: total,
        duration: duration.base,
        ease: ease.outQuart,
        snap: { value: 1 },
        onUpdate: () => write(counter.value),
      });
    },
    { dependencies: [total] },
  );

  const toggleOption = (option: Choice) => {
    if (option.locked) return;
    setConfig((current) => ({
      ...current,
      options: current.options.includes(option.id)
        ? current.options.filter((id) => id !== option.id)
        : [...current.options, option.id],
    }));
  };

  /**
   * Carry the configuration into the URL on the way to the contact anchor, so
   * whatever handles #envoyer-un-cas can read it back instead of asking the
   * clinician to describe the case a second time. replaceState keeps the jump
   * a same-page scroll — a real href would reload and lose Lenis's position.
   */
  const stamp = () => {
    window.history.replaceState(null, "", `?${toSearchParams(config)}`);
  };

  return (
    <section
      id="configurateur"
      data-theme="dark"
      className="flex items-start border-b border-rule bg-surface px-gutter py-section"
    >
      <div className="mx-auto flex w-full max-w-canvas flex-col gap-14">
        <header className="flex flex-col gap-4">
          <p className="font-body text-fine leading-[1.1] text-ink-faint uppercase">
            Construire le cas
          </p>
          <h2 className="font-display text-heading leading-display font-medium tracking-tight text-balance text-ink">
            Configurez le pack. Envoyez le cas, ou demandez un appel.
          </h2>
        </header>

        <div className="flex flex-col gap-12 lg:flex-row lg:items-start">
          {/* Steps — the only column that scrolls. */}
          <div className="flex min-w-0 flex-1 flex-col gap-10">
            {/* ---------------------------------------------------------- 1 */}
            <fieldset>
              <StepLegend>ÉTAPE 1 : Type de cas prothétique</StepLegend>
              <div className="flex flex-wrap items-center gap-3">
                {CASE_TYPES.map((entry) => {
                  const on = config.caseType === entry.id;
                  return (
                    <label
                      key={entry.id}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-sm px-3 py-2 font-display text-caption font-medium tracking-tighter transition-colors duration-(--duration-fast) has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
                        on
                          ? "bg-ink text-surface"
                          : "border border-border-subtle text-ink hover:bg-ink/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="case-type"
                        className="sr-only"
                        checked={on}
                        onChange={() =>
                          setConfig((current) => ({
                            ...current,
                            caseType: entry.id,
                          }))
                        }
                      />
                      {entry.label}
                      {on ? (
                        <Image
                          src="/icons/check-ink.svg"
                          alt=""
                          width={10}
                          height={8}
                          className="block shrink-0"
                        />
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            {/* ---------------------------------------------------------- 2 */}
            <fieldset>
              <StepLegend>
                ÉTAPE 2 : Marque de système d&apos;implant
              </StepLegend>
              <Panel>
                {/* Column headers only exist where there are columns. */}
                <div
                  aria-hidden
                  className="hidden gap-4 border-b border-border-subtle bg-ink/5 p-4 font-display text-fine leading-display font-medium text-ink lg:grid lg:grid-cols-[16px_200px_1fr_1fr_120px]"
                >
                  <span />
                  <span>SYSTÈME IMPLANTAIRE</span>
                  <span>POSITIONNEMENT</span>
                  <span>RECOMMANDÉ POUR</span>
                  <span>VALEUR PACK</span>
                </div>

                {IMPLANT_BRANDS.map((entry) => {
                  const on = config.brand === entry.id;
                  return (
                    <label
                      key={entry.id}
                      className={`${rowClass(on)} lg:grid lg:grid-cols-[16px_200px_1fr_1fr_120px] lg:items-center lg:gap-4`}
                    >
                      <input
                        type="radio"
                        name="implant-brand"
                        className="sr-only"
                        checked={on}
                        onChange={() =>
                          setConfig((current) => ({
                            ...current,
                            brand: entry.id,
                          }))
                        }
                      />
                      {/* lg:contents dissolves this wrapper into the grid, so
                          one markup tree serves both the stacked card and the
                          five-column table. */}
                      <div className="flex items-center gap-4 lg:contents">
                        <Mark on={on} />
                        <span className="font-display text-caption font-medium text-ink">
                          {entry.label}
                        </span>
                      </div>
                      <span className="font-display text-caption text-ink-faint">
                        {entry.positioning}
                      </span>
                      <span className="font-display text-caption text-ink-faint">
                        {entry.recommendedFor}
                      </span>
                      <span
                        className={`font-display text-caption whitespace-nowrap lg:text-right ${
                          entry.locked ? "text-included" : "text-ink"
                        }`}
                      >
                        {formatDelta(entry)}
                      </span>
                    </label>
                  );
                })}
              </Panel>
            </fieldset>

            {/* ---------------------------------------------------------- 3 */}
            <fieldset>
              <StepLegend>
                ÉTAPE 3 : Matériau de la prothèse définitive
              </StepLegend>
              <Panel>
                {MATERIALS.map((entry) => {
                  const on = config.material === entry.id;
                  return (
                    <label key={entry.id} className={rowClass(on)}>
                      <input
                        type="radio"
                        name="material"
                        className="sr-only"
                        checked={on}
                        onChange={() =>
                          setConfig((current) => ({
                            ...current,
                            material: entry.id,
                          }))
                        }
                      />
                      <span className="flex items-center gap-4">
                        <Mark on={on} />
                        <span className="min-w-0 flex-1 font-display text-label font-semibold text-ink">
                          {entry.label}
                        </span>
                        <Price choice={entry} />
                      </span>
                      <span className="font-display text-caption text-ink-faint">
                        {entry.note}
                      </span>
                    </label>
                  );
                })}
              </Panel>
            </fieldset>

            {/* ---------------------------------------------------------- 4 */}
            <fieldset>
              <StepLegend>
                ÉTAPE 4 : Options additionnelles du protocole
              </StepLegend>
              <Panel>
                {OPTIONS.map((entry) => {
                  const on = config.options.includes(entry.id);
                  return (
                    <label
                      key={entry.id}
                      className={`${rowClass(on)} ${entry.locked ? "cursor-default" : ""}`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        disabled={entry.locked}
                        onChange={() => toggleOption(entry)}
                      />
                      <span className="flex items-center gap-4">
                        <Mark on={on} />
                        <span className="min-w-0 flex-1 font-display text-label font-semibold text-ink">
                          {entry.label}
                        </span>
                        <Price choice={entry} />
                      </span>
                    </label>
                  );
                })}
              </Panel>
            </fieldset>

            {/* Below lg the recap card sits after the steps, so the running
                total would be off-screen exactly while you are changing it.
                This bar keeps the number in view; the full card is still
                below, unchanged. */}
            <div className="sticky bottom-0 -mx-gutter flex items-center justify-between gap-4 border-t border-border-subtle bg-surface px-gutter py-3 lg:hidden">
              <div className="min-w-0">
                <p className="font-body text-fine leading-[1.1] text-ink-faint uppercase">
                  Estimation
                </p>
                <p className="font-display text-title leading-display font-semibold tracking-tight text-ink">
                  {formatMAD(total)}
                </p>
              </div>
              <Button href="#envoyer-un-cas" variant="solid" onClick={stamp}>
                Envoyer mon cas
              </Button>
            </div>
          </div>

          {/* Recap — a light island, sticky beside the steps from lg up. */}
          <aside
            data-theme="light"
            className="flex flex-col gap-6 rounded-lg border border-ink bg-surface p-8 lg:sticky lg:top-28 lg:w-[353px] lg:shrink-0"
          >
            <div className="flex flex-col gap-2">
              <p className="font-body text-fine leading-[1.1] text-ink-faint uppercase">
                Votre pack
              </p>
              <p className="font-display text-title leading-display font-medium tracking-tight text-ink">
                Récapitulatif provisoire
              </p>
            </div>

            <hr className="border-t border-border-subtle" />

            <dl className="flex flex-col gap-3.5 font-display text-caption">
              {[
                ["Type de cas", caseType.recapLabel],
                ["Marque implantaire", brand.recapLabel ?? brand.label],
                ["Matériau prothèse", material.recapLabel ?? material.label],
                [
                  "Options actives",
                  `${optionCount} sélectionnée${optionCount > 1 ? "s" : ""}`,
                ],
              ].map(([term, value]) => (
                <div key={term} className="flex items-start justify-between gap-4">
                  <dt className="shrink-0 text-ink-faint">{term}</dt>
                  <dd className="text-right font-semibold tracking-tight text-ink">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <hr className="border-t border-border-subtle" />

            <div className="flex flex-col gap-1.5">
              <p className="font-body text-fine leading-[1.1] text-ink-faint uppercase">
                Estimation du pack complet
              </p>
              {/* GSAP owns this node's text after mount — see INITIAL_TOTAL. */}
              <p
                ref={totalRef}
                aria-hidden
                className="font-display text-heading leading-display font-semibold tracking-tight text-ink"
              >
                {INITIAL_TOTAL}
              </p>
              {/* The figure a screen reader gets: announced once it settles,
                  not on every frame of the tween. */}
              <p aria-live="polite" className="sr-only">
                Estimation du pack complet : {formatMAD(total)}
              </p>
              <p className="font-display text-fine text-ink-faint italic">
                * Tarification indicative réservée exclusivement aux
                professionnels cliniciens inscrits à l&apos;Ordre.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                href="#envoyer-un-cas"
                variant="solid"
                onClick={stamp}
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
                Envoyer mon cas
              </Button>
              <Button
                href="#demander-un-appel"
                variant="outline"
                onClick={stamp}
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
                Demander un appel conseil
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
