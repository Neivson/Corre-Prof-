/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  ArrowUp, 
  Award,
  BookOpen, 
  Coffee, 
  Palette, 
  Zap, 
  TrendingUp, 
  ShieldAlert, 
  Pocket, 
  Cpu 
} from 'lucide-react';
import { WeaponType, Weapon } from '../types';

interface UpgradeOption {
  id: string; // can be WeaponType or a stat keyword e.g. 'STAT_DAMAGE'
  type: 'WEAPON' | 'STAT';
  title: string;
  description: string;
  subTitle: string;
  icon: React.ReactNode;
  color: string;
}

interface UpgradeSelectionProps {
  options: UpgradeOption[];
  onSelect: (option: UpgradeOption) => void;
}

export default function UpgradeSelection({ options, onSelect }: UpgradeSelectionProps) {
  return (
    <div 
      id="level-up-overlay" 
      className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center p-4 z-50 select-none animate-fade-in"
    >
      <div className="w-full max-w-sm bg-[#FDFCF0] border-4 border-black p-4 sm:p-5 shadow-[8px_8px_0px_#000] flex flex-col items-center text-black relative">
        <div className="text-center w-full mb-4 flex flex-col items-center">
          <div className="inline-flex items-center gap-1.5 bg-yellow-400 text-black text-xl sm:text-2xl font-black px-5 py-2 brutalist-border rounded-none uppercase tracking-widest mb-3 transform -rotate-1 shadow-[4px_4px_0px_#000]">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black animate-pulse" strokeWidth={3} /> LEVEL UP! <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-black animate-pulse" strokeWidth={3} />
          </div>
          <p className="text-[11px] sm:text-xs text-gray-800 font-bold font-mono leading-tight px-1 text-center">
            Evolução curricular detectada! Escolha uma emenda pedagógica para integrar à sua aula:
          </p>
        </div>

        {/* Grid containing exactly 3 random options */}
        <div className="w-full flex flex-col gap-3">
          {options.map((opt, index) => {
            return (
              <button
                key={`${opt.id}-${index}`}
                id={`lvl-up-option-${index}`}
                onClick={() => onSelect(opt)}
                className="w-full text-left p-3 rounded-none bg-white border-3 border-black hover:bg-yellow-50/55 transition cursor-pointer flex items-center gap-2.5 shadow-[3px_3px_0px_#000] hover:shadow-[4.5px_4.5px_0px_#000] active:translate-x-[1.5px] active:translate-y-[1.5px] active:shadow-[1.5px_1.5px_0px_#000] pointer-events-auto"
              >
                {/* Colored icon slot */}
                <div 
                  className="p-2.5 rounded-none shrink-0 flex items-center justify-center border-2 border-black shadow-[1.5px_1.5px_0px_#000]"
                  style={{ 
                    backgroundColor: `${opt.color}20`, 
                    borderColor: '#000000', 
                    color: '#000000' 
                  }}
                >
                  {opt.icon}
                </div>

                {/* Card Meta details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] sm:text-[9px] uppercase font-black tracking-tight" style={{ color: opt.color }}>
                      {opt.subTitle}
                    </span>
                    <span className="bg-black text-white text-[7.5px] font-mono font-black px-1.5 py-0.5 rounded-none uppercase">
                      {opt.type === 'WEAPON' ? 'Equipamento' : 'Atributo'}
                    </span>
                  </div>
                  
                  <h3 className="font-black text-xs sm:text-sm text-black uppercase mt-0.5">
                    {opt.title}
                  </h3>
                  
                  <p className="text-[10.5px] sm:text-xs text-gray-700 mt-0.5 leading-tight font-medium">
                    {opt.description}
                  </p>
                </div>

                {/* Action indicator arrow */}
                <div className="text-black shrink-0">
                  <ArrowUp className="w-3.5 h-3.5" strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-[9px] text-gray-600 font-black uppercase italic mt-4 text-center">
          "O aprendizado não para... e o cansaço também decola!"
        </p>
      </div>
    </div>
  );
}

// Global factory to get complete details for stat upgrades or weapon boosts
export function getUpgradeOptionList(
  currentWeapons: Record<WeaponType, Weapon>
): UpgradeOption[] {
  const options: UpgradeOption[] = [];

  // 1. Fill weapon upgrade options
  (Object.keys(currentWeapons) as WeaponType[]).forEach((type) => {
    const w = currentWeapons[type];
    const isLocked = w.level === 0;
    const isMax = w.level >= w.maxLevel;

    if (!isMax) {
      let icon: React.ReactNode;
      let color = '#ef4444';
      let title = w.name;
      let subTitle = isLocked ? 'ADQUIRIR NOVA' : `MELHORAR PARA LVL ${w.level + 1}`;

      switch (type) {
        case WeaponType.CANETA_VERMELHA:
          icon = <BookOpen className="w-5 h-5" />;
          color = '#ef4444'; // Red
          break;
        case WeaponType.DIARIO_DE_CLASSE:
          icon = <Award className="w-5 h-5" />;
          color = '#3b82f6'; // Blue
          break;
        case WeaponType.APOSTILA:
          icon = <Pocket className="w-5 h-5" />;
          color = '#ec4899'; // Pink
          break;
        case WeaponType.DATASHOW:
          icon = <Zap className="w-5 h-5" />;
          color = '#eab308'; // Yellow
          break;
        case WeaponType.NOTEBOOK:
          icon = <Palette className="w-5 h-5" />;
          color = '#a855f7'; // Purple
          break;
        case WeaponType.CAFE:
          icon = <Coffee className="w-5 h-5" />;
          color = '#f97316'; // Orange
          break;
        case WeaponType.INTELEGENCIA_ARTIFICIAL:
          icon = <Cpu className="w-5 h-5" />;
          color = '#10b981'; // Green
          break;
      }

      options.push({
        id: type,
        type: 'WEAPON',
        title,
        description: getWeaponUpgradeDetails(type, w.level),
        subTitle,
        icon,
        color
      });
    }
  });

  // 2. Add attribute/stat upgrades
  options.push({
    id: 'STAT_DAMAGE',
    type: 'STAT',
    title: 'Visto Enfático (+15% Dano)',
    description: 'Aumenta permanentemente o dano de todas as suas canetas, apostilas e datashows nesta rodada.',
    subTitle: 'DIDÁTICA REFORÇADA',
    icon: <TrendingUp className="w-5 h-5" />,
    color: '#fbbf24' // gold
  });

  options.push({
    id: 'STAT_SPEED',
    type: 'STAT',
    title: 'Tênis de Corrida (+10% Velocidade)',
    description: 'Adiciona agilidade extra para desviar de alunos de recuperação e burocracia pesada.',
    subTitle: 'EDUCAÇÃO FÍSICA',
    icon: <Zap className="w-5 h-5" />,
    color: '#06b6d4' // cyan
  });

  options.push({
    id: 'STAT_RELOAD',
    type: 'STAT',
    title: 'Cafeteira Turbo (-12% Tempo Recarga)',
    description: 'Diminui o intervalo entre todos os seus ataques pedagógicos e automotores.',
    subTitle: 'CORREÇÃO EM MASSA',
    icon: <Coffee className="w-5 h-5" />,
    color: '#f97316'
  });

  options.push({
    id: 'STAT_HP',
    type: 'STAT',
    title: 'Atestado Médico (+20% Recuperação e HP)',
    description: 'Cura seu professor em +30 de HP imediatamente e aumenta a vida máxima em +15%.',
    subTitle: 'SAÚDE DO PROFISSIONAL',
    icon: <ShieldAlert className="w-5 h-5" />,
    color: '#22c55e'
  });

  options.push({
    id: 'STAT_PROJECTILES',
    type: 'STAT',
    title: 'Xerox Autorizada (+1 Projétil)',
    description: 'Todas as armas que disparam projéteis ganham +1 bala por ciclo. Mais folhas impressas!',
    subTitle: 'RECURSO EXTRA',
    icon: <Sparkles className="w-5 h-5" />,
    color: '#fae8ff'
  });

  options.push({
    id: 'STAT_RANGE',
    type: 'STAT',
    title: 'Grito de Ordem (+15% Alcance)',
    description: 'Aumenta a área de atuação da caneta vermelha, datashow e diários de circulação.',
    subTitle: 'IMPOSIÇÃO PEDAGÓGICA',
    icon: <Sparkles className="w-5 h-5" />,
    color: '#ec4899'
  });

  return options;
}

function getWeaponUpgradeDetails(type: WeaponType, lvl: number): string {
  if (lvl === 0) {
    switch (type) {
      case WeaponType.CANETA_VERMELHA: return 'Lança gotas rápidas de tinta vermelha corretora em direção aos alunos.';
      case WeaponType.DIARIO_DE_CLASSE: return 'Um pesado diário de chamadas orbita ao redor como escudo e causa dano de choque.';
      case WeaponType.APOSTILA: return 'Arremessa uma apostila bumerangue que atravessa os inimigos acumulados e retorna.';
      case WeaponType.DATASHOW: return 'Atira regularmente feixes intensos de luz pedagógica que vaporizam burocracia.';
      case WeaponType.NOTEBOOK: return 'Lança e-mails oficiais de cobrança automáticos em múltiplos alunos distantes.';
      case WeaponType.CAFE: return 'Aumenta a velocidade de ataque global e te dá um leve bônus de velocidade de corrida.';
      case WeaponType.INTELEGENCIA_ARTIFICIAL: return 'Invoca um pequeno robô assistente IA flutuante que dispara códigos de lasers verdes.';
    }
  }

  switch (type) {
    case WeaponType.CANETA_VERMELHA:
      if (lvl === 1) return '+1 Caneta extra e +15% de velocidade de disparo.';
      if (lvl === 2) return '+15% de Dano de tinta e maior espessura de projétil.';
      if (lvl === 3) return '+1 Caneta extra (Total 3) e o projétil perfura 1 inimigo extra.';
      return 'NÍVELL SUPREMO: Dispara em espiral redonda ao seu redor! Correção coletiva!';
    
    case WeaponType.DIARIO_DE_CLASSE:
      if (lvl === 1) return '+1 Diário adicional orbitando e +10% de raio de órbita.';
      if (lvl === 2) return '+20% de Dano de impacto e velocidade de rotação ampliada.';
      if (lvl === 3) return '+1 Diário adicional (Total 3) bloqueando os contatos de alunos.';
      return 'NÍVEL SUPREMO: Órbita constante, grande impacto repelente e escudo robusto.';

    case WeaponType.APOSTILA:
      if (lvl === 1) return 'A apostila voa +25% mais longe e causa +20% de dano.';
      if (lvl === 2) return '+1 Apostila extra lançada em direção oposta.';
      if (lvl === 3) return 'A velocidade da apostila aumenta e o tamanho do bumerangue dobra.';
      return 'NÍVEL SUPREMO: Cria um rastro de folhas soltas que causam dano contínuo.';

    case WeaponType.DATASHOW:
      if (lvl === 1) return 'Reduz recarga em -15% e aumenta tamanho do feixe frontal.';
      if (lvl === 2) return 'O feixe agora atira em 2 direções opostas (frente e trás).';
      if (lvl === 3) return '+25% de Dano de queimadura ultravioleta.';
      return 'NÍVEL SUPREMO: Dispara feixe orbital giratório, varrendo 360 graus do cenário.';

    case WeaponType.NOTEBOOK:
      if (lvl === 1) return 'Ataca +1 alvo adicional simultâneo (Total 2) com e-mails.';
      if (lvl === 2) return '+20% Dano de faísca elétrica e curto circuitos de pauta.';
      if (lvl === 3) return 'Dispara e-mails lentos mas com grande explosão sônica.';
      return 'NÍVEL SUPREMO: Disparos globais de alertas em toda a tela continuamente.';

    case WeaponType.CAFE:
      if (lvl === 1) return '+12% Velocidade de ataque global e +5% velocidade de corrida.';
      if (lvl === 2) return '+15% Velocidade de ataque global.';
      if (lvl === 3) return '+10% Velocidade de corrida e imunidade rápida a lentidões.';
      return 'NÍVEL SUPREMO: Duplo café! Fritando com hyper-foco e regeneração rápida de HP.';

    case WeaponType.INTELEGENCIA_ARTIFICIAL:
      if (lvl === 1) return 'O robô assistente atira lasers verdes +25% mais rápido.';
      if (lvl === 2) return 'Invoca um SEGUNDO robô assistente independente para patrulhar.';
      if (lvl === 3) return 'Os lasers passam a causar explosões de código de 0.5s de atordoamento.';
      return 'NÍVEL SUPREMO: Os robôs disparam super lasers de busca automática contínuos.';
  }
  return 'Aumento geral de performance pedagógica.';
}
