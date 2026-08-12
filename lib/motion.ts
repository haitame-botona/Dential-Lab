/**
 * Motion tokens shared by CSS and GSAP.
 *
 * The CSS side lives in app/globals.css (--ease-*, --duration-*). GSAP cannot
 * parse a cubic-bezier() string, so the same curves are expressed here in
 * GSAP's own ease syntax. Change one, change the other.
 */
export const ease = {
  /** matches --ease-out-expo */
  outExpo: "expo.out",
  /** matches --ease-out-quart */
  outQuart: "quart.out",
} as const;

export const duration = {
  /** matches --duration-fast */
  fast: 0.2,
  /** matches --duration-base */
  base: 0.4,
  /** matches --duration-slow */
  slow: 0.9,
} as const;
