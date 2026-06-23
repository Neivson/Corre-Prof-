/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';

interface JoystickProps {
  onMove: (vector: { x: number; y: number }) => void;
  active: boolean;
}

export default function VirtualJoystick({ onMove, active }: JoystickProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [touchStartLocal, setTouchStartLocal] = useState({ x: 0, y: 0 });
  const [joystickPos, setJoystickPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Keyboard controls
  const keysPressed = useRef<Record<string, boolean>>({});

  useEffect(() => {
    if (!active) {
      onMove({ x: 0, y: 0 });
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current[key] = true;
        updateKeyboardVector();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        keysPressed.current[key] = false;
        updateKeyboardVector();
      }
    };

    const updateKeyboardVector = () => {
      let vx = 0;
      let vy = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) vy -= 1;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) vy += 1;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) vx -= 1;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) vx += 1;

      // Normalize diagonal speed
      if (vx !== 0 && vy !== 0) {
        const len = Math.sqrt(vx * vx + vy * vy);
        vx /= len;
        vy /= len;
      }

      onMove({ x: vx, y: vy });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [active, onMove]);

  // Touch and Mouse drags
  const handleStart = (clientX: number, clientY: number) => {
    if (!active) return;
    setIsDragging(true);
    touchStartRef.current = { x: clientX, y: clientY };
    
    let localX = clientX;
    let localY = clientY;
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      localX = clientX - rect.left;
      localY = clientY - rect.top;
    }
    setTouchStartLocal({ x: localX, y: localY });
    setJoystickPos({ x: 0, y: 0 });
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!active || !isDragging || !touchStartRef.current) return;

    const dx = clientX - touchStartRef.current.x;
    const dy = clientY - touchStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = 45; // limit handle travel distance

    let rx = dx;
    let ry = dy;

    if (distance > maxRadius) {
      rx = (dx / distance) * maxRadius;
      ry = (dy / distance) * maxRadius;
    }

    setJoystickPos({ x: rx, y: ry });

    // Output normalized movement vector (-1 to 1)
    onMove({
      x: rx / maxRadius,
      y: ry / maxRadius,
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
    touchStartRef.current = null;
    setJoystickPos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  // Attach global touch move/end events
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleGlobalTouchEnd = () => {
      if (isDragging) handleEnd();
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        handleMove(e.clientX, e.clientY);
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) handleEnd();
    };

    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
    window.addEventListener('touchend', handleGlobalTouchEnd);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleGlobalTouchEnd);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      id="joystick-overlay"
      className="absolute inset-0 select-none pointer-events-auto"
      style={{ touchAction: 'none' }}
      onTouchStart={(e) => {
        if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY);
      }}
      onMouseDown={(e) => {
        handleStart(e.clientX, e.clientY);
      }}
    >
      {/* Show dynamic visual indicator where dragging is active */}
      {isDragging && touchStartRef.current && (
        <div
          id="joystick-ring"
          className="absolute rounded-full border-2 border-white/40 bg-black/10 backdrop-blur-[1px]"
          style={{
            left: touchStartLocal.x - 60,
            top: touchStartLocal.y - 60,
            width: 120,
            height: 120,
            pointerEvents: 'none',
          }}
        >
          <div
            id="joystick-handle"
            className="absolute rounded-full bg-white shadow-lg border border-slate-300"
            style={{
              left: 40 + joystickPos.x,
              top: 40 + joystickPos.y,
              width: 40,
              height: 40,
              transition: 'none',
            }}
          />
        </div>
      )}

    </div>
  );
}
