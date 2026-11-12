import { useEffect, useRef, useState } from 'react';
import type { Action, BattleAdapter, Side } from './battle-adapter';
import { createBattleSession } from './battle-session';
import { BattleView } from './BattleView';
import { toBattleViewModel } from './battle-presentation';
import type { BattleDesign } from './battle-design';

export function BattleScreen({ adapter, design }: { adapter: BattleAdapter; design?: BattleDesign }) {
  const [session] = useState(() => createBattleSession(adapter));
  const [view, setView] = useState(session.view);
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const inFlight = useRef(false);
  const { state, revision } = view;
  function act(action: Action) {
    if (inFlight.current) return;
    inFlight.current = true;
    try { setView(session.dispatch(action, revision)); setSelected(null); setConfirmEnd(false); }
    finally { inFlight.current = false; }
  }
  function endTurn() {
    if (adapter.hasRemainingActions(state)) setConfirmEnd(true);
    else act({ type: 'endTurn', side: 'player' });
  }
  function reset() { setView(session.reset()); setSelected(null); setConfirmEnd(false); }
  useEffect(() => {
    function key(event: KeyboardEvent) {
      if (event.key === 'Escape') return;
      if (document.querySelector('dialog[open]') || (event.target instanceof HTMLElement && event.target.closest('button,input,textarea,select'))) return;
      const index = Number(event.key) - 1;
      if (index >= 0 && index < state.actors.player.deck.length) { setSelected({ side: 'player', id: state.actors.player.deck[index] }); event.preventDefault(); }
      if (event.code === 'Space' && !state.end) { endTurn(); event.preventDefault(); }
    }
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  });
  const model = toBattleViewModel(adapter, state, view.message);
  return <BattleView model={model} design={design} selected={selected} confirmEnd={confirmEnd}
    onSelect={setSelected} onClose={() => setSelected(null)}
    onUse={() => { if (selected?.side === 'player') act({ type: 'card', side: 'player', id: selected.id }); }}
    onAccelerate={() => act({ type: 'accelerate', side: 'player' })} onEndTurn={endTurn} onReset={reset}
    onCancelEnd={() => setConfirmEnd(false)} onConfirmEnd={() => act({ type: 'endTurn', side: 'player' })} />;
}
