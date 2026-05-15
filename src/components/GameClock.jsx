import { HALF_SECONDS, formatClock, secondsFromMinuteInput } from '../utils/time.js';
import { pauseClock, setClock, startClock } from '../utils/gameState.js';

export default function GameClock({ game, playersById, setGame, onFinish, onResetClock, onResume, onClearGame }) {
  const half = game.elapsedSeconds < HALF_SECONDS ? 'First half' : 'Second half';
  const fieldStrength = Object.values(game.assignments || {}).reduce(
    (sum, playerId) => sum + (playersById[playerId]?.strength || 0),
    0
  );

  return (
    <section className="clock-panel">
      <div>
        <span className="badge">{half}</span>
        <div className="clock-line">
          <h2>{formatClock(game.elapsedSeconds)}</h2>
          <span className="strength-total">S{fieldStrength}</span>
        </div>
      </div>
      <div className="button-row">
        {!game.running && <button className="primary" onClick={() => setGame((current) => startClock(current))}>Start / Resume</button>}
        {game.running && <button onClick={() => setGame((current) => pauseClock(current))}>Pause</button>}
        <button onClick={() => setGame((current) => pauseClock(setClock(current, HALF_SECONDS, true)))}>Halftime</button>
        <button onClick={onFinish}>Summary</button>
      </div>
      <details className="settings-menu">
        <summary>Settings</summary>
        <div className="settings-content">
          <div className="settings-saved-game">
            <strong>Active game saved in this browser.</strong>
            <div className="button-row">
              <button onClick={onResume}>Resume</button>
              <button className="danger" onClick={onClearGame}>Clear Game</button>
            </div>
          </div>
          <label className="clock-adjust">
            Set clock minute
            <input
              type="number"
              min="0"
              max="60"
              step="0.5"
              value={Math.round((game.elapsedSeconds / 60) * 10) / 10}
              onChange={(event) => setGame((current) => setClock(current, secondsFromMinuteInput(event.target.value), true))}
            />
          </label>
          <button className="danger" onClick={onResetClock}>Reset Clock</button>
        </div>
      </details>
    </section>
  );
}
