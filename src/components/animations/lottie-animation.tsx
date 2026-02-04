"use client";

import { useEffect, useRef } from "react";
import Lottie, { LottieRefCurrentProps } from "lottie-react";

interface LottieAnimationProps {
  animationData: any;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  speed?: number;
}

export function LottieAnimation({
  animationData,
  className = "",
  loop = true,
  autoplay = true,
  speed = 1,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    if (lottieRef.current && autoplay) {
      lottieRef.current.play();
    }
  }, [autoplay]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={loop}
      autoplay={autoplay}
      speed={speed}
      className={className}
    />
  );
}
