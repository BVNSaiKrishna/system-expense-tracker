import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  baseOpacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface FogCircle {
  x: number;
  y: number;
  radius: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

export const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { animationsEnabled } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const width = canvas.width;
    const height = canvas.height;

    // Layer 2: Stars setup
    const stars: Particle[] = [];
    const starCount = Math.floor((width * height) / 16000); // Responsive density
    for (let i = 0; i < starCount; i++) {
      const baseOpacity = Math.random() * 0.4 + 0.1;
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.2 + 0.3,
        speedX: (Math.random() - 0.5) * 0.05,
        speedY: (Math.random() - 0.5) * 0.05,
        opacity: baseOpacity,
        baseOpacity,
        twinkleSpeed: Math.random() * 0.01 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    // Layer 3: Fog circles setup
    const fogCircles: FogCircle[] = [];
    const fogCount = 12;
    for (let i = 0; i < fogCount; i++) {
      fogCircles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 200 + 150,
        speedX: (Math.random() * 0.15 + 0.05),
        speedY: (Math.random() - 0.5) * 0.05,
        opacity: Math.random() * 0.02 + 0.005
      });
    }

    // Layer 4: Floating particles setup
    const floaters: Particle[] = [];
    const floaterCount = Math.floor((width * height) / 25000);
    for (let i = 0; i < floaterCount; i++) {
      const baseOpacity = Math.random() * 0.25 + 0.05;
      floaters.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: -(Math.random() * 0.25 + 0.08), // upwards float
        opacity: baseOpacity,
        baseOpacity,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2
      });
    }

    let time = 0;

    const render = () => {
      // Background gradient cleared per frame
      ctx.clearRect(0, 0, width, height);

      time += 0.5;

      // 1. Draw Layer 2: Moving & Twinkling Stars
      stars.forEach((star) => {
        if (animationsEnabled) {
          star.x += star.speedX;
          star.y += star.speedY;

          // Twinkle logic
          star.twinklePhase += star.twinkleSpeed;
          star.opacity = star.baseOpacity + Math.sin(star.twinklePhase) * (star.baseOpacity * 0.6);

          // Wrap boundaries
          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;
        }

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 2. Draw Layer 6: Subtle Sweeping Light Rays (Drawn behind fog for scattering effect)
      ctx.save();
      const rayGradient = ctx.createLinearGradient(0, 0, width, height);
      const sweep = Math.sin(time * 0.001) * 0.15;
      rayGradient.addColorStop(0, '#090B12');
      rayGradient.addColorStop(0.3 + sweep, 'rgba(0, 200, 255, 0.015)');
      rayGradient.addColorStop(0.5 + sweep, 'rgba(255, 255, 255, 0.005)');
      rayGradient.addColorStop(0.7 + sweep, 'rgba(0, 200, 255, 0.015)');
      rayGradient.addColorStop(1, '#090B12');
      ctx.fillStyle = rayGradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 3. Draw Layer 3: Moving Fog Sheets
      fogCircles.forEach((fog) => {
        if (animationsEnabled) {
          fog.x += fog.speedX;
          fog.y += fog.speedY;

          if (fog.x - fog.radius > width) {
            fog.x = -fog.radius;
          }
          if (fog.y < -fog.radius) fog.y = height + fog.radius;
          if (fog.y > height + fog.radius) fog.y = -fog.radius;
        }

        const radial = ctx.createRadialGradient(
          fog.x, fog.y, 0,
          fog.x, fog.y, fog.radius
        );
        radial.addColorStop(0, `rgba(0, 200, 255, ${fog.opacity})`);
        radial.addColorStop(0.5, `rgba(168, 85, 247, ${fog.opacity * 0.4})`);
        radial.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(fog.x, fog.y, fog.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 4. Draw Layer 5: Blue Energy Waves (Smooth flowing sine waves)
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 200, 255, 0.04)';
      ctx.lineWidth = 1.5;

      const drawWave = (amplitude: number, freq: number, phaseOffset: number, yOffset: number) => {
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const y = Math.sin(x * freq + (time * 0.008) + phaseOffset) * amplitude + yOffset;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      };

      // Wave 1
      drawWave(25, 0.002, 0, height * 0.75);
      // Wave 2 (slightly offset, counter flow)
      ctx.strokeStyle = 'rgba(77, 217, 255, 0.03)';
      drawWave(18, 0.003, Math.PI, height * 0.78);
      ctx.restore();

      // 5. Draw Layer 4: Floating Particles
      floaters.forEach((floater) => {
        if (animationsEnabled) {
          floater.x += floater.speedX + Math.sin(time * 0.02 + floater.twinklePhase) * 0.1;
          floater.y += floater.speedY;

          // Gentle alpha pulsing
          floater.twinklePhase += floater.twinkleSpeed;
          floater.opacity = floater.baseOpacity + Math.sin(floater.twinklePhase) * (floater.baseOpacity * 0.3);

          // Boundaries
          if (floater.y < -10) {
            floater.y = height + 10;
            floater.x = Math.random() * width;
          }
          if (floater.x < 0) floater.x = width;
          if (floater.x > width) floater.x = 0;
        }

        ctx.fillStyle = `rgba(0, 200, 255, ${floater.opacity})`;
        ctx.beginPath();
        ctx.arc(floater.x, floater.y, floater.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (animationsEnabled) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [animationsEnabled, dimensions]);

  return (
    <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-[#090B12] transition-colors duration-1000">
      {/* Layer 1: Animated shifting radial gradients (CSS driven) */}
      <div
        className="absolute inset-0 bg-[#090B12] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 10% 20%, rgba(0, 200, 255, 0.04) 0%, transparent 45%),
            radial-gradient(circle at 90% 80%, rgba(168, 85, 247, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(17, 24, 39, 0.95) 0%, #090B12 100%)
          `,
          animation: animationsEnabled ? 'pulse-slow 20s infinite ease-in-out' : 'none',
        }}
      />

      {/* Layers 2, 3, 4, 5, 6: Canvas Rendered Elements */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-90"
      />

      {/* Subtle bottom vignette to blend content area */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_30%,rgba(9,11,18,0.4)_100%)]" />
    </div>
  );
};

export default DynamicBackground;
