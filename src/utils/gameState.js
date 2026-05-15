import { GAME_SECONDS } from './time.js';

export const POSITIONS = ['Goalie', 'Sweeper', 'Defense', 'Midfield', 'Forward'];
export const SLOTS = [
  { id: 'goalie-1', position: 'Goalie', label: 'Goalie' },
  { id: 'sweeper-1', position: 'Sweeper', label: 'Sweeper' },
  { id: 'defense-1', position: 'Defense', label: 'Defense 1' },
  { id: 'defense-2', position: 'Defense', label: 'Defense 2' },
  { id: 'defense-3', position: 'Defense', label: 'Defense 3' },
  { id: 'midfield-1', position: 'Midfield', label: 'Midfield 1' },
  { id: 'midfield-2', position: 'Midfield', label: 'Midfield 2' },
  { id: 'midfield-3', position: 'Midfield', label: 'Midfield 3' },
  { id: 'forward-1', position: 'Forward', label: 'Forward 1' },
  { id: 'forward-2', position: 'Forward', label: 'Forward 2' },
  { id: 'forward-3', position: 'Forward', label: 'Forward 3' }
];

export function createNewGame(roster, attendanceIds) {
  const playerStats = Object.fromEntries(
    roster.map((player) => [
      player.id,
      { totalSeconds: 0, stints: [], activeStint: null, positions: [] }
    ])
  );

  return {
    id: `game-${Date.now()}`,
    createdAt: new Date().toISOString(),
    elapsedSeconds: 0,
    running: false,
    lastTickAt: null,
    attendanceIds,
    assignments: Object.fromEntries(SLOTS.map((slot) => [slot.id, null])),
    stagedSubs: {},
    playerStats,
    strengthHistory: []
  };
}

export function updateGameAttendance(game, roster, attendanceIds) {
  const next = cloneGame(game);
  const attending = new Set(attendanceIds);
  next.attendanceIds = attendanceIds;
  next.playerStats = next.playerStats || {};

  roster.forEach((player) => {
    if (!next.playerStats[player.id]) {
      next.playerStats[player.id] = { totalSeconds: 0, stints: [], activeStint: null, positions: [] };
    }
  });

  Object.keys(next.assignments || {}).forEach((slotId) => {
    const playerId = next.assignments[slotId];
    if (playerId && !attending.has(playerId)) {
      next.assignments[slotId] = null;
      endStint(next, playerId);
    }
  });

  next.stagedSubs = Object.fromEntries(
    Object.entries(next.stagedSubs || {}).filter(([, playerId]) => attending.has(playerId))
  );

  return next;
}

export function onFieldPlayerIds(assignments) {
  return Object.values(assignments).filter(Boolean);
}

export function getPlayerSlot(assignments, playerId) {
  return SLOTS.find((slot) => assignments[slot.id] === playerId);
}

export function assignPlayer(game, playerId, targetSlotId) {
  if (!targetSlotId) return removePlayer(game, playerId);
  const targetSlot = SLOTS.find((slot) => slot.id === targetSlotId);
  if (!targetSlot || !game.attendanceIds.includes(playerId)) return game;

  let next = cloneGame(game);
  const previousSlot = getPlayerSlot(next.assignments, playerId);
  const replacedPlayerId = next.assignments[targetSlotId];

  if (previousSlot?.id === targetSlotId) return next;
  if (previousSlot) next = endStint(next, playerId);
  if (replacedPlayerId) next = endStint(next, replacedPlayerId);

  Object.keys(next.assignments).forEach((slotId) => {
    if (next.assignments[slotId] === playerId) next.assignments[slotId] = null;
  });

  next.assignments[targetSlotId] = playerId;
  if (previousSlot && replacedPlayerId) {
    next.assignments[previousSlot.id] = replacedPlayerId;
    next = startStint(next, replacedPlayerId, previousSlot.position);
  }
  next = startStint(next, playerId, targetSlot.position);
  return next;
}

export function removePlayer(game, playerId) {
  let next = cloneGame(game);
  Object.keys(next.assignments).forEach((slotId) => {
    if (next.assignments[slotId] === playerId) next.assignments[slotId] = null;
  });
  return endStint(next, playerId);
}

export function tickGame(game, now = Date.now()) {
  if (!game.running) return game;
  const lastTickAt = game.lastTickAt || now;
  const delta = Math.max(0, Math.min(5, (now - lastTickAt) / 1000));
  if (delta <= 0) return { ...game, lastTickAt: now };
  const next = cloneGame(game);
  next.elapsedSeconds = Math.min(GAME_SECONDS, next.elapsedSeconds + delta);
  onFieldPlayerIds(next.assignments).forEach((playerId) => {
    next.playerStats[playerId].totalSeconds += delta;
  });
  next.lastTickAt = now;
  if (next.elapsedSeconds >= GAME_SECONDS) next.running = false;
  return next;
}

export function startClock(game) {
  return { ...game, running: true, lastTickAt: Date.now() };
}

export function pauseClock(game) {
  return { ...tickGame(game), running: false, lastTickAt: null };
}

export function setClock(game, elapsedSeconds, creditActivePlayers = false) {
  const next = cloneGame(game);
  const nextElapsed = Math.max(0, Math.min(GAME_SECONDS, elapsedSeconds));
  const delta = nextElapsed - next.elapsedSeconds;
  if (creditActivePlayers && delta > 0) {
    onFieldPlayerIds(next.assignments).forEach((playerId) => {
      next.playerStats[playerId].totalSeconds += delta;
    });
  }
  next.elapsedSeconds = nextElapsed;
  next.lastTickAt = next.running ? Date.now() : null;
  return next;
}

export function closeActiveStints(game) {
  let next = cloneGame(game);
  onFieldPlayerIds(next.assignments).forEach((playerId) => {
    next = endStint(next, playerId);
  });
  return next;
}

function startStint(game, playerId, position) {
  const stat = game.playerStats[playerId];
  if (!stat || stat.activeStint) return game;
  stat.activeStint = { playerId, position, startGameTime: game.elapsedSeconds };
  if (!stat.positions.includes(position)) stat.positions.push(position);
  return game;
}

function endStint(game, playerId) {
  const stat = game.playerStats[playerId];
  if (!stat?.activeStint) return game;
  const stint = stat.activeStint;
  const endGameTime = game.elapsedSeconds;
  stat.stints.push({ ...stint, endGameTime, duration: Math.max(0, endGameTime - stint.startGameTime) });
  stat.activeStint = null;
  return game;
}

function cloneGame(game) {
  return JSON.parse(JSON.stringify(game));
}
