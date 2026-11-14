import assert from 'node:assert/strict';
import test from 'node:test';

// Run tests after TypeScript compilation to a temporary directory:
// tsc --target ES2020 --module esnext --outDir .test-build src/utils/enemySeparation.ts
import { separateNearbyEnemies } from '../.test-build/enemySeparation.js';

test('separates exactly overlapping enemies without NaN', () => {
  const enemies = [{ x: 0, y: 0, size: 15, hp: 10 }, { x: 0, y: 0, size: 15, hp: 10 }];
  separateNearbyEnemies(enemies, 0, 0);
  for (const e of enemies) assert.ok(Number.isFinite(e.x) && Number.isFinite(e.y));
  assert.ok(Math.hypot(enemies[0].x - enemies[1].x, enemies[0].y - enemies[1].y) > 0);
});
test('moves regular enemy away from stationary boss', () => {
  const enemies = [{ x: 0, y: 0, size: 34, hp: 10, isBoss: true }, { x: 10, y: 0, size: 15, hp: 10 }];
  separateNearbyEnemies(enemies, 0, 0);
  assert.equal(enemies[0].x, 0);
  assert.ok(enemies[1].x > 10);
});
test('ignores dead enemies and enemies outside the local region', () => {
  const enemies = [{ x: 0, y: 0, size: 15, hp: 0 }, { x: 1, y: 0, size: 15, hp: 10 }, { x: 250, y: 0, size: 15, hp: 10 }];
  separateNearbyEnemies(enemies, 0, 0);
  assert.equal(enemies[1].x, 1);
  assert.equal(enemies[2].x, 250);
});
test('resolves pairs straddling a cell boundary', () => {
  const enemies = [{ x: 95, y: 0, size: 15, hp: 10 }, { x: 97, y: 0, size: 15, hp: 10 }];
  separateNearbyEnemies(enemies, 96, 0);
  assert.ok(enemies[0].x < 95);
  assert.ok(enemies[1].x > 97);
});
