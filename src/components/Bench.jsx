import { useDroppable } from '@dnd-kit/core';
import PlayerCard from './PlayerCard.jsx';

export default function Bench({ players, game }) {
  const { isOver, setNodeRef } = useDroppable({ id: 'bench' });
  const stagedIds = new Set(Object.values(game.stagedSubs || {}));
  const sortedPlayers = [...players].sort((a, b) => {
    const stateDiff = getListStateRank(a, game, stagedIds) - getListStateRank(b, game, stagedIds);
    if (stateDiff !== 0) return stateDiff;
    const roleDiff = getPositionRank(a) - getPositionRank(b);
    if (roleDiff !== 0) return roleDiff;
    return a.name.localeCompare(b.name);
  });

  return (
    <section ref={setNodeRef} className={`bench ${isOver ? 'drop-over' : ''}`}>
      <h2>Players</h2>
      <div className="bench-list">
        {sortedPlayers.map((player) => {
          const onField = Object.values(game.assignments).includes(player.id);
          return (
            <PlayerCard
              key={player.id}
              player={player}
              stats={game.playerStats[player.id]}
              status={onField ? 'field' : 'bench'}
              staged={stagedIds.has(player.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

function getPositionRank(player) {
  const positions = player.desiredPositions || [];
  if (positions.some((position) => ['Goalie', 'Sweeper', 'Defense'].includes(position))) return 0;
  if (positions.includes('Midfield')) return 1;
  if (positions.includes('Forward')) return 2;
  return 3;
}

function getListStateRank(player, game, stagedIds) {
  if (stagedIds.has(player.id)) return 2;
  if (Object.values(game.assignments).includes(player.id)) return 1;
  return 0;
}
