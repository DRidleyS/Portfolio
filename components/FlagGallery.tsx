"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import gsap from "gsap";
import * as THREE from "three";
import FlagCard from "./FlagCard";
import { projects } from "@/lib/projects";

interface SceneProps {
  onShowDetailPanel: (show: boolean) => void;
  onCurrentFlagChange: (index: number) => void;
}

function Scene({ onShowDetailPanel, onCurrentFlagChange }: SceneProps) {
  const { camera, gl, raycaster, mouse, size } = useThree();
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [inGalleryView, setInGalleryView] = useState(false);
  const [selectedFlagIndex, setSelectedFlagIndex] = useState<number | null>(
    null
  );
  const [dwellTime, setDwellTime] = useState(0);
  const [hoveredFlag, setHoveredFlag] = useState<number | null>(null);
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const mousePosition = useRef({ x: 0, y: 0 });

  const flagRefs = useRef<THREE.Group[]>([]);
  const scrollAccumulator = useRef(0);
  const cameraVelocity = useRef(new THREE.Vector3());
  const animationProgress = useRef({ value: 0 });
  const [transitionTargetIndex, setTransitionTargetIndex] = useState<
    number | null
  >(null);

  // Linear scroll path positions for flags
  const scrollPathPositions = useMemo(
    () =>
      projects.map((_, i) => {
        const seed = i * 1000;
        const random = (offset: number) => {
          const x = Math.sin(seed + offset) * 10000;
          return x - Math.floor(x);
        };
        return [
          (random(1) - 0.5) * 8, // x: -4 to 4 (wider spread)
          (random(2) - 0.5) * 6, // y: -3 to 3 (taller spread)
          i * -40 + (random(3) - 0.5) * 4, // z: with slight stagger so flags don't all pop at same depth
        ] as [number, number, number];
      }),
    []
  );

  // Initialize camera target after scrollPathPositions is defined
  const cameraTargetRef = useRef({
    x: scrollPathPositions[0][0],
    y: scrollPathPositions[0][1],
    z: scrollPathPositions[0][2] + 8, // Closer to flag
  });

  // Organic scatter positions for gallery view (seeded Poisson disk)
  const galleryPositions = useMemo(() => {
    const positions: [number, number, number][] = [];
    const minDist = 12;
    const maxAttempts = 30;

    for (let i = 0; i < projects.length; i++) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < maxAttempts) {
        const seed = i * 1000 + attempts;
        const random = (offset: number) => {
          const x = Math.sin(seed + offset) * 10000;
          return x - Math.floor(x);
        };

        const pos: [number, number, number] = [
          (random(1) - 0.5) * 30, // x: -15 to 15
          (random(2) - 0.5) * 20, // y: -10 to 10
          -120 + (random(3) - 0.5) * 10, // z: around -120
        ];

        // Check distance from all existing positions
        const tooClose = positions.some(([px, py, pz]) => {
          const dx = pos[0] - px;
          const dy = pos[1] - py;
          const dz = pos[2] - pz;
          return Math.sqrt(dx * dx + dy * dy + dz * dz) < minDist;
        });

        if (!tooClose || attempts === maxAttempts - 1) {
          positions.push(pos);
          placed = true;
        }

        attempts++;
      }
    }

    return positions;
  }, []);

  // Get current flag position based on state
  const getFlagPosition = (index: number): [number, number, number] => {
    if (inGalleryView) {
      return galleryPositions[index];
    } else {
      return scrollPathPositions[index];
    }
  };

  // Wheel event handler for scroll-locked navigation
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isAnimating || selectedFlagIndex !== null) return;

      e.preventDefault();
      scrollAccumulator.current += e.deltaY;

      // Check if we should navigate to next/prev flag
      const threshold = 100;
      if (Math.abs(scrollAccumulator.current) > threshold) {
        const direction = scrollAccumulator.current > 0 ? 1 : -1;
        const newIndex = currentFlagIndex + direction;

        // If in gallery view and scrolling up, return to linear scroll at last flag
        if (inGalleryView && direction < 0) {
          setIsAnimating(true);
          scrollAccumulator.current = 0;

          const lastFlagIndex = projects.length - 1;
          const targetPos = scrollPathPositions[lastFlagIndex];

          const timeline = gsap.timeline({
            onComplete: () => {
              setInGalleryView(false);
              setCurrentFlagIndex(lastFlagIndex);
              onCurrentFlagChange(lastFlagIndex);
              setIsAnimating(false);
            },
          });

          // Fly back to last flag
          timeline.to(cameraTargetRef.current, {
            x: targetPos[0],
            y: targetPos[1],
            z: targetPos[2] + 8,
            duration: 1.2,
            ease: "power2.inOut",
          });

          return;
        }

        if (!inGalleryView && newIndex >= 0 && newIndex < projects.length) {
          // Navigate to next/prev flag with cinematic camera movement
          setIsAnimating(true);
          scrollAccumulator.current = 0;

          const currentPos = scrollPathPositions[currentFlagIndex];
          const targetPos = scrollPathPositions[newIndex];
          const timeline = gsap.timeline();

          // Set transition target to start wave animation
          setTransitionTargetIndex(newIndex);

          if (direction < 0) {
            // Going backward - retrace the arc path in reverse, camera stays pointed forward
            // Stage 1: Pull back and to the side of current flag
            timeline.to(cameraTargetRef.current, {
              x: currentPos[0] + 85,
              y: currentPos[1] + 15,
              z: currentPos[2] + 75,
              duration: 1.8,
              ease: "sine.inOut",
            });

            // Stage 2: Arc backward to approach side of previous flag
            timeline.to(
              cameraTargetRef.current,
              {
                x: targetPos[0] + 85,
                y: targetPos[1] + 15,
                z: targetPos[2] + 75,
                duration: 1.8,
                ease: "sine.inOut",
              },
              "-=1.5"
            );

            // Stage 3: Approach previous flag
            timeline.to(
              cameraTargetRef.current,
              {
                x: targetPos[0],
                y: targetPos[1],
                z: targetPos[2] + 8,
                duration: 1.8,
                ease: "sine.inOut",
                onComplete: () => {
                  setCurrentFlagIndex(newIndex);
                  onCurrentFlagChange(newIndex);
                  setIsAnimating(false);
                  setTransitionTargetIndex(null);
                  setDwellTime(0);
                  setShowDetailPanel(false);
                  onShowDetailPanel(false);
                },
              },
              "-=1.5"
            );
            // No camera rotation - keep looking forward
          } else {
            // Going forward - use cinematic arc movement
            // Stage 1: Pull back and to the side of current flag
            timeline.to(cameraTargetRef.current, {
              x: currentPos[0] + 85,
              y: currentPos[1] + 15,
              z: currentPos[2] + 75,
              duration: 1.8,
              ease: "sine.inOut",
            });

            // Stage 2: Wide arc around to approach side of target flag
            timeline.to(
              cameraTargetRef.current,
              {
                x: targetPos[0] + 85,
                y: targetPos[1] + 15,
                z: targetPos[2] + 75,
                duration: 1.8,
                ease: "sine.inOut",
              },
              "-=1.5"
            );

            // Stage 3: Smooth approach to target flag
            timeline.to(
              cameraTargetRef.current,
              {
                x: targetPos[0],
                y: targetPos[1],
                z: targetPos[2] + 8,
                duration: 1.8,
                ease: "sine.inOut",
              },
              "-=1.5"
            );

            // Start camera rotation to next flag much earlier to avoid looking back
            if (flagRefs.current[newIndex]) {
              const flagPos = flagRefs.current[newIndex].position;
              const currentLookAt = new THREE.Vector3();
              camera.getWorldDirection(currentLookAt);
              currentLookAt.add(camera.position);

              const targetLookAt = {
                x: currentLookAt.x,
                y: currentLookAt.y,
                z: currentLookAt.z,
              };

              timeline.to(
                targetLookAt,
                {
                  x: flagPos.x,
                  y: flagPos.y,
                  z: flagPos.z,
                  duration: 3.8,
                  ease: "expo.inOut",
                  onUpdate: () => {
                    camera.lookAt(
                      targetLookAt.x,
                      targetLookAt.y,
                      targetLookAt.z
                    );
                  },
                  onComplete: () => {
                    setCurrentFlagIndex(newIndex);
                    onCurrentFlagChange(newIndex);
                    setIsAnimating(false);
                    setTransitionTargetIndex(null);
                    setDwellTime(0);
                    setShowDetailPanel(false);
                    onShowDetailPanel(false);
                  },
                },
                "-=3.8"
              ); // Start rotation at the very beginning of the animation
            }
          }
        } else if (newIndex >= projects.length) {
          // Dramatic transition to gallery view
          setIsAnimating(true);
          scrollAccumulator.current = 0;

          const timeline = gsap.timeline({
            onComplete: () => {
              setInGalleryView(true);
              setIsAnimating(false);
            },
          });

          // Dramatic arc camera movement
          timeline.to(cameraTargetRef.current, {
            x: -8,
            y: 5,
            z: -90,
            duration: 0.8,
            ease: "power2.in",
          });

          timeline.to(cameraTargetRef.current, {
            x: 0,
            y: 0,
            z: -120 + 20,
            duration: 1.2,
            ease: "expo.out",
          });

          // Scatter flags with wave propagation effect
          projects.forEach((_, i) => {
            if (flagRefs.current[i]) {
              const delay = 0.6 + Math.sin(i * 0.5) * 0.15 + i * 0.03;

              timeline.to(
                flagRefs.current[i].position,
                {
                  x: galleryPositions[i][0],
                  y: galleryPositions[i][1],
                  z: galleryPositions[i][2],
                  duration: 1.5,
                  ease: "elastic.out(1, 0.6)",
                },
                delay
              );

              // Add rotation animation for extra flair
              timeline.to(
                flagRefs.current[i].rotation,
                {
                  y: Math.PI * 2,
                  duration: 1.5,
                  ease: "power2.out",
                },
                delay
              );
            }
          });
        }
      }
    };

    gl.domElement.addEventListener("wheel", handleWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", handleWheel);
  }, [
    isAnimating,
    currentFlagIndex,
    inGalleryView,
    selectedFlagIndex,
    scrollPathPositions,
    gl,
  ]);

  // Mobile tap zone navigation
  useEffect(() => {
    function handleNext() {
      if (isAnimating || selectedFlagIndex !== null) return;
      const newIndex = currentFlagIndex + 1;
      if (!inGalleryView && newIndex < projects.length) {
        // Trigger same logic as wheel scroll forward
        const event = new WheelEvent("wheel", { deltaY: 120 });
        gl.domElement.dispatchEvent(event);
      } else if (!inGalleryView && newIndex >= projects.length) {
        // Go to gallery view
        const event = new WheelEvent("wheel", { deltaY: 120 });
        gl.domElement.dispatchEvent(event);
      }
    }
    function handlePrev() {
      if (isAnimating || selectedFlagIndex !== null) return;
      const newIndex = currentFlagIndex - 1;
      if (!inGalleryView && newIndex >= 0) {
        // Trigger same logic as wheel scroll backward
        const event = new WheelEvent("wheel", { deltaY: -120 });
        gl.domElement.dispatchEvent(event);
      } else if (inGalleryView) {
        // Return to linear scroll
        const event = new WheelEvent("wheel", { deltaY: -120 });
        gl.domElement.dispatchEvent(event);
      }
    }
    window.addEventListener("flagGalleryNext", handleNext);
    window.addEventListener("flagGalleryPrev", handlePrev);
    return () => {
      window.removeEventListener("flagGalleryNext", handleNext);
      window.removeEventListener("flagGalleryPrev", handlePrev);
    };
  }, [
    isAnimating,
    selectedFlagIndex,
    currentFlagIndex,
    inGalleryView,
    gl.domElement,
    projects.length,
  ]);

  // Click handler for flag selection - zoom in on single flag
  const handleFlagClick = (index: number) => {
    if (!inGalleryView || isAnimating) return;

    setIsAnimating(true);
    setSelectedFlagIndex(index);

    const timeline = gsap.timeline({
      onComplete: () => {
        setCurrentFlagIndex(index);
        onCurrentFlagChange(index);
        setDwellTime(1.0);
        setShowDetailPanel(true);
        onShowDetailPanel(true);
        setIsAnimating(false);
      },
    });

    // Zoom camera in on selected flag
    timeline.to(
      cameraTargetRef.current,
      {
        x: galleryPositions[index][0],
        y: galleryPositions[index][1],
        z: galleryPositions[index][2] + 10,
        duration: 0.8,
        ease: "power2.inOut",
      },
      0
    );

    // Scale up selected flag dramatically
    if (flagRefs.current[index]) {
      timeline.to(
        flagRefs.current[index].scale,
        {
          x: 3.0,
          y: 3.0,
          z: 3.0,
          duration: 0.8,
          ease: "back.out(1.4)",
        },
        0
      );
    }
  };

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (
        e.key === "Escape" &&
        (showDetailPanel || selectedFlagIndex !== null)
      ) {
        setShowDetailPanel(false);
        onShowDetailPanel(false);
        setSelectedFlagIndex(null);
        setDwellTime(0);
      } else if (
        e.key === "Escape" &&
        selectedFlagIndex !== null &&
        !isAnimating
      ) {
        returnToGallery();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position to -1 to 1 range
      mousePosition.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };

    window.addEventListener("keydown", handleEscape);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [selectedFlagIndex, isAnimating, showDetailPanel]);

  // Return to gallery function
  const returnToGallery = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setSelectedFlagIndex(null);
    setDwellTime(0);

    const timeline = gsap.timeline();

    // Animate flags back to gallery positions
    projects.forEach((_, i) => {
      const targetPos = galleryPositions[i];
      if (flagRefs.current[i]) {
        timeline.to(
          flagRefs.current[i].position,
          {
            x: targetPos[0],
            y: targetPos[1],
            z: targetPos[2],
            duration: 0.8,
            ease: "power3.inOut",
            delay: i * 0.05,
          },
          0
        );
        // Reset all scales to 1
        timeline.to(
          flagRefs.current[i].scale,
          {
            x: 1,
            y: 1,
            z: 1,
            duration: 0.8,
            ease: "power3.inOut",
            delay: i * 0.05,
          },
          0
        );
      }
    });

    // Move camera back to gallery view
    timeline.to(
      cameraTargetRef.current,
      {
        x: 0,
        y: 0,
        z: -120 + 40,
        duration: 1.0,
        ease: "power2.inOut",
      },
      0.2
    );

    timeline.call(() => {
      setInGalleryView(true);
      setIsAnimating(false);
    });
  };

  // Smooth camera follow with proper interpolation and momentum physics
  useFrame((state, delta) => {
    const clampedDelta = Math.min(delta, 0.05);

    // Gentle mouse-based camera rotation for immersion
    const mouseInfluence = 0.15;
    const rotationX = mousePosition.current.y * mouseInfluence;
    const rotationY = mousePosition.current.x * mouseInfluence;

    // Apply subtle rotation offset to camera target when not animating
    if (!isAnimating && !inGalleryView) {
      const rotationOffset = new THREE.Vector3(
        rotationY * 2,
        -rotationX * 2,
        0
      );
      // This creates a subtle parallax/head-tracking effect
    }

    // Simplified spring-based camera movement
    const spring = (current: number, target: number, velocity: number) => {
      const stiffness = 12; // Reduced from 14
      const damping = 0.92; // Increased from 0.88
      const force = (target - current) * stiffness;
      velocity += force * clampedDelta;
      velocity *= damping;
      return { value: current + velocity * clampedDelta, velocity };
    };

    // Apply spring physics to camera position
    if (!cameraVelocity.current) {
      cameraVelocity.current = new THREE.Vector3();
    }

    const xSpring = spring(
      camera.position.x,
      cameraTargetRef.current.x,
      cameraVelocity.current.x
    );
    const ySpring = spring(
      camera.position.y,
      cameraTargetRef.current.y,
      cameraVelocity.current.y
    );
    const zSpring = spring(
      camera.position.z,
      cameraTargetRef.current.z,
      cameraVelocity.current.z
    );

    camera.position.x = xSpring.value;
    camera.position.y = ySpring.value;
    camera.position.z = zSpring.value;
    cameraVelocity.current.set(
      xSpring.velocity,
      ySpring.velocity,
      zSpring.velocity
    );

    // Simple camera lookAt - no spring physics, disabled during transitions
    if (!isAnimating) {
      // Apply mouse-based rotation offset for immersion
      const mouseInfluenceStrength = 0.3;
      const lookOffsetX = mousePosition.current.x * mouseInfluenceStrength;
      const lookOffsetY = -mousePosition.current.y * mouseInfluenceStrength;

      if (selectedFlagIndex !== null && flagRefs.current[selectedFlagIndex]) {
        // Look at selected flag
        const flagPos = flagRefs.current[selectedFlagIndex].position;
        camera.lookAt(
          flagPos.x + lookOffsetX * 0.5,
          flagPos.y + lookOffsetY * 0.5,
          flagPos.z
        );
      } else if (inGalleryView) {
        camera.lookAt(lookOffsetX * 5, lookOffsetY * 5, -120);
      } else if (
        currentFlagIndex < flagRefs.current.length &&
        flagRefs.current[currentFlagIndex]
      ) {
        const flagPos = flagRefs.current[currentFlagIndex].position;
        camera.lookAt(
          flagPos.x + lookOffsetX,
          flagPos.y + lookOffsetY,
          flagPos.z
        );
      }
    }

    // Dwell timer for stretching during linear scroll or single flag view
    if (!inGalleryView && !isAnimating) {
      setDwellTime((prev) => {
        const newTime = prev + delta;
        if (newTime > 0.8 && !showDetailPanel) {
          setShowDetailPanel(true);
          onShowDetailPanel(true);
        }
        return newTime;
      });
    }
  });

  // Hover effects for all flags with enhanced interactivity
  const handleFlagHover = (index: number, hovered: boolean) => {
    if (isAnimating || selectedFlagIndex !== null) return;

    setHoveredFlag(hovered ? index : null);

    if (inGalleryView) {
      // Gallery hover: scale up effect
      if (flagRefs.current[index]) {
        gsap.to(flagRefs.current[index].scale, {
          x: hovered ? 1.2 : 1,
          y: hovered ? 1.2 : 1,
          z: hovered ? 1.2 : 1,
          duration: 0.4,
          ease: hovered ? "back.out(2)" : "power2.out",
        });
        gsap.to(flagRefs.current[index].position, {
          z: hovered
            ? galleryPositions[index][2] + 2
            : galleryPositions[index][2],
          duration: 0.4,
          ease: "power2.out",
        });
      }
    }
  };

  const isStretched = (index: number) => {
    // Stretch during linear scroll mode when dwelling on current flag
    if (
      !inGalleryView &&
      selectedFlagIndex === null &&
      index === currentFlagIndex &&
      dwellTime > 0.8
    ) {
      return true;
    }
    // Stretch when this flag is selected
    if (selectedFlagIndex === index && dwellTime > 0.8) {
      return true;
    }
    return false;
  };

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[
          scrollPathPositions[0][0],
          scrollPathPositions[0][1],
          scrollPathPositions[0][2] + 12,
        ]}
        fov={60}
      />

      {/* Volumetric atmospheric fog - increased dirty air effect */}
      <fog attach="fog" args={["#080808", 15, 100]} />

      {/* Studio Lighting Setup - Simplified */}
      {/* Rim Light 1 - Blue backlight for edge definition */}
      <directionalLight
        position={[-12, 8, -15]}
        intensity={1.8}
        color="#4488ff"
      />

      {/* Rim Light 2 - Orange side light for warmth */}
      <directionalLight
        position={[12, 5, -10]}
        intensity={1.5}
        color="#ff8844"
      />

      {/* Simplified ambient base lighting */}
      <ambientLight intensity={0.7} color="#556677" />

      {/* Background plane to detect clicks outside flag */}
      {selectedFlagIndex !== null && inGalleryView && (
        <mesh position={[0, 0, -150]} onClick={returnToGallery}>
          <planeGeometry args={[500, 500]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}

      {projects.map((project, index) => {
        // Only render selected flag when in single flag view
        if (selectedFlagIndex !== null && index !== selectedFlagIndex) {
          return null;
        }

        // Calculate distance from camera for animation control
        const flagPos = scrollPathPositions[index];
        const distanceToCamera = Math.abs(camera.position.z - flagPos[2]);
        // Animate waves when within 60 units OR if this is the transition target OR if selected OR in gallery view
        const isNearCamera =
          distanceToCamera < 60 ||
          index === transitionTargetIndex ||
          index === selectedFlagIndex ||
          inGalleryView;

        return (
          <group
            key={index}
            ref={(el) => {
              if (el) flagRefs.current[index] = el;
            }}
            position={getFlagPosition(index)}
            scale={
              selectedFlagIndex === index
                ? 3.0
                : inGalleryView && hoveredFlag === index
                ? 1.2
                : 1
            }
          >
            <FlagCard
              project={project}
              index={index}
              isNearCamera={isNearCamera}
              position={[0, 0, 0]}
              isMiniature={false}
              isStretched={isStretched(index)}
              onHover={(hovered) => handleFlagHover(index, hovered)}
              onClick={(e) => {
                // Open demo if available, otherwise github
                if (project.demo) {
                  window.open(project.demo, "_blank");
                } else if (project.github) {
                  window.open(project.github, "_blank");
                }
              }}
            />
          </group>
        );
      })}

      {/* Click outside handler */}
      {selectedFlagIndex !== null && inGalleryView && (
        <mesh position={[0, 0, -10]} onClick={returnToGallery} visible={false}>
          <planeGeometry args={[100, 100]} />
        </mesh>
      )}
    </>
  );
}

export default function FlagGallery() {
  const [showDetailPanel, setShowDetailPanel] = useState(false);
  const [currentFlagIndex, setCurrentFlagIndex] = useState(0);

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <Canvas
        style={{ background: "#000" }}
        gl={{ antialias: true, alpha: false }}
      >
        <Scene
          onShowDetailPanel={setShowDetailPanel}
          onCurrentFlagChange={setCurrentFlagIndex}
        />
      </Canvas>
    </div>
  );
}
