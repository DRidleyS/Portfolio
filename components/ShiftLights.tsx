"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface ShiftLightsProps {
  count?: number;
  className?: string;
}

export default function ShiftLights({
  count = 5,
  className = "",
}: ShiftLightsProps) {
  const shiftRef = useRef<HTMLDivElement[]>([]);

  const setShiftRef = (el: HTMLDivElement | null, i: number) => {
    if (el) shiftRef.current[i] = el;
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      return;
    }

    gsap.set(shiftRef.current, {
      backgroundColor: "#222",
      boxShadow: "0 0 0px rgba(0,0,0,0)",
      scale: 1,
    });

    const timeoutIds: number[] = [];

    const schedule = (fn: () => void, delayMs: number) => {
      const id = window.setTimeout(fn, delayMs);
      timeoutIds.push(id);
      return id;
    };

    const flash = (
      el: HTMLDivElement,
      {
        color,
        glow,
        onMs,
        offMs,
      }: { color: string; glow: string; onMs: number; offMs: number }
    ) => {
      return gsap
        .timeline({ defaults: { ease: "power2.out" } })
        .to(el, {
          backgroundColor: color,
          boxShadow: glow,
          duration: onMs / 1000,
        })
        .to(el, {
          backgroundColor: "#222",
          boxShadow: "0 0 0px rgba(0,0,0,0)",
          duration: offMs / 1000,
          ease: "power2.inOut",
        });
    };

    const pickFlashStyle = () => {
      // Mostly yellow, sometimes green/red for variety.
      const roll = Math.random();
      if (roll < 0.12) {
        return {
          color: "#00ff7b",
          glow: "0 0 12px rgba(0, 255, 123, 0.75)",
        };
      }
      if (roll < 0.2) {
        return {
          color: "#ff2d2d",
          glow: "0 0 12px rgba(255, 45, 45, 0.75)",
        };
      }
      return {
        color: "#ffea00",
        glow: "0 0 14px rgba(255, 234, 0, 0.85)",
      };
    };

    const blinkOnce = () => {
      const lights = shiftRef.current.filter(Boolean);
      if (lights.length === 0) return;

      gsap.killTweensOf(lights);

      const baseIdx = Math.floor(Math.random() * lights.length);
      const style = pickFlashStyle();

      const patternRoll = Math.random();
      const baseOnMs = Math.round(gsap.utils.random(45, 90, 1));
      const baseOffMs = Math.round(gsap.utils.random(120, 220, 1));

      if (patternRoll < 0.18) {
        const blips = patternRoll < 0.06 ? 3 : 2;
        const el = lights[baseIdx];
        const tl = gsap.timeline();
        for (let i = 0; i < blips; i++) {
          tl.add(
            flash(el, {
              color: style.color,
              glow: style.glow,
              onMs: baseOnMs,
              offMs: baseOffMs,
            }),
            i === 0 ? 0 : `>-${Math.round(gsap.utils.random(40, 90, 1)) / 1000}`
          );
        }
      } else if (patternRoll < 0.33) {
        const count = Math.random() < 0.6 ? 2 : 3;
        const indices: number[] = [];
        for (let i = 0; i < count; i++) {
          indices.push((baseIdx + i) % lights.length);
        }
        indices.forEach((idx, i) => {
          const el = lights[idx];
          schedule(() => {
            flash(el, {
              color: style.color,
              glow: style.glow,
              onMs: Math.round(baseOnMs * 0.9),
              offMs: Math.round(baseOffMs * 0.9),
            });
          }, i * Math.round(gsap.utils.random(55, 95, 1)));
        });
      } else {
        const el = lights[baseIdx];
        flash(el, {
          color: style.color,
          glow: style.glow,
          onMs: baseOnMs,
          offMs: baseOffMs,
        });
      }

      const nextDelaySeconds =
        Math.random() < 0.22
          ? gsap.utils.random(0.35, 1.1, 0.01)
          : gsap.utils.random(1.8, 6.5, 0.1);
      schedule(blinkOnce, nextDelaySeconds * 1000);
    };

    schedule(blinkOnce, 900);

    return () => {
      timeoutIds.forEach((id) => window.clearTimeout(id));
      gsap.killTweensOf(shiftRef.current);
    };
  }, []);

  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          ref={(el) => setShiftRef(el, i)}
          className="w-3 h-3 bg-[#222] rounded-full"
        />
      ))}
    </div>
  );
}
