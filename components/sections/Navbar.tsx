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

/** Figma 16:57 / 16:58 — 1×24 hairline, near-black at 12% in hard-light. */
function Divider() {
  return (
    <span
      aria-hidden
      className="hidden h-6 w-px shrink-0 bg-[#090909]/12 mix-blend-hard-light md:block"
    />
  );
}

/**
 * Floating pill nav (Figma node 3:77). It is a sibling frame layered over the
 * Hero, horizontally centred and 32px from the top — it has no full-bleed bar,
 * only a translucent blurred capsule. It scrolls away with the page rather than
 * sticking.
 */
export function Navbar() {
  /**
   * Over the hero and the (dark) stats block the pill is barely-there glass.
   * Once the stats section clears the top of the viewport the page turns light
   * behind it, so it fills in solid black to keep the white type legible.
   */
  const [solid, setSolid] = useState(false);

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
      onEnter: () => setSolid(true),
      onLeaveBack: () => setSolid(false),
    });

    return () => trigger.kill();
  }, []);

  return (
    <header
      data-theme="dark"
      className="fixed inset-x-0 top-8 z-50 flex justify-center px-gutter"
    >
      <div
        className={`flex items-center gap-6 rounded-lg py-2 pr-2 pl-3 backdrop-blur-[6px] transition-colors duration-(--duration-base) ease-(--ease-out-quart) ${
          solid ? "bg-black" : "bg-black/12"
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
                  className="font-display text-fine tracking-tighter text-ink transition-opacity duration-(--duration-fast) hover:opacity-70"
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
          Envoyer un cas
        </Button>
      </div>
    </header>
  );
}
