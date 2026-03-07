import { createElement, useEffect, type CSSProperties, type ReactNode, type RefObject } from "react";
import { animate, stagger } from "animejs";

export type SubmitState = "idle" | "loading" | "success" | "error";

export function useFormSubmitAnimation(cardRef: RefObject<HTMLElement | null>, tab: string) {
  useEffect(() => {
    animate(cardRef.current!, {
      translateY: [30, 0],
      opacity: [0, 1],
      duration: 700,
      ease: "outExpo",
    });
    animate(".form-field", {
      translateX: [-12, 0],
      opacity: [0, 1],
      delay: stagger(70, { start: 250 }),
      ease: "outQuad",
    });
  }, [tab]);

  const shakeCard = () => {
    animate(cardRef.current!, {
      translateX: [-10, 10, -8, 8, -4, 4, 0],
      duration: 500,
      ease: "inOutSine",
    });
  };

  return { shakeCard };
}

export function useMorphButton(state: SubmitState, idleContent: ReactNode) {
  const morphStyle: CSSProperties = {
    width: state === "idle" ? "100%" : "48px",
    borderRadius: state === "idle" ? "12px" : "9999px",
    transition:
      "width 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), border-radius 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), background-color 0.35s ease",
  };

  const morphContent: ReactNode =
    state === "idle" ? idleContent
    : state === "loading" ? createElement("svg", { className: "animate-spin", viewBox: "0 0 24 24", fill: "none", width: 22, height: 22 },
        createElement("circle", { cx: "12", cy: "12", r: "9", stroke: "rgba(255,255,255,0.25)", strokeWidth: "2.5" }),
        createElement("path", { d: "M12 3a9 9 0 0 1 9 9", stroke: "white", strokeWidth: "2.5", strokeLinecap: "round" })
      )
    : state === "success" ? createElement("svg", { viewBox: "0 0 24 24", fill: "none", width: 22, height: 22 },
        createElement("path", { d: "M5 13l4 4L19 7", stroke: "white", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round" })
      )
    : createElement("svg", { viewBox: "0 0 24 24", fill: "none", width: 22, height: 22 },
        createElement("path", { d: "M8 8l8 8M16 8l-8 8", stroke: "white", strokeWidth: "2.5", strokeLinecap: "round" })
      );

  return { morphStyle, morphContent };
}
