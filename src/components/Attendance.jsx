import { useMemo, useState } from 'react';

export default function Attendance({ roster, game, onSaveAttendance }) {
  const [selected, setSelected] = useState(() => new Set(game?.attendanceIds || roster.map((player) => player.id)));
  const presentCount = selected.size;
  const requiredMinutes = presentCount * 30;
  const availableMinutes = 11 * 60;
  const possible = requiredMinutes <= availableMinutes;

  const sortedRoster = useMemo(() => [...roster].sort((a, b) => a.name.localeCompare(b.name)), [roster]);

  function toggle(id) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  }

  return (
    <main className="screen">
      <section className="notice">
        {game
          ? 'Update attendance during the game for late arrivals. Existing minutes stay saved.'
          : 'Mark attending players before kickoff. Attendance is saved with the current game in this browser.'}
      </section>
      <div className="metrics-grid">
        <Metric label="Present" value={presentCount} />
        <Metric label="Field spots" value="11" />
        <Metric label="Available player-minutes" value={availableMinutes} />
        <Metric label="Required player-minutes" value={requiredMinutes} />
      </div>
      {presentCount < 11 && <p className="warning">Warning: fewer than 11 players are selected.</p>}
      {presentCount > 22 && <p className="warning">Warning: more than 22 players are selected.</p>}
      {!possible && <p className="warning">It is not mathematically possible for everyone to play 30 minutes.</p>}
      {possible && <p className="good">Everyone can mathematically reach 30 minutes.</p>}

      <section className="attendance-list">
        {sortedRoster.map((player) => (
          <label className="attendance-row" key={player.id}>
            <input type="checkbox" checked={selected.has(player.id)} onChange={() => toggle(player.id)} />
            <span>{player.name}</span>
            <span className="badge">S{player.strength}</span>
            <span className="muted">{player.desiredPositions.join(', ')}</span>
          </label>
        ))}
      </section>
      <button className="primary action-wide" disabled={presentCount === 0} onClick={() => onSaveAttendance([...selected])}>
        {game ? `Update Active Game With ${presentCount} Players` : `Start Game With ${presentCount} Players`}
      </button>
    </main>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
