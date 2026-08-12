import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** Trailing icon, sized by the caller to 14px. */
  icon?: ReactNode;
  /** "ghost" is a secondary action with no chrome at all — type and icon only. */
  variant?: "solid" | "outline" | "ghost";
  /**
   * "pill" is the nav's capsule (Figma 19:905 / 19:927) — fully rounded with
   * uniform 12px padding so it reads as a 44px lozenge inside the nav pill.
   * It is a prop rather than a caller-supplied className because radius and
   * padding would otherwise race the base classes in the cascade.
   */
  shape?: "default" | "pill";
  className?: string;
  /** Runs before the anchor's own jump — for side effects, not navigation. */
  onClick?: () => void;
};

const variants = {
  solid: "bg-accent text-accent-ink hover:bg-accent/90",
  outline: "border border-border-subtle text-ink hover:bg-ink/10",
  ghost: "text-ink-muted hover:bg-ink/5",
} as const;

const shapes = {
  default: "rounded-sm px-3 py-2",
  pill: "rounded-full p-3",
} as const;

export function Button({
  href,
  children,
  icon,
  variant = "solid",
  shape = "default",
  className = "",
  onClick,
}: ButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 font-display text-fine font-medium tracking-tighter whitespace-nowrap transition-colors duration-(--duration-fast) ease-(--ease-out-quart) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${shapes[shape]} ${variants[variant]} ${className}`}
    >
      {children}
      {icon}
    </a>
  );
}
