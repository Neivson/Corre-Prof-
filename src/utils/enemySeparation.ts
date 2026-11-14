/**
 * Separates overlapping enemies using a spatial grid. The caller decides when
 * to run it (currently every other physics tick) and which enemies are nearby.
 * Pair evaluation is deterministic and only performed once per neighboring pair.
 */
export interface SeparatableEnemy {
  x: number;
  y: number;
  size: number;
  isBoss?: boolean;
  hp: number;
}

const CELL_SIZE = 96; // > maximum separation diameter (boss: 34 * 2 * .92)

export function separateNearbyEnemies<T extends SeparatableEnemy>(
  enemies: readonly T[],
  playerX: number,
  playerY: number,
  radius = 220,
): void {
  const grid = new Map<string, number[]>();
  const nearby: T[] = [];

  for (const enemy of enemies) {
    if (enemy.hp <= 0 || Math.abs(enemy.x - playerX) >= radius || Math.abs(enemy.y - playerY) >= radius) continue;
    const index = nearby.length;
    nearby.push(enemy);
    const key = `${Math.floor(enemy.x / CELL_SIZE)},${Math.floor(enemy.y / CELL_SIZE)}`;
    const occupants = grid.get(key);
    if (occupants) occupants.push(index);
    else grid.set(key, [index]);
  }

  // Iterate each unordered pair once. As with the previous method, positions are
  // moved immediately, with the grid built from the initial positions this tick.
  for (let i = 0; i < nearby.length; i++) {
    const e1 = nearby[i];
    const cellX = Math.floor(e1.x / CELL_SIZE);
    const cellY = Math.floor(e1.y / CELL_SIZE);

    for (let oy = -1; oy <= 1; oy++) {
      for (let ox = -1; ox <= 1; ox++) {
        const neighbors = grid.get(`${cellX + ox},${cellY + oy}`);
        if (!neighbors) continue;
        for (const j of neighbors) {
          if (j <= i) continue;
          const e2 = nearby[j];
          const dx = e2.x - e1.x;
          const dy = e2.y - e1.y;
          const minDist = (e1.size + e2.size) * 0.92;
          if (Math.abs(dx) >= minDist || Math.abs(dy) >= minDist) continue;
          const distSq = dx * dx + dy * dy;
          if (distSq >= minDist * minDist) continue;
          const distance = Math.sqrt(distSq);
          const overlap = minDist - distance;
          // Deterministic direction in the rare exactly-overlapped case.
          const angle = (i * 2.399963229728653 + j * 0.618033988749895) % (Math.PI * 2);
          const pushX = distance > 0 ? (dx / distance) * overlap : Math.cos(angle) * overlap;
          const pushY = distance > 0 ? (dy / distance) * overlap : Math.sin(angle) * overlap;

          if (e1.isBoss && !e2.isBoss) {
            e2.x += pushX; e2.y += pushY;
          } else if (e2.isBoss && !e1.isBoss) {
            e1.x -= pushX; e1.y -= pushY;
          } else {
            e1.x -= pushX * 0.5; e1.y -= pushY * 0.5;
            e2.x += pushX * 0.5; e2.y += pushY * 0.5;
          }
        }
      }
    }
  }
}
