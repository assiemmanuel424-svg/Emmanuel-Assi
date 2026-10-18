import React, { useEffect, useRef } from 'react';
import { Brain } from 'lucide-react';
import { JarvisState } from '../types/jarvis';

interface JarvisBreathingSphereProps {
  state: JarvisState;
  soundLevel?: number; // 0 to 1
  onClick?: () => void;
  disabled?: boolean;
}

interface Point3D {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  size: number;
  pulsePhase: number;
}

export const JarvisBreathingSphere: React.FC<JarvisBreathingSphereProps> = ({
  state,
  soundLevel = 0,
  onClick,
  disabled = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const rotYRef = useRef<number>(0);
  const rotXRef = useRef<number>(0.2);
  const rotZRef = useRef<number>(0.1);
  const breathPhaseRef = useRef<number>(0);

  const getStateTheme = () => {
    switch (state) {
      case 'listening':
        return {
          label: 'Listening...',
          labelColor: 'text-cyan-300',
          baseColor: [0, 240, 255], // cyan
          coreGlow: 'rgba(0, 240, 255, 0.35)',
          rotSpeed: 0.02,
          breathSpeed: 0.045,
          meshAlpha: 0.45,
        };
      case 'thinking':
        return {
          label: 'Thinking...',
          labelColor: 'text-amber-300',
          baseColor: [245, 158, 11], // amber
          coreGlow: 'rgba(245, 158, 11, 0.35)',
          rotSpeed: 0.035,
          breathSpeed: 0.06,
          meshAlpha: 0.5,
        };
      case 'speaking':
        return {
          label: 'Speaking...',
          labelColor: 'text-sky-300',
          baseColor: [56, 189, 248], // sky blue
          coreGlow: 'rgba(56, 189, 248, 0.35)',
          rotSpeed: 0.022,
          breathSpeed: 0.04,
          meshAlpha: 0.4,
        };
      case 'idle':
      default:
        return {
          label: 'Ready',
          labelColor: 'text-slate-400',
          baseColor: [0, 220, 245], // electric cyan
          coreGlow: 'rgba(0, 240, 255, 0.15)',
          rotSpeed: 0.009,
          breathSpeed: 0.022,
          meshAlpha: 0.3,
        };
    }
  };

  const theme = getStateTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const width = 280;
    const height = 280;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Initialize Fibonacci Sphere points
    const NUM_POINTS = 140;
    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle
    const points: Point3D[] = [];

    for (let i = 0; i < NUM_POINTS; i++) {
      const y = 1 - (i / (NUM_POINTS - 1)) * 2; // y goes from 1 to -1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x,
        y,
        z,
        origX: x,
        origY: y,
        origZ: z,
        size: 1.2 + Math.random() * 1.4,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    // Rings generation (Equator + 2 Tilted Orbital Rings)
    const RING_POINTS = 48;
    const createRing = (tiltX: number, tiltZ: number) => {
      const ringPts: Point3D[] = [];
      for (let i = 0; i < RING_POINTS; i++) {
        const angle = (i / RING_POINTS) * Math.PI * 2;
        let rx = Math.cos(angle);
        let ry = 0;
        let rz = Math.sin(angle);

        // Apply tilt
        const cosX = Math.cos(tiltX);
        const sinX = Math.sin(tiltX);
        const y1 = ry * cosX - rz * sinX;
        const z1 = ry * sinX + rz * cosX;

        const cosZ = Math.cos(tiltZ);
        const sinZ = Math.sin(tiltZ);
        const x2 = rx * cosZ - y1 * sinZ;
        const y2 = rx * sinZ + y1 * cosZ;

        ringPts.push({
          x: x2,
          y: y2,
          z: z1,
          origX: x2,
          origY: y2,
          origZ: z1,
          size: 1.0,
          pulsePhase: i * 0.2,
        });
      }
      return ringPts;
    };

    const ring1 = createRing(0, 0); // Equator
    const ring2 = createRing(Math.PI / 4, Math.PI / 6); // Tilted 45 deg
    const ring3 = createRing(-Math.PI / 3.5, -Math.PI / 5); // Tilted -50 deg

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Breathing Cycle ("permet que la sphère puisse respirer")
      // Natural sine harmonic respiration
      breathPhaseRef.current += theme.breathSpeed;
      const breathingWave = Math.sin(breathPhaseRef.current);
      // Smooth breathing scale factor (inhale / exhale oscillation)
      const breathScale = 1 + breathingWave * 0.085 + soundLevel * 0.18;

      // 3D Sphere base radius
      const sphereRadius = 82 * breathScale;
      const centerX = width / 2;
      const centerY = height / 2;

      // Rotation updates
      rotYRef.current += theme.rotSpeed;
      rotXRef.current += theme.rotSpeed * 0.35;
      rotZRef.current += theme.rotSpeed * 0.2;

      const cosY = Math.cos(rotYRef.current);
      const sinY = Math.sin(rotYRef.current);
      const cosX = Math.cos(rotXRef.current);
      const sinX = Math.sin(rotXRef.current);

      // 1. Draw Central Glowing Core Aura
      const [r, g, b] = theme.baseColor;
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        sphereRadius * 0.15,
        centerX,
        centerY,
        sphereRadius * 1.35
      );
      const auraAlpha = 0.18 + Math.max(0, breathingWave) * 0.12 + soundLevel * 0.25;
      auraGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${auraAlpha * 1.6})`);
      auraGradient.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${auraAlpha * 0.6})`);
      auraGradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${auraAlpha * 0.15})`);
      auraGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, sphereRadius * 1.35, 0, Math.PI * 2);
      ctx.fillStyle = auraGradient;
      ctx.fill();

      // 2. Rotate & Project all sphere points
      const projectedPoints = points.map((p) => {
        // Y-axis rotation
        let x1 = p.origX * cosY - p.origZ * sinY;
        let z1 = p.origX * sinY + p.origZ * cosY;

        // X-axis rotation
        let y2 = p.origY * cosX - z1 * sinX;
        let z2 = p.origY * sinX + z1 * cosX;

        // Dynamic surface breathing pulse per node
        const nodePulse = Math.sin(breathPhaseRef.current + p.pulsePhase) * 0.04;
        const currentR = sphereRadius * (1 + nodePulse);

        // Perspective projection
        const fov = 320;
        const distance = fov / (fov + z2 * currentR * 0.7);
        const projX = centerX + x1 * currentR * distance;
        const projY = centerY + y2 * currentR * distance;

        return {
          x: projX,
          y: projY,
          z: z2,
          dist: distance,
          size: p.size * distance,
        };
      });

      // Sort points back-to-front for proper depth sorting
      projectedPoints.sort((a, b) => a.z - b.z);

      // 3. Draw Connecting Neural Constellation Lines between close front nodes
      ctx.lineWidth = 0.75;
      for (let i = 0; i < projectedPoints.length; i++) {
        const p1 = projectedPoints[i];
        if (p1.z < -0.15) continue; // Skip far back points for lines to prevent clutter

        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p2 = projectedPoints[j];
          if (p2.z < -0.15) continue;

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 750) {
            const lineAlpha = (1 - distSq / 750) * theme.meshAlpha * Math.max(0, (p1.z + p2.z) / 2 + 0.3);
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // 4. Draw Rotating Orbital Rings
      const drawRing = (ringPoints: Point3D[], ringAlpha: number) => {
        ctx.beginPath();
        let first = true;
        for (let i = 0; i <= ringPoints.length; i++) {
          const pt = ringPoints[i % ringPoints.length];
          // Rotate ring point
          let x1 = pt.origX * cosY - pt.origZ * sinY;
          let z1 = pt.origX * sinY + pt.origZ * cosY;

          let y2 = pt.origY * cosX - z1 * sinX;
          let z2 = pt.origY * sinX + z1 * cosX;

          const fov = 320;
          const distance = fov / (fov + z2 * sphereRadius * 0.7);
          const px = centerX + x1 * (sphereRadius * 1.08) * distance;
          const py = centerY + y2 * (sphereRadius * 1.08) * distance;

          if (first) {
            ctx.moveTo(px, py);
            first = false;
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ringAlpha})`;
        ctx.stroke();
      };

      drawRing(ring1, 0.25 + breathingWave * 0.08);
      drawRing(ring2, 0.2 + breathingWave * 0.05);
      drawRing(ring3, 0.18 + breathingWave * 0.05);

      // 5. Draw 3D Spherical Nodes with Depth-dependent Glow
      for (const p of projectedPoints) {
        // Depth-based brightness & opacity
        const depthNorm = (p.z + 1) / 2; // 0 (back) to 1 (front)
        const pointAlpha = 0.2 + depthNorm * 0.8;
        const currentSize = p.size * (0.8 + depthNorm * 0.6);

        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pointAlpha})`;
        ctx.fill();

        // Extra bloom on prominent front nodes
        if (p.z > 0.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentSize * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pointAlpha * 0.25})`;
          ctx.fill();
        }
      }

      // 6. Center Energy Nucleus
      const nucleusRadius = 26 * breathScale;
      const nucleusGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        2,
        centerX,
        centerY,
        nucleusRadius
      );
      nucleusGrad.addColorStop(0, `rgba(255, 255, 255, 0.95)`);
      nucleusGrad.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, 0.8)`);
      nucleusGrad.addColorStop(0.75, `rgba(${r}, ${g}, ${b}, 0.25)`);
      nucleusGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
      ctx.fillStyle = nucleusGrad;
      ctx.fill();

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [state, soundLevel, theme]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-2">
      {/* Interactive 3D Sphere Trigger */}
      <div
        onClick={!disabled ? onClick : undefined}
        className={`group relative flex items-center justify-center cursor-pointer transition-transform duration-300 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
        }`}
        title={
          state === 'speaking'
            ? 'Cliquer pour interrompre la parole'
            : state === 'listening'
            ? 'Cliquer pour stopper l\'écoute'
            : 'Cliquer pour parler à J.A.R.V.I.S.'
        }
      >
        {/* HTML5 3D Animated Breathing & Rotating Sphere Canvas */}
        <canvas
          ref={canvasRef}
          className="relative w-[280px] h-[280px] pointer-events-auto"
          style={{ width: 280, height: 280 }}
        />

        {/* Floating Holographic Center Brain Icon Inside Nucleus */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-black/40 border border-cyan-400/50 shadow-[0_0_15px_rgba(0,240,255,0.6)] backdrop-blur-sm">
            <Brain
              className={`w-6 h-6 transition-all duration-300 ${
                state === 'listening'
                  ? 'text-cyan-200 animate-pulse scale-110 drop-shadow-[0_0_12px_rgba(0,240,255,1)]'
                  : state === 'thinking'
                  ? 'text-amber-300 animate-spin-slow drop-shadow-[0_0_12px_rgba(245,158,11,1)]'
                  : state === 'speaking'
                  ? 'text-sky-200 drop-shadow-[0_0_10px_rgba(56,189,248,1)]'
                  : 'text-cyan-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]'
              }`}
            />
          </div>
        </div>
      </div>

      {/* State Text Label matching images.jpg ("Ready", "Listening...", "Thinking...", "Speaking...") */}
      <div className="mt-1 text-center">
        <span
          className={`font-sans text-xs tracking-wider font-semibold transition-colors ${theme.labelColor}`}
        >
          {theme.label}
        </span>
      </div>
    </div>
  );
};
