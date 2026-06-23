/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Play, 
  ArrowLeft, 
  Lock, 
  Sparkles, 
  Heart, 
  Flame, 
  UserPlus, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { 
  PLAYABLE_CHARACTERS, 
  CharacterId, 
  CharacterConfig, 
  ScenarioType 
} from '../types';
import { audio } from '../utils/audio';

interface CharacterSelectProps {
  completedScenarios: ScenarioType[];
  selectedCharacterId: CharacterId;
  onSelectCharacter: (id: CharacterId) => void;
  onBack: () => void;
  onStartGame: () => void;
}

export default function CharacterSelectScreen({
  completedScenarios,
  selectedCharacterId,
  onSelectCharacter,
  onBack,
  onStartGame
}: CharacterSelectProps) {
  const [hoveredChar, setHoveredChar] = useState<CharacterConfig | null>(null);

  const checkIsUnlocked = (charId: CharacterId): { unlocked: boolean; condition: string } => {
    switch (charId) {
      case CharacterId.CLASSICO:
        return { unlocked: true, condition: 'Livre dedicação' };
      case CharacterId.ARTES:
        const artesUnlocked = completedScenarios.includes(ScenarioType.SALA_DE_AULA);
        return { 
          unlocked: artesUnlocked, 
          condition: 'Conclua a fase "Sala de Aula"' 
        };
      case CharacterId.ED_FISICA:
        const edFisicaUnlocked = completedScenarios.includes(ScenarioType.CORREDOR_ESCOLAR);
        return { 
          unlocked: edFisicaUnlocked, 
          condition: 'Conclua a fase "Corredor Escolar"' 
        };
      case CharacterId.INGLES:
        const inglesUnlocked = completedScenarios.includes(ScenarioType.PATIO);
        return { 
          unlocked: inglesUnlocked, 
          condition: 'Conclua a fase "Pátio Escolar"' 
        };
      default:
        return { unlocked: true, condition: '' };
    }
  };

  const selectedChar = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharacterId) || PLAYABLE_CHARACTERS[0];
  const activeDetailChar = hoveredChar || selectedChar;
  const activeDetailUnlockInfo = checkIsUnlocked(activeDetailChar.id);

  return (
    <div 
      id="char-select-screen" 
      className="absolute inset-0 bg-slate-900 text-slate-100 flex flex-col justify-between p-4 select-none overflow-hidden bg-dark-grid"
    >
      {/* Header */}
      <header className="w-full text-center py-2 flex flex-col items-center">
        <div className="flex items-center gap-1 bg-yellow-400 text-black text-[9px] font-black px-2.5 py-0.5 brutalist-border-thin uppercase tracking-wider mb-2">
          Estereótipos de Professores 👩‍🏫👨‍🏫
        </div>
        <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter bg-slate-950 px-4 py-1.5 brutalist-border shadow-[3px_3px_0px_#000] -rotate-1">
          ESCOLHA SUA SKIN (ESTEREÓTIPO)
        </h2>
        <p className="text-[10px] text-slate-400 uppercase tracking-wide mt-2">
          Selecione o arquétipo docente para enfrentar o expediente de hoje
        </p>
      </header>

      {/* Grid of Characters (fits cell screen with no scrolling) */}
      <main className="w-full flex-1 flex flex-col justify-center gap-3 my-2 min-h-0">
        <div className="grid grid-cols-2 gap-2.5">
          {PLAYABLE_CHARACTERS.map((char) => {
            const { unlocked, condition } = checkIsUnlocked(char.id);
            const isSelected = selectedCharacterId === char.id;
            
            return (
              <div
                key={char.id}
                onMouseEnter={() => setHoveredChar(char)}
                onMouseLeave={() => setHoveredChar(null)}
                onClick={() => {
                  if (unlocked) {
                    audio.playCoin();
                    onSelectCharacter(char.id);
                  } else {
                    audio.playGameOver(); // feedback for locked
                  }
                }}
                className={`relative p-3 rounded-none border-4 transition flex flex-col items-center justify-center text-center cursor-pointer select-none ${
                  isSelected 
                    ? 'bg-yellow-400 text-black border-black shadow-[4px_4px_0px_#000]'
                    : !unlocked
                      ? 'bg-slate-950/90 text-slate-600 border-slate-800 opacity-60'
                      : 'bg-slate-950 text-white border-black hover:bg-slate-850 shadow-[2px_2px_0px_#000]'
                }`}
              >
                {/* Character Big Emoji */}
                <div className="text-3xl filter drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] flex items-center justify-center h-10">
                  {char.emoji}
                </div>

                {/* Name */}
                <div className="w-full mt-1.5">
                  <h4 className="font-sans font-black text-xs uppercase leading-tight truncate">
                    {char.name}
                  </h4>
                </div>

                {/* Unlock status or cost */}
                <div className="mt-2 text-[8px] font-mono uppercase">
                  {unlocked ? (
                    isSelected ? (
                      <span className="bg-black text-yellow-400 px-1.5 py-0.5 border border-black font-black">
                        MINISTRANDO
                      </span>
                    ) : (
                      <span className="text-gray-400 border border-slate-700 px-1 py-0.5">
                        DISPONÍVEL
                      </span>
                    )
                  ) : (
                    <span className="bg-red-900 border border-red-500 font-black text-red-200 px-1 py-0.5 flex items-center gap-0.5 leading-none">
                      <Lock className="w-2.5 h-2.5" /> BLOQUEADO
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Detail Card for selected or hovered professor */}
        <div 
          className="flex-1 bg-white text-black brutalist-border p-3 flex flex-col justify-between shadow-[3px_3px_0px_#000] relative overflow-hidden text-left min-h-0"
          style={{ borderLeft: `6px solid ${activeDetailChar.accentColor}` }}
        >
          {/* Decorative Corner Tab */}
          <div className="absolute top-0 right-0 p-1 font-mono text-[7px] bg-black text-white font-black uppercase">
            {activeDetailChar.id === selectedCharacterId ? '★ SELECIONADO' : 'INFO'}
          </div>

          <div className="flex flex-col gap-1 min-h-0 overflow-hidden text-ellipsis">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">{activeDetailChar.emoji}</span>
              <div>
                <h3 className="font-black text-xs text-black uppercase leading-tight">
                  {activeDetailChar.name} - <span className="text-red-700">{activeDetailChar.role}</span>
                </h3>
                {/* Condition if locked */}
                {!checkIsUnlocked(activeDetailChar.id).unlocked && (
                  <p className="text-[9px] text-red-600 bg-red-100 border border-red-300 font-extrabold px-1.5 py-0.5 rounded-none mt-0.5 inline-block">
                    🔓 Desbloqueio: {checkIsUnlocked(activeDetailChar.id).condition}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[10px] text-gray-700 font-semibold leading-tight italic mt-1 pb-1.5 border-b border-gray-250">
              "{activeDetailChar.description}"
            </p>

            <div className="grid grid-cols-2 gap-1.5 pt-1.5">
              <div className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-red-600 shrink-0" />
                <span className="text-[9.5px] font-bold">Vigor (HP): <strong className="font-extrabold">{activeDetailChar.baseMaxHp}</strong></span>
              </div>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                <span className="text-[9.5px] font-bold">Velocidade: <strong className="font-extrabold">{activeDetailChar.baseSpeed}</strong></span>
              </div>
            </div>

            <div className="mt-2 text-left bg-slate-105 border border-slate-300 p-2 font-sans rounded-none shrink-0">
              <p className="text-[8.5px] font-black uppercase text-slate-800 flex items-center gap-1 mb-0.5">
                <span className="w-1.5 h-1.5 bg-red-600" />
                HABILIDADE EXCLUSIVA: <strong className="text-red-700">{activeDetailChar.specialAbilityName}</strong>
              </p>
              <p className="text-[9.5px] text-gray-700 leading-tight">
                {activeDetailChar.specialAbilityDesc}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Controls */}
      <footer className="w-full flex gap-2 pt-2 border-t border-slate-700">
        <button
          onClick={() => {
            audio.playCoin();
            onBack();
          }}
          className="flex-1 py-3 px-3.5 bg-slate-950 text-white font-black uppercase tracking-wider text-[10px] brutalist-border-thin shadow-[2px_2px_0px_#000] hover:bg-slate-800 transition pointer-events-auto flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={3} />
          <span>Voltar</span>
        </button>

        <button
          onClick={() => {
            const { unlocked } = checkIsUnlocked(selectedCharacterId);
            if (unlocked) {
              audio.playLevelUp();
              onStartGame();
            } else {
              audio.playGameOver();
            }
          }}
          disabled={!checkIsUnlocked(selectedCharacterId).unlocked}
          className={`flex-[2] py-3 px-4 font-black text-[11px] uppercase tracking-wider brutalist-border shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 transition pointer-events-auto ${
            checkIsUnlocked(selectedCharacterId).unlocked
              ? 'bg-emerald-400 hover:bg-emerald-500 text-black'
              : 'bg-gray-700 text-slate-400 cursor-not-allowed border-gray-600 shadow-none'
          }`}
        >
          <Play className="w-4 h-4 fill-current" strokeWidth={3} />
          <span>Iniciar Expediente!</span>
        </button>
      </footer>
    </div>
  );
}
