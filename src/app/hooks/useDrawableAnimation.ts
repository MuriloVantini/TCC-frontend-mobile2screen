/**
 * useDrawableAnimation
 *
 * Anima os paths SVG filhos de um elemento contêiner usando anime.js
 * `svg.createDrawable`, desenhando cada traço do zero até 100%.
 * Opcionalmente anima elementos de texto com fade + slide.
 *
 * @param containerRef       - Ref para o elemento que contém os SVGs/paths.
 * @param options.selector    - Seletor CSS para os elementos SVG. Padrão: "path, rect, line, circle, polyline, polygon".
 * @param options.textSelector - Seletor CSS para elementos de texto a animar.
 * @param options.duration    - Duração de cada traço em ms. Padrão: 900.
 * @param options.staggerMs   - Atraso entre cada path em ms. Padrão: 150.
 * @param options.ease        - Easing da animação. Padrão: "inOutQuad".
 * @param options.deps        - Dependências extras do useEffect. Padrão: [].
 */

import { useEffect, type RefObject } from "react";
import { animate, svg, stagger, splitText } from "animejs";

export interface UseDrawableAnimationOptions {
    selector?: string;
    textSelector?: string;
    duration?: number;
    staggerMs?: number;
    ease?: string;
    deps?: unknown[];
}

export function useDrawableAnimation(
    containerRef: RefObject<Element | null>,
    options: UseDrawableAnimationOptions = {}
) {
    const {
        selector = "path, rect, line, circle, polyline, polygon",
        textSelector,
        duration = 900,
        staggerMs = 150,
        ease = "inOutQuad",
        deps = [],
    } = options;

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const paths = Array.from(container.querySelectorAll<SVGPathElement>(selector));

        if (paths.length) {
            const drawables = paths.map((p) => svg.createDrawable(p)[0]);
            animate(drawables, {
                draw: ["0 0", "0 1"],
                ease,
                duration,
                delay: stagger(staggerMs),
            });
        }

        if (textSelector) {
            const textEls = Array.from(container.querySelectorAll<HTMLElement>(textSelector));
            if (textEls.length) {
                const textDelay = paths.length > 0 ? duration * 0.4 : 0;
                const chars = textEls.flatMap((el) => splitText(el, { chars: true }).chars);
                animate(chars, {
                    opacity: [0, 1],
                    translateY: ["0.5em", 0],
                    duration: 400,
                    delay: (_: unknown, i: number) => textDelay + i * 5,
                    ease,
                });
            }
        }
    }, deps);
}
