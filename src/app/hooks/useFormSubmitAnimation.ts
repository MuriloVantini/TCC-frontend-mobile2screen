import { useEffect, type CSSProperties, type RefObject } from "react";
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

export function useMorphButton(state: SubmitState) {
  const morphStyle: CSSProperties = {
    width: state === "idle" ? "100%" : "48px",
    height: "48px",
    borderRadius: state === "idle" ? "12px" : "9999px",
    transition:
      "width 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), border-radius 0.5s cubic-bezier(0.68,-0.55,0.27,1.55), background-color 0.35s ease",
  };

  const morphClass = `overflow-hidden text-white font-medium text-sm ${
    state === "success"
      ? "bg-emerald-500 hover:bg-emerald-500"
      : state === "error"
      ? "bg-red-500 hover:bg-red-500"
      : "bg-blue-600 hover:bg-blue-700"
  }`;

  return { morphStyle, morphClass };
}
