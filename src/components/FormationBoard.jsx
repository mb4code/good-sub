import PositionSlot from './PositionSlot.jsx';
import { SLOTS } from '../utils/gameState.js';

export default function FormationBoard({ playersById, game, onCancelStage }) {
  return (
    <section className="positions-panel">
      <div className="section-head compact-head">
        <h2>On Field</h2>
        <span className="badge field-badge">11 positions</span>
      </div>
      {['Goalie', 'Sweeper', 'Defense', 'Midfield', 'Forward'].map((group) => (
        <div className="position-group" key={group}>
          <h3>{group}</h3>
          <div className="position-list">
            {SLOTS.filter((slot) => slot.position === group).map((slot) => {
              const player = playersById[game.assignments[slot.id]];
              const stagedPlayer = playersById[game.stagedSubs?.[slot.id]];
              const stats = player ? { ...game.playerStats[player.id], liveElapsed: game.elapsedSeconds } : null;
              return (
                <PositionSlot
                  key={slot.id}
                  slot={slot}
                  player={player}
                  stats={stats}
                  stagedPlayer={stagedPlayer}
                  onCancelStage={onCancelStage}
                />
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}
