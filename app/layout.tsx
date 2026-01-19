"use client";

import "../styles/globals.css";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import S2KTransition, {
  S2KTransitionHandle,
} from "../components/S2kTransition";
import DirtyAir from "../components/DirtyAir";
import GlobalNavShifter from "../components/GlobalNavShifter";
import RacecarHeader from "../components/RacecarHeader";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const transitionRef = useRef<S2KTransitionHandle>(null);
  const [showContent, setShowContent] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setShowContent(false);
    if (transitionRef.current) {
      transitionRef.current.play(() => {
        setShowContent(true);
      });
    }
  }, [pathname]);

  useEffect(() => {
    setIsClient(true);
    function checkMobileAndOrientation() {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      setShowRotatePrompt(mobile && window.innerWidth < window.innerHeight);
    }
    checkMobileAndOrientation();
    window.addEventListener("resize", checkMobileAndOrientation);
    window.addEventListener("orientationchange", checkMobileAndOrientation);
    return () => {
      window.removeEventListener("resize", checkMobileAndOrientation);
      window.removeEventListener(
        "orientationchange",
        checkMobileAndOrientation
      );
    };
  }, []);

  useEffect(() => {
    function checkDesktop() {
      setIsDesktop(window.innerWidth >= 1200);
    }
    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handler for tap zones (only on /projects)
  function handleTapZone(e: React.MouseEvent<HTMLDivElement>) {
    if (!isMobile || pathname !== "/projects") return;
    const x = e.nativeEvent.clientX;
    const w = window.innerWidth;
    if (x > w * 0.66) {
      // Tap right: next flag
      window.dispatchEvent(new CustomEvent("flagGalleryNext"));
    } else if (x < w * 0.33) {
      // Tap left: prev flag
      window.dispatchEvent(new CustomEvent("flagGalleryPrev"));
    }
  }

  return (
    <html lang="en">
      <body>
        <DirtyAir />
        <S2KTransition ref={transitionRef} />
        <GlobalNavShifter />
        {/* Only render RacecarHeader after client mount and on desktop screens */}
        {mounted &&
          isClient &&
          isDesktop &&
          pathname !== "/projects" &&
          pathname !== "/contact" &&
          pathname !== "/" && <RacecarHeader />}
        {isClient && pathname === "/projects" && showRotatePrompt && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.85)",
              color: "#fff",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
            }}
          >
            <div style={{ marginBottom: 24 }}>
              Please rotate your phone to landscape
            </div>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="20" y="30" width="40" height="20" rx="6" fill="#fff" />
              <rect
                x="20"
                y="30"
                width="40"
                height="20"
                rx="6"
                stroke="#888"
                strokeWidth="2"
              />
              <path
                d="M60 50 L70 60 M70 60 L60 70"
                stroke="#fff"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
        <div
          style={{ opacity: showContent ? 1 : 0, transition: "opacity 0.3s" }}
        >
          {children}
        </div>
        {/* Tap zones for flag navigation on mobile projects page */}
        {isClient &&
          isMobile &&
          pathname === "/projects" &&
          !showRotatePrompt && (
            <>
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 999,
                  pointerEvents: "none",
                }}
              />
              {/* Left tap zone */}
              <div
                onClick={handleTapZone}
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "33vw",
                  height: "100vh",
                  zIndex: 1000,
                  pointerEvents: "auto",
                }}
              />
              {/* Right tap zone - only covers top right, not shifter area */}
              <div
                onClick={handleTapZone}
                style={{
                  position: "fixed",
                  top: 0,
                  right: 0,
                  width: "33vw",
                  height: "calc(100vh - 180px)", // 150px shifter + 32px margin
                  zIndex: 1000,
                  pointerEvents: "auto",
                }}
              />
            </>
          )}
      </body>
    </html>
  );
}
