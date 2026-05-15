import { useDraggable } from '@dnd-kit/core';
import { MINIMUM_SECONDS } from '../utils/time.js';

export default function PlayerCard({ player, stats, status, compact = false, staged = false, dragDisabled = false, overlay = false, dragSource = 'list' }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `player:${player.id}:${dragSource}`, disabled: dragDisabled });
  const totalSeconds = stats?.totalSeconds || 0;
  const remaining = Math.max(0, MINIMUM_SECONDS - totalSeconds);
  const totalMinutes = Math.round(totalSeconds / 60);
  const remainingMinutes = Math.ceil(remaining / 60);

  return (
    <article
      ref={setNodeRef}
      className={`player-card ${status} ${staged ? 'staged' : ''} ${overlay ? 'overlay-card' : ''} ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="player-card-main">
        <strong>{player.name}</strong>
        <span className="player-positions">{player.desiredPositions.join(', ')}</span>
        <span className="badge">S{player.strength}</span>
      </div>
      <div className="card-badges">
        <span className={`badge ${totalSeconds >= MINIMUM_SECONDS ? 'good-badge' : 'need-badge'}`}>
          {totalSeconds >= MINIMUM_SECONDS ? 'Reached 30' : `Needs ${remainingMinutes}`}
        </span>
        <span className="badge">{totalMinutes} min</span>
        {staged && <span className="badge recommended">Staged</span>}
        <span className={`badge ${status === 'field' ? 'field-badge' : 'bench-badge'}`}>{status === 'field' ? 'On Field' : 'Bench'}</span>
      </div>
    </article>
  );
}
