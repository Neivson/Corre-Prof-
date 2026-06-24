/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Trash2, 
  Award, 
  Dumbbell, 
  Settings, 
  Volume2, 
  VolumeX, 
  Coins, 
  Lock, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  Heart,
  Flame,
  User,
  Coffee,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  SCENARIOS, 
  Scenario, 
  ScenarioType, 
  PermanentShopUpgrades, 
  UPGRADE_COSTS, 
  MAX_UPGRADE_LEVEL, 
  FUNNY_TIPS, 
  Achievement,
  PLAYABLE_CHARACTERS,
  CharacterId,
  CharacterConfig,
  EnemyType
} from '../types';
import { audio } from '../utils/audio';
import { createStudentSpriteSheet, createEnemySpriteSheet, createTeacherSpriteSheet } from './ActiveGame';

const sumUpgradeCost = (level: number) => {
  let sum = 0;
  for (let i = 0; i < level; i++) {
    sum += UPGRADE_COSTS[i] || 0;
  }
  return sum;
};

// Component to draw the real in-game pixel art of each oponent inside the dossier
function EnemyThumbnail({ studentKey, enemyType, characterId, className = "w-8 h-8" }: { studentKey?: 'aluno_01' | 'aluno_02' | 'aluno_03' | 'aluno_04'; enemyType?: EnemyType; characterId?: CharacterId; className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 32, 32);
    ctx.imageSmoothingEnabled = false;

    let spriteSheet: HTMLCanvasElement | null = null;
    if (studentKey) {
      spriteSheet = createStudentSpriteSheet(studentKey);
    } else if (enemyType) {
      spriteSheet = createEnemySpriteSheet(enemyType);
    } else if (characterId) {
      spriteSheet = createTeacherSpriteSheet(characterId);
    }

    if (spriteSheet) {
      // Draw first frame (Row 0: Down-facing, Col 1: Idle stand)
      ctx.drawImage(spriteSheet, 32, 0, 32, 32, 0, 0, 32, 32);
    }
  }, [studentKey, enemyType, characterId]);

  return (
    <canvas 
      ref={canvasRef} 
      width={32} 
      height={32} 
      className={`${className} select-none pointer-events-none block`} 
      style={{ imageRendering: 'pixelated' }}
    />
  );
}

interface StartScreenProps {
  gold: number;
  upgrades: PermanentShopUpgrades;
  achievements: Achievement[];
  soundEnabled: boolean;
  onStartGame: (scenario: Scenario) => void;
  onUpgradeBuy: (type: keyof PermanentShopUpgrades) => void;
  onResetProgress: () => void;
  onToggleSound: () => void;
  selectedCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  completedScenarios: ScenarioType[];
  onNavigateToCharSelect: () => void;
}

// ScenarioPreview component definition in start screen context
function ScenarioPreview({ type, accentColor, floorColor, gridColor }: { type: ScenarioType; accentColor: string; floorColor: string; gridColor: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width = 160;
    const h = canvas.height = 96;
    ctx.imageSmoothingEnabled = false;

    // Pixel drawing helpers
    const drawRect = (x: number, y: number, rw: number, rh: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(rw), Math.floor(rh));
    };
    const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string, width = 1) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };
    const drawPixel = (x: number, y: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
    };

    let animationFrameId: number;
    let startTime = performance.now();

    const renderLoop = (time: number) => {
      const elapsed = time - startTime;
      ctx.clearRect(0, 0, w, h);

      // Parallax scroll calculation (moving from left to right inside cameras space)
      const bgScroll = (elapsed * 0.035) % 320;
      const fgScroll = (elapsed * 0.08) % 320;
      const skyScroll = (elapsed * 0.012) % 320;

      // --- 1. BACKGROUND RENDER BASED ON THEME ---
      if (type === ScenarioType.SALA_DE_AULA) {
        // Sky Blue classroom windows
        drawRect(0, 0, w, 72, '#38bdf8');
        // Classroom wall backdrop (greenish pastel board trim)
        drawRect(0, 0, w, 6, '#475569');
        drawRect(0, 6, w, 42, '#f1f5f9');
        drawRect(0, 48, w, 24, '#e2e8f0');

        // SCROLLING WALL DETAILS to eliminate treadmill feel
        const wallScroll = bgScroll % 40;
        for (let wx = -40; wx < w + 40; wx += 40) {
          const curWallX = wx + wallScroll;
          drawLine(curWallX, 6, curWallX, 48, '#e2e8f0'); // vertical wall panel lines
          drawRect(curWallX, 48, 2, 24, '#cbd5e1'); // wood panel lambril seams
        }

        // Windows repeating in scrolling parallax
        const winScroll = bgScroll % 120;
        for (let wx = -120; wx < w + 120; wx += 120) {
          const curX = wx + winScroll;
          drawRect(curX, 12, 32, 26, '#93c5fd');
          drawLine(curX, 25, curX + 32, 25, '#475569');
          drawLine(curX + 16, 12, curX + 16, 38, '#475569');
        }

        // Blackboard scrolling in parallax
        const boardScroll = bgScroll % 240;
        const curBoardX = ((100 + boardScroll) % 240) - 80;
        drawRect(curBoardX, 10, 80, 28, '#14532d');
        drawRect(curBoardX - 2, 8, 84, 2, '#7c2d12'); // wooden top frame
        drawRect(curBoardX - 2, 38, 84, 2, '#7c2d12'); // wooden bottom frame
        drawRect(curBoardX - 2, 8, 2, 32, '#7c2d12'); // wooden left frame
        drawRect(curBoardX + 80, 8, 2, 32, '#7c2d12'); // wooden right frame
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '5px "Press Start 2P", monospace, sans-serif';
        ctx.fillText("2+2=5!", curBoardX + 12, 22);
        ctx.fillText("FAIL!", curBoardX + 12, 31);

        // Parallax clouds through window
        const cx1 = ((skyScroll) % 180) - 20;
        drawRect(cx1, 16, 12, 4, '#ffffff');
        drawRect(cx1 + 4, 14, 8, 2, '#ffffff');

      } else if (type === ScenarioType.SALA_FECHADA) {
        // Dark, claustrophobic bricks scrolling to the right
        drawRect(0, 0, w, 72, '#1e293b');
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1;
        const brickScroll = bgScroll % 32;
        for (let y = 8; y < 72; y += 12) {
          drawLine(0, y, w, y, '#0f172a');
          const rowOffset = (y % 24 === 0) ? 16 : 0;
          for (let x = -32; x < w + 32; x += 32) {
            const bx = x + rowOffset + brickScroll;
            drawLine(bx, y - 12, bx, y, '#0f172a');
          }
        }
        // Spooky small chalkboard
        const boardScroll = bgScroll % 200;
        const bx = ((40 + boardScroll) % 200) - 60;
        drawRect(bx, 14, 60, 22, '#022c22');
        ctx.fillStyle = '#ef4444';
        ctx.font = '5px "Press Start 2P"';
        ctx.fillText("PROVA SURPRESA", bx + 4, 26);

      } else if (type === ScenarioType.CORREDOR_ESCOLAR) {
        // Corridor walls
        drawRect(0, 0, w, 72, '#fef08a');
        drawRect(0, 52, w, 20, '#eabc54');

        // SCROLLING WALL TILE JOINTS to eliminate treadmill feel
        const wallTileScroll = bgScroll % 30;
        for (let tx = -30; tx < w + 30; tx += 30) {
          const cx = tx + wallTileScroll;
          drawLine(cx, 0, cx, 52, '#fde047'); // vertical tile seam on yellow wall
          drawLine(cx, 52, cx, 72, '#d97706'); // vertical baseboard seam
        }

        // Lockers side scrolling parallax in background
        const lockerScroll = bgScroll % 64;
        for (let lx = -64; lx < w + 64; lx += 32) {
          const rx = lx + lockerScroll;
          // locker frame
          drawRect(rx, 14, 24, 48, '#475569');
          drawRect(rx + 2, 16, 20, 44, '#334155');
          // Louvers (ventilators)
          drawLine(rx + 6, 20, rx + 18, 20, '#1e293b');
          drawLine(rx + 6, 22, rx + 18, 22, '#1e293b');
          drawLine(rx + 6, 24, rx + 18, 24, '#1e293b');
          // Lock handle
          drawRect(rx + 18, 36, 2, 4, '#ca8a04');
        }

      } else if (type === ScenarioType.CORREDOR_INFINITO) {
        // Hyper speed lines and flashing neon colors
        drawRect(0, 0, w, 72, '#111827');

        // SCROLLING SPACE GRID WALL PANELS to eliminate treadmill feel
        const spaceGrid = bgScroll % 45;
        for (let sx = -45; sx < w + 45; sx += 45) {
          const cx = sx + spaceGrid;
          drawRect(cx, 0, 4, 72, 'rgba(139, 92, 246, 0.15)'); // futuristic column
          drawLine(cx, 0, cx, 72, 'rgba(168, 85, 247, 0.25)'); // glowing pink grid line
        }

        // Speed lines moving rightwards
        const lineScroll = fgScroll % 160;
        drawLine(lineScroll, 12, lineScroll + 20, 12, 'rgba(56, 189, 248, 0.4)', 2);
        drawLine(((lineScroll + 60) % 160), 32, ((lineScroll + 60) % 160) + 30, 32, 'rgba(56, 189, 248, 0.4)', 1);
        drawLine(((lineScroll + 110) % 160), 48, ((lineScroll + 110) % 160) + 25, 48, 'rgba(236, 72, 153, 0.4)', 2);
        
        // Hazard safety stripes along borders
        for (let sx = 0; sx < w; sx += 12) {
          drawLine(sx, 0, sx + 6, 6, '#eab308', 3);
        }

      } else if (type === ScenarioType.PATIO) {
        // Sky, sun and school gate
        drawRect(0, 0, w, 72, '#bae6fd');
        
        // Sun with retro rays
        const sunPulse = Math.sin(elapsed / 150) * 1;
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(w - 24, 20, 8 + sunPulse, 0, Math.PI * 2);
        ctx.fill();
        // cute retro sunglasses on sun
        drawRect(w - 29, 17, 10, 2, '#000000');
        drawRect(w - 28, 19, 3, 2, '#000000');
        drawRect(w - 23, 19, 3, 2, '#000000');

        // SCROLLING SCHOOL PATIO WALL to eliminate treadmill feel
        const fenceScroll = bgScroll % 60;
        for (let fx = -60; fx < w + 60; fx += 60) {
          const cx = fx + fenceScroll;
          drawRect(cx, 44, 4, 28, '#475569'); // dark grey concrete post
          drawRect(cx - 1, 42, 6, 2, '#334155'); // post cap
          drawLine(cx, 50, cx + 60, 50, '#94a3b8'); // rails
          drawLine(cx, 62, cx + 60, 62, '#94a3b8');
        }

        // Mountain/Bush backgrounds in back scrolling to the right
        const bushScroll = skyScroll % 240;
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(((40 + bushScroll) % 240) - 40, 72, 24, Math.PI, 0);
        ctx.arc(((120 + bushScroll) % 240) - 40, 72, 30, Math.PI, 0);
        ctx.arc(((200 + bushScroll) % 240) - 40, 72, 20, Math.PI, 0);
        ctx.fill();

        // Soccer net crossbar on school field scrolling horizontally
        const soccerScroll = bgScroll % 240;
        const gateX = ((soccerScroll) % 240) - 60;
        drawRect(gateX, 36, 3, 36, '#ffffff'); // left post
        drawRect(gateX + 40, 36, 3, 36, '#ffffff'); // right post
        drawRect(gateX, 34, 43, 3, '#ffffff'); // crossbar
        // netting pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        for (let ny = 36; ny < 72; ny += 6) {
          drawLine(gateX, ny, gateX + 40, ny, 'rgba(255,255,255,0.4)');
        }

      } else if (type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
        // Blood-red/dark glowing executive courtroom
        drawRect(0, 0, w, 72, '#310a0a');

        // SCROLLING GOTHIC PILLARS to eliminate treadmill feel
        const courtroomScroll = bgScroll % 50;
        for (let gx = -50; gx < w + 50; gx += 50) {
          const cx = gx + courtroomScroll;
          drawRect(cx, 0, 5, 72, '#180303'); // giant columns
          drawLine(cx - 1, 0, cx - 1, 72, '#ef4444', 0.5); // glowing red borders
          drawLine(cx + 5, 0, cx + 5, 72, '#ef4444', 0.5);
        }
        
        // Giant crossed red pens of supreme academic evaluation dread
        const pulse = Math.sin(elapsed / 120) * 2;
        // Pen Left to Right
        drawLine(w/2 - 25, h/2 - 20 + pulse, w/2 + 25, h/2 + 10 + pulse, '#ef4444', 3);
        drawLine(w/2 + 20, h/2 + 7 + pulse, w/2 + 25, h/2 + 10 + pulse, '#cbd5e1', 2);
        // Pen Right to Left
        drawLine(w/2 + 25, h/2 - 20 + pulse, w/2 - 25, h/2 + 10 + pulse, '#dc2626', 3);
        drawLine(w/2 - 20, h/2 + 7 + pulse, w/2 - 25, h/2 + 10 + pulse, '#cbd5e1', 2);

        // Sinister floating zeros with red lighting behind and scrolling paper folders
        const paperScroll = bgScroll % 240;
        for (let px = -40; px < w + 80; px += 80) {
          const rx = px + paperScroll;
          drawRect(rx, 20 + Math.sin((elapsed/200) + px) * 4, 10, 14, '#ffffff');
          ctx.strokeStyle = '#ef4444';
          ctx.strokeRect(rx, 20 + Math.sin((elapsed/200) + px) * 4, 10, 14);
          drawPixel(rx + 3, 24 + Math.sin((elapsed/200) + px) * 4, '#dc2626'); // Red F marks
        }

      } else if (type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
        // Professional meeting conference lobby
        drawRect(0, 0, w, 72, '#1e293b');

        // SCROLLING LOBBY STEEL FRAMES to eliminate treadmill feel
        const conferenceScroll = bgScroll % 45;
        for (let lx = -45; lx < w + 45; lx += 45) {
          const cx = lx + conferenceScroll;
          drawRect(cx, 0, 2, 72, '#0f172a'); // steel frame pillar
          drawLine(cx + 15, 12, cx + 25, 42, 'rgba(255, 255, 255, 0.05)'); // glass reflection line
        }
        
        // Digital project beam
        const grad = ctx.createLinearGradient(w/2 - 20, 0, w/2, 50);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(w/2 - 20, 0);
        ctx.lineTo(w/2 + 20, 0);
        ctx.lineTo(w/2 + 50, 60);
        ctx.lineTo(w/2 - 50, 60);
        ctx.closePath();
        ctx.fill();

        // Projector screen scrolling
        const boardScroll = bgScroll % 200;
        const curBoardX = ((10 + boardScroll) % 200) - 40;
        
        drawLine(curBoardX + 6, 36, curBoardX + 2, 70, '#94a3b8', 2);
        drawLine(curBoardX + 12, 36, curBoardX + 16, 70, '#94a3b8', 2);
        drawRect(curBoardX, 22, 18, 20, '#ffffff');
        ctx.strokeStyle = '#475569';
        ctx.strokeRect(curBoardX, 22, 18, 20);
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 4px sans-serif';
        ctx.fillText("KPI", curBoardX + 3, 30);
        ctx.fillStyle = '#b91c1c';
        ctx.fillText("META", curBoardX + 3, 37);

        // Sticky notes (Post-its) stuck on presentation wall scrolling
        const stickyScroll = bgScroll % 160;
        drawRect(((20 + stickyScroll) % 160), 38, 6, 6, '#fde047'); // yellow
        drawRect(((60 + stickyScroll) % 160), 42, 6, 6, '#ec4899'); // pink
        drawRect(((110 + stickyScroll) % 160), 38, 6, 6, '#38bdf8'); // blue
      }


      // --- 2. GROUND FLOOR PLATFORM LAYER ---
      const groundY = 72;
      const groundH = 24;

      if (type === ScenarioType.SALA_DE_AULA || type === ScenarioType.SALA_FECHADA) {
        // Wood planks layout
        drawRect(0, groundY, w, groundH, '#7c2d12'); // main wood shade
        drawLine(0, groundY, w, groundY, '#000000', 2); // floor top border
        // Planks joints scrolling dynamically to the right
        const woodScroll = fgScroll % 32;
        for (let fx = -32; fx < w + 32; fx += 32) {
          drawLine(fx + woodScroll, groundY + 1, fx + woodScroll, groundY + groundH, '#451a03');
        }
        drawLine(0, groundY + 10, w, groundY + 10, '#9a3412'); // grain line accent
        
        // Single Classroom desk flutters in the air serving as platform scrolling rightwards
        const deskScroll = fgScroll % 240;
        const deskX = deskScroll - 40;
        drawRect(deskX - 14, groundY - 18, 28, 4, '#f59e0b');
        drawLine(deskX - 12, groundY - 14, deskX - 12, groundY, '#334155');
        drawLine(deskX + 10, groundY - 14, deskX + 10, groundY, '#334155');

      } else if (type === ScenarioType.CORREDOR_ESCOLAR || type === ScenarioType.CORREDOR_INFINITO) {
        // Polished yellow checkerboard tile flooring
        drawRect(0, groundY, w, groundH, '#f59e0b');
        drawLine(0, groundY, w, groundY, '#000000', 2); // border
        
        // Perspective tile dividing line scrolling rightwards
        const tileScroll = fgScroll % 20;
        for (let tx = -20; tx < w + 20; tx += 20) {
          drawLine(tx + tileScroll, groundY + 1, tx + tileScroll, groundY + groundH, '#d97706');
        }
        drawLine(0, groundY + 10, w, groundY + 10, '#b45309');

        // Platform: Fire Extinguisher bracket or vending machine on the side
        if (type === ScenarioType.CORREDOR_ESCOLAR) {
          const fireScroll = fgScroll % 240;
          const curFx = fireScroll - 30;
          drawRect(curFx - 10, groundY - 26, 20, 16, '#e2e8f0');
          drawRect(curFx - 8, groundY - 24, 16, 12, '#ef4444');
          drawRect(curFx - 4, groundY - 32, 8, 6, '#475569'); // pressure head
        }

      } else if (type === ScenarioType.PATIO) {
        // Beautiful Grass on earth layer
        drawRect(0, groundY, w, 4, '#22c55e'); // grass blade tops
        drawRect(0, groundY + 4, w, groundH - 4, '#78350f'); // earth
        drawLine(0, groundY, w, groundY, '#000000', 2);
        // Root grains and stones in dirt scrolling rightwards
        const dirtScroll = fgScroll % 24;
        for (let dx = -24; dx < w + 24; dx += 24) {
          drawRect(dx + dirtScroll + 10, groundY + 10, 3, 2, '#451a03');
          drawRect(dx + dirtScroll + 18, groundY + 15, 2, 2, '#475569'); // stones
        }

        // Platform: Hopscotch court drawing in parallax
        const hopScroll = fgScroll % 240;
        const hpx = hopScroll - 40;
        if (hpx > -40 && hpx < w) {
          ctx.strokeStyle = 'rgba(255,255,255,0.6)';
          ctx.lineWidth = 1;
          ctx.strokeRect(hpx, groundY - 14, 12, 12);
          ctx.strokeRect(hpx + 12, groundY - 14, 12, 12);
        }

      } else if (type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
        // Obsidian black supreme evaluation floor with bloody grading ink streams
        drawRect(0, groundY, w, groundH, '#090505');
        drawLine(0, groundY, w, groundY, '#ef4444', 2); // glowing hot red line top boundary
        // glowing ink streams flowing to the right
        const flow = fgScroll % 40;
        for (let fx = -40; fx < w + 40; fx += 40) {
          drawRect(fx + flow + 15, groundY + 6, 8, 3, '#dc2626');
          drawRect(fx + flow + 28, groundY + 14, 14, 2, '#991b1b');
        }

      } else if (type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
        // Corporate luxury office carpet floor
        drawRect(0, groundY, w, groundH, '#1e3a8a');
        drawLine(0, groundY, w, groundY, '#000000', 2);
        // Carpet lines scrolling rightwards
        const carpet = fgScroll % 30;
        for (let cx = -30; cx < w + 30; cx += 30) {
          drawLine(cx + carpet, groundY + 4, cx + carpet + 10, groundY + 18, '#1d4ed8', 1.5);
        }

        // Platform: Oval Boardroom Conference Table scrolling rightwards
        const tableScroll = fgScroll % 240;
        const tx = tableScroll - 40;
        drawRect(tx - 25, groundY - 14, 50, 4, '#1e293b');
        drawRect(tx - 20, groundY - 10, 40, 2, '#475569');
        // Table supports
        drawLine(tx - 15, groundY - 8, tx - 15, groundY, '#0f172a', 2);
        drawLine(tx + 15, groundY - 8, tx + 15, groundY, '#0f172a', 2);
      }


      // --- 3. DYNAMIC OBSTACLE & PROFESSOR JUMP SIMULATOR ---
      // This calculates an automated running/shooting animation to show action
      const px = 30;
      const ex = 122; // chaser x position (defined early)
      const basePy = 68;
      
      let py = basePy;
      let isJumping = false;
      const runCycle = Math.floor(elapsed / 100) % 4;
      const jumpFrame = runCycle % 2; // alternates 0 and 1 (running)

      // Make the chaser throw the obstacle towards the professor (right to left)
      const obstacleCycle = 2200; // obstacle loops every 2.2s
      const obsTime = elapsed % obstacleCycle;
      
      // Render Approaching Obstacle (moving from right to left, i.e., from chaser to professor)
      const obX = ex - (obsTime / obstacleCycle) * (ex + 40);
      const obY = groundY; // on the floor

      if (type === ScenarioType.SALA_DE_AULA || type === ScenarioType.SALA_FECHADA) {
        // Obstacle: Flying high-velocity Paper Airplane (pointing leftward as it flies left)
        const airplaneX = obX;
        const airplaneY = groundY - 14 - Math.sin(elapsed / 100) * 4;
        // Drawing custom white paper dart pointing to the left
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(airplaneX - 8, airplaneY); // nose (far left point)
        ctx.lineTo(airplaneX, airplaneY - 3); // top wing edge
        ctx.lineTo(airplaneX - 2, airplaneY + 4); // bottom wing edge
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.5;
        ctx.stroke();

      } else if (type === ScenarioType.CORREDOR_ESCOLAR) {
        // Obstacle: Sliding yellow "Cuidado: Piso Molhado" sign
        drawRect(obX - 4, obY - 12, 8, 12, '#eab308');
        // Black caution symbol
        drawRect(obX - 2, obY - 9, 4, 1, '#000000');
        drawRect(obX - 1, obY - 6, 2, 2, '#000000');
        // Black outline
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(obX - 4, obY - 12, 8, 12);

      } else if (type === ScenarioType.CORREDOR_INFINITO) {
        // Obstacle: High speed laser/bureaucracy checklist folders
        drawRect(obX - 5, obY - 16, 10, 16, '#f43f5e');
        drawRect(obX - 3, obY - 14, 7, 12, '#ffffff');
        // Checklist text lines inside folder
        drawLine(obX - 2, obY - 10, obX + 2, obY - 10, '#cbd5e1');
        drawLine(obX - 2, obY - 6, obX + 1, obY - 6, '#cbd5e1');

      } else if (type === ScenarioType.PATIO) {
        // Obstacle: Soccer ball (Bola dente-de-leite) bouncing with beautiful arches 
        const bounceHeight = Math.abs(Math.sin((elapsed * 0.005)) * 32);
        const ballX = obX;
        const ballY = groundY - 6 - bounceHeight;

        // shadow
        const shadowSize = Math.max(2, 6 - bounceHeight/6);
        drawRect(ballX - shadowSize, groundY - 1, shadowSize * 2, 2, 'rgba(0,0,0,0.25)');

        // White sphere
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        // pixel pentagons on ball
        drawPixel(ballX, ballY, '#000000');
        drawPixel(ballX - 2, ballY - 2, '#000000');
        drawPixel(ballX + 2, ballY + 2, '#000000');

      } else if (type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
        // Obstacle: Sinister red grading ink zeroes "0" hovering and glowing
        const itemY = groundY - 18 - Math.sin(elapsed / 100) * 5;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(obX - 5, itemY, 10, 10);
        ctx.fillStyle = '#ffffff';
        ctx.font = '5px "Press Start 2P"';
        // Note 0
        ctx.fillText("0", obX - 2, itemY + 8);

      } else if (type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
        // Obstacle: Fluorescent speech bubble contain "MINDSET" dynamic trigger
        const speechY = groundY - 20 - Math.sin(elapsed / 120) * 3;
        drawRect(obX - 18, speechY - 6, 36, 12, '#22c55e');
        ctx.fillStyle = '#ffffff';
        ctx.font = '5px "Press Start 2P"';
        ctx.fillText("META!", obX - 10, speechY + 2);
        // Little tail on bubble
        drawLine(obX, speechY + 6, obX + 3, speechY + 9, '#22c55e', 2);
      }


      // --- 4. RENDER HERO: THE PROFESSOR (PROF) RUNNING TO THE LEFT (FLEEING) ---
      // Head skin
      drawRect(px, py - 14, 6, 6, '#fed7aa'); 
      // Shaved sideburn / hair on top and back-right
      drawRect(px, py - 16, 7, 3, '#7c2d12'); 
      drawRect(px + 5, py - 13, 2, 4, '#7c2d12');
      // Glasses on the left (front of face, facing leftward)
      drawRect(px, py - 13, 2, 1, '#1e293b'); 
      drawPixel(px, py - 13, '#000000');
      drawLine(px + 1, py - 13, px + 5, py - 13, '#1e293b');
      
      // Teacher jacket / waistcoat
      drawRect(px + 1, py - 8, 6, 8, '#3b82f6'); 
      drawRect(px + 2, py - 8, 4, 8, '#ffffff'); 

      // Red bow-tie (now on the left front)
      drawRect(px + 1.5, py - 7, 2, 1, '#ef4444'); 

      // Coffee cup on the left side but spilling backwards to the right!
      drawRect(px - 2, py - 4, 3, 3, '#1e293b');
      drawPixel(px - 3, py - 3, '#1e293b'); 
      const brewCount = Math.floor(elapsed / 80) % 3;
      drawPixel(px + 7 + brewCount, py - 5 - (elapsed % 3), '#b45309'); // coffee drop flies rightwards

      // Pants (Blue jeans)
      drawRect(px + 1, py, 6, 4, '#1e1b4b');

      // Animated Running Legs based on jumpFrame
      if (isJumping) {
        // Legs in split jump position
        drawRect(px - 1, py + 4, 3, 2, '#000000'); // left leg back
        drawRect(px + 5, py + 4, 3, 2, '#000000'); // right leg front
      } else {
        if (jumpFrame === 0) {
          // Leg A
          drawRect(px + 1, py + 4, 2, 3, '#000000'); // leg left down
          drawRect(px + 4, py + 4, 3, 2, '#000000'); // leg right bent back
        } else {
          // Leg B
          drawRect(px + 1, py + 4, 3, 2, '#000000'); // leg left bent back
          drawRect(px + 5, py + 4, 2, 3, '#000000'); // leg right down
        }
      }


      // --- 5. RENDER THE LEVEL SCENARIO ENEMY (THE CHIEF BOSS OR RUNNING ALUNO) ---
      const ey = basePy - 2;
      const enemyRunCycle = Math.floor(elapsed / 100) % 4;
      const enemyBob = enemyRunCycle % 2 === 0 ? 0 : 1; // 0 or 1 px of vertical bobbing

      if (type === ScenarioType.SALA_DE_AULA || type === ScenarioType.SALA_FECHADA) {
        // Enemy: Evil laughing high-school kid running and chasing
        const kEy = ey + enemyBob;
        // Head
        drawRect(ex + 1, kEy - 12, 6, 6, '#fdba74');
        // Spike Red Punk Hair
        drawRect(ex, kEy - 15, 8, 3, '#f97316');
        drawPixel(ex + 2, kEy - 12, '#f97316');
        // Angry eye (looking left)
        drawPixel(ex + 2, kEy - 10, '#000000');
        // School green jersey
        drawRect(ex + 1, kEy - 6, 6, 7, '#047857');
        // Yellow backpack on kid
        drawRect(ex + 7, kEy - 5, 2, 5, '#eab308');
        
        // Jeans
        drawRect(ex + 2, kEy + 1, 4, 3, '#1d4ed8');
        // Animated leg running:
        if (enemyRunCycle % 2 === 0) {
          drawRect(ex + 1, kEy + 4, 2, 3, '#1e293b'); // left leg straight down
          drawRect(ex + 4, kEy + 4, 3, 2, '#1e293b'); // right leg bent/running back
        } else {
          drawRect(ex + 1, kEy + 4, 3, 2, '#1e293b'); // left leg bent
          drawRect(ex + 5, kEy + 4, 2, 3, '#1e293b'); // right leg straight down
        }

        // Sling in hand
        drawLine(ex - 2, kEy - 2, ex + 1, kEy - 2, '#7c2d12', 2); // wood slingshot

      } else if (type === ScenarioType.CORREDOR_ESCOLAR) {
        // Enemy: The grumpy School Inspector with an administrative brown clipboard running
        const iEy = ey + enemyBob;
        // Grey hair and fat face
        drawRect(ex + 1, iEy - 14, 7, 7, '#e2e8f0');
        drawRect(ex, iEy - 16, 9, 3, '#94a3b8'); // bald crown trim grey
        // Eyeglasses on Inspector
        drawRect(ex + 1, iEy - 11, 4, 1, '#000000');
        // Inspector office uniform (brown tie suit)
        drawRect(ex, iEy - 7, 8, 9, '#78350f');
        drawRect(ex + 3, iEy - 7, 2, 9, '#ffffff'); // tie slot
        drawPixel(ex + 3, iEy - 5, '#ef4444'); // red tie

        // Clipboard
        drawRect(ex - 3, iEy - 3, 4, 6, '#ca8a04'); // wood board
        drawRect(ex - 2, iEy - 3, 2, 1, '#cbd5e1'); // metal clip

        // Pants
        drawRect(ex + 1, iEy + 2, 6, 3, '#451a03');
        // Animated legs:
        if (enemyRunCycle % 2 === 0) {
          drawRect(ex + 1, iEy + 5, 2, 3, '#000000'); // leg A down
          drawRect(ex + 4, iEy + 5, 3, 2, '#000000'); // leg B back
        } else {
          drawRect(ex + 1, iEy + 5, 3, 2, '#000000'); // leg A back
          drawRect(ex + 5, iEy + 5, 2, 3, '#000000'); // leg B down
        }

      } else if (type === ScenarioType.CORREDOR_INFINITO) {
        // Enemy: FORMULARIO_INFINITO (Floating endless spreadsheet form sheet)
        const formPulse = Math.sin(elapsed / 100) * 3;
        const fy = ey - 12 + formPulse;
        
        // Draw sheet body (white paper)
        drawRect(ex - 1, fy, 16, 18, '#ffffff');
        // Red left margin line
        drawRect(ex + 2, fy + 1, 1, 16, '#f43f5e');
        // Outline border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.strokeRect(ex - 1, fy, 16, 18);

        // Blue checklist grid lines
        for (let l = 0; l < 4; l++) {
          drawRect(ex + 4, fy + 3 + l * 4, 9, 1, '#93c5fd');
        }
        // Small checkbox marks
        drawRect(ex, fy + 3, 1.5, 1.5, '#22c55e');
        drawRect(ex, fy + 7, 1.5, 1.5, '#ef4444');
        drawRect(ex, fy + 11, 1.5, 1.5, '#22c55e');

        // Glowing sparkles
        if (Math.floor(elapsed / 150) % 2 === 0) {
          drawRect(ex - 4, fy + 4, 2, 2, '#8b5cf6');
          drawRect(ex + 18, fy + 12, 2, 2, '#c084fc');
        }

      } else if (type === ScenarioType.PATIO) {
        // Enemy: Zumbi do Sábado Letivo (Saturday Class Zombie) holding a steaming coffee cup
        const zombieTime = Math.floor(elapsed / 150) % 4;
        const zY = ey + enemyBob;
        
        // Pale green zombie head
        drawRect(ex + 1, zY - 12, 6, 6, '#86efac');
        // Messy hair
        drawRect(ex + 2, zY - 14, 5, 2, '#1e293b');
        // Tired red eye looking left
        drawPixel(ex + 2, zY - 10, '#ef4444');
        
        // Shredded school green uniform t-shirt
        drawRect(ex + 1, zY - 6, 6, 7, '#047857');
        // Tear in shirt showing green skin
        drawPixel(ex + 3, zY - 4, '#86efac');
        
        // Brown pants
        drawRect(ex + 2, zY + 1, 4, 3, '#78350f');
        
        // Arm stretched forward holding a coffee cup
        drawRect(ex - 3, zY - 2, 4, 2, '#86efac'); // arm
        drawRect(ex - 4, zY - 4, 3, 4, '#94a3b8'); // coffee cup
        drawPixel(ex - 3, zY - 5, '#b45309'); // coffee drop
        
        // Walking legs
        if (zombieTime % 2 === 0) {
          drawRect(ex + 1, zY + 4, 2, 3, '#000000');
          drawRect(ex + 4, zY + 4, 2, 2, '#000000');
        } else {
          drawRect(ex + 1, zY + 4, 2, 2, '#000000');
          drawRect(ex + 4, zY + 4, 2, 3, '#000000');
        }

      } else if (type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
        // Enemy: The Legendary Dark Principal (A Diretora Maligna) floating on an overlay of fire
        const bossFloat = Math.sin(elapsed / 150) * 4;
        const bx = ex;
        const byOffset = ey - 14 + bossFloat;

        // Shadow beneath floating principal
        drawRect(bx, groundY - 1, 10, 2, 'rgba(0,0,0,0.4)');

        // Manto escuríssimo roxo / capa vampiresca
        drawRect(bx - 2, byOffset - 2, 11, 15, '#1e1b4b'); // purple robe cloak
        drawRect(bx - 1, byOffset - 2, 9, 15, '#4c1d95');
        // collar red highlights
        drawPixel(bx - 2, byOffset - 2, '#ef4444');
        drawPixel(bx + 8, byOffset - 2, '#ef4444');

        // White senior hair wig
        drawRect(bx + 1, byOffset - 8, 6, 6, '#f1f5f9');
        // Pale white scary skin face (looks left)
        drawRect(bx + 1, byOffset - 6, 5, 5, '#ffedd5');
        // Glowing ruby boss matrix glasses
        drawRect(bx, byOffset - 4, 3, 1, '#dc2626');
        
        // Golden supreme ruler crown
        drawRect(bx + 1, byOffset - 11, 5, 3, '#eab308');
        drawPixel(bx + 1, byOffset - 12, '#eab308');
        drawPixel(bx + 3, byOffset - 12, '#eab308');
        drawPixel(bx + 5, byOffset - 12, '#eab308');

        // Summoning scepter hand holding giant quill esferográfica
        drawLine(bx - 4, byOffset + 2, bx - 1, byOffset, '#cbd5e1', 2);
        drawPixel(bx - 4, byOffset + 2, '#ef4444'); // glowing red tip quill

      } else if (type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
        // Enemy: The corporate mega MOTIVATIONAL COACH / GROUP PALESTRANTE running
        const cEy = ey + enemyBob;
        // Business suit blue layout with golden micro
        drawRect(ex, cEy - 14, 8, 16, '#1e3a8a'); // handsome tailored suit
        drawRect(ex + 2, cEy - 14, 4, 16, '#ffffff'); // shiny white vest shirt
        drawPixel(ex + 3, cEy - 11, '#ca8a04'); // corporate golden tie

        // Beautiful perfect blonde hair pomp / topete esbeltíssimo
        drawRect(ex + 1, cEy - 20, 6, 6, '#fbfb20'); // yellow sun hair
        drawRect(ex + 2, cEy - 22, 5, 2, '#fbfb20');
        // Smiley friendly coach face (looking left)
        drawRect(ex + 1, cEy - 17, 5, 5, '#ffedd5');
        drawPixel(ex + 1, cEy - 15, '#22c55e'); // sparkling motivational eyes on left
        drawPixel(ex + 2, cEy - 15, '#22c55e');

        // Holding golden microfone projecting forward
        drawLine(ex - 3, cEy - 8, ex + 1, cEy - 8, '#ca8a04', 1.5);
        drawRect(ex - 4, cEy - 11, 2, 3, '#cbd5e1'); // silver micro top

        // Pants
        drawRect(ex + 1, cEy + 2, 6, 3, '#0f172a');
        // Legs animated running
        if (enemyRunCycle % 2 === 0) {
          drawRect(ex + 1, cEy + 5, 2, 3, '#000000'); // leg A down
          drawRect(ex + 4, cEy + 5, 3, 2, '#000000'); // leg B back
        } else {
          drawRect(ex + 1, cEy + 5, 3, 2, '#000000'); // leg A back
          drawRect(ex + 5, cEy + 5, 2, 3, '#000000'); // leg B down
        }
      }

      animationFrameId = requestAnimationFrame(renderLoop);
    };

    animationFrameId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [type, accentColor, floorColor, gridColor]);

  return (
    <div className="flex flex-col items-center">
      <canvas 
        ref={canvasRef} 
        width={160} 
        height={96} 
        className="block w-[150px] h-[90px] xs:w-[170px] xs:h-[102px] sm:w-[190px] sm:h-[114px] rounded-none select-none pointer-events-none transition"
      />
    </div>
  );
}

export default function StartScreen({
  gold,
  upgrades,
  achievements,
  soundEnabled,
  onStartGame,
  onUpgradeBuy,
  onResetProgress,
  onToggleSound,
  selectedCharacterId,
  onSelectCharacter,
  completedScenarios,
  onNavigateToCharSelect
}: StartScreenProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showUpgradesModal, setShowUpgradesModal] = useState(false);
  const [showEnemiesModal, setShowEnemiesModal] = useState(false);
  const [enemyFilter, setEnemyFilter] = useState<'alunos' | 'burocracia' | 'chefes' | 'professores'>('alunos');
  const [chosenScenarioIndex, setChosenScenarioIndex] = useState<number>(0);

  const ENEMIES_INFOS: {
    name: string;
    subtitle?: string;
    emoji: string;
    difficulty: string;
    background: string;
    quotes: string[];
    theme: string;
    studentKey?: 'aluno_01' | 'aluno_02' | 'aluno_03' | 'aluno_04';
    enemyType?: EnemyType;
  }[] = [
    {
      name: 'Aluno Distraído',
      emoji: '😴',
      difficulty: 'Fácil',
      background: 'Olha constantemente para o teto, focado em dobraduras, estojos ou no celular embaixo da carteira.',
      quotes: ['Posso ir ao banheiro?', 'Que página, professor?', 'Falta muito pro recreio?'],
      theme: 'emerald',
      studentKey: 'aluno_01'
    },
    {
      name: 'Aluno "Vale Nota?"',
      emoji: '📝',
      difficulty: 'Fácil',
      background: 'O pragmático utilitarista. Só realiza qualquer esforço se render pontos adicionais na média.',
      quotes: ['Vai valer nota?', 'Vale quanto?', 'Professor, arredonda pra 6?'],
      theme: 'emerald',
      studentKey: 'aluno_02'
    },
    {
      name: 'Aluno "É pra Copiar?"',
      emoji: '✍️',
      difficulty: 'Fácil',
      background: 'Tem pavor de sintetizar. Só escreve no caderno se o professor passar tudo no quadro de forma exaustiva.',
      quotes: ['É pra copiar?', 'Apaga o quadro não!', 'De caneta azul ou preta?'],
      theme: 'emerald',
      studentKey: 'aluno_03'
    },
    {
      name: 'Aluno do Fundão',
      emoji: '🃏',
      difficulty: 'Médio',
      background: 'Membro da lendária Fileira de Trás. Pratica torneios clandestinos de dominó e sonecas profundas.',
      quotes: ['Vamo jogar dominó!', 'Mó sono, professor...', 'Ô prof, libera mais cedo aí!'],
      theme: 'sky',
      studentKey: 'aluno_04'
    },
    {
      name: 'Formulário Infinito',
      emoji: '📄',
      difficulty: 'Médio',
      background: 'Uma avalanche interminável de papelada burocrática, relatórios de autoavaliação e rubricas extras.',
      quotes: ['Preencha o anexo III', 'Falta sua rubrica', 'Formulário Google pendente'],
      theme: 'sky',
      enemyType: EnemyType.FORMULARIO_INFINITO
    },
    {
      name: 'Diário Atrasado',
      emoji: '💻',
      difficulty: 'Médio',
      background: 'O terrível pesadelo digital! Um sistema instável exibindo prazos expirados e centenas de faltas vazias.',
      quotes: ['Digite as notas rápidas', 'Falta registrar 80 faltas', 'Prazo final expirou'],
      theme: 'sky',
      enemyType: EnemyType.DIARIO_ATRASADO
    },
    {
      name: 'Convocação de Reunião',
      emoji: '📅',
      difficulty: 'Difícil',
      background: 'A notificação de última hora enviando um link do Google Meet urgente que destrói seu planejamento.',
      quotes: ['Reunião extraordinária', 'Link do Meet no grupo', 'Pauta de última hora urgente'],
      theme: 'amber',
      enemyType: EnemyType.CONVOCACAO_REUNIAO
    },
    {
      name: 'Articuladora Pedagógica',
      emoji: '👩‍💼',
      difficulty: 'Difícil',
      background: 'Cobra incansavelmente novas metodologias ativas e adequação minuciosa até o último detalhe da BNCC.',
      quotes: ['Cadê seu plano de aula?', 'Proposta inovadora curricular', 'Alinhamento urgente com a BNCC!'],
      theme: 'amber',
      enemyType: EnemyType.ARTICULADORA_PEDAGOGICA
    },
    {
      name: 'Coordenador Escolar',
      emoji: '🗣️',
      difficulty: 'Difícil',
      background: 'Portador de reclamações disciplinares delicadas, pautas extras e atendimentos imediatos a responsáveis.',
      quotes: ['Passa na coordenação rapidinho', 'Reclamação de aluno no grupo', 'Precisamos alinhar a postura'],
      theme: 'amber',
      enemyType: EnemyType.COORDENADOR_ESCOLAR
    },
    {
      name: 'Conselho de Classe',
      subtitle: 'Diretor Geral Severo',
      emoji: '👨‍⚖️',
      difficulty: 'Super-Chefe',
      background: 'O "Grande Inquisidor" dos Professores. Um homem idoso, de postura impecável e terno preto formal, com um olhar extremamente julgador. Flutua sobre uma cadeira de escritório giratória imensa e luxuosa. Ataca jogando pilhas de processos e invocando barreiras de canetas vermelhas.',
      quotes: ['CONSELHO CONVOCADO!', 'Ata lavrada e datada!', 'Quero see seu plano de aula!'],
      theme: 'rose',
      enemyType: EnemyType.CHEF_CONSELHO_DEC_LASSE
    },
    {
      name: 'Sábado Letivo',
      subtitle: 'O Fiscal do Fim de Semana',
      emoji: '🧟‍♂️',
      difficulty: 'Super-Chefe',
      background: 'Um burocrata zumbi completamente exausto e sem alma, munido de poderes malignos adquiridos por nunca descansar. Veste terno amassado, gravata frouxa, tem olheiras roxas profundas, carrega uma caneca de café eterna e tem um relógio de ponto nas costas. Desacelera o tempo ao pisar!',
      quotes: ['Sábado letivo ativo geral!', 'Sem descanso esta semana!', 'Trabalhar no final de semana engrandece a alma!'],
      theme: 'rose',
      enemyType: EnemyType.CHEF_SABADO_LETIVO
    },
    {
      name: 'Semana Pedagógica',
      subtitle: 'A Palestrante Coach',
      emoji: '🎤',
      difficulty: 'Super-Chefe',
      background: 'Uma palestrante ultragrudenta cheia de energia artificial. Carrega um sorriso forçado e estático, blazer rosa-choque, microfone de lapela e um passador de slides. Ataca lançando palavras de ordem (Resiliência!, Sinergia!, Protagonismo!) que causam confusão mental.',
      quotes: ['Dinâmica Quebra-Gelo corporal!', 'Resiliência! Sinergia! Protagonismo!', 'Vista a camisa da instituição!'],
      theme: 'rose',
      enemyType: EnemyType.CHEF_SEMANA_PEDAGOGICA
    },
    {
      name: 'Fechamento de Unidade',
      subtitle: 'O Secretário do Apocalipse',
      emoji: '💀',
      difficulty: 'Super-Chefe',
      background: 'O secretário-chefe do sistema, figura mística que controla a entrega final das notas. Alto, magro, veste uma capa de relatórios impressos, mascara de relógio da meia-noite e digita furiosamente em um teclado holográfico. Invoca diários de notas e faz o sistema piscar em alerta vermelho.',
      quotes: ['SISTEMA SOBRECARREGADO!', 'Prazo de envio encerra em 1 minuto!', 'Notas de recuperação finais!'],
      theme: 'rose',
      enemyType: EnemyType.CHEF_FECHAMENTO_UNIDADE
    }
  ];

  const filteredEnemies = ENEMIES_INFOS.filter(e => {
    if (enemyFilter === 'alunos') return e.theme === 'emerald' || e.name.toLowerCase().includes('aluno');
    if (enemyFilter === 'burocracia') return (e.theme === 'sky' || e.theme === 'amber') && !e.name.toLowerCase().includes('aluno');
    if (enemyFilter === 'chefes') return e.theme === 'rose';
    return true;
  });

  const handleDownloadSpriteSheet = (name: string, studentKey?: string, enemyType?: string, characterId?: string) => {
    let spriteSheet: HTMLCanvasElement | null = null;
    if (studentKey) {
      spriteSheet = createStudentSpriteSheet(studentKey as any);
    } else if (enemyType) {
      spriteSheet = createEnemySpriteSheet(enemyType as any);
    } else if (characterId) {
      spriteSheet = createTeacherSpriteSheet(characterId as any);
    }

    if (!spriteSheet) return;

    const upscaleFactor = 8;
    const width = spriteSheet.width;
    const height = spriteSheet.height;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = width * upscaleFactor;
    outCanvas.height = height * upscaleFactor;

    const outCtx = outCanvas.getContext('2d');
    if (!outCtx) return;

    outCtx.imageSmoothingEnabled = false;
    (outCtx as any).mozImageSmoothingEnabled = false;
    (outCtx as any).webkitImageSmoothingEnabled = false;
    (outCtx as any).msImageSmoothingEnabled = false;

    outCtx.drawImage(spriteSheet, 0, 0, width, height, 0, 0, outCanvas.width, outCanvas.height);

    const safeName = name.toLowerCase()
      .replace(/[ãáâà]/g, "a")
      .replace(/[éêè]/g, "e")
      .replace(/[íîì]/g, "i")
      .replace(/[óôòõ]/g, "o")
      .replace(/[úûù]/g, "u")
      .replace(/[^a-z0-9]/g, "_")
      .replace(/_+/g, "_");

    const link = document.createElement('a');
    link.download = `corre_prof_sprite_${safeName}.png`;
    link.href = outCanvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Rotate tips in intervals
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % FUNNY_TIPS.length);
    }, 7000);
    return () => clearInterval(tipInterval);
  }, []);

  const getUnlockedScenarios = (): Scenario[] => {
    // Unlocked all scenarios temporarily for testing ease
    return SCENARIOS;
  };

  const unlockedScenarios = getUnlockedScenarios();
  const maxIdx = unlockedScenarios.length - 1;
  const activeIdx = (chosenScenarioIndex >= 0 && chosenScenarioIndex <= maxIdx) ? chosenScenarioIndex : 0;
  const activeScenario = unlockedScenarios[activeIdx] || SCENARIOS[0];

  const getUpgradeLabel = (key: keyof PermanentShopUpgrades) => {
    switch (key) {
      case 'maxHpLevel': return 'Vida Máxima (Vigor do Giz)';
      case 'speedLevel': return 'Velocidade (Passada Atlética)';
      case 'damageLevel': return 'Danos Pedagógicos (Visto Forte)';
      case 'xpLevel': return 'Ganho de Didática (Foco em XP)';
      case 'luckLevel': return 'Sorte (Café Premiado)';
    }
  };

  const getUpgradeDesc = (key: keyof PermanentShopUpgrades) => {
    switch (key) {
      case 'maxHpLevel': return 'Aumenta sua vida máxima em +20% por nível';
      case 'speedLevel': return 'Aumenta a velocidade de corrida em +10% por nível';
      case 'damageLevel': return 'Aumenta todo dano das suas armas em +15% por nível';
      case 'xpLevel': return 'Aumenta a absorção de experiência em +15% por nível';
      case 'luckLevel': return 'Aumenta a sorte em +10% (mais café e cura no chão)';
    }
  };

  const getUpgradeIcon = (key: keyof PermanentShopUpgrades) => {
    switch (key) {
      case 'maxHpLevel': return <Heart className="w-5 h-5 text-red-500" />;
      case 'speedLevel': return <Flame className="w-5 h-5 text-amber-500" />;
      case 'damageLevel': return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'xpLevel': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      case 'luckLevel': return <Coffee className="w-5 h-5 text-purple-500" />;
    }
  };

  const activeCharacter = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharacterId) || PLAYABLE_CHARACTERS[0];

  const unlockedCharacters = PLAYABLE_CHARACTERS; // Temporarily unlock all characters for testing

  const handleCycleCharacter = () => {
    audio.playCoin();
    const currentIdx = unlockedCharacters.findIndex(c => c.id === selectedCharacterId);
    const nextIdx = (currentIdx + 1) % unlockedCharacters.length;
    const nextChar = unlockedCharacters[nextIdx];
    if (nextChar) {
      onSelectCharacter(nextChar.id);
    }
  };

  const tryFullscreen = () => {
    try {
      const docEl = document.documentElement;
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if ((docEl as any).webkitRequestFullscreen) {
        (docEl as any).webkitRequestFullscreen();
      } else if ((docEl as any).mozRequestFullScreen) {
        (docEl as any).mozRequestFullScreen();
      } else if ((docEl as any).msRequestFullscreen) {
        (docEl as any).msRequestFullscreen();
      }
    } catch (err) {}
  };

  return (
    <div 
      id="main-menu-container" 
      className="w-full h-full bg-slate-900 text-slate-100 flex flex-col justify-between items-center p-3 pb-4 sm:p-5 select-none overflow-hidden bg-dark-grid animate-fade-in relative gap-2 sm:gap-4"
    >
      {/* Medalhas de Carreira - Floating Top-Left */}
      <button
        id="btn-career-medals"
        onClick={() => {
          audio.playCoin();
          setShowAchievementsModal(true);
        }}
        className="absolute top-3 left-3 sm:top-5 sm:left-5 p-2 bg-yellow-400 text-black brutalist-border-thin rounded-none shadow-[3px_3px_0px_#000] hover:bg-yellow-500 transition pointer-events-auto flex items-center justify-center z-40 active:translate-y-[1px] active:shadow-none"
        title="Medalhas de Carreira"
      >
        <Award className="w-4 h-4 sm:w-5 sm:h-5 text-black" strokeWidth={3} />
      </button>

      {/* Controle de Som - Floating Top-Right */}
      <button 
        id="sound-toggle"
        onClick={() => {
          onToggleSound();
          audio.playCoin();
        }}
        className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 bg-yellow-400 text-black brutalist-border-thin rounded-none shadow-[3px_3px_0px_#000] hover:bg-yellow-500 transition pointer-events-auto flex items-center justify-center z-40 active:translate-y-[1px] active:shadow-none"
        title={soundEnabled ? "Mutar Som" : "Ativar Som"}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-black" strokeWidth={3} /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-black" strokeWidth={3} />}
      </button>

      {/* Header and Title */}
      <header className="w-full max-w-sm sm:max-w-md mx-auto text-center pt-9 pb-2 relative flex flex-col items-center shrink-0">
        
        {/* 1. Sobreviva às Aulas Red Banner Box (Top Layer, centered over the yellow title box) */}
        <div className="z-30 -mb-1 relative -rotate-1 translate-y-1 sm:translate-y-1.5 skew-x-1">
          <div className="bg-red-650 text-white font-sans font-black text-[12px] sm:text-[15px] md:text-[17px] px-4 py-0.5 border-2 border-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
            SOBREVIVA ÀS AULAS
          </div>
        </div>

        {/* 2. Main Yellow Logo (Middle Layer) - Giant Arcade-style retro block for massive emphasis */}
        <h1 
          id="game-logo" 
          className="uppercase bg-yellow-400 text-black border-4 border-black -rotate-1 shadow-[6px_6px_0px_#000] sm:shadow-[10px_10px_0px_#000] relative z-20 flex items-center justify-center tracking-tighter w-[310px] h-[80px] text-[46px] leading-[26px] sm:w-[410px] sm:h-[110px] sm:text-[64px] sm:leading-[36px]"
          style={{
            fontFamily: '"Pixelify Sans", sans-serif',
            fontWeight: 'bold',
            fontStyle: 'normal',
          }}
        >
          CORRE, PROF!
        </h1>

        {/* 3. Description Box tucked behind/below the yellow title card (Bottom Layer) */}
        <div className="z-10 -mt-2.5 sm:-mt-5 w-[82%] sm:w-[85%] bg-[#081325] border-2 border-black pt-4 sm:pt-7 pb-1.5 sm:pb-2 px-1.5 sm:px-3 text-center shadow-[3px_3px_0px_#000] -rotate-[0.5deg]">
          <p 
            className="text-slate-300 font-bold uppercase tracking-wider leading-relaxed text-[8.5px] sm:text-[10px]"
          >
            O DIÁRIO FECHANDO, A BUROCRACIA ATACANDO<br />E A <span className="text-red-500 font-black">CANETA VERMELHA</span> FRITANDO!
          </p>
        </div>
      </header>

      {/* Main Container - Compact and non-expanding */}
      <main className="w-full max-w-sm sm:max-w-md mx-auto bg-slate-950/75 brutalist-border rounded-none p-0 flex-none flex flex-col justify-start relative shadow-[4px_4px_0px_#000] min-h-0">
        
        {/* Context Academic Year Text inserted snug against container with no margin-bottom */}
        <div className="w-full p-2.5 sm:p-3 px-3.5 sm:px-5 bg-slate-900 border-b-2 border-black text-center text-slate-200 flex flex-col justify-center items-center shrink-0">
          <p className="leading-normal sm:leading-relaxed font-bold italic text-slate-300 font-sans text-[10.5px] sm:text-[12.5px] max-w-[95%] mx-auto">
            "O ano letivo está a todo vapor! Prepare seus diários de classe, encha sua xícara de café puro e limpe suas canetas vermelhas para enfrentar o descontrole pedagógico."
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2 bg-slate-950/40 py-0.5 px-3 border border-slate-800/50 rounded-none w-fit">
            <span className="text-yellow-400 font-mono font-black uppercase tracking-wider text-[8.5px] sm:text-[10px] flex items-center gap-1">
              EXPEDIENTE ATIVO 🎒
            </span>
          </div>
        </div>

        {/* Tab Context Container snug with zero margins */}
        <div className="flex-none flex flex-col min-h-0 animate-fade-in w-full">
          
          {/* BEAUTIFUL RETRO OPERATIONAL TARGETING SELECTION CARD */}
          <div className="bg-[#0f172a] p-2.5 sm:p-4 flex flex-col justify-start min-h-0 w-full gap-2">
            
            {/* Scenario Selector Panel */}
            <div className="bg-[#0f172b] p-2 sm:p-3 flex flex-col items-center justify-center rounded-none relative">

              
              <div className="flex items-center justify-center gap-1.5 sm:gap-3 w-full mt-0.5 sm:mt-1">
                {/* Left Arrow button styled with solid shadow */}
                <button 
                  onClick={() => {
                    audio.playCoin();
                    setChosenScenarioIndex((prev) => {
                      return (prev - 1 + unlockedScenarios.length) % unlockedScenarios.length;
                    });
                  }}
                  disabled={activeIdx === 0}
                  className={`p-1.5 sm:p-2 border-2 border-black text-black cursor-pointer shadow-[1px_1px_0px_#000] active:translate-y-px active:shadow-none rounded-none flex items-center justify-center transition-all ${
                    activeIdx === 0
                      ? 'bg-slate-850 text-slate-600 border-slate-900 cursor-not-allowed opacity-20 shadow-none transform-none' 
                      : 'bg-yellow-400 hover:bg-yellow-500'
                  }`}
                  title="Cenário Anterior"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-black" strokeWidth={3} />
                </button>

                {/* Scenario preview frame with corner targets representing a game camera screen */}
                <div className="relative group p-0.5 bg-black border-2 border-transparent hover:scale-[1.02] transition-all duration-150 shrink-0 shadow-[0_0_12px_rgba(0,0,0,0.6)]">
                  {/* Four Corner Target Brackets */}
                  <div className="absolute top-0 left-0 w-2 h-2 sm:w-2.5 sm:h-2.5 border-t-2 border-l-2 border-yellow-400 z-10" />
                  <div className="absolute top-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 border-t-2 border-r-2 border-yellow-400 z-10" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 sm:w-2.5 sm:h-2.5 border-b-2 border-l-2 border-yellow-400 z-10" />
                  <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 border-b-2 border-r-2 border-yellow-400 z-10" />
                  
                  <ScenarioPreview 
                    type={activeScenario.type} 
                    accentColor={activeScenario.accentColor} 
                    floorColor={activeScenario.floorColor} 
                    gridColor={activeScenario.gridColor} 
                  />
                </div>

                {/* Right Arrow Button */}
                {(() => {
                  const isRightDisabled = activeIdx >= maxIdx;
                  return (
                    <button 
                      onClick={() => {
                        audio.playCoin();
                        setChosenScenarioIndex((prev) => {
                          return (prev + 1) % unlockedScenarios.length;
                        });
                      }}
                      disabled={isRightDisabled}
                      className={`p-1.5 sm:p-2 border-2 border-black text-black cursor-pointer shadow-[1px_1px_0px_#000] active:translate-y-px active:shadow-none rounded-none flex items-center justify-center transition-all ${
                        isRightDisabled 
                          ? 'bg-slate-850 text-slate-600 border-slate-900 cursor-not-allowed opacity-20 shadow-none transform-none' 
                          : 'bg-yellow-400 hover:bg-yellow-500'
                      }`}
                      title="Próximo Cenário"
                    >
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-black" strokeWidth={3} />
                    </button>
                  );
                })()}
              </div>
              
              {/* Scenario parameters display panel */}
              <div className="text-center mt-1.5 sm:mt-2 flex flex-col items-center w-full">
                <h3 className="font-sans font-black text-xs sm:text-sm md:text-base text-white uppercase tracking-tight flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: activeScenario.accentColor, color: activeScenario.accentColor }} />
                  {activeScenario.name}
                </h3>
                
                <div className="flex items-center justify-center gap-1.5 mt-1 font-mono text-[8px] sm:text-[9.5px] font-bold">
                  <span className="text-slate-300 bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded-none flex items-center gap-1">
                    DIFICULDADE: <span className="text-red-500 font-extrabold">{activeScenario.type === ScenarioType.SALA_DE_AULA ? 'FÁCIL' : activeScenario.type === ScenarioType.CORREDOR_ESCOLAR ? 'MÉDIO' : activeScenario.type === ScenarioType.PATIO ? 'DIFÍCIL' : 'EXTREMO'}</span>
                  </span>
                  <span className="text-slate-300 bg-slate-950 border border-slate-850 px-1.5 py-0.5 rounded-none flex items-center gap-1">
                    MULTIPLICADOR: <span className="text-yellow-400 font-extrabold">x{activeScenario.difficultyMultiplier.toFixed(1)}</span>
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Base main menu and actions row */}
      <footer className="w-full max-w-sm sm:max-w-md mx-auto shrink-0 pb-1">
        <div className="grid grid-cols-3 gap-1.5">
          {/* INIMIGOS */}
          <button
            id="base-btn-enemies"
            onClick={() => {
              audio.playCoin();
              setShowEnemiesModal(true);
            }}
            className="py-3.5 sm:py-4 px-1 bg-[#FDFCF0] text-black hover:bg-yellow-50 border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition text-[13px] sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1 xs:gap-1.5 pointer-events-auto"
            title="Dossiê de Inimigos"
          >
            <User className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-black" strokeWidth={3} />
            <span>Inimigos</span>
          </button>

          {/* JOGAR */}
          <button
            id="base-btn-play"
            onClick={() => {
              tryFullscreen();
              audio.playLevelUp();
              onStartGame(activeScenario);
            }}
            className="py-3.5 sm:py-4 px-1 bg-yellow-400 hover:bg-yellow-500 text-black border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition text-[13px] sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1 xs:gap-1.5 pointer-events-auto"
            title="Jogar Agora!"
          >
            <Play className="w-[18px] h-[18px] sm:w-5 sm:h-5 fill-current text-black" strokeWidth={3} />
            <span>Jogar</span>
          </button>

          {/* MELHORIAS */}
          <button
            id="base-btn-upgrades"
            onClick={() => {
              audio.playCoin();
              setShowUpgradesModal(true);
            }}
            className="py-3.5 sm:py-4 px-1 bg-[#FDFCF0] text-black hover:bg-yellow-50 border-2 border-black rounded-none shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition text-[13px] sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-1 xs:gap-1.5 pointer-events-auto"
            title="Melhorias Permanentes"
          >
            <Dumbbell className="w-[18px] h-[18px] sm:w-5 sm:h-5 text-black" strokeWidth={3} />
            <span>Melhorias</span>
          </button>
        </div>
      </footer>

      {/* OVERLAY WINDOW/MODAL DE MELHORIAS (SHOP) */}
      {showUpgradesModal && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="w-full max-w-md bg-[#FDFCF0] brutalist-border brutalist-shadow-heavy p-4 relative text-black flex flex-col max-h-[85%]">
            
            {/* Header of Modal */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4 text-amber-500 animate-bounce" strokeWidth={3} />
                Sala de Melhorias do Prof
              </h3>
              <button 
                onClick={() => {
                  audio.playCoin();
                  setShowUpgradesModal(false);
                }}
                className="p-1 px-2 border-2 border-black bg-white hover:bg-red-50 text-black text-xs font-black"
                title="Fechar"
              >
                <X className="w-3 h-3 text-black" strokeWidth={3} />
              </button>
            </div>

            {/* Fundeb Gold indicator */}
            <div className="p-2 bg-yellow-400 text-black brutalist-border-thin rounded-none text-[10px] font-black flex items-center justify-between shadow-[2px_2px_0px_#000] mb-3 shrink-0">
              <span className="tracking-tight">VERBA DO FUNDEB ACUMULADA:</span>
              <span className="text-black font-mono font-black flex items-center gap-0.5 bg-white px-2 py-0.5 border border-black">
                <Coins className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {gold}
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto no-scrollbar gap-3 flex flex-col min-h-0 pr-0.5">
              {(Object.keys(upgrades) as Array<keyof PermanentShopUpgrades>).map((key) => {
                const currentLvl = upgrades[key];
                const isMax = currentLvl >= MAX_UPGRADE_LEVEL;
                const cost = UPGRADE_COSTS[currentLvl] || 0;
                const canBuy = gold >= cost && !isMax;

                return (
                  <div 
                    key={key}
                    className="p-3 bg-white text-black border-2 border-black rounded-none shadow-[2.5px_2.5px_0px_#000] flex items-center justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {getUpgradeIcon(key)}
                        <p className="font-black text-[11px] text-black uppercase tracking-tight leading-tight">
                          {getUpgradeLabel(key)}
                        </p>
                      </div>
                      <p className="text-[9.5px] text-gray-700 leading-snug whitespace-normal break-words mb-2 font-semibold">
                        {getUpgradeDesc(key)}
                      </p>
                      
                      {/* Display levels indicators dots */}
                      <div className="flex items-center gap-1 mt-1">
                        {Array.from({ length: MAX_UPGRADE_LEVEL }).map((_, idx) => (
                          <span 
                            key={idx}
                            className={`w-3.5 h-1.5 rounded-none border border-black ${
                              idx < currentLvl ? 'bg-yellow-400' : 'bg-gray-200'
                            }`} 
                          />
                        ))}
                        <span className="text-[8.5px] font-mono font-black text-gray-500 ml-1.5">
                          {currentLvl}/5
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-center">
                      {isMax ? (
                        <span className="bg-gray-200 text-gray-500 border border-gray-400 py-1.5 px-2 rounded-none text-[8.5px] font-black uppercase">
                          MÁXIMO
                        </span>
                      ) : (
                        <button
                          id={`upgrade-buy-${key}`}
                          onClick={() => {
                            if (canBuy) {
                              audio.playLevelUp();
                              onUpgradeBuy(key);
                            }
                          }}
                          disabled={!canBuy}
                          className={`py-1.5 px-2 rounded-none text-[9.5px] transition pointer-events-auto border-2 border-black flex flex-col items-center justify-center min-w-[70px] ${
                            canBuy 
                              ? 'bg-yellow-400 hover:bg-yellow-500 text-black font-black shadow-[2px_2px_0px_#000] active:translate-y-0.5' 
                              : 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                          }`}
                        >
                          <span className="text-[7.5px] uppercase font-black tracking-wider">COMPRAR</span>
                          <span className="font-mono font-black flex items-center gap-0.5 mt-0.5 text-[9.5px] leading-none">
                            <Coins className="w-2.5 h-2.5" /> {cost}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Close button inside modal */}
            <div className="mt-3.5 pt-2 border-t border-black shrink-0">
              <button
                onClick={() => {
                  audio.playCoin();
                  setShowUpgradesModal(false);
                }}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black border-2 border-black uppercase text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer text-center"
              >
                Fechar Melhorias
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY WINDOW/MODAL DE INIMIGOS (DOSSIÊ) */}
      {showEnemiesModal && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="w-full max-w-md bg-[#FDFCF0] brutalist-border brutalist-shadow-heavy p-4 relative text-black flex flex-col max-h-[85%]">
            
            {/* Header of Modal */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5 font-sans">
                <User className="w-4 h-4 text-rose-500 animate-bounce" strokeWidth={3} />
                Dossiê Pedagógico de Oponentes
              </h3>
              <button 
                onClick={() => {
                  audio.playCoin();
                  setShowEnemiesModal(false);
                }}
                className="p-1 px-2 border-2 border-black bg-white hover:bg-red-50 text-black text-xs font-black"
                title="Fechar"
              >
                <X className="w-3 h-3 text-black" strokeWidth={3} />
              </button>
            </div>

            {/* Filtering Controls */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-black border-2 border-slate-900 mb-3 shrink-0">
              {(['alunos', 'burocracia', 'chefes', 'professores'] as const).map((filterOpt) => (
                <button
                  key={filterOpt}
                  onClick={() => {
                    audio.playCoin();
                    setEnemyFilter(filterOpt);
                  }}
                  className={`py-1 text-[8px] font-black uppercase text-center transition ${
                    enemyFilter === filterOpt 
                      ? 'bg-yellow-400 text-black' 
                      : 'text-slate-200 hover:text-white'
                  }`}
                >
                  {filterOpt}
                </button>
              ))}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto no-scrollbar gap-3 flex flex-col min-h-0 pr-0.5 mb-2">
              {(() => {
                const listToRender = enemyFilter === 'professores'
                  ? PLAYABLE_CHARACTERS.map(c => ({
                      name: c.name,
                      subtitle: c.role,
                      emoji: c.emoji,
                      difficulty: `HP ${c.baseMaxHp} | SPD ${c.baseSpeed}`,
                      background: `${c.description}\n\nPeculiaridade: ${c.characteristic}\n\nHabilidade: [${c.specialAbilityName}] - ${c.specialAbilityDesc}`,
                      quotes: ["A sabedoria liberta!", "Planejamento pronto."],
                      theme: 'sky',
                      studentKey: undefined,
                      enemyType: undefined,
                      characterId: c.id
                    }))
                  : filteredEnemies;

                return listToRender.map((enemy, idx) => {
                  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  if (enemy.theme === 'sky') {
                    badgeColor = 'bg-sky-100 text-sky-800 border-sky-300';
                  } else if (enemy.theme === 'amber') {
                    badgeColor = 'bg-amber-100 text-amber-800 border-amber-300';
                  } else if (enemy.theme === 'rose') {
                    badgeColor = 'bg-rose-100 text-rose-800 border-rose-300';
                  }

                  return (
                    <div 
                      key={idx} 
                      className="p-3 bg-white text-black border-2 border-black rounded-none flex flex-col gap-2 shadow-[2px_2px_0px_#000]"
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-gray-200 pb-1 flex-wrap">
                        <div className="flex flex-col">
                          <span className="font-black text-xs uppercase text-slate-950">
                            {enemy.name}
                          </span>
                          {enemy.subtitle && (
                            <span className="text-[9.5px] font-black text-red-600 font-serif italic">
                              {enemy.subtitle}
                            </span>
                          )}
                        </div>
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 border ${badgeColor}`}>
                          {enemy.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-[9.5px] text-gray-750 font-semibold bg-gray-50 p-1.5 border border-dashed border-gray-250 leading-snug whitespace-pre-wrap">
                        {enemy.background}
                      </p>
                      
                      {/* Quotes and speaker art */}
                      <div className="flex items-start gap-3 border-t border-dashed border-gray-200 pt-1.5 mt-1">
                        {/* Real Pixel Art thumbnail (No background, No border, w-12 h-12) */}
                        <div className="flex-shrink-0 flex flex-col items-center gap-1 select-none">
                          <div className="flex items-center justify-center select-none" style={{ imageRendering: 'pixelated' }}>
                            {enemy.studentKey || enemy.enemyType || (enemy as any).characterId ? (
                              <EnemyThumbnail 
                                studentKey={enemy.studentKey} 
                                enemyType={enemy.enemyType} 
                                characterId={(enemy as any).characterId}
                                className="w-12 h-12" 
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center text-2xl">
                                {enemy.emoji}
                              </div>
                            )}
                          </div>
                          
                          {/* Pixelated Crisp HD Download Button! */}
                          {(enemy.studentKey || enemy.enemyType || (enemy as any).characterId) && (
                            <button
                              onClick={() => {
                                audio.playCoin();
                                handleDownloadSpriteSheet(
                                  enemy.name, 
                                  enemy.studentKey,
                                  enemy.enemyType,
                                  (enemy as any).characterId
                                );
                              }}
                              className="mt-1.5 px-2 py-1 bg-yellow-400 hover:bg-yellow-500 text-black border border-black font-black text-[7.5px] uppercase tracking-wider flex items-center gap-1 rounded-none shadow-[1.5px_1.5px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px] cursor-pointer"
                              title="Baixar planilha de sprites (12 frames) em Alta Definição"
                            >
                              💾 Sprite HD
                            </button>
                          )}
                        </div>

                        {/* Right quotes speech balloons (Yellow style with pointers and shadows) */}
                        <div className="flex-1 flex flex-col gap-1.5">
                          {enemy.quotes.slice(0, 2).map((quote, qidx) => (
                            <div 
                              key={qidx} 
                              className="relative text-[9.5px] font-black font-sans bg-yellow-50 hover:bg-yellow-100 text-slate-900 px-2.5 py-1 border border-black rounded-none shadow-[1px_1px_0px_#000] max-w-max italic leading-snug animate-fade-in"
                            >
                              {qidx === 0 && (
                                /* Clean retro speech pointer arrow referencing the source speaker */
                                <div className="absolute top-2.5 -left-[5px] w-0 h-0 border-t-[4px] border-t-transparent border-r-[5px] border-r-black border-b-[4px] border-b-transparent">
                                  <div className="absolute -top-[3px] left-[1px] w-0 h-0 border-t-[3px] border-t-transparent border-r-[4px] border-r-yellow-50 border-b-[3px] border-b-transparent" />
                                </div>
                              )}
                              "{quote}"
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Close button inside modal */}
            <div className="mt-3.5 pt-2 border-t border-black shrink-0">
              <button
                onClick={() => {
                  audio.playCoin();
                  setShowEnemiesModal(false);
                }}
                className="w-full py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-black border-2 border-black uppercase text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer text-center"
              >
                Fechar Dossiê
              </button>
            </div>

          </div>
        </div>
      )}

      {/* OVERLAY WINDOW/MODAL DE CONQUISTAS (MEDALHAS) */}
      {showAchievementsModal && (
        <div className="absolute inset-0 bg-black/85 flex items-center justify-center p-4 z-50 animate-fade-in select-none">
          <div className="w-full max-w-sm bg-[#FDFCF0] brutalist-border brutalist-shadow-heavy p-4 relative text-black flex flex-col max-h-[85%]">
            
            {/* Header of Modal */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <h3 className="text-xs font-black uppercase text-black flex items-center gap-1.5">
                <Award className="w-4 h-4 text-yellow-500 animate-bounce" strokeWidth={3} />
                Medalhas de Carreira
              </h3>
              <button 
                onClick={() => {
                  audio.playCoin();
                  setShowAchievementsModal(false);
                }}
                className="p-1 px-2 border-2 border-black bg-white hover:bg-red-50 text-black text-xs font-black"
                title="Fechar"
              >
                <X className="w-3 h-3 text-black" strokeWidth={3} />
              </button>
            </div>

            {/* Achievements List */}
            <div className="flex-1 overflow-y-auto no-scrollbar gap-2.5 flex flex-col min-h-0 pr-0.5">
              {achievements.map((ach) => {
                const progressPct = Math.min(100, Math.floor((ach.currentValue / ach.targetValue) * 100));
                return (
                  <div 
                    key={ach.id}
                    className={`p-2.5 rounded-none border-2 border-black ${
                      ach.unlocked 
                        ? 'bg-yellow-50 text-black shadow-[2px_2px_0px_#000]' 
                        : 'bg-white text-black'
                    } flex items-center gap-2.5`}
                  >
                    <div className={`p-1.5 border-2 border-black rounded-none shrink-0 ${
                      ach.unlocked ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {ach.unlocked ? <CheckCircle2 className="w-4 h-4" strokeWidth={3} /> : <Award className="w-4 h-4" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <p className="font-black text-[11px] text-slate-900 uppercase truncate">
                          {ach.title}
                        </p>
                        <span className="text-[8.5px] text-gray-500 font-mono font-bold">
                          {ach.currentValue}/{ach.targetValue}
                        </span>
                      </div>
                      <p className="text-[9.5px] text-gray-600 leading-tight font-semibold">{ach.description}</p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-100 h-1.5 border border-black rounded-none mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${ach.unlocked ? 'bg-emerald-400 border-r border-black' : 'bg-yellow-400 border-r border-black'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {ach.unlocked && (
                      <div className="shrink-0 flex flex-col items-center bg-yellow-105 border border-black rounded-none p-1 text-[7.5px] shadow-[1px_1px_0px_#000]">
                        <span className="text-black font-black font-mono text-[6px] uppercase leading-none">GIZ</span>
                        <span className="font-black font-mono text-black flex items-center gap-0.5 mt-0.5 leading-none">
                          +{ach.rewardCoins} <Coins className="w-2 h-2 text-yellow-600" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons at bottom */}
            <div className="mt-3.5 flex items-center justify-between gap-2.5">
              <button
                onClick={() => {
                  if (window.confirm("Deseja realmente resetar sua carreira pedagógica e apagar todos os upgrades?")) {
                    onResetProgress();
                    setShowAchievementsModal(false);
                  }
                }}
                className="py-1.5 px-2.5 bg-red-600 hover:bg-red-700 text-white font-mono text-[9px] font-black border border-black uppercase shadow-[1.5px_1.5px_0px_#000] active:translate-x-[0.5px] active:translate-y-[0.5px] cursor-pointer flex-shrink-0 flex items-center gap-1"
                title="Zerar Carreira Docente"
              >
                <Trash2 className="w-3 h-3 text-white" /> ZERAR CARREIRA
              </button>
              <button
                onClick={() => {
                  audio.playCoin();
                  setShowAchievementsModal(false);
                }}
                className="flex-1 py-1.5 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black border-2 border-black uppercase text-xs shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer text-center"
              >
                Fechar Medalhas
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
