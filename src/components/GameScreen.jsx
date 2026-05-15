import { DndContext, DragOverlay, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useMemo, useState } from 'react';
import Bench from './Bench.jsx';
import FormationBoard from './FormationBoard.jsx';
import GameClock from './GameClock.jsx';
import PlayerCard from './PlayerCard.jsx';
import StagingArea from './StagingArea.jsx';
import { assignPlayer, closeActiveStints, pauseClock, removePlayer, setClock } from '../utils/gameState.js';
import { getGameMetrics } from '../utils/recommendations.js';

export default function GameScreen({ roster, allPlayers, game, setGame, onFinish, onResume, onClearGame }) {
  const [activePlayerId, setActivePlayerId] = useState(null);
  const playersById = useMemo(() => Object.fromEntries(allPlayers.map((player) => [player.id, player])), [allPlayers]);
  const metrics = useMemo(() => getGameMetrics(allPlayers, game), [allPlayers, game]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } })
  );

  function handleDragEnd(event) {
    const { playerId, source } = parsePlayerDragId(event.active.id);
    const overId = String(event.over?.id || '');
    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    setActivePlayerId(null);
    if (!playerId) return;
    if (!overId) return;
    if (overId === 'bench') {
      if (source === 'field') {
        setGame((current) => removeStagedPlayer(removePlayer(current, playerId), playerId));
        restoreScrollPosition(scrollPosition);
      }
    }
    if (overId.startsWith('slot:')) {
      const slotId = overId.replace('slot:', '');
      setGame((current) => stageSub(current, slotId, playerId));
      restoreScrollPosition(scrollPosition);
      focusSlot(slotId);
    }
  }

  function applyStagedSubs() {
    const firstSlotId = Object.keys(game.stagedSubs || {})[0];
    setGame((current) => {
      const stagedEntries = Object.entries(current.stagedSubs || {});
      const next = stagedEntries.reduce((working, [slotId, playerId]) => assignPlayer(working, playerId, slotId), current);
      return { ...next, stagedSubs: {} };
    });
    if (firstSlotId) focusSlot(firstSlotId);
  }

  function clearStagedSubs() {
    setGame((current) => ({ ...current, stagedSubs: {} }));
  }

  function removeStagedSlot(slotId) {
    setGame((current) => clearSlotStage(current, slotId));
  }

  function resetGameClock() {
    if (!window.confirm('Reset the game clock to 00:00? Player totals and stints stay saved.')) return;
    setGame((current) => setClock({ ...current, running: false }, 0));
  }

  function finishGame() {
    setGame((current) => closeActiveStints(pauseClock(current)));
    onFinish();
  }

  return (
    <main className="screen game-screen">
      <GameClock
        game={game}
        playersById={playersById}
        setGame={setGame}
        onFinish={finishGame}
        onResetClock={resetGameClock}
        onResume={onResume}
        onClearGame={onClearGame}
      />
      {!metrics.mathematicallyPossible && <p className="warning">It is not mathematically possible for everyone to play 30 minutes.</p>}
      <DndContext
        sensors={sensors}
        autoScroll={false}
        onDragStart={(event) => setActivePlayerId(parsePlayerDragId(event.active.id).playerId)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActivePlayerId(null)}
      >
        <div className="game-layout">
          <FormationBoard playersById={playersById} game={game} onCancelStage={removeStagedSlot} />
          <aside className="side-panel">
            <StagingArea
              game={game}
              playersById={playersById}
              onApply={applyStagedSubs}
              onClear={clearStagedSubs}
              onRemove={removeStagedSlot}
            />
            <Bench players={roster} game={game} />
          </aside>
        </div>
        <DragOverlay>
          {activePlayerId && playersById[activePlayerId] && (
            <PlayerCard
              player={playersById[activePlayerId]}
              stats={game.playerStats[activePlayerId]}
              status={Object.values(game.assignments).includes(activePlayerId) ? 'field' : 'bench'}
              staged={Object.values(game.stagedSubs || {}).includes(activePlayerId)}
              dragDisabled
              overlay
            />
          )}
        </DragOverlay>
      </DndContext>
    </main>
  );
}

function stageSub(game, slotId, playerId) {
  if (game.assignments[slotId] === playerId) {
    return clearSlotStage(game, slotId);
  }
  const stagedSubs = Object.fromEntries(
    Object.entries(game.stagedSubs || {}).filter(([, stagedPlayerId]) => stagedPlayerId !== playerId)
  );
  stagedSubs[slotId] = playerId;
  return { ...game, stagedSubs };
}

function clearSlotStage(game, slotId) {
  const stagedSubs = { ...(game.stagedSubs || {}) };
  delete stagedSubs[slotId];
  return { ...game, stagedSubs };
}

function removeStagedPlayer(game, playerId) {
  const stagedSubs = Object.fromEntries(
    Object.entries(game.stagedSubs || {}).filter(([, stagedPlayerId]) => stagedPlayerId !== playerId)
  );
  return { ...game, stagedSubs };
}

function focusSlot(slotId) {
  window.requestAnimationFrame(() => {
    const slot = document.querySelector(`[data-slot-id="${slotId}"]`);
    slot?.focus({ preventScroll: true });
  });
}

function restoreScrollPosition(position) {
  window.requestAnimationFrame(() => {
    window.scrollTo(position.x, position.y);
  });
}

function parsePlayerDragId(activeId) {
  const [kind, playerId, source = 'list'] = String(activeId).split(':');
  return kind === 'player' ? { playerId, source } : { playerId: null, source: null };
}
