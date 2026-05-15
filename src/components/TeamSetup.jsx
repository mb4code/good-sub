import { useMemo, useState } from 'react';
import { POSITIONS } from '../utils/gameState.js';

export default function TeamSetup({ roster, setRoster, bundledRoster }) {
  const [jsonText, setJsonText] = useState(() => JSON.stringify(toVisibleRoster(roster), null, 2));
  const [message, setMessage] = useState('');

  function updateRoster(next) {
    setRoster(next);
    setJsonText(JSON.stringify(toVisibleRoster(next), null, 2));
  }

  function addPlayer() {
    updateRoster([
      ...roster,
      { id: `p-${Date.now()}`, name: 'New Player', strength: 3, desiredPositions: ['Midfield'] }
    ]);
  }

  function patchPlayer(id, patch) {
    updateRoster(roster.map((player) => (player.id === id ? { ...player, ...patch } : player)));
  }

  function togglePosition(player, position) {
    const desiredPositions = player.desiredPositions.includes(position)
      ? player.desiredPositions.filter((item) => item !== position)
      : [...player.desiredPositions, position];
    patchPlayer(player.id, { desiredPositions });
  }

  function saveJson() {
    try {
      const parsed = JSON.parse(jsonText);
      validateRoster(parsed);
      setRoster(toInternalRoster(parsed));
      setMessage('Roster saved to this browser.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function exportJson() {
    download('soccer-roster.json', JSON.stringify(toVisibleRoster(roster), null, 2), 'application/json');
  }

  function importJson(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      setJsonText(text);
      try {
        const parsed = JSON.parse(text);
        validateRoster(parsed);
        updateRoster(toInternalRoster(parsed));
        setMessage('Roster imported and saved.');
      } catch (error) {
        setMessage(error.message);
      }
    });
  }

  function resetToBundledRoster() {
    if (!window.confirm('Replace this browser roster with the bundled src/data/teamRoster.json roster?')) return;
    updateRoster(toInternalRoster(bundledRoster));
    setMessage('Bundled roster loaded into this browser.');
  }

  const duplicateIds = useMemo(() => {
    const seen = new Set();
    return roster.filter((player) => seen.size === seen.add(player.id).size).map((player) => player.id);
  }, [roster]);

  return (
    <main className="screen">
      <section className="notice">
        The source roster for deployment is <strong>src/data/teamRoster.json</strong>. Saving here writes only to this browser's localStorage; it does not edit the deployed app or any cloud file.
      </section>

      <div className="setup-grid">
        <section>
          <div className="section-head">
            <h2>Team Setup</h2>
            <button onClick={addPlayer}>Add Player</button>
          </div>
          <div className="player-editor-list">
            {roster.map((player) => (
              <article className="editor-row" key={player.id}>
                <input value={player.name} onChange={(event) => patchPlayer(player.id, { name: event.target.value })} />
                <select value={player.strength} onChange={(event) => patchPlayer(player.id, { strength: Number(event.target.value) })}>
                  {[1, 2, 3, 4, 5].map((score) => <option key={score} value={score}>S{score}</option>)}
                </select>
                <div className="chips">
                  {POSITIONS.map((position) => (
                    <label className={`chip ${player.desiredPositions.includes(position) ? 'selected' : ''}`} key={position}>
                      <input type="checkbox" checked={player.desiredPositions.includes(position)} onChange={() => togglePosition(player, position)} />
                      {position}
                    </label>
                  ))}
                </div>
                <button className="danger" onClick={() => updateRoster(roster.filter((item) => item.id !== player.id))}>Delete</button>
              </article>
            ))}
          </div>
          {duplicateIds.length > 0 && <p className="warning">Duplicate IDs found: {duplicateIds.join(', ')}</p>}
        </section>

        <section>
          <div className="section-head">
            <h2>Roster JSON</h2>
            <div className="button-row">
              <button onClick={saveJson}>Validate & Save</button>
              <button onClick={resetToBundledRoster}>Load Bundled</button>
              <button onClick={exportJson}>Export</button>
              <label className="button-like">
                Import
                <input type="file" accept="application/json" onChange={importJson} />
              </label>
            </div>
          </div>
          <textarea className="json-editor" value={jsonText} onChange={(event) => setJsonText(event.target.value)} />
          {message && <p className="status-line">{message}</p>}
        </section>
      </div>
    </main>
  );
}

function validateRoster(value) {
  if (!Array.isArray(value)) throw new Error('Roster must be an array.');
  const ids = new Set();
  value.forEach((player, index) => {
    if (!player.id || !player.name) throw new Error(`Player ${index + 1} needs id and name.`);
    if (ids.has(player.id)) throw new Error(`Duplicate player id: ${player.id}`);
    ids.add(player.id);
    const strength = getStrengthValue(player);
    if (!Number.isFinite(strength) || strength < 1 || strength > 5) throw new Error(`${player.name} S Type must be S1 to S5.`);
    if (!Array.isArray(player.desiredPositions) || player.desiredPositions.length === 0) throw new Error(`${player.name} needs at least one position.`);
  });
}

function toVisibleRoster(players) {
  return players.map(({ strength, rating, sType, ...player }) => ({
    ...player,
    sType: sType || rating || `S${strength}`,
    desiredPositions: player.desiredPositions
  }));
}

function toInternalRoster(players) {
  return players.map(({ rating, sType, strength, ...player }) => ({
    ...player,
    strength: getStrengthValue({ rating, sType, strength }),
    desiredPositions: player.desiredPositions
  }));
}

function getStrengthValue(player) {
  if (Number.isFinite(player.strength)) return player.strength;
  if (typeof player.sType === 'string' && /^S[1-5]$/.test(player.sType)) return Number(player.sType.slice(1));
  if (typeof player.rating === 'string' && /^S[1-5]$/.test(player.rating)) return Number(player.rating.slice(1));
  return NaN;
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
