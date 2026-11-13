export interface ChainRect { left: number; top: number; width: number; height: number }
// Coordinates are measured in the same viewport, then localized to the shared field.
export function chainSegment(root: ChainRect, panel: ChainRect, boss: ChainRect, index: number) {
 const bossX = boss.left + boss.width / 2;
 const x1 = (panel.left + panel.width / 2 < bossX ? panel.left + panel.width : panel.left) - root.left;
 const y1 = panel.top + panel.height / 2 - root.top;
 const x2 = bossX - root.left, y2 = boss.top + boss.height * (.45 + index * .035) - root.top;
 return { x1, y1, x2, y2 };
}
