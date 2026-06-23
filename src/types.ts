/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// We use named standard enums as requested per instructions
export enum WeaponType {
  CANETA_VERMELHA = 'CANETA_VERMELHA',
  DIARIO_DE_CLASSE = 'DIARIO_DE_CLASSE',
  APOSTILA = 'APOSTILA',
  DATASHOW = 'DATASHOW',
  NOTEBOOK = 'NOTEBOOK',
  CAFE = 'CAFE',
  INTELEGENCIA_ARTIFICIAL = 'INTELEGENCIA_ARTIFICIAL'
}

export enum EnemyType {
  ALUNO_DISTRAIDO = 'ALUNO_DISTRAIDO',
  ALUNO_VAI_VALER_NOTA = 'ALUNO_VAI_VALER_NOTA',
  ALUNO_E_PRA_COPIAR = 'ALUNO_E_PRA_COPIAR',
  ALUNO_DO_FUNDAO = 'ALUNO_DO_FUNDAO',
  FORMULARIO_INFINITO = 'FORMULARIO_INFINITO',
  DIARIO_ATRASADO = 'DIARIO_ATRASADO',
  CONVOCACAO_REUNIAO = 'CONVOCACAO_REUNIAO',
  ARTICULADORA_PEDAGOGICA = 'ARTICULADORA_PEDAGOGICA',
  COORDENADOR_ESCOLAR = 'COORDENADOR_ESCOLAR',
  MINION_TAREFA_EXTRA = 'MINION_TAREFA_EXTRA', // Summoned by Articuladora
  // Bosses
  CHEF_CONSELHO_DEC_LASSE = 'CHEF_CONSELHO_DEC_LASSE',
  CHEF_SABADO_LETIVO = 'CHEF_SABADO_LETIVO',
  CHEF_SEMANA_PEDAGOGICA = 'CHEF_SEMANA_PEDAGOGICA',
  CHEF_FECHAMENTO_UNIDADE = 'CHEF_FECHAMENTO_UNIDADE'
}

export enum ScenarioType {
  SALA_DE_AULA = 'SALA_DE_AULA',
  CORREDOR_ESCOLAR = 'CORREDOR_ESCOLAR',
  PATIO = 'PATIO',
  CONSELHO_DE_CLASSE_STAGE = 'CONSELHO_DE_CLASSE_STAGE',
  SEMANA_PEDAGOGICA_STAGE = 'SEMANA_PEDAGOGICA_STAGE',
  SALA_FECHADA = 'SALA_FECHADA',
  CORREDOR_INFINITO = 'CORREDOR_INFINITO'
}

export interface Scenario {
  type: ScenarioType;
  name: string;
  description: string;
  difficultyMultiplier: number;
  unlockedAtGold: number;
  floorColor: string;
  gridColor: string;
  accentColor: string;
}

export interface Weapon {
  type: WeaponType;
  name: string;
  level: number; // 0 means locked, 1-5 active
  maxLevel: number;
  damage: number;
  cooldown: number; // in game ticks or ms
  currentCooldownTimer: number;
  range: number;
  speed: number;
  description: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  speed: number;
  level: number;
  xp: number;
  xpNeeded: number;
  goldCurrent: number;
  goldTotal: number;
  defeatedCount: number;
  timeSurvived: number; // in seconds
  weapons: Record<WeaponType, Weapon>;
  activeCount: number;
}

export interface Enemy {
  id: string;
  type: EnemyType;
  name: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  xpValue: number;
  size: number;
  color: string;
  quoteCooldown: number;
  isElite: boolean;
  isBoss: boolean;
  summonTimer?: number;
  debuffTimer?: number; // Used for Coordenador's warnings
  angle?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  damage: number;
  size: number;
  type: WeaponType;
  color: string;
  life: number; // steps remaining
  maxLife: number;
  px?: number; // previous trace
  py?: number;
  angle?: number;
  orbitAngle?: number; // for Diario
  returning?: boolean; // for bumerangue
  targetEnemyId?: string; // for AI assistant chasing
  splashRadius?: number;
  wordText?: string;
  isEnemyBullet?: boolean;
  range?: number;
  isPaperBall?: boolean;
}

export enum PowerUpType {
  XP = 'XP',
  COIN = 'COIN',
  CAFE_PICKUP = 'CAFE_PICKUP',
  MEDKIT = 'MEDKIT',
  RELOAD_BOOST = 'RELOAD_BOOST',
  CHEST = 'CHEST',
  MAGNET = 'MAGNET'
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  value: number;
  size: number;
  color: string;
  attracted?: boolean;
}

export interface TextParticle {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
  fontSize: number;
}

export interface PermanentShopUpgrades {
  maxHpLevel: number; // 0 to 5, each +20% HP
  speedLevel: number; // 0 to 5, each +10% Speed
  damageLevel: number; // 0 to 5, each +15% Damage
  xpLevel: number; // 0 to 5, each +15% XP gain
  luckLevel: number; // 0 to 5, each +10% Coin / item drops
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  unlocked: boolean;
  rewardCoins: number;
}

export interface BossWarningAOE {
  id: string;
  x: number;
  y: number;
  radius: number;
  timer: number; // counting down to zero
  maxTimer: number;
  color: string;
  damage: number;
}

export interface AISummon {
  id: string;
  x: number;
  y: number;
  angle: number;
  shootTimer: number;
  duration: number; // lifetime remaining in ticks
}

// Global configurations and stat values
export const SCENARIOS: Scenario[] = [
  {
    type: ScenarioType.SEMANA_PEDAGOGICA_STAGE,
    name: 'Semana Pedagógica',
    description: 'A primeira fase! O temido reencontro anual de palestras sem fim e dinâmica de grupo.',
    difficultyMultiplier: 1.0,
    unlockedAtGold: 0,
    floorColor: '#fafaf9',
    gridColor: '#e7e5e4',
    accentColor: '#f59e0b'
  },
  {
    type: ScenarioType.SALA_DE_AULA,
    name: 'Sala de Aula',
    description: 'Fase intermediária. Piso de madeira riscado de giz, carteiras escolares e muita correria.',
    difficultyMultiplier: 1.25,
    unlockedAtGold: 150,
    floorColor: '#fbebdb', // light warm sepia wood style
    gridColor: '#e3d2be',
    accentColor: '#3b82f6'
  },
  {
    type: ScenarioType.SALA_FECHADA,
    name: 'Sala de Aula (Compacta)',
    description: 'Um quadrado perfeito do tamanho exato da tela. Sem espaço para fugir!',
    difficultyMultiplier: 1.45,
    unlockedAtGold: 300,
    floorColor: '#faf0e6',
    gridColor: '#ebd5cb',
    accentColor: '#38bdf8'
  },
  {
    type: ScenarioType.CORREDOR_ESCOLAR,
    name: 'Corredor Escolar',
    description: 'Fase avançada. Armários de metal batendo, poças d’água no bebedouro e correria sem fim.',
    difficultyMultiplier: 1.65,
    unlockedAtGold: 500,
    floorColor: '#e0ece4', // greenish institutional linoleum
    gridColor: '#cbdcd0',
    accentColor: '#10b981'
  },
  {
    type: ScenarioType.CORREDOR_INFINITO,
    name: 'Corredor Infinito',
    description: 'Largura exata da tela e tamanho vertical gigante em loop. Corra nos corredores!',
    difficultyMultiplier: 1.85,
    unlockedAtGold: 800,
    floorColor: '#eff6ff',
    gridColor: '#dbeafe',
    accentColor: '#a855f7'
  },
  {
    type: ScenarioType.CONSELHO_DE_CLASSE_STAGE,
    name: 'Conselho de Classe',
    description: 'Tensão absoluta. Pilhas de relatórios e barreiras de canetas vermelhas por toda parte.',
    difficultyMultiplier: 2.15,
    unlockedAtGold: 1200,
    floorColor: '#f8fafc',
    gridColor: '#e2e8f0',
    accentColor: '#6366f1'
  },
  {
    type: ScenarioType.PATIO,
    name: 'Pátio Escolar',
    description: 'Dificuldade Extrema! O sinal do recreio tocou e a multidão de alunos está totalmente descontrolada no grande pátio.',
    difficultyMultiplier: 2.5,
    unlockedAtGold: 2000,
    floorColor: '#f1f5f9', // slate paving stones
    gridColor: '#cbd5e1',
    accentColor: '#ec4899'
  }
];

export const UPGRADE_COSTS = [100, 250, 600, 1500, 4000]; // levels 1 to 5 cost
export const MAX_UPGRADE_LEVEL = 5;

export const FUNNY_TIPS = [
  "Dica: Carregar um copo de café deixa o Prof mais veloz, mas cuidado para não derramar!",
  "Dica: Caneta Vermelha de nível 5 dispara em todas as direções. Correção em lote!",
  "Dica: O Coordenador Escolar aplica o 'Efeito Aviso', reduzindo sua velocidade. Fique longe dele!",
  "Dica: Use seus diários de classe como um escudo giratório contra Alunos Distraídos.",
  "Dica: Os inimigos de Sábado Letivo atacam em áreas vermelhas demarcadas. Fique fora delas!",
  "Dica: Subir o atributo de Sorte na loja aumenta a chance de encontrar Medkits e Café no cenário.",
  "Professores canônicos dizem: 'Na volta a gente compra... quer dizer, na volta a gente corrige!'",
  "Dica: A Inteligência Artificial invoca pequenos robôs auxiliares com canetas laser automáticas.",
  "Aviso: O Conselho de Classe invoca dezenas de formulários. Gire bem o seu bumerangue!",
  "Aluno diz: 'Professor, é pra copiar ou só pra prestar atenção?'"
];

// Helper quotes for cartoon enemies
export const ENEMY_QUOTES: Record<EnemyType, string[]> = {
  [EnemyType.ALUNO_DISTRAIDO]: [
    'Posso ir ao banheiro?',
    'Falta quanto pro recreio?',
    'Hã? Que página?',
    'Esqueci o caderno'
  ],
  [EnemyType.ALUNO_VAI_VALER_NOTA]: [
    'Vai valer nota?',
    'Tem ponto de participação?',
    'Vale quanto?',
    'Professor, arredonda?'
  ],
  [EnemyType.ALUNO_E_PRA_COPIAR]: [
    'É pra copiar?',
    'Passa caneta?',
    'De caneta azul?',
    'Apaga o quadro não!'
  ],
  [EnemyType.ALUNO_DO_FUNDAO]: [
    'Dá um pedaço do seu salgado?',
    'Vamo jogar dominó!',
    'Mó sono, professor...',
    'Ô prof, libera mais cedo aí!'
  ],
  [EnemyType.FORMULARIO_INFINITO]: [
    'Preencha o anexo III',
    'Falta sua rubrica',
    'Assine aqui',
    'Formulário Google pendente'
  ],
  [EnemyType.DIARIO_ATRASADO]: [
    'Digite as notas',
    'Falta registrar faltas',
    'Semestre fechando',
    'Prazo estourado!'
  ],
  [EnemyType.CONVOCACAO_REUNIAO]: [
    'Reunião extraordinária',
    'Link do Conectado',
    'Google Meet agora',
    'Pauta de última hora'
  ],
  [EnemyType.ARTICULADORA_PEDAGOGICA]: [
    'Cadê seu plano de aula?',
    'Sequência didática nova!',
    'Proposta inovadora curricular',
    'Alinhamento com a BNCC!'
  ],
  [EnemyType.COORDENADOR_ESCOLAR]: [
    'Passa na coordenação',
    'Reclamação de aluno',
    'Precisamos alinhar',
    'Cuidado com a pauta'
  ],
  [EnemyType.MINION_TAREFA_EXTRA]: [
    'Tarefa extra!',
    'Plano de ação!',
    'Burocracia rapidinha',
    'Relatório de 30 páginas'
  ],
  // Bosses quotes
  [EnemyType.CHEF_CONSELHO_DEC_LASSE]: [
    'CONSELHO CONVOCADO!',
    'Esse aluno está aprovado??',
    'Discussão de pré-conselho!',
    'Ata lavrada e datada!'
  ],
  [EnemyType.CHEF_SABADO_LETIVO]: [
    'Sábado letivo ativo!',
    'Sem descanso esta semana!',
    'Compensação de feriado!',
    'Reposição de greve de 2018!'
  ],
  [EnemyType.CHEF_SEMANA_PEDAGOGICA]: [
    'Dinâmica Quebra-Gelo!',
    'Slides corporativos de motivação!',
    'Gamificação da folha de ponto!',
    'Trabalho em equipe em círculos!'
  ],
  [EnemyType.CHEF_FECHAMENTO_UNIDADE]: [
    'FECHAMENTO DE SISTEMA!',
    'Notas finais lançadas!',
    'TUTORIAL DE RECUPERAÇÃO!',
    'Prazo final de envio é AGORA!'
  ]
};

export enum CharacterId {
  CLASSICO = 'CLASSICO',
  ARTES = 'ARTES',
  ED_FISICA = 'ED_FISICA',
  INGLES = 'INGLES',
}

export interface CharacterConfig {
  id: CharacterId;
  name: string;
  role: string;
  emoji: string;
  description: string;
  characteristic: string;
  specialAbilityName: string;
  specialAbilityDesc: string;
  baseMaxHp: number;
  baseSpeed: number;
  luckModifier: number;
  xpModifier: number;
  startingWeapon: WeaponType;
  accentColor: string;
  unlockCost: number; // in cumulative coins or spendable coins (let's use accumulated lifetime gold like scenarios to keep it fun and straightforward)
}

export const PLAYABLE_CHARACTERS: CharacterConfig[] = [
  {
    id: CharacterId.CLASSICO,
    name: 'Prof. de Miçangas',
    role: 'Filosofante de Miçanga & Pochete 🧘‍♂️',
    emoji: '🧘‍♂️',
    description: 'Equipado com t-shirt tie-dye, uma pochete salvadora, chá de camomila e infinita paciência para debates transcendentais no conselho.',
    characteristic: 'Status equilibrados. Excelente para se acostumar com a correria.',
    specialAbilityName: 'Café Termos Filosófico',
    specialAbilityDesc: 'Inicia com Caneta Vermelha Nível 1. Ganha +10% de redução de recarga nativa de todas as armas.',
    baseMaxHp: 100,
    baseSpeed: 2.7,
    luckModifier: 1.0,
    xpModifier: 1.0,
    startingWeapon: WeaponType.CANETA_VERMELHA,
    accentColor: '#3b82f6',
    unlockCost: 0
  },
  {
    id: CharacterId.ARTES,
    name: 'Mestre das Dicas',
    role: 'Showman do Cursinho & Cafeína ⚡',
    emoji: '⚡',
    description: 'Movido a 12 xícaras de café por hora, mestre do stand-up pedagógico. Usa piadas infames e dancinhas nos macetes para acordar vestibulandos.',
    characteristic: 'Inicia com mais vida (+10%) e tem o Diário de Classe protetor como arma inicial para repelir alunos desatentos.',
    specialAbilityName: 'Barreira do Microfone',
    specialAbilityDesc: 'A cada 15 segundos, cria um anel de jingles e macetes sonoros indestrutíveis ao seu redor por 5s que afasta alunos chateados.',
    baseMaxHp: 110,
    baseSpeed: 2.4,
    luckModifier: 1.15,
    xpModifier: 1.0,
    startingWeapon: WeaponType.DIARIO_DE_CLASSE,
    accentColor: '#ec4899',
    unlockCost: 150
  },
  {
    id: CharacterId.ED_FISICA,
    name: 'Mestre do Giz',
    role: 'Veterano da Velha Guarda 👴',
    emoji: '👴',
    description: 'Leciona na mesma sala desde 1994. Recusa-se a usar slides e confia apenas na força bruta do giz de cera, diário físico e lição ditada.',
    characteristic: 'Muito resistente e rápido (+20% velocidade), mas tem tamanho corporal maior, atraindo mais pautas no conselho.',
    specialAbilityName: 'Grito de "SILÊNCIO!"',
    specialAbilityDesc: 'A cada 10 segundos, solta um grito trovejante na sala! O choque afasta e atordoa todos os alunos desatentos por 2 segundos.',
    baseMaxHp: 120,
    baseSpeed: 3.2,
    luckModifier: 0.9,
    xpModifier: 1.0,
    startingWeapon: WeaponType.APOSTILA,
    accentColor: '#10b981',
    unlockCost: 400
  },
  {
    id: CharacterId.INGLES,
    name: 'Prof. Tecnológico',
    role: 'Millennial das Dancinhas & Memes 📱',
    emoji: '📱',
    description: 'Tenta usar dancinhas, cita memes ultrapassados para chamar a atenção, implora por likes e finge dominar tecnologia com slides mal formatados.',
    characteristic: 'HP reduzido, mas ganha Didática (XP) e evolui de nível 30% mais rápido devido à sua empolgação com tecnologia.',
    specialAbilityName: 'Dancinha "Cringe"',
    specialAbilityDesc: 'A cada 12 segundos, tenta realizar um passinho de TikTok! Causa perplexidade e vergonha alheia paralisando alunos próximos por 4 segundos.',
    baseMaxHp: 85,
    baseSpeed: 2.9,
    luckModifier: 1.0,
    xpModifier: 1.3,
    startingWeapon: WeaponType.NOTEBOOK,
    accentColor: '#f59e0b',
    unlockCost: 800
  }
];

