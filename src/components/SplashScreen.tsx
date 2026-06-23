import React, { useEffect, useState } from 'react';
import { Coffee, Sparkles, BookOpen } from 'lucide-react';
import { audio } from '../utils/audio';

interface SplashScreenProps {
  onDismiss: () => void;
}

export default function SplashScreen({ onDismiss }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [fadedOut, setFadedOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const loadingDuration = 6000; // 6 seconds for the bar to fill
    const totalDuration = 15000;   // 15 seconds auto dismiss time limit

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      // Calculate progress percentage up to 100 in 6 seconds
      const nextProgress = Math.min(100, (elapsed / loadingDuration) * 100);
      setProgress(nextProgress);

      if (elapsed >= loadingDuration) {
        setIsReady(true);
      }

      // Auto dismiss after 15 seconds
      if (elapsed >= totalDuration) {
        clearInterval(timer);
        triggerDismiss();
      }
    }, 50);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const triggerDismiss = () => {
    setFadedOut(true);
    try {
      audio.playLevelUp();
    } catch (e) {
      // Audio fallback if not allowed yet
    }
    setTimeout(() => {
      onDismiss();
    }, 450);
  };

  const handleTouchScreen = () => {
    if (isReady) {
      // Request standard browser fullscreen to hide navigation and status bar
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
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
      triggerDismiss();
    }
  };

  return (
    <div
      onClick={handleTouchScreen}
      className={`absolute inset-0 bg-[#E5E7EB] bg-parchment-grid flex flex-col justify-center items-center p-6 z-50 select-none transition-all duration-500 ease-in-out ${
        isReady ? 'cursor-pointer' : 'cursor-wait'
      } ${
        fadedOut ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="w-full max-w-lg bg-[#FDFCF0] brutalist-border brutalist-shadow-heavy p-6 md:p-8 flex flex-col items-center gap-6 relative select-none">
        
        {/* Playful top pins/badges */}
        <div className="absolute -top-5 left-6 bg-red-500 text-white text-[10px] font-black px-3 py-1 border-2 border-black rotate-[-2deg] uppercase shadow-[2.5px_2.5px_0px_#000]">
          Dedicação Máxima 📚
        </div>
        <div className="absolute -top-5 right-6 bg-amber-400 text-black text-[10px] font-black px-3 py-1 border-2 border-black rotate-[3deg] uppercase shadow-[2.5px_2.5px_0px_#000] flex items-center gap-1">
          <Coffee className="w-3 h-3 text-black fill-amber-900" /> +100% Cafeína
        </div>

        {/* Decorative Illustrative Accents */}
        <div className="flex items-center gap-4 mt-2">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full border border-black shadow-[1px_1px_0px_#000]" />
          <div className="w-14 h-14 bg-yellow-100 rounded-none border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] rotate-[-4deg]">
            <Coffee className="w-7 h-7 text-amber-950 animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
          <div className="w-14 h-14 bg-sky-100 rounded-none border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_#000] rotate-[5deg]">
            <BookOpen className="w-7 h-7 text-sky-800 animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.3s' }} />
          </div>
          <span className="w-2.5 h-2.5 bg-yellow-400 rounded-full border border-black shadow-[1px_1px_0px_#000]" />
        </div>

        {/* Main core warning quote block */}
        <div className="w-full text-center py-4 px-2 md:px-4">
          <p className="text-sm md:text-base font-black text-black leading-relaxed font-sans uppercase tracking-tight">
            "Este é um jogo humorístico homenageando os abnegados professores brasileiros, feito com muito carinho e altas doses de cafeína."
          </p>
        </div>

        {/* Author Signature */}
        <div className="flex flex-col items-center gap-1 border-t-2 border-black border-dashed pt-4 w-full">
          <div className="flex items-center bg-yellow-100 px-4 py-1.5 border-2 border-black rounded-none shadow-[2px_2px_0px_#000] rotate-[1deg]">
            <span className="text-xs md:text-sm font-black text-black font-sans uppercase tracking-wider">
              Prof. Neivson
            </span>
          </div>
        </div>

        {/* Bottom Interactive Trigger Area */}
        <div className="flex flex-col items-center gap-2 w-full mt-4">
          <div className={`flex items-center gap-1.5 text-xs font-black px-4 py-2 uppercase tracking-wider transition-all duration-300 ${
            isReady 
              ? 'animate-pulse text-white bg-blue-600 border-2 border-black shadow-[2.5px_2.5px_0px_#000]' 
              : 'text-gray-400 bg-gray-100 border-2 border-gray-300 cursor-not-allowed'
          }`}>
            <Sparkles className={`w-3.5 h-3.5 ${isReady ? 'text-amber-300' : 'text-gray-400'}`} />
            <span>{isReady ? 'Toque para continuar' : 'Carregando plano...'}</span>
          </div>

          {/* Time Countdown Progress Bar */}
          <div className="w-full h-2.5 bg-[#E5E7EB] border-2 border-black rounded-none overflow-hidden relative mt-3 shadow-[1.5px_1.5px_0px_#000]">
            <div
              className="h-full bg-amber-500 transition-all duration-75 border-r-2 border-black"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[9px] font-mono text-gray-500 w-full mt-1 uppercase">
            <span>{isReady ? 'Diário pronto para assinatura!' : 'Preenchendo diário letivo...'}</span>
            <span className="font-bold">{isReady ? 'PRONTO!' : `${Math.round(progress)}%`}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
