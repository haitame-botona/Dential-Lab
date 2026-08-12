import Image from "next/image";

/**
 * The system's tick box: 20px, green once the thing it fronts is on.
 *
 * Shared by the configurator's step-4 options and the rows inside a Select, so
 * "this one is chosen" looks identical wherever it is said.
 */
export function Mark({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`grid size-5 shrink-0 place-items-center rounded-[5px] transition-colors duration-(--duration-fast) ${
        on ? "bg-confirm" : "border-[1.25px] border-blue-200 bg-surface"
      } ${className}`}
    >
      {on ? (
        <Image
          src="/icons/check-on-accent.svg"
          alt=""
          width={12}
          height={9}
          className="block"
        />
      ) : null}
    </span>
  );
}
