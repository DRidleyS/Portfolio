"use client";

import { useEffect, useState } from "react";
import ShiftLights from "./ShiftLights";
import FlickerButton from "./FlickerButton";
import NeonLogo from "./NeonLogo";
import LaurelWreath from "./LaurelWreath";
import RacecarHeader from "./RacecarHeader";

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia("(min-width: 950px)").matches);
    };
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);
  return isDesktop;
}

function useIsLandscapeMobile() {
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  useEffect(() => {
    const checkLandscapeMobile = () => {
      const mq = window.matchMedia(
        "(max-width: 950px) and (orientation: landscape)"
      );
      setIsLandscapeMobile(mq.matches);
    };
    checkLandscapeMobile();
    window.addEventListener("resize", checkLandscapeMobile);
    window.addEventListener("orientationchange", checkLandscapeMobile);
    return () => {
      window.removeEventListener("resize", checkLandscapeMobile);
      window.removeEventListener("orientationchange", checkLandscapeMobile);
    };
  }, []);
  return isLandscapeMobile;
}

export default function Hero() {
  const isDesktop = useIsDesktop();
  const isLandscapeMobile = useIsLandscapeMobile();
  return (
    <>
      {isDesktop && <RacecarHeader />}
      <section
        className={`relative h-screen w-full flex flex-col items-center justify-center text-white px-6 carbon-bg overflow-hidden pt-8 ${
          isLandscapeMobile ? "landscape-mobile" : ""
        }`}
      >
        {/* Gauge Cluster Container */}
        <div
          className={`flex flex-col items-center mb-8 ${
            isLandscapeMobile ? "scale-90" : ""
          }`}
        >
          {/* Shift Lights */}
          <ShiftLights
            className={isLandscapeMobile ? "mb-2 scale-90" : "mb-4"}
          />

          {/* Digital Speed Readout */}
          <div
            className={
              isLandscapeMobile
                ? "text-2xl font-mono tracking-widest text-center break-words transition-colors duration-300"
                : "text-4xl sm:text-5xl md:text-6xl font-mono tracking-widest text-center break-words transition-colors duration-300"
            }
            style={{ color: "var(--name-color, #ef4444)" }}
          >
            Dorian Ridley-Smith
          </div>
        </div>

        {/* Headline */}
        <h1
          className={
            isLandscapeMobile
              ? "text-lg font-bold text-center px-2"
              : "text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold text-center px-4"
          }
        >
          Performance‑Driven Software Engineer
        </h1>
        <p
          className={
            isLandscapeMobile
              ? "text-base text-neutral-300 mt-2 tracking-wide"
              : "text-lg text-neutral-300 mt-4 tracking-wide"
          }
        >
          I'm a security-first software engineer who builds fast, reliable, and
          finely tuned applications.
        </p>
        {/* CTA */}
        <div
          className={
            isLandscapeMobile
              ? "flex flex-col gap-2 mt-4 w-full max-w-xs items-center justify-center"
              : "flex flex-col md:flex-row gap-4 mt-8 w-full max-w-md md:max-w-none items-center justify-center"
          }
        >
          <FlickerButton href="/about">About Me</FlickerButton>
          <FlickerButton href="/projects">See My Builds</FlickerButton>
          <FlickerButton href="/contact">Contact Me</FlickerButton>
        </div>

        {/* Neon Logo */}
        <NeonLogo
          size={isLandscapeMobile ? "sm" : "lg"}
          className={isLandscapeMobile ? "mt-4" : "mt-8"}
        />

        {/* Laurel Wreath */}
        <LaurelWreath className={isLandscapeMobile ? "scale-90" : ""} />
      </section>
    </>
  );
}
