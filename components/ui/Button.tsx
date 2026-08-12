import type { ReactNode } from "react";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** Trailing icon, sized by the caller to 14px. */
  icon?: ReactNode;
  variant?: "solid" | "outline";
  className?: string;
  /** Runs before the anchor's own jump — for side effects, not navigation. */
  onClick?: () => void;
};

const variants = {
  solid: "bg-accent text-accent-ink hover:bg-accent/90",
  outline: "border border-border-subtle text-ink hover:bg-ink/10",
} as const;

export function Button({
  href,
  children,
  icon,
  variant = "solid",
  className = "",
  onClick,
}: ButtonProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-sm px-3 py-2 font-display text-fine font-medium tracking-tighter whitespace-nowrap transition-colors duration-(--duration-fast) ease-(--ease-out-quart) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${variants[variant]} ${className}`}
    >
      {children}
      {icon}
    </a>
  );
}
