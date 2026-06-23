/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Award, BookOpen, Coffee, Zap, Palette, Cpu, Coins, ShieldAlert } from 'lucide-react';
import { PlayerStats, WeaponType, PermanentShopUpgrades } from '../types';

interface PauseScreenProps {
  stats: PlayerStats;
  soundEnabled: boolean;
  permanentUpgrades: PermanentShopUpgrades;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  onToggleSound: () => void;
}

export default function PauseScreen({
  stats,
  soundEnabled,
  permanentUpgrades,
  onResume,
  onRestart,
  onExit,
  onToggleSound
}: PauseScreenProps) {
  const [confirmExit, setConfirmExit] = React.useState(false);
  const [confirmRestart, setConfirmRestart] = React.useState(false);

  React.useEffect(() => {
    if (confirmExit) {
      const t = setTimeout(() => setConfirmExit(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmExit]);

  React.useEffect(() => {
    if (confirmRestart) {
      const t = setTimeout(() => setConfirmRestart(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirmRestart]);
  
  const getEmojiAndStyle = (type: WeaponType) => {
    switch (type) {
      case WeaponType.CANETA_VERMELHA: return { emoji: '🖋️', border: 'border-red-500 bg-red-955/20 text-red-500' };
      case WeaponType.DIARIO_DE_CLASSE: return { emoji: '📖', border: 'border-blue-500 bg-blue-955/20 text-blue-500' };
      case WeaponType.APOSTILA: return { emoji: '📚', border: 'border-pink-500 bg-pink-955/20 text-pink-500' };
      case WeaponType.DATASHOW: return { emoji: '💡', border: 'border-yellow-500 bg-yellow-955/20 text-yellow-500' };
      case WeaponType.NOTEBOOK: return { emoji: '💻', border: 'border-purple-500 bg-purple-955/20 text-purple-500' };
      case WeaponType.CAFE: return { emoji: '☕', border: 'border-amber-600 bg-amber-955/20 text-amber-600' };
      case WeaponType.INTELEGENCIA_ARTIFICIAL: return { emoji: '🤖', border: 'border-emerald-500 bg-emerald-955/20 text-emerald-500' };
      default: return { emoji: '🎒', border: 'border-gray-500 bg-gray-955/20 text-gray-500' };
    }
  };

  const hasWeapons = Object.values(stats.weapons).some(w => w.level > 0);

  return (
    <div 
      id="pause-overlay" 
      className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs z-55 flex flex-col items-center justify-center p-4 select-none overflow-y-auto"
    >
      <div className="w-full max-w-sm bg-[#FDFCF0] border-4 border-black p-5 shadow-[8px_8px_0px_#000] rounded-none flex flex-col gap-4 text-black">
        
        {/* Compact Game Paused Header styled exactly like Level Up */}
        <div className="text-center w-full mb-1 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black text-xl sm:text-2xl font-black px-5 py-2 border-3 border-black rounded-none uppercase tracking-widest mb-1 transform -rotate-1 shadow-[4px_4px_0px_#000]">
            INTERVALO 📋
          </div>
        </div>

        {/* Dynamic Survival Stats Row */}
        <div className="p-3 bg-white border-3 border-black rounded-none grid grid-cols-4 gap-2 text-[10px] sm:text-xs font-mono shadow-[3px_3px_0px_#000] text-center">
          <div className="flex flex-col">
            <span className="text-gray-500 text-[8px] uppercase font-bold font-sans leading-none">TEMPO</span>
            <span className="text-black mt-1 font-black">
              {Math.floor(stats.timeSurvived / 60)}:{String(Math.floor(stats.timeSurvived % 60)).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col border-l-2 border-black/15">
            <span className="text-gray-500 text-[8px] uppercase font-bold font-sans leading-none">VISTOS</span>
            <span className="text-red-650 mt-1 font-black">{stats.defeatedCount}</span>
          </div>
          <div className="flex flex-col border-l-2 border-black/15">
            <span className="text-gray-500 text-[8px] uppercase font-bold font-sans leading-none">FUNDEB</span>
            <span className="text-amber-600 mt-1 font-black">
              {stats.goldCurrent}
            </span>
          </div>
          <div className="flex flex-col border-l-2 border-black/15">
            <span className="text-gray-500 text-[8px] uppercase font-bold font-sans leading-none">NÍVEL</span>
            <span className="text-blue-650 mt-1 font-black">L{stats.level}</span>
          </div>
        </div>

        {/* mochila (WEAPONS & ACTIVE SKILLS LOADOUT) - Only emoji and level inside small squares */}
        <div className="border-3 border-black p-3 bg-white flex flex-col gap-2 rounded-none shadow-[3px_3px_0px_#000]">
          <h3 className="text-[10px] sm:text-xs font-sans font-black uppercase tracking-wide text-gray-800 text-center border-b-2 border-black/10 pb-1">
            🎒 MOCHILA ATIVA DE MATÉRIA ({Object.values(stats.weapons).filter(w => w.level > 0).length})
          </h3>
          
          {hasWeapons ? (
            <div className="flex flex-wrap gap-3 justify-center py-1">
              {Object.values(stats.weapons).map((w) => {
                if (w.level === 0) return null;
                const visual = getEmojiAndStyle(w.type);
                return (
                  <div 
                    key={w.type} 
                    className="w-11 h-11 border-3 border-black flex flex-col items-center justify-center relative bg-[#FDFCF0] shadow-[1.5px_1.5px_0px_#000] shrink-0"
                    title={w.name}
                  >
                    <span className="text-xl leading-none">{visual.emoji}</span>
                    <span className="absolute -bottom-1 -right-1 bg-black text-white font-mono font-black text-[8px] px-1 py-0.2 rounded-none leading-none border-t border-l border-black">
                      L{w.level}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-1 text-gray-400 text-[10px] font-mono italic">
              (Mochila de aula sem materiais)
            </div>
          )}
        </div>

        {/* Action Controls in Compact Brutalist Paper Document Style */}
        <div className="flex flex-col gap-2.5 mt-1">
          <button
            id="pause-resume-btn"
            onClick={onResume}
            className="w-full py-2.5 bg-emerald-400 text-black font-sans font-black uppercase rounded-none border-3 border-black shadow-[3px_3px_0px_#000] active:translate-y-[1.5px] active:shadow-[1.5px_1.5px_0px_#000] hover:bg-[#34d399] transition cursor-pointer flex items-center justify-center gap-1.5 pointer-events-auto text-xs"
          >
            <Play className="w-4 h-4 fill-current" strokeWidth={3} />
            <span>Retomar Aula</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="pause-sound-btn"
              onClick={onToggleSound}
              className="py-2 bg-yellow-300 hover:bg-yellow-400 text-black font-sans font-black uppercase rounded-none border-3 border-black shadow-[3px_3px_0px_#000] active:translate-y-[1.5px] active:shadow-[1.5px_1.5px_0px_#000] transition cursor-pointer flex items-center justify-center gap-1 pointer-events-auto text-[10px]"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-black" strokeWidth={3} /> : <VolumeX className="w-4 h-4" strokeWidth={3} />}
              <span>{soundEnabled ? 'MUTAR' : 'DESMUTAR'}</span>
            </button>

            <button
              id="pause-restart-btn"
              onClick={() => {
                if (!confirmRestart) {
                  setConfirmRestart(true);
                  setConfirmExit(false);
                } else {
                  onRestart();
                }
              }}
              className={`py-2 font-sans font-black uppercase rounded-none border-3 border-black shadow-[3px_3px_0px_#000] active:translate-y-[1.5px] active:shadow-[1.5px_1.5px_0px_#000] transition cursor-pointer flex items-center justify-center gap-1 pointer-events-auto text-[10px] ${
                confirmRestart 
                  ? 'bg-amber-400 text-black animate-pulse border-amber-600' 
                  : 'bg-white hover:bg-slate-100 text-black'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-black" strokeWidth={3} />
              <span>{confirmRestart ? 'Certeza?' : 'REINICIAR'}</span>
            </button>
          </div>

          <button
            id="pause-exit-btn"
            onClick={() => {
              if (!confirmExit) {
                setConfirmExit(true);
                setConfirmRestart(false);
              } else {
                onExit();
              }
            }}
            className={`w-full py-2 font-sans font-black uppercase rounded-none border-3 transition cursor-pointer flex items-center justify-center gap-1.5 pointer-events-auto text-[10px] ${
              confirmExit 
                ? 'bg-red-500 border-black text-white animate-pulse shadow-[3px_3px_0px_#000]' 
                : 'bg-white hover:bg-red-50 border-red-500 text-red-600 shadow-[3px_3px_0px_#000] active:translate-y-[1.5px] active:shadow-[1.5px_1.5px_0px_#000]'
            }`}
          >
            <Home className="w-4 h-4 text-current" />
            <span>{confirmExit ? 'SAIR MESMO?' : 'ABANDONAR AULA'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
