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
                  <strong>{shortSlotLabel(slot)}: {inPlayer.name} {'->'} {outPlayer?.name || 'empty slot'}</strong>
                </div>
                <button aria-label={`Remove staged sub for ${slot?.label || slotId}`} title="Remove" onClick={() => onRemove(slotId)}>R</button>
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

function shortSlotLabel(slot) {
  if (!slot) return '';
  if (slot.position === 'Goalie') return 'G';
  if (slot.position === 'Sweeper') return 'SW';
  const number = slot.label.match(/\d+/)?.[0] || '';
  if (slot.position === 'Defense') return `D${number}`;
  if (slot.position === 'Midfield') return `M${number}`;
  if (slot.position === 'Forward') return `F${number}`;
  return slot.label.slice(0, 2).toUpperCase();
}
