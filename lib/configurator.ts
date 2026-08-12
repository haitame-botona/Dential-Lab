/**
 * The configurator's entire commercial model.
 *
 * Every label, every price and every default the section renders lives in this
 * file — the component below it is presentational. Repricing the pack means
 * editing numbers here and nothing else.
 *
 * Money is stored as whole MAD integers, never floats: these are round
 * quotes, and integer arithmetic keeps the running total exact.
 */

/** A step-1 case type. `base` is the whole pack before any modifier. */
export type CaseType = {
  id: string;
  label: string;
  /** Shortened for the recap column, which is far narrower than a pill. */
  recapLabel: string;
  base: number;
};

/** A row in steps 2–4. `delta` shifts the base; 0 means the pack covers it. */
export type Choice = {
  id: string;
  label: string;
  recapLabel?: string;
  delta: number;
  /**
   * Covered by the pack AND not optional — the row renders "Inclus d'office"
   * in clay and cannot be switched off. Distinct from a delta of 0 that the
   * clinician chose (rendered as a plain "Inclus").
   */
  locked?: boolean;
};

// ---------------------------------------------------------------------------
// PLACEHOLDER PRICING — replace with the lab's real rate card.
//
// Only `unitaire` is real: 14 200 MAD is the figure in the design, and it is
// the total the design shows for the default configuration (Marque B + zircone
// monolithique + no paid options), so every modifier below nets to zero there.
// The other three bases are scaled guesses, NOT quotes.
// ---------------------------------------------------------------------------

export const CASE_TYPES: CaseType[] = [
  {
    id: "unitaire",
    label: "Unitaire simple (Couronne)",
    recapLabel: "Unitaire simple",
    base: 14_200,
  },
  {
    id: "bridge",
    label: "Bridge transvissé (2-4 éléments)",
    recapLabel: "Bridge transvissé",
    base: 26_000, // PLACEHOLDER
  },
  {
    id: "all-on-4",
    label: "All-on-4 complet transvissé",
    recapLabel: "All-on-4 complet",
    base: 58_000, // PLACEHOLDER
  },
  {
    id: "all-on-6",
    label: "All-on-6 complet transvissé",
    recapLabel: "All-on-6 complet",
    base: 74_000, // PLACEHOLDER
  },
];

/** Step 2 carries two extra descriptive columns the other steps don't have. */
export type ImplantBrand = Choice & {
  positioning: string;
  recommendedFor: string;
};

export const IMPLANT_BRANDS: ImplantBrand[] = [
  {
    id: "marque-a",
    label: "Marque A (Swiss Premium)",
    recapLabel: "Marque A (Suisse)",
    positioning: "Haut de gamme",
    recommendedFor: "Exigence esthétique & osseuse maximale",
    delta: 3_500,
  },
  {
    id: "marque-b",
    label: "Marque B (Référence Allemande)",
    recapLabel: "Marque B (Allemande)",
    positioning: "Standard Clinique",
    recommendedFor: "Excellente traçabilité, cas général",
    delta: 0,
    locked: true,
  },
  {
    id: "marque-c",
    label: "Marque C (Accessible Méditerranéen)",
    recapLabel: "Marque C (Méditerranéen)",
    positioning: "Optimisé Budget",
    recommendedFor: "Secteur postérieur, impératifs économiques",
    delta: -1_800,
  },
  {
    id: "conseil",
    label: "Laissez-nous vous recommander",
    recapLabel: "Sur recommandation",
    positioning: "Proposition clinique",
    recommendedFor: "Notre chirurgien conseil sélectionne l'optimal",
    delta: 0,
  },
];

/** Step 3 rows carry a one-line technical note under the label. */
export type Material = Choice & { note: string };

export const MATERIALS: Material[] = [
  {
    id: "zircone-mono",
    label: "Zircone monolithique",
    note: "Translucidité de base (1200 MPa)",
    delta: 0,
  },
  {
    id: "zircone-hd",
    label: "Zircone multicouche HD",
    note: "Dégradé de teinte ultra-naturel",
    delta: 900,
  },
  {
    id: "ceramique",
    label: "Céramique stratifiée",
    note: "Montage manuel sur zircone (Antérieur)",
    delta: 1_600,
  },
  {
    id: "cera-metal",
    label: "Céramo-métallique (Co-Cr)",
    note: "Technique conventionnelle robuste",
    delta: -700,
  },
  {
    id: "emax",
    label: "E.max sur Ti-Base",
    note: "Disilicate de lithium collé",
    delta: 1_200,
  },
  {
    id: "pmma",
    label: "PMMA Provisoire armé",
    note: "Validation temporaire esthétique",
    delta: 600,
  },
];

export const OPTIONS: Choice[] = [
  {
    id: "indexation",
    label: "Indexation de l'angulation par clé résine imprimée (Chirurgie)",
    delta: 0,
    locked: true,
  },
  {
    id: "express",
    label: "Livraison express en clinique sous 24h ouvrées (Logistique)",
    delta: 450,
  },
  {
    id: "maquillage",
    label: "Maquillage prothétique d'après photos en ligne (Prothèse)",
    delta: 600,
  },
  {
    id: "contre-cle",
    label: "Contre-clé de transfert en plâtre synthétique (Prothèse)",
    delta: 300,
  },
];

/**
 * What the user has picked. Steps 1–3 are one-of-many, step 4 is a set.
 *
 * The first three are nullable because the configurator opens locked down:
 * nothing is pre-picked, so nothing is priced. `null` is "not answered yet",
 * which is what the recap renders as an em dash.
 */
export type Configuration = {
  caseType: string | null;
  brand: string | null;
  material: string | null;
  options: string[];
};

/**
 * Opening state. Steps 1–3 are unanswered — the clinician chooses from the
 * three selects before any figure appears, so the estimate is never a number
 * the lab did not actually agree to.
 *
 * Step 4 starts with only the locked option on. The mockup shows "Maquillage"
 * pre-ticked too, but a paid add-on that arrives already selected quietly
 * inflates the first price the clinician sees, so it starts off. Add its id
 * here if the lab does want it opted-in by default.
 */
export const EMPTY_CONFIGURATION: Configuration = {
  caseType: null,
  brand: null,
  material: null,
  options: OPTIONS.filter((option) => option.locked).map((option) => option.id),
};

const byId = <T extends { id: string }>(list: T[], id: string | null) =>
  list.find((entry) => entry.id === id) ?? null;

/** The running sum of the paid add-ons, which price on their own from step 1. */
const optionsTotal = (configuration: Configuration) =>
  OPTIONS.filter((option) => configuration.options.includes(option.id)).reduce(
    (sum, option) => sum + option.delta,
    0,
  );

/**
 * The pack estimate, or `null` while any of steps 1–3 is unanswered — a
 * partial configuration has no honest price, so it gets no number at all.
 */
export function computeTotal(configuration: Configuration): number | null {
  const caseType = byId(CASE_TYPES, configuration.caseType);
  const brand = byId(IMPLANT_BRANDS, configuration.brand);
  const material = byId(MATERIALS, configuration.material);
  if (!caseType || !brand || !material) return null;

  return (
    caseType.base + brand.delta + material.delta + optionsTotal(configuration)
  );
}

/** Everything the recap card renders, derived — never stored. */
export function summarise(configuration: Configuration) {
  return {
    caseType: byId(CASE_TYPES, configuration.caseType),
    brand: byId(IMPLANT_BRANDS, configuration.brand),
    material: byId(MATERIALS, configuration.material),
    optionCount: configuration.options.length,
    total: computeTotal(configuration),
  };
}

/**
 * "14 200" — French grouping, which uses a narrow no-break space. The unit is
 * appended by the caller so it can be styled or wrapped separately.
 */
const amount = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 });

export const formatMAD = (value: number) => `${amount.format(value)} MAD`;

/** A modifier as shown on its own row: "+3 500 MAD", "-1 800 MAD", "Inclus". */
export function formatDelta(choice: Choice): string {
  if (choice.locked) return "Inclus d'office";
  if (choice.delta === 0) return "Inclus";
  const sign = choice.delta > 0 ? "+" : "−";
  return `${sign}${formatMAD(Math.abs(choice.delta))}`;
}

/**
 * The configuration as query params, so the contact form downstream can read
 * back what was configured instead of the clinician retyping it.
 */
export function toSearchParams(configuration: Configuration): string {
  const params = new URLSearchParams();
  const entries = {
    cas: configuration.caseType,
    marque: configuration.brand,
    materiau: configuration.material,
    total: computeTotal(configuration)?.toString() ?? null,
  };
  for (const [key, value] of Object.entries(entries)) {
    if (value) params.set(key, value);
  }
  if (configuration.options.length) {
    params.set("options", configuration.options.join(","));
  }
  return params.toString();
}
