"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ScrollTrigger, useGSAP } from "@/lib/gsap";
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
 * Floating pill nav (Figma node 19:932). It is a sibling frame layered over the
 * Hero, horizontally centred and 32px from the top — it has no full-bleed bar,
 * only a capsule. It stays fixed and swaps between two states as the page
 * changes colour behind it.
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

  return (
    <header
      data-theme={light ? "light" : "dark"}
      className="fixed inset-x-0 top-8 z-50 flex justify-center px-gutter"
    >
      <div
        className={`flex items-center gap-6 rounded-full py-2 pr-2 pl-4 backdrop-blur-[6px] transition-[background-color,box-shadow] duration-(--duration-base) ease-(--ease-out-quart) ${
          light
            ? // The CTA is the one button on the page that is blue rather than
              // black, so it is expressed as a local accent override instead of
              // a one-off Button variant.
              "bg-surface shadow-[0_4px_72px_-10px_rgba(0,0,0,0.09)] [--accent-ink:var(--color-neutral-0)] [--accent:var(--color-blue-600)]"
            : "bg-black/12"
        }`}
      >
        <Link
          href="/"
          className="flex h-8 items-center gap-[6px]"
          aria-label="Dential — accueil"
        >
          <Image
            src="/icons/logo-glyph.svg"
            alt=""
            width={23.46}
            height={22.87}
            priority
            className="block"
          />
          <span className="font-body text-[23px] leading-none font-medium tracking-tighter text-ink">
            Dential
          </span>
        </Link>

        <Divider />

        <nav aria-label="Navigation principale">
          <ul className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="font-display text-fine tracking-tighter text-ink-subtle transition-opacity duration-(--duration-fast) hover:opacity-70 dark:text-ink"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <Divider />

        <Button
          href="#envoyer-un-cas"
          variant="solid"
          shape="pill"
          icon={
            <span className="flex size-[14px] shrink-0 items-center justify-center">
              {/* The chevron ships with its stroke baked in, so the two states
                  need two exports rather than a currentColor swap. */}
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
      </div>
    </header>
  );
}
