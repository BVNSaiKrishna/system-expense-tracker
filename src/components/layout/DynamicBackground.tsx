import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useMouseParallax } from '../../hooks/useMouseParallax';
import { useDeviceTilt } from '../../hooks/useDeviceTilt';

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  alpha: number;
  color: string;
  type: 'star' | 'weather' | 'burst';
  vy?: number;
}

interface Rune {
  x: number;
  y: number;
  text: string;
  size: number;
  rotation: number;
  rotSpeed: number;
  alpha: number;
  fadeSpeed: number;
}

interface Crack {
  id: string;
  points: { x: number; y: number }[];
  alpha: number;
}

interface Dragon {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  flap: number;
  flapSpeed: number;
  alpha: number;
  direction: 1 | -1;
}

interface VortexParticle {
  angle: number;
  radius: number;
  speed: number;
  size: number;
  alpha: number;
  color: string;
}

export const DynamicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  // Parallax hooks
  const mouseCoords = useMouseParallax(12);
  const tiltCoords = useDeviceTilt(10);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Time-of-day state
  const [todClass, setTodClass] = useState('tod-night');
  
  // Weather state (Optional: clear, rain, snow, fog)
  const [weather, setWeather] = useState<'clear' | 'rain' | 'snow' | 'fog'>('clear');

  // Lightning state
  const [lightningActive, setLightningActive] = useState(false);

  // Energy cracks state
  const [cracks, setCracks] = useState<Crack[]>([]);

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', handleResize);
    
    // 1. Determine Time-of-day class
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) setTodClass('tod-morning');
      else if (hour >= 12 && hour < 17) setTodClass('tod-afternoon');
      else if (hour >= 17 && hour < 21) setTodClass('tod-evening');
      else setTodClass('tod-night');
    };
    updateTimeOfDay();
    const todInterval = setInterval(updateTimeOfDay, 60000);

    // Weather and visual effects are only activated on Desktop to keep mobile devices extremely lightweight
    let weatherInterval: any = null;
    let lightningTimer: any = null;
    let cracksTimer: any = null;

    if (isDesktop) {
      // 2. Slow Weather Shifter (change weather every 60s)
      const weathers: Array<'clear' | 'rain' | 'snow' | 'fog'> = ['clear', 'rain', 'snow', 'fog'];
      weatherInterval = setInterval(() => {
        const randomWeather = weathers[Math.floor(Math.random() * weathers.length)];
        setWeather(randomWeather);
      }, 60000);

      // 3. Lightning generator (every 20 to 40 seconds)
      const triggerLightning = () => {
        if (Math.random() > 0.4) {
          setLightningActive(true);
          setTimeout(() => setLightningActive(false), 80);
          setTimeout(() => {
            setLightningActive(true);
            setTimeout(() => setLightningActive(false), 50);
          }, 130);
        }
        
        const nextDelay = (20 + Math.random() * 20) * 1000;
        lightningTimer = setTimeout(triggerLightning, nextDelay);
      };
      lightningTimer = setTimeout(triggerLightning, 25000);

      // 4. Energy cracks generator (random intervals)
      const triggerCracks = () => {
        const id = Math.random().toString(36).substring(2, 9);
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        
        // Build a lightning-like crack path
        const startX = Math.random() * screenWidth;
        const startY = 0;
        const points = [{ x: startX, y: startY }];
        let currentX = startX;
        let currentY = startY;

        while (currentY < screenHeight) {
          currentY += Math.random() * 80 + 30;
          currentX += (Math.random() - 0.5) * 60;
          points.push({ x: currentX, y: currentY });
        }

        setCracks((prev) => [...prev, { id, points, alpha: 0.8 }]);

        // Fade out crack slowly
        const fadeInterval = setInterval(() => {
          setCracks((prev) =>
            prev.map((c) => (c.id === id ? { ...c, alpha: c.alpha - 0.05 } : c))
          );
        }, 80);

        setTimeout(() => {
          clearInterval(fadeInterval);
          setCracks((prev) => prev.filter((c) => c.id !== id));
        }, 1600);

        const nextDelay = (15 + Math.random() * 20) * 1000;
        cracksTimer = setTimeout(triggerCracks, nextDelay);
      };
      cracksTimer = setTimeout(triggerCracks, 10000);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(todInterval);
      if (weatherInterval) clearInterval(weatherInterval);
      if (lightningTimer) clearTimeout(lightningTimer);
      if (cracksTimer) clearTimeout(cracksTimer);
    };
  }, [isDesktop]);

  // CANVAS DRAWING (Stars, weather, runes)
  useEffect(() => {
    if (prefersReducedMotion || !isDesktop) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const vortexCenter = { x: w * 0.15, y: h * 0.45 };
    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      vortexCenter.x = w * 0.15;
      vortexCenter.y = h * 0.45;
    };
    window.addEventListener('resize', handleResize);

    // RPG Magical Runes characters list
    const RUNE_TEXTS = ['᚛', '᚜', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ'];

    const particles: Particle[] = [];
    const runes: Rune[] = [];
    let activeDragon: Dragon | null = null;
    
    const vortexParticles: VortexParticle[] = [];
    for (let i = 0; i < 60; i++) {
      vortexParticles.push({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 120 + 20,
        speed: Math.random() * 0.015 + 0.005,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.4 ? '#00f0ff' : '#9d4edd',
      });
    }

    // Initialize 80 stars
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.04 + 0.01,
        alpha: Math.random(),
        color: ['#00f0ff', '#ffffff', '#9d4edd'][Math.floor(Math.random() * 3)],
        type: 'star',
      });
    }

    // Initialize 8 runes
    for (let i = 0; i < 6; i++) {
      runes.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.7),
        text: RUNE_TEXTS[Math.floor(Math.random() * RUNE_TEXTS.length)],
        size: Math.random() * 16 + 10,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.005,
        alpha: Math.random() * 0.4,
        fadeSpeed: (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1),
      });
    }

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, w, h);

      // 1.5 Draw Swirling Vortex Portal
      vortexParticles.forEach((vp) => {
        vp.angle += vp.speed;
        vp.radius -= 0.35;
        if (vp.radius <= 5) {
          vp.radius = Math.random() * 100 + 80;
          vp.alpha = Math.random() * 0.8 + 0.2;
          vp.angle = Math.random() * Math.PI * 2;
        }

        const px = vortexCenter.x + Math.cos(vp.angle) * vp.radius;
        const py = vortexCenter.y + Math.sin(vp.angle) * vp.radius;

        ctx.save();
        ctx.globalAlpha = vp.alpha * 0.65;
        ctx.fillStyle = vp.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = vp.color;
        ctx.beginPath();
        ctx.arc(px, py, vp.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 1.6 Draw Monarch Silhouette standing under the portal
      const mx = w * 0.15;
      const my = h;
      
      ctx.save();
      ctx.fillStyle = '#020617';
      ctx.shadowBlur = 12;
      ctx.shadowColor = '#00f0ff';

      const waveTime = Date.now() * 0.003;
      const capeWave = Math.sin(waveTime) * 4;

      ctx.beginPath();
      ctx.moveTo(mx - 20, my);
      ctx.lineTo(mx - 15, my - 60);
      ctx.lineTo(mx - 22, my - 100);
      ctx.lineTo(mx - 4, my - 110);
      ctx.lineTo(mx - 8, my - 124);
      ctx.lineTo(mx - 2, my - 128);
      ctx.lineTo(mx, my - 134);
      ctx.lineTo(mx + 3, my - 128);
      ctx.lineTo(mx + 8, my - 124);
      ctx.lineTo(mx + 4, my - 110);
      ctx.lineTo(mx + 22, my - 100);
      ctx.lineTo(mx + 15, my - 60);
      ctx.lineTo(mx + 20, my);
      ctx.closePath();
      ctx.fill();

      // Cape flapping left
      ctx.beginPath();
      ctx.moveTo(mx - 15, my - 95);
      ctx.quadraticCurveTo(mx - 35 + capeWave, my - 55, mx - 45 + capeWave * 1.5, my - 10);
      ctx.quadraticCurveTo(mx - 25 + capeWave, my - 25, mx - 10, my - 50);
      ctx.closePath();
      ctx.fill();

      // Cape flapping right
      ctx.beginPath();
      ctx.moveTo(mx + 15, my - 95);
      ctx.quadraticCurveTo(mx + 35 - capeWave, my - 55, mx + 45 - capeWave * 1.5, my - 10);
      ctx.quadraticCurveTo(mx + 25 - capeWave, my - 25, mx + 10, my - 50);
      ctx.closePath();
      ctx.fill();

      // Monarch Sigil Glow
      ctx.fillStyle = '#00f0ff';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00f0ff';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(mx, my - 120, 1.2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();

      // 1. Draw Starfield
      particles.forEach((p) => {
        if (p.type === 'star') {
          p.x -= p.speed;
          if (p.x < 0) p.x = w;
          
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // 2. Draw Weather Layer (Throttled/Generated in render loop)
      if (weather === 'rain') {
        // Spawn 3 rain drops per frame
        if (particles.filter((p) => p.type === 'weather').length < 150) {
          particles.push({
            x: Math.random() * w,
            y: -10,
            size: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 8 + 6,
            alpha: Math.random() * 0.4 + 0.2,
            color: 'rgba(0, 229, 255, 0.4)',
            type: 'weather',
            vy: Math.random() * 8 + 6,
          });
        }
      } else if (weather === 'snow') {
        // Spawn 2 snow flakes per frame
        if (particles.filter((p) => p.type === 'weather').length < 100) {
          particles.push({
            x: Math.random() * w,
            y: -10,
            size: Math.random() * 2.5 + 1,
            speed: Math.random() * 1 + 0.5,
            alpha: Math.random() * 0.5 + 0.2,
            color: '#ffffff',
            type: 'weather',
            vy: Math.random() * 1.2 + 0.6,
          });
        }
      }

      // Update and draw weather particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.type === 'weather') {
          p.y += p.vy || p.speed;
          if (weather === 'snow') p.x += Math.sin(p.y * 0.05) * 0.3; // snow drift

          if (p.y > h) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath();
          if (weather === 'rain') {
            ctx.strokeStyle = p.color;
            ctx.lineWidth = p.size;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x - 1, p.y + 12);
            ctx.stroke();
          } else {
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      // 3. Draw Magical Runes
      runes.forEach((r) => {
        r.rotation += r.rotSpeed;
        r.alpha += r.fadeSpeed;
        if (r.alpha > 0.4) {
          r.alpha = 0.4;
          r.fadeSpeed = -r.fadeSpeed;
        } else if (r.alpha < 0.02) {
          r.alpha = 0.02;
          r.fadeSpeed = -r.fadeSpeed;
          // select a new rune text and place randomly when faded out
          r.text = RUNE_TEXTS[Math.floor(Math.random() * RUNE_TEXTS.length)];
          r.x = Math.random() * w;
          r.y = Math.random() * (h * 0.7);
        }

        ctx.save();
        ctx.globalAlpha = r.alpha;
        ctx.font = `${r.size}px 'Orbitron', 'Inter'`;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#00f0ff';
        ctx.translate(r.x, r.y);
        ctx.rotate(r.rotation);
        ctx.fillText(r.text, -r.size / 2, r.size / 2);
        ctx.restore();
      });

      // 4. Draw Flying Dragon
      if (!activeDragon) {
        // 1 in 1000 chance per frame to spawn a dragon
        if (Math.random() < 0.0008) {
          const dir = Math.random() > 0.5 ? 1 : -1;
          activeDragon = {
            x: dir === 1 ? -80 : w + 80,
            y: Math.random() * (h * 0.45) + 30, // fly in the upper sky
            vx: (Math.random() * 1.2 + 0.6) * dir,
            vy: (Math.random() - 0.5) * 0.25,
            size: Math.random() * 20 + 20,
            flap: 0,
            flapSpeed: Math.random() * 0.05 + 0.08,
            alpha: Math.random() * 0.16 + 0.08, // low opacity silhouette
            direction: dir,
          };
        }
      } else {
        // Update dragon
        activeDragon.x += activeDragon.vx;
        activeDragon.y += activeDragon.vy;
        activeDragon.flap += activeDragon.flapSpeed;

        const outRight = activeDragon.direction === 1 && activeDragon.x > w + 100;
        const outLeft = activeDragon.direction === -1 && activeDragon.x < -100;
        if (outRight || outLeft) {
          activeDragon = null;
        } else {
          // Draw dragon silhouette
          const d = activeDragon;
          ctx.save();
          ctx.globalAlpha = d.alpha;
          
          // Color based on active time of day/theme, neon cyan glow
          ctx.fillStyle = '#00f0ff';
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#00f0ff';

          ctx.translate(d.x, d.y);
          if (d.direction === -1) {
            ctx.scale(-1, 1);
          }

          // Draw body
          ctx.beginPath();
          ctx.moveTo(-d.size * 0.5, 0); // Tail root
          ctx.quadraticCurveTo(0, -d.size * 0.1, d.size * 0.35, -d.size * 0.15); // neck
          ctx.lineTo(d.size * 0.45, -d.size * 0.2); // Head tip
          ctx.lineTo(d.size * 0.38, -d.size * 0.06); // jaw
          ctx.quadraticCurveTo(0, 0, -d.size * 0.5, 0);
          ctx.fill();

          // Draw wing (flapping)
          const flapY = Math.sin(d.flap) * d.size * 0.4;
          ctx.beginPath();
          ctx.moveTo(0, -d.size * 0.08); // wing root
          ctx.quadraticCurveTo(-d.size * 0.1, -d.size * 0.4 + flapY, -d.size * 0.28, -d.size * 0.5 + flapY); // tip
          ctx.lineTo(-d.size * 0.24, -d.size * 0.15 + flapY * 0.3); // back
          ctx.lineTo(0, -d.size * 0.08);
          ctx.fill();

          // Draw tail wave line
          ctx.beginPath();
          ctx.moveTo(-d.size * 0.5, 0);
          const tailWaveY = Math.sin(d.flap * 0.7) * d.size * 0.12;
          ctx.quadraticCurveTo(-d.size * 0.75, tailWaveY, -d.size * 0.95, tailWaveY * 1.2);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          ctx.restore();
        }
      }

      animFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animFrame);
    };
  }, [prefersReducedMotion, weather, isDesktop]);

  // Combine Parallax Coordinates
  const px = isDesktop ? mouseCoords.x : tiltCoords.x;
  const py = isDesktop ? mouseCoords.y : tiltCoords.y;

  return (
    <div
      className={`fixed inset-0 w-full h-full -z-50 overflow-hidden transition-colors duration-1000 ${todClass}`}
      style={{
        transform: `translate3d(${px}px, ${py}px, 0) scale(1.02)`,
      }}
    >
      {/* Layer 1: Grid scrolling */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none animate-grid-move" />

      {/* Layer 2: Starfield / Weather Canvas */}
      {!prefersReducedMotion && isDesktop && (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
        />
      )}

      {/* Layer 3: Neon Fog Radial Sheets */}
      {!prefersReducedMotion && isDesktop && (
        <>
          <motion.div
            className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-neon-blue/8 blur-[120px]"
            animate={{
              x: [0, 40, -20, 0],
              y: [0, -30, 20, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-neon-purple/7 blur-[160px]"
            animate={{
              x: [0, -50, 30, 0],
              y: [0, 30, -30, 0],
            }}
            transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}

      {/* Layer 4: Energy Cracks */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen">
        {cracks.map((c) => (
          <motion.path
            key={c.id}
            d={`M ${c.points.map((p) => `${p.x} ${p.y}`).join(' L ')}`}
            fill="none"
            stroke="#00e5ff"
            strokeWidth={1.5}
            style={{
              opacity: c.alpha,
              filter: 'drop-shadow(0 0 5px rgba(0, 229, 255, 0.8))',
            }}
          />
        ))}
      </svg>

      {/* Layer 5: Distant Mountains & Walking Guardians (Spectral Silhouettes) */}
      <div className="absolute bottom-0 left-0 w-full h-44 pointer-events-none select-none opacity-40">
        {/* Distant Mountain Range */}
        <svg
          className="absolute bottom-0 w-full h-32 fill-slate-950/80 stroke-slate-900/30 stroke-1"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path d="M0,160 L120,130 L280,170 L480,120 L720,180 L960,110 L1200,160 L1440,100 L1440,200 L0,200 Z" />
        </svg>

        {/* Closer Mountain Ridge */}
        <svg
          className="absolute bottom-0 w-full h-24 fill-slate-950 stroke-slate-900/40 stroke-1"
          viewBox="0 0 1440 200"
          preserveAspectRatio="none"
        >
          <path d="M0,180 L180,150 L400,190 L640,140 L900,185 L1180,150 L1440,190 L1440,200 L0,200 Z" />
        </svg>

        {/* Spectral Silhouettes walking across ridge */}
        {!prefersReducedMotion && (
          <div className="absolute bottom-4 w-full h-8 overflow-hidden relative">
            
            {/* Guardian 1: Walking slowly */}
            <motion.div
              animate={{ x: ['-10%', '110%'] }}
              transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-0 opacity-25 flex items-end"
            >
              {/* Soldier silhouette */}
              <svg className="w-5 h-7 fill-neon-blue" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <path d="M12,8 Q8,12 12,18 L10,24 L12,24 L14,19 L16,24 L18,24 L14,18 Z" />
                {/* Glowing weapon line */}
                <line x1="8" y1="2" x2="8" y2="20" stroke="#00f0ff" strokeWidth="1.5" />
              </svg>
            </motion.div>

            {/* Guardian 2: Walking opposite direction */}
            <motion.div
              animate={{ x: ['110%', '-10%'] }}
              transition={{ duration: 85, repeat: Infinity, ease: 'linear' }}
              className="absolute bottom-0 opacity-20 flex items-end"
            >
              <svg className="w-5 h-7 fill-neon-purple" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <path d="M12,8 Q16,12 12,18 L14,24 L12,24 L10,19 L8,24 L6,24 L10,18 Z" />
                <line x1="16" y1="2" x2="16" y2="20" stroke="#9d4edd" strokeWidth="1.5" />
              </svg>
            </motion.div>

            {/* Standing guardian on mountain peak */}
            <div className="absolute bottom-1 right-[25%] opacity-25">
              <svg className="w-5 h-7 fill-neon-blue" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="2" />
                <path d="M12,7 L12,17 L9,24 L11,24 L13,18 L15,24 L17,24 Z" />
                <line x1="12" y1="2" x2="18" y2="12" stroke="#00f0ff" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Kneeling guardian */}
            <div className="absolute bottom-0 left-[35%] opacity-20">
              <svg className="w-4 h-5 fill-slate-500" viewBox="0 0 24 24">
                <circle cx="10" cy="6" r="2" />
                <path d="M10,9 L7,13 L8,18 L5,20 L12,20 L10,14 Z" />
              </svg>
            </div>

          </div>
        )}
      </div>

      {/* Layer 6: Subtle Lightning Flash overlay */}
      {lightningActive && (
        <div className="absolute inset-0 bg-white/20 pointer-events-none mix-blend-color-dodge z-50 animate-flicker" />
      )}

      {/* Vignette CRT overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-[0.25]" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_40%,rgba(3,7,18,0.55)_100%)]" />
    </div>
  );
};
export default DynamicBackground;
