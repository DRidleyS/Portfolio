"use client";

import { useRef } from "react";
import gsap from "gsap";

interface FlickerButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function FlickerButton({
  children,
  href,
  onClick,
  className = "",
}: FlickerButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flickerIntervalRef = useRef<number | null>(null);

  const flickerButton = (btn: HTMLButtonElement) => {
    gsap
      .timeline()
      .to(btn, {
        backgroundColor: "rgba(255, 138, 0, 0.15)",
        borderColor: "#ff8a00",
        boxShadow:
          "0 0 10px rgba(255, 138, 0, 0.4), inset 0 0 10px rgba(255, 138, 0, 0.15)",
        duration: 0.22,
        ease: "steps(1)",
      })
      .to(btn, {
        backgroundColor: "transparent",
        borderColor: "#ffffff",
        boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
        duration: 0.06,
        ease: "steps(1)",
      })
      .to(btn, {
        backgroundColor: "rgba(255, 138, 0, 0.2)",
        borderColor: "#ff8a00",
        boxShadow:
          "0 0 14px rgba(255, 138, 0, 0.5), inset 0 0 12px rgba(255, 138, 0, 0.18)",
        duration: 0.15,
        ease: "steps(1)",
      })
      .to(btn, {
        backgroundColor: "transparent",
        borderColor: "#ffffff",
        boxShadow: "0 0 0px rgba(0, 0, 0, 0)",
        duration: 0.04,
        ease: "steps(1)",
      })
      .to(btn, {
        backgroundColor: "rgba(255, 138, 0, 0.35)",
        borderColor: "#ff8a00",
        boxShadow:
          "0 0 22px rgba(255, 138, 0, 0.7), inset 0 0 18px rgba(255, 138, 0, 0.25)",
        duration: 0.35,
        ease: "steps(1)",
      })
      .to(btn, {
        backgroundColor: "rgba(255, 138, 0, 0.15)",
        borderColor: "#ff8a00",
        boxShadow:
          "0 0 15px rgba(255, 138, 0, 0.5), inset 0 0 15px rgba(255, 138, 0, 0.2)",
        duration: 0.25,
        ease: "steps(1)",
      });
  };

  const handleMouseEnter = () => {
    if (!buttonRef.current) return;
    const btn = buttonRef.current;

    flickerButton(btn);

    if (flickerIntervalRef.current) {
      window.clearInterval(flickerIntervalRef.current);
    }
    flickerIntervalRef.current = window.setInterval(() => {
      if (buttonRef.current) {
        flickerButton(buttonRef.current);
      }
    }, 8000);
  };

  const handleMouseLeave = () => {
    if (!buttonRef.current) return;

    if (flickerIntervalRef.current) {
      window.clearInterval(flickerIntervalRef.current);
      flickerIntervalRef.current = null;
    }

    gsap.to(buttonRef.current, {
      backgroundColor: "transparent",
      borderColor: "#ffffff",
      boxShadow: "0 0 0px rgba(0,0,0,0)",
      duration: 0.3,
      ease: "power2.out",
    });
  };

  const button = (
    <button
      ref={buttonRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`px-8 py-3 bg-transparent border-2 border-white rounded-md text-xl font-semibold transition-all ${className}`}
      style={{
        textShadow:
          "0 0 8px rgba(255, 255, 255, 0.8), 0 0 15px rgba(255, 255, 255, 0.4)",
      }}
    >
      {children}
    </button>
  );

  if (href) {
    return <a href={href}>{button}</a>;
  }

  return button;
}
