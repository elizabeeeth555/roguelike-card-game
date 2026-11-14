export interface Box { left: number; top: number; width: number; height: number; right: number; bottom: number }
export function detailPosition(anchor: Box, width: number, height: number, viewport: { width: number; height: number }, placement: 'above' | 'below' | 'left' | 'right') {
 const left = placement === 'left' ? anchor.left - width - 8 : placement === 'right' ? anchor.right + 8 : anchor.left + (anchor.width - width) / 2;
 const top = placement === 'above' ? anchor.top - height - 8 : placement === 'below' ? anchor.bottom + 8 : anchor.top + (anchor.height - height) / 2;
 return { left: Math.max(8, Math.min(viewport.width - width - 8, left)), top: Math.max(8, Math.min(viewport.height - height - 8, top)) };
}
export function detailOrigin(anchor: Box, card: Box) {
 const scale = Math.min(anchor.width / card.width, anchor.height / card.height);
 return { x: anchor.left + anchor.width / 2 - card.width * scale / 2 - card.left, y: anchor.top + anchor.height / 2 - card.height * scale / 2 - card.top, scaleX: scale, scaleY: scale };
}
