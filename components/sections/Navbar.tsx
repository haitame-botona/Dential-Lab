"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { duration, ease } from "@/lib/motion";
import { useLenis } from "@/components/providers/SmoothScroll";
import { Button } from "@/components/ui/Button";

const links = [
  { label: "Le pack", href: "#le-pack" },
  { label: "Packs & Tarifs", href: "#packs-et-tarifs" },
  { label: "Garantie", href: "#garantie" },
  { label: "Configurateur", href: "#configurateur" },
];

/**
 * Figma 19:898 / 19:920 — 1×20 hairline, near-black in hard-light. It sits at
 * 8% on the white pill and 12% on the glass one, where it has more to cut
 * through.
 */
function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-5 w-px shrink-0 bg-[#090909]/8 mix-blend-hard-light md:block dark:bg-[#090909]/12"
    />
  );
}

/**
 * The mobile toggle's glyph — ≡ closed (Figma 26:251 / 26:142), × open
 * (26:116). Both exports ship with their stroke baked in, so the pale disc's
 * two themes need two files rather than a currentColor swap.
 *
 * The pair is stacked and cross-faded instead of swapped on src: a swap would
 * blink, and the quarter-turn each one takes on the way through carries the
 * change without either glyph ever being redrawn mid-flight.
 */
function ToggleGlyph({ open, light }: { open: boolean; light: boolean }) {
  const layer =
    "absolute inset-0 grid place-items-center transition-[opacity,transform] duration-(--duration-base) ease-(--ease-out-quart)";

  return (
    <span aria-hidden className="relative block size-3.5">
      <span className={`${layer} ${open ? "rotate-90 opacity-0" : ""}`}>
        <Image
          src={light ? "/icons/menu-ink.svg" : "/icons/menu.svg"}
          alt=""
          width={10}
          height={8}
          className="block"
        />
      </span>
      <span className={`${layer} ${open ? "" : "-rotate-90 opacity-0"}`}>
        <Image
          src={light ? "/icons/close-ink.svg" : "/icons/close.svg"}
          alt=""
          width={8}
          height={8}
          className="block"
        />
      </span>
    </span>
  );
}

/**
 * Floating pill nav (Figma node 19:932). It is a sibling frame layered over the
 * Hero, horizontally centred and 32px from the top — it has no full-bleed bar,
 * only a capsule. It stays fixed and swaps between two states as the page
 * changes colour behind it.
 *
 * Below md the links do not fit, so the capsule carries a toggle and unfolds
 * downwards into the stacked menu of Figma 26:63 / 26:122 — same shell, same
 * padding, only the radius opens up and the list grows in underneath.
 */
export function Navbar() {
  /**
   * Figma gives the pill two states. Over the hero and the (dark) stats block
   * it is the "Dark" one: barely-there glass, white type. Once the stats
   * section clears the top of the viewport the page turns light behind it, so
   * it becomes the "Light" one — opaque white, lifted off the page by a wide
   * soft shadow, with the type inverted and the CTA switching to blue.
   */
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);
  const lenisRef = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const stats = document.querySelector("#stats");
    if (!stats) return;

    const trigger = ScrollTrigger.create({
      trigger: stats,
      // A line, not a range: crossing it downwards fills the pill in, crossing
      // back up empties it. Deliberately NOT a range ending at the document
      // bottom — refresh measures the document while pinned sections are
      // reverted, so any height-derived end lands mid-page and the pill would
      // drop back to glass as soon as it got there.
      start: "bottom top",
      end: "+=1",
      onEnter: () => setLight(true),
      onLeaveBack: () => setLight(false),
    });

    return () => trigger.kill();
  }, []);

  /**
   * The pill grows downwards out of its own bottom edge, then folds back the
   * way it came.
   *
   * height: "auto" is GSAP's job rather than a CSS grid-template-rows trick —
   * it measures the panel each time, so the tween is a real px ramp on one
   * eased curve instead of a fraction the browser re-resolves per frame.
   *
   * Opening, the edge leads and the links follow it down, top to bottom.
   * Closing runs that film backwards: the links go first and from the bottom
   * up — the same direction the retracting edge crops them, so they are
   * already going as it reaches them — and the edge only sets off once they
   * have. The 100ms lead and 50ms gap are both under the threshold where a
   * pause reads as a separate event; the order registers, the waiting does
   * not.
   */
  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      const rows = panel.querySelectorAll("li");
      const lead = 0.1;
      const gap = 0.05;

      gsap.to(panel, {
        height: open ? "auto" : 0,
        duration: duration.base,
        ease: ease.outQuart,
        // Closing, the panel waits for the links instead of leading them.
        delay: open ? 0 : lead,
        overwrite: true,
      });

      gsap.to(rows, {
        opacity: open ? 1 : 0,
        y: open ? 0 : -8,
        duration: open ? duration.base : duration.fast,
        ease: ease.outQuart,
        stagger: { each: gap, from: open ? "start" : "end" },
        delay: open ? lead : 0,
        overwrite: true,
      });
    },
    { dependencies: [open] },
  );

  /**
   * Freeze the page behind the open menu.
   *
   * Lenis owns the scroll position, so stop() is the honest lock — it parks
   * the animated position instead of letting it drift, and its own
   * .lenis-stopped rule takes care of the native overflow. When Lenis is
   * absent (reduced motion leaves scrolling native) the same lock is applied
   * by hand.
   */
  useEffect(() => {
    if (!open) return;

    // Read at lock time, not during render: the provider fills the ref in its
    // own effect, which React runs after this component's.
    const lenis = lenisRef.current;

    if (lenis) {
      lenis.stop();
    } else {
      document.documentElement.style.overflow = "hidden";
    }

    return () => {
      if (lenis) {
        lenis.start();
      } else {
        document.documentElement.style.overflow = "";
      }
    };
  }, [open, lenisRef]);

  // Escape closes, and so does growing past md — the menu is hidden there, so
  // leaving it "open" would strand the scroll lock with nothing to show for it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const desktop = window.matchMedia("(min-width: 48rem)");
    const onChange = () => {
      if (desktop.matches) setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onChange);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onChange);
    };
  }, [open]);

  return (
    <header
      data-theme={light ? "light" : "dark"}
      className="fixed inset-x-0 top-8 z-50 px-gutter"
    >
      {/* The scrim sinks behind the pill inside the header's own stacking
          context, so it dims and blurs the whole page but never the menu. */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 -z-10 bg-neutral-950/50 backdrop-blur-md transition-opacity duration-(--duration-base) ease-(--ease-out-quart) md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <div className="flex justify-center">
        <div
          // Below md the links are hidden, so a content-width pill would float
          // in the middle of an empty bar — it spans the gutter instead, logo
          // against one edge and the controls against the other.
          // On mobile the pill floats over content in both states, so it
          // carries Figma 26:122's lift (0 4px 36px) whatever the theme.
          // Desktop keeps Figma's own rule — the wide 72px lift belongs to the
          // white pill only; the glass one sits flat on the hero.
          className={`flex w-full flex-col py-2 pr-2 pl-4 shadow-[0_4px_36px_rgba(0,0,0,0.09)] backdrop-blur-[6px] transition-[background-color,box-shadow,border-radius] duration-(--duration-base) ease-(--ease-out-quart) md:w-auto md:rounded-full ${
            // The closed pill is 60px tall, so a full round is a 30px corner —
            // spelling it out means opening only has to travel the 6px to
            // Figma's 24px, and the capsule appears to stretch rather than to
            // square off. rounded-full would instead re-resolve that corner to
            // half the growing height on every frame.
            open ? "rounded-3xl" : "rounded-[30px]"
          } ${
            light
              ? // The CTA is the one button on the page that is blue rather than
                // black, so it is expressed as a local accent override instead of
                // a one-off Button variant.
                "bg-surface md:shadow-[0_4px_72px_-10px_rgba(0,0,0,0.09)] [--accent-ink:var(--color-neutral-0)] [--accent:var(--color-blue-600)]"
              : "bg-black/12 md:shadow-none"
          }`}
        >
          <div className="flex w-full items-center justify-between gap-2 md:justify-center md:gap-6">
            <Link
              href="/"
              className="flex h-8 shrink-0 items-center gap-[6px]"
              aria-label="Dential Lab — accueil"
            >
              <Image
                src="/icons/logo-glyph.svg"
                alt=""
                width={23.46}
                height={22.87}
                priority
                className="block"
              />
              {/* Logo, CTA and toggle need 309px between the gutters; a 390px
                  screen is the narrowest that clears it. Under that the
                  wordmark drops and the glyph carries the brand, rather than
                  the lockup squeezing into the CTA. */}
              <span className="hidden items-baseline gap-1 font-body font-medium min-[390px]:flex">
                <span className="text-[23px] leading-none tracking-tighter text-ink">
                  Dential
                </span>
                {/* The one blue that survives the light state; on glass it goes
                    white with the rest of the wordmark. */}
                <span className="text-[12px] leading-[1.1] text-blue-500 uppercase dark:text-ink">
                  lab
                </span>
              </span>
            </Link>

            <Divider />

            <nav aria-label="Navigation principale" className="hidden md:block">
              <ul className="flex items-center gap-6">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      // On the white pill the hover is the brand blue; on the
                      // glass one there is no blue to reach for, so it keeps
                      // the fade.
                      className="font-display text-fine tracking-tighter text-ink-subtle transition-[color,opacity] duration-(--duration-fast) hover:text-blue-500 dark:text-ink dark:hover:text-ink dark:hover:opacity-70"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <Divider />

            <div className="flex h-11 items-center gap-3">
              <Button
                href="#envoyer-un-cas"
                variant="solid"
                shape="pill"
                icon={
                  <span className="flex size-[14px] shrink-0 items-center justify-center">
                    {/* The chevron ships with its stroke baked in, so the two
                        states need two exports rather than a currentColor swap. */}
                    <Image
                      src={
                        light
                          ? "/icons/arrow-up-right-on-accent.svg"
                          : "/icons/arrow-up-right.svg"
                      }
                      alt=""
                      width={5}
                      height={8}
                      className="block"
                    />
                  </span>
                }
              >
                Envoyer un cas
              </Button>

              <button
                type="button"
                onClick={() => setOpen((wasOpen) => !wasOpen)}
                aria-expanded={open}
                aria-controls="menu-mobile"
                aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                // Figma 26:141 / 26:250. On the white pill it is a pale disc
                // (#f9f9f9, which --surface-raised already carries); on the
                // glass one it turns to glass itself — white at 12% — so the
                // white glyph reads against the page behind rather than
                // against the button.
                className="grid size-11 shrink-0 place-items-center rounded-full bg-surface-raised transition-colors duration-(--duration-fast) ease-(--ease-out-quart) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:hidden dark:bg-white/12"
              >
                <ToggleGlyph open={open} light={light} />
              </button>
            </div>
          </div>

          {/* Height is GSAP's, so it starts at 0 inline — no first-paint flash
              of a full-height menu before the mount tween can collapse it. */}
          <div
            id="menu-mobile"
            ref={panelRef}
            style={{ height: 0 }}
            className="overflow-hidden md:hidden"
          >
            <nav aria-label="Navigation mobile">
              <ul className="flex flex-col gap-6 pt-6 pr-3 pb-3">
                {links.map((link) => (
                  <li key={link.href} className="opacity-0">
                    <a
                      href={link.href}
                      onClick={() => setOpen(false)}
                      tabIndex={open ? undefined : -1}
                      className="flex items-center justify-between py-2 font-display text-label tracking-tighter text-ink"
                    >
                      {link.label}
                      <span className="flex size-4 shrink-0 items-center justify-center">
                        <Image
                          src={
                            light
                              ? "/icons/arrow-up-right.svg"
                              : "/icons/arrow-up-right-on-accent.svg"
                          }
                          alt=""
                          width={5}
                          height={9}
                          className="block"
                        />
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
