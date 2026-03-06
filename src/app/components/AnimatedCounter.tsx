import { useAnimatedCounter, type UseAnimatedCounterOptions } from "../hooks/useAnimatedCounter";

interface Props extends UseAnimatedCounterOptions {
  value: number;
  className?: string;
}

/**
 * Exibe um número que anima de 0 → value na montagem ou quando value muda.
 * Wrapper simples em torno de useAnimatedCounter.
 */
export function AnimatedCounter({
  value,
  className = "text-xl font-semibold text-slate-800",
  ...options
}: Props) {
  const ref = useAnimatedCounter<HTMLParagraphElement>(value, options);
  const initial = options.format ? options.format(0) : `0${options.suffix ?? ""}`;
  return (
    <p ref={ref} className={className}>
      {initial}
    </p>
  );
}