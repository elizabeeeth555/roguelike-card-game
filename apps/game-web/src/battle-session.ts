import type { Action, BattleAdapter, BattleState } from './battle-adapter';
// Revision-bound host commands prevent stale/double events, including after reset.
export function createBattleSession(adapter: BattleAdapter) {
  let state: BattleState = adapter.create();
  let revision = 0;
  let message = 'スキルを選択して詳細を確認してください。';
  const view = () => ({ state, revision, message });
  return {
    view,
    dispatch(action: Action, expectedRevision: number) {
      if (expectedRevision !== revision) return view();
      const result = adapter.act(state, action);
      if (result.state !== state) revision++;
      state = result.state; message = result.message;
      return view();
    },
    reset() { state = adapter.create(); revision++; message = '再戦を開始しました。'; return view(); }
  };
}
