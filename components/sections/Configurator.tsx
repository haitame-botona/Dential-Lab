"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { duration, ease } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { Mark } from "@/components/ui/Mark";
import { Select, type SelectOption } from "@/components/ui/Select";
import {
  CASE_TYPES,
  EMPTY_CONFIGURATION,
  IMPLANT_BRANDS,
  MATERIALS,
  OPTIONS,
  formatDelta,
  formatMAD,
  summarise,
  toSearchParams,
  type Choice,
  type Configuration,
} from "@/lib/configurator";

/**
 * What every unanswered slot renders — the recap rows and the estimate alike.
 * The configurator opens locked down, so this is the first thing on screen.
 */
const EMPTY = "—";

/** Card chrome, shared by the steps panel and the recap beside it. */
const CARD =
  "rounded-xl bg-surface p-8 shadow-[0_4px_36px_rgba(0,0,0,0.06)]";

/** Blue ordinal over a black title — the label block fronting every step. */
function StepLabel({ step, title }: { step: string; title: string }) {
  return (
    <span className="flex flex-col justify-center gap-1.5">
      <span className="font-display text-fine leading-[1.1] text-marker">
        {step}
      </span>
      <span className="font-display text-label leading-display font-medium text-ink">
        {title}
      </span>
    </span>
  );
}

/**
 * The menus carry what the comparison tables used to: a brand's positioning
 * and what it is recommended for, a material's technique, and in both cases
 * what the choice does to the pack's price. Step 1's cases have no such
 * columns — the case type sets the base, it doesn't modify one.
 */
const CASE_OPTIONS: SelectOption[] = CASE_TYPES.map((entry) => ({
  value: entry.id,
  label: entry.label,
}));

const BRAND_OPTIONS: SelectOption[] = IMPLANT_BRANDS.map((entry) => ({
  value: entry.id,
  label: entry.label,
  notes: [entry.positioning, entry.recommendedFor],
  trailing: { text: formatDelta(entry), included: entry.locked },
}));

const MATERIAL_OPTIONS: SelectOption[] = MATERIALS.map((entry) => ({
  value: entry.id,
  label: entry.label,
  notes: [entry.note],
  trailing: { text: formatDelta(entry), included: entry.locked },
}));

/** One of steps 1–3: a label with its picker stacked underneath, full width. */
function StepSelect({
  id,
  step,
  title,
  value,
  onChange,
  options,
}: {
  id: string;
  step: string;
  title: string;
  value: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* A <span>, not a <label>: the trigger is a button, and a label would
          not forward its click the way it does for a native control. */}
      <span id={`${id}-label`}>
        <StepLabel step={step} title={title} />
      </span>
      <Select
        id={id}
        labelledBy={`${id}-label`}
        value={value}
        onChange={onChange}
        options={options}
        placeholder="Sélectionner depuis la liste"
      />
    </div>
  );
}

/** A recap line: term left, answer right, an em dash until it is answered. */
function RecapRow({ term, value }: { term: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-ink-subtle">{term}</dt>
      <dd
        className={`text-right font-medium tracking-tight ${
          value ? "text-ink" : "text-ink-faint"
        }`}
      >
        {value ?? EMPTY}
      </dd>
    </div>
  );
}

export function Configurator() {
  const [config, setConfig] = useState<Configuration>(EMPTY_CONFIGURATION);
  const { caseType, brand, material, optionCount, total } = summarise(config);

  const totalRef = useRef<HTMLParagraphElement>(null);
  /** What the counter currently reads, so a re-tween starts where it stopped. */
  const shown = useRef(0);

  useGSAP(
    () => {
      const node = totalRef.current;
      if (!node) return;

      // Nothing priced yet: no figure to count towards, so hold the dash.
      if (total === null) {
        node.textContent = EMPTY;
        shown.current = 0;
        return;
      }

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
      className="flex items-start border-b border-rule bg-surface-sunken px-gutter py-section"
    >
      <div className="mx-auto flex w-full max-w-canvas flex-col gap-12">
        <header className="flex flex-col gap-4">
          <p className="font-body text-fine leading-[1.1] text-marker uppercase">
            Construire le cas
          </p>
          <h2 className="font-display text-heading leading-display font-medium tracking-tight text-balance text-ink">
            Configurez le pack. Envoyez le cas, ou demandez un appel.
          </h2>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          {/* Steps — the only column that scrolls. */}
          <div className={`${CARD} flex min-w-0 flex-1 flex-col gap-6`}>
            <div className="flex flex-col gap-6">
              <StepSelect
                id="config-case-type"
                step="ETAPE 01"
                title="Type de cas prothétique"
                value={config.caseType}
                onChange={(value) =>
                  setConfig((current) => ({ ...current, caseType: value }))
                }
                options={CASE_OPTIONS}
              />

              <StepSelect
                id="config-brand"
                step="ETAPE 02"
                title="Marque de système d'implant"
                value={config.brand}
                onChange={(value) =>
                  setConfig((current) => ({ ...current, brand: value }))
                }
                options={BRAND_OPTIONS}
              />

              <StepSelect
                id="config-material"
                step="ETAPE 03"
                title="Matériaux de la prothèse définitive"
                value={config.material}
                onChange={(value) =>
                  setConfig((current) => ({ ...current, material: value }))
                }
                options={MATERIAL_OPTIONS}
              />
            </div>

            <hr className="border-t border-rule" />

            {/* --------------------------------------------------------- 4 */}
            {/* A group rather than a fieldset: <legend> cannot participate in
                the flex column, and this label is the same two-line block the
                selects above use. */}
            <div
              role="group"
              aria-labelledby="config-options-label"
              className="flex flex-col gap-4"
            >
              <p id="config-options-label">
                <StepLabel
                  step="ETAPE 04"
                  title="Options additionnelles du protocole"
                />
              </p>
              <div className="flex flex-col gap-3">
                {OPTIONS.map((entry) => {
                  const on = config.options.includes(entry.id);
                  return (
                    <label
                      key={entry.id}
                      className={`flex items-center gap-4 rounded-xl bg-surface-tint p-4 transition-colors duration-(--duration-fast) has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-marker ${
                        entry.locked ? "cursor-default" : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={on}
                        disabled={entry.locked}
                        onChange={() => toggleOption(entry)}
                      />
                      <Mark on={on} />
                      <span className="min-w-0 flex-1 font-display text-fine font-medium text-ink">
                        {entry.label}
                      </span>
                      <span
                        className={`shrink-0 text-right font-display text-fine whitespace-nowrap ${
                          entry.locked ? "text-included" : "text-ink"
                        }`}
                      >
                        {formatDelta(entry)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Below lg the recap card sits after the steps, so the running
                total would be off-screen exactly while you are changing it.
                This bar keeps the number in view; the full card is still
                below, unchanged. */}
            <div className="sticky bottom-0 -mx-8 -mb-8 flex items-center justify-between gap-4 rounded-b-xl border-t border-rule bg-surface px-8 py-3 lg:hidden">
              <div className="min-w-0">
                <p className="font-body text-fine leading-[1.1] text-ink-faint uppercase">
                  Estimation
                </p>
                <p className="font-display text-title leading-display font-semibold tracking-tight text-ink">
                  {total === null ? EMPTY : formatMAD(total)}
                </p>
              </div>
              <Button
                href="#envoyer-un-cas"
                shape="pill"
                onClick={stamp}
                className="[--accent-ink:var(--color-neutral-0)] [--accent:var(--color-blue-500)]"
              >
                Envoyer mon cas
              </Button>
            </div>
          </div>

          {/* Recap — sticky beside the steps from lg up. */}
          <aside
            className={`${CARD} flex flex-col gap-6 lg:sticky lg:top-28 lg:w-[353px] lg:shrink-0`}
          >
            <div className="flex flex-col gap-2">
              <p className="font-display text-fine leading-[1.1] text-marker uppercase">
                Votre pack
              </p>
              <p className="font-display text-title leading-display font-medium tracking-tight text-ink">
                Récapitulatif provisoire
              </p>
            </div>

            <hr className="border-t border-rule" />

            <dl className="flex flex-col gap-3.5 font-display text-fine">
              <RecapRow term="Type de cas" value={caseType?.recapLabel ?? null} />
              <RecapRow
                term="Marque implantaire"
                value={brand ? (brand.recapLabel ?? brand.label) : null}
              />
              <RecapRow
                term="Matériau prothèse"
                value={material ? (material.recapLabel ?? material.label) : null}
              />
              <RecapRow
                term="Options actives"
                value={
                  optionCount
                    ? `${optionCount} sélectionnée${optionCount > 1 ? "s" : ""}`
                    : null
                }
              />
            </dl>

            <hr className="border-t border-rule" />

            <div className="flex flex-col gap-1.5">
              <p className="font-body text-fine leading-[1.1] text-ink-faint uppercase">
                Estimation du pack complet
              </p>
              {/* GSAP owns this node's text after mount — see the tween above. */}
              <p
                ref={totalRef}
                aria-hidden
                className="font-display text-heading leading-display font-semibold tracking-tight text-ink"
              >
                {EMPTY}
              </p>
              {/* The figure a screen reader gets: announced once it settles,
                  not on every frame of the tween. */}
              <p aria-live="polite" className="sr-only">
                {total === null
                  ? "Estimation du pack complet : en attente des trois premiers choix."
                  : `Estimation du pack complet : ${formatMAD(total)}`}
              </p>
              <p className="font-display text-fine text-ink-faint italic">
                * Tarification indicative réservée exclusivement aux
                professionnels cliniciens inscrits à l&apos;Ordre.
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-3">
              <Button
                href="#envoyer-un-cas"
                shape="pill"
                onClick={stamp}
                className="w-full [--accent-ink:var(--color-neutral-0)] [--accent:var(--color-blue-500)]"
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
                Envoyer mon cas
              </Button>
              <Button
                href="#demander-un-appel"
                variant="ghost"
                shape="pill"
                onClick={stamp}
                className="w-full"
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
                Demander un appel conseil
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
