"use client";

import "../styles/globals.css";
import { Poppins, Roboto } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
});
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
  const galleryScrollHideActive = useRef(false);

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
      const isPortrait = window.innerWidth < window.innerHeight;
      setIsMobile(mobile);
      setShowRotatePrompt(mobile && isPortrait);

      // Fullscreen management for mobile projects gallery in landscape
      const onProjects = window.location.pathname === "/projects";
      const doc = document as any;
      const el = document.documentElement as any;

      if (mobile && !isPortrait && onProjects) {
        if (!document.fullscreenElement && !doc.webkitFullscreenElement) {
          const applyScrollFallback = () => {
            document.body.style.minHeight = "calc(100vh + 60px)";
            galleryScrollHideActive.current = true;
            // Scroll aggressively after orientation settles to collapse address bar
            setTimeout(() => window.scrollTo(0, 60), 300);
            setTimeout(() => window.scrollTo(0, 60), 600);
          };
          if (el.requestFullscreen) {
            el.requestFullscreen().catch(applyScrollFallback);
          } else {
            // No Fullscreen API (e.g. iOS Safari) — scroll to hide address bar
            applyScrollFallback();
          }
        }
      } else {
        // Only reset scroll if the fallback was active
        if (galleryScrollHideActive.current) {
          document.body.style.minHeight = "";
          window.scrollTo(0, 0);
          galleryScrollHideActive.current = false;
        }
        // Exit fullscreen if active
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else if (doc.webkitFullscreenElement) {
          doc.webkitExitFullscreen();
        }
      }
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

  // Exit fullscreen / reset scroll fallback when navigating away from projects
  useEffect(() => {
    if (pathname !== "/projects") {
      const doc = document as any;
      if (galleryScrollHideActive.current) {
        document.body.style.minHeight = "";
        window.scrollTo(0, 0);
        galleryScrollHideActive.current = false;
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else if (doc.webkitFullscreenElement) {
        doc.webkitExitFullscreen();
      }
    }
  }, [pathname]);

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
    <html lang="en" className={`${poppins.variable} ${roboto.variable}`}>
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
