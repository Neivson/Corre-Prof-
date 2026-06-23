import React, { useEffect, useRef } from 'react';

interface SatiricalResultsParticlesProps {
  victory: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  size: number;
  text: string;
  opacity: number;
  color?: string;
  isGrade?: boolean;
}

export const SatiricalResultsParticles: React.FC<SatiricalResultsParticlesProps> = ({ victory }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];

    // Satirical text items based on state
    const victoryItems = [
      { text: '☕', weight: 1.5 },   // Cafezinho da vitoria
      { text: '📝', weight: 1.0 },   // Diario preenchido
      { text: '10', weight: 1.2, isGrade: true, color: '#22c55e' }, // Nota 10!
      { text: 'A+', weight: 0.8, isGrade: true, color: '#10b981' }, // Grade A+
      { text: '🪙', weight: 1.5 },   // FUNDEB coins
      { text: '🏖️', weight: 1.2 },   // Escapes/Ferias
      { text: '📚', weight: 1.0 },   // Livros fechados
      { text: '⭐', weight: 1.5 },   // Estrelas de bom professor
      { text: '🎉', weight: 1.0 },   // Festa
      { text: 'APROVADO', weight: 0.6, isGrade: true, color: '#eab308' },
    ];

    const defeatItems = [
      { text: '☕', weight: 1.5 },   // Caffeine overload
      { text: 'F', weight: 1.5, isGrade: true, color: '#ef4444' },  // GRADE F
      { text: 'D-', weight: 1.2, isGrade: true, color: '#f97316' }, // GRADE D-
      { text: '0.0', weight: 1.0, isGrade: true, color: '#dc2626' }, // Zero grade
      { text: '⏰', weight: 1.2 },   // Despertador/Atrasado
      { text: '📝', weight: 1.5 },   // Prova errada
      { text: '❌', weight: 1.2 },   // Erros vermelhos
      { text: '🔋', weight: 0.8 },   // Energia esgotando
      { text: '😴', weight: 1.0 },   // Sono acumulado
      { text: '📋', weight: 1.2 },   // Formulario infinito
      { text: 'RECUPERAÇÃO', weight: 0.6, isGrade: true, color: '#ef4444' },
    ];

    const currentPool = victory ? victoryItems : defeatItems;

    // Pick random item from pool according to weights
    const getRandomItem = () => {
      const totalWeight = currentPool.reduce((acc, item) => acc + item.weight, 0);
      let r = Math.random() * totalWeight;
      for (const item of currentPool) {
        r -= item.weight;
        if (r <= 0) return item;
      }
      return currentPool[0];
    };

    // Spawn initial explosion particles from the button or center areas
    const spawnParticle = (initial = false) => {
      const item = getRandomItem();
      const isBottomSpawn = !initial;

      const p: Particle = {
        // Explode from center on first start, otherwise float up from bottom
        x: initial ? width / 2 + (Math.random() - 0.5) * 120 : Math.random() * width,
        y: initial ? height / 2 + (Math.random() - 0.5) * 120 : height + 30,
        vx: (Math.random() - 0.5) * (initial ? 6 : 2),
        // Defeat particles fall down (gravity style / rain of papers), Victory floats up
        vy: initial 
            ? (Math.random() - 0.7) * 7 
            : (victory ? -(1.5 + Math.random() * 2.5) : -(0.8 + Math.random() * 1.8)),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.08,
        size: item.isGrade ? 20 + Math.random() * 14 : 24 + Math.random() * 18,
        text: item.text,
        opacity: 0.9,
        color: item.color,
        isGrade: item.isGrade,
      };

      // If defeat and floating (not initial), maybe let it fall down like rain
      if (!victory && isBottomSpawn) {
        p.y = -30;
        p.vy = 1.5 + Math.random() * 2.5;
        p.vx = (Math.random() - 0.5) * 1.5;
      }

      particles.push(p);
    };

    // Create a burst of 35 particles initially
    for (let i = 0; i < 35; i++) {
      spawnParticle(true);
    }

    const tick = () => {
      ctx.clearRect(0, 0, width, height);

      // Defeat has subtle red ambiance tint wash, victory has subtle gold/yellow
      if (victory) {
        ctx.fillStyle = 'rgba(251, 191, 36, 0.02)';
        ctx.fillRect(0, 0, width, height);
      } else {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.02)';
        ctx.fillRect(0, 0, width, height);
      }

      // Maintain max particles
      if (particles.length < 50 && Math.random() < 0.22) {
        spawnParticle(false);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Apply physics
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        // Soft sinusoidal sideways drift to make it look like falling leaves/coffee drifting in wind
        p.x += Math.sin(p.y * 0.01 + p.size) * 0.45;

        // If defeat, accelerate slightly with gravity
        if (!victory) {
          p.vy += 0.02; // slow fall down
        } else {
          // Victory float deceleration
          p.vy *= 0.995;
        }

        // Check bounds / fade out
        let isOutOfBounds = false;
        if (victory) {
          isOutOfBounds = p.y < -50 || p.x < -50 || p.x > width + 50;
        } else {
          isOutOfBounds = p.y > height + 50 || p.x < -50 || p.x > width + 50;
        }

        if (isOutOfBounds) {
          // Remove and recycle
          particles.splice(i, 1);
          continue;
        }

        // Draw particle
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;

        if (p.isGrade) {
          // Draw neat retro grade badge circle/background
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          const radius = p.size / 1.1;
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = p.color || '#000000';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Text grade value
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.fillStyle = p.color || '#000000';
          ctx.font = `black ${p.size / 1.3}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text, 0, 1);
        } else {
          // Draw standard satirical emoji
          ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 1.5;
          ctx.shadowOffsetY = 1.5;

          ctx.font = `${p.size}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(p.text, 0, 0);
        }

        ctx.restore();
      }

      animationId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [victory]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  );
};
