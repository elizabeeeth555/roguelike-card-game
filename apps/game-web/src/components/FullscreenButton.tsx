import { useEffect, useState } from 'react';
export function FullscreenButton() {
 const [active, setActive] = useState(false), [error, setError] = useState('');
 const supported = !!document.fullscreenEnabled && typeof document.documentElement.requestFullscreen === 'function';
 useEffect(() => { const sync = () => setActive(!!document.fullscreenElement); sync(); document.addEventListener('fullscreenchange', sync); return () => document.removeEventListener('fullscreenchange', sync); }, []);
 async function toggle() { try { setError(''); if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { setError('全画面表示へ切り替えられませんでした'); } }
 return <><button type="button" className="fullscreen-button" disabled={!supported} aria-pressed={active} aria-label={active ? '全画面表示を終了' : '全画面表示'} title={supported ? error : 'この環境は全画面表示に対応していません'} onClick={() => void toggle()}>{active ? '全画面解除' : '全画面'}</button>{error && <span role="status">{error}</span>}</>;
}
