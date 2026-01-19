"use client";

import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { projects } from "../lib/projects";
import Link from "next/link";

export default function RacecarHeader() {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  const [coverOpen1, setCoverOpen1] = useState(false);
  const [coverOpen2, setCoverOpen2] = useState(false);
  const [coverOpen3, setCoverOpen3] = useState(false);
  const [coverOpen4, setCoverOpen4] = useState(false);
  const [switch1On, setSwitch1On] = useState(false);
  const [switch2On, setSwitch2On] = useState(false);
  const [invertColors, setInvertColors] = useState(false);
  const [currentGear, setCurrentGear] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const cover1Ref = useRef<HTMLDivElement>(null);
  const cover2Ref = useRef<HTMLDivElement>(null);
  const cover3Ref = useRef<HTMLDivElement>(null);
  const cover4Ref = useRef<HTMLDivElement>(null);
  const button1Ref = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const button2Ref = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const button3Ref = useRef<HTMLDivElement>(
    null
  ) as React.RefObject<HTMLDivElement>;
  const button4Ref = useRef<HTMLButtonElement>(null);
  const switch1Ref = useRef<HTMLDivElement>(null);
  const switch2Ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const shifterKnobRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const currentDelta = useRef({ x: 0, y: 0 });

  const toggleCover = (
    coverNum: number,
    isOpen: boolean,
    setter: (val: boolean) => void
  ) => {
    const coverRef =
      coverNum === 1
        ? cover1Ref
        : coverNum === 2
        ? cover2Ref
        : coverNum === 3
        ? cover3Ref
        : cover4Ref;

    if (!coverRef.current) return;

    if (!isOpen) {
      gsap.to(coverRef.current, {
        rotateX: -120,
        duration: 0.4,
        ease: "power2.out",
        transformOrigin: "top center",
      });
      setter(true);
    } else {
      gsap.to(coverRef.current, {
        rotateX: 0,
        duration: 0.3,
        ease: "power2.in",
        transformOrigin: "top center",
      });
      setter(false);
    }
  };

  const pressButton = (buttonRef: React.RefObject<HTMLDivElement>) => {
    if (!buttonRef.current) return;

    gsap.to(buttonRef.current, {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut",
    });
  };

  const togglePanel = (
    panelName: string,
    buttonRef: React.RefObject<HTMLDivElement>
  ) => {
    if (activePanel === panelName) {
      setActivePanel(null);
      if (panelRef.current) {
        gsap.to(panelRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
      }
    } else {
      setActivePanel(panelName);
      if (panelRef.current) {
        gsap.to(panelRef.current, {
          height: "calc(100vh - 180px)",
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    }
  };

  const handleInvertColors = () => {
    if (!coverOpen4) return;
    setInvertColors(!invertColors);

    if (!invertColors) {
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
    } else {
      document.documentElement.style.filter = "none";
    }
  };

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

    let newGear = 0;

    if (deltaY < -30) {
      if (deltaX < -20) newGear = 1;
      else if (deltaX > 20) newGear = 5;
      else newGear = 3;
    } else if (deltaY > 30) {
      if (deltaX < -20) newGear = 2;
      else if (deltaX > 20) newGear = 6;
      else newGear = 4;
    }

    setCurrentGear(newGear);

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

    let snapX = 0;
    let snapY = 0;
    let newGear = 0;

    if (Math.abs(deltaY) < 15 && Math.abs(deltaX) < 10) {
      snapX = 0;
      snapY = 0;
      newGear = 0;
    } else if (deltaY < -15) {
      snapY = -40;
      if (deltaX < -10) {
        snapX = -30;
        newGear = 1;
      } else if (deltaX > 10) {
        snapX = 30;
        newGear = 5;
      } else {
        snapX = 0;
        newGear = 3;
      }
    } else if (deltaY > 15) {
      snapY = 40;
      if (deltaX < -10) {
        snapX = -30;
        newGear = 2;
      } else if (deltaX > 10) {
        snapX = 30;
        newGear = 6;
      } else {
        snapX = 0;
        newGear = 4;
      }
    }

    setCurrentGear(newGear);

    gsap.to(shifterKnobRef.current, {
      x: snapX,
      y: snapY,
      duration: 0.2,
      ease: "power2.out",
    });

    dragStartPos.current = { x: 0, y: 0 };
    currentDelta.current = { x: snapX, y: snapY };
  };

  const toggleSwitch = (
    switchNum: number,
    isOn: boolean,
    setter: (val: boolean) => void
  ) => {
    const switchRef = switchNum === 1 ? switch1Ref : switch2Ref;
    if (!switchRef.current) return;

    setter(!isOn);
    gsap.to(switchRef.current, {
      y: isOn ? 0 : 10,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleShifterDrag);
      window.addEventListener("mouseup", handleShifterDragEnd);
    }

    return () => {
      window.removeEventListener("mousemove", handleShifterDrag);
      window.removeEventListener("mouseup", handleShifterDragEnd);
    };
  }, [isDragging]);

  useEffect(() => {
    // Update CSS variable for name color based on switches
    let nameColor = "#eab308"; // default yellow-500
    if (switch1On && switch2On) {
      nameColor = "#22c55e"; // green-500 when both on
    } else if (switch2On) {
      nameColor = "#3b82f6"; // blue-500
    } else if (switch1On) {
      nameColor = "#eab308"; // yellow-500
    }
    document.documentElement.style.setProperty("--name-color", nameColor);
  }, [switch1On, switch2On]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 border-b-2 border-neutral-700"
        style={{
          background: "linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.8)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-6">
              {/* Button 1 - About */}
              <div className="relative" style={{ perspective: "1000px" }}>
                <div
                  ref={cover1Ref}
                  className="absolute inset-0 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(180deg, #ff4444 0%, #cc0000 100%)",
                    borderRadius: "4px",
                    border: "3px solid #000",
                    transformStyle: "preserve-3d",
                    zIndex: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                  onClick={() => toggleCover(1, coverOpen1, setCoverOpen1)}
                />
                <div
                  className="relative transition-all"
                  style={{
                    width: "40px",
                    height: "80px",
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                    border: "4px solid #000",
                    borderRadius: "4px",
                    boxShadow: "inset 0 4px 20px rgba(0, 0, 0, 0.9)",
                    cursor: coverOpen1 ? "pointer" : "not-allowed",
                  }}
                  onClick={() => coverOpen1 && togglePanel("about", button1Ref)}
                >
                  <div
                    ref={button1Ref}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      width: "34px",
                      height: "36px",
                      top: activePanel === "about" ? "auto" : "6px",
                      bottom: activePanel === "about" ? "6px" : "auto",
                      background:
                        activePanel === "about"
                          ? "linear-gradient(165deg, #ff0000 0%, #aa0000 100%)"
                          : "linear-gradient(15deg, #555 0%, #2a2a2a 100%)",
                      border: "2px solid #000",
                      borderRadius: "4px",
                      boxShadow:
                        activePanel === "about"
                          ? "0 0 20px rgba(255, 0, 0, 0.8), inset 0 -2px 8px rgba(0,0,0,0.5)"
                          : "0 2px 6px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.1)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Button 2 - Projects */}
              <div className="relative" style={{ perspective: "1000px" }}>
                <div
                  ref={cover2Ref}
                  className="absolute inset-0 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(180deg, #4444ff 0%, #0000cc 100%)",
                    borderRadius: "4px",
                    border: "3px solid #000",
                    transformStyle: "preserve-3d",
                    zIndex: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                  onClick={() => toggleCover(2, coverOpen2, setCoverOpen2)}
                />
                <div
                  className="relative transition-all"
                  style={{
                    width: "40px",
                    height: "80px",
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                    border: "4px solid #000",
                    borderRadius: "4px",
                    boxShadow: "inset 0 4px 20px rgba(0, 0, 0, 0.9)",
                    cursor: coverOpen2 ? "pointer" : "not-allowed",
                  }}
                  onClick={() =>
                    coverOpen2 && togglePanel("projects", button2Ref)
                  }
                >
                  <div
                    ref={button2Ref}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      width: "34px",
                      height: "36px",
                      top: activePanel === "projects" ? "auto" : "6px",
                      bottom: activePanel === "projects" ? "6px" : "auto",
                      background:
                        activePanel === "projects"
                          ? "linear-gradient(165deg, #0000ff 0%, #0000aa 100%)"
                          : "linear-gradient(15deg, #555 0%, #2a2a2a 100%)",
                      border: "2px solid #000",
                      borderRadius: "4px",
                      boxShadow:
                        activePanel === "projects"
                          ? "0 0 20px rgba(0, 0, 255, 0.8), inset 0 -2px 8px rgba(0,0,0,0.5)"
                          : "0 2px 6px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.1)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Button 3 - Contact */}
              <div className="relative" style={{ perspective: "1000px" }}>
                <div
                  ref={cover3Ref}
                  className="absolute inset-0 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(180deg, #44ff44 0%, #00cc00 100%)",
                    borderRadius: "4px",
                    border: "3px solid #000",
                    transformStyle: "preserve-3d",
                    zIndex: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                  onClick={() => toggleCover(3, coverOpen3, setCoverOpen3)}
                />
                <div
                  className="relative transition-all"
                  style={{
                    width: "40px",
                    height: "80px",
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                    border: "4px solid #000",
                    borderRadius: "4px",
                    boxShadow: "inset 0 4px 20px rgba(0, 0, 0, 0.9)",
                    cursor: coverOpen3 ? "pointer" : "not-allowed",
                  }}
                  onClick={() =>
                    coverOpen3 && togglePanel("contact", button3Ref)
                  }
                >
                  <div
                    ref={button3Ref}
                    className="absolute left-1/2 -translate-x-1/2"
                    style={{
                      width: "34px",
                      height: "36px",
                      top: activePanel === "contact" ? "auto" : "6px",
                      bottom: activePanel === "contact" ? "6px" : "auto",
                      background:
                        activePanel === "contact"
                          ? "linear-gradient(165deg, #00ff00 0%, #00aa00 100%)"
                          : "linear-gradient(15deg, #555 0%, #2a2a2a 100%)",
                      border: "2px solid #000",
                      borderRadius: "4px",
                      boxShadow:
                        activePanel === "contact"
                          ? "0 0 20px rgba(0, 255, 0, 0.8), inset 0 -2px 8px rgba(0,0,0,0.5)"
                          : "0 2px 6px rgba(0,0,0,0.8), inset 0 1px 3px rgba(255,255,255,0.1)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-5 rounded-full"
                      style={{
                        background: "rgba(0,0,0,0.3)",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 ml-8">
              {/* Button 4 - Invert Colors */}
              <div className="relative" style={{ perspective: "1000px" }}>
                <div
                  ref={cover4Ref}
                  className="absolute inset-0 cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(180deg, #ffaa00 0%, #cc8800 100%)",
                    borderRadius: "8px",
                    border: "3px solid #000",
                    transformStyle: "preserve-3d",
                    zIndex: 10,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.6)",
                  }}
                  onClick={() => toggleCover(4, coverOpen4, setCoverOpen4)}
                />
                <button
                  ref={button4Ref}
                  onClick={handleInvertColors}
                  disabled={!coverOpen4}
                  className="w-20 h-20 rounded-lg transition-all relative"
                  style={{
                    background: invertColors
                      ? "radial-gradient(circle, #ffaa00 0%, #cc8800 100%)"
                      : "radial-gradient(circle, #666 0%, #333 100%)",
                    border: "4px solid #000",
                    boxShadow: invertColors
                      ? "0 0 25px rgba(255, 170, 0, 0.8), inset 0 3px 15px rgba(255, 255, 255, 0.2)"
                      : "inset 0 4px 20px rgba(0, 0, 0, 0.7)",
                    cursor: coverOpen4 ? "pointer" : "not-allowed",
                  }}
                >
                  <div
                    className="absolute inset-2 rounded border-2"
                    style={{
                      borderColor: invertColors ? "#fff" : "#555",
                      opacity: 0.5,
                    }}
                  />
                </button>
              </div>

              {/* H-Pattern Shifter */}
              <div className="relative flex items-center gap-3">
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: currentGear === 6 ? "#ff0000" : "#00ff00",
                    textShadow: `0 0 10px ${
                      currentGear === 6 ? "#ff0000" : "#00ff00"
                    }`,
                  }}
                >
                  {currentGear === 0
                    ? "N"
                    : currentGear === 6
                    ? "R"
                    : currentGear}
                </div>

                <div
                  className="relative w-24 h-32 rounded-lg"
                  style={{
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                    border: "4px solid #000",
                    boxShadow: "inset 0 4px 20px rgba(0, 0, 0, 0.9)",
                    overflow: "hidden",
                  }}
                >
                  {/* Shifter Gates */}
                  <svg className="absolute inset-2" viewBox="0 0 100 120">
                    <path
                      d="M 20 30 L 20 50 M 50 10 L 50 110 M 80 30 L 80 50 M 20 70 L 20 90 M 80 70 L 80 90"
                      stroke="#333"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                  {/* Shifter Knob */}
                  <div
                    ref={shifterKnobRef}
                    className="absolute left-1/2 top-1/2 w-10 h-10 rounded-full cursor-pointer select-none"
                    style={{
                      transform: `translate(-50%, -50%)`,
                      background:
                        "radial-gradient(circle, #f5f5f5 60%, #888 100%)",
                      border: "3px solid #444",
                      boxShadow: "0 2px 12px #000, 0 0 0 4px #8886",
                      zIndex: 2,
                      userSelect: "none",
                      touchAction: "none",
                      transition: "background 0.2s, box-shadow 0.2s",
                    }}
                    onMouseDown={handleShifterDragStart}
                  >
                    {/* metallic highlight */}
                    <div
                      className="absolute left-1/2 top-1/2 w-4 h-2 rounded-full"
                      style={{
                        transform: "translate(-50%, -120%) rotate(-20deg)",
                        background:
                          "linear-gradient(90deg, #fff 0%, #bbb 100%)",
                        opacity: 0.7,
                        filter: "blur(0.5px)",
                      }}
                    />
                    {/* subtle center shadow */}
                    <div
                      className="absolute left-1/2 top-1/2 w-3 h-3 rounded-full"
                      style={{
                        transform: "translate(-50%, -50%)",
                        background:
                          "radial-gradient(circle, #bbb 60%, #444 100%)",
                        opacity: 0.5,
                      }}
                    />
                  </div>
                </div>

                {/* Switch 1 */}
                <div
                  className="relative w-12 h-24 rounded-lg cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                    border: "3px solid #000",
                    boxShadow: "inset 0 4px 15px rgba(0, 0, 0, 0.8)",
                  }}
                  onClick={() => toggleSwitch(1, switch1On, setSwitch1On)}
                >
                  <div
                    ref={switch1Ref}
                    className="absolute left-1/2 -translate-x-1/2 w-8 h-12 rounded"
                    style={{
                      top: "6px",
                      background: switch1On
                        ? "linear-gradient(180deg, #fbbf24 0%, #ca8a04 100%)"
                        : "linear-gradient(180deg, #666 0%, #333 100%)",
                      border: "2px solid #000",
                      boxShadow: switch1On
                        ? "0 0 15px rgba(234, 179, 8, 0.8), 0 4px 8px rgba(0,0,0,0.6)"
                        : "0 4px 8px rgba(0,0,0,0.6)",
                    }}
                  />
                  {switch1On && (
                    <div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                      style={{
                        background: "#eab308",
                        boxShadow: "0 0 8px #eab308",
                      }}
                    />
                  )}
                </div>

                {/* Switch 2 */}
                <div
                  className="relative w-12 h-24 rounded-lg cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
                    border: "3px solid #000",
                    boxShadow: "inset 0 4px 15px rgba(0, 0, 0, 0.8)",
                  }}
                  onClick={() => toggleSwitch(2, switch2On, setSwitch2On)}
                >
                  <div
                    ref={switch2Ref}
                    className="absolute left-1/2 -translate-x-1/2 w-8 h-12 rounded"
                    style={{
                      top: "6px",
                      background: switch2On
                        ? "linear-gradient(180deg, #4444ff 0%, #0000aa 100%)"
                        : "linear-gradient(180deg, #666 0%, #333 100%)",
                      border: "2px solid #000",
                      boxShadow: switch2On
                        ? "0 0 15px rgba(68, 68, 255, 0.8), 0 4px 8px rgba(0,0,0,0.6)"
                        : "0 4px 8px rgba(0,0,0,0.6)",
                    }}
                  />
                  {switch2On && (
                    <div
                      className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
                      style={{
                        background: "#0000ff",
                        boxShadow: "0 0 8px #0000ff",
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="h-1"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, #444 50%, transparent 100%)",
          }}
        />
      </header>

      {/* Info Panel */}
      <div
        ref={panelRef}
        className="fixed top-21.25 left-0 right-0 z-40 overflow-y-auto"
        style={{
          height: 0,
          opacity: 0,
          background: "linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%)",
          borderBottom: "2px solid #444",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.9)",
        }}
      >
        <div className="max-w-5xl mx-auto px-8 pt-24 pb-12">
          {activePanel === "about" && (
            <div className="text-white min-h-[60vh]">
              <h2 className="text-3xl font-bold mb-4 text-red-500">About Me</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-neutral-300 mb-4 whitespace-pre-line">
                    I spent years in the trades building electrical
                    equipment—work that demanded precision, accountability, and
                    a deep understanding of how complex systems behave in the
                    real world.<br></br>
                    <br></br> That experience shaped how I learn and how I solve
                    problems: by doing the work, testing assumptions, and
                    building solutions that hold up under pressure.<br></br>
                    <br></br> Software engineering fits naturally into that
                    mindset. It’s a trade like any other—mastered through
                    repetition, real projects, and hands‑on problem‑solving. The
                    same instincts that helped me wire panels, diagnose faults,
                    and build reliable equipment now guide how I architect
                    applications, debug issues, and design systems that scale.
                    <br></br>
                    <br></br> I’m a jack of all trades with a builder’s
                    mentality. I bring practical experience, adaptability, and a
                    strong sense of ownership to every project.<br></br>
                    <br></br> I’m highly effective in this field because I
                    approach software the same way I approached the trades: with
                    craftsmanship, curiosity, and a commitment to getting things
                    right.
                  </p>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                  <h3 className="text-xl font-bold mb-2">Quick Stats</h3>
                  <ul className="space-y-2 text-neutral-400">
                    <li>🚀 Full-Stack Developer</li>
                    <li>🔒 Security-Focused</li>
                    <li>⚡ Performance Obsessed</li>
                    <li>🎯 Detail-Oriented</li>
                    <li>🛠️ Trades‑Built Mindset</li>
                    <li>🔧 Systems Thinker</li>
                    <li>⚙️ Hands‑On Problem Solver</li>
                    <li>🔌 Electrical‑Engineering Roots</li>
                    <li>🧩 Adaptable Across Disciplines</li>
                    <li>🧠 Learns Fast by Doing</li>
                    <li>🏗️ Builder of Reliable Systems</li>
                    <li>🚦 Calm Under Pressure</li>
                    <li>📐 Precision‑Driven</li>
                    <li>🔄 Iteration‑Focused</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activePanel === "projects" && (
            <div className="text-white min-h-[60vh]">
              <h2 className="text-3xl font-bold mb-4 text-blue-500">
                Featured Projects
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {projects.map((project) => (
                  <Link
                    key={project.title}
                    href={`/projects/${project.title
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700 hover:border-blue-500 transition-colors block"
                  >
                    <h3 className="text-lg font-bold mb-2">{project.title}</h3>
                    <p className="text-sm text-neutral-400">
                      {project.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activePanel === "contact" && (
            <div className="text-white min-h-[60vh] mt-5">
              <h2 className="text-3xl font-bold mb-4 text-green-500">
                Get In Touch
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-neutral-300 mb-4">
                    Let's build something amazing together. Whether you have a
                    project in mind or just want to chat about tech, I'd love to
                    hear from you.
                  </p>
                  <div className="space-y-2 text-neutral-400">
                    <p>📧 Email: dorian.ridley@gmail.com</p>
                    <p>
                      💼 LinkedIn:
                      https://www.linkedin.com/in/DorianRidley-Smith/
                    </p>
                    <p>🐙 GitHub: github.com/DRidleyS</p>
                  </div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-700">
                  <h3 className="text-xl font-bold mb-2">Availability</h3>
                  <p className="text-neutral-300">
                    Currently open to new opportunities and freelance projects.
                  </p>
                </div>
              </div>
              {/* Custom image and note section */}
              <div className="flex flex-col items-center mt-10">
                <div className="flex flex-row items-center gap-6">
                  <img
                    src="/menbro.jpg"
                    alt="Me and my lil bro"
                    className="w-48 rounded-lg shadow-lg border-2 border-neutral-700"
                  />
                  <div className="flex flex-col items-center">
                    {/* Hand-drawn arrow SVG (rotated 10deg, arrowhead on left) */}
                    <svg
                      width="120"
                      height="60"
                      viewBox="0 0 120 60"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mb-2"
                      style={{ transform: "translateX(-60px) rotate(10deg)" }}
                    >
                      <path
                        d="M110 50 Q 60 10 10 40"
                        stroke="#fff"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <g transform="rotate(180 10 40) translate(-1, -4)">
                        <path
                          d="M10 40 l10 -5 l-5 10"
                          stroke="#fff"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </g>
                    </svg>
                    <span
                      className="font-handwritten text-lg text-neutral-200"
                      style={{
                        fontFamily: '"Caveat", "Comic Sans MS", cursive',
                      }}
                    >
                      Me n' my lil bro (he codes too)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
