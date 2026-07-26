import React, { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

export const InteractiveCursor: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -100, y: -100, lastX: -100, lastY: -100 });
  const particlesRef = useRef<Particle[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Only enable on desktop/mouse devices and when reduced motion is not preferred
    if (prefersReducedMotion || window.innerWidth < 1024) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Hide normal cursor
    document.documentElement.classList.add('custom-cursor-active');

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.lastX = mouseRef.current.x;
      mouseRef.current.lastY = mouseRef.current.y;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      // Spawn particles on motion
      const dx = mouseRef.current.x - mouseRef.current.lastX;
      const dy = mouseRef.current.y - mouseRef.current.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);

      if (speed > 1) {
        const count = Math.min(3, Math.floor(speed / 4) + 1);
        for (let i = 0; i < count; i++) {
          particlesRef.current.push({
            x: mouseRef.current.x,
            y: mouseRef.current.y,
            // Particles drift backward opposite of motion
            vx: -dx * 0.15 + (Math.random() - 0.5) * 1.5,
            vy: -dy * 0.15 + (Math.random() - 0.5) * 1.5,
            size: Math.random() * 3 + 1,
            alpha: 1,
            color: Math.random() > 0.4 ? '#00f0ff' : '#9d4edd',
          });
        }
      }
    };

    const handleMouseDown = () => {
      // Click burst
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        particlesRef.current.push({
          x: mouseRef.current.x,
          y: mouseRef.current.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 1.5,
          alpha: 1,
          color: Math.random() > 0.5 ? '#00ff66' : '#00f0ff',
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });

    // Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render custom pointer HUD circle
      ctx.save();
      ctx.globalAlpha = 0.85;
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      
      // Outer ring
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 6, 0, Math.PI * 2);
      ctx.stroke();

      // Inner dot
      ctx.fillStyle = '#00f0ff';
      ctx.beginPath();
      ctx.arc(mouseRef.current.x, mouseRef.current.y, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Update & Draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        
        // Pushes particles slightly away from cursor if close (repell effect)
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40 && dist > 5) {
          p.vx += (dx / dist) * 0.15;
          p.vy += (dy / dist) * 0.15;
        }

        p.alpha -= 0.025; // fade rate
        p.size = Math.max(0, p.size - 0.05);

        if (p.alpha <= 0 || p.size <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = p.size > 2 ? 6 : 0;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || typeof window === 'undefined' || window.innerWidth < 1024) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[99999] mix-blend-screen"
    />
  );
};
export default InteractiveCursor;
