import { useEffect, useRef, type RefObject } from "react";
import { animate } from "animejs";

export interface UseAnimatedCounterOptions {
  /** Duração da animação de contagem em ms. Padrão: 1200. */
  duration?: number;
  /** String de easing do Animejs. Padrão: "outExpo". */
  ease?: string;
  /** Adicionado após o número (ex.: "%"). Padrão: "". */
  suffix?: string;
  /**
   * Formatador de número personalizado. Quando fornecido, `suffix` é ignorado.
   * Recebe o valor animado atual e retorna a string de exibição.
   * Exemplo: (v) => Math.round(v).toLocaleString("pt-BR")
   */
  format?: (val: number) => string;
}

/**
 * Anima um contador numérico de 0 → value sempre que `value` muda.
 * Retorna uma ref que deve ser anexada ao elemento cujo textContent
 * será atualizado a cada frame da animação.
 */
export function useAnimatedCounter<T extends HTMLElement = HTMLParagraphElement>(
  value: number,
  options: UseAnimatedCounterOptions = {}
): RefObject<T | null> {
  const { duration = 1200, ease = "outExpo", suffix = "" } = options;
  const ref = useRef<T>(null);

  // Mantém o format estável entre renders sem adicioná-lo às deps.
  const formatRef = useRef(options.format);
  formatRef.current = options.format;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obj = { val: 0 };
    const anim = animate(obj, {
      val: value,
      duration,
      ease,
      onUpdate: () => {
        const fmt = formatRef.current;
        el.textContent = fmt ? fmt(obj.val) : Math.round(obj.val) + suffix;
      },
    });

    return () => {
      anim.pause();
    };
  }, [value, duration, ease, suffix]);

  return ref;
}