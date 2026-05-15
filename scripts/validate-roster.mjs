import fs from 'node:fs';
import path from 'node:path';

const rosterPath = path.resolve('src/data/teamRoster.json');
const validPositions = new Set(['Goalie', 'Sweeper', 'Defense', 'Midfield', 'Forward']);

try {
  const roster = JSON.parse(fs.readFileSync(rosterPath, 'utf8'));
  validateRoster(roster);
  console.log(`Roster OK: ${roster.length} players in ${rosterPath}`);
} catch (error) {
  console.error(`Roster validation failed: ${error.message}`);
  process.exit(1);
}

function validateRoster(value) {
  if (!Array.isArray(value)) throw new Error('Roster must be an array.');
  const ids = new Set();
  value.forEach((player, index) => {
    const label = player?.name || `player ${index + 1}`;
    if (!player || typeof player !== 'object') throw new Error(`Entry ${index + 1} must be an object.`);
    if (!player.id || typeof player.id !== 'string') throw new Error(`${label} needs a string id.`);
    if (ids.has(player.id)) throw new Error(`Duplicate player id: ${player.id}`);
    ids.add(player.id);
    if (!player.name || typeof player.name !== 'string') throw new Error(`${player.id} needs a name.`);
    const strength = getStrengthValue(player);
    if (!Number.isInteger(strength) || strength < 1 || strength > 5) {
      throw new Error(`${label} S Type must be S1 to S5.`);
    }
    if (!Array.isArray(player.desiredPositions) || player.desiredPositions.length === 0) {
      throw new Error(`${label} needs at least one desired position.`);
    }
    player.desiredPositions.forEach((position) => {
      if (!validPositions.has(position)) throw new Error(`${label} has invalid position: ${position}`);
    });
  });
}

function getStrengthValue(player) {
  if (Number.isInteger(player.strength)) return player.strength;
  if (typeof player.sType === 'string' && /^S[1-5]$/.test(player.sType)) return Number(player.sType.slice(1));
  if (typeof player.rating === 'string' && /^S[1-5]$/.test(player.rating)) return Number(player.rating.slice(1));
  return NaN;
}
