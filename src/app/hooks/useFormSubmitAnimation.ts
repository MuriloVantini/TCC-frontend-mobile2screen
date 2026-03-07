import { useEffect, type RefObject } from "react";
import { animate, stagger } from "animejs";

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
