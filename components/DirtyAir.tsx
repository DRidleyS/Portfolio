"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function DirtyAir() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const createParticle = () => {
      if (!containerRef.current) return;

      const particle = document.createElement("div");
      particle.className = "absolute rounded-full pointer-events-none";

      // Random size between 1-4px
      const size = Math.random() * 3 + 1;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // Random starting position along bottom
      const startX = Math.random() * 100;
      particle.style.left = `${startX}%`;
      particle.style.bottom = "-10px";

      // Random gray/ash color with low opacity
      const darkness = Math.floor(Math.random() * 100 + 100);
      particle.style.backgroundColor = `rgb(${darkness}, ${darkness}, ${darkness})`;
      particle.style.opacity = `${Math.random() * 0.3 + 0.1}`;

      // Add subtle glow
      particle.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, 0.1)`;

      containerRef.current.appendChild(particle);

      // Animate upward with drift
      const duration = Math.random() * 15 + 10; // 10-25 seconds
      const drift = (Math.random() - 0.5) * 200; // -100 to 100px horizontal drift
      const wobble = Math.random() * 30 + 20; // wobble amplitude

      let wobbleAnim: gsap.core.Tween | undefined;

      gsap.to(particle, {
        y: -(window.innerHeight + 100),
        x: `+=${drift}`,
        opacity: 0,
        duration: duration,
        ease: "none",
        onComplete: () => {
          wobbleAnim?.kill();
          particle.remove();
        },
      });

      // Add subtle horizontal wobble
      wobbleAnim = gsap.to(particle, {
        x: `+=${wobble}`,
        duration: Math.random() * 3 + 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    };

    // Create initial batch of particles
    for (let i = 0; i < 30; i++) {
      setTimeout(() => createParticle(), Math.random() * 2000);
    }

    // Continuously create new particles
    const interval = setInterval(() => {
      createParticle();
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      style={{
        mixBlendMode: "screen",
      }}
    />
  );
}
