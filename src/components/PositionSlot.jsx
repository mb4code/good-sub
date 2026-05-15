import { useDraggable, useDroppable } from '@dnd-kit/core';
import { MINIMUM_SECONDS, formatClock } from '../utils/time.js';

export default function PositionSlot({ slot, player, stats, stagedPlayer, onCancelStage }) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot:${slot.id}` });
  const draggable = useDraggable({ id: player ? `player:${player.id}:field` : `empty:${slot.id}`, disabled: !player });
  const match = player?.desiredPositions.includes(slot.position);
  const activeStart = stats?.activeStint?.startGameTime;
  const currentStint = activeStart === undefined ? 0 : Math.max(0, stats.activeStint ? stats.liveElapsed - activeStart : 0);
  const totalMinutes = Math.round((stats?.totalSeconds || 0) / 60);

  return (
    <article
      ref={setNodeRef}
      className={`position-slot ${isOver ? 'drop-over' : ''} ${player ? '' : 'empty'}`}
      data-slot-id={slot.id}
      tabIndex="-1"
    >
      <div className="slot-label">
        <strong>{slot.label}</strong>
        {player && <span className={`badge ${match ? 'good-badge' : 'warn-badge'}`}>{match ? 'Preferred' : 'Out of position'}</span>}
      </div>
      {player ? (
        <div className="slot-content">
          <div
            ref={draggable.setNodeRef}
            className="slot-player draggable-player"
            {...draggable.listeners}
            {...draggable.attributes}
          >
            <span>{player.name}</span>
            <span className="badge">S{player.strength}</span>
          </div>
          <div className="slot-meta">
            <span>{totalMinutes} min</span>
            <span>{formatClock(currentStint)}</span>
            {(stats?.totalSeconds || 0) < MINIMUM_SECONDS && <span className="badge need-badge">Needs minutes</span>}
          </div>
          {stagedPlayer && (
            <div className="staged-inline">
              <div>
                <span className="badge recommended">Staged</span>
                <strong>{stagedPlayer.name} {'->'} {player.name}</strong>
              </div>
              <button onClick={() => onCancelStage(slot.id)}>Remove</button>
            </div>
          )}
        </div>
      ) : (
        <div className="empty-slot-target">
          <span>Drop player here</span>
          {stagedPlayer && (
            <span className="badge recommended">Staged: {stagedPlayer.name}</span>
          )}
        </div>
      )}
    </article>
  );
}
