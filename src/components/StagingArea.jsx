import { SLOTS } from '../utils/gameState.js';

export default function StagingArea({ game, playersById, onApply, onClear, onRemove }) {
  const stagedEntries = Object.entries(game.stagedSubs || {}).filter(([, playerId]) => playersById[playerId]);

  return (
    <section className="staging-panel">
      <div className="section-head compact-head">
        <h2>Staged Subs</h2>
        <span className="badge recommended">{stagedEntries.length} queued</span>
      </div>
      {stagedEntries.length === 0 ? (
        <p className="muted">Drop bench players on positions.</p>
      ) : (
        <div className="staged-list">
          {stagedEntries.map(([slotId, inPlayerId]) => {
            const slot = SLOTS.find((item) => item.id === slotId);
            const inPlayer = playersById[inPlayerId];
            const outPlayer = playersById[game.assignments[slotId]];
            return (
              <article className="staged-row" key={slotId}>
                <div>
                  <strong>{slot?.label || slotId}: {inPlayer.name} {'->'} {outPlayer?.name || 'empty slot'}</strong>
                </div>
                <button onClick={() => onRemove(slotId)}>Remove</button>
              </article>
            );
          })}
        </div>
      )}
      <div className="button-row staging-actions">
        <button className="primary" disabled={stagedEntries.length === 0} onClick={onApply}>Apply All</button>
        <button disabled={stagedEntries.length === 0} onClick={onClear}>Clear</button>
      </div>
    </section>
  );
}
