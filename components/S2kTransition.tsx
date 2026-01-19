"use client";

import { useRef, forwardRef, useImperativeHandle } from "react";
import gsap from "gsap";

export interface S2KTransitionHandle {
  play: (onComplete?: () => void) => void;
}

const S2KTransition = forwardRef<S2KTransitionHandle>(function S2KTransition(
  _,
  ref
) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tachRef = useRef<HTMLDivElement[]>([]);
  const shiftRef = useRef<HTMLDivElement[]>([]);
  const speedRef = useRef<HTMLDivElement>(null);

  const setTachRef = (el: HTMLDivElement | null, i: number) => {
    if (el) tachRef.current[i] = el;
  };

  const setShiftRef = (el: HTMLDivElement | null, i: number) => {
    if (el) shiftRef.current[i] = el;
  };

  useImperativeHandle(ref, () => ({
    play(onComplete) {
      const tl = gsap.timeline();

      // Fade in overlay
      tl.set(overlayRef.current, { display: "flex" }).fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );

      // Tach sweep
      tl.to(tachRef.current, {
        backgroundColor: "#ff2d2d",
        duration: 0.03,
        stagger: 0.03,
      });

      // Shift lights
      tl.to(
        shiftRef.current,
        {
          backgroundColor: "#ffea00",
          duration: 0.1,
          stagger: 0.05,
        },
        "-=0.2"
      ).to(shiftRef.current, {
        backgroundColor: "#222",
        duration: 0.15,
      });

      // Speed flicker
      tl.fromTo(speedRef.current, { opacity: 0 }, { opacity: 1, duration: 0.1 })
        .to(speedRef.current, { textContent: "88", duration: 0.15 })
        .to(speedRef.current, { textContent: "00", duration: 0.15 })
        .to(speedRef.current, { textContent: "{R|S}", duration: 0.3 });

      // Fade out overlay
      tl.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        delay: 0.2,
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = "none";
          if (onComplete) onComplete();
        },
      });
    },
  }));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[9999] bg-black flex-col items-center justify-center hidden"
    >
      {/* Tach Bar */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => setTachRef(el, i)}
            className="w-4 h-3 bg-[#222] rounded-sm"
          />
        ))}
      </div>

      {/* Shift Lights */}
      <div className="flex gap-2 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => setShiftRef(el, i)}
            className="w-3 h-3 bg-[#222] rounded-full"
          />
        ))}
      </div>

      {/* Speed Readout */}
      <div
        ref={speedRef}
        className="text-6xl font-mono tracking-widest text-red-500"
      >
        00
      </div>
    </div>
  );
});

S2KTransition.displayName = "S2KTransition";

export default S2KTransition;
