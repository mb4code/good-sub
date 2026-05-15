import { formatClock, formatMinutes, MINIMUM_SECONDS } from '../utils/time.js';

export default function GameSummary({ roster, game }) {
  const rows = roster.map((player) => {
    const stats = game.playerStats[player.id] || { totalSeconds: 0, stints: [], positions: [] };
    return {
      player,
      present: game.attendanceIds.includes(player.id),
      stats
    };
  });

  function exportJson() {
    download('game-summary.json', JSON.stringify({ game, players: rows }, null, 2), 'application/json');
  }

  function exportCsv() {
    const header = ['Name', 'Present', 'Total Minutes', 'Reached 30', 'Positions', 'Stints'];
    const body = rows.map(({ player, present, stats }) => [
      player.name,
      present ? 'yes' : 'no',
      Math.round(stats.totalSeconds / 60),
      stats.totalSeconds >= MINIMUM_SECONDS ? 'yes' : 'no',
      stats.positions.join('|'),
      stats.stints.length
    ]);
    download('game-summary.csv', [header, ...body].map((row) => row.map(csvEscape).join(',')).join('\n'), 'text/csv');
  }

  return (
    <main className="screen">
      <div className="section-head">
        <h2>Game Summary</h2>
        <div className="button-row">
          <button onClick={exportJson}>Export JSON</button>
          <button onClick={exportCsv}>Export CSV</button>
        </div>
      </div>
      <div className="summary-list">
        {rows.map(({ player, present, stats }) => (
          <article className="summary-card" key={player.id}>
            <div className="summary-head">
              <strong>{player.name}</strong>
              <span className={`badge ${present ? 'field-badge' : 'bench-badge'}`}>{present ? 'Present' : 'Absent'}</span>
              <span className={`badge ${stats.totalSeconds >= MINIMUM_SECONDS ? 'good-badge' : 'need-badge'}`}>
                {stats.totalSeconds >= MINIMUM_SECONDS ? 'Reached 30' : 'Under 30'}
              </span>
            </div>
            <p>{formatMinutes(stats.totalSeconds)} played. Positions: {stats.positions.join(', ') || 'None'}. Stints: {stats.stints.length}.</p>
            {stats.stints.length > 0 && (
              <div className="stint-list">
                {stats.stints.map((stint, index) => (
                  <span key={`${player.id}-${index}`}>
                    {stint.position}: {formatClock(stint.startGameTime)}-{formatClock(stint.endGameTime)} ({formatMinutes(stint.duration)})
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}

function csvEscape(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function download(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
