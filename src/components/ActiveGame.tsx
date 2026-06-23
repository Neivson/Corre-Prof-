/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  Heart, 
  Coins, 
  Clock, 
  Trophy, 
  User, 
  Sparkles 
} from 'lucide-react';
import { 
  WeaponType, 
  EnemyType, 
  Scenario, 
  ScenarioType,
  PlayerStats, 
  Enemy, 
  Projectile, 
  PowerUp, 
  PowerUpType, 
  TextParticle, 
  PermanentShopUpgrades, 
  ENEMY_QUOTES, 
  BossWarningAOE, 
  AISummon,
  CharacterId,
  PLAYABLE_CHARACTERS
} from '../types';
import VirtualJoystick from './VirtualJoystick';
import PauseScreen from './PauseScreen';
import UpgradeSelection, { getUpgradeOptionList } from './UpgradeSelection';
import { audio } from '../utils/audio';

// Detailed mapping of highly-specific, sarcastic, teacher-themed insults/quotes for each Boss EnemyType
const TEACHER_BOSS_INSULTS: Partial<Record<EnemyType, string[]>> = {
  [EnemyType.COORDENADOR_ESCOLAR]: [
    "Sua didática me lembra um giz quebrado: barulhenta, ineficaz e que dá arrepios!",
    "Se o seu plano de aula fosse submetido a uma auditoria, você seria rebaixado a inspetor de pátio!",
    "Vou abrir um processo administrativo contra esse seu desespero pedagógico!",
    "Cadê o diário de classe preenchido? Suas justificativas não convencem nem a portaria de entrada!"
  ],
  [EnemyType.ARTICULADORA_PEDAGOGICA]: [
    "Sua metodologia de trabalho parece ter sido tirada de um folheto rasgado e úmido de 1993!",
    "Meus parabéns pela aula inovadora, pena que o alinhamento com a BNCC é totalmente imaginário!",
    "Cadê as evidências atitudinais e procedimentais desse seu vexame profissional no relatório?",
    "Quem precisa de giz quando se pode preencher oitenta formulários de auto-avaliação formativa em silêncio?"
  ],
  [EnemyType.ALUNO_DO_FUNDAO]: [
    "Se o senhor não der ponto extra no grito, a gente vai reprovar com orgulho comendo coxinha e rindo!",
    "Calma aí, prof! Desse jeito o senhor vai enfartar antes de terminar de corrigir nossos gabaritos zerados!",
    "Professor, se a sua explicação fosse interessante, a gente não estaria jogando dominó nas últimas carteiras!",
    "Prof, seu slide de apresentação tá tão velho que ele tem direito a assento preferencial no ônibus municipal!"
  ],
  [EnemyType.DIARIO_ATRASADO]: [
    "O sistema de lançamento de presença fecha em 2 minutos e você ainda está tentando lembrar a senha secreta!",
    "Mais de trezentas faltas acumuladas no semestre e nenhum plano de intervenção pedagógica? Que vergonha administrativa!",
    "Sua carreira acadêmica e plano de carreira estão tão parados quanto a sua folha de frequência mensal!",
    "Você vai assinar o termo de infração disciplinar agora ou quer que eu envie diretamente para a Inspetoria Estadual?"
  ],
  [EnemyType.CHEF_CONSELHO_DEC_LASSE]: [
    "A mesa plenária decidiu por unanimidade: a pauta do conselho hoje é a sua completa inépcia de aula!",
    "Sua aula é tão entorpecente que os próprios membros do conselho dormiram antes de debater o rendimento!",
    "Preencher parecer descritivo final sem rasuras à caneta azul? Você devia ser banido da sala dos professores!",
    "Cinquenta por cento de reprovação na turma? Claramente a culpa é do professor, não da falta de infraestrutura!"
  ],
  [EnemyType.FORMULARIO_INFINITO]: [
    "O formulário digital falhou catastroficamente. Por favor, reenvie quatro cópias físicas carimbadas no cartório local!",
    "Sua rubrica na página quarenta e sete está ligeiramente inclinada. Processo arquivado e aula cancelada!",
    "Preencha o Anexo XIV (Seção de Recursos Docentes) com justificativa jurada de por que você merece comer na cantina!",
    "O sistema de ponto eletrônico acusou inconsistência. Seu salário foi bloqueado preventivamente pela coordenoria!"
  ],
  [EnemyType.CHEF_SABADO_LETIVO]: [
    "Você achou mesmo que ia descansar no sábado de manhã? Que doce insolência pedagógica!",
    "Reposição compulsória de greve de 2018 ativada! Pegue uma xícara de café frio e engula as lágrimas!",
    "Seu final de semana foi revogado por decreto governamental para assistirmos uma palestra motivacional de 6 horas!",
    "A mesa do café está vazia e a planilha de chamadas pendentes está transbordando. Bom sábado de trabalho letivo!"
  ],
  [EnemyType.ALUNO_VAI_VALER_NOTA]: [
    "Me dá 0.5 de ponto extra apenas por existir e carregar sua mochila pesada de xerox, prof!",
    "Se você não arredondar minha média final de 2.2 para 6.0, meu pai vai vir aqui com advogado conversar na diretoria!",
    "Por que o senhor está cobrando conteúdo que estava no livro desde o primeiro bimestre? Isso não vale nada!",
    "Não adianta passar prova elaborada, o Google Lens resolve em cinco segundos e você vai ter que nos dar nota máxima!"
  ],
  [EnemyType.CONVOCACAO_REUNIAO]: [
    "Convocação enviada às 18h01 da sexta-feira com pauta extraordinária! Traga seu próprio canetão e desespero!",
    "Reunião do Google Meet ininterrupta sem opção de mutar o microfone para debatermos o novo organograma de xerox!",
    "Uma nova diretriz federal acaba de anular todas as suas esperanças de férias remuneradas do meio do ano!",
    "O seu pedido de licença médica foi indeferido porque o CRM do assessor estava escrito em fonte não padronizada!"
  ],
  [EnemyType.CHEF_FECHAMENTO_UNIDADE]: [
    "O servidor on-line está fora do ar nacionalmente e o prazo final de nota está acabando sob gritos de desespero!",
    "Lançamento em massa de notas vermelhas sem recuperação ativa! Sinta o julgamento final da Secretaria de Educação!",
    "Seu plano de aula anual completo foi reprovado por falta de 'jargão acolhedor multiprofissional'. Refaça em 24h!",
    "O seu bônus de rendimento foi recalculado para zero por desvio leve da média geral de aprovação estipulada!"
  ],
  [EnemyType.CHEF_SEMANA_PEDAGOGICA]: [
    "Quem precisa de reajuste salarial quando temos dinâmicas de acolhimento de grupo com balões coloridos?",
    "Vamos fazer uma dança da cadeira pedagógica para exercitar nossa inteligência socioemocional e empatia corporativa!",
    "Hora de debater ideias inovadoras em círculo para fingir que resolvemos a goteira no teto do laboratório!",
    "Respire fundo e abrace o colega de trabalho sem reclamar do salário. O amor e a resiliência curam todas as contas!"
  ]
};

const DEFAULT_BOSS_INSULTS = [
  "Você chama isso de plano de trabalho docente? Parece mais um rascunho de lista de compras!",
  "A sua didática não assusta nem o inspetor de alunos recém-contratado!",
  "Favor comparecer à coordenação ao final de sua aula para assinar sua advertência formal de advertência!",
  "Menos reclamações trabalhistas e mais digitação de relatórios de desempenho na plataforma!"
];

// Static builder to generate pixel-art student sprite sheets of exactly 96x128 pixels (3x4 grid of 32x32 frames)
export function createStudentSpriteSheet(type: 'aluno_01' | 'aluno_02' | 'aluno_03' | 'aluno_04'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Clear background
  ctx.clearRect(0, 0, 96, 128);

  const drawPixel = (px: number, py: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, 1, 1);
  };

  const drawRect = (px: number, py: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, w, h);
  };

  // Define colors & premium palettes for each character type
  let colorHair = '#334155';
  let colorHairShadow = '#1e293b';
  let colorHairHighlight = '#64748b';
  let colorSkin = '#fdba74'; // Peach skin
  let colorSkinShadow = '#e28540'; // ambient occlusion skin shadow
  let colorShirt = '#ffffff';
  let colorShirtShadow = '#cbd5e1';
  let colorPants = '#475569';
  let colorPantsShadow = '#1e293b';
  let colorShoes = '#1e293b';
  let isGirl = false;

  if (type === 'aluno_01') {
    // Mohawk yellow boy (Aluno 01)
    colorHair = '#facc15';
    colorHairShadow = '#ca8a04';
    colorHairHighlight = '#fef08a';
    colorSkin = '#fed7aa';
    colorSkinShadow = '#fdba74';
    colorShirt = '#f8fafc'; // White uniform shirt
    colorShirtShadow = '#e2e8f0';
    colorPants = '#1e293b'; // dark navy pants
    colorPantsShadow = '#0f172a';
    colorShoes = '#dc2626'; // Red high-top sneakers with white soles
    isGirl = false;
  } else if (type === 'aluno_02') {
    // Cute girl with pigtails (Aluna 01)
    colorHair = '#334155'; // Charcoal/black hair
    colorHairShadow = '#15171c';
    colorHairHighlight = '#64748b';
    colorSkin = '#ffedd5'; // Pale skin
    colorSkinShadow = '#fed7aa';
    colorShirt = '#ffffff'; // White uniform V-neck
    colorShirtShadow = '#e2e8f0';
    colorPants = '#475569'; // Gray skirt
    colorPantsShadow = '#334155';
    colorShoes = '#f43f5e'; // Chic pink sneakers
    isGirl = true;
  } else if (type === 'aluno_03') {
    // Aluna 02 (Red/orange hair ponytail girl)
    colorHair = '#f97316'; // Orange-red hair
    colorHairShadow = '#c2410c';
    colorHairHighlight = '#fed7aa';
    colorSkin = '#ffedd5';
    colorSkinShadow = '#fed7aa';
    colorShirt = '#ffffff'; // White blouse
    colorShirtShadow = '#e2e8f0';
    colorPants = '#0284c7'; // Blue skirt
    colorPantsShadow = '#075985';
    colorShoes = '#10b981'; // Mint sneakers
    isGirl = true;
  } else if (type === 'aluno_04') {
    // Aluno 02 (Nerdy boy / cap boy)
    colorHair = '#78350f'; // Brown hair
    colorHairShadow = '#451a03';
    colorHairHighlight = '#b45309';
    colorSkin = '#fed7aa';
    colorSkinShadow = '#fdba74';
    colorShirt = '#f8fafc';
    colorShirtShadow = '#cbd5e1';
    colorPants = '#3f3f46'; // Darker slacks
    colorPantsShadow = '#18181b';
    colorShoes = '#0284c7'; // Blue sneakers
    isGirl = false;
  }

  // Draw 12 frames (3 columns x 4 rows)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const startX = col * 32;
      const startY = row * 32;

      ctx.save();
      
      // If row 2 (Right), we mirror row 1 (Left) to make life extremely easy and symmetrical
      if (row === 2) {
        ctx.translate(startX + 16, startY + 16);
        ctx.scale(-1, 1);
        ctx.translate(-(col * 32 + 16), -(row * 32 + 16));
      }

      const drawRow = row === 2 ? 1 : row;

      // Cycle bounce offsets: Frame 1 is normal center. Frame 0 and 2 are stepping, adding 1px bouncy crouch down
      const isStep = col !== 1;
      const yBounce = isStep ? 1 : 0;

      const headY = 4 + yBounce;
      const shirtY = 16 + yBounce;
      const pantsY = 23 + yBounce;

      // ---- 1. DRAW BACK HAIR (behind the head layers) ----
      if (type === 'aluno_02') {
        // Pigtail round buns sat behind the top-corners of head shape
        if (drawRow === 0 || drawRow === 3) {
          // Left bun
          drawRect(startX + 5, startY + headY - 1, 5, 5, colorHairShadow);
          drawRect(startX + 6, startY + headY, 3, 3, colorHair);
          drawPixel(startX + 7, startY + headY, colorHairHighlight); // shine
          // Right bun
          drawRect(startX + 22, startY + headY - 1, 5, 5, colorHairShadow);
          drawRect(startX + 23, startY + headY, 3, 3, colorHair);
          drawPixel(startX + 24, startY + headY, colorHairHighlight);
        } else if (drawRow === 1) {
          // Only right-side/back bun visible during profile view
          drawRect(startX + 18, startY + headY - 1, 5, 5, colorHairShadow);
          drawRect(startX + 19, startY + headY, 3, 3, colorHair);
          drawPixel(startX + 20, startY + headY, colorHairHighlight);
        }
      } else if (type === 'aluno_03') {
        // Long dynamic ponytail hanging
        if (drawRow === 1) {
          const sway = col === 0 ? -1 : (col === 2 ? 1 : 0);
          drawRect(startX + 18 + sway, startY + headY + 3, 4, 6, colorHair);
          drawRect(startX + 18 + sway, startY + headY + 3, 2, 4, colorHairHighlight); // Shine on ponytail
          drawRect(startX + 19 + sway, startY + headY + 9, 2, 2, colorHairShadow);
        } else if (drawRow === 3) {
          drawRect(startX + 14, startY + headY + 4, 4, 8, colorHairShadow);
          drawRect(startX + 15, startY + headY + 4, 2, 6, colorHair);
        }
      }

      // ---- 2. DRAW BASE HEAD (14x12) & NECK (6x2) ----
      if (drawRow === 3) {
        // Back View
        drawRect(startX + 9, startY + headY, 14, 12, colorHair); // Solid hair covers head fully
        // Draw back hair highlights
        drawRect(startX + 11, startY + headY + 2, 10, 1, colorHairHighlight);
        drawRect(startX + 13, startY + headY + 3, 6, 1, colorHairHighlight);
        drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkinShadow); // shaded neck
      } else if (drawRow === 1) {
        // Profile Left View
        drawRect(startX + 9, startY + headY, 13, 12, colorSkin); // Skin block
        drawRect(startX + 12, startY + headY + 12, 5, 2, colorSkinShadow); // neck shadow
        
        // Hair overlay
        drawRect(startX + 10, startY + headY, 12, 4, colorHair);
        drawRect(startX + 10, startY + headY + 1, 9, 1, colorHairHighlight); // Hair sheen side
        drawRect(startX + 16, startY + headY, 6, 12, colorHair); // back hair layer
        drawRect(startX + 17, startY + headY + 3, 4, 8, colorHairShadow); // shading under back hair
        
        if (type === 'aluno_01') {
          // Mohawk spikes on head profile
          drawRect(startX + 13, startY + headY - 4, 5, 4, colorHair);
          drawRect(startX + 14, startY + headY - 3, 3, 3, colorHairHighlight); // spiky blonde highlight
          drawRect(startX + 11, startY + headY - 3, 2, 3, colorHairShadow);
        }
      } else {
        // Front View
        drawRect(startX + 9, startY + headY, 14, 12, colorSkin);
        drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkinShadow); // neck shadow
        
        // Hair overlays (fringe and top crown)
        drawRect(startX + 9, startY + headY, 14, 4, colorHair);
        // Highlight shine line
        drawRect(startX + 10, startY + headY + 1, 12, 1, colorHairHighlight);
        drawRect(startX + 9, startY + headY + 4, 3, 5, colorHair); // Left framing hair
        drawRect(startX + 20, startY + headY + 4, 3, 5, colorHair); // Right framing hair
        
        // Drop shadow under bangs
        drawRect(startX + 12, startY + headY + 4, 8, 1, colorSkinShadow);
        
        if (type === 'aluno_01') {
          // Front Mohawk styling
          drawRect(startX + 13, startY + headY - 4, 6, 4, colorHair);
          drawRect(startX + 14, startY + headY - 3, 4, 3, colorHairHighlight); // bright spike top
          drawRect(startX + 12, startY + headY - 3, 1, 3, colorHairShadow);
          drawRect(startX + 19, startY + headY - 3, 1, 3, colorHairShadow);
        }
      }

      // ---- 3. FACE DETAILS AND SENSES ----
      if (drawRow === 0) {
        // Front Eyes, brows & details
        if (type === 'aluno_02') {
          // Cute blinking closed smiling eyes (^^) with lashes
          drawPixel(startX + 11, startY + headY + 6, '#0f172a');
          drawPixel(startX + 12, startY + headY + 5, '#0f172a');
          drawPixel(startX + 13, startY + headY + 5, '#0f172a');
          drawPixel(startX + 14, startY + headY + 6, '#0f172a');
          
          drawPixel(startX + 17, startY + headY + 6, '#0f172a');
          drawPixel(startX + 18, startY + headY + 5, '#0f172a');
          drawPixel(startX + 19, startY + headY + 5, '#0f172a');
          drawPixel(startX + 20, startY + headY + 6, '#0f172a');

          // Blush pink details
          drawRect(startX + 10, startY + headY + 8, 2, 1, '#fda4af');
          drawRect(startX + 20, startY + headY + 8, 2, 1, '#fda4af');
        } else if (type === 'aluno_01') {
          // Blonde spiky boy determined eyes (Sclera + Blue pupil + sparkle glint)
          drawRect(startX + 11, startY + headY + 6, 3, 2, '#ffffff');
          drawRect(startX + 18, startY + headY + 6, 3, 2, '#ffffff');
          drawRect(startX + 12, startY + headY + 6, 2, 2, '#3b82f6'); // Sapphire
          drawRect(startX + 19, startY + headY + 6, 2, 2, '#3b82f6');
          drawPixel(startX + 12, startY + headY + 6, '#ffffff'); // Glint L
          drawPixel(startX + 19, startY + headY + 6, '#ffffff'); // Glint R
          
          // Determined thick brow line
          drawRect(startX + 11, startY + headY + 5, 10, 1, '#1e293b');
        } else if (type === 'aluno_03') {
          // Emerald green lively eyes
          drawRect(startX + 11, startY + headY + 6, 3, 2, '#ffffff');
          drawRect(startX + 18, startY + headY + 6, 3, 2, '#ffffff');
          drawRect(startX + 12, startY + headY + 6, 2, 2, '#10b981'); // Emerald
          drawRect(startX + 19, startY + headY + 6, 2, 2, '#10b981');
          drawPixel(startX + 12, startY + headY + 6, '#ffffff'); // Glint L
          drawPixel(startX + 19, startY + headY + 6, '#ffffff'); // Glint R
          
          drawRect(startX + 11, startY + headY + 5, 3, 1, '#1e293b'); // Eyelashes L
          drawRect(startX + 18, startY + headY + 5, 3, 1, '#1e293b'); // Eyelashes R
          
          // Soft pink cheeks
          drawPixel(startX + 10, startY + headY + 8, '#f472b6');
          drawPixel(startX + 21, startY + headY + 8, '#f472b6');
        } else if (type === 'aluno_04') {
          // Smart glasses frames
          drawRect(startX + 10, startY + headY + 5, 12, 1, '#020617'); // top bridge
          
          // Lenses (cyan-blue reflection) with sparkles
          drawRect(startX + 11, startY + headY + 6, 3, 3, '#e0f2fe');
          drawRect(startX + 18, startY + headY + 6, 3, 3, '#e0f2fe');
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1;
          ctx.strokeRect(startX + 10.5, startY + headY + 5.5, 4, 4);
          ctx.strokeRect(startX + 17.5, startY + headY + 5.5, 4, 4);
          drawPixel(startX + 11, startY + headY + 6, '#ffffff');
          drawPixel(startX + 18, startY + headY + 6, '#ffffff');
          
          // Small eyes visible behind glass
          drawPixel(startX + 12, startY + headY + 7, '#78350f');
          drawPixel(startX + 19, startY + headY + 7, '#78350f');
          
          // Geeky blush
          drawPixel(startX + 10, startY + headY + 9, '#fda4af');
          drawPixel(startX + 21, startY + headY + 9, '#fda4af');
        }

        // Smiling mouth
        drawPixel(startX + 15, startY + headY + 9, '#e11d48');
        drawPixel(startX + 16, startY + headY + 9, '#e11d48');
        drawPixel(startX + 15, startY + headY + 10, '#fda4af'); // tongue
      } else if (drawRow === 1) {
        // Profile Left face details
        if (type === 'aluno_02') {
          drawPixel(startX + 11, startY + headY + 6, '#000000');
          drawPixel(startX + 12, startY + headY + 5, '#000000');
          drawPixel(startX + 10, startY + headY + 8, '#f472b6');
        } else if (type === 'aluno_01') {
          drawRect(startX + 11, startY + headY + 6, 2, 2, '#3b82f6');
          drawPixel(startX + 11, startY + headY + 6, '#ffffff'); // Glint
          drawRect(startX + 11, startY + headY + 5, 2, 1, '#0f172a'); // brow
        } else if (type === 'aluno_03') {
          drawRect(startX + 11, startY + headY + 6, 2, 2, '#10b981');
          drawPixel(startX + 11, startY + headY + 6, '#ffffff');
          drawPixel(startX + 10, startY + headY + 8, '#f472b6');
        } else if (type === 'aluno_04') {
          drawRect(startX + 10, startY + headY + 5, 4, 4, '#e0f2fe');
          ctx.strokeStyle = '#020617';
          ctx.lineWidth = 1;
          ctx.strokeRect(startX + 9.5, startY + headY + 4.5, 5, 5);
          drawPixel(startX + 11, startY + headY + 7, '#78350f');
        }
      }

      // ---- 4. BODY SHIRT & SWINGING ARMS ----
      if (drawRow === 0 || drawRow === 3) {
        // Front View White Shirt uniform (x=10..21, width=12, height=7)
        drawRect(startX + 10, startY + shirtY, 12, 7, colorShirt);
        // Base uniform shading
        drawRect(startX + 10, startY + shirtY + 5, 12, 2, colorShirtShadow);
        drawRect(startX + 10, startY + shirtY, 1, 7, colorShirtShadow);
        drawRect(startX + 21, startY + shirtY, 1, 7, colorShirtShadow);

        if (drawRow === 0) {
          // Open uniform neckline/collar details
          drawRect(startX + 14, startY + shirtY, 4, 2, colorSkin);
          // Left & right collar folds
          drawPixel(startX + 12, startY + shirtY + 1, colorShirtShadow);
          drawPixel(startX + 19, startY + shirtY + 1, colorShirtShadow);
          
          // Tiny school badge/logo printed on uniform (blue/gold shield icon)
          drawPixel(startX + 12, startY + shirtY + 3, '#2563eb');
          drawPixel(startX + 13, startY + shirtY + 3, '#facc15');
        }

        // Active arm swinging frames
        if (col === 0) {
          // Left arm forward (high-up index), right arm backward
          drawRect(startX + 8, startY + shirtY + 1, 2, 4, colorShirt);
          drawRect(startX + 8, startY + shirtY + 3, 2, 2, colorShirtShadow); // Shading
          drawRect(startX + 8, startY + shirtY + 5, 2, 2, colorSkin);

          drawRect(startX + 22, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 22, startY + shirtY + 4, 1, 2, colorShirtShadow);
          drawRect(startX + 22, startY + shirtY + 6, 2, 2, colorSkin);
        } else if (col === 2) {
          // Right arm forward, left arm backward
          drawRect(startX + 8, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 9, startY + shirtY + 4, 1, 2, colorShirtShadow);
          drawRect(startX + 8, startY + shirtY + 6, 2, 2, colorSkin);

          drawRect(startX + 22, startY + shirtY + 1, 2, 4, colorShirt);
          drawRect(startX + 22, startY + shirtY + 3, 2, 2, colorShirtShadow);
          drawRect(startX + 22, startY + shirtY + 5, 2, 2, colorSkin);
        } else {
          // Neutral normal stance arms
          drawRect(startX + 8, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 8, startY + shirtY + 2, 1, 4, colorShirtShadow);
          drawRect(startX + 8, startY + shirtY + 6, 2, 2, colorSkin);

          drawRect(startX + 22, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 23, startY + shirtY + 2, 1, 4, colorShirtShadow);
          drawRect(startX + 22, startY + shirtY + 6, 2, 2, colorSkin);
        }
      } else if (drawRow === 1) {
        // Left Profile Shirt uniform
        drawRect(startX + 11, startY + shirtY, 9, 7, colorShirt);
        drawRect(startX + 11, startY + shirtY + 5, 9, 2, colorShirtShadow);
        drawRect(startX + 11, startY + shirtY, 1, 7, colorShirtShadow);

        // Crest visible on profile
        drawPixel(startX + 12, startY + shirtY + 3, '#2563eb');

        // Arm swing profile-wise
        if (col === 0) {
          drawRect(startX + 9, startY + shirtY + 2, 4, 3, colorShirt);
          drawRect(startX + 9, startY + shirtY + 4, 4, 1, colorShirtShadow);
          drawRect(startX + 7, startY + shirtY + 3, 2, 2, colorSkin);
        } else if (col === 2) {
          drawRect(startX + 17, startY + shirtY + 2, 4, 3, colorShirt);
          drawRect(startX + 17, startY + shirtY + 4, 4, 1, colorShirtShadow);
          drawRect(startX + 21, startY + shirtY + 3, 2, 2, colorSkin);
        } else {
          drawRect(startX + 13, startY + shirtY + 2, 3, 4, colorShirt);
          drawRect(startX + 13, startY + shirtY + 5, 3, 1, colorShirtShadow);
          drawRect(startX + 13, startY + shirtY + 6, 3, 2, colorSkin);
        }
      }

      // ---- 5. PANTS OR SKIRT UNIT ----
      if (drawRow === 0 || drawRow === 3) {
        drawRect(startX + 10, startY + pantsY, 12, isGirl ? 4 : 3, colorPants);
        drawRect(startX + 10, startY + pantsY + (isGirl ? 3 : 2), 12, 1, colorPantsShadow); // Shadow under folding
        
        if (isGirl && drawRow === 0) {
          // Pleat dark lines on school skirts
          drawRect(startX + 12, startY + pantsY + 1, 1, 3, colorPantsShadow);
          drawRect(startX + 15, startY + pantsY + 1, 1, 3, colorPantsShadow);
          drawRect(startX + 18, startY + pantsY + 1, 1, 3, colorPantsShadow);
        }
      } else if (drawRow === 1) {
        drawRect(startX + 11, startY + pantsY, 9, isGirl ? 4 : 3, colorPants);
        drawRect(startX + 11, startY + pantsY + (isGirl ? 3 : 2), 9, 1, colorPantsShadow);
      }

      // ---- 6. LEGS & SHOES UNIT ----
      const legY = pantsY + (isGirl ? 4 : 3);
      if (drawRow === 0 || drawRow === 3) {
        if (col === 0) {
          // Left rising up run cycle step, right driving down
          drawRect(startX + 11, startY + legY, 3, 2, colorSkin);
          drawRect(startX + 11, startY + legY, 1, 2, colorSkinShadow); // side shading
          drawRect(startX + 11, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 3, 3, 1, '#ffffff'); // White sneaker soles

          drawRect(startX + 18, startY + legY, 3, 3, colorSkin);
          drawRect(startX + 18, startY + legY, 1, 3, colorSkinShadow);
          drawRect(startX + 18, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 18, startY + legY + 4, 3, 1, '#ffffff'); // sneaker soles
        } else if (col === 2) {
          // Right rising up, left driving down
          drawRect(startX + 11, startY + legY, 3, 3, colorSkin);
          drawRect(startX + 11, startY + legY, 1, 3, colorSkinShadow);
          drawRect(startX + 11, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 4, 3, 1, '#ffffff'); // sneaker soles

          drawRect(startX + 18, startY + legY, 3, 2, colorSkin);
          drawRect(startX + 18, startY + legY, 1, 2, colorSkinShadow);
          drawRect(startX + 18, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 18, startY + legY + 3, 3, 1, '#ffffff'); // sneaker soles
        } else {
          // Both legs perfectly standard and straight down
          drawRect(startX + 11, startY + legY, 3, 3, colorSkin);
          drawRect(startX + 11, startY + legY, 1, 3, colorSkinShadow);
          drawRect(startX + 11, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 4, 3, 1, '#ffffff'); // sneaker soles

          drawRect(startX + 18, startY + legY, 3, 3, colorSkin);
          drawRect(startX + 18, startY + legY, 1, 3, colorSkinShadow);
          drawRect(startX + 18, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 18, startY + legY + 4, 3, 1, '#ffffff'); // sneaker soles
        }
      } else if (drawRow === 1) {
        // Profile side view legs walking split
        if (col === 0) {
          drawRect(startX + 9, startY + legY, 3, 3, colorSkin);
          drawRect(startX + 9, startY + legY, 1, 3, colorSkinShadow);
          drawRect(startX + 8, startY + legY + 3, 4, 2, colorShoes);
          drawRect(startX + 8, startY + legY + 4, 4, 1, '#ffffff'); // sneaker soles

          drawRect(startX + 15, startY + legY, 3, 2, colorSkin);
          drawRect(startX + 15, startY + legY, 1, 2, colorSkinShadow);
          drawRect(startX + 15, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 15, startY + legY + 3, 3, 1, '#ffffff'); // sneaker soles
        } else if (col === 2) {
          drawRect(startX + 11, startY + legY, 3, 2, colorSkin);
          drawRect(startX + 11, startY + legY, 1, 2, colorSkinShadow);
          drawRect(startX + 11, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 3, 3, 1, '#ffffff'); // sneaker soles

          drawRect(startX + 17, startY + legY, 3, 3, colorSkin);
          drawRect(startX + 17, startY + legY, 1, 3, colorSkinShadow);
          drawRect(startX + 16, startY + legY + 3, 4, 2, colorShoes);
          drawRect(startX + 16, startY + legY + 4, 4, 1, '#ffffff'); // sneaker soles
        } else {
          drawRect(startX + 12, startY + legY, 4, 3, colorSkin);
          drawRect(startX + 12, startY + legY, 1, 3, colorSkinShadow);
          drawRect(startX + 12, startY + legY + 3, 4, 2, colorShoes);
          drawRect(startX + 12, startY + legY + 4, 4, 1, '#ffffff'); // sneaker soles
        }
      }

      ctx.restore();
    }
  }

  return canvas;
}

// Static builder to generate pixel-art teacher sprite sheets of exactly 96x128 pixels (3x4 grid of 32x32 frames)
export function createTeacherSpriteSheet(id: CharacterId): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 96, 128);

  const drawPixel = (px: number, py: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, 1, 1);
  };

  const drawRect = (px: number, py: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, w, h);
  };

  // 1. Establish visual characteristics based on CharacterId
  let colorHair = '#475569';
  let colorHairShadow = '#1e293b';
  let colorHairHighlight = '#64748b';
  let colorSkin = '#fed7aa'; // Default peach
  let colorSkinShadow = '#e28540';
  let colorShirt = '#ffffff'; // Shirt/coat
  let colorShirtShadow = '#cbd5e1';
  let colorPants = '#334155'; // School pants/skirt
  let colorPantsShadow = '#1e293b';
  let colorShoes = '#0f172a';
  let isGirl = false;
  let hasGlasses = false;
  let glassesColor = '#000000';
  let customNeckItem: 'tie' | 'bow' | 'whistle' | 'scarf' | null = null;

  if (id === CharacterId.CLASSICO) {
    // Humanas - Marcos (Classic graying hair teacher, white shirt, red tie, grey slacks)
    colorHair = '#52525b'; // Grey hair
    colorHairShadow = '#27272a';
    colorHairHighlight = '#a1a1aa';
    colorSkin = '#ffedd5'; // Pale peach skin
    colorSkinShadow = '#fed7aa';
    colorShirt = '#f8fafc'; // White shirt
    colorShirtShadow = '#cbd5e1';
    colorPants = '#3f3f46'; // Grey slacks
    colorPantsShadow = '#18181b';
    colorShoes = '#1c1917'; // Polished mahogany leather loafers
    isGirl = false;
    hasGlasses = true;
    glassesColor = '#090d16'; // Black glasses frames
    customNeckItem = 'tie';
  } else if (id === CharacterId.ARTES) {
    // Letras - Regina (Creative Magenta hair bun, pink apron tunic, purple-indigo skirt, yellow ribbon bow)
    colorHair = '#db2777'; // Magenta pink hair
    colorHairShadow = '#831843';
    colorHairHighlight = '#f472b6';
    colorSkin = '#ffe4e6'; // Rosy skin
    colorSkinShadow = '#fecaca';
    colorShirt = '#f472b6'; // Pink artistic jacket/tunic
    colorShirtShadow = '#db2777';
    colorPants = '#4f46e5'; // Purple-indigo skirt
    colorPantsShadow = '#312e81';
    colorShoes = '#b91c1c'; // Bright scarlet slippers
    isGirl = true;
    hasGlasses = true;
    glassesColor = '#ec4899'; // Pink designer frames
    customNeckItem = 'bow';
  } else if (id === CharacterId.ED_FISICA) {
    // Biológicas - Toninho (Sporty athletic blonde spiky crop, emerald green track uniform, whistle lanyard)
    colorHair = '#eab308'; // Sporty yellow blonde
    colorHairShadow = '#a16207';
    colorHairHighlight = '#fef08a';
    colorSkin = '#fed7aa'; // Sun-kissed peach skin
    colorSkinShadow = '#fdba74';
    colorShirt = '#10b981'; // Green tracksuit top
    colorShirtShadow = '#047857';
    colorPants = '#065f46'; // Deep green track pants
    colorPantsShadow = '#022c22';
    colorShoes = '#1e3a8a'; // Sporty blue sneakers
    isGirl = false;
    hasGlasses = false;
    customNeckItem = 'whistle';
  } else if (id === CharacterId.INGLES) {
    // Exatas - Mônica (Elegant brown high ponytail, royal blue professional business suit, red scarf/tie)
    colorHair = '#78350f'; // Warm chestnut brown hair
    colorHairShadow = '#451a03';
    colorHairHighlight = '#ca8a04';
    colorSkin = '#ffedd5'; // Elegant pale skin
    colorSkinShadow = '#fed7aa';
    colorShirt = '#2563eb'; // Royal blue suit blazer
    colorShirtShadow = '#1d4ed8';
    colorPants = '#1e293b'; // Slate skirt/trousers
    colorPantsShadow = '#0f172a';
    colorShoes = '#111827'; // Dark smart pumps
    isGirl = true;
    hasGlasses = true;
    glassesColor = '#d97706'; // Gold chic glasses frames
    customNeckItem = 'scarf';
  }

  // Draw 12 frames (3 columns x 4 rows)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const startX = col * 32;
      const startY = row * 32;

      ctx.save();
      
      // Symmetrical profile views: Row 2 (Right) mirrors Row 1 (Left)
      if (row === 2) {
        ctx.translate(startX + 16, startY + 16);
        ctx.scale(-1, 1);
        ctx.translate(-(col * 32 + 16), -(row * 32 + 16));
      }

      const drawRow = row === 2 ? 1 : row;

      // Step bounce offsets: frames 0 and 2 are stepping down 1px
      const isStep = col !== 1;
      const yBounce = isStep ? 1 : 0;

      const headY = 4 + yBounce;
      const shirtY = 16 + yBounce;
      const pantsY = 23 + yBounce;

      // ---- 1. DRAW BACK HAIR MODULE (Buns, ponytails sitting behind the head) ----
      if (id === CharacterId.ARTES) {
        // High creative artistic top hairbun
        if (drawRow === 0 || drawRow === 3) {
          drawRect(startX + 13, startY + headY - 4, 6, 4, colorHairShadow);
          drawRect(startX + 14, startY + headY - 3, 4, 3, colorHair);
          drawRect(startX + 15, startY + headY - 2, 2, 1, colorHairHighlight); // bun sheen
          // Gold haircomb accessory pinned in bun
          drawPixel(startX + 13, startY + headY - 2, '#fbbf24');
          drawPixel(startX + 19, startY + headY - 2, '#fbbf24');
        } else if (drawRow === 1) {
          drawRect(startX + 13, startY + headY - 4, 5, 4, colorHairShadow);
          drawRect(startX + 14, startY + headY - 3, 3, 3, colorHair);
          drawPixel(startX + 15, startY + headY - 2, colorHairHighlight);
        }
      } else if (id === CharacterId.INGLES) {
        // Large elegant ponytail dangling
        if (drawRow === 3) {
          drawRect(startX + 14, startY + headY + 5, 4, 8, colorHairShadow);
          drawRect(startX + 15, startY + headY + 5, 2, 8, colorHair);
          drawRect(startX + 15, startY + headY + 13, 2, 2, colorHairHighlight);
        } else if (drawRow === 1) {
          // Sleek side ponytail swinging during runs
          const sway = col === 0 ? -1 : (col === 2 ? 1 : 0);
          drawRect(startX + 18 + sway, startY + headY + 2, 4, 7, colorHair);
          drawRect(startX + 19 + sway, startY + headY + 2, 2, 5, colorHairHighlight);
          drawRect(startX + 19 + sway, startY + headY + 9, 2, 3, colorHairShadow);
        }
      }

      // ---- 2. DRAW BASE HEAD (14x12) & NECK (6x2) ----
      if (drawRow === 3) {
        // Back View
        drawRect(startX + 9, startY + headY, 14, 12, colorHair); // Base back hair covers full head
        drawRect(startX + 11, startY + headY + 2, 10, 1, colorHairHighlight); // sheen
        drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkinShadow); // neck shadow
      } else if (drawRow === 1) {
        // Profile Left View
        drawRect(startX + 9, startY + headY, 13, 12, colorSkin); // Skin
        drawRect(startX + 12, startY + headY + 12, 5, 2, colorSkinShadow); // Neck

        // Side hair layers
        drawRect(startX + 10, startY + headY, 12, 4, colorHair);
        drawRect(startX + 10, startY + headY + 1, 9, 1, colorHairHighlight); // sheen
        drawRect(startX + 16, startY + headY, 6, 12, colorHair); // back hair layer
        drawRect(startX + 17, startY + headY + 4, 5, 8, colorHairShadow); // shadow behind neck
        
        if (id === CharacterId.ED_FISICA) {
          drawRect(startX + 11, startY + headY - 3, 3, 3, colorHair);
          drawRect(startX + 14, startY + headY - 4, 4, 4, colorHair);
          drawRect(startX + 13, startY + headY - 2, 2, 2, colorHairShadow);
        } else if (id === CharacterId.CLASSICO) {
          drawRect(startX + 10, startY + headY, 11, 4, colorHair);
          drawRect(startX + 15, startY + headY, 7, 7, colorHair);
        }
      } else {
        // Front View
        drawRect(startX + 9, startY + headY, 14, 12, colorSkin);
        drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkinShadow); // neck shadow

        // Front hairstyles
        drawRect(startX + 9, startY + headY, 14, 4, colorHair);
        drawRect(startX + 10, startY + headY + 1, 12, 1, colorHairHighlight); // bright sheen
        drawRect(startX + 9, startY + headY + 4, 3, 5, colorHair);
        drawRect(startX + 20, startY + headY + 4, 3, 5, colorHair);

        // shadow under hair bangs
        drawRect(startX + 12, startY + headY + 4, 8, 1, colorSkinShadow);

        if (id === CharacterId.ED_FISICA) {
          drawRect(startX + 11, startY + headY - 3, 10, 3, colorHair);
          drawRect(startX + 13, startY + headY - 4, 6, 1, colorHairHighlight); // spiky highlight crop
        } else if (id === CharacterId.CLASSICO) {
          drawRect(startX + 11, startY + headY, 2, 4, colorHairShadow);
          drawRect(startX + 13, startY + headY, 10, 4, colorHair);
        } else if (id === CharacterId.INGLES) {
          // Stylish front partition
          drawRect(startX + 9, startY + headY + 2, 14, 2, colorHair);
          drawRect(startX + 9, startY + headY + 4, 2, 4, colorHairShadow);
          drawRect(startX + 21, startY + headY + 4, 2, 4, colorHairShadow);
        }
      }

      // ---- 3. FACE SENSES AND ACCORDING GLASSES ----
      if (drawRow === 0) {
        let pupilColor = '#10b981';
        if (id === CharacterId.CLASSICO) pupilColor = '#3b82f6'; // sapphire blue
        else if (id === CharacterId.ARTES) pupilColor = '#ec4899'; // violet/pink
        else if (id === CharacterId.INGLES) pupilColor = '#ca8a04'; // golden hazel

        if (id === CharacterId.ARTES) {
          // Beautiful laughing eyelashes (^^) with rosy pink blush cheeks
          drawPixel(startX + 11, startY + headY + 6, '#000000');
          drawPixel(startX + 12, startY + headY + 5, '#000000');
          drawPixel(startX + 13, startY + headY + 5, '#000000');
          drawPixel(startX + 14, startY + headY + 6, '#000000');
          
          drawPixel(startX + 17, startY + headY + 6, '#000000');
          drawPixel(startX + 18, startY + headY + 5, '#000000');
          drawPixel(startX + 19, startY + headY + 5, '#000000');
          drawPixel(startX + 20, startY + headY + 6, '#000000');
          
          // rosy blushing cheeks
          drawRect(startX + 10, startY + headY + 8, 2, 1, '#fda4af');
          drawRect(startX + 20, startY + headY + 8, 2, 1, '#fda4af');
        } else {
          // Base eyes box
          drawRect(startX + 11, startY + headY + 6, 2, 2, '#ffffff'); // white sclera
          drawRect(startX + 19, startY + headY + 6, 2, 2, '#ffffff');
          
          // Iris
          drawPixel(startX + 11, startY + headY + 7, pupilColor);
          drawPixel(startX + 19, startY + headY + 7, pupilColor);
          
          // Highlight sparkle
          drawPixel(startX + 12, startY + headY + 6, '#ffffff');
          drawPixel(startX + 20, startY + headY + 6, '#ffffff');

          if (isGirl) {
            drawPixel(startX + 10, startY + headY + 8, '#f472b6'); // subtle blush
            drawPixel(startX + 21, startY + headY + 8, '#f472b6');
          }
        }

        // Cute mini mouth
        drawPixel(startX + 15, startY + headY + 9, '#ef4444');
        drawPixel(startX + 16, startY + headY + 9, '#ef4444');
        drawPixel(startX + 15, startY + headY + 10, '#fecaca'); // soft lip

        if (hasGlasses) {
          // Sharp pixel-aligned thin glasses drawing:
          // Left frame outline
          drawRect(startX + 10, startY + headY + 5, 4, 1, glassesColor); // Top
          drawRect(startX + 10, startY + headY + 7, 4, 1, glassesColor); // Bottom
          drawRect(startX + 10, startY + headY + 5, 1, 3, glassesColor); // Left
          drawRect(startX + 13, startY + headY + 5, 1, 3, glassesColor); // Right

          // Right frame outline
          drawRect(startX + 18, startY + headY + 5, 4, 1, glassesColor); // Top
          drawRect(startX + 18, startY + headY + 7, 4, 1, glassesColor); // Bottom
          drawRect(startX + 18, startY + headY + 5, 1, 3, glassesColor); // Left
          drawRect(startX + 21, startY + headY + 5, 1, 3, glassesColor); // Right

          // Bridge
          drawRect(startX + 14, startY + headY + 6, 4, 1, glassesColor);
          
          // light blue reflection sparkle on glasses lens
          drawPixel(startX + 11, startY + headY + 6, '#e0f2fe');
          drawPixel(startX + 12, startY + headY + 6, '#e0f2fe');
          drawPixel(startX + 19, startY + headY + 6, '#e0f2fe');
          drawPixel(startX + 20, startY + headY + 6, '#e0f2fe');
        }
      } else if (drawRow === 1) {
        // Profile side eye and glasses
        let pupilColor = '#10b981';
        if (id === CharacterId.CLASSICO) pupilColor = '#3b82f6';
        else if (id === CharacterId.ARTES) pupilColor = '#ec4899';
        else if (id === CharacterId.INGLES) pupilColor = '#ca8a04';

        if (id === CharacterId.ARTES) {
          drawPixel(startX + 11, startY + headY + 6, '#000000');
          drawPixel(startX + 12, startY + headY + 5, '#000000');
          drawPixel(startX + 10, startY + headY + 8, '#fda4af');
        } else {
          drawRect(startX + 11, startY + headY + 6, 2, 2, '#ffffff');
          drawPixel(startX + 11, startY + headY + 7, pupilColor);
          drawPixel(startX + 12, startY + headY + 6, '#ffffff'); // glint
        }

        if (hasGlasses) {
          // Sharp pixel-aligned thin glasses for side profile:
          drawRect(startX + 10, startY + headY + 5, 4, 1, glassesColor); // Top
          drawRect(startX + 10, startY + headY + 7, 4, 1, glassesColor); // Bottom
          drawRect(startX + 10, startY + headY + 5, 1, 3, glassesColor); // Left
          drawRect(startX + 13, startY + headY + 5, 1, 3, glassesColor); // Right

          drawRect(startX + 14, startY + headY + 6, 3, 1, glassesColor); // Temple arm
          drawPixel(startX + 11, startY + headY + 6, '#e0f2fe');
        }
      }

      // ---- 4. BODY SUIT (White/Green/Blue shirt / coat) ----
      if (drawRow === 0 || drawRow === 3) {
        drawRect(startX + 10, startY + shirtY, 12, 7, colorShirt);
        // Shirt shading
        drawRect(startX + 10, startY + shirtY + 5, 12, 2, colorShirtShadow);
        drawRect(startX + 10, startY + shirtY, 1, 7, colorShirtShadow);
        drawRect(startX + 21, startY + shirtY, 1, 7, colorShirtShadow);

        // Neck attributes
        if (drawRow === 0) {
          drawRect(startX + 14, startY + shirtY, 4, 2, colorSkin);

          if (customNeckItem === 'tie') {
            // Elegant red necktie with a gold tie clip pixel
            drawRect(startX + 15, startY + shirtY + 1, 2, 5, '#dc2626');
            drawRect(startX + 15, startY + shirtY + 6, 2, 1, '#ef4444');
            drawPixel(startX + 15, startY + shirtY + 3, '#fbbf24'); // golden tie clip
          } else if (customNeckItem === 'bow') {
            // Cute artist neck bow ribbon
            drawPixel(startX + 14, startY + shirtY + 1, '#fbbf24');
            drawPixel(startX + 17, startY + shirtY + 1, '#fbbf24');
            drawRect(startX + 15, startY + shirtY, 2, 2, '#dc2626');
          } else if (customNeckItem === 'whistle') {
            // Coach metallic whistle hanging on cord
            drawRect(startX + 15, startY + shirtY + 1, 2, 2, '#0f172a'); // lanyard cords
            drawRect(startX + 15, startY + shirtY + 3, 2, 3, '#94a3b8'); // steel whistle
            drawPixel(startX + 16, startY + shirtY + 5, '#facc15'); // small gold ball detail
          } else if (customNeckItem === 'scarf') {
            // Elegant draped red scarf
            drawRect(startX + 13, startY + shirtY, 6, 1, '#dc2626');
            drawRect(startX + 14, startY + shirtY + 1, 4, 2, '#b91c1c');
            drawPixel(startX + 13, startY + shirtY + 3, '#dc2626'); // dangling pattern L
            drawPixel(startX + 18, startY + shirtY + 3, '#dc2626'); // dangling R
          }

          if (id === CharacterId.CLASSICO) {
            // Gold pen in chest pocket
            drawPixel(startX + 12, startY + shirtY + 3, '#fbbf24');
            drawPixel(startX + 12, startY + shirtY + 4, '#1e293b');
          } else if (id === CharacterId.ARTES) {
            // Colorful art patches on apron/jacket
            drawPixel(startX + 11, startY + shirtY + 3, '#3b82f6'); // blue splat
            drawPixel(startX + 20, startY + shirtY + 4, '#fbbf24'); // yellow splat
          } else if (id === CharacterId.ED_FISICA) {
            // Two high-contrast sporty white racing stripes on coach tracksuit
            drawRect(startX + 12, startY + shirtY, 1, 6, '#ffffff');
            drawRect(startX + 19, startY + shirtY, 1, 6, '#ffffff');
          }
        }

        // Arm swing iterations
        if (col === 0) {
          drawRect(startX + 8, startY + shirtY + 1, 2, 4, colorShirt);
          drawRect(startX + 8, startY + shirtY + 3, 2, 2, colorShirtShadow);
          drawRect(startX + 8, startY + shirtY + 5, 2, 2, colorSkin);
          
          drawRect(startX + 22, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 22, startY + shirtY + 4, 2, 2, colorShirtShadow);
          drawRect(startX + 22, startY + shirtY + 6, 2, 2, colorSkin);
          
          if (id === CharacterId.ED_FISICA) {
            // Blue LED Smart tracker watch on coach wrist
            drawPixel(startX + 8, startY + shirtY + 5, '#22d3ee');
          }
        } else if (col === 2) {
          drawRect(startX + 8, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 8, startY + shirtY + 4, 2, 2, colorShirtShadow);
          drawRect(startX + 8, startY + shirtY + 6, 2, 2, colorSkin);
          
          drawRect(startX + 22, startY + shirtY + 1, 2, 4, colorShirt);
          drawRect(startX + 22, startY + shirtY + 3, 2, 2, colorShirtShadow);
          drawRect(startX + 22, startY + shirtY + 5, 2, 2, colorSkin);
          
          if (id === CharacterId.ED_FISICA) {
            drawPixel(startX + 23, startY + shirtY + 5, '#22d3ee');
          }
        } else {
          drawRect(startX + 8, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 8, startY + shirtY + 4, 1, 2, colorShirtShadow);
          drawRect(startX + 8, startY + shirtY + 6, 2, 2, colorSkin);
          
          drawRect(startX + 22, startY + shirtY + 2, 2, 4, colorShirt);
          drawRect(startX + 23, startY + shirtY + 4, 1, 2, colorShirtShadow);
          drawRect(startX + 22, startY + shirtY + 6, 2, 2, colorSkin);
        }
      } else if (drawRow === 1) {
        drawRect(startX + 11, startY + shirtY, 9, 7, colorShirt);
        drawRect(startX + 11, startY + shirtY + 5, 9, 2, colorShirtShadow);

        if (customNeckItem === 'tie') {
          drawRect(startX + 11, startY + shirtY + 1, 1, 4, '#dc2626');
        } else if (customNeckItem === 'scarf') {
          drawRect(startX + 11, startY + shirtY, 2, 3, '#dc2626');
        }

        if (col === 0) {
          drawRect(startX + 9, startY + shirtY + 2, 4, 3, colorShirt);
          drawRect(startX + 9, startY + shirtY + 4, 4, 1, colorShirtShadow);
          drawRect(startX + 7, startY + shirtY + 3, 2, 2, colorSkin);
        } else if (col === 2) {
          drawRect(startX + 17, startY + shirtY + 2, 4, 3, colorShirt);
          drawRect(startX + 17, startY + shirtY + 4, 4, 1, colorShirtShadow);
          drawRect(startX + 21, startY + shirtY + 3, 2, 2, colorSkin);
        } else {
          drawRect(startX + 13, startY + shirtY + 2, 3, 4, colorShirt);
          drawRect(startX + 13, startY + shirtY + 5, 3, 1, colorShirtShadow);
          drawRect(startX + 13, startY + shirtY + 6, 3, 2, colorSkin);
        }
      }

      // ---- 5. PANTS/SKIRT SPLIT ----
      if (drawRow === 0 || drawRow === 3) {
        drawRect(startX + 10, startY + pantsY, 12, isGirl ? 4 : 3, colorPants);
        drawRect(startX + 10, startY + pantsY + (isGirl ? 3 : 2), 12, 1, colorPantsShadow);
        if (isGirl && drawRow === 0) {
          drawRect(startX + 12, startY + pantsY + 1, 1, 3, colorPantsShadow);
          drawRect(startX + 15, startY + pantsY + 1, 1, 3, colorPantsShadow);
          drawRect(startX + 18, startY + pantsY + 1, 1, 3, colorPantsShadow);
        }
      } else if (drawRow === 1) {
        drawRect(startX + 11, startY + pantsY, 9, isGirl ? 4 : 3, colorPants);
        drawRect(startX + 11, startY + pantsY + (isGirl ? 3 : 2), 9, 1, colorPantsShadow);
      }

      // ---- 6. RUNNING CYCLES LEGS & SHOES ----
      const legColor = (id === CharacterId.ARTES) ? colorSkin : colorPants;
      const legShadowColor = (id === CharacterId.ARTES) ? colorSkinShadow : colorPantsShadow;
      const legY = pantsY + (isGirl ? 4 : 3);
      if (drawRow === 0 || drawRow === 3) {
        if (col === 0) {
          drawRect(startX + 11, startY + legY, 3, 2, legColor);
          drawRect(startX + 11, startY + legY, 1, 2, legShadowColor);
          drawRect(startX + 11, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 3, 3, 1, '#ffffff'); // crisp soles

          drawRect(startX + 18, startY + legY, 3, 3, legColor);
          drawRect(startX + 18, startY + legY, 1, 3, legShadowColor);
          drawRect(startX + 18, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 18, startY + legY + 4, 3, 1, '#ffffff'); // crisp soles
        } else if (col === 2) {
          drawRect(startX + 11, startY + legY, 3, 3, legColor);
          drawRect(startX + 11, startY + legY, 1, 3, legShadowColor);
          drawRect(startX + 11, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 4, 3, 1, '#ffffff');

          drawRect(startX + 18, startY + legY, 3, 2, legColor);
          drawRect(startX + 18, startY + legY, 1, 2, legShadowColor);
          drawRect(startX + 18, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 18, startY + legY + 3, 3, 1, '#ffffff');
        } else {
          drawRect(startX + 11, startY + legY, 3, 3, legColor);
          drawRect(startX + 11, startY + legY, 1, 3, legShadowColor);
          drawRect(startX + 11, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 4, 3, 1, '#ffffff');

          drawRect(startX + 18, startY + legY, 3, 3, legColor);
          drawRect(startX + 18, startY + legY, 1, 3, legShadowColor);
          drawRect(startX + 18, startY + legY + 3, 3, 2, colorShoes);
          drawRect(startX + 18, startY + legY + 4, 3, 1, '#ffffff');
        }
      } else if (drawRow === 1) {
        if (col === 0) {
          drawRect(startX + 9, startY + legY, 3, 3, legColor);
          drawRect(startX + 9, startY + legY, 1, 3, legShadowColor);
          drawRect(startX + 8, startY + legY + 3, 4, 2, colorShoes);
          drawRect(startX + 8, startY + legY + 4, 4, 1, '#ffffff');

          drawRect(startX + 15, startY + legY, 3, 2, legColor);
          drawRect(startX + 15, startY + legY, 1, 2, legShadowColor);
          drawRect(startX + 15, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 15, startY + legY + 3, 3, 1, '#ffffff');
        } else if (col === 2) {
          drawRect(startX + 11, startY + legY, 3, 2, legColor);
          drawRect(startX + 11, startY + legY, 1, 2, legShadowColor);
          drawRect(startX + 11, startY + legY + 2, 3, 2, colorShoes);
          drawRect(startX + 11, startY + legY + 3, 3, 1, '#ffffff');

          drawRect(startX + 17, startY + legY, 3, 3, legColor);
          drawRect(startX + 17, startY + legY, 1, 3, legShadowColor);
          drawRect(startX + 16, startY + legY + 3, 4, 2, colorShoes);
          drawRect(startX + 16, startY + legY + 4, 4, 1, '#ffffff');
        } else {
          drawRect(startX + 12, startY + legY, 4, 3, legColor);
          drawRect(startX + 12, startY + legY, 1, 3, legShadowColor);
          drawRect(startX + 12, startY + legY + 3, 4, 2, colorShoes);
          drawRect(startX + 12, startY + legY + 4, 4, 1, '#ffffff');
        }
      }

      ctx.restore();
    }
  }

  return canvas;
}

// Static builder to generate pixel-art enemy and boss sprite sheets of exactly 96x128 pixels (3x4 grid of 32x32 frames)
export function createEnemySpriteSheet(type: EnemyType): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 96;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.clearRect(0, 0, 96, 128);

  const drawPixel = (px: number, py: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, 1, 1);
  };

  const drawRect = (px: number, py: number, w: number, h: number, color: string) => {
    ctx.fillStyle = color;
    ctx.fillRect(px, py, w, h);
  };

  const colorSkin = '#fed7aa';

  // Draw 12 frames (3 columns x 4 rows)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const startX = col * 32;
      const startY = row * 32;

      ctx.save();
      
      // Symmetrical profile views: Row 2 (Right) mirrors Row 1 (Left)
      if (row === 2) {
        ctx.translate(startX + 16, startY + 16);
        ctx.scale(-1, 1);
        ctx.translate(-(col * 32 + 16), -(row * 32 + 16));
      }

      const drawRow = row === 2 ? 1 : row;

      // Step bounce offsets: frames 0 and 2 are stepping down 1px
      const isStep = col !== 1;
      const bounceY = isStep ? 1 : 0;
      const mainY = 4 + bounceY;

      if (type === EnemyType.FORMULARIO_INFINITO) {
        const ox = 7;
        const oy = mainY;
        drawRect(startX + ox, startY + oy, 18, 20, '#f8fafc'); 
        drawRect(startX + ox + 3, startY + oy + 1, 1, 18, '#f43f5e');
        for (let l = 0; l < 5; l++) {
          drawRect(startX + ox + 5, startY + oy + 4 + l * 3, 10, 1, '#93c5fd');
        }
        drawRect(startX + ox + 4, startY + oy + 3, 2, 2, '#3b82f6');
        drawRect(startX + ox + 11, startY + oy + 3, 2, 2, '#3b82f6');
        drawRect(startX + ox + 5, startY + oy + 2, 8, 1, '#1e3a8a'); 
        drawRect(startX + ox, startY + oy + 18, 18, 2, '#cbd5e1'); 
        drawRect(startX + ox + 15, startY + oy, 3, 3, '#94a3b8');
      } 
      else if (type === EnemyType.DIARIO_ATRASADO) {
        const ox = 6;
        const oy = mainY;
        drawRect(startX + ox, startY + oy, 20, 20, '#1d4ed8'); 
        drawRect(startX + ox + 9, startY + oy + 18, 2, 5, '#fbbf24');
        if (drawRow !== 1) { 
          for (let s = 0; s < 6; s++) {
            drawRect(startX + ox - 2, startY + oy + 2 + s * 3, 3, 2, '#cbd5e1');
            drawRect(startX + ox - 1, startY + oy + 3 + s * 3, 1, 1, '#64748b');
          }
        } else {
          drawRect(startX + ox + 18, startY + oy + 1, 3, 18, '#f1f5f9');
        }
        drawRect(startX + ox + 6, startY + oy + 8, 8, 4, '#fbbf24');
        drawRect(startX + ox + 8, startY + oy + 9, 4, 2, '#b45309');
        drawRect(startX + ox + 5, startY + oy + 4, 10, 2, '#ef4444');
      } 
      else if (type === EnemyType.CONVOCACAO_REUNIAO) {
        const ox = 8;
        const oy = mainY + 4;
        drawRect(startX + ox, startY + oy, 16, 11, '#ffffff');
        drawRect(startX + ox, startY + oy, 16, 1, '#ef4444');
        drawRect(startX + ox, startY + oy + 10, 16, 1, '#ef4444');
        
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX + ox, startY + oy);
        ctx.lineTo(startX + ox + 8, startY + oy + 6);
        ctx.lineTo(startX + ox + 16, startY + oy);
        ctx.stroke();
        
        drawRect(startX + ox + 7, startY + oy + 5, 2, 2, '#dc2626');
        
        const flap = col === 0 ? -3 : (col === 2 ? 3 : 0);
        drawRect(startX + ox - 6, startY + oy + flap, 6, 4, '#cbd5e1');
        drawRect(startX + ox - 4, startY + oy + flap + 1, 4, 2, '#94a3b8');
        drawRect(startX + ox + 16, startY + oy + flap, 6, 4, '#cbd5e1');
        drawRect(startX + ox + 16, startY + oy + flap + 1, 4, 2, '#94a3b8');
      } 
      else if (type === EnemyType.MINION_TAREFA_EXTRA) {
        const ox = 10;
        const oy = mainY + 4;
        drawRect(startX + ox, startY + oy, 12, 14, '#fbcfe8'); 
        drawRect(startX + ox + 2, startY + oy + 2, 8, 1, '#1e293b');
        drawRect(startX + ox + 3, startY + oy + 5, 6, 1, '#1e293b');
        drawRect(startX + ox + 2, startY + oy + 8, 7, 1, '#ef4444'); 
        
        const legLeftY = oy + 14 + (col === 0 ? -2 : 0);
        const legRightY = oy + 14 + (col === 2 ? -2 : 0);
        drawRect(startX + ox + 2, startY + legLeftY, 2, 3, '#020617');
        drawRect(startX + ox + 8, startY + legRightY, 2, 3, '#020617');
      } 
      else if (type === EnemyType.ARTICULADORA_PEDAGOGICA) {
        const headY = 4 + bounceY;
        const bodyY = 16 + bounceY;
        const legsY = 24 + bounceY;

        // 1. Hair Bun with Diagonal Pencil stuck through it (Satirical school teacher bun)
        if (drawRow !== 3) {
          // Hair stick pencil yellow-red crossing
          drawRect(startX + 10, startY + headY - 6, 2, 2, '#f59e0b'); // pencil body
          drawPixel(startX + 9, startY + headY - 7, '#ef4444');  // eraser top left
          drawPixel(startX + 12, startY + headY - 5, '#1e293b');  // lead tip bottom right
          drawRect(startX + 13, startY + headY - 5, 5, 5, '#6d28d9'); // huge elegant violet bun
        } else {
          drawRect(startX + 13, startY + headY - 5, 5, 5, '#6d28d9');
          drawRect(startX + 10, startY + headY - 6, 2, 2, '#f59e0b');
        }

        // 2. Head with statement cat-eye glasses, purple hair, and analytical expression
        if (drawRow === 3) {
          drawRect(startX + 9, startY + headY, 14, 12, '#6d28d9'); // back-side purple hair
          drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkin); 
        } else if (drawRow === 1) {
          drawRect(startX + 10, startY + headY, 12, 12, colorSkin);
          drawRect(startX + 13, startY + headY, 9, 12, '#6d28d9'); // combed back hair
          drawRect(startX + 10, startY + headY, 10, 3, '#6d28d9'); // hair fringe
          drawRect(startX + 12, startY + headY + 12, 5, 2, colorSkin); 
          drawPixel(startX + 11, startY + headY + 5, '#db2777'); // bright pink glasses rim
          drawPixel(startX + 12, startY + headY + 5, '#000000'); // small eye
        } else {
          drawRect(startX + 9, startY + headY, 14, 12, colorSkin);
          drawRect(startX + 9, startY + headY, 14, 3, '#6d28d9'); 
          drawRect(startX + 8, startY + headY + 3, 2, 7, '#6d28d9'); 
          drawRect(startX + 22, startY + headY + 3, 2, 7, '#6d28d9'); 
          drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkin); 

          // Big statement cat-eye glasses (pink/violet)
          drawRect(startX + 10, startY + headY + 4, 4, 3, '#db2777'); 
          drawRect(startX + 18, startY + headY + 4, 4, 3, '#db2777'); 
          drawPixel(startX + 11, startY + headY + 5, '#000000'); 
          drawPixel(startX + 19, startY + headY + 5, '#000000'); 
          drawRect(startX + 14, startY + headY + 5, 4, 1, '#db2777'); 
          
          drawPixel(startX + 9, startY + headY + 7, '#f43f5e'); // red blushing cheeks
          drawPixel(startX + 22, startY + headY + 7, '#f43f5e'); 
          drawRect(startX + 14, startY + headY + 9, 4, 1, '#b91c1c'); // strict pursed mouth
        }

        // 3. Clothing & Accessories (Accumulated school projects & Accordion portfolio)
        if (drawRow === 1) {
          drawRect(startX + 11, startY + bodyY, 9, 8, '#7c3aed'); // Violet teacher coat
          drawRect(startX + 10, startY + bodyY + 1, 2, 6, '#ffffff'); // clean white collar
          // Accordion folder (pasta sanfonada) under arm
          drawRect(startX + 14, startY + bodyY + 2, 6, 6, '#4f46e5'); // indigo casing
          drawPixel(startX + 15, startY + bodyY + 1, '#10b981'); // green tab
          drawPixel(startX + 17, startY + bodyY + 1, '#f97316'); // orange tab
          drawPixel(startX + 19, startY + bodyY + 1, '#ec4899'); // pink tab
        } else {
          drawRect(startX + 9, startY + bodyY, 14, 8, '#7c3aed'); // Violet blazer coat
          drawRect(startX + 13, startY + bodyY, 6, 5, '#ffffff'); // White blouse inside
          // Golden teacher credentials lanyard
          drawRect(startX + 12, startY + bodyY + 3, 1, 4, '#eab308'); 
          drawRect(startX + 19, startY + bodyY + 3, 1, 4, '#eab308'); 
          drawRect(startX + 14, startY + bodyY + 6, 4, 2, '#3b82f6'); // blue school credentials badge

          // Right arm holding a multi-colored tall stack of reports (very busy)
          drawRect(startX + 21, startY + bodyY + 1, 6, 7, '#f8fafc'); 
          drawPixel(startX + 23, startY + bodyY + 3, '#ef4444'); // red fail marks "F"
          drawPixel(startX + 25, startY + bodyY + 5, '#22c55e'); // green checkmarks
        }

        // 4. Skirt and fast-paced stylish purple school shoes
        drawRect(startX + 10, startY + legsY, 12, 3, '#1e293b'); 
        const stepOffset = col === 0 ? -2 : (col === 2 ? 0 : -1);
        
        drawRect(startX + 11, startY + legsY + 3, 3, 3, colorSkin);
        drawRect(startX + 11, startY + legsY + 5, 3, 3, '#7c3aed'); 
        
        drawRect(startX + 18, startY + legsY + 3 + stepOffset, 3, 3, colorSkin);
        drawRect(startX + 18, startY + legsY + 5 + stepOffset, 3, 3, '#7c3aed'); 
      } 
      else if (type === EnemyType.COORDENADOR_ESCOLAR) {
        const headY = 4 + bounceY;
        const bodyY = 16 + bounceY;
        const legsY = 24 + bounceY;
        
        // 1. Head with tensed combed gray hair, sliding-down square reading glasses, and high stress sweat drop
        if (drawRow === 3) {
          drawRect(startX + 9, startY + headY, 14, 12, '#4b5563'); // combed steel gray hair
          drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkin);
        } else if (drawRow === 1) {
          drawRect(startX + 10, startY + headY, 12, 12, colorSkin);
          drawRect(startX + 13, startY + headY, 9, 12, '#4b5563'); // parted gray hair
          drawRect(startX + 11, startY + headY, 10, 3, '#4b5563'); 
          drawRect(startX + 12, startY + headY + 12, 5, 2, colorSkin);
          drawRect(startX + 10, startY + headY + 6, 2, 2, '#475569'); // heavy eyeglasses frame
          drawPixel(startX + 11, startY + headY + 5, '#000000'); 
        } else {
          drawRect(startX + 9, startY + headY, 14, 12, colorSkin);
          drawRect(startX + 9, startY + headY, 14, 3, '#4b5563'); 
          drawRect(startX + 8, startY + headY + 3, 2, 5, '#4b5563'); 
          drawRect(startX + 22, startY + headY + 3, 2, 5, '#4b5563'); 
          drawRect(startX + 13, startY + headY + 12, 6, 2, colorSkin);
          
          // Sliding square reading glasses
          drawRect(startX + 11, startY + headY + 5, 4, 3, '#475569'); 
          drawRect(startX + 17, startY + headY + 5, 4, 3, '#475569'); 
          drawPixel(startX + 12, startY + headY + 6, '#ffffff'); // reflection details
          drawPixel(startX + 18, startY + headY + 6, '#ffffff'); 
          drawRect(startX + 15, startY + headY + 6, 2, 1, '#475569'); // glasses bridge

          // Satirical stress blue sweat drop on forehead temple (reflects school coordinator exhaustion)
          drawPixel(startX + 20, startY + headY + 3, '#0284c7'); 
          drawPixel(startX + 21, startY + headY + 4, '#38bdf8'); 
          
          drawRect(startX + 13, startY + headY + 10, 6, 1, '#1e293b'); // super tensed straight line mouth
        }
        
        // 2. Clothing & Professional items (Walkie-talkie & giant ring of keys and blacklist list)
        if (drawRow === 1) {
          drawRect(startX + 11, startY + bodyY, 9, 8, '#ea580c'); // Bright orange coordinator uniform polo
          drawRect(startX + 10, startY + bodyY + 1, 2, 4, '#1e293b'); // Walkie-talkie receiver on left pocket
          drawPixel(startX + 10, startY + bodyY, '#38bdf8'); // active flashing status LED
          
          // Right arm holding giant keyholder ring with dangling keys (molho de chaves)
          drawRect(startX + 14, startY + bodyY + 2, 4, 3, '#ea580c'); 
          drawRect(startX + 17, startY + bodyY + 4, 4, 4, '#94a3b8'); // iron ring
          drawPixel(startX + 18, startY + bodyY + 8, '#ca8a04'); // dangling house/school golden key
          drawPixel(startX + 20, startY + bodyY + 7, '#64748b'); // silver classroom key
        } else {
          drawRect(startX + 9, startY + bodyY, 14, 8, '#ea580c'); // Pumpkin orange uniform jacket
          drawRect(startX + 11, startY + bodyY, 4, 8, '#f3f4f6'); // polo under-V
          drawRect(startX + 14, startY + bodyY, 4, 8, '#1e293b'); // official school ID tie banner

          // Left hand holding the suspended list paper (Lista de Indisciplinados)
          drawRect(startX + 4, startY + bodyY + 2, 5, 2, '#ea580c'); 
          drawRect(startX + 2, startY + bodyY + 3, 4, 5, '#f8fafc'); 
          drawRect(startX + 2, startY + bodyY + 4, 3, 1, '#ef4444');  // scary red crossing lines
          
          // Right hand holding bulk black walkie-talkie radio speaker
          drawRect(startX + 23, startY + bodyY + 2, 5, 2, '#ea580c'); 
          drawRect(startX + 26, startY + bodyY + 1, 3, 5, '#18181b'); // speaker body
          drawRect(startX + 27, startY + bodyY - 1, 1, 2, '#18181b'); // long antenna
          drawPixel(startX + 26, startY + bodyY + 1, '#ef4444'); // red scanning light
        }
        
        // 3. Legs running frantically to enforce standard policies
        drawRect(startX + 10, startY + legsY, 12, 4, '#1e293b'); 
        
        const stepOffset = col === 2 ? -2 : (col === 0 ? 0 : -1);
        drawRect(startX + 11, startY + legsY + 4 + stepOffset, 3, 3, colorSkin);
        drawRect(startX + 11, startY + legsY + 7 + stepOffset, 3, 2, '#020617'); // black administrative shoes
        drawRect(startX + 18, startY + legsY + 4, 3, 3, colorSkin);
        drawRect(startX + 18, startY + legsY + 7, 3, 2, '#020617'); 
      }      else if (type === EnemyType.CHEF_CONSELHO_DEC_LASSE) {
        // --- CONSELHO DE CLASSE: O "Grande Inquisidor" (Diretor Geral Severo) ---
        // An elderly man, impeccable posture, black formal suit, extremely judging eyes,
        // floating over a massive luxury leather swivel office chair.
        const hoverY = bounceY - 1; // floats/hovers smoothly
        const headY = 3 + hoverY;
        const bodyY = 15 + hoverY;

        // 1. Double executive high-back office chair behind him
        drawRect(startX + 6, startY + headY - 2, 20, 18, '#3f1c1c'); // Maroon leather chair back
        drawRect(startX + 8, startY + headY - 4, 16, 2, '#ca8a04'); // Golden top trim of luxury chair
        drawRect(startX + 5, startY + bodyY + 3, 2, 7, '#1e293b'); // Armrest left
        drawRect(startX + 25, startY + bodyY + 3, 2, 7, '#1e293b'); // Armrest right
        
        // Chair silver wheels & stand below
        drawRect(startX + 15, startY + bodyY + 9, 2, 5, '#94a3b8'); // steel cylinder
        drawRect(startX + 11, startY + bodyY + 13, 10, 2, '#475569'); // wheel base
        
        // Let's use drawing operations for key wheels
        ctx.fillStyle = '#020617';
        ctx.beginPath(); ctx.arc(startX + 12, startY + bodyY + 15, 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(startX + 20, startY + bodyY + 15, 1.5, 0, Math.PI * 2); ctx.fill();

        // 2. Elder's head (profile side views mirror automatically)
        drawRect(startX + 10, startY + headY, 12, 12, colorSkin);
        drawRect(startX + 9, startY + headY, 14, 3, '#e2e8f0'); // Crisp white-grey hair on top
        drawRect(startX + 9, startY + headY + 3, 2, 6, '#e2e8f0'); // hair sides L
        drawRect(startX + 21, startY + headY + 3, 2, 6, '#e2e8f0'); // hair sides R

        // Judgment glasses and eyes
        drawRect(startX + 11, startY + headY + 4, 10, 2, '#000000'); // black glasses brim
        drawPixel(startX + 13, startY + headY + 5, '#ef4444'); // Glowing red judgmental eye L
        drawPixel(startX + 18, startY + headY + 5, '#ef4444'); // Glowing red judgmental eye R
        drawRect(startX + 13, startY + headY + 8, 6, 1, '#991b1b'); // Grim lips

        // 3. Impeccable formal black suit
        drawRect(startX + 8, startY + bodyY, 16, 9, '#18181b'); // Black jacket body
        drawRect(startX + 14, startY + bodyY, 4, 9, '#ffffff'); // White formal shirt base
        drawRect(startX + 15, startY + bodyY + 2, 2, 6, '#dc2626'); // Red executive tie

        // Arm pointing / gesturing
        if (col === 0) {
          drawRect(startX + 4, startY + bodyY + 2, 5, 3, '#18181b'); // pointing left arm
          drawRect(startX + 2, startY + bodyY + 2, 2, 2, colorSkin); // pointed finger
        } else {
          drawRect(startX + 23, startY + bodyY + 2, 5, 3, '#18181b'); // pointing right arm
          drawRect(startX + 28, startY + bodyY + 2, 2, 2, colorSkin); // pointed finger
        }
      } 
      else if (type === EnemyType.CHEF_SABADO_LETIVO) {
        // --- SÁBADO LETIVO: O "Fiscal do Fim de Semana" (Burocrata Zumbi Exausto) ---
        // Amassed suit, loose tie, deep purple olheiras, giant coffee mug, digital time clock bound to back.
        const headY = 4 + bounceY;
        const bodyY = 16 + bounceY;
        const legsY = 24 + bounceY;

        // 1. Digital Time Card machine mounted on back
        drawRect(startX + 5, startY + bodyY - 4, 6, 14, '#3f3f46'); // dark blue/grey box
        drawRect(startX + 6, startY + bodyY - 2, 4, 3, '#f43f5e'); // Glowing red LED status
        drawRect(startX + 6, startY + bodyY + 2, 4, 1, '#10b981'); // digital green active line

        // 2. Head with hollow purple eye-sockets (Zumbi)
        drawRect(startX + 9, startY + headY, 14, 12, '#a7f3d0'); // Pale greenish zumbi skin
        drawRect(startX + 9, startY + headY, 14, 3, '#4b5563'); // messy dark grey hair
        
        // Deep purple bags under eyes
        drawRect(startX + 10, startY + headY + 4, 4, 3, '#701a75'); // purple left bag
        drawRect(startX + 18, startY + headY + 4, 4, 3, '#701a75'); // purple right bag
        drawPixel(startX + 11, startY + headY + 5, '#ffffff'); // tiny dead eye dot L
        drawPixel(startX + 19, startY + headY + 5, '#ffffff'); // tiny dead eye dot R
        drawRect(startX + 12, startY + headY + 9, 8, 1, '#020617'); // mouth

        // 3. Amassed Grey/Blue suit and loose red tie
        drawRect(startX + 9, startY + bodyY, 14, 8, '#475569'); // amassed grey blazer
        drawRect(startX + 13, startY + bodyY, 6, 8, '#f1f5f9'); // disordered white shirt showing
        drawRect(startX + 14, startY + bodyY + 3, 2, 5, '#dc2626'); // messy crooked red tie

        // 4. Giant orange Coffee Mug (never empties) - FIXED to the right hand (no hand switching!)
        drawRect(startX + 19, startY + bodyY + 3, 4, 3, '#475569'); // right arm holding mug
        drawRect(startX + 22, startY + bodyY + 1, 7, 7, '#d97706'); // giant mug
        drawRect(startX + 24, startY + bodyY - 1, 3, 2, '#78350f'); // coffee boiling rim
        drawRect(startX + 27, startY + bodyY + 3, 2, 3, '#d97706'); // handle

        // Draw relaxed left arm as well so it is anatomically stable
        drawRect(startX + 5, startY + bodyY + 2, 4, 3, '#475569'); // left arm

        // 5. Tired legs shuffling
        drawRect(startX + 10, startY + legsY, 12, 4, '#334155');
        const stepOffset = col === 0 ? -2 : 0;
        drawRect(startX + 11, startY + legsY + 4, 4, 3, '#1e293b');
        drawRect(startX + 17, startY + legsY + 4 + stepOffset, 4, 3, '#1e293b');
      } 
      else if (type === EnemyType.CHEF_SEMANA_PEDAGOGICA) {
        // --- SEMANA PEDAGÓGICA: A "Palestrante Motivacional Coach" ---
        // Blazer rosa-choque, sorriso ultraforçado, microfone de lapela, passador de slides.
        const headY = 4 + bounceY;
        const bodyY = 16 + bounceY;
        const legsY = 24 + bounceY;

        // 1. Head with crazy styled hair and huge static smile
        drawRect(startX + 9, startY + headY, 14, 12, colorSkin);
        drawRect(startX + 8, startY + headY - 2, 16, 4, '#b45309'); // tall styled caramel/golden curly hair
        drawRect(startX + 7, startY + headY, 2, 8, '#b45309'); // hair left flow
        drawRect(startX + 23, startY + headY, 2, 8, '#b45309'); // hair right flow

        // Over-excited green eyes
        drawPixel(startX + 12, startY + headY + 4, '#22c55e');
        drawPixel(startX + 19, startY + headY + 4, '#22c55e');

        // Massive forced white smile
        drawRect(startX + 11, startY + headY + 7, 10, 3, '#ffffff'); // white teeth
        drawRect(startX + 10, startY + headY + 7, 12, 1, '#ec4899'); // lips top
        drawRect(startX + 10, startY + headY + 10, 12, 1, '#ec4899'); // lips bottom

        // Lapel mic wire
        drawPixel(startX + 15, startY + headY + 11, '#020617'); // microphone dot

        // 2. Hot-pink blazer (Blazer rosa-choque)
        drawRect(startX + 8, startY + bodyY, 16, 8, '#ec4899'); // Hot pink body
        drawRect(startX + 12, startY + bodyY, 8, 8, '#ffffff'); // V-neck white blouse under
        drawRect(startX + 15, startY + bodyY + 3, 2, 1, '#020617'); // black lapel clip

        // Hands doing motivational things and holding clicker
        if (col === 0) {
          // waving left hand
          drawRect(startX + 4, startY + bodyY - 1, 4, 3, '#ec4899');
          drawRect(startX + 3, startY + bodyY - 3, 3, 3, colorSkin); // high hand
          // right hand holding black clicker with glowing green laser point
          drawRect(startX + 24, startY + bodyY + 2, 4, 3, '#ec4899');
          drawRect(startX + 27, startY + bodyY + 2, 2, 2, '#020617'); // clicker
          drawPixel(startX + 29, startY + bodyY + 2, '#22c55e'); // laser point green
        } else {
          // left hand clicker
          drawRect(startX + 4, startY + bodyY + 2, 4, 3, '#ec4899');
          drawRect(startX + 2, startY + bodyY + 2, 2, 2, '#020617'); // clicker
          drawPixel(startX + 0, startY + bodyY + 2, '#22c55e'); // laser point green
          // waving right hand
          drawRect(startX + 24, startY + bodyY - 1, 4, 3, '#ec4899');
          drawRect(startX + 26, startY + bodyY - 3, 3, 3, colorSkin); // high hand
        }

        // 3. Executive pants and shoes moving frantically
        drawRect(startX + 9, startY + legsY, 14, 4, '#1e293b'); // grey pants
        const jumpY = col !== 1 ? -2 : 0; // bouncy energetic steps
        drawRect(startX + 10, startY + legsY + 4 + jumpY, 4, 3, '#ec4899'); // hot pink high heels L
        drawRect(startX + 18, startY + legsY + 4 - jumpY, 4, 3, '#ec4899'); // hot pink high heels R
      } 
      else if (type === EnemyType.CHEF_FECHAMENTO_UNIDADE) {
        // --- FECHAMENTO DE UNIDADE: O "Secretário do Apocalipse" (Sleek executive human bureaucrat) ---
        const headY = 3 + bounceY;
        const bodyY = 15 + bounceY;
        const legsY = 25 + bounceY;

        // 1. Dark executive cloak/suit tail hanging behind
        drawRect(startX + 9, startY + bodyY + 1, 14, 11, '#0f172a'); // long sleek jacket back

        // 2. Elegant humanized head: skin, neat silver/black combed hair, and thin designer glasses
        drawRect(startX + 10, startY + headY, 12, 12, colorSkin); // Skin
        drawRect(startX + 9, startY + headY, 14, 4, '#1e293b'); // Combed dark hair
        drawRect(startX + 21, startY + headY + 4, 1, 5, '#1e293b'); // Hair backburn L
        drawRect(startX + 10, startY + headY + 4, 1, 5, '#1e293b'); // Hair backburn R

        // Judgment eyes & thin glasses
        drawRect(startX + 11, startY + headY + 5, 3, 3, '#dc2626'); // Red glowing lenses representing deadline pressure
        drawRect(startX + 18, startY + headY + 5, 3, 3, '#dc2626'); 
        drawPixel(startX + 12, startY + headY + 6, '#ffffff'); // glare
        drawPixel(startX + 19, startY + headY + 6, '#ffffff');
        drawRect(startX + 14, startY + headY + 6, 4, 1, '#0f172a'); // bridge

        drawRect(startX + 13, startY + headY + 12, 6, 3, colorSkin); // Elegant neck

        // 3. Luxurious slim navy blue blazer with golden buttons and tie
        drawRect(startX + 10, startY + bodyY, 12, 11, '#1e1b4b'); // deep indigo/navy blazer
        drawRect(startX + 14, startY + bodyY, 4, 11, '#ffffff'); // white dress shirt underneath
        drawRect(startX + 15, startY + bodyY + 2, 2, 6, '#ef4444'); // red tie of doom
        drawPixel(startX + 15, startY + bodyY + 9, '#fbbf24'); // golden button
        drawPixel(startX + 15, startY + bodyY + 11, '#fbbf24'); // golden button

        // 4. Time pressure accessory: A gold pocket-style medallion clock hanging on his chest tie
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(startX + 16, startY + bodyY + 7, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#eab308'; // Gold casing
        ctx.lineWidth = 1;
        ctx.stroke();
        // Clock small hands
        drawPixel(startX + 16, startY + bodyY + 6, '#0f172a');
        drawPixel(startX + 17, startY + bodyY + 7, '#0f172a');

        // 5. Wearing a luxury dark brown clipboard containing report pages (holding in hand)
        if (col === 0) {
          // Left hand holds clipboard
          drawRect(startX + 4, startY + bodyY + 2, 5, 3, '#1e1b4b'); // arm
          drawRect(startX + 2, startY + bodyY + 1, 3, 7, '#78350f'); // clipboard wood
          drawRect(startX + 3, startY + bodyY + 2, 2, 5, '#f8fafc'); // sheet of reports
          drawPixel(startX + 3, startY + bodyY + 1, '#1e293b'); // clip
        } else {
          // Right hand holds clipboard
          drawRect(startX + 23, startY + bodyY + 2, 5, 3, '#1e1b4b'); // arm
          drawRect(startX + 27, startY + bodyY + 1, 3, 7, '#78350f'); // clipboard wood
          drawRect(startX + 27, startY + bodyY + 2, 2, 5, '#f8fafc'); // sheet of reports
          drawPixel(startX + 27, startY + bodyY + 1, '#1e293b'); // clip
        }

        // 6. Polished suit legs and shoes moving majestically
        drawRect(startX + 11, startY + legsY, 10, 4, '#0f172a'); // sleek trousers
        const stepOffset = col === 1 ? -2 : 0;
        drawRect(startX + 11, startY + legsY + 4, 3, 3, '#1e1b4b'); // left pant leg
        drawRect(startX + 11, startY + legsY + 7 + stepOffset, 3, 2, '#0f172a'); // shoeL
         drawRect(startX + 18, startY + legsY + 4, 3, 3, '#1e1b4b'); // right pant leg
        drawRect(startX + 18, startY + legsY + 7 - stepOffset, 3, 2, '#0f172a'); // shoeR
      }

      ctx.restore();
    }
  }

  return canvas;
}

interface BossSpritePreviewProps {
  bossType: EnemyType;
  enemySpriteSheets: Record<string, HTMLCanvasElement>;
  studentSpriteSheets?: Record<string, HTMLCanvasElement>;
}

function BossSpritePreview({ bossType, enemySpriteSheets, studentSpriteSheets }: BossSpritePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let active = true;
    let animId: number;

    const render = () => {
      if (!active) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 96, 96);
          ctx.imageSmoothingEnabled = false;

          let displayBossType = bossType;
          if (bossType === EnemyType.DIARIO_ATRASADO) {
            displayBossType = EnemyType.COORDENADOR_ESCOLAR;
          } else if (bossType === EnemyType.FORMULARIO_INFINITO) {
            displayBossType = EnemyType.ARTICULADORA_PEDAGOGICA;
          } else if (bossType === EnemyType.CONVOCACAO_REUNIAO) {
            displayBossType = EnemyType.COORDENADOR_ESCOLAR;
          }

          let srcCanvas: HTMLCanvasElement | undefined = enemySpriteSheets[displayBossType];
          if (!srcCanvas && studentSpriteSheets) {
            let studentKey = '';
            if (bossType === EnemyType.ALUNO_DO_FUNDAO) studentKey = 'aluno_04';
            else if (bossType === EnemyType.ALUNO_VAI_VALER_NOTA) studentKey = 'aluno_02';
            else if (bossType === EnemyType.ALUNO_DISTRAIDO) studentKey = 'aluno_01';
            else if (bossType === EnemyType.ALUNO_E_PRA_COPIAR) studentKey = 'aluno_03';
            
            if (studentKey) {
              srcCanvas = studentSpriteSheets[studentKey];
            }
          }

          if (srcCanvas) {
            // Animated talking loop: toggle columns in the sprite sheet over time
            const frameCol = Math.floor(Date.now() / 120) % 3;
            // Speech bubble vertical wobble (moves 0px or 2px up and down over time)
            const wobbleY = Math.floor(Date.now() / 240) % 2 === 0 ? 0 : 2;

            ctx.drawImage(srcCanvas, frameCol * 32, 0, 32, 32, 0, wobbleY * 2, 96, 96);
          } else {
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(32, 32, 32, 32);
          }
        }
      }
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      active = false;
      cancelAnimationFrame(animId);
    };
  }, [bossType, enemySpriteSheets, studentSpriteSheets]);

  return (
    <div className="relative inline-flex p-1 bg-slate-900 border-2 border-red-600 rounded-none shadow-[2px_2px_0px_rgba(0,0,0,0.5)]">
      <span className="absolute top-1 left-1 text-[8px] text-red-500 leading-none">⚠️</span>
      <canvas 
        ref={canvasRef} 
        width="96" 
        height="96" 
        className="block w-20 h-20 bg-slate-950"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

interface ActiveGameProps {
  scenario: Scenario;
  permanentUpgrades: PermanentShopUpgrades;
  soundEnabled: boolean;
  onGameEnd: (results: { 
    victory: boolean; 
    goldGained: number; 
    defeatedCount: number; 
    survivedTime: number;
    finalLevel: number;
    scenarioType: ScenarioType;
    finalHpPercent: number;
  }) => void;
  onToggleSound: () => void;
  selectedCharacterId: CharacterId;
}

export default function ActiveGame({
  scenario,
  permanentUpgrades,
  soundEnabled,
  onGameEnd,
  onToggleSound,
  selectedCharacterId
}: ActiveGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const studentImagesRef = useRef<Record<string, HTMLImageElement>>({});
  const studentSpriteSheetsRef = useRef<Record<string, HTMLCanvasElement>>({});
  const teacherSpriteSheetsRef = useRef<Record<string, HTMLCanvasElement>>({});
  const enemySpriteSheetsRef = useRef<Record<string, HTMLCanvasElement>>({});

  // Object Pools to avoid GC overhead and reduce frame-rate spikes/latency
  const enemyPoolRef = useRef<Enemy[]>([]);
  const projectilePoolRef = useRef<Projectile[]>([]);

  const getEnemyFromPool = (etype: EnemyType, x: number, y: number): Enemy => {
    let enemy = enemyPoolRef.current.pop();
    if (enemy) {
      enemy.id = Math.random().toString(36).substr(2, 9);
      enemy.type = etype;
      enemy.x = x;
      enemy.y = y;
      enemy.summonTimer = 0;
      enemy.debuffTimer = undefined;
      enemy.angle = undefined;
    } else {
      enemy = {
        id: Math.random().toString(36).substr(2, 9),
        type: etype,
        name: 'Inimigo',
        x,
        y,
        hp: 0,
        maxHp: 0,
        speed: 0,
        damage: 0,
        xpValue: 0,
        size: 0,
        color: '#ccc',
        quoteCooldown: 0,
        isElite: false,
        isBoss: false,
        summonTimer: 0
      };
    }
    return enemy;
  };

  const getProjectileFromPool = (
    type: WeaponType,
    x: number,
    y: number,
    vx: number,
    vy: number,
    speed: number,
    damage: number,
    size: number,
    color: string,
    life: number,
    maxLife: number
  ): Projectile => {
    let p = projectilePoolRef.current.pop();
    if (p) {
      p.id = Math.random().toString(36).substr(2, 9);
      p.x = x;
      p.y = y;
      p.vx = vx;
      p.vy = vy;
      p.speed = speed;
      p.damage = damage;
      p.size = size;
      p.type = type;
      p.color = color;
      p.life = life;
      p.maxLife = maxLife;
      // Reset any extra fields
      p.px = undefined;
      p.py = undefined;
      p.angle = undefined;
      p.orbitAngle = undefined;
      p.returning = undefined;
      p.targetEnemyId = undefined;
      p.splashRadius = undefined;
      p.wordText = undefined;
      p.range = undefined;
      p.isEnemyBullet = undefined;
      p.isPaperBall = undefined;
    } else {
      p = {
        id: Math.random().toString(36).substr(2, 9),
        x,
        y,
        vx,
        vy,
        speed,
        damage,
        size,
        type,
        color,
        life,
        maxLife
      };
    }
    return p;
  };

  // Core Game State
  const [isPaused, setIsPaused] = useState(false);
  const [isLevelUpPause, setIsLevelUpPause] = useState(false);
  const [levelUpOptions, setLevelUpOptions] = useState<any[]>([]);
  const [bossAnnouncement, setBossAnnouncement] = useState<{
    type: EnemyType;
    name: string;
    subtitle: string;
    emoji: string;
    description: string;
    color: string;
    quote: string;
  } | null>(null);

  // React copies of variables for UI overlays
  const [uiStats, setUiStats] = useState<PlayerStats | null>(null);
  const [activeBoss, setActiveBoss] = useState<{
    id: string;
    name: string;
    hp: number;
    maxHp: number;
    type: EnemyType;
    color: string;
  } | null>(null);

  // Pre-generate and cache student, teacher and enemy crisp 12-frame run-cycle sprite sheets on startup (60 FPS fully animated)
  useEffect(() => {
    studentSpriteSheetsRef.current = {
      aluno_01: createStudentSpriteSheet('aluno_01'),
      aluno_02: createStudentSpriteSheet('aluno_02'),
      aluno_03: createStudentSpriteSheet('aluno_03'),
      aluno_04: createStudentSpriteSheet('aluno_04'),
    };
    teacherSpriteSheetsRef.current = {
      [CharacterId.CLASSICO]: createTeacherSpriteSheet(CharacterId.CLASSICO),
      [CharacterId.ARTES]: createTeacherSpriteSheet(CharacterId.ARTES),
      [CharacterId.ED_FISICA]: createTeacherSpriteSheet(CharacterId.ED_FISICA),
      [CharacterId.INGLES]: createTeacherSpriteSheet(CharacterId.INGLES),
    };
    enemySpriteSheetsRef.current = {
      [EnemyType.FORMULARIO_INFINITO]: createEnemySpriteSheet(EnemyType.FORMULARIO_INFINITO),
      [EnemyType.DIARIO_ATRASADO]: createEnemySpriteSheet(EnemyType.DIARIO_ATRASADO),
      [EnemyType.CONVOCACAO_REUNIAO]: createEnemySpriteSheet(EnemyType.CONVOCACAO_REUNIAO),
      [EnemyType.ARTICULADORA_PEDAGOGICA]: createEnemySpriteSheet(EnemyType.ARTICULADORA_PEDAGOGICA),
      [EnemyType.COORDENADOR_ESCOLAR]: createEnemySpriteSheet(EnemyType.COORDENADOR_ESCOLAR),
      [EnemyType.MINION_TAREFA_EXTRA]: createEnemySpriteSheet(EnemyType.MINION_TAREFA_EXTRA),
      [EnemyType.CHEF_CONSELHO_DEC_LASSE]: createEnemySpriteSheet(EnemyType.CHEF_CONSELHO_DEC_LASSE),
      [EnemyType.CHEF_SABADO_LETIVO]: createEnemySpriteSheet(EnemyType.CHEF_SABADO_LETIVO),
      [EnemyType.CHEF_SEMANA_PEDAGOGICA]: createEnemySpriteSheet(EnemyType.CHEF_SEMANA_PEDAGOGICA),
      [EnemyType.CHEF_FECHAMENTO_UNIDADE]: createEnemySpriteSheet(EnemyType.CHEF_FECHAMENTO_UNIDADE),
    };
  }, []);

  // Mutable game references designed to skip React re-renders during high-frequency cycles (60fps)
  const gameRef = useRef<{
    // Dimensions
    width: number;
    height: number;
    
    // Player
    playerX: number;
    playerY: number;
    playerHp: number;
    playerMaxHp: number;
    playerSpeed: number;
    playerLevel: number;
    playerXp: number;
    playerXpNeeded: number;
    playerGoldGained: number;
    playerTime: number; // in seconds
    playerTicks: number; // in frames (60fps)
    playerDefeated: number;
    
    // Vector controls
    moveVector: { x: number; y: number };
    
    // Attack parameters modifiers
    damageMult: number;
    speedMult: number;
    xpMult: number;
    luckMult: number;
    cooldownMult: number;
    projectileMult: number;
    rangeMult: number;
    
    // Weapons state
    weapons: Record<WeaponType, {
      type: WeaponType;
      name: string;
      level: number;
      maxLevel: number;
      damage: number;
      cooldown: number;
      currentCooldownTimer: number;
      range: number;
      speed: number;
      description: string;
    }>;
    
    // Entities lists
    enemies: Enemy[];
    projectiles: Projectile[];
    powerUps: PowerUp[];
    particles: TextParticle[];
    warnings: BossWarningAOE[];
    aiSummons: AISummon[];
    
    // Enemy spawning stats
    totalTicks: number;
    bossSpawnsDone: Record<EnemyType, boolean>;
    bossWarningsDone: Record<EnemyType, boolean>;
    gameOverTriggered: boolean;
    victoryTriggered: boolean;
    artesShieldTicks: number;
    whistleCooldownTicks: number;
    inglesAbilityTimer: number;
    whistleWaveRadius: number;
    stillTicks: number;
    lastPlayerRow: number;
    playerConfusionTimer: number;
    screenRedFlashIntensity: number;
    playerFlashTicks: number;
    dt: number;
    ticksAccumulator: number;
    playerDamageCooldownTimer: number;
    articuladoraCount: number;
  }>({
    width: 600,
    height: 600,
    playerX: 0,
    playerY: 0,
    playerHp: 100,
    playerMaxHp: 100,
    playerSpeed: 2.7,
    playerLevel: 1,
    playerXp: 0,
    playerXpNeeded: 5,
    playerGoldGained: 0,
    playerTime: 0,
    playerTicks: 0,
    playerDefeated: 0,
    moveVector: { x: 0, y: 0 },
    damageMult: 1.0,
    speedMult: 1.0,
    xpMult: 1.0,
    luckMult: 1.0,
    cooldownMult: 1.0,
    projectileMult: 0, // extra projectiles item booster
    rangeMult: 1.0,
    artesShieldTicks: 0,
    whistleCooldownTicks: 0,
    inglesAbilityTimer: 0,
    whistleWaveRadius: 0,
    stillTicks: 0,
    lastPlayerRow: 0,
    dt: 1.0,
    ticksAccumulator: 0,
    playerDamageCooldownTimer: 0,
    articuladoraCount: 0,
    weapons: {
      [WeaponType.CANETA_VERMELHA]: {
        type: WeaponType.CANETA_VERMELHA,
        name: 'Caneta Vermelha',
        level: 1, // Start with primary
        maxLevel: 5,
        damage: 15,
        cooldown: 55, // frames ~0.9s
        currentCooldownTimer: 0,
        range: 220,
        speed: 7,
        description: 'Lança gotas cor-de-rosa rápidas e dolorosas de correção'
      },
      [WeaponType.DIARIO_DE_CLASSE]: {
        type: WeaponType.DIARIO_DE_CLASSE,
        name: 'Diário de Classe',
        level: 0,
        maxLevel: 5,
        damage: 18,
        cooldown: 120,
        currentCooldownTimer: 0,
        range: 90,
        speed: 0.06, // angular velocity
        description: 'Um pesado escudo giratório que repele os alunos persistentes'
      },
      [WeaponType.APOSTILA]: {
        type: WeaponType.APOSTILA,
        name: 'Apostila Bumerangue',
        level: 0,
        maxLevel: 5,
        damage: 22,
        cooldown: 110,
        currentCooldownTimer: 0,
        range: 220,
        speed: 6,
        description: 'Arremessa bumerangues de exercícios cansativos que furam as defesas'
      },
      [WeaponType.DATASHOW]: {
        type: WeaponType.DATASHOW,
        name: 'Datashow Solar',
        level: 0,
        maxLevel: 5,
        damage: 35,
        cooldown: 160,
        currentCooldownTimer: 0,
        range: 400,
        speed: 1,
        description: 'Dispara um relâmpago de luz ultra-forte que atordoa e queima a burocracia'
      },
      [WeaponType.NOTEBOOK]: {
        type: WeaponType.NOTEBOOK,
        name: 'Notebook Corporativo',
        level: 0,
        maxLevel: 5,
        damage: 20,
        cooldown: 130,
        currentCooldownTimer: 0,
        range: 350,
        speed: 5,
        description: 'Mapeia e alveja alunos múltiplos à distância com e-mails oficiais de aviso'
      },
      [WeaponType.CAFE]: {
        type: WeaponType.CAFE,
        name: 'Café Expresso',
        level: 0,
        maxLevel: 5,
        damage: 0,
        cooldown: 0,
        currentCooldownTimer: 0,
        range: 0,
        speed: 0,
        description: 'Amplia sua adrenalina reduzindo recarga e dando velocidade extra'
      },
      [WeaponType.INTELEGENCIA_ARTIFICIAL]: {
        type: WeaponType.INTELEGENCIA_ARTIFICIAL,
        name: 'Robótica & IA',
        level: 0,
        maxLevel: 5,
        damage: 12,
        cooldown: 45,
        currentCooldownTimer: 0,
        range: 250,
        speed: 5,
        description: 'Invoca pequenos assistentes automáticos que atiram de forma autônoma'
      }
    },
    enemies: [],
    projectiles: [],
    powerUps: [],
    particles: [],
    warnings: [],
    aiSummons: [],
    totalTicks: 0,
    bossSpawnsDone: {
      [EnemyType.CHEF_CONSELHO_DEC_LASSE]: false,
      [EnemyType.CHEF_SABADO_LETIVO]: false,
      [EnemyType.CHEF_SEMANA_PEDAGOGICA]: false,
      [EnemyType.CHEF_FECHAMENTO_UNIDADE]: false
    } as any,
    bossWarningsDone: {
      [EnemyType.CHEF_CONSELHO_DEC_LASSE]: false,
      [EnemyType.CHEF_SABADO_LETIVO]: false,
      [EnemyType.CHEF_SEMANA_PEDAGOGICA]: false,
      [EnemyType.CHEF_FECHAMENTO_UNIDADE]: false
    } as any,
    gameOverTriggered: false,
    victoryTriggered: false,
    playerConfusionTimer: 0,
    screenRedFlashIntensity: 0,
    playerFlashTicks: 0
  });

  // Load permanent upgrades on init
  useEffect(() => {
    const game = gameRef.current;
    
    // Find active character configuration details
    const charConfig = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharacterId) || PLAYABLE_CHARACTERS[0];
    
    // Apply permanent boosters combined with character starting base values
    // HP: charConfig.baseMaxHp + 20 * level
    const baseHp = charConfig.baseMaxHp + (permanentUpgrades.maxHpLevel * 20);
    game.playerMaxHp = baseHp;
    game.playerHp = baseHp;
    
    // Speed: base charConfig.baseSpeed + 10% * level
    game.playerSpeed = charConfig.baseSpeed * (1.0 + (permanentUpgrades.speedLevel * 0.10));
    
    // Damage mult
    game.damageMult = 1.0 + (permanentUpgrades.damageLevel * 0.15);
    
    // XP mult
    game.xpMult = charConfig.xpModifier * (1.0 + (permanentUpgrades.xpLevel * 0.15));
    
    // Luck mult
    game.luckMult = charConfig.luckModifier * (1.0 + (permanentUpgrades.luckLevel * 0.10));

    // Cooldown Reduction passives (Marcos history teacher has built-in +10% shorter coldowns)
    game.cooldownMult = selectedCharacterId === CharacterId.CLASSICO ? 0.90 : 1.0;
    
    // Override starting weapon levels depending on character starting choice config!
    Object.values(game.weapons).forEach((w: any) => {
      w.level = w.type === charConfig.startingWeapon ? 1 : 0;
    });

    // Reset temporary skills variables on restarts
    game.artesShieldTicks = 0;
    game.whistleCooldownTicks = 600;
    game.inglesAbilityTimer = 720;
    game.whistleWaveRadius = 0;
  }, [permanentUpgrades, selectedCharacterId]);

  // Handle Resize beautifully
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && canvasRef.current) {
        const width = containerRef.current.clientWidth;
        
        // Measure active headers dynamically to fit the canvas perfectly within the remaining layout space
        const headerEl = document.getElementById('game-header-hud');
        const barsEl = document.getElementById('game-status-bars');
        
        const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 45;
        const barsHeight = barsEl ? barsEl.getBoundingClientRect().height : 40;
        
        const totalHeight = containerRef.current.clientHeight || window.innerHeight;
        // Canvas uses the exact remaining height with sensible bounds
        const height = Math.max(250, totalHeight - headerHeight - barsHeight);
        
        canvasRef.current.width = width;
        canvasRef.current.height = height;
        gameRef.current.width = width;
        gameRef.current.height = height;
      }
    };
    
    window.addEventListener('resize', updateSize);
    // Extra timeout ensures that state renderings have fully settled in DOM before layout measurements
    const timeoutId = setTimeout(updateSize, 40);
    updateSize();
    
    return () => {
      window.removeEventListener('resize', updateSize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Update loop ticking with decoupled physics fixed-tick (60Hz) and visual rendering (60 FPS) for perfect, lag-free gameplay on PC/mobile
  useEffect(() => {
    let animationFrameId: number;
    let lastRenderTime = performance.now();
    let lastUpdateTime = performance.now();
    const fpsLimit = 60; // Render at butter-smooth 60 FPS
    const renderInterval = 1000 / fpsLimit; // ~16.67ms
    const physicsInterval = 1000 / 60; // Fixed 60Hz simulation steps for responsive gameplay
    
    const tick = (now: number) => {
      animationFrameId = requestAnimationFrame(tick);

      if (isPaused || isLevelUpPause || !!bossAnnouncement) {
        lastRenderTime = now;
        lastUpdateTime = now;
        return;
      }
      
      // 1. Run physics simulation steps at fixed 60Hz rate
      let elapsedUpdate = now - lastUpdateTime;
      // Cap catastrophic lag spikes (e.g. background tab freezing)
      if (elapsedUpdate > 250) {
        elapsedUpdate = physicsInterval;
        lastUpdateTime = now - physicsInterval;
      }
      
      let updateCount = 0;
      while (elapsedUpdate >= physicsInterval && updateCount < 5) {
        updateGame();
        lastUpdateTime += physicsInterval;
        elapsedUpdate = now - lastUpdateTime;
        updateCount++;
      }
      
      // 2. Render visual scene at smooth 60 FPS
      const elapsedRender = now - lastRenderTime;
      if (elapsedRender >= renderInterval) {
        renderGame();
        lastRenderTime = now - (elapsedRender % renderInterval);
      }
    };
    
    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, isLevelUpPause, bossAnnouncement]);

  // Periodic clock timer for survival count (restored to 100% standard speed)
  useEffect(() => {
    if (isPaused || isLevelUpPause || !!bossAnnouncement) return;

    const clockInterval = setInterval(() => {
      const g = gameRef.current;
      
      // Pause countdown and game survival timer while any boss is active
      const hasActiveBoss = g.enemies.some(e => e.isBoss);
      if (!hasActiveBoss) {
        g.playerTime += 1;
      }

      // Victory Condition: Defeat Final Boss or survive past 5 minutes (300 seconds)
      if (g.playerTime >= 300 && !g.victoryTriggered && !g.gameOverTriggered) {
        triggerVictory();
      }
    }, 1000);

    return () => clearInterval(clockInterval);
  }, [isPaused, isLevelUpPause, bossAnnouncement]);

  // Fast UI sync ticker (every 100ms) for incredibly responsive HP, XP, Coins, and stats updates
  useEffect(() => {
    if (isPaused || isLevelUpPause || !!bossAnnouncement) return;

    const syncInterval = setInterval(() => {
      const g = gameRef.current;

      setUiStats({
        hp: g.playerHp,
        maxHp: g.playerMaxHp,
        speed: g.playerSpeed,
        level: g.playerLevel,
        xp: g.playerXp,
        xpNeeded: g.playerXpNeeded,
        goldCurrent: g.playerGoldGained,
        goldTotal: g.playerGoldGained,
        defeatedCount: g.playerDefeated,
        timeSurvived: g.playerTime,
        weapons: g.weapons as any,
        activeCount: (Object.values(g.weapons) as any[]).filter(w => w.level > 0).length
      });

      const bossEnemy = g.enemies.find(e => e.isBoss);
      if (bossEnemy) {
        setActiveBoss({
          id: bossEnemy.id,
          name: bossEnemy.name,
          hp: bossEnemy.hp,
          maxHp: bossEnemy.maxHp,
          type: bossEnemy.type,
          color: bossEnemy.color || '#ef4444'
        });
      } else {
        setActiveBoss(null);
      }
    }, 100);

    return () => clearInterval(syncInterval);
  }, [isPaused, isLevelUpPause, bossAnnouncement]);

  // Auto-dismiss boss arrival announcement after 2 seconds
  useEffect(() => {
    if (!bossAnnouncement) return;

    const timer = setTimeout(() => {
      setBossAnnouncement(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [bossAnnouncement]);

  const triggerGameOver = () => {
    const g = gameRef.current;
    if (g.gameOverTriggered) return;
    g.gameOverTriggered = true;
    audio.playGameOver();
    
    // Wait for animation, then exit
    setTimeout(() => {
      onGameEnd({
        victory: false,
        goldGained: g.playerGoldGained,
        defeatedCount: g.playerDefeated,
        survivedTime: g.playerTime,
        finalLevel: g.playerLevel,
        scenarioType: scenario.type,
        finalHpPercent: Math.max(0, Math.floor((g.playerHp / g.playerMaxHp) * 100))
      });
    }, 2000);
  };

  const triggerVictory = () => {
    const g = gameRef.current;
    if (g.victoryTriggered) return;
    g.victoryTriggered = true;
    audio.playVictory();
    
    setTimeout(() => {
      onGameEnd({
        victory: true,
        goldGained: g.playerGoldGained + 300, // +300 bonus for surviving full class!
        defeatedCount: g.playerDefeated,
        survivedTime: g.playerTime,
        finalLevel: g.playerLevel,
        scenarioType: scenario.type,
        finalHpPercent: Math.max(0, Math.floor((g.playerHp / g.playerMaxHp) * 100))
      });
    }, 2300);
  };

  // Upgrades Option Selection Logic
  const handleLevelUp = () => {
    const g = gameRef.current;
    audio.playLevelUp();
    
    // Choose 3 random options from the pool
    const pool = getUpgradeOptionList(g.weapons as any);
    
    // Shuffle and pick 3
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, 3);
    
    setLevelUpOptions(picked);
    setIsLevelUpPause(true);
  };

  const applyUpgradeOption = (opt: any) => {
    const g = gameRef.current;
    
    if (opt.type === 'WEAPON') {
      const type = opt.id as WeaponType;
      const w = g.weapons[type];
      w.level += 1;
      
      // Upgrade sound effect
      audio.playCoin();
    } else {
      // Applied stats
      switch (opt.id) {
        case 'STAT_DAMAGE':
          g.damageMult += 0.15;
          break;
        case 'STAT_SPEED':
          g.playerSpeed += 0.35;
          break;
        case 'STAT_RELOAD':
          g.cooldownMult *= 0.85; // Faster recharge
          break;
        case 'STAT_HP':
          g.playerMaxHp = Math.floor(g.playerMaxHp * 1.15);
          g.playerHp = Math.min(g.playerMaxHp, g.playerHp + 45);
          break;
        case 'STAT_PROJECTILES':
          g.projectileMult += 1;
          break;
        case 'STAT_RANGE':
          g.rangeMult += 0.15;
          break;
      }
      audio.playCoin();
    }

    setIsLevelUpPause(false);
  };

  // Main Core Physics Logic Loop
  const updateGame = () => {
    const g = gameRef.current;
    g.playerTicks += 1;
    g.totalTicks += 1;

    if (g.playerFlashTicks && g.playerFlashTicks > 0) {
      g.playerFlashTicks -= 1;
    }

    if (g.playerDamageCooldownTimer && g.playerDamageCooldownTimer > 0) {
      g.playerDamageCooldownTimer -= 1;
    }

    // 1. Move Player
    const speed = g.playerSpeed;
    // Check if Café speed boost is active (Cafe Level 3+ gets extra rapid movement)
    const cafeLvl = g.weapons[WeaponType.CAFE].level;
    const speedModifier = cafeLvl >= 4 ? 1.25 : cafeLvl >= 1 ? 1.10 : 1.0;
    
    // Invert controls/move vector if confused by Sábado Letivo!
    let mvX = g.moveVector.x;
    let mvY = g.moveVector.y;
    if (g.playerConfusionTimer && g.playerConfusionTimer > 0) {
      g.playerConfusionTimer -= 1;
      mvX = -mvX;
      mvY = -mvY;
      // Spawn star details above player
      if (g.playerTicks % 25 === 0) {
        spawnTextParticle("💫 Confuso (Invertido!)", g.playerX, g.playerY - 26, '#fbbf24', 13);
      }
    }

    g.playerX += mvX * speed * speedModifier;
    g.playerY += mvY * speed * speedModifier;

    // Apply soft boundary wraps or barriers based on the active scenario
    if (scenario.type === ScenarioType.SALA_FECHADA) {
      const classroomHalfSize = Math.max(450, (Math.min(g.width, g.height) + 160) / 2);
      g.playerX = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, g.playerX));
      g.playerY = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, g.playerY));
    } else if (scenario.type === ScenarioType.SALA_DE_AULA) {
      const mapLimit = 850;
      g.playerX = Math.max(-mapLimit, Math.min(mapLimit, g.playerX));
      g.playerY = Math.max(-mapLimit, Math.min(mapLimit, g.playerY));
    } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
      const corridorHalfWidth = (g.width - 40) / 2;
      g.playerX = Math.max(-corridorHalfWidth, Math.min(corridorHalfWidth, g.playerX));

      // Loop vertically giant Y coordinate limits
      const corridorHeightLimit = 1200;
      if (g.playerY < -corridorHeightLimit) {
        g.playerY += 2 * corridorHeightLimit;
      } else if (g.playerY > corridorHeightLimit) {
        g.playerY -= 2 * corridorHeightLimit;
      }
    } else {
      const mapLimit = 1600;
      g.playerX = Math.max(-mapLimit, Math.min(mapLimit, g.playerX));
      g.playerY = Math.max(-mapLimit, Math.min(mapLimit, g.playerY));
    }

    // 1b. Character Special Active Abilities Ticking
    if (selectedCharacterId === CharacterId.ARTES) {
      if (g.artesShieldTicks && g.artesShieldTicks > 0) {
        g.artesShieldTicks -= 1;
        
        // Damage nearby active hostile students/chores
        g.enemies.forEach((e) => {
          if (e.hp <= 0) return;
          if (Math.abs(e.x - g.playerX) > 75 || Math.abs(e.y - g.playerY) > 75) return;
          const dist = getDistance(g.playerX, g.playerY, e.x, e.y);
          if (dist <= 75) {
            dealDamageToEnemy(e, 0.48 * g.damageMult, '#db2777');
            // Knockback
            const angle = Math.atan2(e.y - g.playerY, e.x - g.playerX);
            e.x += Math.cos(angle) * 4.5;
            e.y += Math.sin(angle) * 4.5;
          }
        });
      }
      
      // Trigger shield periodically every 15 seconds (900 ticks)
      if (g.totalTicks % 900 === 0 && g.totalTicks > 0) {
        g.artesShieldTicks = 300; // 5 seconds of invincibility/shield
        spawnTextParticle("🎨 BARREIRA DE CRAYON! ATIVADA!", g.playerX, g.playerY - 30, '#ec4899', 14, true);
        audio.playCoin();
      }
    }
    
    else if (selectedCharacterId === CharacterId.ED_FISICA) {
      if (!g.whistleCooldownTicks) g.whistleCooldownTicks = 600; // default 10 seconds cooldown
      g.whistleCooldownTicks -= 1;
      
      if (g.whistleCooldownTicks <= 0) {
        g.whistleCooldownTicks = 600;
        g.whistleWaveRadius = 1; // trigger shockwave expansion
        spawnTextParticle("📢 PEÉÉÉ! CORRA PRO ALONGAMENTO! 🏃‍♂️", g.playerX, g.playerY - 30, '#10b981', 14, true);
        audio.playLevelUp(); // alarms sound
      }
      
      // Handle expanding shockwave wavefront
      if (g.whistleWaveRadius && g.whistleWaveRadius > 0) {
        g.whistleWaveRadius += 9; // expands at rate
        
        g.enemies.forEach((e) => {
          if (e.hp <= 0) return;
          if (Math.abs(e.x - g.playerX) > g.whistleWaveRadius || Math.abs(e.y - g.playerY) > g.whistleWaveRadius) return;
          const dist = getDistance(g.playerX, g.playerY, e.x, e.y);
          if (dist <= g.whistleWaveRadius && dist >= g.whistleWaveRadius - 35) {
            dealDamageToEnemy(e, 40 * g.damageMult, '#10b981');
            e.debuffTimer = 120; // slow student
            
            // Severe shockwave knockback
            const angle = Math.atan2(e.y - g.playerY, e.x - g.playerX);
            e.x += Math.cos(angle) * 4.5;
            e.y += Math.sin(angle) * 4.5;
          }
        });
        
        if (g.whistleWaveRadius > 260) {
          g.whistleWaveRadius = 0; // terminate pulse wave
        }
      }
    }
    
    else if (selectedCharacterId === CharacterId.INGLES) {
      if (!g.inglesAbilityTimer) g.inglesAbilityTimer = 720; // 12 seconds
      g.inglesAbilityTimer -= 1;
      
      if (g.inglesAbilityTimer <= 0) {
        g.inglesAbilityTimer = 720;
        
        // Shout funniest classroom instructions
        const englishPhrases = [
          "THE BOOK IS ON THE TABLE! 📘",
          "SILENCE! LET'S STUDY THE VERB TO BE!",
          "OPEN YOUR NOTEBOOKS TO PAGE 45! 💻",
          "WHAT TIME IS IT? EXAM TIME! ⏱️",
          "YOU HAVE MULTIPLE CHOICE ESSAYS!"
        ];
        const chosenPhrase = englishPhrases[Math.floor(Math.random() * englishPhrases.length)];
        spawnTextParticle(`👩‍💼: "${chosenPhrase}"`, g.playerX, g.playerY - 30, '#eab308', 12, true);
        audio.playCoin();
        
        // Massive slow on all entities within screen range 220px
        g.enemies.forEach((e) => {
          if (e.hp <= 0) return;
          if (Math.abs(e.x - g.playerX) > 220 || Math.abs(e.y - g.playerY) > 220) return;
          const dist = getDistance(g.playerX, g.playerY, e.x, e.y);
          if (dist <= 220) {
            e.debuffTimer = 240; // 4 seconds of massive slow!
            spawnTextParticle("🌀 MATRIX", e.x, e.y - 12, '#3b82f6', 10);
          }
        });
      }
    }

    // 2. Spawn Enemies periodically relative to elapsed game seconds
    // Dynamic difficulty factor based on selected scenario
    const difficultyScalar = scenario.difficultyMultiplier;
    const spawnScalar = 1.0 + (difficultyScalar - 1.0) * 0.45; // Dampened spawn rate scaling for balanced pacing
    const baseSpawnRate = Math.max(15, 60 - Math.floor(g.playerTime / 6)); // spawns faster as time flows
    
    if (g.totalTicks % Math.floor(baseSpawnRate / spawnScalar) === 0) {
      spawnRandomEnemy();
    }

    // 3. Spawns special boss thresholds with cinematic warning introductions
    let BOSS_CONFIGS: Record<string, { name: string; subtitle: string; description: string; emoji: string; color: string; warningTime: number }> = {} as any;
    
    if (scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
      BOSS_CONFIGS = {
        [EnemyType.ARTICULADORA_PEDAGOGICA]: {
          name: 'Articuladora Pedagógica',
          subtitle: 'Chefona do Apoio Técnico',
          description: 'A Articuladora Pedagógica chegou para avaliar sua didática com relatórios infinitos e tarefas extras! Cuidado com suas cobranças!',
          emoji: '👩‍🏫📝',
          color: '#fbbf24',
          warningTime: 40
        },
        [EnemyType.COORDENADOR_ESCOLAR]: {
          name: 'Gestão Escolar Coordenada',
          subtitle: '1 Coordenadora & 2 Articuladoras',
          description: 'Pânico total! A Coordenadora Escolar une forças com duas Articuladoras para uma blitz pedagógica em massa!',
          emoji: '👩‍💼⚡',
          color: '#ea580c',
          warningTime: 90
        },
        [EnemyType.CHEF_SEMANA_PEDAGOGICA]: {
          name: 'Semana Pedagógica (Final)',
          subtitle: 'Palestrante Motivacional Coach',
          description: 'Prepare-se para dinâmicas de grupo constrangedoras e jargões corporativos em volume máximo! Sorriso impecável, mente implacável.',
          emoji: '👩‍💼⚡',
          color: '#ec4899',
          warningTime: 150
        }
      } as any;
    } else if (scenario.type === ScenarioType.SALA_DE_AULA) {
      BOSS_CONFIGS = {
        [EnemyType.ALUNO_DO_FUNDAO]: {
          name: 'Zeca do Fundão Supremo',
          subtitle: 'Líder Supremo da Bagunça',
          description: 'O líder indiscutível das últimas carteiras! Ele arremessa aviões de papel gigantes e convoca a galera para bagunçar!',
          emoji: '🤠✈️',
          color: '#ef4444',
          warningTime: 40
        },
        [EnemyType.DIARIO_ATRASADO]: {
          name: 'Coordenadora de Registro',
          subtitle: 'A Fiscal do Diário de Classe',
          description: 'A Coordenadora de Registro chegou para auditar suas chamadas! Ela possui autoridade pedagógica para materializar Diários Atrasados que te perseguem!',
          emoji: '👩‍💼📕',
          color: '#ea580c',
          warningTime: 90
        },
        [EnemyType.CHEF_CONSELHO_DEC_LASSE]: {
          name: 'Conselho de Classe de Sala',
          subtitle: 'O Diretor Geral Severo',
          description: 'O julgamento final da sala de aula! O Diretor Severo vem verificar os seus diários e planos de aula!',
          emoji: '👴💼',
          color: '#dc2626',
          warningTime: 150
        }
      } as any;
    } else if (scenario.type === ScenarioType.SALA_FECHADA) {
      BOSS_CONFIGS = {
        [EnemyType.FORMULARIO_INFINITO]: {
          name: 'Articuladora do Formulário',
          subtitle: 'Monitore e Preencha',
          description: 'A Articuladora Pedagógica entra em sala exigindo o preenchimento de formulários avaliativos sem fim, materializando constantemente novos Formulários Infinitos!',
          emoji: '👩‍🏫📄',
          color: '#22c55e',
          warningTime: 40
        },
        [EnemyType.ARTICULADORA_PEDAGOGICA]: {
          name: 'Fiscalização Extrema',
          subtitle: 'Articuladora em Sala Apertada',
          description: 'Não há espaço para correr! Ela entra na sala para inspecionar cada centímetro da sua aula presencial!',
          emoji: '👩‍🏫👀',
          color: '#f59e0b',
          warningTime: 90
        },
        [EnemyType.CHEF_SABADO_LETIVO]: {
          name: 'Sábado Letivo Compacto',
          subtitle: 'Zumbi do Fim de Semana',
          description: 'O cansaço supremo condensado em um espaço mínimo! O fantasma do fim de semana perdido te encurrala!',
          emoji: '🧟‍♂️☕',
          color: '#ec4899',
          warningTime: 150
        }
      } as any;
    } else if (scenario.type === ScenarioType.CORREDOR_ESCOLAR) {
      BOSS_CONFIGS = {
        [EnemyType.ALUNO_VAI_VALER_NOTA]: {
          name: 'Corredor do Recreio',
          subtitle: 'Estudantes Sedentos por Merenda',
          description: 'A horda descontrolada corre pelo estreito corredor atropelando tudo em direção à cantina!',
          emoji: '🏃‍♂️🍔',
          color: '#10b981',
          warningTime: 40
        },
        [EnemyType.COORDENADOR_ESCOLAR]: {
          name: 'Patrulha de Corredor',
          subtitle: 'A Coordenadora de Plantão',
          description: 'Pegou o Prof sem crachá ou correndo! Ela se desloca em alta velocidade vigiando os armários!',
          emoji: '👩‍💼🚨',
          color: '#6366f1',
          warningTime: 90
        },
        [EnemyType.CHEF_SABADO_LETIVO]: {
          name: 'Sábado Letivo no Corredor',
          subtitle: 'Guarda do Trabalho de Fim de Semana',
          description: 'Bloqueando sua saída do colégio com xícaras de café escaldantes e notificações urgente!',
          emoji: '🧟‍♂️🚷',
          color: '#f97316',
          warningTime: 150
        }
      } as any;
    } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
      BOSS_CONFIGS = {
        [EnemyType.CHEF_SABADO_LETIVO]: {
          name: 'Sábado Letivo Eterno',
          subtitle: 'Patrulha do Labirinto Infinito',
          description: 'Vem do topo do corredor infinito, blocking os atalhos com café transbordando e cansaço sem limites!',
          emoji: '🧟‍♂️☕',
          color: '#f97316',
          warningTime: 40
        },
        [EnemyType.FORMULARIO_INFINITO]: {
          name: 'Articuladora de Monitoramento',
          subtitle: 'Comitê de Alinhamento Rígido',
          description: 'Uma Articuladora severa que patrulha o corredor infinito materializando barreiras de Formulários Infinitos em série para travar seus movimentos!',
          emoji: '👩‍🏫🔄',
          color: '#8b5cf6',
          warningTime: 90
        },
        [EnemyType.CHEF_SEMANA_PEDAGOGICA]: {
          name: 'O Coach Infinito',
          subtitle: 'Palestrante em Linha Reta',
          description: 'Inunda o corredor infinito com dinâmicas corporativas e frases de motivação inescapáveis!',
          emoji: '👩‍💼⚡',
          color: '#ec4899',
          warningTime: 150
        }
      } as any;
    } else if (scenario.type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
      BOSS_CONFIGS = {
        [EnemyType.CHEF_CONSELHO_DEC_LASSE]: {
          name: 'Membro do Conselho',
          subtitle: 'Inquisidor do Boletim Escolar',
          description: 'O julgamento se inicia! O chefe do Conselho de Classe vem pedir correções e justificativas de notas vermelhas.',
          emoji: '👴📊',
          color: '#ec4899',
          warningTime: 40
        },
        [EnemyType.CONVOCACAO_REUNIAO]: {
          name: 'Invocação Governamental',
          subtitle: 'E-mail Emergencial Regional',
          description: 'Uma torrente de convocações urgentes que restringe seus movimentos de fuga e atrai burocracia.',
          emoji: '📧🎒',
          color: '#f43f5e',
          warningTime: 90
        },
        [EnemyType.CHEF_FECHAMENTO_UNIDADE]: {
          name: 'Fechamento de Unidade',
          subtitle: 'Secretário do Apocalipse de Turmas',
          description: 'Sua última avaliação! O Secretário vem cobrar as notas finais de todo o colégio!',
          emoji: '👥⏳',
          color: '#a855f7',
          warningTime: 150
        }
      } as any;
    } else {
      // PATIO or default
      BOSS_CONFIGS = {
        [EnemyType.CHEF_CONSELHO_DEC_LASSE]: {
          name: 'Diretor Severo no Pátio',
          subtitle: 'O Inquisidor Geral do Recreio',
          description: 'O Grande Inquisidor do colégio chegou no pátio para julgar os seus planos! Desvie dos olhares severos.',
          emoji: '👴💼',
          color: '#ef4444',
          warningTime: 40
        },
        [EnemyType.CHEF_SABADO_LETIVO]: {
          name: 'Sábado Letivo Supremo',
          subtitle: 'Zumbi de Fone no Meio do Pátio',
          description: 'Vaga arrastando os pés com uma xícara gigante de café fervendo e um rastro de cansaço extremo!',
          emoji: '🧟‍♂️☕',
          color: '#f97316',
          warningTime: 90
        },
        [EnemyType.CHEF_SEMANA_PEDAGOGICA]: {
          name: 'Coach do Pátio Central',
          subtitle: 'Palestrante Motivacional de Alunos',
          description: 'Prepare-se para dinâmicas de grupo constrangedoras e balões de ar decorativos no pátio principal!',
          emoji: '👩‍💼⚡',
          color: '#ec4899',
          warningTime: 150
        },
        [EnemyType.CHEF_FECHAMENTO_UNIDADE]: {
          name: 'Fechamento do Ano Escolar',
          subtitle: 'O Secretário do Apocalipse Final',
          description: 'O momento final do ano letivo no pátio escolar! Lançamento de pilhas de notas vermelhas sem piedade!',
          emoji: '👥⏳',
          color: '#a855f7',
          warningTime: 210
        }
      } as any;
    }

    // Check boss warning threshold trigger
    Object.entries(BOSS_CONFIGS).forEach(([bType, schema]) => {
      const type = bType as EnemyType;
      if (g.playerTime >= schema.warningTime && !g.bossWarningsDone[type]) {
        g.bossWarningsDone[type] = true;
        const insultList = TEACHER_BOSS_INSULTS[type] || ENEMY_QUOTES[type] || DEFAULT_BOSS_INSULTS;
        const randomQuote = insultList[Math.floor(Math.random() * insultList.length)];
        setBossAnnouncement({
          type,
          name: schema.name,
          subtitle: schema.subtitle,
          emoji: schema.emoji,
          description: schema.description,
          color: schema.color,
          quote: randomQuote
        });
        audio.playBossSpawn();
      }
    });

    // Spawns special boss triggers
    if (scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
      // 1. Semana Pedagógica Level Timeline Spawns
      if (g.playerTime >= 40 && !g.bossSpawnsDone[EnemyType.ARTICULADORA_PEDAGOGICA]) {
        g.bossSpawnsDone[EnemyType.ARTICULADORA_PEDAGOGICA] = true;
        spawnBoss(EnemyType.ARTICULADORA_PEDAGOGICA);
      }
      if (g.playerTime >= 90 && !g.bossSpawnsDone[EnemyType.COORDENADOR_ESCOLAR]) {
        g.bossSpawnsDone[EnemyType.COORDENADOR_ESCOLAR] = true;
        spawnBoss(EnemyType.COORDENADOR_ESCOLAR);
        spawnBoss(EnemyType.ARTICULADORA_PEDAGOGICA);
        spawnBoss(EnemyType.ARTICULADORA_PEDAGOGICA);
      }
      if (g.playerTime >= 150 && !g.bossSpawnsDone[EnemyType.CHEF_SEMANA_PEDAGOGICA]) {
        g.bossSpawnsDone[EnemyType.CHEF_SEMANA_PEDAGOGICA] = true;
        spawnBoss(EnemyType.CHEF_SEMANA_PEDAGOGICA);
      }
    } else if (scenario.type === ScenarioType.SALA_DE_AULA) {
      // 2. Sala de Aula Level Timeline Spawns
      if (g.playerTime >= 40 && !g.bossSpawnsDone[EnemyType.ALUNO_DO_FUNDAO]) {
        g.bossSpawnsDone[EnemyType.ALUNO_DO_FUNDAO] = true;
        spawnBoss(EnemyType.ALUNO_DO_FUNDAO);
      }
      if (g.playerTime >= 90 && !g.bossSpawnsDone[EnemyType.DIARIO_ATRASADO]) {
        g.bossSpawnsDone[EnemyType.DIARIO_ATRASADO] = true;
        spawnBoss(EnemyType.DIARIO_ATRASADO);
      }
      if (g.playerTime >= 150 && !g.bossSpawnsDone[EnemyType.CHEF_CONSELHO_DEC_LASSE]) {
        g.bossSpawnsDone[EnemyType.CHEF_CONSELHO_DEC_LASSE] = true;
        spawnBoss(EnemyType.CHEF_CONSELHO_DEC_LASSE);
      }
    } else if (scenario.type === ScenarioType.SALA_FECHADA) {
      // 3. Sala Fechada Level Timeline Spawns
      if (g.playerTime >= 40 && !g.bossSpawnsDone[EnemyType.FORMULARIO_INFINITO]) {
        g.bossSpawnsDone[EnemyType.FORMULARIO_INFINITO] = true;
        spawnBoss(EnemyType.FORMULARIO_INFINITO);
      }
      if (g.playerTime >= 90 && !g.bossSpawnsDone[EnemyType.ARTICULADORA_PEDAGOGICA]) {
        g.bossSpawnsDone[EnemyType.ARTICULADORA_PEDAGOGICA] = true;
        spawnBoss(EnemyType.ARTICULADORA_PEDAGOGICA);
      }
      if (g.playerTime >= 150 && !g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO]) {
        g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO] = true;
        spawnBoss(EnemyType.CHEF_SABADO_LETIVO);
      }
    } else if (scenario.type === ScenarioType.CORREDOR_ESCOLAR) {
      // 4. Corredor Escolar Level Timeline Spawns
      if (g.playerTime >= 40 && !g.bossSpawnsDone[EnemyType.ALUNO_VAI_VALER_NOTA]) {
        g.bossSpawnsDone[EnemyType.ALUNO_VAI_VALER_NOTA] = true;
        spawnBoss(EnemyType.ALUNO_VAI_VALER_NOTA);
      }
      if (g.playerTime >= 90 && !g.bossSpawnsDone[EnemyType.COORDENADOR_ESCOLAR]) {
        g.bossSpawnsDone[EnemyType.COORDENADOR_ESCOLAR] = true;
        spawnBoss(EnemyType.COORDENADOR_ESCOLAR);
      }
      if (g.playerTime >= 150 && !g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO]) {
        g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO] = true;
        spawnBoss(EnemyType.CHEF_SABADO_LETIVO);
      }
    } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
      // 5. Corredor Infinito Level Timeline Spawns
      if (g.playerTime >= 40 && !g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO]) {
        g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO] = true;
        spawnBoss(EnemyType.CHEF_SABADO_LETIVO);
      }
      if (g.playerTime >= 90 && !g.bossSpawnsDone[EnemyType.FORMULARIO_INFINITO]) {
        g.bossSpawnsDone[EnemyType.FORMULARIO_INFINITO] = true;
        spawnBoss(EnemyType.FORMULARIO_INFINITO);
        spawnBoss(EnemyType.FORMULARIO_INFINITO);
      }
      if (g.playerTime >= 150 && !g.bossSpawnsDone[EnemyType.CHEF_SEMANA_PEDAGOGICA]) {
        g.bossSpawnsDone[EnemyType.CHEF_SEMANA_PEDAGOGICA] = true;
        spawnBoss(EnemyType.CHEF_SEMANA_PEDAGOGICA);
      }
    } else if (scenario.type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
      // 6. Conselho de Classe Level Timeline Spawns
      if (g.playerTime >= 40 && !g.bossSpawnsDone[EnemyType.CHEF_CONSELHO_DEC_LASSE]) {
        g.bossSpawnsDone[EnemyType.CHEF_CONSELHO_DEC_LASSE] = true;
        spawnBoss(EnemyType.CHEF_CONSELHO_DEC_LASSE);
      }
      if (g.playerTime >= 90 && !g.bossSpawnsDone[EnemyType.CONVOCACAO_REUNIAO]) {
        g.bossSpawnsDone[EnemyType.CONVOCACAO_REUNIAO] = true;
        spawnBoss(EnemyType.CONVOCACAO_REUNIAO);
      }
      if (g.playerTime >= 150 && !g.bossSpawnsDone[EnemyType.CHEF_FECHAMENTO_UNIDADE]) {
        g.bossSpawnsDone[EnemyType.CHEF_FECHAMENTO_UNIDADE] = true;
        spawnBoss(EnemyType.CHEF_FECHAMENTO_UNIDADE);
      }
    } else {
      // 7. Pátio Escolar (or fallback) Timeline Spawns
      if (g.playerTime >= 40 && !g.bossSpawnsDone[EnemyType.CHEF_CONSELHO_DEC_LASSE]) {
        g.bossSpawnsDone[EnemyType.CHEF_CONSELHO_DEC_LASSE] = true;
        spawnBoss(EnemyType.CHEF_CONSELHO_DEC_LASSE);
      }
      if (g.playerTime >= 90 && !g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO]) {
        g.bossSpawnsDone[EnemyType.CHEF_SABADO_LETIVO] = true;
        spawnBoss(EnemyType.CHEF_SABADO_LETIVO);
        spawnBoss(EnemyType.COORDENADOR_ESCOLAR);
      }
      if (g.playerTime >= 150 && !g.bossSpawnsDone[EnemyType.CHEF_SEMANA_PEDAGOGICA]) {
        g.bossSpawnsDone[EnemyType.CHEF_SEMANA_PEDAGOGICA] = true;
        spawnBoss(EnemyType.CHEF_SEMANA_PEDAGOGICA);
      }
      if (g.playerTime >= 210 && !g.bossSpawnsDone[EnemyType.CHEF_FECHAMENTO_UNIDADE]) {
        g.bossSpawnsDone[EnemyType.CHEF_FECHAMENTO_UNIDADE] = true;
        spawnBoss(EnemyType.CHEF_FECHAMENTO_UNIDADE);
      }
    }

    // 4. Update Assistant AI Summons
    updateAISummons();

    // 5. Fire Player Weapons automagically!
    fireWeapons();

    // 6. Update Projectiles
    updateProjectiles();

    // 7. Update Boss WARNING regions (AOEs)
    updateAOEWarnings();

    // 8. Update Enemies (path and collision to player)
    updateEnemies();

    // 9. Collectibles Magnetic Attraction logic
    updateCollectibles();

    // 10. Update floating particles
    updateParticles();
  };

  const spawnRandomEnemy = () => {
    const g = gameRef.current;

    // Cap standard active enemies to 75 to keep visual flow smooth and prevent CPU performance degradation
    const activeStandardEnemiesCount = g.enemies.filter(e => !e.isBoss).length;
    if (activeStandardEnemiesCount >= 75) {
      return;
    }

    // Out-of-viewport circular border coords
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.max(g.width, g.height) / 1.5 + Math.random() * 80;
    let ex = g.playerX + Math.cos(angle) * distance;
    let ey = g.playerY + Math.sin(angle) * distance;

    if (scenario.type === ScenarioType.SALA_FECHADA) {
      const margin = 20;
      const classroomHalfSize = Math.max(450, (Math.min(g.width, g.height) + 160) / 2);
      ex = Math.max(-classroomHalfSize + margin, Math.min(classroomHalfSize - margin, ex));
      ey = Math.max(-classroomHalfSize + margin, Math.min(classroomHalfSize - margin, ey));
    } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
      const margin = 20;
      const corridorHalfWidth = (g.width - 40) / 2;
      ex = Math.max(-corridorHalfWidth + margin, Math.min(corridorHalfWidth - margin, ex));
      
      const corridorHeightLimit = 1200;
      ey = g.playerY + (Math.random() > 0.5 ? 1 : -1) * (g.height / 2 + Math.random() * 80);
      if (ey < -corridorHeightLimit) {
        ey += 2 * corridorHeightLimit;
      } else if (ey > corridorHeightLimit) {
        ey -= 2 * corridorHeightLimit;
      }
    }

    // Pick type based on elapsed seconds to scale fun and hard challenges
    let etype = EnemyType.ALUNO_DISTRAIDO;
    let rand = Math.random();

    if (scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
      // Custom spawning roadmap for Semana Pedagógica
      if (g.playerTime < 40) {
        // Phase 1 (0s - 40s): Only basic school students. Absolutely NO Articuladora or Coordenadora.
        if (rand < 0.45) etype = EnemyType.ALUNO_DISTRAIDO;
        else if (rand < 0.75) etype = EnemyType.ALUNO_E_PRA_COPIAR;
        else etype = EnemyType.ALUNO_DO_FUNDAO;
      } else if (g.playerTime < 90) {
        // Phase 2 (40s - 90s): Articuladora is unlocked and can appear as a common enemy (10% spawn chance)! Coordenadora is still locked.
        if (rand < 0.10) etype = EnemyType.ARTICULADORA_PEDAGOGICA;
        else if (rand < 0.38) etype = EnemyType.ALUNO_DISTRAIDO;
        else if (rand < 0.62) etype = EnemyType.ALUNO_E_PRA_COPIAR;
        else if (rand < 0.82) etype = EnemyType.ALUNO_DO_FUNDAO;
        else etype = EnemyType.ALUNO_VAI_VALER_NOTA;
      } else {
        // Phase 3 (90s+): Both Articuladora (15% rate) and Coordenadora (10% rate) are unlocked as common enemies!
        if (rand < 0.15) etype = EnemyType.ARTICULADORA_PEDAGOGICA;
        else if (rand < 0.25) etype = EnemyType.COORDENADOR_ESCOLAR;
        else if (rand < 0.45) etype = EnemyType.ALUNO_DISTRAIDO;
        else if (rand < 0.62) etype = EnemyType.ALUNO_E_PRA_COPIAR;
        else if (rand < 0.76) etype = EnemyType.ALUNO_DO_FUNDAO;
        else if (rand < 0.88) etype = EnemyType.ALUNO_VAI_VALER_NOTA;
        else etype = EnemyType.FORMULARIO_INFINITO;
      }
    } else {
      // Standard scenario common enemy scales
      if (g.playerTime < 25) {
        // 0s to 25s: Gentle onboarding with simple students
        if (rand < 0.50) etype = EnemyType.ALUNO_DISTRAIDO;
        else if (rand < 0.85) etype = EnemyType.ALUNO_E_PRA_COPIAR;
        else etype = EnemyType.ALUNO_DO_FUNDAO;
      } else if (g.playerTime < 50) {
        // 25s to 50s: Pre-boss and boss entrance - No Articuladora yet so player can focus!
        if (rand < 0.40) etype = EnemyType.ALUNO_DISTRAIDO;
        else if (rand < 0.65) etype = EnemyType.ALUNO_E_PRA_COPIAR;
        else if (rand < 0.85) etype = EnemyType.ALUNO_DO_FUNDAO;
        else etype = EnemyType.ALUNO_VAI_VALER_NOTA;
      } else if (g.playerTime < 100) {
        // 50s to 100s: Post-first-boss. Introduce Articuladora at a low rate (8% spawn chance)
        if (rand < 0.08) etype = EnemyType.ARTICULADORA_PEDAGOGICA;
        else if (rand < 0.35) etype = EnemyType.ALUNO_DISTRAIDO;
        else if (rand < 0.55) etype = EnemyType.ALUNO_E_PRA_COPIAR;
        else if (rand < 0.75) etype = EnemyType.ALUNO_DO_FUNDAO;
        else if (rand < 0.90) etype = EnemyType.ALUNO_VAI_VALER_NOTA;
        else etype = EnemyType.FORMULARIO_INFINITO;
      } else if (g.playerTime < 160) {
        // 100s to 160s: Post-second-boss. Articuladora at 12% probability
        if (rand < 0.12) etype = EnemyType.ARTICULADORA_PEDAGOGICA;
        else if (rand < 0.30) etype = EnemyType.ALUNO_E_PRA_COPIAR;
        else if (rand < 0.45) etype = EnemyType.ALUNO_DO_FUNDAO;
        else if (rand < 0.65) etype = EnemyType.ALUNO_VAI_VALER_NOTA;
        else if (rand < 0.80) etype = EnemyType.FORMULARIO_INFINITO;
        else etype = EnemyType.DIARIO_ATRASADO;
      } else {
        // 160s+: High heat late game chaos including all heavy elites and bosses' minions
        if (rand < 0.10) etype = EnemyType.ALUNO_VAI_VALER_NOTA;
        else if (rand < 0.20) etype = EnemyType.ALUNO_DO_FUNDAO;
        else if (rand < 0.32) etype = EnemyType.FORMULARIO_INFINITO;
        else if (rand < 0.44) etype = EnemyType.COORDENADOR_ESCOLAR;
        else if (rand < 0.60) etype = EnemyType.ARTICULADORA_PEDAGOGICA;
        else if (rand < 0.75) etype = EnemyType.CONVOCACAO_REUNIAO;
        else etype = EnemyType.DIARIO_ATRASADO;
      }
    }

    // After the first boss (playerTime >= 40), increase the incidence of Coordenador Escolar 
    // for every 3 Articuladoras that are chosen to spawn
    if (etype === EnemyType.ARTICULADORA_PEDAGOGICA) {
      g.articuladoraCount = (g.articuladoraCount || 0) + 1;
      if (g.playerTime >= 40 && g.articuladoraCount >= 3) {
        // Coordenadora is only unlocked as common in Semana Pedagógica after 90 seconds
        const isCoordenadoraUnlocked = (scenario.type !== ScenarioType.SEMANA_PEDAGOGICA_STAGE) || (g.playerTime >= 90);
        if (isCoordenadoraUnlocked) {
          g.articuladoraCount = 0;
          etype = EnemyType.COORDENADOR_ESCOLAR;
        }
      }
    }

    createEnemyEntity(etype, ex, ey);
  };

  const createEnemyEntity = (etype: EnemyType, x: number, y: number): Enemy => {
    const g = gameRef.current;
    let name = 'Inimigo';
    let hp = 10;
    let speed = 1.6;
    let size = 16;
    let dmg = 8;
    let xpVal = 1;
    let color = '#ccc';
    let isElite = false;

    // Adjust parameters
    switch (etype) {
      case EnemyType.ALUNO_DISTRAIDO:
        name = 'Aluno Distraído';
        hp = 18;
        speed = 1.35;
        size = 15;
        dmg = 5;
        xpVal = 1;
        color = '#60a5fa'; // Blue
        break;
      case EnemyType.ALUNO_VAI_VALER_NOTA:
        name = 'Aluno "Vai Valer Nota?"';
        hp = 14;
        speed = 2.4;
        size = 14;
        dmg = 9;
        xpVal = 2;
        color = '#ec4899'; // Pink
        break;
      case EnemyType.ALUNO_E_PRA_COPIAR:
        name = 'Aluno "É Pra Copiar?"';
        hp = 22;
        speed = 1.1;
        size = 15;
        dmg = 6;
        xpVal = 1;
        color = '#fbbf24'; // Yellow
        break;
      case EnemyType.ALUNO_DO_FUNDAO:
        name = 'Aluno do Fundão';
        hp = 16;
        speed = 1.8;
        size = 15;
        dmg = 7;
        xpVal = 2;
        color = '#a855f7'; // Purple
        break;
      case EnemyType.FORMULARIO_INFINITO:
        name = 'Formulário Infinito';
        hp = 45;
        speed = 1.4;
        size = 15;
        dmg = 12;
        xpVal = 3;
        color = '#cbd5e1'; // Grey Paper
        break;
      case EnemyType.DIARIO_ATRASADO:
        name = 'Diário Atrasado';
        hp = 90;
        speed = 0.8;
        size = 15;
        dmg = 15;
        xpVal = 5;
        color = '#3b82f6'; // Heavy Blue
        break;
      case EnemyType.CONVOCACAO_REUNIAO:
        name = 'Convocação de Reunião';
        hp = 30;
        speed = 1.9;
        size = 15;
        dmg = 10;
        xpVal = 3;
        color = '#10b981';
        break;
      case EnemyType.ARTICULADORA_PEDAGOGICA:
        name = 'Articuladora Pedagógica';
        hp = 80;
        speed = 1.1;
        size = 22;
        dmg = 12;
        xpVal = 8;
        color = '#c084fc'; // Violet
        isElite = true;
        break;
      case EnemyType.COORDENADOR_ESCOLAR:
        name = 'Coordenador Escolar';
        {
          const levelFactor = Math.max(0, g.playerLevel - 1);
          const coeff = 1.0 + levelFactor * 0.08; // grows +8% per level gained
          hp = Math.floor(180 * coeff);
          speed = 0.95 * Math.min(1.4, 1.0 + levelFactor * 0.015); // gets slightly speedier
          dmg = Math.floor(20 * (1.0 + levelFactor * 0.05)); // hurts more as player levels up
        }
        size = 32;
        xpVal = 10;
        color = '#f97316'; // Orange warning
        isElite = true;
        break;
      case EnemyType.MINION_TAREFA_EXTRA:
        name = 'Tarefa Extra';
        hp = 10;
        speed = 2.0;
        size = 10;
        dmg = 4;
        xpVal = 0.5;
        color = '#fda4af';
        break;
    }

    const enemy = getEnemyFromPool(etype, x, y);
    enemy.name = name;
    enemy.hp = hp;
    enemy.maxHp = hp;
    enemy.speed = speed * (1.0 + (scenario.difficultyMultiplier - 1.0) * 0.40); // Dampened speed scaling for optimal player response/balance
    enemy.damage = dmg;
    enemy.xpValue = xpVal;
    enemy.size = size;
    enemy.color = color;
    enemy.quoteCooldown = Math.floor(Math.random() * 200) + 100;
    enemy.isElite = isElite;
    enemy.isBoss = false;
    enemy.summonTimer = 0;

    g.enemies.push(enemy);
    return enemy;
  };

  const spawnBoss = (bossType: EnemyType) => {
    const g = gameRef.current;
    g.bossSpawnsDone[bossType] = true;
    audio.playBossSpawn();

    // Spawn coordinate nicely above player with a slight random offset to prevent stacking on multi-boss spawns
    const bx = g.playerX + (Math.random() - 0.5) * 80;
    const by = g.playerY - 260 + (Math.random() - 0.5) * 80;

    let bName = 'Chefe Escolar';
    let bHp = 500;
    let bSpeed = 1.0;
    let bDmg = 25;
    let bSize = 34;
    let bColor = '#ef4444';

    switch (bossType) {
      case EnemyType.ARTICULADORA_PEDAGOGICA:
        bName = 'Articuladora Pedagógica (Chefona)';
        {
          const isFase1 = scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE;
          bHp = (isFase1 ? 550 : 350) * scenario.difficultyMultiplier;
          bSpeed = isFase1 ? 1.55 : 1.2;
          bDmg = isFase1 ? 20 : 15;
        }
        bSize = 32;
        bColor = '#fbbf24';
        break;
      case EnemyType.COORDENADOR_ESCOLAR:
        bName = 'Coordenadora Escolar (Chefona)';
        {
          const isFase1 = scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE;
          bHp = (isFase1 ? 950 : 650) * scenario.difficultyMultiplier;
          bSpeed = isFase1 ? 1.25 : 1.0;
          bDmg = isFase1 ? 26 : 22;
        }
        bSize = 34;
        bColor = '#ea580c';
        break;
      case EnemyType.CHEF_CONSELHO_DEC_LASSE:
        bName = 'Conselho de Classe';
        bHp = 12000 * scenario.difficultyMultiplier;
        bSpeed = Math.max(1.15, (g.playerSpeed || 2.4) * 0.72);
        bDmg = 22;
        bSize = 42;
        bColor = '#eab308';
        break;
      case EnemyType.CHEF_SABADO_LETIVO:
        bName = 'Sábado Letivo';
        bHp = 14500 * scenario.difficultyMultiplier;
        bSpeed = Math.max(1.0, (g.playerSpeed || 2.4) * 0.65);
        bDmg = 26;
        bSize = 44;
        bColor = '#ef4444';
        break;
      case EnemyType.CHEF_SEMANA_PEDAGOGICA:
        bName = 'Semana Pedagógica';
        bHp = 8200 * scenario.difficultyMultiplier;
        bSpeed = Math.max(0.85, (g.playerSpeed || 2.4) * 0.6);
        bDmg = 28;
        bSize = 40;
        bColor = '#a855f7';
        break;
      case EnemyType.CHEF_FECHAMENTO_UNIDADE:
        bName = 'Fechamento de Unidade';
        bHp = 22000 * scenario.difficultyMultiplier;
        bSpeed = Math.max(1.3, (g.playerSpeed || 2.4) * 0.8);
        bDmg = 38;
        bSize = 48;
        bColor = '#dc2626';
        break;
      case EnemyType.DIARIO_ATRASADO:
        bName = 'Coordenadora de Registro';
        bHp = 4500 * scenario.difficultyMultiplier;
        bSpeed = Math.max(1.2, (g.playerSpeed || 2.4) * 0.75);
        bDmg = 23;
        bSize = 34;
        bColor = '#ea580c';
        break;
      case EnemyType.FORMULARIO_INFINITO:
        bName = scenario.type === ScenarioType.CORREDOR_INFINITO ? 'Articuladora de Monitoramento' : 'Articuladora do Formulário';
        bHp = 4000 * scenario.difficultyMultiplier;
        bSpeed = Math.max(1.3, (g.playerSpeed || 2.4) * 0.75);
        bDmg = 21;
        bSize = 32;
        bColor = '#16a34a';
        break;
      case EnemyType.CONVOCACAO_REUNIAO:
        bName = 'Supervisora de Ensino';
        bHp = 5500 * scenario.difficultyMultiplier;
        bSpeed = Math.max(1.25, (g.playerSpeed || 2.4) * 0.75);
        bDmg = 24;
        bSize = 35;
        bColor = '#f43f5e';
        break;
      case EnemyType.ALUNO_DO_FUNDAO:
        bName = 'Zeca do Fundão Supremo';
        bHp = 1100 * scenario.difficultyMultiplier;
        // Dynamically scale speed to match player's current speed * 0.96 for higher difficulty
        bSpeed = (g.playerSpeed || 2.4) * 0.96;
        bDmg = Math.round((34 + g.playerLevel * 2.5) * scenario.difficultyMultiplier);
        bSize = 38;
        bColor = '#ef4444';
        break;
      case EnemyType.ALUNO_VAI_VALER_NOTA:
        bName = 'Corredor do Recreio';
        bHp = 900 * scenario.difficultyMultiplier;
        // Dynamically scale speed to match player's current speed * 0.96 for higher difficulty
        bSpeed = (g.playerSpeed || 2.4) * 0.96;
        bDmg = Math.round((28 + g.playerLevel * 2.0) * scenario.difficultyMultiplier);
        bSize = 36;
        bColor = '#10b981';
        break;
      case EnemyType.ALUNO_DISTRAIDO:
        bName = 'Aluno Distraído Supremo';
        bHp = 800 * scenario.difficultyMultiplier;
        // Dynamically scale speed to match player's current speed * 0.96 for higher difficulty
        bSpeed = (g.playerSpeed || 2.4) * 0.96;
        bDmg = Math.round((25 + g.playerLevel * 1.5) * scenario.difficultyMultiplier);
        bSize = 34;
        bColor = '#3b82f6';
        break;
      case EnemyType.ALUNO_E_PRA_COPIAR:
        bName = 'Copiador Frenético';
        bHp = 850 * scenario.difficultyMultiplier;
        // Dynamically scale speed to match player's current speed * 0.96 for higher difficulty
        bSpeed = (g.playerSpeed || 2.4) * 0.96;
        bDmg = Math.round((26 + g.playerLevel * 1.5) * scenario.difficultyMultiplier);
        bSize = 34;
        bColor = '#06b6d4';
        break;
    }

    const boss = getEnemyFromPool(bossType, bx, by);
    boss.name = bName;
    boss.hp = bHp;
    boss.maxHp = bHp;
    boss.speed = bSpeed;
    boss.damage = bDmg;
    boss.xpValue = 40;
    boss.size = bSize;
    boss.color = bColor;
    boss.quoteCooldown = 40;
    boss.isElite = true;
    boss.isBoss = true;
    boss.summonTimer = 0;

    g.enemies.push(boss);

    // Add visual announcement particle
    spawnTextParticle(bName + " CHEGOU! 💥", bx, by - 40, '#f43f5e', 20);
  };

  const updateAISummons = () => {
    const g = gameRef.current;
    const aiLvl = g.weapons[WeaponType.INTELEGENCIA_ARTIFICIAL].level;
    if (aiLvl === 0) {
      g.aiSummons = [];
      return;
    }

    const count = aiLvl >= 5 ? 3 : aiLvl >= 3 ? 2 : 1;

    // Persistently maintain exactly the correct amount of AI assistants
    if (g.aiSummons.length > count) {
      g.aiSummons = g.aiSummons.slice(0, count);
    } else if (g.aiSummons.length < count) {
      const toSpawn = count - g.aiSummons.length;
      for (let i = 0; i < toSpawn; i++) {
        g.aiSummons.push({
          id: Math.random().toString(36).substr(2, 9),
          x: g.playerX,
          y: g.playerY,
          angle: 0,
          shootTimer: 10 + i * 15,
          duration: 999999 // Infinite persistence
        });
      }
    }

    // AI assistants orbit around player smoothly
    g.aiSummons.forEach((as, idx) => {
      const angleOffset = (idx * Math.PI * 2 / count) + (g.playerTicks * 0.03);
      const orbitRadius = 70;
      const targetX = g.playerX + Math.cos(angleOffset) * orbitRadius;
      const targetY = g.playerY + Math.sin(angleOffset) * orbitRadius;
      
      // Interpolate position smoothly to make movement fluid
      as.x += (targetX - as.x) * 0.2;
      as.y += (targetY - as.y) * 0.2;

      // Active shooting towards closest enemy
      as.shootTimer -= 1;
      if (as.shootTimer <= 0 && g.enemies.length > 0) {
        as.shootTimer = Math.max(12, 45 - (aiLvl * 8)); // faster shots with levels
        
         // find closest
         let closest: Enemy | null = null;
         let minDistSq = Infinity;
         const ax = as.x;
         const ay = as.y;
         g.enemies.forEach(e => {
           const dx = e.x - ax;
           const dy = e.y - ay;
           const distSq = dx * dx + dy * dy;
           if (distSq < minDistSq) {
             minDistSq = distSq;
             closest = e;
           }
         });

         if (closest) {
           const cl = closest as Enemy;
           const bulletAngle = Math.atan2(cl.y - as.y, cl.x - as.x);
           const p = getProjectileFromPool(
             WeaponType.INTELEGENCIA_ARTIFICIAL,
             as.x,
             as.y,
             Math.cos(bulletAngle) * 9,
             Math.sin(bulletAngle) * 9,
             6,
             10 + (aiLvl * 3) * g.damageMult,
             7,
             '#10b981',
             45,
             45
           );
           g.projectiles.push(p);
           if (soundEnabled) audio.playShoot();
         }
      }
    });
  };

  // Weapons Firing Logic
  const fireWeapons = () => {
    const g = gameRef.current;

    // A. CANETA VERMELHA
    const red = g.weapons[WeaponType.CANETA_VERMELHA];
    if (red.level > 0) {
      red.currentCooldownTimer -= 1;
      if (red.currentCooldownTimer <= 0) {
        // Redraw cooldown modified by cafe items + attributes
        red.currentCooldownTimer = Math.floor(red.cooldown * g.cooldownMult);
        
        // Count projectiles fired
        const count = 1 + Math.floor(red.level / 2) + g.projectileMult;

        if (g.enemies.length > 0) {
          // Fire towards the closest enemy
          let closest: Enemy | null = null;
          let minDistSq = Infinity;
          const px = g.playerX;
          const py = g.playerY;
          
          g.enemies.forEach((e) => {
            const dx = e.x - px;
            const dy = e.y - py;
            const distSq = dx * dx + dy * dy;
            if (distSq < minDistSq) {
              minDistSq = distSq;
              closest = e;
            }
          });

          if (closest) {
            const target: Enemy = closest;
            const baseAngle = Math.atan2(target.y - g.playerY, target.x - g.playerX);
            
            // Level 5 special: fires in circular fan expansion as requested!
            const fanSpreads = red.level >= 5;

            for (let i = 0; i < (fanSpreads ? 8 : count); i++) {
              const diffAngle = fanSpreads ? (i * Math.PI / 4) : ((i - (count - 1) / 2) * 0.18);
              const finalAngle = baseAngle + diffAngle;

              const p = getProjectileFromPool(
                WeaponType.CANETA_VERMELHA,
                g.playerX,
                g.playerY,
                Math.cos(finalAngle) * red.speed,
                Math.sin(finalAngle) * red.speed,
                red.speed,
                (red.damage + (red.level * 4)) * g.damageMult,
                red.level >= 3 ? 9 : 6,
                '#ef4444',
                32,
                32
              );
              p.angle = finalAngle;
              (p as any).piercingCount = 0;
              (p as any).maxPiercing = red.level >= 4 ? 2 : 1;
              g.projectiles.push(p);
            }
            if (soundEnabled) audio.playShoot();
          }
        }
      }
    }

    // B. DIÁRIO DE CLASSE (Rotating shields)
    const diary = g.weapons[WeaponType.DIARIO_DE_CLASSE];
    if (diary.level > 0) {
      // The number of diaries matches the weapon level directly! (level 1 = 1, level 2 = 2, level 3 = 3, etc.)
      const count = diary.level;
      
      // We recreate orbitals list if quantity doesn't match
      let currentOrbitals = g.projectiles.filter(p => p.type === WeaponType.DIARIO_DE_CLASSE);
      
      if (currentOrbitals.length > count) {
        // Remove excess orbitals
        const excessCount = currentOrbitals.length - count;
        let removed = 0;
        g.projectiles = g.projectiles.filter(p => {
          if (p.type === WeaponType.DIARIO_DE_CLASSE && removed < excessCount) {
            removed++;
            return false;
          }
          return true;
        });
        currentOrbitals = g.projectiles.filter(p => p.type === WeaponType.DIARIO_DE_CLASSE);
      } else if (currentOrbitals.length < count) {
        // Spawn missing ones
        const toSpawn = count - currentOrbitals.length;
        for (let i = 0; i < toSpawn; i++) {
          const p = getProjectileFromPool(
            WeaponType.DIARIO_DE_CLASSE,
            g.playerX,
            g.playerY,
            0,
            0,
            diary.speed,
            (diary.damage + (diary.level * 3)) * g.damageMult,
            diary.level >= 4 ? 14 : 10,
            '#3b82f6',
            9999,
            9999
          );
          p.orbitAngle = 0;
          g.projectiles.push(p);
        }
        // Refetch to include new ones
        currentOrbitals = g.projectiles.filter(p => p.type === WeaponType.DIARIO_DE_CLASSE);
      }

      // Distribute ALL active orbitals perfectly with equal spacing from the master angle
      const masterAngle = currentOrbitals[0] ? (currentOrbitals[0].orbitAngle || 0) : 0;
      currentOrbitals.forEach((p, idx) => {
        p.orbitAngle = masterAngle + (idx * Math.PI * 2) / count;
      });
    }

    // C. APOSTILA (Boomerang projectile)
    const apost = g.weapons[WeaponType.APOSTILA];
    if (apost.level > 0) {
      apost.currentCooldownTimer -= 1;
      if (apost.currentCooldownTimer <= 0) {
        apost.currentCooldownTimer = Math.floor(apost.cooldown * g.cooldownMult);

        const count = 1 + (apost.level >= 3 ? 1 : 0);
        
        for (let i = 0; i < count; i++) {
          // Try to fire in move direction or right
          const angle = (g.moveVector.x !== 0 || g.moveVector.y !== 0)
            ? Math.atan2(g.moveVector.y, g.moveVector.x)
            : 0;

          const attackAngle = angle + (i * Math.PI); // opposite directions

          const p = getProjectileFromPool(
            WeaponType.APOSTILA,
            g.playerX,
            g.playerY,
            Math.cos(attackAngle) * apost.speed,
            Math.sin(attackAngle) * apost.speed,
            apost.speed,
            (apost.damage + (apost.level * 5)) * g.damageMult,
            apost.level >= 4 ? 20 : 13,
            '#ec4899',
            120,
            120
          );
          (p as any).originalX = g.playerX;
          (p as any).originalY = g.playerY;
          p.returning = false;
          (p as any).piercingCount = 0;
          (p as any).maxPiercing = 10;
          g.projectiles.push(p);
        }
        if (soundEnabled) audio.playShoot();
      }
    }

    // D. DATASHOW (Giant laser beams)
    const show = g.weapons[WeaponType.DATASHOW];
    if (show.level > 0) {
      show.currentCooldownTimer -= 1;
      if (show.currentCooldownTimer <= 0) {
        show.currentCooldownTimer = Math.floor(show.cooldown * g.cooldownMult);

        // Dispara em direção a um inimigo ou aleatório
        let angle = Math.random() * Math.PI * 2;
        if (g.enemies.length > 0) {
          const randEnemy = g.enemies[Math.floor(Math.random() * g.enemies.length)];
          angle = Math.atan2(randEnemy.y - g.playerY, randEnemy.x - g.playerX);
        }

        // Level 3+ shoots double laser beams!
        const shootsDouble = show.level >= 3;
        const beamDirections = shootsDouble ? 2 : 1;

        for (let d = 0; d < beamDirections; d++) {
          const finalAngle = angle + (d * Math.PI); // opposite
          
          const p = getProjectileFromPool(
            WeaponType.DATASHOW,
            g.playerX,
            g.playerY,
            Math.cos(finalAngle),
            Math.sin(finalAngle),
            0,
            (show.damage + (show.level * 8)) * g.damageMult,
            show.level >= 5 ? 40 : show.level >= 2 ? 26 : 16,
            '#facc15',
            25,
            25
          );
          p.angle = finalAngle;
          p.range = show.range;
          g.projectiles.push(p);
        }
        if (soundEnabled) audio.playShoot();
      }
    }

    // E. NOTEBOOK (Cobrança multidirecional)
    const note = g.weapons[WeaponType.NOTEBOOK];
    if (note.level > 0) {
      note.currentCooldownTimer -= 1;
      if (note.currentCooldownTimer <= 0) {
        note.currentCooldownTimer = Math.floor(note.cooldown * g.cooldownMult);

        // Targets closest multiple enemies
        const targetsCount = note.level >= 5 ? 4 : note.level >= 2 ? 3 : 2;
        
        // Filter first to avoid sorting offscreen enemies, and use squared distance to avoid Math.sqrt during sorting
        const px = g.playerX;
        const py = g.playerY;
        const localEnemies = g.enemies.filter(e => Math.abs(e.x - px) < 400 && Math.abs(e.y - py) < 400);

        localEnemies.sort((a,b) => {
          const distSqA = (a.x - px) * (a.x - px) + (a.y - py) * (a.y - py);
          const distSqB = (b.x - px) * (b.x - px) + (b.y - py) * (b.y - py);
          return distSqA - distSqB;
        });

        // Limit targets
        const total = Math.min(targetsCount, localEnemies.length);
        for (let i = 0; i < total; i++) {
          const victim = localEnemies[i];
          const angle = Math.atan2(victim.y - g.playerY, victim.x - g.playerX);

          const p = getProjectileFromPool(
            WeaponType.NOTEBOOK,
            g.playerX,
            g.playerY,
            Math.cos(angle) * note.speed,
            Math.sin(angle) * note.speed,
            note.speed,
            (note.damage + (note.level * 4)) * g.damageMult,
            8,
            '#a855f7',
            50,
            50
          );
          p.targetEnemyId = victim.id;
          g.projectiles.push(p);
        }
        if (soundEnabled && total > 0) audio.playShoot();
      }
    }
  };

  // Update position of all projectiles
  const updateProjectiles = () => {
    const g = gameRef.current;
    
    // Create an extremely fast O(1) hash map indexing active enemies to avoid nested O(P * E) linear scans!
    const activeEnemyMap = new Map<string, Enemy>();
    g.enemies.forEach((e) => {
      if (e.hp > 0) {
        activeEnemyMap.set(e.id, e);
      }
    });
    
    g.projectiles.forEach((p) => {
      // Store trace trail
      p.px = p.x;
      p.py = p.y;

      if (p.type === WeaponType.DIARIO_DE_CLASSE) {
        // Orbit around player
        const diary = g.weapons[WeaponType.DIARIO_DE_CLASSE];
        p.orbitAngle = (p.orbitAngle || 0) + diary.speed;
        
        const radius = diary.range * g.rangeMult;
        p.x = g.playerX + Math.cos(p.orbitAngle) * radius;
        p.y = g.playerY + Math.sin(p.orbitAngle) * radius;
      } 
      else if (p.type === WeaponType.APOSTILA) {
        // Boomerang logic: flies out, then travels back to active player x/y
        p.life -= 1;
        const totalLife = p.maxLife;

        // Half life passed, switch to returning mode
        if (p.life < totalLife / 2) {
          p.returning = true;
        }

        if (p.returning) {
          const returnAngle = Math.atan2(g.playerY - p.y, g.playerX - p.x);
          p.vx = Math.cos(returnAngle) * p.speed * 1.3;
          p.vy = Math.sin(returnAngle) * p.speed * 1.3;
        }

        p.x += p.vx;
        p.y += p.vy;
      }
      else if (p.type === WeaponType.DATASHOW) {
        // Glued following the player
        p.life -= 1;
        p.x = g.playerX;
        p.y = g.playerY;
      }
      else if (p.type === WeaponType.NOTEBOOK && p.targetEnemyId) {
        // Homing towards targeted student id with O(1) map lookup
        p.life -= 1;
        const victim = activeEnemyMap.get(p.targetEnemyId);
        
        if (victim) {
          const aimAngle = Math.atan2(victim.y - p.y, victim.x - p.x);
          p.vx = Math.cos(aimAngle) * p.speed;
          p.vy = Math.sin(aimAngle) * p.speed;
        }
        
        p.x += p.vx;
        p.y += p.vy;
      }
      else {
        // Basic linear bullet motion
        p.life -= 1;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Apply scenario constraints to projectile
      if (scenario.type === ScenarioType.SALA_FECHADA) {
        const classroomHalfSize = Math.max(450, (Math.min(g.width, g.height) + 160) / 2);
        p.x = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, p.x));
        p.y = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, p.y));
      } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
        const corridorHalfWidth = (g.width - 40) / 2;
        p.x = Math.max(-corridorHalfWidth, Math.min(corridorHalfWidth, p.x));

        const corridorHeightLimit = 1200;
        if (p.y < -corridorHeightLimit) {
          p.y += 2 * corridorHeightLimit;
        } else if (p.y > corridorHeightLimit) {
          p.y -= 2 * corridorHeightLimit;
        }
      }
    });

    // Remove expired linear/light projectiles and recycle them to the pool
    const activeProjectiles: Projectile[] = [];
    g.projectiles.forEach((p) => {
      let keep = true;
      if (p.type === WeaponType.DIARIO_DE_CLASSE) {
        keep = g.weapons[WeaponType.DIARIO_DE_CLASSE].level > 0;
      } else {
        keep = p.life > 0;
      }

      if (keep) {
        activeProjectiles.push(p);
      } else {
        projectilePoolRef.current.push(p);
      }
    });
    g.projectiles = activeProjectiles;
  };

  const updateAOEWarnings = () => {
    const g = gameRef.current;
    g.warnings.forEach((aoe) => {
      aoe.timer -= 1;
      
      // Explosion triggers!
      if (aoe.timer <= 0) {
        // If player is within bounds, receive big damage
        const dist = getDistance(g.playerX, g.playerY, aoe.x, aoe.y);
        if (dist <= aoe.radius) {
          damagePlayer(aoe.damage, "Area-Of-Effect Boss strike!");
        }

        // Add explosion wave effects particles of paper
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI) / 4;
          spawnTextParticle("📄", aoe.x + Math.cos(angle) * 30, aoe.y + Math.sin(angle) * 30, '#f43f5e', 20);
        }
      }
    });

    g.warnings = g.warnings.filter(aoe => aoe.timer > 0);
  };

  // Move enemies and resolve attacks/collisions
  const updateEnemies = () => {
    const g = gameRef.current;

    g.enemies.forEach((e) => {
      // 1. Move towards player coordinates
      const angle = Math.atan2(g.playerY - e.y, g.playerX - e.x);
      
      // If Coordinate debuffed by "Aviso" warning slows them
      let speedFactor = 1.0;
      if (e.debuffTimer && e.debuffTimer > 0) {
        e.debuffTimer -= 1;
        speedFactor = selectedCharacterId === CharacterId.INGLES ? 0.35 : 0.5; // Mônica has a much stronger matrix slow!
      }

      e.x += Math.cos(angle) * e.speed * speedFactor;
      e.y += Math.sin(angle) * e.speed * speedFactor;
      e.angle = angle;

      // Apply map restrictions to enemies based on active scenario type
      if (scenario.type === ScenarioType.SALA_FECHADA) {
        const classroomHalfSize = Math.max(450, (Math.min(g.width, g.height) + 160) / 2);
        e.x = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, e.x));
        e.y = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, e.y));
      } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
        const corridorHalfWidth = (g.width - 40) / 2;
        e.x = Math.max(-corridorHalfWidth, Math.min(corridorHalfWidth, e.x));

        // Let the enemy vertically wrap in loop
        const corridorHeightLimit = 1200;
        if (e.y < -corridorHeightLimit) {
          e.y += 2 * corridorHeightLimit;
        } else if (e.y > corridorHeightLimit) {
          e.y -= 2 * corridorHeightLimit;
        }
      }

      // 2. Elite abilities triggers
      // Articuladora Pedagógica summons small minions
      if (e.type === EnemyType.ARTICULADORA_PEDAGOGICA) {
        e.summonTimer = (e.summonTimer || 0) + 1;
        if (e.summonTimer >= 180) { // every 3 seconds
          e.summonTimer = 0;
          // Spawn little extra chores nearby
          createEnemyEntity(EnemyType.MINION_TAREFA_EXTRA, e.x + Math.floor(Math.random() * 40 - 20), e.y + Math.floor(Math.random() * 40 - 20));
          if (Math.random() < 0.4) spawnEnemyQuoteBubble(e);
        }
      }

      // Coordenador Escolar shoots periodic warning circles
      if (e.type === EnemyType.COORDENADOR_ESCOLAR) {
        e.summonTimer = (e.summonTimer || 0) + 1;
        if (e.summonTimer >= 220) {
          e.summonTimer = 0;
          // Place slow zone aoe at player
          g.warnings.push({
            id: Math.random().toString(),
            x: g.playerX,
            y: g.playerY,
            radius: 80,
            timer: 90, // 1.5s delay warning
            maxTimer: 90,
            color: '#f97316',
            damage: 15
          });
          if (Math.random() < 0.5) spawnEnemyQuoteBubble(e);
        }
      }

      // Regular Boss Attack routines
      if (e.isBoss) {
        e.summonTimer = (e.summonTimer || 0) + 1;

        if (e.type === EnemyType.CHEF_CONSELHO_DEC_LASSE && e.summonTimer >= 220) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);
          // 1. Throws 4 infinite process folders towards the player
          for (let i = 0; i < 4; i++) {
            createEnemyEntity(
              EnemyType.FORMULARIO_INFINITO, 
              e.x + Math.floor(Math.random() * 80 - 40), 
              e.y + Math.floor(Math.random() * 80 - 40)
            );
          }
          // 2. Sprouts a line of red pens (canetas vermelhas) in front of player to block or damage
          const dx = g.playerX - e.x;
          const dy = g.playerY - e.y;
          const dLen = Math.sqrt(dx * dx + dy * dy);
          if (dLen > 20) {
            const ux = dx / dLen;
            const uy = dy / dLen;
            const px = -uy;
            const py = ux;
            const midX = e.x + ux * Math.min(180, dLen * 0.55);
            const midY = e.y + uy * Math.min(180, dLen * 0.55);
            
            for (let step = -2; step <= 2; step++) {
              g.warnings.push({
                id: 'pen-barrier-' + Math.random(),
                x: midX + px * step * 35,
                y: midY + py * step * 35,
                radius: 20,
                timer: 70,
                maxTimer: 70,
                color: '#dc2626',
                damage: 25
              });
            }
          }
        }

        if (e.type === EnemyType.CHEF_SABADO_LETIVO && e.summonTimer >= 180) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);
          // Stomp megaphone shout slowing down time (slow speed modifier and confuse/invert player control!)
          spawnTextParticle("TEMPO DESACELERADO! ⏰", g.playerX, g.playerY - 25, '#86198f', 24);
          
          g.playerSpeed = Math.max(0.9, g.playerSpeed * 0.4); // slow player heavily
          g.playerConfusionTimer = 150; // Inverted controls for 2.5 seconds!
          
          // Reset speed after 2.5 seconds
          setTimeout(() => {
            const charConfig = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharacterId) || PLAYABLE_CHARACTERS[0];
            g.playerSpeed = charConfig.baseSpeed * (1.0 + (permanentUpgrades.speedLevel * 0.10));
          }, 2500);

          // Spawn 3 stomp warning rings around player
          for (let k = 0; k < 3; k++) {
            g.warnings.push({
              id: 'stomp-' + Math.random(),
              x: g.playerX + Math.floor(Math.random() * 140 - 70),
              y: g.playerY + Math.floor(Math.random() * 140 - 70),
              radius: 80,
              timer: 60,
              maxTimer: 60,
              color: '#a21caf',
              damage: 20
            });
          }
        }

        if (e.type === EnemyType.CHEF_SEMANA_PEDAGOGICA && e.summonTimer >= 180) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);
          // Shoots multiple custom "palavras de ordem" (Words: Resiliência, Sinergia, Protagonismo, Mindset) outwards as projectiles!
          const words = ["Resiliência!", "Sinergia!", "Protagonismo!", "Mindset!", "Proatividade!", "Out of the box!"];
          for (let k = 0; k < words.length; k++) {
            const angleVal = (k * Math.PI * 2) / words.length;
            
            // Spawn them close to the center of the boss so they gracefully glide outwards.
            // This prevents them from spawning directly on top of players who are near the boss's visual boundary,
            // and gives the player time to see and react to the incoming word projectile!
            const spawnOffset = 15;
            const px = e.x + Math.cos(angleVal) * spawnOffset;
            const py = e.y + Math.sin(angleVal) * spawnOffset;

            const p = getProjectileFromPool(
              WeaponType.CANETA_VERMELHA,
              px,
              py,
              Math.cos(angleVal) * 4.2,
              Math.sin(angleVal) * 4.2,
              4.2,
              18,
              15,
              '#db2777',
              140,
              140
            );
            p.wordText = words[k];
            p.isEnemyBullet = true;
            g.projectiles.push(p);
          }

          // Shoots dynamic jargons directly targeting the player
          const dxPlayer = g.playerX - e.x;
          const dyPlayer = g.playerY - e.y;
          const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
          if (distPlayer > 10) {
            const aimAngle = Math.atan2(dyPlayer, dxPlayer);
            const targetedJargons = ["Briefing!", "Brainstorming!", "Feedback 360!", "Entregáveis!", "Metas!", "Smart!"];
            
            // Shoot 2 jargons in a small spread towards the player
            for (let i = -1; i <= 1; i += 2) {
              const spreadAngle = aimAngle + i * 0.22;
              const word = targetedJargons[Math.floor(Math.random() * targetedJargons.length)];
              const px = e.x + Math.cos(spreadAngle) * 15;
              const py = e.y + Math.sin(spreadAngle) * 15;
              
              const p = getProjectileFromPool(
                WeaponType.CANETA_VERMELHA,
                px,
                py,
                Math.cos(spreadAngle) * 4.8,
                Math.sin(spreadAngle) * 4.8,
                4.8,
                22, // slight extra damage as it's a direct threat!
                15,
                '#db2777',
                140,
                140
              );
              p.wordText = word;
              p.isEnemyBullet = true;
              g.projectiles.push(p);
            }
          }
        }

        // --- Custom Coordenadora de Registro (DIARIO_ATRASADO - Boss) ---
        if (e.type === EnemyType.DIARIO_ATRASADO && e.isBoss && e.summonTimer >= 150) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);

          // 1. Summons 2-3 standard DIARIO_ATRASADO paper items (as clean, smaller chasing units) nearby
          const count = 2 + Math.floor(Math.random() * 2);
          for (let k = 0; k < count; k++) {
            createEnemyEntity(
              EnemyType.DIARIO_ATRASADO, 
              e.x + Math.floor(Math.random() * 80 - 40), 
              e.y + Math.floor(Math.random() * 80 - 40)
            );
          }

          // 2. Fires standard red-marks word projectiles towards player
          const words = ["Falta!", "Sem Nota!", "Recuperação!", "Correção!"];
          const dxPlayer = g.playerX - e.x;
          const dyPlayer = g.playerY - e.y;
          const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
          if (distPlayer > 10) {
            const aimAngle = Math.atan2(dyPlayer, dxPlayer);
            for (let i = -1; i <= 1; i++) {
              const spreadAngle = aimAngle + i * 0.25;
              const word = words[Math.floor(Math.random() * words.length)];
              const px = e.x + Math.cos(spreadAngle) * 15;
              const py = e.y + Math.sin(spreadAngle) * 15;
              
              const p = getProjectileFromPool(
                WeaponType.CANETA_VERMELHA,
                px,
                py,
                Math.cos(spreadAngle) * 4.5,
                Math.sin(spreadAngle) * 4.5,
                4.5,
                19,
                15,
                '#ea580c',
                140,
                140
              );
              p.wordText = word;
              p.isEnemyBullet = true;
              g.projectiles.push(p);
            }
          }
        }

        // --- Custom Articuladora do Formulário / Monitoramento (FORMULARIO_INFINITO - Boss) ---
        if (e.type === EnemyType.FORMULARIO_INFINITO && e.isBoss && e.summonTimer >= 150) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);

          // 1. Summons 2-3 standard FORMULARIO_INFINITO paper items nearby
          const count = 2 + Math.floor(Math.random() * 2);
          for (let k = 0; k < count; k++) {
            createEnemyEntity(
              EnemyType.FORMULARIO_INFINITO, 
              e.x + Math.floor(Math.random() * 80 - 40), 
              e.y + Math.floor(Math.random() * 80 - 40)
            );
          }

          // 2. Fires paper/audit word projectiles towards player
          const words = ["Rubrica!", "Anexo IV!", "Xérox!", "Protocolo!"];
          const dxPlayer = g.playerX - e.x;
          const dyPlayer = g.playerY - e.y;
          const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
          if (distPlayer > 10) {
            const aimAngle = Math.atan2(dyPlayer, dxPlayer);
            for (let i = -1; i <= 1; i++) {
              const spreadAngle = aimAngle + i * 0.25;
              const word = words[Math.floor(Math.random() * words.length)];
              const px = e.x + Math.cos(spreadAngle) * 15;
              const py = e.y + Math.sin(spreadAngle) * 15;
              
              const p = getProjectileFromPool(
                WeaponType.CANETA_VERMELHA,
                px,
                py,
                Math.cos(spreadAngle) * 4.5,
                Math.sin(spreadAngle) * 4.5,
                4.5,
                18,
                15,
                '#16a34a',
                140,
                140
              );
              p.wordText = word;
              p.isEnemyBullet = true;
              g.projectiles.push(p);
            }
          }
        }

        // --- Custom Supervisora de Ensino (CONVOCACAO_REUNIAO - Boss) ---
        if (e.type === EnemyType.CONVOCACAO_REUNIAO && e.isBoss && e.summonTimer >= 150) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);

          // 1. Summons 2-3 standard CONVOCACAO_REUNIAO paper items nearby
          const count = 2 + Math.floor(Math.random() * 2);
          for (let k = 0; k < count; k++) {
            createEnemyEntity(
              EnemyType.CONVOCACAO_REUNIAO, 
              e.x + Math.floor(Math.random() * 80 - 40), 
              e.y + Math.floor(Math.random() * 80 - 40)
            );
          }

          // 2. Fires meeting/bureaucracy word projectiles towards player
          const words = ["Convocação!", "Justificativa!", "Pauta!", "Ata de Reunião!"];
          const dxPlayer = g.playerX - e.x;
          const dyPlayer = g.playerY - e.y;
          const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
          if (distPlayer > 10) {
            const aimAngle = Math.atan2(dyPlayer, dxPlayer);
            for (let i = -1; i <= 1; i++) {
              const spreadAngle = aimAngle + i * 0.25;
              const word = words[Math.floor(Math.random() * words.length)];
              const px = e.x + Math.cos(spreadAngle) * 15;
              const py = e.y + Math.sin(spreadAngle) * 15;
              
              const p = getProjectileFromPool(
                WeaponType.CANETA_VERMELHA,
                px,
                py,
                Math.cos(spreadAngle) * 4.6,
                Math.sin(spreadAngle) * 4.6,
                4.6,
                20,
                15,
                '#f43f5e',
                140,
                140
              );
              p.wordText = word;
              p.isEnemyBullet = true;
              g.projectiles.push(p);
            }
          }
        }

        // Add boss behaviors for ALUNO_DO_FUNDAO when spawned as a boss (Zeca do Fundão Supremo)
        if (e.type === EnemyType.ALUNO_DO_FUNDAO && e.summonTimer >= 140) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);
          
          const dxPlayer = g.playerX - e.x;
          const dyPlayer = g.playerY - e.y;
          const distPlayer = Math.sqrt(dxPlayer * dxPlayer + dyPlayer * dyPlayer);
          if (distPlayer > 10) {
            const aimAngle = Math.atan2(dyPlayer, dxPlayer);
            // Shoot 3 crumpled paper balls (bolinha de papel) as a boss spread attack
            for (let i = -1; i <= 1; i++) {
              const spreadAngle = aimAngle + i * 0.18;
              const px = e.x + Math.cos(spreadAngle) * 15;
              const py = e.y + Math.sin(spreadAngle) * 15;
              
              const p = getProjectileFromPool(
                WeaponType.CANETA_VERMELHA,
                px,
                py,
                Math.cos(spreadAngle) * 5.2,
                Math.sin(spreadAngle) * 5.2,
                5.2,
                Math.round(e.damage * 0.85),
                12, // size
                '#cbd5e1', // paper gray
                180,
                180
              );
              p.isEnemyBullet = true;
              p.isPaperBall = true;
              g.projectiles.push(p);
            }
          }
        }

        if (e.type === EnemyType.CHEF_FECHAMENTO_UNIDADE && e.summonTimer >= 180) {
          e.summonTimer = 0;
          spawnEnemyQuoteBubble(e);

          // Spawns multiple Diários Atrasados and Tarefas Extras in mass
          for (let k = 0; k < 4; k++) {
            createEnemyEntity(EnemyType.DIARIO_ATRASADO, e.x + Math.floor(Math.random() * 100 - 50), e.y + Math.floor(Math.random() * 100 - 50));
            createEnemyEntity(EnemyType.MINION_TAREFA_EXTRA, e.x + Math.floor(Math.random() * 100 - 50), e.y + Math.floor(Math.random() * 100 - 50));
          }

          // Chaotic mega boss warning circles at player
          g.warnings.push({
            id: 'apocalypse-' + Math.random(),
            x: g.playerX,
            y: g.playerY,
            radius: 140,
            timer: 70,
            maxTimer: 70,
            color: '#dc2626',
            damage: 32
          });
        }
      }

      // 3. Collision: Enemy touching Player deals damage (optimized with bounding box) and push enemy back
      const playerRadius = selectedCharacterId === CharacterId.ED_FISICA ? 17 : 14;
      const dxPlayer = Math.abs(g.playerX - e.x);
      const dyPlayer = Math.abs(g.playerY - e.y);
      
      // Tighten the contact damage hitbox of giant bosses so the player doesn't take damage
      // when touching empty parts of the large boss sprite frame!
      const enemyCollisionRadius = e.isBoss ? e.size * 0.55 : e.size;
      const maxTouchDist = enemyCollisionRadius + playerRadius;
      
      if (dxPlayer <= maxTouchDist && dyPlayer <= maxTouchDist) {
        const distToPlayer = getDistance(g.playerX, g.playerY, e.x, e.y);
        if (distToPlayer <= maxTouchDist) {
          // Push enemy back so they don't enter inside the teacher
          const overlap = maxTouchDist - distToPlayer;
          if (distToPlayer > 0.1) {
            e.x += ((e.x - g.playerX) / distToPlayer) * overlap;
            e.y += ((e.y - g.playerY) / distToPlayer) * overlap;
          } else {
            const randAngle = Math.random() * Math.PI * 2;
            e.x += Math.cos(randAngle) * maxTouchDist;
            e.y += Math.sin(randAngle) * maxTouchDist;
          }

          // Deals damage once per 40 ticks to allow reaction times
          if (g.totalTicks % 40 === 0) {
            let damageToTake = e.damage;
            // Coordenador can applying "Aviso" status slow effect
            if (e.type === EnemyType.COORDENADOR_ESCOLAR) {
              damageToTake = e.damage;
              // Message removed per user intent when teacher takes damage
              // Apply temporal debuff to player velocity (simulated via decreasing movespeed)
              g.playerSpeed = Math.max(1.8, g.playerSpeed * 0.7);
              setTimeout(() => {
                // restore
                const charConfig = PLAYABLE_CHARACTERS.find(c => c.id === selectedCharacterId) || PLAYABLE_CHARACTERS[0];
                g.playerSpeed = charConfig.baseSpeed * (1.0 + (permanentUpgrades.speedLevel * 0.10));
              }, 3000);
            }

            damagePlayer(damageToTake, e.name);
            // Show quick screen shake trigger (handled in drawing bounds)
          }
        }
      }

      // 4. Random Humor bubble quotes above individual students
      e.quoteCooldown -= 1;
      if (e.quoteCooldown <= 0) {
        e.quoteCooldown = Math.floor(Math.random() * 600) + 350; // every 6-10 seconds
        spawnEnemyQuoteBubble(e);
      }
    });

    // 4.5. Student-Student Separation Collision Resolution (prevents enemies from stacking into a single point)
    for (let i = 0; i < g.enemies.length; i++) {
      const e1 = g.enemies[i];
      if (e1.hp <= 0) continue;
      for (let j = i + 1; j < g.enemies.length; j++) {
        const e2 = g.enemies[j];
        if (e2.hp <= 0) continue;

        const dx = e2.x - e1.x;
        const dy = e2.y - e1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = (e1.size + e2.size) * 0.85; // Allow slight organic overlapping
        if (dist < minDist) {
          const overlap = minDist - dist;
          const pushX = (dx / (dist || 1)) * overlap * 0.45;
          const pushY = (dy / (dist || 1)) * overlap * 0.45;

          e1.x -= pushX;
          e1.y -= pushY;
          e2.x += pushX;
          e2.y += pushY;
        }
      }
    }

    // 5. Standalone High-Performance Projectile-Enemy Collision Check (O(P * E_local) with early exits and active checks)
    g.projectiles.forEach((p) => {
      if (p.life <= 0) return; // Skip dead projectiles

      if (p.isEnemyBullet) {
        // Collide with PLAYER instead of enemies!
        const playerRadius = selectedCharacterId === CharacterId.ED_FISICA ? 17 : 14;
        // Tighten the collision bubble (taking 60% of bullet size + 70% of player radius) to feel fair and physically accurate
        const maxHitDist = p.size * 0.6 + playerRadius * 0.7;
        const dxHit = Math.abs(p.x - g.playerX);
        const dyHit = Math.abs(p.y - g.playerY);
        if (dxHit > maxHitDist || dyHit > maxHitDist) return;

        const hitDist = getDistance(p.x, p.y, g.playerX, g.playerY);
        if (hitDist <= maxHitDist) {
          const dmgSource = p.isPaperBall ? "Bolinha de Papel" : "Jargão do Boss!";
          damagePlayer(p.damage, dmgSource);
          p.life = 0;
        }
        return;
      }

      g.enemies.forEach((e) => {
        if (p.life <= 0) return; // If projectile got destroyed in an earlier collision this tick
        if (e.hp <= 0) return; // Skip already dead enemies

        // Check if DATASHOW projectile (needs rotated segment-to-circle collision check)
        if (p.type === WeaponType.DATASHOW) {
          const beamAngle = p.angle || 0;
          const length = (p.range || 400) * g.rangeMult;
          
          const relX = e.x - g.playerX;
          const relY = e.y - g.playerY;
          
          const cosA = Math.cos(beamAngle);
          const sinA = Math.sin(beamAngle);
          
          const localX = relX * cosA + relY * sinA;
          const localY = -relX * sinA + relY * cosA;
          
          const closestX = Math.max(0, Math.min(localX, length));
          const closestY = Math.max(-p.size / 2, Math.min(localY, p.size / 2));
          
          const dx = localX - closestX;
          const dy = localY - closestY;
          const distanceSquared = dx * dx + dy * dy;
          
          const isHit = distanceSquared <= (e.size * e.size);
          if (isHit) {
            // Piercing beam, damage resolved only every 12 ticks to avoid melting
            if (g.totalTicks % 12 === 0) {
              dealDamageToEnemy(e, p.damage, p.color);
            }
          }
          return;
        }

        const maxHitDist = p.size + e.size;
        const dxHit = Math.abs(p.x - e.x);
        if (dxHit > maxHitDist) return; // Quick X-axis bounding box cull

        const dyHit = Math.abs(p.y - e.y);
        if (dyHit > maxHitDist) return; // Quick Y-axis bounding box cull

        // Inside bounding box - now check precise circle distance
        const hitDist = getDistance(p.x, p.y, e.x, e.y);
        if (hitDist <= maxHitDist) {
          // Special damage resolution criteria depending on weapons
          if (p.type === WeaponType.DIARIO_DE_CLASSE) {
            // High knockback! pushes students backward from orbit shield
            const pushAngle = Math.atan2(e.y - g.playerY, e.x - g.playerX);
            e.x += Math.cos(pushAngle) * 35;
            e.y += Math.sin(pushAngle) * 35;

            dealDamageToEnemy(e, p.damage, p.color);
            if (soundEnabled && Math.random() < 0.20) audio.playHit();
          }
          else {
            // Regular projectile (e.g., Caneta, Apostila)
            dealDamageToEnemy(e, p.damage, p.color);
            
            // Caneta level 4+ has multi pierces
            if (p.type === WeaponType.CANETA_VERMELHA) {
              p.life = 0; // dies
            } 
            else if (p.type === WeaponType.NOTEBOOK) {
              p.life = 0; // email hits, explodes
            }
            else if (p.type === WeaponType.APOSTILA) {
              // Apostila pierces, keep returning untouched but reduce impact slightly
              p.damage = Math.max(5, p.damage * 0.85);
            }

            if (soundEnabled) audio.playHit();
          }
        }
      });
    });

    // Resolve enemy-enemy overlapping collisions to prevent them from stacking (optimized with bounding box check, visible close radius, and alternating ticks to save mobile CPU cycles)
    if (g.totalTicks % 2 === 0) {
      const activeCloseEnemies = g.enemies.filter(e => {
        return Math.abs(e.x - g.playerX) < 220 && Math.abs(e.y - g.playerY) < 220;
      });

      for (let i = 0; i < activeCloseEnemies.length; i++) {
        const e1 = activeCloseEnemies[i];

        for (let j = i + 1; j < activeCloseEnemies.length; j++) {
          const e2 = activeCloseEnemies[j];
          
          const dx = e2.x - e1.x;
          const dy = e2.y - e1.y;
          
          // Fast bounding box check to bypass costly square root calculations for far elements
          const minDist = (e1.size + e2.size) * 0.92; // 8% visual overlap is organic
          if (Math.abs(dx) >= minDist || Math.abs(dy) >= minDist) {
            continue;
          }
          
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            const overlap = minDist - dist;
            let pushX = 0;
            let pushY = 0;
            
            if (dist === 0) {
              const randAngle = Math.random() * Math.PI * 2;
              pushX = Math.cos(randAngle) * overlap;
              pushY = Math.sin(randAngle) * overlap;
            } else {
              pushX = (dx / dist) * overlap;
              pushY = (dy / dist) * overlap;
            }
            
            if (e1.isBoss && !e2.isBoss) {
              e2.x += pushX;
              e2.y += pushY;
            } else if (e2.isBoss && !e1.isBoss) {
              e1.x -= pushX;
              e1.y -= pushY;
            } else {
              e1.x -= pushX * 0.5;
              e1.y -= pushY * 0.5;
              e2.x += pushX * 0.5;
              e2.y += pushY * 0.5;
            }
          }
        }
      }
    }

    // Handle dead enemies, dropping XP gems & coins
    const activeEnemies: Enemy[] = [];
    g.enemies.forEach((e) => {
      if (e.hp > 0) {
        activeEnemies.push(e);
      } else {
        enemyPoolRef.current.push(e);
        g.playerDefeated += 1;
        
        // Spawn Coins or XP Gem based on Luck factor
        const dice = Math.random() * g.luckMult;
        let ptype = PowerUpType.XP;
        let col = '#10b981'; // Green XP gem
        let pval = e.xpValue;

        if (dice > 0.85) {
          ptype = PowerUpType.COIN;
          col = '#fbbf24'; // Golden Coins
          pval = Math.floor(Math.random() * 3) + 1;
        } else if (dice > 0.98 || (e.isElite && dice > 0.6)) {
          ptype = PowerUpType.MEDKIT;
          col = '#ef4444'; // Red medicine
          pval = 30; // 30 hp heal
        } else if (dice > 0.96) {
          ptype = PowerUpType.CAFE_PICKUP;
          col = '#f97316'; // Coffee cup recovery item
          pval = 1;
        }

        // Push drops list
        g.powerUps.push({
          id: Math.random().toString(),
          x: e.x,
          y: e.y,
          type: ptype,
          value: pval,
          size: ptype === PowerUpType.MEDKIT ? 8 : 6,
          color: col
        });

        // If boss dies, we also drop a dynamic Chest loot, bonus coins, and a MAGNET!
        if (e.isBoss) {
          g.playerGoldGained += 50; // extra cash reward
          g.powerUps.push({
            id: Math.random().toString(),
            x: e.x - 10,
            y: e.y - 10,
            type: PowerUpType.CHEST,
            value: 100, // triggers automatic massive level up booster
            size: 15,
            color: '#a855f7'
          });
          
          g.powerUps.push({
            id: Math.random().toString(),
            x: e.x + 15,
            y: e.y + 15,
            type: PowerUpType.MAGNET,
            value: 1,
            size: 12,
            color: '#ef4444'
          });
          
          spawnTextParticle("Materia Concluída! 🎓", e.x, e.y - 15, '#fbbf24', 24);

          // Check if this defeated boss is the final boss for the current scenario
          let isFinalBoss = false;
          if (scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE && e.type === EnemyType.CHEF_SEMANA_PEDAGOGICA) {
            isFinalBoss = true;
          } else if (scenario.type === ScenarioType.SALA_DE_AULA && e.type === EnemyType.CHEF_CONSELHO_DEC_LASSE) {
            isFinalBoss = true;
          } else if (scenario.type === ScenarioType.SALA_FECHADA && e.type === EnemyType.CHEF_SABADO_LETIVO) {
            isFinalBoss = true;
          } else if (scenario.type === ScenarioType.CORREDOR_ESCOLAR && e.type === EnemyType.CHEF_SABADO_LETIVO) {
            isFinalBoss = true;
          } else if (scenario.type === ScenarioType.CORREDOR_INFINITO && e.type === EnemyType.CHEF_SEMANA_PEDAGOGICA) {
            isFinalBoss = true;
          } else if (scenario.type === ScenarioType.CONSELHO_DE_CLASSE_STAGE && e.type === EnemyType.CHEF_FECHAMENTO_UNIDADE) {
            isFinalBoss = true;
          } else if (e.type === EnemyType.CHEF_FECHAMENTO_UNIDADE) {
            isFinalBoss = true;
          }

          if (isFinalBoss) {
             triggerVictory();
          }
        }
      }
    });
    g.enemies = activeEnemies;
  };

  const spawnEnemyQuoteBubble = (e: Enemy) => {
    const qList = ENEMY_QUOTES[e.type];
    if (qList && qList.length > 0) {
      const randomQuote = qList[Math.floor(Math.random() * qList.length)];
      // Spawn floating humor text above student coordinates!
      spawnTextParticle(`"${randomQuote}"`, e.x, e.y - 18, '#ffffff', 11, true); // true for chat speech bubble looks
    }
  };

  const dealDamageToEnemy = (e: Enemy, dmg: number, col: string) => {
    e.hp -= dmg;
    // Spawn floating damage numbers particle
    spawnTextParticle(Math.floor(dmg).toString(), e.x, e.y - 12, col, 12);
  };

  const damagePlayer = (dmg: number, source: string) => {
    const g = gameRef.current;
    if (g.gameOverTriggered || g.victoryTriggered) return;

    // Respect the invincibility/cooldown frame timer!
    if (g.playerDamageCooldownTimer && g.playerDamageCooldownTimer > 0) {
      return;
    }

    g.playerHp -= dmg;
    g.playerFlashTicks = 15; // 15 frames of hit flash & shake
    // Give the player brief invincibility frames (i-frames) after being hit, prevents instant melting/duplicate frame strikes!
    g.playerDamageCooldownTimer = 25; 
    audio.playPlayerDamage();

    // Damage warning floating text removed per user intent

    if (g.playerHp <= 0) {
      g.playerHp = 0;
      triggerGameOver();
    }
  };

  const updateCollectibles = () => {
    const g = gameRef.current;
    
    // Magnet reach increases based on level and permanent luck
    // Base 85px, amplified by luck attributes
    const magnetRange = 85 * g.luckMult;

    g.powerUps.forEach((up) => {
      // Direct bounding box optimization: skip distant offscreen items
      const dx = Math.abs(up.x - g.playerX);
      const dy = Math.abs(up.y - g.playerY);

      if (!up.attracted && (dx > magnetRange || dy > magnetRange)) {
        return;
      }

      const dist = getDistance(g.playerX, g.playerY, up.x, up.y);
      
      // If within magnet range, pull towards student teacher
      if (dist <= magnetRange) {
        up.attracted = true;
      }

      if (up.attracted) {
        const pullAngle = Math.atan2(g.playerY - up.y, g.playerX - up.x);
        const magnetSpeed = 8.5;
        up.x += Math.cos(pullAngle) * magnetSpeed;
        up.y += Math.sin(pullAngle) * magnetSpeed;
      }

      // Maintain boundary positioning for collectibles based on active scenario type
      if (scenario.type === ScenarioType.SALA_FECHADA) {
        const classroomHalfSize = Math.max(450, (Math.min(g.width, g.height) + 160) / 2);
        up.x = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, up.x));
        up.y = Math.max(-classroomHalfSize, Math.min(classroomHalfSize, up.y));
      } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
        const corridorHalfWidth = (g.width - 40) / 2;
        up.x = Math.max(-corridorHalfWidth, Math.min(corridorHalfWidth, up.x));

        const corridorHeightLimit = 1200;
        if (up.y < -corridorHeightLimit) {
          up.y += 2 * corridorHeightLimit;
        } else if (up.y > corridorHeightLimit) {
          up.y -= 2 * corridorHeightLimit;
        }
      }

      // Check pickup overlap boundaries
      if (dist <= 18) {
        // Overlap trigger achieved!
        if (up.type === PowerUpType.XP) {
          // Grant XP boosted by permanent attributes
          const xpGained = Math.floor(up.value * g.xpMult);
          g.playerXp += xpGained;

          // Check if level achieved!
          while (g.playerXp >= g.playerXpNeeded) {
            g.playerXp -= g.playerXpNeeded;
            g.playerLevel += 1;
            g.playerXpNeeded = Math.floor(g.playerXpNeeded * 1.45) + 3;
            
            // Freeze and present level-up choices cards
            handleLevelUp();
          }
        } 
        else if (up.type === PowerUpType.COIN) {
          g.playerGoldGained += up.value;
          if (soundEnabled) audio.playCoin();
        }
        else if (up.type === PowerUpType.MEDKIT) {
          g.playerHp = Math.min(g.playerMaxHp, g.playerHp + up.value);
          spawnTextParticle("+Regeneração 🩹", g.playerX, g.playerY - 25, '#10b981', 14);
          if (soundEnabled) audio.playCoin();
        }
        else if (up.type === PowerUpType.CAFE_PICKUP) {
          // Instantly gain Café level boost OR heal and give speed burst
          const cafe = g.weapons[WeaponType.CAFE];
          if (cafe.level < cafe.maxLevel) {
            cafe.level += 1;
            spawnTextParticle("CAFÉ DOPADO! ☕", g.playerX, g.playerY - 25, '#f97316', 15);
          } else {
             // heal instead
             g.playerHp = Math.min(g.playerMaxHp, g.playerHp + 25);
             spawnTextParticle("CAFENEUTICA +HP ☕", g.playerX, g.playerY - 25, '#f97316', 15);
          }
          if (soundEnabled) audio.playCoin();
        }
        else if (up.type === PowerUpType.CHEST) {
          // Super Level Up trigger!
          g.playerXp += g.playerXpNeeded; // forces auto level level booster
          while (g.playerXp >= g.playerXpNeeded) {
            g.playerXp -= g.playerXpNeeded;
            g.playerLevel += 1;
            g.playerXpNeeded = Math.floor(g.playerXpNeeded * 1.45) + 3;
            handleLevelUp();
          }
        }
        else if (up.type === PowerUpType.MAGNET) {
          // Attract all XP gems and coins currently active in the arena
          g.powerUps.forEach((item) => {
            if (item.type === PowerUpType.XP || item.type === PowerUpType.COIN) {
              item.attracted = true;
            }
          });
          spawnTextParticle("SUPER ÍMÃ! 🧲", g.playerX, g.playerY - 25, '#3b82f6', 16);
          if (soundEnabled) audio.playCoin();
        }

        // Expire drop item
        up.id = 'DESTROYED';
      }
    });

    g.powerUps = g.powerUps.filter(up => up.id !== 'DESTROYED');
  };

  const updateParticles = () => {
    const g = gameRef.current;
    g.particles.forEach((p) => {
      p.life -= 1;
      p.x += p.vx;
      p.y += p.vy;
    });
    g.particles = g.particles.filter(p => p.life > 0);
  };

  const spawnTextParticle = (text: string, x: number, y: number, color: string, fontSize: number, isQuote: boolean = false) => {
    const g = gameRef.current;
    
    // Cap active floating particles to 40 to avoid visual clutter and processing lag
    if (g.particles.length >= 40) {
      g.particles.shift();
    }

    g.particles.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      life: isQuote ? 110 : 38,
      maxLife: isQuote ? 110 : 38,
      vx: (Math.random() - 0.5) * 1.2,
      vy: isQuote ? -0.4 : -1.8, // floats up
      fontSize
    });
  };

  // Canvas visual rendering routines
  const renderGame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Keep pixel art perfectly crisp and clean and disable anti-aliasing to maximize mobile performance
    ctx.imageSmoothingEnabled = false;
    (ctx as any).mozImageSmoothingEnabled = false;
    (ctx as any).webkitImageSmoothingEnabled = false;
    (ctx as any).msImageSmoothingEnabled = false;

    const g = gameRef.current;

    // A. Clear background with Scenario style
    ctx.fillStyle = scenario.floorColor;
    ctx.fillRect(0, 0, g.width, g.height);

    // B. Save Context, set camera relative to player centered position
    ctx.save();
    
    // Camera center point coordinates is screen_size / 2
    const camX = g.width / 2;
    const camY = g.height / 2;
    ctx.translate(camX - g.playerX, camY - g.playerY);

    // C. Draw infinite school floors grids
    drawFloorGrid(ctx);

    // D. Draw Boss Warnings Circles (AOEs)
    g.warnings.forEach((aoe) => {
      const progressAlpha = aoe.timer / aoe.maxTimer;
      ctx.beginPath();
      ctx.arc(aoe.x, aoe.y, aoe.radius, 0, Math.PI * 2);
      ctx.fillStyle = `${aoe.color}15`; // transparent warning
      ctx.fill();
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = `${aoe.color}b0`; // solid, static non-pulsing outer border
      ctx.stroke();

      if (aoe.id.startsWith('pen-barrier')) {
        // DRAW RED PENS SPROUTING FROM THE FLOOR (CUSTOM BLOCK)
        ctx.save();
        ctx.translate(aoe.x, aoe.y);
        
        // Sprouting height animation based on progress (slide up)
        const heightMultiplier = 1 - progressAlpha;
        const penH = 26 * heightMultiplier;
        
        ctx.fillStyle = '#dc2626'; // Hot red pen body
        ctx.fillRect(-3, -penH / 2, 6, penH);
        
        ctx.fillStyle = '#ffffff'; // White correction stripe
        ctx.fillRect(-2, -penH / 2 + 1, 4, 2);
        
        ctx.fillStyle = '#facc15'; // Golden pen cap accent
        ctx.fillRect(-3, penH / 2 - 2, 6, 2);
        
        ctx.restore();
      } else {
        // Draw danger cross lines inside
        ctx.beginPath();
        ctx.moveTo(aoe.x - aoe.radius * 0.5, aoe.y);
        ctx.lineTo(aoe.x + aoe.radius * 0.5, aoe.y);
        ctx.moveTo(aoe.x, aoe.y - aoe.radius * 0.5);
        ctx.lineTo(aoe.x, aoe.y + aoe.radius * 0.5);
        ctx.strokeStyle = `${aoe.color}35`;
        ctx.stroke();
      }
    });

    // E. Draw Powerups on ground floor
    g.powerUps.forEach((up) => {
      // Frustum/viewport culling: skip drawing elements that are far offscreen
      const halfW = g.width / 2;
      const halfH = g.height / 2;
      const margin = up.size + 40; // buffer spacing
      if (
        up.x < g.playerX - halfW - margin ||
        up.x > g.playerX + halfW + margin ||
        up.y < g.playerY - halfH - margin ||
        up.y > g.playerY + halfH + margin
      ) {
        return;
      }

      if (up.type === PowerUpType.XP) {
        const size = (up.size || 6) * 1.5;
        // Faceted emerald crystal / wisdom gem
        ctx.beginPath();
        ctx.moveTo(up.x, up.y - size); // Top
        ctx.lineTo(up.x + size * 0.8, up.y - size * 0.2); // Mid-top right
        ctx.lineTo(up.x + size * 0.4, up.y + size); // Bottom right
        ctx.lineTo(up.x - size * 0.4, up.y + size); // Bottom left
        ctx.lineTo(up.x - size * 0.8, up.y - size * 0.2); // Mid-top left
        ctx.closePath();
        ctx.fillStyle = '#059669'; // Emerald dark green base
        ctx.fill();
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = '#020617';
        ctx.stroke();

        // Facets for premium shining diamond effect
        ctx.beginPath();
        ctx.moveTo(up.x, up.y - size);
        ctx.lineTo(up.x + size * 0.8, up.y - size * 0.2);
        ctx.lineTo(up.x, up.y);
        ctx.closePath();
        ctx.fillStyle = '#10b981'; // Emerald medium
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(up.x, up.y - size);
        ctx.lineTo(up.x - size * 0.8, up.y - size * 0.2);
        ctx.lineTo(up.x, up.y);
        ctx.closePath();
        ctx.fillStyle = '#34d399'; // Emerald light
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(up.x - size * 0.8, up.y - size * 0.2);
        ctx.lineTo(up.x - size * 0.4, up.y + size);
        ctx.lineTo(up.x, up.y);
        ctx.closePath();
        ctx.fillStyle = '#a7f3d0'; // Very light mint shine
        ctx.fill();
      }
      else if (up.type === PowerUpType.COIN) {
        const size = (up.size || 6) * 1.5;
        const angle = (Date.now() / 240) % (Math.PI * 2); 
        const spinScale = Math.sin(angle); 
        
        ctx.save();
        ctx.translate(up.x, up.y);
        // Simulates 3D spinning coin
        ctx.scale(Math.abs(spinScale) < 0.25 ? 0.25 : spinScale, 1.0); 

        // Glowing outer gold ring
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = '#d97706'; // Golden amber
        ctx.fill();
        ctx.lineWidth = 1.25;
        ctx.strokeStyle = '#020617';
        ctx.stroke();

        // Inner coin core
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.72, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24'; // Solid yellow
        ctx.fill();

        // Dynamic highlight crescent inner ring
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a'; // Bright shine yellow
        ctx.fill();

        // Centered coin text
        ctx.fillStyle = '#78350f'; // Dark amber print
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);

        ctx.restore();
      }
      else if (up.type === PowerUpType.MEDKIT) {
        const w = 15;
        const h = 11;
        
        // Handle on top
        ctx.fillStyle = '#475569';
        ctx.fillRect(up.x - 3.5, up.y - h / 2 - 2, 7, 2);
        
        // Medkit bag body
        ctx.fillStyle = '#ffffff'; 
        ctx.fillRect(up.x - w / 2, up.y - h / 2, w, h);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';
        ctx.strokeRect(up.x - w / 2, up.y - h / 2, w, h);

        // Medical red cross sign
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(up.x - 4, up.y - 1, 8, 2); // Horiz
        ctx.fillRect(up.x - 1, up.y - 4, 2, 8); // Vert
      }
      else if (up.type === PowerUpType.CAFE_PICKUP) {
        const size = 6.5;
        
        // Orange rising hot coffee steam lines
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(up.x - 2, up.y - size + 1);
        ctx.bezierCurveTo(up.x - 4, up.y - size - 2, up.x, up.y - size - 4, up.x - 2, up.y - size - 6);
        ctx.moveTo(up.x + 2, up.y - size + 1);
        ctx.bezierCurveTo(up.x, up.y - size - 2, up.x + 4, up.y - size - 4, up.x + 2, up.y - size - 6);
        ctx.stroke();

        // Mug outer handle
        ctx.beginPath();
        ctx.arc(up.x + 4.5, up.y + 1, 3.5, -Math.PI / 2, Math.PI / 2);
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.strokeStyle = '#ffffff'; // handle interior color
        ctx.lineWidth = 1.25;
        ctx.stroke();

        // Mug body
        ctx.fillStyle = '#ef4444'; // Red mug
        ctx.fillRect(up.x - 5, up.y - 1, 10, 8);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';
        ctx.strokeRect(up.x - 5, up.y - 1, 10, 8);

        // Coffee liquid level visible at the top rim
        ctx.fillStyle = '#78350f'; // Dark roasted coffee brown
        ctx.fillRect(up.x - 4, up.y - 2.5, 8, 2);
      }
      else if (up.type === PowerUpType.CHEST) {
        const w = 18;
        const h = 13;
        
        // Wood vintage treasure chest
        ctx.fillStyle = '#78350f'; // rich mahogany brown
        ctx.fillRect(up.x - w / 2, up.y - h / 2, w, h);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';
        ctx.strokeRect(up.x - w / 2, up.y - h / 2, w, h);

        // Gold luxury side ribbing
        ctx.fillStyle = '#eab308'; // gleaming gold bars
        ctx.fillRect(up.x - w / 2, up.y - h / 2, 2.5, h);
        ctx.fillRect(up.x + w / 2 - 2.5, up.y - h / 2, 2.5, h);

        // Metallic lock details
        ctx.fillStyle = '#cbd5e1'; 
        ctx.fillRect(up.x - 2, up.y - 1, 4, 5);
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#020617';
        ctx.strokeRect(up.x - 2, up.y - 1, 4, 5);
      }
      else if (up.type === PowerUpType.MAGNET) {
        const size = 12;
        ctx.save();
        ctx.translate(up.x, up.y);
        
        // Subtle hover / spin animation
        const hoverAngle = (Date.now() / 300) % (Math.PI * 2);
        ctx.rotate(Math.sin(hoverAngle) * 0.15 - Math.PI / 4);

        // 1. Draw thick black silhouette outline
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#020617';
        
        ctx.beginPath();
        ctx.arc(0, 1, size * 0.45, Math.PI, 0, true);
        ctx.lineTo(size * 0.45, -size * 0.5);
        ctx.moveTo(-size * 0.45, 1);
        ctx.lineTo(-size * 0.45, -size * 0.5);
        ctx.stroke();

        // 2. Draw red body
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#dc2626'; // Red
        ctx.beginPath();
        ctx.arc(0, 1, size * 0.45, Math.PI, 0, true);
        ctx.lineTo(size * 0.45, -size * 0.2);
        ctx.moveTo(-size * 0.45, 1);
        ctx.lineTo(-size * 0.45, -size * 0.2);
        ctx.stroke();

        // 3. Draw silver tips
        ctx.strokeStyle = '#f1f5f9'; // Silver/white
        ctx.beginPath();
        ctx.moveTo(size * 0.45, -size * 0.2);
        ctx.lineTo(size * 0.45, -size * 0.5);
        ctx.moveTo(-size * 0.45, -size * 0.2);
        ctx.lineTo(-size * 0.45, -size * 0.5);
        ctx.stroke();

        ctx.restore();
      }
      else {
        // Generic fallback
        ctx.beginPath();
        ctx.arc(up.x, up.y, up.size, 0, Math.PI * 2);
        ctx.fillStyle = up.color;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#020617';
        ctx.stroke();
      }
    });

    // F. Draw Projectiles
    g.projectiles.forEach((p) => {
      // Frustum/viewport culling: skip drawing offscreen projectiles (except DATASHOW beam which anchors on player)
      if (p.type !== WeaponType.DATASHOW) {
        const halfW = g.width / 2;
        const halfH = g.height / 2;
        const margin = p.size + 40;
        if (
          p.x < g.playerX - halfW - margin ||
          p.x > g.playerX + halfW + margin ||
          p.y < g.playerY - halfH - margin ||
          p.y > g.playerY + halfH + margin
        ) {
          return;
        }
      }

      ctx.save();
      
      if (p.isPaperBall) {
        // Draw crumpled paper ball
        ctx.translate(p.x, p.y);
        ctx.rotate(g.totalTicks * 0.08);
        ctx.fillStyle = '#f8fafc'; // light gray crumpled paper color
        ctx.strokeStyle = '#64748b'; // slate outline/detail lines
        ctx.lineWidth = 1.8;
        
        ctx.beginPath();
        // Crumpled polygonal shape
        const points = 7;
        for (let i = 0; i < points; i++) {
          const angle = (i * Math.PI * 2) / points + (i % 2 === 0 ? 0.1 : -0.1);
          const r = p.size * (0.85 + (i % 3 === 0 ? 0.25 : i % 2 === 0 ? -0.15 : 0.05));
          if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
          else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Scribble details inside
        ctx.beginPath();
        ctx.moveTo(-p.size * 0.4, -p.size * 0.2);
        ctx.lineTo(p.size * 0.2, p.size * 0.3);
        ctx.moveTo(p.size * 0.3, -p.size * 0.3);
        ctx.lineTo(-p.size * 0.2, p.size * 0.1);
        ctx.stroke();
      }
      else if (p.wordText) {
        // Measure text width for perfect dynamic padding
        ctx.font = 'bold 11px sans-serif';
        const textWidth = ctx.measureText(p.wordText).width;
        
        // Add dynamic padding
        const padX = 8;
        const padY = 5;
        const w = textWidth + padX * 2;
        const h = 14 + padY * 2; // total height is around 24
        
        ctx.translate(p.x, p.y);
        
        // Draw Speech Bubble box centered
        const rx = -w / 2;
        const ry = -h / 2;
        
        // Draw main white body
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2d061c'; // Dark contrast outline
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(rx, ry, w, h, 6);
        } else {
          ctx.rect(rx, ry, w, h);
        }
        ctx.fill();
        ctx.stroke();
        
        // Draw the directional pointer tail pointing down
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#2d061c';
        ctx.lineWidth = 2.5;
        
        ctx.beginPath();
        ctx.moveTo(-5, h / 2);
        ctx.lineTo(-8, h / 2 + 7); // sharp tail pointing down-left
        ctx.lineTo(2, h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Mask the border between bubble body and tail with a short white line
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-4.5, h / 2);
        ctx.lineTo(1.5, h / 2);
        ctx.stroke();
        
        // Draw the text
        ctx.fillStyle = '#db2777'; // Strong Hot Pink text matching Semana Pedagógica's scheme
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.wordText, 0, 0);
      }
      else if (p.type === WeaponType.CANETA_VERMELHA) {
        // Draw a rotated pen emoji/sprite matching p.angle
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle || 0) + Math.PI / 4); // Adjust rotation to make the pen tip point in the direction of flight
        
        ctx.font = `${p.size * 3}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🖋️', 0, 0);
      } 
      else if (p.type === WeaponType.DIARIO_DE_CLASSE) {
         // Draw book agenda rectangle
         ctx.translate(p.x, p.y);
         ctx.rotate(g.totalTicks * 0.1);
         
         ctx.fillStyle = '#0284c7'; // book cover blue
         ctx.fillRect(-11, -15, 22, 30);
         ctx.strokeStyle = '#f8fafc'; // book spine pages
         ctx.lineWidth = 2.5;
         ctx.strokeRect(-11, -15, 22, 30);

         // agenda stripes details
         ctx.fillStyle = '#facc15'; // Golden letters
         ctx.font = 'bold 8px monospace';
         ctx.textAlign = 'center';
         ctx.fillText('N°', 0, 4);
         
         ctx.fillStyle = '#ffffff';
         ctx.fillRect(-8, -10, 16, 3);
      }
      else if (p.type === WeaponType.APOSTILA) {
        // Spin apostilas
        ctx.translate(p.x, p.y);
        ctx.rotate(g.totalTicks * 0.18);
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(-13, -13, 26, 26);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-13, -13, 26, 26);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -8, 20, 2);
        ctx.fillRect(-10, -2, 16, 2);
      }
      else if (p.type === WeaponType.DATASHOW) {
        // Giant beam!
        const beamAngle = p.angle || 0;
        const length = (p.range || 400) * g.rangeMult;
        ctx.translate(g.playerX, g.playerY);
        ctx.rotate(beamAngle);

        // Alpha fade out according to life remaining
        const alpha = p.life / p.maxLife;

        ctx.fillStyle = `rgba(253, 224, 71, ${alpha * 0.4})`;
        ctx.fillRect(0, -p.size / 2, length, p.size);

        // Bright inner core
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
        ctx.fillRect(0, -p.size / 5, length, p.size / 2.5);
      }
      else if (p.type === WeaponType.NOTEBOOK) {
        // Draw cyber envelope/email letter packet with glowing tail
        if (p.px !== undefined && p.py !== undefined) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)'; // glowing purple trace trail
          ctx.lineWidth = 3.5;
          ctx.stroke();
          ctx.restore();
        }

        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));

        // Neon shadow glow
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 8;

        const ew = 20;
        const eh = 14;

        // Draw header and body of envelope
        ctx.fillStyle = '#a855f7'; // vibrant purple
        ctx.fillRect(-ew / 2, -eh / 2, ew, eh / 2);
        ctx.fillStyle = '#f3e8ff'; // light pastel purple body
        ctx.fillRect(-ew / 2, 0, ew, eh / 2);

        // Solid outline
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-ew / 2, -eh / 2, ew, eh);

        // Folder seal flaps
        ctx.beginPath();
        ctx.moveTo(-ew / 2, -eh / 2);
        ctx.lineTo(0, 1);
        ctx.lineTo(ew / 2, -eh / 2);
        ctx.stroke();
      }
      else if (p.type === WeaponType.INTELEGENCIA_ARTIFICIAL) {
        // Draw futuristic green programming laser bar
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));

        // Neon outer glowing laser trail
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 8;

        // Firing capsule green background
        ctx.fillStyle = '#10b981';
        ctx.fillRect(-10, -2, 20, 4);

        // Core bright white hot beam core
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-10, -0.75, 20, 1.5);
      }
      
      ctx.restore();
    });

    // G. Draw AI assistants
    g.aiSummons.forEach((as) => {
      ctx.save();
      ctx.translate(as.x, as.y);
      
      // Shadow under assistant drone
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.beginPath();
      ctx.ellipse(0, 15, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bobbing floating animation
      const hoverY = Math.sin((g.totalTicks * 0.08) + (as.shootTimer * 0.15)) * 4;
      ctx.translate(0, hoverY);

      // 1. Jet levitation thruster flame below the robot
      ctx.fillStyle = '#f97316'; // Orange flame
      ctx.beginPath();
      ctx.moveTo(-3, 6);
      ctx.lineTo(0, 11 + Math.sin(g.totalTicks * 0.35) * 3);
      ctx.lineTo(3, 6);
      ctx.closePath();
      ctx.fill();

      // Golden intense flame core
      ctx.fillStyle = '#facc15'; // Yellow core
      ctx.beginPath();
      ctx.moveTo(-1.5, 6);
      ctx.lineTo(0, 9 + Math.sin(g.totalTicks * 0.35) * 2);
      ctx.lineTo(1.5, 6);
      ctx.closePath();
      ctx.fill();

      // 2. Head / Screen Casing (Slate steel computer block)
      ctx.fillStyle = '#475569'; // Steel metallic casing
      ctx.strokeStyle = '#020617'; // Clear outline
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-8, -8, 16, 14, 2);
      ctx.fill();
      ctx.stroke();

      // Left Antenna
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-4, -8);
      ctx.lineTo(-6, -13);
      ctx.stroke();
      ctx.fillStyle = '#10b981'; // Green blinking transmitter tip
      ctx.beginPath();
      ctx.arc(-6, -13, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Right Antenna
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(4, -8);
      ctx.lineTo(6, -13);
      ctx.stroke();
      ctx.fillStyle = '#10b981'; // Green blinking transmitter tip
      ctx.beginPath();
      ctx.arc(6, -13, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // 3. Glowing neon visor screen
      ctx.fillStyle = '#0f172a'; // Deep slate screen background
      ctx.beginPath();
      ctx.roundRect(-5, -5, 10, 7, 1);
      ctx.fill();
      ctx.strokeStyle = '#10b981'; // Glowing emerald border
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // Glowing cybernetic laser eyes (2 distinct green neon pixels)
      ctx.fillStyle = '#10b981';
      ctx.fillRect(-3.5, -3, 1.5, 1.5);
      ctx.fillRect(2, -3, 1.5, 1.5);

      // 4. Glowing rotating scanner ring
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 2]); // Retro sci-fi dashed ring
      ctx.beginPath();
      // Rotate the scanner ring to make it appear dynamically orbiting!
      ctx.arc(0, 0, 15, g.totalTicks * 0.05, (g.totalTicks * 0.05) + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset dashed lines state

      ctx.restore();
    });

    // H. Draw Enemies
    g.enemies.forEach((e) => {
      // Frustum/viewport culling: skip drawing elements that are far offscreen to save mobile fillrate
      const halfW = g.width / 2;
      const halfH = g.height / 2;
      const margin = e.size + 40; // buffer spacing
      if (
        e.x < g.playerX - halfW - margin ||
        e.x > g.playerX + halfW + margin ||
        e.y < g.playerY - halfH - margin ||
        e.y > g.playerY + halfH + margin
      ) {
        return;
      }

      ctx.save();
      ctx.translate(e.x, e.y);

      // Elite indicator halo glow
      if (e.isElite) {
        ctx.beginPath();
        ctx.arc(0, 0, e.size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = e.isBoss ? 'rgba(239, 68, 68, 0.4)' : `${e.color}35`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      let studentKey = '';
      if (e.type === EnemyType.ALUNO_DISTRAIDO) studentKey = 'aluno_01';
      else if (e.type === EnemyType.ALUNO_VAI_VALER_NOTA) studentKey = 'aluno_02';
      else if (e.type === EnemyType.ALUNO_E_PRA_COPIAR) studentKey = 'aluno_03';
      else if (e.type === EnemyType.ALUNO_DO_FUNDAO) studentKey = 'aluno_04';

      let renderedSprite = false;
      if (studentKey && studentSpriteSheetsRef.current[studentKey]) {
        const sheetCanvas = studentSpriteSheetsRef.current[studentKey];
        
        let angle = e.angle || 0;
        // Normalize angle to between -PI and PI
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;

        let row = 0; // Down Facing
        if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
          row = 2; // Right facing
        } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
          row = 0; // Down facing
        } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
          row = 3; // Up facing
        } else {
          row = 1; // Left facing
        }

        // Cycle through frame 0, 1, 2 with a custom tick offset per enemy to make sure they have independent natural steps
        const tickOffset = (e.id.charCodeAt(0) || 0) + (e.id.charCodeAt(e.id.length - 1) || 0) * 3;
        const col = Math.floor((g.totalTicks + tickOffset) / 8) % 3;

        const sx = col * 32;
        const sy = row * 32;
        const width = e.size * 2.8; // Organizado escala: alunos menores que o professor (são crianças e o professor é adulto, levemente escalonados acima)
        const height = e.size * 2.8;

        ctx.drawImage(sheetCanvas, sx, sy, 32, 32, -width / 2, -height / 2, width, height);
        renderedSprite = true;
      } else {
        let typeToUse = e.type;
        if (e.isBoss) {
          if (e.type === EnemyType.DIARIO_ATRASADO) {
            typeToUse = EnemyType.COORDENADOR_ESCOLAR;
          } else if (e.type === EnemyType.FORMULARIO_INFINITO) {
            typeToUse = EnemyType.ARTICULADORA_PEDAGOGICA;
          } else if (e.type === EnemyType.CONVOCACAO_REUNIAO) {
            typeToUse = EnemyType.COORDENADOR_ESCOLAR;
          }
        }
        if (enemySpriteSheetsRef.current[typeToUse]) {
          const sheetCanvas = enemySpriteSheetsRef.current[typeToUse];
        
        let angle = e.angle || 0;
        // Normalize angle to between -PI and PI
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;

        let row = 0; // Down Facing
        if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
          row = 2; // Right facing
        } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
          row = 0; // Down facing
        } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
          row = 3; // Up facing
        } else {
          row = 1; // Left facing
        }

        // Cycle through frame 0, 1, 2 with a custom tick offset per enemy to make sure they have independent natural steps
        const tickOffset = (e.id.charCodeAt(0) || 0) + (e.id.charCodeAt(e.id.length - 1) || 0) * 3;
        
        let speedDiv = 8;
        if (e.type === EnemyType.MINION_TAREFA_EXTRA) speedDiv = 4;
        else if (e.type === EnemyType.CONVOCACAO_REUNIAO) speedDiv = 6;
        
        const col = Math.floor((g.totalTicks + tickOffset) / speedDiv) % 3;

        const sx = col * 32;
        const sy = row * 32;
        
        let scaleFactor = 3.4;
        if (e.isBoss) {
          scaleFactor = 5.2; // Chefes das fases maiores em escala (gigantes corporativos)
        } else if (e.type === EnemyType.DIARIO_ATRASADO) {
          scaleFactor = 2.8; // Decreased to student size scale
        } else if (e.type === EnemyType.FORMULARIO_INFINITO) {
          scaleFactor = 2.8; // Decreased to student size scale
        } else if (e.type === EnemyType.CONVOCACAO_REUNIAO) {
          scaleFactor = 3.2;
        }
        
        const width = e.size * scaleFactor;
        const height = e.size * scaleFactor;

        ctx.drawImage(sheetCanvas, sx, sy, 32, 32, -width / 2, -height / 2, width, height);
        renderedSprite = true;
        }
      }

      if (!renderedSprite) {
        // Draw Main Character body (circle with eyes or funny cartoon symbols!)
        ctx.beginPath();
        ctx.arc(0, 0, e.size, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#0f172a';
        ctx.stroke();

        // Draw funny face expressions pointing to angle
        const lookX = Math.cos(e.angle || 0) * (e.size * 0.4);
        const lookY = Math.sin(e.angle || 0) * (e.size * 0.4);
        
        // Eyes white circles
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(lookX - 4, lookY - 2, 4, 0, Math.PI * 2);
        ctx.arc(lookX + 4, lookY - 2, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupils dark dots
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(lookX - 4, lookY - 2, 1.5, 0, Math.PI * 2);
        ctx.arc(lookX + 4, lookY - 2, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Funny mouth expressions based on class severity
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (e.hp < e.maxHp / 2) {
          // Scared frown / damaged looks
          ctx.arc(lookX, lookY + 5, 4, Math.PI, 0, false);
        } else {
          // Normal state grin or neutral
          ctx.arc(lookX, lookY + 5, 3, 0, Math.PI, false);
        }
        ctx.stroke();

        // Specific cartoon accents
        if (e.type === EnemyType.ALUNO_DISTRAIDO) {
          // Draw magenta headphones band across head
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.arc(0, 0, e.size + 1, Math.PI, 0);
          ctx.stroke();
          // side padding ear cups
          ctx.fillStyle = '#dc2626';
          ctx.fillRect(-e.size - 2, -4, 4, 8);
          ctx.fillRect(e.size - 2, -4, 4, 8);
        }
        else if (e.type === EnemyType.FORMULARIO_INFINITO) {
          // Slanted lines representing stacked documents
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(-5, -6); ctx.lineTo(5, -6);
          ctx.moveTo(-5, 0); ctx.lineTo(3, 0);
          ctx.moveTo(-5, 5); ctx.lineTo(5, 5);
          ctx.stroke();
        }
        else if (e.type === EnemyType.DIARIO_ATRASADO) {
          // Draw heavy agenda cover book lines
          ctx.strokeStyle = '#1e3a8a';
          ctx.lineWidth = 3;
          ctx.strokeRect(-e.size + 4, -4, e.size * 2 - 8, 8);
        }
      }
      
      // Draw Boss Level Health bars above their coordinates
      if (e.isBoss || e.isElite) {
         const barW = e.size * 1.8;
         const barH = 5;
         const rat = e.hp / e.maxHp;
         const offsetUp = e.isBoss ? e.size * 2.1 + 10 : e.size + 14;
         
         ctx.fillStyle = '#1e293b';
         ctx.fillRect(-barW/2, -offsetUp, barW, barH);
         ctx.fillStyle = e.isBoss ? '#dc2626' : '#ec4899';
         ctx.fillRect(-barW/2, -offsetUp, barW * rat, barH);
         ctx.strokeStyle = '#475569';
         ctx.lineWidth = 1;
         ctx.strokeRect(-barW/2, -offsetUp, barW, barH);

         // Label name of Boss
         ctx.fillStyle = '#f1f5f9';
         ctx.font = 'bold 9px sans-serif';
         ctx.textAlign = 'center';
         ctx.fillText(e.name, 0, -offsetUp - 4);
      }

      ctx.restore();
    });

    // I. Draw the Player ("PROFESSOR")
    drawPlayer(ctx);

    // J. Draw HTML Chat quote bubble structures / Damage Particles over the scenario map
    drawParticles(ctx);

    // K. Restore original canvas context translation coordinate
    ctx.restore();

    // L. Screen Red Flash Alarm Overlay completely disabled per user intent
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D) => {
    const g = gameRef.current;
    
    // Draw Teacher body center point
    ctx.save();
    
    // Physical vibration when taking damage
    let finalX = g.playerX;
    let finalY = g.playerY;
    if (g.playerFlashTicks && g.playerFlashTicks > 0) {
      const shakeAmt = 8 * (g.playerFlashTicks / 15);
      finalX += (Math.random() - 0.5) * shakeAmt;
      finalY += (Math.random() - 0.5) * shakeAmt;
    }
    ctx.translate(finalX, finalY);

    // Draw whistle shockwaves under the player (Toninho)
    if (selectedCharacterId === CharacterId.ED_FISICA && g.whistleWaveRadius > 0) {
      ctx.save();
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, g.whistleWaveRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, g.whistleWaveRadius - 25), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Crayon Orbiting Shields (Regina)
    if (selectedCharacterId === CharacterId.ARTES && g.artesShieldTicks > 0) {
      ctx.save();
      // Orbiting crayons
      const count = 4;
      const radius = 65;
      const angleOffset = g.totalTicks * 0.05; // speed of rotation
      const colors = ['#ec4899', '#3b82f6', '#eab308', '#22c55e'];
      
      for (let i = 0; i < count; i++) {
        const theta = angleOffset + (i * Math.PI * 2 / count);
        const cx = Math.cos(theta) * radius;
        const cy = Math.sin(theta) * radius;
        
        // Draw crayon stick
        ctx.fillStyle = colors[i];
        ctx.fillRect(cx - 4, cy - 8, 8, 16);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cx - 4, cy - 8, 8, 16);
        
        // Crayon tip
        ctx.beginPath();
        ctx.moveTo(cx - 4, cy - 8);
        ctx.lineTo(cx, cy - 14);
        ctx.lineTo(cx + 4, cy - 8);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // Draw shadow
    const shadowY = selectedCharacterId === CharacterId.ED_FISICA ? 22 : 19;
    const shadowRadius = selectedCharacterId === CharacterId.ED_FISICA ? 24 : 20;
    ctx.beginPath();
    ctx.arc(0, shadowY, shadowRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
    ctx.fill();

    // Draw pre-generated pixel-art teacher sprite
    const sheetCanvas = teacherSpriteSheetsRef.current[selectedCharacterId];
    if (sheetCanvas) {
      const mv = g.moveVector;
      const isMoving = mv.x !== 0 || mv.y !== 0;
      
      let row = g.lastPlayerRow !== undefined ? g.lastPlayerRow : 0;
      if (isMoving) {
        let angle = Math.atan2(mv.y, mv.x);
        while (angle > Math.PI) angle -= Math.PI * 2;
        while (angle < -Math.PI) angle += Math.PI * 2;

        if (angle >= -Math.PI / 4 && angle < Math.PI / 4) {
          row = 2; // Right facing
        } else if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) {
          row = 0; // Down facing
        } else if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) {
          row = 3; // Up facing
        } else {
          row = 1; // Left facing
        }
        g.lastPlayerRow = row;
      }

      // Cycle between columns 0, 1, 2 during movements, or show static frame 1 when idle
      const col = isMoving ? Math.floor(g.playerTicks / 10) % 3 : 1;

      const sx = col * 32;
      const sy = row * 32;
      const size = selectedCharacterId === CharacterId.ED_FISICA ? 66 : 58;

      // Draw the crisp sprite centered on player coordinate
      const hasHitFlash = g.playerFlashTicks && g.playerFlashTicks > 0;
      if (hasHitFlash) {
        ctx.save();
        // Turn the character into a glowing red/crimson silhouette representing hit damage
        ctx.filter = 'brightness(1.4) sepia(1) hue-rotate(-50deg) saturate(12)';
      }
      
      ctx.drawImage(sheetCanvas, sx, sy, 32, 32, -size / 2, -size / 2 - (selectedCharacterId === CharacterId.ED_FISICA ? 4 : 3), size, size);

      if (hasHitFlash) {
        ctx.restore();
      }
    }

    // Draw Coffee Cup held by Player! (if cafe level unlocked)
    if (g.weapons[WeaponType.CAFE].level > 0) {
      ctx.fillStyle = '#78350f'; // Brown mug
      ctx.fillRect(10, 2, 8, 10);
      ctx.strokeStyle = '#fddf47'; // yellow rim
      ctx.strokeRect(10, 2, 8, 10);
      // Cup handle
      ctx.strokeStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(18, 7, 3, -Math.PI/2, Math.PI/2);
      ctx.stroke();
    }

    // Draw Sleek Hovering Notebook Drone! (if Notebook weapon active)
    if (g.weapons[WeaponType.NOTEBOOK].level > 0) {
      ctx.save();
      // Orbiting / float offset
      const hoverAngle = g.totalTicks * 0.06;
      const hx = Math.sin(hoverAngle) * 22;
      const hy = Math.cos(hoverAngle) * 8 - 18;
      ctx.translate(hx, hy);

      // Neon purple aura glow
      ctx.shadowColor = '#c084fc';
      ctx.shadowBlur = 6;

      // Bottom base
      ctx.fillStyle = '#9333ea'; // Dark purple housing
      ctx.fillRect(-8, 2, 16, 2.5);
      
      // Screen open lid
      ctx.fillStyle = '#1e1b4b'; // Sleek dark screen
      ctx.fillRect(-6, -5, 12, 7);
      ctx.strokeStyle = '#c084fc'; // Glowing border outline
      ctx.lineWidth = 1;
      ctx.strokeRect(-6, -5, 12, 7);
      
      // Cyber neon coding sparkles on screen
      ctx.fillStyle = '#581c87';
      ctx.fillRect(-4, -3, 8, 1.5);
      ctx.fillStyle = '#10b981'; // Green wifi status dot
      ctx.fillRect(2, 0, 1.5, 1.5);

      ctx.restore();
    }

    ctx.restore();
  };

  const drawFloorGrid = (ctx: CanvasRenderingContext2D) => {
    const g = gameRef.current;
    
    const size = 120; // broad tile blocks
    // Tight visible bounds to draw only what is seen on screen + 1 tile padding margin
    const startX = Math.floor((g.playerX - g.width / 2 - size) / size) * size;
    const endX = Math.ceil((g.playerX + g.width / 2 + size) / size) * size;
    const startY = Math.floor((g.playerY - g.height / 2 - size) / size) * size;
    const endY = Math.ceil((g.playerY + g.height / 2 + size) / size) * size;

    // Deterministic procedural random seed helper based on tile coordinates
    const getStableNoise = (tx: number, ty: number, seed: number = 1) => {
      const value = Math.sin(tx * 12.9898 + ty * 78.233 + seed) * 43758.5453123;
      return value - Math.floor(value);
    };

    // 1. Draw alternating floor tiles texture and beautiful organic variations
    if (scenario.type === ScenarioType.SALA_DE_AULA || scenario.type === ScenarioType.SALA_FECHADA) {
      // Warm nostalgic parquet school floorboards!
      ctx.strokeStyle = 'rgba(74, 42, 11, 0.04)';
      ctx.lineWidth = 1;
      
      for (let x = startX; x < endX; x += size) {
        for (let y = startY; y < endY; y += size) {
          const tileXIndex = Math.floor(x / size);
          const tileYIndex = Math.floor(y / size);
          
          // Draw horizontal wooden planks
          const pxYCount = 4;
          const plankH = size / pxYCount;
          for (let pi = 0; pi < pxYCount; pi++) {
            const py = y + pi * plankH;
            ctx.beginPath();
            ctx.moveTo(x, py);
            ctx.lineTo(x + size, py);
            ctx.stroke();
            
            // Draw wooden board split joint lines dynamically using stable noise
            const boardSeed = getStableNoise(tileXIndex, tileYIndex, pi + 50);
            const splitX1 = x + Math.floor(boardSeed * 0.4 * size);
            const splitX2 = x + Math.floor((0.5 + boardSeed * 0.4) * size);
            
            ctx.beginPath();
            ctx.moveTo(splitX1, py);
            ctx.lineTo(splitX1, py + plankH);
            ctx.moveTo(splitX2, py);
            ctx.lineTo(splitX2, py + plankH);
            ctx.stroke();
          }
        }
      }
    } else if (scenario.type === ScenarioType.CORREDOR_ESCOLAR || scenario.type === ScenarioType.CORREDOR_INFINITO) {
      // Grid linoleum checkerboard
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      for (let x = startX; x < endX; x += size) {
        for (let y = startY; y < endY; y += size) {
          const tileXIndex = Math.floor(x / size);
          const tileYIndex = Math.floor(y / size);
          if ((tileXIndex + tileYIndex) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }
    } else if (scenario.type === ScenarioType.PATIO) {
      // Outdoor heavy stone pavers layout
      ctx.fillStyle = 'rgba(15, 23, 42, 0.04)';
      for (let x = startX; x < endX; x += size) {
        for (let y = startY; y < endY; y += size) {
          const tileXIndex = Math.floor(x / size);
          const tileYIndex = Math.floor(y / size);
          if ((tileXIndex + tileYIndex) % 2 === 0) {
            ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
          }
        }
      }
    } else if (scenario.type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
      // Luxurious parquet border / office floor grid with subtle stripes
      ctx.fillStyle = 'rgba(148, 163, 184, 0.06)';
      for (let x = startX; x < endX; x += size) {
        for (let y = startY; y < endY; y += size) {
          const tileXIndex = Math.floor(x / size);
          const tileYIndex = Math.floor(y / size);
          if ((tileXIndex + tileYIndex) % 2 === 0) {
            ctx.fillRect(x + 5, y + 5, size - 10, size - 10);
          }
        }
      }
    } else if (scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
      // Conference room warm carpet look with soft felt noise
      ctx.fillStyle = 'rgba(245, 158, 11, 0.03)';
      for (let x = startX; x < endX; x += size) {
        for (let y = startY; y < endY; y += size) {
          const tileXIndex = Math.floor(x / size);
          const tileYIndex = Math.floor(y / size);
          if ((tileXIndex + tileYIndex) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }
    } else {
      // Fallback checkerboard tiling
      ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
      for (let x = startX; x < endX; x += size) {
        for (let y = startY; y < endY; y += size) {
          const tileXIndex = Math.floor(x / size);
          const tileYIndex = Math.floor(y / size);
          if ((tileXIndex + tileYIndex) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }
    }

    // Add organic school speckle/dirt textures in a single pass
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let x = startX; x < endX; x += size) {
      for (let y = startY; y < endY; y += size) {
        ctx.fillRect(x + size - 20, y + size - 20, 3, 3);
      }
    }

    // 2. Draw Scenario specific tiles grid lines in a SINGLE stroke path call
    ctx.strokeStyle = scenario.gridColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = startX; x <= endX; x += size) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += size) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Procedural Ambient Details & Props placed via stable coordinate hash
    for (let x = startX; x < endX; x += size) {
      for (let y = startY; y < endY; y += size) {
        const tileXIndex = Math.floor(x / size);
        const tileYIndex = Math.floor(y / size);
        const rVal = getStableNoise(tileXIndex, tileYIndex, 100);

        if (scenario.type === ScenarioType.SALA_DE_AULA || scenario.type === ScenarioType.SALA_FECHADA) {
          // Curvy chalk dust traces or student doodles on wood planks
          if (rVal < 0.1) {
            const rx = x + 25 + getStableNoise(tileXIndex, tileYIndex, 101) * 70;
            const ry = y + 25 + getStableNoise(tileXIndex, tileYIndex, 102) * 70;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.beginPath();
            if (rVal < 0.03) {
              // Draw "Σ" summation chalk formula
              ctx.moveTo(rx - 6, ry - 6);
              ctx.lineTo(rx + 6, ry - 6);
              ctx.lineTo(rx - 2, ry);
              ctx.lineTo(rx + 6, ry + 6);
              ctx.lineTo(rx - 6, ry + 6);
            } else if (rVal < 0.06) {
              // Chalk heart doodle
              ctx.moveTo(rx, ry + 5);
              ctx.bezierCurveTo(rx - 6, ry - 1, rx - 6, ry - 6, rx, ry - 3);
              ctx.bezierCurveTo(rx + 6, ry - 6, rx + 6, ry - 1, rx, ry + 5);
            } else {
              // Math scribbled division fraction
              ctx.moveTo(rx - 5, ry);
              ctx.lineTo(rx + 5, ry);
              ctx.moveTo(rx, ry - 4);
              ctx.lineTo(rx, ry - 4);
              ctx.moveTo(rx, ry + 4);
              ctx.lineTo(rx, ry + 4);
            }
            ctx.stroke();
          }

          // Scattered sheets of paper (student homework notebook sheets)
          if (rVal > 0.9) {
            const px = x + 30 + getStableNoise(tileXIndex, tileYIndex, 103) * 60;
            const py = y + 30 + getStableNoise(tileXIndex, tileYIndex, 104) * 60;
            const rot = getStableNoise(tileXIndex, tileYIndex, 105) * Math.PI * 2;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(rot);
            // Shadow
            ctx.fillStyle = 'rgba(15, 23, 42, 0.06)';
            ctx.fillRect(-6 + 1.5, -8 + 1.5, 12, 16);
            // White sheet
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-6, -8, 12, 16);
            ctx.strokeStyle = '#cbd5e1';
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-6, -8, 12, 16);
            // horizontal notebook lines
            ctx.strokeStyle = '#cbd5e1';
            ctx.beginPath();
            for (let ly = -4; ly <= 4; ly += 2.5) {
              ctx.moveTo(-4, ly);
              ctx.lineTo(4, ly);
            }
            ctx.stroke();
            // red margin line
            ctx.strokeStyle = '#fca5a5';
            ctx.beginPath();
            ctx.moveTo(-2, -6);
            ctx.lineTo(-2, 6);
            ctx.stroke();
            ctx.restore();
          }

          // Retro student wooden desk with chair shadow
          if (rVal > 0.45 && rVal < 0.51) {
            const dx = x + 35 + getStableNoise(tileXIndex, tileYIndex, 106) * 50;
            const dy = y + 35 + getStableNoise(tileXIndex, tileYIndex, 107) * 50;
            ctx.save();
            ctx.translate(dx, dy);
            // Desk shadow cast
            ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
            ctx.fillRect(-15, -11, 30, 22);
            // Wooden desktop color
            ctx.fillStyle = '#d97706'; // warm amber wood desk
            ctx.fillRect(-13, -10, 26, 20);
            ctx.strokeStyle = '#92400e';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-13, -10, 26, 20);
            // Desk metallic legs lines projection
            ctx.strokeStyle = '#4b5563';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-11, -9); ctx.lineTo(-11, -5);
            ctx.moveTo(11, -9); ctx.lineTo(11, -5);
            ctx.stroke();
            // Stack of school text books
            ctx.fillStyle = '#ef4444'; // Red workbook
            ctx.fillRect(-5, -6, 10, 5);
            ctx.fillStyle = '#3b82f6'; // Blue pencil holder
            ctx.beginPath();
            ctx.arc(5, 3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        } 
        else if (scenario.type === ScenarioType.CORREDOR_ESCOLAR || scenario.type === ScenarioType.CORREDOR_INFINITO) {
          // Specular linoleum glossy glares
          if (rVal < 0.12) {
            const rx = x + 20 + getStableNoise(tileXIndex, tileYIndex, 201) * 70;
            const ry = y + 20 + getStableNoise(tileXIndex, tileYIndex, 202) * 70;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.ellipse(rx, ry, 20, 5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Translucent water puddles leaked from drinking coolers
          if (rVal > 0.86) {
            const px = x + size / 2;
            const py = y + size / 2;
            const radius = 22 + getStableNoise(tileXIndex, tileYIndex, 203) * 16;
            ctx.fillStyle = 'rgba(14, 165, 233, 0.22)'; // shiny water puddle
            ctx.beginPath();
            ctx.arc(px, py, radius, 0, Math.PI * 2);
            ctx.arc(px - 8, py + 4, radius * 0.7, 0, Math.PI * 2);
            ctx.arc(px + 6, py - 4, radius * 0.8, 0, Math.PI * 2);
            ctx.fill();

            // Concentric expanding ring water ripples
            const ripRadius = (radius + (g.totalTicks * 0.3) % 18);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(px, py, ripRadius, 0, Math.PI * 2);
            ctx.stroke();

            // Sensation indicator: caution "WET FLOOR" tall yellow sign cone
            if (rVal > 0.93) {
              const cx = px + (getStableNoise(tileXIndex, tileYIndex, 204) > 0.5 ? 24 : -24);
              const cy = py + (getStableNoise(tileXIndex, tileYIndex, 205) > 0.5 ? 20 : -20);
              ctx.save();
              ctx.translate(cx, cy);
              // Mini shadow cast
              ctx.fillStyle = 'rgba(15, 23, 42, 0.16)';
              ctx.fillRect(-6, -3, 12, 6);
              // Cone body
              ctx.fillStyle = '#eab308'; // Safety yellow orange
              ctx.beginPath();
              ctx.moveTo(0, -16);
              ctx.lineTo(-7, 3);
              ctx.lineTo(7, 3);
              ctx.closePath();
              ctx.fill();
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 1;
              ctx.stroke();
              // Black caution warning mark lines
              ctx.fillStyle = '#000000';
              ctx.fillRect(-1, -10, 2, 5);
              ctx.fillRect(-1, -3, 2, 1.8);
              // Base line lip
              ctx.fillStyle = '#ca8a04';
              ctx.fillRect(-9, 3, 18, 1.5);
              ctx.restore();
            }
          }
        } 
        else if (scenario.type === ScenarioType.PATIO) {
          // Weathered stone pavers crack structures
          if (rVal < 0.18) {
            ctx.strokeStyle = 'rgba(71, 85, 105, 0.18)';
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(x, y);
            const midX = x + 25 + getStableNoise(tileXIndex, tileYIndex, 301) * 30;
            const midY = y + 25 + getStableNoise(tileXIndex, tileYIndex, 302) * 30;
            ctx.lineTo(midX, midY);
            ctx.lineTo(x + size * (rVal > 0.09 ? 0.35 : 0.65), y + size * 0.7);
            ctx.stroke();
          }

          // Green wild weeds sprouting out of block grout channels
          if (rVal > 0.88) {
            const gx = x + 15 + getStableNoise(tileXIndex, tileYIndex, 304) * 90;
            const gy = y + 15 + getStableNoise(tileXIndex, tileYIndex, 305) * 90;
            ctx.strokeStyle = '#22c55e'; // green weed blades
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(gx, gy); ctx.lineTo(gx - 4, gy - 9);
            ctx.moveTo(gx, gy); ctx.lineTo(gx + 2, gy - 12);
            ctx.moveTo(gx, gy); ctx.lineTo(gx + 6, gy - 7);
            ctx.stroke();
          }

          // Scattered cozy natural red and maple autumn dry leaves
          if (rVal > 0.7 && rVal < 0.83) {
            const lx = x + 25 + getStableNoise(tileXIndex, tileYIndex, 306) * 70;
            const ly = y + 25 + getStableNoise(tileXIndex, tileYIndex, 307) * 70;
            const lrot = getStableNoise(tileXIndex, tileYIndex, 308) * Math.PI * 2;
            const leafColor = getStableNoise(tileXIndex, tileYIndex, 309) > 0.5 ? '#eab308' : '#dc2626';
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(lrot);
            ctx.fillStyle = leafColor;
            ctx.beginPath();
            ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
            ctx.fill();
            // Leaf vein spine
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(-4, 0); ctx.lineTo(-6, -2);
            ctx.stroke();
            ctx.restore();
          }

          // Dynamic unique Easter Egg: Brazilian School "Amarelinha" (Hopscotch grid) near base center!
          if (tileXIndex === 0 && tileYIndex === 0) {
            ctx.save();
            ctx.translate(x + 60, y + 60);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
            ctx.lineWidth = 2.5;
            ctx.setLineDash([4, 2]); // classic dry chalk effect

            const boxW = 32;
            const boxH = 26;

            // Draw Heaven semicircle top
            ctx.beginPath();
            ctx.arc(0, -90, boxW, Math.PI, 0, false);
            ctx.stroke();

            // Draw hopscotch progressive numbered cell blocks
            // Cell 1
            ctx.strokeRect(-boxW / 2, 60, boxW, boxH);
            // Cell 2 & 3
            ctx.strokeRect(-boxW, 60 - boxH, boxW, boxH);
            ctx.strokeRect(0, 60 - boxH, boxW, boxH);
            // Cell 4
            ctx.strokeRect(-boxW / 2, 60 - boxH * 2, boxW, boxH);
            // Cell 5 & 6
            ctx.strokeRect(-boxW, 60 - boxH * 3, boxW, boxH);
            ctx.strokeRect(0, 60 - boxH * 3, boxW, boxH);
            // Cell 7
            ctx.strokeRect(-boxW / 2, 60 - boxH * 4, boxW, boxH);
            // Cell 8 & 9
            ctx.strokeRect(-boxW, 60 - boxH * 5, boxW, boxH);
            ctx.strokeRect(0, 60 - boxH * 5, boxW, boxH);
            // Cell 10
            ctx.strokeRect(-boxW / 2, 60 - boxH * 6, boxW, boxH);

            // Numeration overlay text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText("CÉU", 0, -95);
            ctx.fillText("10", 0, 60 - boxH * 6 + 16);
            ctx.fillText("9", -boxW / 2, 60 - boxH * 5 + 16);
            ctx.fillText("8", boxW / 2, 60 - boxH * 5 + 16);
            ctx.fillText("7", 0, 60 - boxH * 4 + 16);
            ctx.fillText("6", -boxW / 2, 60 - boxH * 3 + 16);
            ctx.fillText("5", boxW / 2, 60 - boxH * 3 + 16);
            ctx.fillText("4", 0, 60 - boxH * 2 + 16);
            ctx.fillText("3", -boxW / 2, 60 - boxH + 16);
            ctx.fillText("2", boxW / 2, 60 - boxH + 16);
            ctx.fillText("1", 0, 60 + 16);

            ctx.setLineDash([]);
            ctx.restore();
          }
        } 
        else if (scenario.type === ScenarioType.CONSELHO_DE_CLASSE_STAGE) {
          // Piles of poor grade printed exam papers!
          if (rVal < 0.16) {
            const px = x + 30 + getStableNoise(tileXIndex, tileYIndex, 401) * 60;
            const py = y + 30 + getStableNoise(tileXIndex, tileYIndex, 402) * 60;
            const rot = getStableNoise(tileXIndex, tileYIndex, 403) * Math.PI * 2;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(rot);
            // Drop shadow
            ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
            ctx.fillRect(-7, -9, 14, 18);
            // White printed grade document
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-8, -10, 16, 20);
            ctx.strokeStyle = '#ef4444'; // Red frame indicating failure corrections
            ctx.lineWidth = 0.8;
            ctx.strokeRect(-8, -10, 16, 20);
            // scribble lines representing teacher's comments
            ctx.strokeStyle = '#94a3b8';
            ctx.beginPath();
            for (let ly = -6; ly <= 6; ly += 3.2) {
              ctx.moveTo(-5, ly);
              ctx.lineTo(4, ly);
            }
            ctx.stroke();
            // Stamp grade circle
            ctx.strokeStyle = '#dc2626';
            ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
            ctx.beginPath();
            ctx.arc(3, -5, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Mini failing grade red "D-"
            ctx.fillStyle = '#dc2626';
            ctx.font = '6px monospace';
            ctx.fillText("R", 1, -2);
            ctx.restore();
          }

          // Scattered school red ink corrections ballpoint pens
          if (rVal > 0.85) {
            const px = x + 25 + getStableNoise(tileXIndex, tileYIndex, 404) * 70;
            const py = y + 25 + getStableNoise(tileXIndex, tileYIndex, 405) * 70;
            const rot = getStableNoise(tileXIndex, tileYIndex, 406) * Math.PI * 2;
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(rot);
            // Shadow projection
            ctx.fillStyle = 'rgba(15, 23, 42, 0.1)';
            ctx.fillRect(-9, 1, 18, 1.8);
            // Red pen body
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(-8, -0.8, 16, 1.6);
            // transparent overlay
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(-7, -0.8, 11, 1.6);
            // Red cap plastic lock
            ctx.fillStyle = '#b91c1c';
            ctx.fillRect(4, -1.2, 4, 2.4);
            ctx.restore();
          }
        } 
        else if (scenario.type === ScenarioType.SEMANA_PEDAGOGICA_STAGE) {
          // Scattered fluorescent colourful brainstorming sticky post-it notes!
          if (rVal < 0.23) {
            const px = x + 25 + getStableNoise(tileXIndex, tileYIndex, 501) * 70;
            const py = y + 25 + getStableNoise(tileXIndex, tileYIndex, 502) * 70;
            const rot = getStableNoise(tileXIndex, tileYIndex, 503) * 0.5 - 0.25;
            const stickyPalletes = ['#fde047', '#f472b6', '#22d3ee', '#4ade80']; // neon yellow, pink, blue, green
            const color = stickyPalletes[Math.floor(getStableNoise(tileXIndex, tileYIndex, 504) * stickyPalletes.length)];
            
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(rot);
            // Shadow
            ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
            ctx.fillRect(-5 + 1.2, -5 + 1.2, 10, 10);
            // Post it
            ctx.fillStyle = color;
            ctx.fillRect(-5, -5, 10, 10);
            // curl corner representation
            ctx.strokeStyle = 'rgba(0,0,0,0.12)';
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.moveTo(-5, 5); ctx.lineTo(-3, 5); ctx.lineTo(-5, 3);
            ctx.closePath();
            ctx.fill();
            // drawn marker notes lines
            ctx.strokeStyle = 'rgba(0,0,0,0.18)';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(-3, -2); ctx.lineTo(3, -2);
            ctx.moveTo(-2, 1); ctx.lineTo(2, 1);
            ctx.stroke();
            ctx.restore();
          }

          // Active dynamic methodologies whiteboard flowchart designs on the floor
          if (tileXIndex % 3 === 0 && tileYIndex % 3 === 0) {
            ctx.save();
            ctx.translate(x + 60, y + 60);
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.16)'; // light blueprint blueprint blue
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            
            // central oval process block
            ctx.ellipse(0, 0, 32, 18, 0, 0, Math.PI * 2);
            // connector tracks
            ctx.moveTo(-32, 0); ctx.lineTo(-46, -12);
            ctx.moveTo(32, 0); ctx.lineTo(46, 12);
            ctx.stroke();

            // ancillary hubs circles
            ctx.beginPath();
            ctx.arc(-46, -12, 6, 0, Math.PI * 2);
            ctx.arc(46, 12, 6, 0, Math.PI * 2);
            ctx.stroke();

            // handwritten text markings
            ctx.fillStyle = 'rgba(59, 130, 246, 0.28)';
            ctx.font = 'bold 6.5px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("BNCC 🎒", 0, -1);
            ctx.fillText("PDI", -46, -10);
            ctx.fillText("EAD", 46, 14);
            ctx.restore();
          }

          // Interactive warm theater spotlight beams overlaying the floor
          if ((tileXIndex * tileYIndex) % 7 === 0) {
            const radGrad = ctx.createRadialGradient(x + 60, y + 60, 5, x + 60, y + 60, 55);
            radGrad.addColorStop(0, 'rgba(251, 191, 36, 0.08)'); // warm golden spot light ring
            radGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
            ctx.fillStyle = radGrad;
            ctx.beginPath();
            ctx.arc(x + 60, y + 60, 55, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Static Unique Stage Furniture & Assets
    if (scenario.type === ScenarioType.SALA_FECHADA) {
      const classroomHalfSize = Math.max(450, (Math.min(g.width, g.height) + 160) / 2);
      
      // Draw massive gorgeous old school green wood chalkboard at the center wall!
      ctx.fillStyle = '#14532d'; // dark blackboard green
      ctx.fillRect(-140, -classroomHalfSize + 8, 280, 26);
      ctx.strokeStyle = '#7c2d12'; // beautiful dark warm brown wood frame
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-140, -classroomHalfSize + 8, 280, 26);
      
      // chalk board markings
      ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText("SALA DE RECUPERAÇÃO - ATENÇÃO!", 0, -classroomHalfSize + 18);
      ctx.font = '6px monospace';
      ctx.fillText("Prova Escrita Individual • Proibido Consultar!", 0, -classroomHalfSize + 28);

      // Teacher's mahogany wood vintage desk
      ctx.save();
      ctx.translate(0, -classroomHalfSize + 55);
      // shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.fillRect(-34, -13, 68, 26);
      // Mahogany body
      ctx.fillStyle = '#7c2d12';
      ctx.fillRect(-30, -11, 60, 22);
      ctx.strokeStyle = '#431407';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-30, -11, 60, 22);
      
      // Open portable laptop notebook
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(-10, -3, 20, 8);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-8, -8, 16, 5); // screening open lid
      
      // Cozy steaming red coffee mug
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(15, -4, 4.5, 5);
      ctx.fillStyle = 'rgba(124, 45, 18, 0.4)';
      ctx.font = '7px sans-serif';
      ctx.fillText("~", 16, -7);
      
      // Globe sphere decoration
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(-20, -1, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
      // Draw modern dark borders lines represent double steel hallways walls
      ctx.fillStyle = '#0f172a';
      const corridorHalfWidth = (g.width - 40) / 2;
      ctx.fillRect(-corridorHalfWidth - 3, -1600, 3, 3200);
      ctx.fillRect(corridorHalfWidth, -1600, 3, 3200);

      // Draw shiny gray school locker rows along the left and right border walls periodically!
      ctx.fillStyle = '#475569'; // metal locker facade steel gray
      for (let ySide = -1500; ySide <= 1500; ySide += 120) {
        // Draw left locker set
        ctx.fillRect(-corridorHalfWidth - 14, ySide, 12, 35);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        ctx.strokeRect(-corridorHalfWidth - 14, ySide, 12, 35);
        
        // draw tiny yellow security padlock dots
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-corridorHalfWidth - 5, ySide + 16, 2.2, 2.2);

        // Draw right locker set
        ctx.fillStyle = '#475569';
         ctx.fillRect(corridorHalfWidth + 2, ySide, 12, 35);
        ctx.strokeRect(corridorHalfWidth + 2, ySide, 12, 35);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(corridorHalfWidth + 2.8, ySide + 16, 2.2, 2.2);
      }

      // Draw floor emergency fire warning escape arrows periodically in the middle Y
      for (let yArr = -1200; yArr <= 1200; yArr += 300) {
        ctx.save();
        ctx.translate(0, yArr);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.4)'; // glowing warning directional yellow
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(-8, -4);
        ctx.lineTo(-3, -4);
        ctx.lineTo(-3, 12);
        ctx.lineTo(3, 12);
        ctx.lineTo(3, -4);
        ctx.lineTo(8, -4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // 3. Draw OUT OF BOUNDS limits and warning fence borders based on scenario
    let limitLeft = -1600;
    let limitRight = 1600;
    let limitTop = -1600;
    let limitBottom = 1600;
    let hasTopBottomFence = true;

    if (scenario.type === ScenarioType.SALA_FECHADA) {
      const classroomHalfSize = Math.max(450, (Math.min(g.width, g.height) + 160) / 2);
      limitLeft = -classroomHalfSize;
      limitRight = classroomHalfSize;
      limitTop = -classroomHalfSize;
      limitBottom = classroomHalfSize;
    } else if (scenario.type === ScenarioType.SALA_DE_AULA) {
      const mapLimit = 850;
      limitLeft = -mapLimit;
      limitRight = mapLimit;
      limitTop = -mapLimit;
      limitBottom = mapLimit;
    } else if (scenario.type === ScenarioType.CORREDOR_INFINITO) {
      const corridorHalfWidth = (g.width - 40) / 2;
      limitLeft = -corridorHalfWidth;
      limitRight = corridorHalfWidth;
      hasTopBottomFence = false; // vertical is infinite looping hallways!
    }

    // Draw dark zones beyond map edge limits
    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    // Left
    if (g.playerX - g.width / 2 < limitLeft) {
      ctx.fillRect(limitLeft - 1200, -1600 - 1200, 1200, 3200 + 2400);
    }
    // Right
    if (g.playerX + g.width / 2 > limitRight) {
      ctx.fillRect(limitRight, -1600 - 1200, 1200, 3200 + 2400);
    }
    // Top
    if (hasTopBottomFence && (g.playerY - g.height / 2 < limitTop)) {
      ctx.fillRect(-1600 - 1200, limitTop - 1200, 3200 + 2400, 1200);
    }
    // Bottom
    if (hasTopBottomFence && (g.playerY + g.height / 2 > limitBottom)) {
      ctx.fillRect(-1600 - 1200, limitBottom, 3200 + 2400, 1200);
    }

    // Draw bold warning border fences on limits
    ctx.strokeStyle = '#ef4444'; // Red outer safety bounds line
    ctx.lineWidth = 10;
    
    if (hasTopBottomFence) {
      // Draw closed square/rectangle
      ctx.strokeRect(limitLeft, limitTop, limitRight - limitLeft, limitBottom - limitTop);
    } else {
      // Just draw the two solid sidebar limits of the corridor!
      ctx.beginPath();
      // Left Wall
      ctx.moveTo(limitLeft, -1600);
      ctx.lineTo(limitLeft, 1600);
      // Right Wall
      ctx.moveTo(limitRight, -1600);
      ctx.lineTo(limitRight, 1600);
      ctx.stroke();
    }

    // Hazard stripes (Yellow/Black dashed border)
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 12]);
    
    if (hasTopBottomFence) {
      ctx.strokeRect(limitLeft + 8, limitTop + 8, (limitRight - limitLeft) - 16, (limitBottom - limitTop) - 16);
    } else {
      ctx.beginPath();
      ctx.moveTo(limitLeft + 8, -1600);
      ctx.lineTo(limitLeft + 8, 1600);
      ctx.moveTo(limitRight - 8, -1600);
      ctx.lineTo(limitRight - 8, 1600);
      ctx.stroke();
    }
    ctx.setLineDash([]); // Always restore line dash to regular lines
  };

  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    const g = gameRef.current;
    g.particles.forEach((p) => {
      // If of quote chat style, draw nice bubble container behind
      const isQuote = p.text.startsWith('"');
      
      if (isQuote) {
        ctx.font = `600 ${p.fontSize}px sans-serif`;
        const textWidth = ctx.measureText(p.text).width;
        const boxW = textWidth + 14;
        const boxH = p.fontSize + 10;
        
        // Transparent speech bubble shape background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(p.x - boxW / 2, p.y - boxH + 2, boxW, boxH);
        
        // draw speech bubble tip index pointer pointing downward
        ctx.beginPath();
        ctx.moveTo(p.x - 4, p.y + 2);
        ctx.lineTo(p.x + 4, p.y + 2);
        ctx.lineTo(p.x, p.y + 8);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - boxW / 2, p.y - boxH + 2, boxW, boxH);

        // Draw Text inside speech
        ctx.fillStyle = '#f1f5f9';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.text, p.x, p.y - boxH / 2 + 2);
      } else {
        // Red Damage Numbers or indicators
        ctx.font = `900 ${p.fontSize}px sans-serif`;
        ctx.fillStyle = p.color;
        
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 3;
        ctx.strokeText(p.text, p.x, p.y);
        ctx.fillText(p.text, p.x, p.y);
      }
    });
  };

  // Arithmetic Utility functions
  const getDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Convert game coordinates context type matching
  type CanvasRenderingContext25D = CanvasRenderingContext2D;

  const currentStats = uiStats || {
    hp: gameRef.current.playerHp,
    maxHp: gameRef.current.playerMaxHp,
    speed: gameRef.current.playerSpeed,
    level: gameRef.current.playerLevel,
    xp: gameRef.current.playerXp,
    xpNeeded: gameRef.current.playerXpNeeded,
    goldCurrent: gameRef.current.playerGoldGained,
    goldTotal: gameRef.current.playerGoldGained,
    defeatedCount: gameRef.current.playerDefeated,
    timeSurvived: gameRef.current.playerTime,
    weapons: gameRef.current.weapons as any,
    activeCount: 1
  };

  // Safe percentage helper for XP
  const xpPercentage = Math.min(100, Math.floor((currentStats.xp / currentStats.xpNeeded) * 100));
  const hpPercentage = Math.min(100, Math.floor((currentStats.hp / currentStats.maxHp) * 100));

  return (
    <div 
      ref={containerRef}
      id="game-viewport-container" 
      className="w-full relative flex-1 flex flex-col items-center justify-start bg-slate-900 overflow-hidden text-slate-100"
    >
      {/* 1. Header Overlay HUD displays during play */}
      <div 
        id="game-header-hud"
        className="w-full bg-slate-850 text-white border-b-2 sm:border-b-4 border-black p-1 py-1.5 sm:p-2.5 flex items-center justify-between z-10 select-none shadow-[2px_2px_0px_#000] shrink-0"
      >
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            id="hud-pause-btn"
            onClick={() => {
              audio.playCoin();
              setIsPaused(true);
            }}
            className="p-1 sm:p-1.5 bg-yellow-400 text-black border-2 border-black hover:bg-yellow-500 font-black rounded-none shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#000] transition pointer-events-auto"
            title="Pausar Aula"
          >
            <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black" strokeWidth={3} />
          </button>

          {/* Teacher level indicator */}
          <div className="flex flex-col bg-white text-black border-2 border-black px-1 sm:px-2 py-0.5 shadow-[2px_2px_0px_#000] rounded-none">
            <span className="text-[6.5px] sm:text-[8px] uppercase font-mono font-black tracking-tight text-gray-500 leading-none">DIDÁTICA</span>
            <span className="font-sans font-black text-[9px] sm:text-xs text-blue-600 leading-none mt-0.5">Lvl {currentStats.level}</span>
          </div>
        </div>

        {/* Circular Survival Timer HUD center */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-[#FDFCF0] text-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-none border-2 border-black shadow-[2px_2px_0px_#000]">
          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-black" strokeWidth={3} />
          <span className="text-[10px] sm:text-xs font-black font-mono tracking-wider">
            {Math.floor(currentStats.timeSurvived / 60).toString().padStart(2, '0')}:
            {Math.floor(currentStats.timeSurvived % 60).toString().padStart(2, '0')}
          </span>
          <span className="text-[8px] sm:text-[9px] text-gray-600 font-mono font-bold">/05:00</span>
        </div>

        {/* Currency Gold & Minions Slain Counters */}
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="flex items-center gap-0.5 font-mono text-[10px] sm:text-xs text-black font-black bg-yellow-400 border-2 border-black px-1 sm:px-2 py-0.5 sm:py-1 rounded-none shadow-[1.5px_1.5px_0px_#000]">
            <Coins className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-black" />
            <span>{currentStats.goldCurrent}</span>
          </div>

          <div className="flex items-center gap-0.5 font-mono text-[10px] sm:text-xs text-black font-black bg-emerald-400 border-2 border-black px-1 sm:px-2 py-0.5 sm:py-1 rounded-none shadow-[1.5px_1.5px_0px_#000]">
            <span>🎓</span>
            <span>{currentStats.defeatedCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Top XP and HP Bars HUD panel overlays - arranged side-by-side like tablet mode */}
      <div 
        id="game-status-bars" 
        className="w-full h-auto py-1 sm:py-2 px-2 sm:px-4 bg-white border-b-2 sm:border-b-4 border-black flex flex-row items-center justify-between gap-2.5 sm:gap-4 z-10 select-none text-black shrink-0"
      >
        
        {/* Progress XP Bar */}
        <div className="flex-1 flex items-center gap-1 sm:gap-1.5 min-w-0">
          <span className="text-[7px] sm:text-[9px] font-black text-blue-600 underline decoration-2 uppercase tracking-tight shrink-0">EXP AULA</span>
          <div className="w-full bg-gray-150 rounded-none h-2.5 sm:h-3 overflow-hidden border-2 border-black shadow-[1px_1px_0px_#000]">
            <div 
              className="h-full bg-blue-500 transition-all duration-150"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
          <span className="text-[7.5px] sm:text-[9px] font-mono font-bold text-black shrink-0">{xpPercentage}%</span>
        </div>

        {/* HP Bar */}
        <div className="flex-1 flex items-center gap-1 sm:gap-1.5 min-w-0">
          <Heart className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-500 fill-current shrink-0" strokeWidth={3} />
          <div className="w-full bg-gray-150 rounded-none h-2.5 sm:h-3 overflow-hidden border-2 border-black shadow-[1px_1px_0px_#000] relative">
            <div 
              className="h-full bg-red-400 transition-all duration-155"
              style={{ width: `${hpPercentage}%` }}
            />
          </div>
          <span className="text-[7.5px] sm:text-[10px] font-mono text-black font-black shrink-0">
            {currentStats.hp}/{currentStats.maxHp}
          </span>
        </div>

      </div>

      {/* PERSISTENT BUREAUCRATIC 'RED-TAPE' BOSS HP BAR (MOVED TO CANVAS INNER PORTAL FOR TRUE FLOATING OVERLAY) */}

      {/* 3. HTML5 CORE GAME CANVAS VIEW */}
      <div className="w-full flex-1 relative flex items-center justify-center">
        {/* PERSISTENT FLOATING BOSS HP BAR */}
        <AnimatePresence>
          {activeBoss && !bossAnnouncement && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-25 pointer-events-none select-none flex flex-col items-center justify-center p-0"
            >
              {/* Dynamic Physical "Red Tape" ribbon bar representing active boss health without background panel */}
              <div className="w-full bg-black/60 border-2 border-black rounded-none h-6 sm:h-7 relative overflow-hidden shadow-[3px_3px_0px_#000] flex items-center justify-center">
                <div 
                  className="absolute top-0 bottom-0 left-0 transition-all duration-150"
                  style={{ 
                    width: `${Math.min(100, Math.max(0, (activeBoss.hp / activeBoss.maxHp) * 100))}%`,
                    backgroundImage: 'repeating-linear-gradient(-45deg, #7f1d1d 0px, #7f1d1d 10px, #991b1b 10px, #991b1b 20px, #b91c1c 20px, #b91c1c 30px, #dc2626 30px, #dc2626 40px)' 
                  }}
                />
                
                {/* Visual texture stripes laid over the gradient for ribbon authenticity */}
                <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-black" />
                
                {/* Boss name inside the bar */}
                <span className="relative z-10 text-[9px] sm:text-xs uppercase font-mono font-black tracking-widest text-[#FFFCE8] drop-shadow-[1.5px_1.5px_0px_rgba(0,0,0,0.95)]">
                  ⚠️ {activeBoss.name}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <canvas 
          ref={canvasRef} 
          style={{ imageRendering: 'pixelated' }}
          className="border-b border-slate-900 max-h-full block cursor-crosshair select-none"
        />



        {/* 4. Controls virtual Joystick interface */}
        <VirtualJoystick 
          onMove={(mv) => {
            gameRef.current.moveVector = mv;
          }} 
          active={!isPaused && !isLevelUpPause && !bossAnnouncement}
        />
      </div>

      {/* 5. PAUSE MENU PANEL */}
      {isPaused && (
        <PauseScreen
          stats={currentStats}
          soundEnabled={soundEnabled}
          permanentUpgrades={permanentUpgrades}
          onResume={() => setIsPaused(false)}
          onRestart={() => {
            // Hot Reset active refs state
            const r = gameRef.current;
            r.playerHp = r.playerMaxHp;
            r.playerX = 0;
            r.playerY = 0;
            r.playerXp = 0;
            r.playerLevel = 1;
            r.playerTicks = 0;
            r.playerTime = 0;
            r.totalTicks = 0;
            r.playerDefeated = 0;
            r.playerGoldGained = 0;
            r.enemies = [];
            r.projectiles = [];
            enemyPoolRef.current = [];
            projectilePoolRef.current = [];
            r.powerUps = [];
            r.particles = [];
            r.warnings = [];
            r.aiSummons = [];
            r.gameOverTriggered = false;
            r.victoryTriggered = false;
            r.articuladoraCount = 0;
            r.bossSpawnsDone = {
              [EnemyType.CHEF_CONSELHO_DEC_LASSE]: false,
              [EnemyType.CHEF_SABADO_LETIVO]: false,
              [EnemyType.CHEF_SEMANA_PEDAGOGICA]: false,
              [EnemyType.CHEF_FECHAMENTO_UNIDADE]: false
            } as any;
            r.bossWarningsDone = {
              [EnemyType.CHEF_CONSELHO_DEC_LASSE]: false,
              [EnemyType.CHEF_SABADO_LETIVO]: false,
              [EnemyType.CHEF_SEMANA_PEDAGOGICA]: false,
              [EnemyType.CHEF_FECHAMENTO_UNIDADE]: false
            } as any;
            setBossAnnouncement(null);
            // reset weapons levels
            Object.values(r.weapons).forEach((w: any) => {
              w.level = w.type === WeaponType.CANETA_VERMELHA ? 1 : 0;
            });
            setIsPaused(false);
          }}
          onExit={() => {
            const g = gameRef.current;
            onGameEnd({
              victory: false,
              goldGained: g.playerGoldGained,
              defeatedCount: g.playerDefeated,
              survivedTime: g.playerTime,
              finalLevel: g.playerLevel,
              scenarioType: scenario.type,
              finalHpPercent: Math.max(0, Math.floor((g.playerHp / g.playerMaxHp) * 100))
            });
          }}
          onToggleSound={onToggleSound}
        />
      )}

      {/* 6. LEVEL UP SELECTION CARDS DIALOG */}
      {isLevelUpPause && (
        <UpgradeSelection
          options={levelUpOptions}
          onSelect={applyUpgradeOption}
        />
      )}

      {/* 7. CINEMATIC BOSS ARRIVAL TALK DIALOG OVERLAY (RESIZED & COMPACT CODEC STYLE) */}
      <AnimatePresence>
        {bossAnnouncement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none text-white overflow-hidden"
          >
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: -25 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
              className="relative w-full max-w-md bg-slate-950 border-3 border-red-600 rounded-none shadow-[6px_6px_0px_#000] p-3 flex flex-col gap-2.5"
            >
              {/* Ultra Compact Warning Label */}
              <div className="flex items-center justify-between border-b border-red-900 pb-1 text-[8.5px] font-mono tracking-widest text-red-500 font-extrabold">
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">🚨</span> ALERTA DE CHEFE / COOPERAÇÃO REQUISITADA
                </span>
                <span>M.E.C. PROTOCOLO #{Math.floor(Math.random() * 899 + 100)}</span>
              </div>

              {/* Speech Layout Row */}
              <div className="flex items-center gap-3.5">
                {/* Real Pixel Art Boss Sprite Portrait (talking animated face) */}
                <div className="flex-shrink-0 relative">
                  <BossSpritePreview 
                    bossType={bossAnnouncement.type} 
                    enemySpriteSheets={enemySpriteSheetsRef.current} 
                    studentSpriteSheets={studentSpriteSheetsRef.current}
                  />
                  {/* Small "TALKING" indicator */}
                  <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[7px] font-mono font-black uppercase px-1 py-0.2 animate-pulse rounded-none tracking-tighter shadow">
                    ON-LINE
                  </div>
                </div>

                {/* RPG Bubble / Dialogue Content */}
                <div className="flex-1 min-w-0 text-left bg-zinc-900 border border-zinc-700 p-2.5 relative shadow-inner">
                  {/* Small speech arrow on the left */}
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-zinc-700 border-b-6 border-b-transparent after:content-[''] after:absolute after:top-1/2 after:left-1 after:-translate-y-1/2 after:w-0 after:h-0 after:border-t-5 after:border-t-transparent after:border-r-7 after:border-r-zinc-900 after:border-b-5 after:border-b-transparent" />

                  {/* Boss Title & Name */}
                  <span className="text-[10px] uppercase font-mono font-black text-amber-500 leading-none block mb-1">
                    {bossAnnouncement.name}
                  </span>
                  
                  {/* Sarcastic Quote / Instruction */}
                  <p className="text-[11px] sm:text-xs font-mono font-medium italic text-amber-100 leading-tight">
                    "{bossAnnouncement.quote}"
                  </p>
                </div>
              </div>

              {/* Minimal Counter State & Actions */}
              <div className="flex items-center justify-between border-t border-zinc-900 pt-2 text-[10px] font-mono">
                <div className="text-slate-400 flex items-center gap-1.5 text-[9px] sm:text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Combate em <span className="font-bold text-red-500">2s</span>
                </div>
                
                <button
                  id="btn-dismiss-boss-warning"
                  onClick={() => setBossAnnouncement(null)}
                  style={{ backgroundColor: bossAnnouncement.color || '#ef4444' }}
                  className="px-3 py-1 cursor-pointer font-sans font-black text-black active:translate-y-0.5 active:translate-x-0.5 border border-black rounded-none shadow-[1.5px_1.5px_0px_#000] hover:brightness-110 uppercase text-[9px] tracking-wide"
                >
                  ENFRENTAR CHEFE! 💥
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
