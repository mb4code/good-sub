import { useEffect, useMemo, useState } from 'react';
import bundledRoster from './data/teamRoster.json';
import TeamSetup from './components/TeamSetup.jsx';
import Attendance from './components/Attendance.jsx';
import GameScreen from './components/GameScreen.jsx';
import GameSummary from './components/GameSummary.jsx';
import { clearGame, loadGame, loadRoster, saveGame, saveRoster } from './utils/storage.js';
import { createNewGame, tickGame, updateGameAttendance } from './utils/gameState.js';

const screens = ['team', 'attendance', 'game', 'summary'];

export default function App() {
  const initialGame = loadGame();
  const [roster, setRoster] = useState(() => loadRoster(bundledRoster));
  const [game, setGame] = useState(() => initialGame);
  const [screen, setScreen] = useState(() => (initialGame ? 'game' : 'team'));

  useEffect(() => saveRoster(roster), [roster]);
  useEffect(() => {
    if (game) saveGame(game);
  }, [game]);

  useEffect(() => {
    if (!game?.running) return undefined;
    const timer = window.setInterval(() => {
      setGame((current) => (current?.running ? tickGame(current) : current));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [game?.running]);

  const activePlayers = useMemo(
    () => roster.filter((player) => !game || game.attendanceIds.includes(player.id)),
    [roster, game]
  );

  function startGame(attendanceIds) {
    const next = createNewGame(roster, attendanceIds);
    setGame(next);
    setScreen('game');
  }

  function saveAttendance(attendanceIds) {
    if (!game) {
      startGame(attendanceIds);
      return;
    }
    setGame((current) => updateGameAttendance(current, roster, attendanceIds));
    setScreen('game');
  }

  function clearCurrentGame() {
    if (!window.confirm('Clear the current game from this browser? Export a summary first if you need a backup.')) return;
    clearGame();
    setGame(null);
    setScreen('attendance');
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <h1>U13 Soccer Subs</h1>
        </div>
        <nav>
          {screens.map((item) => (
            <button
              key={item}
              className={screen === item ? 'active' : ''}
              onClick={() => setScreen(item)}
              disabled={(item === 'game' || item === 'summary') && !game}
            >
              {item}
            </button>
          ))}
        </nav>
      </header>

      {screen === 'team' && <TeamSetup roster={roster} setRoster={setRoster} bundledRoster={bundledRoster} />}
      {screen === 'attendance' && <Attendance roster={roster} game={game} onSaveAttendance={saveAttendance} />}
      {screen === 'game' && game && (
        <GameScreen
          roster={activePlayers}
          allPlayers={roster}
          game={game}
          setGame={setGame}
          onFinish={() => setScreen('summary')}
          onResume={() => setScreen('game')}
          onClearGame={clearCurrentGame}
        />
      )}
      {screen === 'summary' && game && <GameSummary roster={roster} game={game} />}
    </div>
  );
}
