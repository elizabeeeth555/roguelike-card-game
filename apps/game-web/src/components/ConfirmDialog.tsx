import { useEffect, useRef } from 'react';
export function ConfirmDialog({ mana, onConfirm, onCancel }: { mana: number; onConfirm: () => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} aria-label="ターン終了の確認" onCancel={event => { event.preventDefault(); onCancel(); }}><h2>ターンを終了しますか？</h2><p>残りMP {mana}。使用可能な行動が残っています。</p><div className="dialog-actions"><button autoFocus onClick={onCancel}>戻る</button><button onClick={onConfirm}>終了する</button></div></dialog>;
}
