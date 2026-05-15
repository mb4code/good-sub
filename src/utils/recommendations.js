import { MINIMUM_SECONDS } from './time.js';
import { SLOTS, onFieldPlayerIds } from './gameState.js';

export function getGameMetrics(players, game) {
  const attending = players.filter((player) => game.attendanceIds.includes(player.id));
  const currentFieldStrength = onFieldPlayerIds(game.assignments)
    .map((id) => players.find((player) => player.id === id)?.strength || 0)
    .reduce((sum, strength) => sum + strength, 0);
  const bestPossibleFieldStrength = [...attending]
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 11)
    .reduce((sum, player) => sum + player.strength, 0);
  const playerMinutesAvailable = 11 * 60;
  const requiredPlayerMinutes = attending.length * 30;

  return {
    currentFieldStrength,
    bestPossibleFieldStrength,
    playerMinutesAvailable,
    requiredPlayerMinutes,
    mathematicallyPossible: requiredPlayerMinutes <= playerMinutesAvailable,
    realisticPossible: requiredPlayerMinutes <= playerMinutesAvailable && attending.length <= 22
  };
}

export function getRecommendations(players, game) {
  const playerById = Object.fromEntries(players.map((player) => [player.id, player]));
  const fieldIds = new Set(onFieldPlayerIds(game.assignments));
  const benchPlayers = players.filter((player) => game.attendanceIds.includes(player.id) && !fieldIds.has(player.id));

  const bySlot = {};
  SLOTS.forEach((slot) => {
    const currentPlayer = playerById[game.assignments[slot.id]];
    bySlot[slot.id] = benchPlayers
      .map((benchPlayer) => pairRecommendation(benchPlayer, currentPlayer, slot, game))
      .filter(Boolean)
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 3);
  });

  const byPosition = SLOTS.reduce((groups, slot) => {
    const best = bySlot[slot.id]?.[0];
    if (best) groups[slot.position].push(best);
    return groups;
  }, { Goalie: [], Sweeper: [], Defense: [], Midfield: [], Forward: [] });

  Object.keys(byPosition).forEach((position) => {
    byPosition[position].sort((a, b) => b.totalScore - a.totalScore);
  });

  return {
    bySlot,
    byPosition,
    nextSubs: Object.values(byPosition)
      .flat()
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 8)
  };
}

function pairRecommendation(inPlayer, outPlayer, slot, game) {
  if (!inPlayer || !outPlayer || inPlayer.id === outPlayer.id) return null;
  if (slot.position === 'Goalie' && !inPlayer.desiredPositions.includes('Goalie')) return null;

  const inStats = game.playerStats[inPlayer.id] || { totalSeconds: 0 };
  const outStats = game.playerStats[outPlayer.id] || { totalSeconds: 0 };
  const positionMatch = inPlayer.desiredPositions.includes(slot.position);
  const outPositionMatch = outPlayer.desiredPositions.includes(slot.position);

  // Required scoring model from the product brief. It intentionally blends ability,
  // position fit, and playing-time need so recommendations stay useful live.
  const strengthScore = inPlayer.strength * 10;
  const positionMatchBonus = positionMatch ? 15 : 0;
  const needsMinutesBonus = inStats.totalSeconds < MINIMUM_SECONDS ? 30 : 0;
  const lowMinutesBonus = Math.max(0, 30 - inStats.totalSeconds / 60);
  const incomingScore = strengthScore + positionMatchBonus + needsMinutesBonus + lowMinutesBonus;

  const outReachedThirty = outStats.totalSeconds >= MINIMUM_SECONDS;
  const outScore =
    (outReachedThirty ? 26 : -18) +
    (!outPositionMatch ? 14 : 0) +
    Math.max(0, outStats.totalSeconds / 60 - 30) -
    outPlayer.strength * 2;

  const strengthImpact = inPlayer.strength - outPlayer.strength;
  const playingTimeImpact = Math.max(0, MINIMUM_SECONDS - inStats.totalSeconds) / 60;
  const reasons = [];
  if (playingTimeImpact > 0) reasons.push(`${inPlayer.name} needs ${Math.ceil(playingTimeImpact)} more minutes to reach 30`);
  if (positionMatch) reasons.push(`${inPlayer.name} prefers ${slot.position}`);
  if (outReachedThirty) reasons.push(`${outPlayer.name} has already reached 30 minutes`);
  if (!outPositionMatch) reasons.push(`${outPlayer.name} is out of preferred position`);
  if (strengthImpact >= 0) reasons.push('Keeps team S Type high');
  if (playingTimeImpact > 0) reasons.push('Balances playing time');

  return {
    inPlayer,
    outPlayer,
    slot,
    strengthImpact,
    playingTimeImpact,
    totalScore: incomingScore + outScore,
    reasons
  };
}
