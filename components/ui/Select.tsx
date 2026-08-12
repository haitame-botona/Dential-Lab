"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { duration, ease } from "@/lib/motion";
import { Mark } from "@/components/ui/Mark";

/**
 * A one-of-many picker with the site's own chrome.
 *
 * A native <select> would be less code, but its menu is drawn by the OS: grey
 * system rows, system type, system radius. Nothing about it can be brought in
 * line with the cards it sits inside. So the trigger stays a button and the
 * menu is a real listbox — which means this file owns the keyboard contract
 * the platform used to give us for free:
 *
 *   ↓ ↑ Home End   move through the options (real focus, not aria-activedescendant)
 *   Enter / Space  open, then commit the focused option
 *   Escape         close and hand focus back to the trigger
 *   a–z            type-ahead, same as a native select
 *   Tab            closes rather than trapping — the menu is not a dialog
 */

export type SelectOption = {
  value: string;
  label: string;
  /**
   * The detail the old comparison table carried — positioning, what a material
   * is for. It lives in the menu only: once chosen, the trigger shows the
   * label alone, because the card beside it already recaps the decision.
   */
  notes?: string[];
  /** Right-hand value slot — what this option does to the pack's price. */
  trailing?: { text: string; included?: boolean };
};

type SelectProps = {
  id: string;
  /** id of the element whose text names this control. */
  labelledBy: string;
  value: string | null;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder: string;
};

/** How long a type-ahead run stays open before it starts a new search. */
const TYPEAHEAD_RESET = 600;

export function Select({
  id,
  labelledBy,
  value,
  onChange,
  options,
  placeholder,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const typed = useRef({ query: "", at: 0 });

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = selectedIndex === -1 ? null : options[selectedIndex];

  const focusOption = (index: number) => {
    const clamped = Math.max(0, Math.min(index, options.length - 1));
    optionRefs.current[clamped]?.focus();
  };

  /** Open, then land on the current answer — or the top if there isn't one. */
  const openAt = (index = selectedIndex === -1 ? 0 : selectedIndex) => {
    setOpen(true);
    // The panel is inert until React paints `open`, so the focus has to wait
    // a frame — otherwise it lands on an element that cannot take it.
    requestAnimationFrame(() => focusOption(index));
  };

  const close = (returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const commit = (option: SelectOption) => {
    onChange(option.value);
    close();
  };

  // Anywhere else on the page: dismiss, and leave focus where it was clicked.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useGSAP(
    () => {
      const panel = panelRef.current;
      if (!panel) return;

      const still = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches;

      gsap.to(panel, {
        autoAlpha: open ? 1 : 0,
        y: open ? 0 : -6,
        duration: still ? 0 : open ? duration.fast : duration.fast * 0.75,
        ease: ease.outQuart,
      });
    },
    { dependencies: [open] },
  );

  /**
   * Jump to the first option starting with what has just been typed. `at` is
   * the event's own timeStamp rather than a clock read, which keeps this
   * function pure enough for the React compiler.
   */
  const typeAhead = (key: string, at: number) => {
    typed.current = {
      query:
        at - typed.current.at > TYPEAHEAD_RESET
          ? key
          : typed.current.query + key,
      at,
    };
    const match = options.findIndex((option) =>
      option.label.toLowerCase().startsWith(typed.current.query.toLowerCase()),
    );
    if (match !== -1) focusOption(match);
  };

  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
      case "Enter":
      case " ":
        event.preventDefault();
        openAt();
        break;
      case "ArrowUp":
        event.preventDefault();
        openAt(options.length - 1);
        break;
      // Focus can still be on the trigger with the menu open — a type-ahead
      // that matched nothing, for one — so Escape has to be handled here too.
      case "Escape":
        if (open) {
          event.preventDefault();
          setOpen(false);
        }
        break;
      case "Tab":
        setOpen(false);
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          event.preventDefault();
          const { key, timeStamp } = event;
          setOpen(true);
          requestAnimationFrame(() => typeAhead(key, timeStamp));
        }
    }
  };

  const onOptionKeyDown = (event: React.KeyboardEvent, index: number) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        focusOption(index + 1);
        break;
      case "ArrowUp":
        event.preventDefault();
        focusOption(index - 1);
        break;
      case "Home":
        event.preventDefault();
        focusOption(0);
        break;
      case "End":
        event.preventDefault();
        focusOption(options.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        commit(options[index]);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        // Let the browser move on; just don't leave the menu hanging open.
        close(false);
        break;
      default:
        if (event.key.length === 1 && /\S/.test(event.key)) {
          event.preventDefault();
          typeAhead(event.key, event.timeStamp);
        }
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-labelledby={`${labelledBy} ${id}`}
        onClick={() => (open ? close() : openAt())}
        onKeyDown={onTriggerKeyDown}
        className={`flex h-[54px] w-full cursor-pointer items-center gap-2 rounded-xl border bg-surface px-4 text-left font-display text-fine tracking-tighter transition-colors duration-(--duration-fast) focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-marker ${
          open ? "border-marker" : "border-ink/[0.06] hover:border-ink/15"
        } ${selected ? "text-ink" : "text-ink/50"}`}
      >
        <span className="min-w-0 flex-1 truncate">
          {selected?.label ?? placeholder}
        </span>
        <Image
          src="/icons/chevron-down.svg"
          alt=""
          width={11}
          height={6}
          aria-hidden
          className={`shrink-0 transition-transform duration-(--duration-fast) ease-(--ease-out-quart) ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Kept mounted so it can tween both ways; `inert` keeps the closed menu
          out of the tab order and off the accessibility tree. */}
      <div
        ref={panelRef}
        inert={!open}
        className="invisible absolute top-full left-0 z-20 mt-2 w-full rounded-xl border border-ink/[0.06] bg-surface p-1.5 opacity-0 shadow-[0_4px_36px_rgba(0,0,0,0.08)]"
      >
        {/* Lenis owns the page's wheel events and would scroll the section
            instead of this list without the opt-out. */}
        <ul
          id={`${id}-listbox`}
          role="listbox"
          aria-labelledby={labelledBy}
          data-lenis-prevent
          className="flex max-h-[264px] flex-col gap-0.5 overflow-y-auto"
        >
          {options.map((option, index) => {
            const on = option.value === value;
            return (
              <li
                key={option.value}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                role="option"
                aria-selected={on}
                tabIndex={-1}
                onClick={() => commit(option)}
                onKeyDown={(event) => onOptionKeyDown(event, index)}
                className={`flex cursor-pointer items-start gap-4 rounded-lg p-3 font-display text-fine tracking-tighter transition-colors duration-(--duration-fast) outline-none hover:bg-surface-tint focus-visible:bg-surface-tint focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-marker ${
                  on ? "bg-surface-tint" : ""
                }`}
              >
                <Mark on={on} className="mt-px" />
                {/* Weight separates the label from its notes, not opacity —
                    the notes are the detail the choice is made on, so they
                    have to read as body copy rather than as a watermark. */}
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="font-medium text-ink">{option.label}</span>
                  {option.notes?.length ? (
                    <span className="text-ink-subtle">
                      {option.notes.join(" · ")}
                    </span>
                  ) : null}
                </span>
                {option.trailing ? (
                  <span
                    className={`shrink-0 text-right whitespace-nowrap ${
                      option.trailing.included ? "text-included" : "text-ink"
                    }`}
                  >
                    {option.trailing.text}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
