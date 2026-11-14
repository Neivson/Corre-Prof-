import { ScenarioType } from '../types';
import type { Achievement, PermanentShopUpgrades } from '../types';

export const PROGRESS_KEY = 'correprof_progress_v1';

export interface SavedProgress {
  version: 1;
  gold: number;
  upgrades: PermanentShopUpgrades;
  achievements: Achievement[];
  completedScenarios: ScenarioType[];
}

const LEGACY_KEYS = {
  gold: 'correprof_gold_v2',
  upgrades: 'correprof_upgrades_v2',
  achievements: 'correprof_achievements_v3',
  completed: 'correprof_completed_scenarios_v2',
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const validGold = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const LEVEL_KEYS: (keyof PermanentShopUpgrades)[] = [
  'maxHpLevel', 'speedLevel', 'damageLevel', 'xpLevel', 'luckLevel',
];

export function normalizeProgress(value: unknown, defaults: SavedProgress): SavedProgress {
  if (!isRecord(value)) return defaults;
  const parsedUpgrades = isRecord(value.upgrades) ? value.upgrades : {};
  const upgrades = { ...defaults.upgrades };
  for (const key of LEVEL_KEYS) {
    const level = parsedUpgrades[key];
    if (typeof level === 'number' && Number.isInteger(level) && level >= 0 && level <= 5) {
      upgrades[key] = level;
    }
  }
  const existing = new Map(defaults.achievements.map(ach => [ach.id, ach]));
  const achievements = defaults.achievements.map(ach => ({ ...ach }));
  if (Array.isArray(value.achievements)) {
    for (const saved of value.achievements) {
      if (!isRecord(saved) || typeof saved.id !== 'string') continue;
      const initial = existing.get(saved.id);
      if (!initial) continue;
      const position = achievements.findIndex(ach => ach.id === saved.id);
      if (position < 0) continue;
      achievements[position] = {
        ...initial,
        unlocked: saved.unlocked === true,
        currentValue: typeof saved.currentValue === 'number' && Number.isFinite(saved.currentValue)
          ? Math.max(0, Math.min(initial.targetValue, Math.floor(saved.currentValue)))
          : initial.currentValue,
      };
    }
  }
  const allowedScenarios = new Set(Object.values(ScenarioType));
  const completedScenarios = Array.isArray(value.completedScenarios)
    ? [...new Set(value.completedScenarios.filter((s): s is ScenarioType => typeof s === 'string' && allowedScenarios.has(s as ScenarioType)))]
    : [...defaults.completedScenarios];
  return {
    version: 1,
    gold: validGold(value.gold) ? value.gold : defaults.gold,
    upgrades,
    achievements,
    completedScenarios,
  };
}

export function readProgress(storage: Pick<Storage, 'getItem' | 'setItem'>, defaults: SavedProgress): SavedProgress {
  const stored = storage.getItem(PROGRESS_KEY);
  if (stored !== null) {
    try {
      const parsed: unknown = JSON.parse(stored);
      if (isRecord(parsed) && parsed.version === 1) return normalizeProgress(parsed, defaults);
    } catch (error) {
      console.warn('Salvamento consolidado ilegível; tentando recuperar dados anteriores.', error);
    }
  }
  // Import older saves without deleting them; an interrupted migration remains recoverable.
  const legacy: Record<string, unknown> = {};
  for (const [field, key] of Object.entries(LEGACY_KEYS)) {
    const raw = storage.getItem(key);
    if (raw === null) continue;
    try { legacy[field === 'completed' ? 'completedScenarios' : field] = field === 'gold' ? Number(raw) : JSON.parse(raw); }
    catch (error) { console.warn(`Falha ao ler progresso antigo: ${field}`, error); }
  }
  const normalized = normalizeProgress(legacy, defaults);
  storage.setItem(PROGRESS_KEY, JSON.stringify(normalized));
  return normalized;
}

export function writeProgress(storage: Pick<Storage, 'setItem'>, progress: SavedProgress): void {
  storage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function clearProgress(storage: Pick<Storage, 'removeItem'>): void {
  storage.removeItem(PROGRESS_KEY);
  for (const key of Object.values(LEGACY_KEYS)) storage.removeItem(key);
}
