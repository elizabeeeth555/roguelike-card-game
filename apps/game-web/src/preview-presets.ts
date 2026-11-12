import type { BattleViewModel, CharacterViewModel, SkillViewModel } from './battle-view-model';
// Fixed illustrative data only: no game definitions or legality calculation.
const skills: SkillViewModel[] = [
  { id: 'preview-slash', name: '斬撃', cost: 1, cd: 0, description: 'プレビュー用：敵に2ダメージ', condition: '表示確認用の仮条件', allowed: false, reason: 'プレビューは閲覧専用', remaining: 0, used: false, stateLabel: '' },
  { id: 'preview-barrier', name: '結界', cost: 1, cd: 1, description: 'プレビュー用：バリアを展開', condition: '表示確認用の仮条件', allowed: false, reason: 'プレビューは閲覧専用', remaining: 0, used: false, stateLabel: '' }
];
export type PreviewPreset = 'normal' | 'special';
export function createPreviewModel(preset: PreviewPreset): BattleViewModel {
  const character = (name: string): CharacterViewModel => ({ name, hp: 20, maxHp: 20, mana: 2, manaCap: 3,
    barrier: 0, poison: 0, weak: 0, attackBonus: 0, setupBonus: 0, manaPenalty: 0, accelerationPending: false,
    skills: skills.map(skill => ({ ...skill })), emptySlots: 3 });
  const player = { ...character('夜刃の剣士'), face: './scene/face.png' };
  const boss = { ...character('蒼鋼の守護騎士'), portrait: './scene/boss.png', emptySlots: 0,
    skills: Array.from({ length: 5 }, (_, i) => ({ ...skills[i % 2], id: `preview-enemy-${i}`, name: `敵スキル${i + 1}` })) };
  if (preset === 'special') {
    Object.assign(player, { hp: 9, mana: 0, barrier: 4, poison: 2, weak: 1, attackBonus: 3, setupBonus: 2, manaPenalty: 1, accelerationPending: true, emptySlots: 0 });
    player.skills = [
      { ...skills[0], stateLabel: 'MP不足' },
      { ...skills[1], stateLabel: 'CD中（残1T）', remaining: 1 },
      { ...skills[0], id: 'preview-used', name: '使用済の例', stateLabel: '使用済', used: true },
      { ...skills[1], id: 'preview-condition', name: '条件未達の例', stateLabel: '条件未達' },
      { ...skills[0], id: 'preview-idle', name: '待機の例' }
    ];
  }
  return { player, boss, background: './scene/background.webp', round: preset === 'normal' ? 1 : 4, turn: 'YOUR TURN', result: null,
    message: '開発用固定仮データ（戦闘としての整合性は保証しません）。閲覧のみ・戦闘は進行しません。',
    controls: { accelerate: { allowed: false, reason: '開発用プレビュー', label: '♦ マナ加速' }, endTurn: false, reset: false } };
}
