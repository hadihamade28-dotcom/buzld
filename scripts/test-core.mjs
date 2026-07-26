import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

// Lightweight tests for pure logic without a full RN runtime.
const require = createRequire(import.meta.url);
const ngeohash = require('ngeohash');

function patternFromSeed(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const pulses = 3 + (hash % 3);
  const pattern = [0];
  for (let i = 0; i < pulses; i++) {
    const on = 80 + ((hash >> (i * 3)) % 5) * 40;
    const off = 60 + ((hash >> (i * 5)) % 4) * 50;
    pattern.push(on);
    if (i < pulses - 1) pattern.push(off);
  }
  return pattern;
}

function reciprocalSeeking(a, b) {
  const ok = (gender, seeking) => {
    if (!gender || !seeking) return false;
    if (seeking === 'everyone') return true;
    return gender === seeking;
  };
  return ok(b.gender, a.seeking) && ok(a.gender, b.seeking);
}

function interestOverlapScore(a, b) {
  if (!a.length || !b.length) return 0;
  const setB = new Set(b);
  const overlap = a.filter((x) => setB.has(x)).length;
  return overlap / Math.max(a.length, b.length);
}

function compatibilityScore(a, b, aInterests, bInterests) {
  if (!reciprocalSeeking(a, b)) return 0;
  const interests = interestOverlapScore(aInterests, bInterests);
  return 0.55 * interests + 0.45 * 0.3;
}

// --- haptic uniqueness / shared determinism
const p1 = patternFromSeed('abc123');
const p2 = patternFromSeed('abc123');
const p3 = patternFromSeed('other-seed');
assert.deepEqual(p1, p2, 'same seed => same pattern');
assert.notDeepEqual(p1, p3, 'different seeds should differ');
assert.ok(p1.length >= 5, 'pattern has multiple pulses');

// --- geohash nearby
const gh = ngeohash.encode(37.7749, -122.4194, 8);
const neighbors = ngeohash.neighbors(gh);
assert.ok(gh.length === 8);
assert.ok(Object.keys(neighbors).length >= 8);

// --- matching
const scoreGood = compatibilityScore(
  { gender: 'man', seeking: 'woman' },
  { gender: 'woman', seeking: 'man' },
  ['coffee', 'music', 'film'],
  ['coffee', 'music', 'hiking'],
);
const scoreBadSeeking = compatibilityScore(
  { gender: 'man', seeking: 'man' },
  { gender: 'woman', seeking: 'man' },
  ['coffee', 'music'],
  ['coffee', 'music'],
);
assert.ok(scoreGood >= 0.35, `expected compatible score, got ${scoreGood}`);
assert.equal(scoreBadSeeking, 0, 'non-reciprocal seeking scores 0');

console.log('All core Vicino tests passed.');
