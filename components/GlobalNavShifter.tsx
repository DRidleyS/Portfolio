"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import gsap from "gsap";

type Route = "home" | "projects" | "about" | "contact" | "resume" | "github";

interface GateConfig {
  route: Route;
  x: number;
  y: number;
  color: string;
  label: string;
}

const gates: GateConfig[] = [
  { route: "home", x: -30, y: -40, color: "#ff0000", label: "Home" },
  { route: "projects", x: 0, y: -40, color: "#ff6600", label: "Projects" },
  { route: "about", x: 30, y: -40, color: "#3b82f6", label: "About" },
  { route: "contact", x: -30, y: 40, color: "#22c55e", label: "Contact" },
  { route: "resume", x: 0, y: 40, color: "#a855f7", label: "Resume" },
  { route: "github", x: 30, y: 40, color: "#ffffff", label: "GitHub" },
];

export default function GlobalNavShifter() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentRoute, setCurrentRoute] = useState<Route>("projects");
  const [isDragging, setIsDragging] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const shifterKnobRef = useRef<HTMLDivElement>(null);
  const fadeOverlayRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const currentDelta = useRef({ x: 0, y: 0 });

  // Initialize knob position based on current route
  useEffect(() => {
    const gate = gates.find((g) => pathname.includes(g.route));
    if (gate && shifterKnobRef.current) {
      currentDelta.current = { x: gate.x, y: gate.y };
      gsap.set(shifterKnobRef.current, { x: gate.x, y: gate.y });
      setCurrentRoute(gate.route);
    }
  }, [pathname]);

  const handleShifterDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - currentDelta.current.x,
      y: e.clientY - currentDelta.current.y,
    };
  };

  const handleShifterDrag = (e: MouseEvent) => {
    if (!isDragging || !shifterKnobRef.current) return;

    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;

    currentDelta.current = { x: deltaX, y: deltaY };

    gsap.to(shifterKnobRef.current, {
      x: Math.max(-30, Math.min(30, deltaX)),
      y: Math.max(-40, Math.min(40, deltaY)),
      duration: 0.1,
    });
  };

  const handleShifterDragEnd = () => {
    setIsDragging(false);

    if (!shifterKnobRef.current) return;

    const deltaX = currentDelta.current.x;
    const deltaY = currentDelta.current.y;

    // Find closest gate
    let closestGate = gates[0];
    let minDistance = Infinity;

    gates.forEach((gate) => {
      const dx = deltaX - gate.x;
      const dy = deltaY - gate.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < minDistance) {
        minDistance = distance;
        closestGate = gate;
      }
    });

    // Snap to closest gate
    gsap.to(shifterKnobRef.current, {
      x: closestGate.x,
      y: closestGate.y,
      duration: 0.2,
      ease: "power2.out",
    });

    currentDelta.current = { x: closestGate.x, y: closestGate.y };

    // Navigate if route changed
    if (closestGate.route !== currentRoute) {
      navigateToRoute(closestGate.route);
    }
  };

  const navigateToRoute = (route: Route) => {
    if (isFading) return;

    // For resume and github, open immediately on user gesture (fixes mobile popup blocking)
    if (route === "resume") {
      window.open("/resume.pdf", "_blank", "noopener,noreferrer");
      return;
    }
    if (route === "github") {
      window.open(
        "https://github.com/DRidleyS",
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }

    setIsFading(true);
    setCurrentRoute(route);

    // Fade to black for internal routes
    if (fadeOverlayRef.current) {
      gsap.to(fadeOverlayRef.current, {
        opacity: 1,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          // Navigate based on route
          if (route === "home") {
            router.push("/");
          } else if (route === "projects") {
            router.push("/projects");
          } else if (route === "about") {
            router.push("/about");
          } else if (route === "contact") {
            router.push("/contact");
          }
        },
      });
    }
  };

  const fadeFromBlack = () => {
    if (fadeOverlayRef.current) {
      gsap.to(fadeOverlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
        onComplete: () => {
          setIsFading(false);
        },
      });
    }
  };

  // Fade from black after route change
  useEffect(() => {
    if (isFading) {
      const timer = setTimeout(fadeFromBlack, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, isFading]);

  // Touch drag handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    dragStartPos.current = {
      x: touch.clientX - currentDelta.current.x,
      y: touch.clientY - currentDelta.current.y,
    };
  };
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging || !shifterKnobRef.current) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStartPos.current.x;
    const deltaY = touch.clientY - dragStartPos.current.y;
    currentDelta.current = { x: deltaX, y: deltaY };
    gsap.to(shifterKnobRef.current, {
      x: Math.max(-30, Math.min(30, deltaX)),
      y: Math.max(-40, Math.min(40, deltaY)),
      duration: 0.1,
    });
  };
  const handleTouchEnd = () => {
    setIsDragging(false);
    if (!shifterKnobRef.current) return;
    const deltaX = currentDelta.current.x;
    const deltaY = currentDelta.current.y;
    let closestGate = gates[0];
    let minDistance = Infinity;
    gates.forEach((gate) => {
      const dx = deltaX - gate.x;
      const dy = deltaY - gate.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < minDistance) {
        minDistance = distance;
        closestGate = gate;
      }
    });
    gsap.to(shifterKnobRef.current, {
      x: closestGate.x,
      y: closestGate.y,
      duration: 0.2,
      ease: "power2.out",
    });
    currentDelta.current = { x: closestGate.x, y: closestGate.y };
    if (closestGate.route !== currentRoute) {
      navigateToRoute(closestGate.route);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleShifterDrag);
      window.addEventListener("mouseup", handleShifterDragEnd);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      window.removeEventListener("mousemove", handleShifterDrag);
      window.removeEventListener("mouseup", handleShifterDragEnd);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging]);

  // Get current gate color for knob glow
  const currentGate = gates.find((g) => g.route === currentRoute);
  const glowColor = currentGate?.color || "#ff0000";

  return (
    <>
      {/* Fade overlay */}
      <div
        ref={fadeOverlayRef}
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          opacity: 0,
          pointerEvents: isFading ? "all" : "none",
          zIndex: 9999,
        }}
      />

      {/* Shifter component - always visible */}
      <div
        style={{
          position: "fixed",
          bottom: "32px",
          right: "32px",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100px",
            height: "150px",
            background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
            border: "4px solid #000",
            borderRadius: "8px",
            boxShadow: "inset 0 4px 20px rgba(0, 0, 0, 0.9)",
          }}
        >
          {/* H-pattern gate guide */}
          <svg
            className="absolute inset-2"
            viewBox="0 0 100 140"
            style={{ pointerEvents: "none" }}
          >
            <path
              d="M 20 35 L 20 55 M 50 20 L 50 120 M 80 35 L 80 55 M 20 85 L 20 105 M 80 85 L 80 105"
              stroke="#333"
              strokeWidth="3"
              fill="none"
            />
          </svg>

          {/* Shift knob */}
          <div
            ref={shifterKnobRef}
            onMouseDown={handleShifterDragStart}
            onTouchStart={handleTouchStart}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing"
            style={{
              width: "36px",
              height: "52px",
            }}
          >
            {/* Shift stick */}
            <div
              className="absolute left-1/2 -translate-x-1/2 w-2 h-14 rounded-full"
              style={{
                background: "linear-gradient(180deg, #888 0%, #444 100%)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.8)",
              }}
            />

            {/* Shift knob ball */}
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full transition-all duration-200"
              style={{
                background: `radial-gradient(circle, ${glowColor} 0%, ${glowColor}cc 100%)`,
                border: "2px solid #000",
                boxShadow: `0 0 15px ${glowColor}99, 0 4px 10px rgba(0,0,0,0.8)`,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
