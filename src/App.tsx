/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar } from '@capacitor/status-bar';
import { 
  Coins, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Clock, 
  Award, 
  ChevronRight, 
  Compass, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Heart, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import StartScreen from './components/StartScreen';
import ActiveGame from './components/ActiveGame';
import CharacterSelectScreen from './components/CharacterSelectScreen';
import SplashScreen from './components/SplashScreen';
import { SatiricalResultsParticles } from './components/SatiricalResultsParticles';
import { Scenario, PermanentShopUpgrades, Achievement, CharacterId, ScenarioType } from './types';
import { audio } from './utils/audio';

const INITIAL_UPGRADES: PermanentShopUpgrades = {
  maxHpLevel: 0,
  speedLevel: 0,
  damageLevel: 0,
  xpLevel: 0,
  luckLevel: 0
};

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'defeat_50',
    title: 'Primeiro Visto',
    description: 'Atendeu com sucesso 50 alunos de pauta no total histórico',
    currentValue: 0,
    targetValue: 50,
    unlocked: false,
    rewardCoins: 50
  },
  {
    id: 'defeat_150',
    title: 'O Mestre do Carimbo',
    description: 'Carimbou e atendeu com sucesso 150 alunos/burocracias no total histórico',
    currentValue: 0,
    targetValue: 150,
    unlocked: false,
    rewardCoins: 100
  },
  {
    id: 'defeat_505',
    title: 'O Rei do Mimiógrafo',
    description: 'Exauriu seus braços rodando 500 avaliações pedagógicas na carreira',
    currentValue: 0,
    targetValue: 500,
    unlocked: false,
    rewardCoins: 250
  },
  {
    id: 'defeat_class_council',
    title: 'Sobrevivente do Conselho',
    description: 'Fechou as médias e derrotou a Coordenadora no temido Conselho de Classe com sanidade intacta',
    currentValue: 0,
    targetValue: 1,
    unlocked: false,
    rewardCoins: 300
  },
  {
    id: 'defeat_sabado',
    title: 'Sábado Letivo Superado',
    description: 'Bateu meta espiritual e sobreviveu ao expediente extra do Sábado Letivo',
    currentValue: 0,
    targetValue: 1,
    unlocked: false,
    rewardCoins: 300
  },
  {
    id: 'level_10',
    title: 'Café Puro Heroísmo',
    description: 'Atingiu Didática Nível 10 em uma partida com adrenalina de cafeína pura nas veias',
    currentValue: 0,
    targetValue: 10,
    unlocked: false,
    rewardCoins: 150
  },
  {
    id: 'survive_240',
    title: 'Vovó do Cafezinho',
    description: 'Garantia de fofoca e café fresco: resisteu por 4 minutos (240s) consecutivos de aula',
    currentValue: 0,
    targetValue: 240,
    unlocked: false,
    rewardCoins: 250
  },
  {
    id: 'earn_3000_gold',
    title: 'Arredonda para Cinco, Prof!',
    description: 'Acumulou um patrimônio docente total de 3000 Gis (Verba do FUNDEB) na carreira',
    currentValue: 0,
    targetValue: 3000,
    unlocked: false,
    rewardCoins: 250
  },
  {
    id: 'survive_victory',
    title: 'Férias de Julho!',
    description: 'Alcançou a vitória memorável fechando com sucesso o diário por 5 minutos (300s)!',
    currentValue: 0,
    targetValue: 1,
    unlocked: false,
    rewardCoins: 400
  },
  {
    id: 'survive_10_percent',
    title: 'Me dá 0.5 décimo?',
    description: 'Terminou um expediente letivo com menos de 10% de HP restante no sufoco',
    currentValue: 0,
    targetValue: 1,
    unlocked: false,
    rewardCoins: 200
  }
];

export default function App() {
  // Navigation Screens: 'splash' | 'menu' | 'char_select' | 'playing' | 'results'
  const [screen, setScreen] = useState<'splash' | 'menu' | 'char_select' | 'playing' | 'results'>('splash');
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  // Persistent States
  const [gold, setGold] = useState<number>(0);
  const [upgrades, setUpgrades] = useState<PermanentShopUpgrades>(INITIAL_UPGRADES);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [selectedCharacterId, setSelectedCharacterId] = useState<CharacterId>(CharacterId.CLASSICO);
  const [completedScenarios, setCompletedScenarios] = useState<ScenarioType[]>([]);

  // Latest class results
  const [results, setResults] = useState<{
    victory: boolean;
    goldGained: number;
    defeatedCount: number;
    survivedTime: number;
  } | null>(null);

  // Load from local storage
  useEffect(() => {
    // Hide status bar on native mobile
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.hide().catch((err) => {
          console.warn('StatusBar.hide failed:', err);
        });
      } catch (err) {
        console.warn('StatusBar.hide not supported or failed synchronously:', err);
      }
    }

    try {
      const storedGold = localStorage.getItem('correprof_gold_v2');
      if (storedGold) setGold(parseInt(storedGold, 10));

      const storedUpgrades = localStorage.getItem('correprof_upgrades_v2');
      if (storedUpgrades) {
        setUpgrades(JSON.parse(storedUpgrades));
      }

      const storedAchievements = localStorage.getItem('correprof_achievements_v3');
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      }

      const storedCompleted = localStorage.getItem('correprof_completed_scenarios_v2');
      if (storedCompleted) {
        setCompletedScenarios(JSON.parse(storedCompleted));
      }

      const storedSound = localStorage.getItem('correprof_sound_enabled');
      if (storedSound !== null) {
        const soundVal = storedSound === 'true';
        setSoundEnabled(soundVal);
        audio.toggleSound(soundVal);
      } else {
        audio.toggleSound(true);
      }
    } catch (e) {
      console.error("Erro ao ler dados de progresso local do professor.", e);
    }
  }, []);

  // Capacitor Android Back Button handler
  useEffect(() => {
    let backListener: any = null;

    const setupListener = async () => {
      if (!Capacitor.isNativePlatform()) return;
      try {
        backListener = await CapacitorApp.addListener('backButton', () => {
          if (screen === 'playing') {
            // Send event to game engine to trigger pause menu
            window.dispatchEvent(new CustomEvent('android-back-button'));
          } else if (screen === 'char_select') {
            setScreen('menu');
          } else if (screen === 'results') {
            setScreen('menu');
          } else {
            console.log('Android Back Button pressed in Menu/Splash. Ignored to avoid closure.');
          }
        });
      } catch (err) {
        console.warn('Capacitor App backButton listener not supported on this platform:', err);
      }
    };

    setupListener();

    return () => {
      if (backListener) {
        backListener.remove();
      }
    };
  }, [screen]);

  // Sync state changes to storage
  const saveProgress = (newGold: number, newUpgrades: PermanentShopUpgrades, newAchievements: Achievement[]) => {
    setGold(newGold);
    setUpgrades(newUpgrades);
    setAchievements(newAchievements);
    
    try {
      localStorage.setItem('correprof_gold_v2', newGold.toString());
      localStorage.setItem('correprof_upgrades_v2', JSON.stringify(newUpgrades));
      localStorage.setItem('correprof_achievements_v3', JSON.stringify(newAchievements));
    } catch (e) {
      console.error(e);
    }
  };

  const handleStartGame = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setScreen('playing');
  };

  const handleUpgradeBuy = (type: keyof PermanentShopUpgrades) => {
    const currentLvl = upgrades[type];
    const cost = 100 * Math.pow(2.5, currentLvl); // matched or custom arrays costs
    const UPGRADE_COSTS = [100, 250, 600, 1500, 4000];
    const realCost = UPGRADE_COSTS[currentLvl] || 99999;

    if (gold >= realCost) {
      const nextUpgrades = {
        ...upgrades,
        [type]: currentLvl + 1
      };
      const remainder = gold - realCost;
      
      // Re-evaluate 'Acordo do Giz' achievement checklist (Check accrued coins spent also)
      const nextAchievements = checkAchievements(remainder, nextUpgrades, achievements);
      saveProgress(remainder, nextUpgrades, nextAchievements);
    }
  };

  const handleToggleSound = () => {
    const nextVal = !soundEnabled;
    setSoundEnabled(nextVal);
    audio.toggleSound(nextVal);
    localStorage.setItem('correprof_sound_enabled', nextVal ? 'true' : 'false');
  };

  const handleResetProgress = () => {
    localStorage.removeItem('correprof_gold_v2');
    localStorage.removeItem('correprof_upgrades_v2');
    localStorage.removeItem('correprof_achievements_v3');
    localStorage.removeItem('correprof_completed_scenarios_v2');
    setGold(0);
    setUpgrades(INITIAL_UPGRADES);
    setAchievements(INITIAL_ACHIEVEMENTS);
    setCompletedScenarios([]);
    audio.playGameOver();
  };

  // Resolve achievements criteria based on historical progress
  const checkAchievements = (
    currentG: number, 
    upgs: PermanentShopUpgrades, 
    achList: Achievement[], 
    latestDefeatedCount: number = 0,
    latestSurvivedTime: number = 0,
    latestWin: boolean = false,
    finalLevel: number = 1,
    scenarioType?: ScenarioType,
    finalHpPercent: number = 100
  ): Achievement[] => {
    
    // Sum spent money as assets
    const UPGRADE_COSTS = [100, 250, 600, 1500, 4000];
    let spent = 0;
    spent += UPGRADE_COSTS.slice(0, upgs.maxHpLevel).reduce((a,b)=>a+b, 0);
    spent += UPGRADE_COSTS.slice(0, upgs.speedLevel).reduce((a,b)=>a+b, 0);
    spent += UPGRADE_COSTS.slice(0, upgs.damageLevel).reduce((a,b)=>a+b, 0);
    spent += UPGRADE_COSTS.slice(0, upgs.xpLevel).reduce((a,b)=>a+b, 0);
    spent += UPGRADE_COSTS.slice(0, upgs.luckLevel).reduce((a,b)=>a+b, 0);
    const totalG = currentG + spent;

    let rewardAccumulator = 0;

    const updated = achList.map((ach) => {
      if (ach.unlocked) return ach;

      let currentVal = ach.currentValue;
      let unlocked = false;

      switch (ach.id) {
        case 'defeat_50':
          currentVal = currentVal + latestDefeatedCount;
          if (currentVal >= ach.targetValue) unlocked = true;
          break;
        case 'defeat_150':
          currentVal = currentVal + latestDefeatedCount;
          if (currentVal >= ach.targetValue) unlocked = true;
          break;
        case 'defeat_505':
          currentVal = currentVal + latestDefeatedCount;
          if (currentVal >= ach.targetValue) unlocked = true;
          break;
        case 'defeat_class_council':
          if (latestWin && scenarioType === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
            currentVal = 1;
            unlocked = true;
          }
          break;
        case 'defeat_sabado':
          // Sábado letivo boss defeated (survived 2+ minutes, or won in Corredor/Patio)
          if (latestWin && (scenarioType === ScenarioType.CORREDOR_ESCOLAR || latestSurvivedTime >= 120)) {
            currentVal = 1;
            unlocked = true;
          }
          break;
        case 'level_10':
          currentVal = Math.max(currentVal, finalLevel);
          if (currentVal >= ach.targetValue) unlocked = true;
          break;
        case 'survive_240':
          currentVal = Math.max(currentVal, latestSurvivedTime);
          if (currentVal >= ach.targetValue) unlocked = true;
          break;
        case 'earn_3000_gold':
          currentVal = Math.max(currentVal, totalG);
          if (currentVal >= ach.targetValue) unlocked = true;
          break;
        case 'survive_victory':
          if (latestWin) {
            currentVal = 1;
            unlocked = true;
          }
          break;
        case 'survive_10_percent':
          if (latestSurvivedTime >= 65 && finalHpPercent <= 10) {
            currentVal = 1;
            unlocked = true;
          }
          break;
      }

      if (unlocked) {
        rewardAccumulator += ach.rewardCoins;
      }

      return {
        ...ach,
        currentValue: currentVal,
        unlocked: unlocked || ach.unlocked
      };
    });

    if (rewardAccumulator > 0) {
      // Apply reward cash
      setTimeout(() => {
        setGold(prev => {
          const added = prev + rewardAccumulator;
          localStorage.setItem('correprof_gold_v2', added.toString());
          return added;
        });
      }, 500);
    }

    return updated;
  };

  const handleGameFinished = (gameResults: {
    victory: boolean;
    goldGained: number;
    defeatedCount: number;
    survivedTime: number;
    finalLevel: number;
    scenarioType: ScenarioType;
    finalHpPercent: number;
  }) => {
    setResults(gameResults);
    setScreen('results');

    // Persist gained rewards directly
    const remainder = gold + gameResults.goldGained;
    const nextAchievements = checkAchievements(
      remainder, 
      upgrades, 
      achievements, 
      gameResults.defeatedCount, 
      gameResults.survivedTime,
      gameResults.victory,
      gameResults.finalLevel,
      gameResults.scenarioType,
      gameResults.finalHpPercent
    );

    if (gameResults.victory) {
      setCompletedScenarios(prev => {
        if (!prev.includes(gameResults.scenarioType)) {
          const next = [...prev, gameResults.scenarioType];
          localStorage.setItem('correprof_completed_scenarios_v2', JSON.stringify(next));
          return next;
        }
        return prev;
      });
    }

    saveProgress(remainder, upgrades, nextAchievements);
  };

  return (
    <div id="full-screen-wrapper" className="w-screen h-screen h-[100dvh] bg-slate-950 flex justify-center items-center p-0 sm:p-4 antialiased overflow-hidden">
      <div className="w-full max-w-md h-full sm:h-[92vh] sm:max-h-[820px] bg-slate-900 border-0 sm:brutalist-border shadow-none sm:brutalist-shadow-super flex flex-col justify-start relative overflow-hidden rounded-none sm:rounded-2xl">
        
        {/* VIEW 0: SPLASH SCREEN */}
        {screen === 'splash' && (
          <SplashScreen onDismiss={() => setScreen('menu')} />
        )}

        {/* VIEW 1: START SCREEN MENU */}
        {screen === 'menu' && (
          <StartScreen
            gold={gold}
            upgrades={upgrades}
            achievements={achievements}
            soundEnabled={soundEnabled}
            onStartGame={handleStartGame}
            onUpgradeBuy={handleUpgradeBuy}
            onResetProgress={handleResetProgress}
            onToggleSound={handleToggleSound}
            selectedCharacterId={selectedCharacterId}
            onSelectCharacter={setSelectedCharacterId}
            completedScenarios={completedScenarios}
            onNavigateToCharSelect={() => setScreen('char_select')}
          />
        )}

        {/* VIEW 1.5: CHARACTER SELECTION SCREEN */}
        {screen === 'char_select' && (
          <CharacterSelectScreen
            completedScenarios={completedScenarios}
            selectedCharacterId={selectedCharacterId}
            onSelectCharacter={setSelectedCharacterId}
            onBack={() => setScreen('menu')}
            onStartGame={() => setScreen('playing')}
          />
        )}

        {/* VIEW 2: ACTIVE GAMEPLAY ENGINE MAP */}
        {screen === 'playing' && selectedScenario && (
          <ActiveGame
            scenario={selectedScenario}
            permanentUpgrades={upgrades}
            soundEnabled={soundEnabled}
            onGameEnd={handleGameFinished}
            onToggleSound={handleToggleSound}
            selectedCharacterId={selectedCharacterId}
          />
        )}

        {/* VIEW 3: GAME RESULTS OVERVIEW (VICTORY / DEFEAT PANELS) */}
        {screen === 'results' && results && (
          <div 
            id="results-view" 
            className="absolute inset-0 bg-[#E5E7EB] flex flex-col justify-start pt-10 sm:pt-16 pb-6 px-4 sm:px-6 select-none animate-fade-in bg-parchment-grid text-black overflow-y-auto"
          >
            {/* Header Result status */}
            <header className="text-center py-4 sm:py-6 relative z-10 flex flex-col items-center shrink-0">
              {results.victory ? (
                <>
                  <div className="inline-flex items-center gap-1 bg-yellow-400 text-black text-xs font-black px-4 py-1.5 brutalist-border rounded-none uppercase tracking-wider mb-2 transform -rotate-1 shadow-[4px_4px_0px_#000]">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={3} /> SINAL CONCLUÍDO! <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-black tracking-tight font-sans uppercase">
                    VITÓRIA! 🏆
                  </h2>
                  <p className="text-xs text-gray-700 mt-1 max-w-xs leading-relaxed font-bold font-mono italic">
                    "Gritos de férias! Você sobreviveu à papelada burocrática, ao conselho de classe e os diários estão arquivados!"
                  </p>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-black px-4 py-1.5 brutalist-border rounded-none uppercase tracking-wider mb-2 transform rotate-1 shadow-[4px_4px_0px_#000]">
                    <AlertTriangle className="w-3.5 h-3.5 text-white" /> RECUPERAÇÃO INEVITÁVEL!
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-red-600 tracking-tight font-sans uppercase">
                    A CANETA ESTOUROU! 😭
                  </h2>
                  <p className="text-xs text-gray-700 mt-1 max-w-xs leading-relaxed font-bold font-mono italic">
                    "O sistema travou! Alunos de recuperação pedindo ponto extra devoraram sua paciência. Hora de recarregar a cafeína!"
                  </p>
                </>
              )}
            </header>

            {/* Middle Stats Recap - Moved further up and wrapped in max-w-md */}
            <main className="w-full max-w-md mx-auto my-1 sm:my-2 -mt-[6px] bg-[#FDFCF0] brutalist-border brutalist-shadow-yellow p-4 flex flex-col gap-3 relative z-10 shrink-0">
              <h3 className="text-xs font-black text-black uppercase tracking-widest text-center border-b-2 border-black pb-2">
                BALANÇO GERAL DE EXPEDIENTE
              </h3>

              <div className="flex flex-col gap-2.5 font-mono text-sm text-black">
                <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 py-1.5 px-1">
                  <span className="text-gray-800 font-sans text-xs font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-sky-600" /> Tempo Sobrevivido (Foco)
                  </span>
                  <span className="font-extrabold text-black">
                    {Math.floor(results.survivedTime / 60)}min {results.survivedTime % 60}s
                  </span>
                </div>

                <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 py-1.5 px-1">
                  <span className="text-gray-800 font-sans text-xs font-bold flex items-center gap-1.5">
                    🎓 Alunos Vistos
                  </span>
                  <span className="font-extrabold text-black">
                    {results.defeatedCount} Alunos
                  </span>
                </div>

                <div className="flex items-center justify-between border-b-2 border-dashed border-gray-300 py-1.5 px-1">
                  <span className="text-gray-800 font-sans text-xs font-bold flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-yellow-600" /> Verba Adicional do FUNDEB
                  </span>
                  <span className="font-extrabold text-yellow-600 flex items-center gap-1">
                    +{results.goldGained} FUNDEB
                  </span>
                </div>

                {results.victory && (
                  <div className="flex items-center justify-between bg-emerald-100 border-2 border-emerald-500 rounded-none p-2 mt-1">
                    <span className="text-emerald-800 font-sans text-xs font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Bônus de Fechamento de Diário
                    </span>
                    <span className="font-black font-mono text-emerald-700">
                      +300 FUNDEB
                    </span>
                  </div>
                )}
              </div>

              {/* Total Balance block */}
              <div className="p-3 bg-yellow-100 border-2 border-black rounded-none flex items-center justify-between mt-3 shadow-[2px_2px_0px_#000]">
                <span className="text-xs text-black font-black uppercase tracking-tight font-sans">Verba do FUNDEB Acumulada:</span>
                <span className="text-black font-black font-mono flex items-center gap-1 text-base">
                  <Coins className="w-4.5 h-4.5 text-yellow-600" /> {gold}
                </span>
              </div>
            </main>

            {/* Back to main controls button - Closer to the board under max-w-md */}
            <footer className="w-full max-w-md mx-auto mt-auto mb-2 relative z-10 shrink-0">
              <button
                id="results-return-menu"
                onClick={() => {
                  audio.playLevelUp();
                  setScreen('menu');
                }}
                className="w-full py-4 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black uppercase tracking-wider brutalist-border brutalist-shadow-btn transition flex items-center justify-center gap-2 pointer-events-auto font-sans text-sm"
              >
                <span>SALA DOS PROFESSORES</span>
                <ChevronRight className="w-4 h-4" strokeWidth={3} />
              </button>
            </footer>
          </div>
        )}

      </div>
    </div>
  );
}
