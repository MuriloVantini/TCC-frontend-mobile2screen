/**
 * useGridAnimation
 *
 * Hook React inspirado em Codrops GridLoadingAnimations
 * (https://github.com/codrops/GridLoadingAnimations).
 *
 * Anima os filhos diretos (ou um `selector` personalizado) de um elemento
 * contêiner sempre que o array `deps` fornecido muda, exatamente como a
 * biblioteca original dispara um efeito quando uma grade é carregada/filtrada.
 *
 * Efeitos disponíveis (nomeados segundo a nomenclatura original de deuses egípcios):
 *   hapi   – escala + fade, duração escalonada por item   (pop-in suave)
 *   amun   – translateY de baixo + fade                   (deslizar para cima)
 *   kek    – translateX da esquerda + inclinação rotateZ  (deslizar com inclinação)
 *   isis   – entrada aleatória de qualquer borda          (explosão caótica)
 *   ra     – queda com translateY e quique elástico       (queda saltitante)
 *   seket  – escala 0.8→1 + translateY sutil              (zoom suave)
 */

import { useEffect, type RefObject } from "react";
import { animate, stagger } from "animejs";

export type GridEffect = "hapi" | "amun" | "kek" | "isis" | "ra" | "seket";

export interface UseGridAnimationOptions {
  /** Variante de animação. Padrão: "amun". */
  effect?: GridEffect;
  /**
   * Seletor CSS (relativo ao contêiner) usado para coletar os itens.
   * Padrão: ":scope > *" (filhos diretos).
   */
  selector?: string;
  /**
   * Array de dependências – mesma semântica que os deps do useEffect.
   * A animação é reexecutada sempre que um desses valores muda.
   * Passe um array vazio [] para executar apenas na montagem.
   */
  deps?: unknown[];
}

export function useGridAnimation(
  containerRef: RefObject<Element | null>,
  options: UseGridAnimationOptions = {}
) {
  const { effect = "amun", selector = ":scope > *", deps = [] } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const items = Array.from(
      container.querySelectorAll<HTMLElement>(selector)
    );
    if (!items.length) return;

    // Reseta a visibilidade para que a animação sempre comece do zero.
    items.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "";
    });

    switch (effect) {
      /**
       * Hapi – escala [0→1] + opacidade, duração cresce por índice do item.
       * O mais próximo do efeito original "Hapi".
       */
      case "hapi":
        animate(items, {
          scale: [0, 1],
          opacity: [0, 1],
          duration: (_: unknown, i: number) => 600 + i * 75,
          delay: stagger(50),
          ease: "outExpo",
        });
        break;

      /**
       * Amun – translateY 40px → 0 + fade, ordenado da esquerda para a direita.
       * O mais próximo do efeito original "Amun".
       */
      case "amun":
        animate(items, {
          translateY: [40, 0],
          opacity: [0, 1],
          duration: (_: unknown, i: number) => 480 + i * 40,
          delay: stagger(40),
          ease: "outExpo",
        });
        break;

      /**
       * Kek – desliza da esquerda com uma inclinação no sentido horário.
       * Semelhante ao efeito original "Kek".
       */
      case "kek":
        animate(items, {
          translateX: [-56, 0],
          rotateZ: [10, 0],
          opacity: [0, 1],
          duration: 800,
          delay: stagger(25),
          ease: "cubicBezier(.1,1,.3,1)",
        });
        break;

      /**
       * Isis – cada item irrompe de uma direção cardinal aleatória.
       * Pré-definimos o transform inicial aleatório e então animamos até a origem.
       * Inspirado no efeito original "Isis".
       */
      case "isis":
        items.forEach((el) => {
          const x = Math.random() > 0.5 ? 90 : -90;
          const y = Math.random() > 0.5 ? 90 : -90;
          el.style.transform = `translateX(${x}px) translateY(${y}px)`;
        });
        animate(items, {
          translateX: 0,
          translateY: 0,
          opacity: [0, 1],
          duration: 900,
          delay: stagger(20),
          ease: "spring(1, 80, 12, 0)",
        });
        break;

      /**
       * Ra – os itens caem de cima e quicam elasticamente.
       * Adaptação simplificada do efeito original "Ra".
       */
      case "ra":
        animate(items, {
          translateY: [60, 0],
          scale: [0.7, 1],
          opacity: [0, 1],
          duration: 1000,
          delay: stagger(80),
          ease: "outElastic(1, .5)",
        });
        break;

      /**
       * Seket – escala sutil de 0.8→1 com um leve translateY.
       * O mais próximo do efeito original "Seket/Sobek".
       */
      case "seket":
        animate(items, {
          scale: [0.82, 1],
          translateY: [20, 0],
          opacity: [0, 1],
          duration: 520,
          delay: stagger(45),
          ease: "cubicBezier(.7,0,.3,1)",
        });
        break;
    }
    // Efeito orientado por deps – regra de lint intencionalmente suprimida.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}