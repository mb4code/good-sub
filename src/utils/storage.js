const ROSTER_KEY = 'soccerSubs.roster';
const GAME_KEY = 'soccerSubs.game';
const VALID_POSITIONS = new Set(['Goalie', 'Sweeper', 'Defense', 'Midfield', 'Forward']);

export function loadRoster(fallback) {
  return normalizeRoster(readJson(ROSTER_KEY, fallback), fallback);
}

export function saveRoster(roster) {
  localStorage.setItem(ROSTER_KEY, JSON.stringify(roster));
}

export function loadGame() {
  return normalizeGame(readJson(GAME_KEY, null));
}

export function saveGame(game) {
  if (!game) return;
  localStorage.setItem(GAME_KEY, JSON.stringify({ ...game, running: false, lastTickAt: null }));
}

export function clearGame() {
  localStorage.removeItem(GAME_KEY);
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeRoster(value, fallback) {
  if (!Array.isArray(value)) return fallback;
  const ids = new Set();
  const roster = value.filter((player) => {
    if (!player || typeof player !== 'object') return false;
    if (!player.id || !player.name || ids.has(player.id)) return false;
    const strength = getStrengthValue(player);
    if (!Number.isFinite(strength) || strength < 1 || strength > 5) return false;
    if (!Array.isArray(player.desiredPositions) || player.desiredPositions.length === 0) return false;
    if (player.desiredPositions.some((position) => !VALID_POSITIONS.has(position))) return false;
    ids.add(player.id);
    player.strength = strength;
    delete player.rating;
    delete player.sType;
    return true;
  });
  return roster.length > 0 ? roster : fallback;
}

function getStrengthValue(player) {
  if (Number.isFinite(player.strength)) return player.strength;
  if (typeof player.rating === 'string' && /^S[1-5]$/.test(player.rating)) {
    return Number(player.rating.slice(1));
  }
  if (typeof player.sType === 'string' && /^S[1-5]$/.test(player.sType)) {
    return Number(player.sType.slice(1));
  }
  return NaN;
}

function normalizeGame(value) {
  if (!value || typeof value !== 'object') return null;
  if (!Array.isArray(value.attendanceIds)) return null;
  if (!value.assignments || typeof value.assignments !== 'object') return null;
  if (!value.playerStats || typeof value.playerStats !== 'object') return null;
  return {
    ...value,
    elapsedSeconds: Number.isFinite(value.elapsedSeconds) ? value.elapsedSeconds : 0,
    stagedSubs: value.stagedSubs && typeof value.stagedSubs === 'object' ? value.stagedSubs : {},
    running: false,
    lastTickAt: null
  };
}
