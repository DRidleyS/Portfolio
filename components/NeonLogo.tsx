"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";

interface NeonLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function NeonLogo({
  className = "",
  size = "md",
}: NeonLogoProps) {
  const neonRef = useRef<HTMLDivElement>(null);
  const flickerTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!neonRef.current) return;

    const flicker = () => {
      if (!neonRef.current) return;
      const tl = gsap.timeline();

      // Random flicker pattern
      tl.to(neonRef.current, {
        opacity: 0.4,
        duration: 0.05,
        ease: "steps(1)",
      })
        .to(neonRef.current, {
          opacity: 1,
          duration: 0.08,
          ease: "steps(1)",
        })
        .to(neonRef.current, {
          opacity: 0.3,
          duration: 0.03,
          ease: "steps(1)",
        })
        .to(neonRef.current, {
          opacity: 1,
          duration: 0.1,
          ease: "steps(1)",
        });

      // Random delay before next flicker (3-8 seconds)
      const nextFlicker = 3000 + Math.random() * 5000;
      flickerTimeoutRef.current = window.setTimeout(flicker, nextFlicker);
    };

    // Start flickering after initial delay
    flickerTimeoutRef.current = window.setTimeout(flicker, 2000);

    return () => {
      if (flickerTimeoutRef.current) {
        window.clearTimeout(flickerTimeoutRef.current);
      }
      if (neonRef.current) {
        gsap.killTweensOf(neonRef.current);
      }
    };
  }, []);

  const sizeClasses = {
    sm: "text-2xl sm:text-3xl",
    md: "text-3xl sm:text-4xl md:text-5xl",
    lg: "text-5xl sm:text-6xl md:text-7xl",
    xl: "text-6xl sm:text-7xl md:text-8xl",
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background glow */}
      <div
        className="absolute inset-0 blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(ellipse, rgba(239, 68, 68, 0.6), transparent 70%)",
        }}
      />
      <div
        ref={neonRef}
        className={`relative ${sizeClasses[size]} font-mono tracking-widest text-center`}
        style={{
          color: "#ff3333",
          textShadow: `
            0 0 7px #fff,
            0 0 10px #fff,
            0 0 21px #fff,
            0 0 42px #ff3333,
            0 0 82px #ff3333,
            0 0 92px #ff3333,
            0 0 102px #ff3333,
            0 0 151px #ff3333
          `,
          fontWeight: 300,
          letterSpacing: "0.3em",
        }}
      >
        {"{R|S}"}
      </div>
    </div>
  );
}
