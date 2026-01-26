"use client";

import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface FlagCardProps {
  project: {
    title: string;
    description: string;
    tech: string[];
    github: string | null;
    demo: string | null;
    images: string[];
  };
  index: number;
  position: [number, number, number];
  isMiniature: boolean;
  isStretched: boolean;
  isNearCamera?: boolean; // Controls wave animation based on distance
  onHover?: (hovered: boolean) => void;
  onClick?: (e: any) => void;
  onButtonClick?: (buttonType: "demo" | "github") => void;
}

function FlagCard({
  project,
  index,
  position,
  isMiniature,
  isStretched,
  isNearCamera = true,
  onHover,
  onClick,
  onButtonClick,
}: FlagCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const animationState = useRef({
    stretchProgress: 0,
    flipProgress: 0,
    scaleProgress: 1,
    rotationVelocity: 0,
    scaleVelocity: 0,
    anticipationPhase: 0,
    wasStretched: false,
    frameSkipCounter: 0, // Skip frames for performance
  });

  // Seeded random values for organic variety
  const flagParams = useMemo(() => {
    const seed = index * 1000;
    const random = (offset: number) => {
      const x = Math.sin(seed + offset) * 10000;
      return x - Math.floor(x);
    };

    return {
      phaseOffset: random(1) * Math.PI * 2,
      frequency: 1.2 + random(2) * 0.8, // 1.2-2.0 Hz - faster waves
      amplitude: 0.25 + random(3) * 0.15, // 0.25-0.40 - much bigger waves
      gradient: [
        // Color gradients based on index
        ["#000000", "#ffffff"], // black-white for the first flag
        ["#4444ff", "#8800ff"], // blue-purple
        ["#00ff88", "#00ccaa"], // green-teal
        ["#ffaa00", "#ff6600"], // yellow-orange
        ["#ff0088", "#cc0066"], // pink-magenta
        ["#00aaff", "#0088cc"], // cyan-blue
        ["#88ff00", "#66cc00"], // lime-green
        ["#ff00ff", "#cc00cc"], // magenta
        ["#00ffff", "#00cccc"], // cyan
        ["#ffff00", "#cccc00"], // yellow
      ][index % 10],
    };
  }, [index]);

  // Create enhanced front texture with blocky font and matching style
  const frontTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Rich multi-layer gradient background (same as back)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, flagParams.gradient[0]);
    gradient.addColorStop(0.5, flagParams.gradient[1]);
    gradient.addColorStop(1, flagParams.gradient[0]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add radial gradient overlay for depth
    const radialGrad = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.6,
    );
    radialGrad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    radialGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.05)");
    radialGrad.addColorStop(1, "rgba(0, 0, 0, 0.3)");
    ctx.fillStyle = radialGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Diagonal accent stripe pattern
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = flagParams.gradient[0];
    ctx.lineWidth = 2;
    for (let i = -canvas.height; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }
    ctx.restore();

    // Decorative corner elements
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 4;
    const cornerSize = 80;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(20, cornerSize);
    ctx.lineTo(20, 20);
    ctx.lineTo(cornerSize, 20);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - cornerSize, 20);
    ctx.lineTo(canvas.width - 20, 20);
    ctx.lineTo(canvas.width - 20, cornerSize);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(20, canvas.height - cornerSize);
    ctx.lineTo(20, canvas.height - 20);
    ctx.lineTo(cornerSize, canvas.height - 20);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - cornerSize, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - 20);
    ctx.lineTo(canvas.width - 20, canvas.height - cornerSize);
    ctx.stroke();

    // Draw project name with blocky font and dramatic effects
    ctx.globalCompositeOperation = "source-over";
    const text = project.title.toUpperCase();
    const x = canvas.width / 2;
    const y = canvas.height / 2;

    // Blocky font (Impact, Arial Black, sans-serif)
    ctx.font = "900 90px Impact, Arial Black, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Multiple shadow layers for depth
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.fillText(text, x + 6, y + 6);
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillText(text, x + 4, y + 4);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillText(text, x + 2, y + 2);

    // Thick black outline
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 10;
    ctx.lineJoin = "round";
    ctx.strokeText(text, x, y);

    // Colored glow layer
    ctx.strokeStyle = flagParams.gradient[0];
    ctx.lineWidth = 6;
    ctx.shadowColor = flagParams.gradient[0];
    ctx.shadowBlur = 25;
    ctx.strokeText(text, x, y);

    // Inner bright glow
    ctx.strokeStyle = flagParams.gradient[1];
    ctx.lineWidth = 3;
    ctx.shadowColor = flagParams.gradient[1];
    ctx.shadowBlur = 20;
    ctx.strokeText(text, x, y);
    ctx.shadowBlur = 0;

    // Main text with enhanced gradient
    const textGradient = ctx.createLinearGradient(0, y - 50, 0, y + 50);
    textGradient.addColorStop(0, "#ffffff");
    textGradient.addColorStop(0.3, "#f8f8f8");
    textGradient.addColorStop(0.7, "#e0e0e0");
    textGradient.addColorStop(1, "#c0c0c0");
    ctx.fillStyle = textGradient;
    ctx.fillText(text, x, y);

    // Add shine/highlight on top half of text
    ctx.globalCompositeOperation = "screen";
    const shineGradient = ctx.createLinearGradient(0, y - 40, 0, y);
    shineGradient.addColorStop(0, "rgba(255, 255, 255, 0.6)");
    shineGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = shineGradient;
    ctx.fillText(text, x, y - 5);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [project.title, flagParams.gradient]);

  // Create back texture with project details and image carousel area - ULTRA optimized
  const backTexture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024; // Doubled from 512 for higher resolution
    canvas.height = 512; // Doubled from 256 for higher resolution
    const ctx = canvas.getContext("2d")!;

    // Rich dark gradient background with more depth
    const bgGradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height,
    );
    bgGradient.addColorStop(0, "#000000");
    bgGradient.addColorStop(0.3, "#0a0a0a");
    bgGradient.addColorStop(0.7, "#1a1a1a");
    bgGradient.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add radial gradient overlay for depth
    const radialGradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.7,
    );
    radialGradient.addColorStop(0, flagParams.gradient[0] + "33");
    radialGradient.addColorStop(0.5, flagParams.gradient[1] + "22");
    radialGradient.addColorStop(1, "transparent");
    ctx.fillStyle = radialGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add diagonal accent stripe pattern
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = flagParams.gradient[0];
    ctx.lineWidth = 2;
    for (let i = -canvas.height; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + canvas.height, canvas.height);
      ctx.stroke();
    }
    ctx.restore();

    // Left side: Static image area (60%)
    const imageAreaWidth = canvas.width * 0.6;
    const imgX = 30;
    const imgY = 40;
    const imgWidth = imageAreaWidth - 60;
    const imgHeight = canvas.height - 80;

    // Draw placeholder with gradient
    const imgPlaceholderGradient = ctx.createLinearGradient(
      imgX,
      imgY,
      imgX,
      imgY + imgHeight,
    );
    imgPlaceholderGradient.addColorStop(0, "#1a1a1a");
    imgPlaceholderGradient.addColorStop(1, "#0a0a0a");
    ctx.fillStyle = imgPlaceholderGradient;
    ctx.fillRect(imgX, imgY, imgWidth, imgHeight);

    // Load and draw static first image if available
    if (project.images.length > 0) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        // Calculate aspect ratio to fit image properly
        const imgAspect = img.width / img.height;
        const areaAspect = imgWidth / imgHeight;

        let drawWidth = imgWidth;
        let drawHeight = imgHeight;
        let drawX = imgX;
        let drawY = imgY;

        if (imgAspect > areaAspect) {
          // Image is wider than area
          drawHeight = imgWidth / imgAspect;
          drawY = imgY + (imgHeight - drawHeight) / 2;
        } else {
          // Image is taller than area
          drawWidth = imgHeight * imgAspect;
          drawX = imgX + (imgWidth - drawWidth) / 2;
        }

        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        // Update texture after image loads
        texture.needsUpdate = true;
      };

      img.onerror = () => {
        console.warn(`Failed to load image: ${project.images[0]}`);
      };

      img.src = project.images[0];
    }

    // Triple border effect around image
    ctx.strokeStyle = flagParams.gradient[0];
    ctx.lineWidth = 4;
    ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);

    ctx.strokeStyle = flagParams.gradient[1];
    ctx.lineWidth = 2;
    ctx.strokeRect(imgX - 3, imgY - 3, imgWidth + 6, imgHeight + 6);

    // Outer glow
    ctx.shadowColor = flagParams.gradient[0];
    ctx.shadowBlur = 20;
    ctx.strokeStyle = flagParams.gradient[0] + "88";
    ctx.lineWidth = 1;
    ctx.strokeRect(imgX, imgY, imgWidth, imgHeight);
    ctx.shadowBlur = 0;

    // Right side: Project info (40%)
    const infoX = imageAreaWidth + 30;
    const infoWidth = canvas.width - imageAreaWidth - 60;
    let yPos = 60;

    // Decorative corner accent
    ctx.strokeStyle = flagParams.gradient[0];
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(infoX - 10, 30);
    ctx.lineTo(infoX + 60, 30);
    ctx.lineTo(infoX + 60, 36);
    ctx.moveTo(infoX - 10, 30);
    ctx.lineTo(infoX - 10, 80);
    ctx.stroke();

    // Title with dramatic styling
    ctx.font = "900 42px Impact, Arial Black, sans-serif";
    ctx.textAlign = "left";

    // Create gradient text effect
    const titleGradient = ctx.createLinearGradient(
      infoX,
      yPos - 20,
      infoX,
      yPos + 60,
    );
    titleGradient.addColorStop(0, flagParams.gradient[0]);
    titleGradient.addColorStop(1, flagParams.gradient[1]);

    const title = project.title.toUpperCase();
    const titleLines = wrapText(ctx, title, infoWidth, 44);

    titleLines.forEach((line, lineIndex) => {
      // Deep shadow for depth
      ctx.fillStyle = "#000000";
      ctx.fillText(line, infoX + 3, yPos + 3);

      // Mid shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillText(line, infoX + 2, yPos + 2);

      // Glowing outline
      ctx.strokeStyle = flagParams.gradient[0];
      ctx.lineWidth = 4;
      ctx.lineJoin = "round";
      ctx.strokeText(line, infoX, yPos);

      // Inner glow
      ctx.shadowColor = flagParams.gradient[0];
      ctx.shadowBlur = 15;
      ctx.strokeStyle = flagParams.gradient[1];
      ctx.lineWidth = 2;
      ctx.strokeText(line, infoX, yPos);
      ctx.shadowBlur = 0;

      // Gradient fill
      ctx.fillStyle = titleGradient;
      ctx.fillText(line, infoX, yPos);

      yPos += 44;
    });

    yPos += 10;

    // Accent divider line
    const dividerGradient = ctx.createLinearGradient(
      infoX,
      yPos,
      canvas.width - 30,
      yPos,
    );
    dividerGradient.addColorStop(0, "transparent");
    dividerGradient.addColorStop(0.2, flagParams.gradient[0]);
    dividerGradient.addColorStop(0.8, flagParams.gradient[1]);
    dividerGradient.addColorStop(1, "transparent");
    ctx.strokeStyle = dividerGradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(infoX, yPos);
    ctx.lineTo(canvas.width - 30, yPos);
    ctx.stroke();

    yPos += 20;

    // Description with better styling
    ctx.font = "400 18px 'Segoe UI', Arial, sans-serif";
    ctx.fillStyle = "#e8e8e8";
    ctx.shadowColor = "#000000";
    ctx.shadowBlur = 2;
    const descLines = wrapText(ctx, project.description, infoWidth, 22);
    const maxDescLines = 5;
    descLines.slice(0, maxDescLines).forEach((line, i) => {
      ctx.fillText(line, infoX, yPos);
      yPos += 24;
      if (i === maxDescLines - 1 && descLines.length > maxDescLines) {
        ctx.fillText("...", infoX, yPos);
      }
    });
    ctx.shadowBlur = 0;

    yPos += 20;

    // Tech stack with enhanced pills/badges
    ctx.font = "700 13px Arial, sans-serif";
    let techX = infoX;
    const pillHeight = 26;
    project.tech.forEach((tech, i) => {
      const metrics = ctx.measureText(tech);
      const pillWidth = metrics.width + 24;

      if (techX + pillWidth > canvas.width - 30) {
        techX = infoX;
        yPos += pillHeight + 10;
      }

      // Pill shadow
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
      ctx.beginPath();
      ctx.roundRect(
        techX + 2,
        yPos - pillHeight / 2 + 2,
        pillWidth,
        pillHeight,
        13,
      );
      ctx.fill();

      // Pill gradient background
      const pillGradient = ctx.createLinearGradient(
        techX,
        yPos - pillHeight / 2,
        techX,
        yPos + pillHeight / 2,
      );
      pillGradient.addColorStop(0, flagParams.gradient[0] + "66");
      pillGradient.addColorStop(1, flagParams.gradient[1] + "44");
      ctx.fillStyle = pillGradient;
      ctx.beginPath();
      ctx.roundRect(techX, yPos - pillHeight / 2, pillWidth, pillHeight, 13);
      ctx.fill();

      // Pill glowing border
      ctx.strokeStyle = flagParams.gradient[0];
      ctx.lineWidth = 1.5;
      ctx.shadowColor = flagParams.gradient[0];
      ctx.shadowBlur = 6;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Text with glow
      ctx.fillStyle = "#ffffff";
      ctx.textBaseline = "middle";
      ctx.shadowColor = flagParams.gradient[0];
      ctx.shadowBlur = 4;
      ctx.fillText(tech, techX + 12, yPos);
      ctx.shadowBlur = 0;

      techX += pillWidth + 10;
    });

    yPos += 50;

    // Action buttons with enhanced styling
    const buttonY = canvas.height - 70;
    ctx.font = "bold 18px Arial, sans-serif";

    if (project.demo || project.github) {
      let buttonX = infoX;

      if (project.demo) {
        const btnWidth = 130;
        // Demo button with gradient and glow
        const btnGradient = ctx.createLinearGradient(
          buttonX,
          buttonY - 16,
          buttonX,
          buttonY + 16,
        );
        btnGradient.addColorStop(0, flagParams.gradient[0]);
        btnGradient.addColorStop(1, flagParams.gradient[1]);

        ctx.fillStyle = btnGradient;
        ctx.shadowColor = flagParams.gradient[0];
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY - 16, btnWidth, 32, 8);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Button highlight
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.beginPath();
        ctx.roundRect(buttonX + 2, buttonY - 14, btnWidth - 4, 12, 6);
        ctx.fill();

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = "#000000";
        ctx.shadowBlur = 3;
        ctx.fillText("LIVE DEMO", buttonX + btnWidth / 2, buttonY);
        ctx.shadowBlur = 0;

        buttonX += btnWidth + 14;
      }

      if (project.github) {
        const btnWidth = 110;
        // GitHub button with glowing border
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#ffffff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(buttonX, buttonY - 16, btnWidth, 32, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Inner glow
        ctx.strokeStyle = flagParams.gradient[0];
        ctx.lineWidth = 1;
        ctx.shadowColor = flagParams.gradient[0];
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = flagParams.gradient[0];
        ctx.shadowBlur = 4;
        ctx.fillText("GITHUB", buttonX + btnWidth / 2, buttonY);
        ctx.shadowBlur = 0;
      }
    }

    // Helper function for text wrapping
    function wrapText(
      context: CanvasRenderingContext2D,
      text: string,
      maxWidth: number,
      lineHeightOffset: number = 0,
    ): string[] {
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      words.forEach((word) => {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);
      return lines;
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, [project, flagParams.gradient]);

  // Custom vertex shader for wind simulation
  const vertexShader = `
    uniform float uTime;
    uniform float uFrequency;
    uniform float uAmplitude;
    uniform float uPhaseOffset;
    uniform float uStretchFactor;
    uniform float uFlipProgress;
    
    varying vec2 vUv;
    varying float vWave;
    
    // Simplified noise function - using sin instead of simplex for performance
    float simpleNoise(vec2 p) {
      return sin(p.x * 12.9898 + p.y * 78.233) * 0.5 + 0.5;
    }
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      
      // Simplified flag wave with much more movement
      float flipFactor = abs(sin(uFlipProgress * 3.14159));
      float waveAmplitude = uAmplitude * (1.0 - flipFactor * 0.5);
      
      // Simple wave calculation with 3x amplitude
      float wave = sin(pos.x * 2.0 + uTime * uFrequency + uPhaseOffset) * waveAmplitude * 1.2;
      wave += sin(pos.y * 3.0 + uTime * uFrequency * 0.8) * waveAmplitude * 0.9;
      
      // Apply wave displacement in Z
      pos.z += wave;
      vWave = wave;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uFrontTexture;
    uniform sampler2D uBackTexture;
    uniform float uEmissive;
    uniform float uFlipProgress;
    
    varying vec2 vUv;
    varying float vWave;
    
    // Simple noise function for texture variation
    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }
    
    void main() {
      // Instant texture switch when flag is orthogonal (edge-on to viewer)
      vec4 frontColor = texture2D(uFrontTexture, vUv);
      vec4 backColor = texture2D(uBackTexture, vec2(1.0 - vUv.x, vUv.y));
      
      // Hard cutoff at 0.5 for realistic flip appearance
      bool showFront = uFlipProgress < 0.5;
      vec4 texColor = showFront ? frontColor : backColor;
      
      vec3 color = texColor.rgb;
      
      // Subtle worn effect
      float noise = random(vUv * 50.0) * 0.08;
      color *= (1.0 - noise);
      
      // Gentle wave shading
      float waveShadow = vWave * 0.3 + 0.8;
      color *= waveShadow;
      
      // Subtle specular highlight for fabric sheen
      float specular = pow(max(0.0, dot(normalize(vec3(0.5, 0.5, 1.0)), vec3(0.0, 0.0, 1.0))), 32.0);
      color += vec3(1.0) * specular * 0.15 * (1.0 - noise);
      
      // Fabric texture with subtle weave pattern
      float fabricPattern = sin(vUv.x * 150.0) * sin(vUv.y * 150.0) * 0.015;
      color += vec3(fabricPattern);
      
      // Emissive for hover effect with glow
      color += color * uEmissive * 1.5;
      
      // Enhanced color grading for cinematic look
      color = pow(color, vec3(0.92)); // More contrast
      color *= 1.1; // Slight brightness boost
      
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uFrequency: { value: flagParams.frequency },
      uAmplitude: { value: flagParams.amplitude },
      uPhaseOffset: { value: flagParams.phaseOffset },
      uStretchFactor: { value: 0.0 },
      uFrontTexture: { value: frontTexture },
      uBackTexture: { value: backTexture },
      uFlipProgress: { value: 0.0 },
      uEmissive: { value: 0.0 },
    }),
    [flagParams, frontTexture, backTexture],
  );

  useFrame(({ clock }, delta) => {
    if (materialRef.current && meshRef.current) {
      const state = animationState.current;

      // Skip every other frame for performance
      state.frameSkipCounter++;
      if (state.frameSkipCounter % 2 !== 0 && !isStretched) return;

      const clampedDelta = Math.min(delta, 0.05);
      const time = clock.getElapsedTime();

      // Only update wave time if near camera - freezes waves when far for performance
      if (isNearCamera) {
        materialRef.current.uniforms.uTime.value = time;
      }

      // Simplified spring physics
      const spring = (
        current: number,
        target: number,
        velocity: number,
        stiffness: number,
        damping: number,
      ) => {
        const force = (target - current) * stiffness;
        velocity += force * clampedDelta;
        velocity *= damping;
        return { value: current + velocity * clampedDelta, velocity };
      };

      // Detect state transition
      if (isStretched !== state.wasStretched) {
        state.anticipationPhase = 0;
        state.wasStretched = isStretched;
      }

      // Main animation with spring physics - very gentle expansion
      const targetStretch = isStretched ? 1.0 : 0.0;
      const stretchResult = spring(
        state.stretchProgress,
        targetStretch,
        state.scaleVelocity,
        2, // Extremely low stiffness for ultra-smooth start
        0.95, // Very high damping to prevent any snap
      );
      state.stretchProgress = stretchResult.value;
      state.scaleVelocity = stretchResult.velocity;

      // Apply cubic ease-in to stretch progress for ultra-gentle start
      const easedStretch =
        state.stretchProgress < 0.5
          ? 4 *
            state.stretchProgress *
            state.stretchProgress *
            state.stretchProgress
          : 1 - Math.pow(-2 * state.stretchProgress + 2, 3) / 2;

      materialRef.current.uniforms.uStretchFactor.value = easedStretch;

      // Flip progress - faster rotation
      const targetFlip = isStretched ? 1.0 : 0.0;
      const flipSpeed = isStretched ? 0.4 : 0.25; // Much faster rotation speed
      const flipDiff = targetFlip - state.flipProgress;
      state.flipProgress += flipDiff * Math.min(clampedDelta * flipSpeed, 1);
      materialRef.current.uniforms.uFlipProgress.value = state.flipProgress;

      // Natural cloth folding
      const foldPhase = Math.sin(state.flipProgress * Math.PI);

      // Simplified rotation
      const rotationT =
        state.flipProgress < 0.5
          ? 4 * state.flipProgress * state.flipProgress * state.flipProgress
          : 1 - Math.pow(-2 * state.flipProgress + 2, 3) / 2;

      // Reduced flutter
      const flutter = Math.sin(time * 5) * 0.01 * foldPhase;

      // Simplified idle rotation
      const stretchedIntensity = isStretched ? 1.5 : 1.0;
      const idleRotation =
        (1.0 - foldPhase * 0.7) *
        stretchedIntensity *
        Math.sin(time * 0.6 + index * 0.5) *
        0.015;

      meshRef.current.rotation.y = rotationT * Math.PI + flutter + idleRotation;
      meshRef.current.rotation.x =
        Math.sin(time * 0.3 + index) *
        0.008 *
        (1.0 - foldPhase * 0.7) *
        stretchedIntensity;

      // Simplified scale
      const targetScaleX = isStretched ? 1.5 : 1.0;
      const targetScaleY = isStretched ? 1.12 : 1.0;

      const foldCompress = 1.0 - foldPhase * 0.35;
      const foldThicken = 1.0 + foldPhase * 0.12;

      const baseScaleX = state.stretchProgress * (targetScaleX - 1) + 1;
      const baseScaleY = state.stretchProgress * (targetScaleY - 1) + 1;

      const scaleX = baseScaleX * foldCompress;
      const scaleY = baseScaleY * foldThicken;
      const scaleZ = 1.0 + foldPhase * 0.06;

      // Reduced breathing
      const breathingIntensity = state.stretchProgress;
      const breathing = Math.sin(time * 2) * 0.02 * breathingIntensity;

      meshRef.current.scale.set(
        scaleX + breathing,
        scaleY + breathing * 0.5,
        scaleZ,
      );

      // Simplified wobble
      const wobble = Math.sin(time * 1.2) * 0.008 * breathingIntensity;
      meshRef.current.rotation.z = wobble;
    }
  });

  const segments = isMiniature ? 8 : 16; // Balanced performance and quality
  const baseWidth = 4;
  const baseHeight = 2.5;

  // Smoothly interpolate geometry size instead of instant change
  const targetWidth = isStretched ? 8 : baseWidth;
  const targetHeight = isStretched ? 5 : baseHeight;
  const width =
    baseWidth +
    (targetWidth - baseWidth) * animationState.current.stretchProgress;
  const height =
    baseHeight +
    (targetHeight - baseHeight) * animationState.current.stretchProgress;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          onClick?.(e);
        }}
        onPointerOver={() => onHover?.(true)}
        onPointerOut={() => onHover?.(false)}
      >
        <planeGeometry args={[width, height, segments, segments]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export default React.memo(FlagCard);
